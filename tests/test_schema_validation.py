from __future__ import annotations

import json
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator, ValidationError

from packages.shared.schemas.validators import validate_workflow_structure, workflow_validator

SCHEMA_ROOT = Path(__file__).resolve().parents[1] / "packages" / "shared" / "schemas"
NODES_ROOT = SCHEMA_ROOT / "nodes"


@pytest.fixture(scope="session")
def node_valid_samples():
    return {
        "manual_trigger": {"payload": {}},
        "webhook_trigger": {
            "test_url": "https://example.com/test",
            "prod_url": "https://example.com/prod",
            "secret": "abcdefgh",
            "idempotency_key": "abcd",
        },
        "schedule_trigger": {"cron": "*/5 * * * *", "timezone": "UTC"},
        "gmail_trigger_stub": {"simulate_interval_seconds": 30, "sample_payload": {"subject": "Hi"}},
        "outlook_trigger_stub": {"simulate_interval_seconds": 30, "folder": "Inbox"},
        "whatsapp_trigger_stub": {"simulate_interval_seconds": 15, "phone_number": "+12345678901"},
        "telegram_trigger_stub": {"simulate_interval_seconds": 15, "bot_name": "bot"},
        "send_gmail_stub": {"to": "a@example.com", "subject": "hi", "body": "body"},
        "send_outlook_stub": {"to": "a@example.com", "subject": "hi", "body": "body"},
        "send_whatsapp_stub": {"to": "+12345678901", "message": "hello"},
        "send_telegram_stub": {"chat_id": "123", "message": "hello", "parse_mode": "text"},
        "reply_router": {"thread_key": "thread-1", "dedupe_window_seconds": 0, "idempotency_key": "abcd"},
        "llm_call": {
            "provider": "openai",
            "model": "gpt-4",
            "prompt": "Hello",
            "temperature": 0.5,
            "max_tokens": 64,
            "response_format": "text",
        },
        "ai_agent": {"instructions": "Be helpful", "tools": [], "max_turns": 2},
        "memory_write": {"key": "user:1", "value": "notes"},
        "memory_read": {"query": "user:1", "semantic": False},
        "prompt_template": {"template": "Hello {{name}}", "variables": ["name"]},
        "if": {"expression": "payload.ok", "true_label": "yes", "false_label": "no"},
        "switch": {"expression": "payload.kind", "cases": [{"label": "A", "match": "a"}]},
        "merge": {"mode": "wait_all"},
        "loop_foreach": {"items_path": "items", "max_iterations": 10, "parallel": False},
        "wait": {"duration_seconds": 60},
        "human_approval": {"approvers": ["approver@example.com"], "message": "Approve?"},
        "http_request": {"method": "GET", "url": "https://example.com", "headers": {}},
        "transform_js": {"code": "return payload;"},
        "set_fields": {"operations": [{"op": "set", "path": "foo", "value": 1}]},
        "error_handler": {"strategy": "retry", "max_attempts": 1},
    }


def load_schema(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def test_all_node_schemas_compile():
    for schema_file in NODES_ROOT.glob("*.json"):
        schema = load_schema(schema_file)
        Draft202012Validator.check_schema(schema)


def test_node_valid_and_invalid_payloads(node_valid_samples):
    for schema_file in NODES_ROOT.glob("*.node.schema.json"):
        schema = load_schema(schema_file)
        node_type = schema_file.name.replace(".node.schema.json", "")
        validator = Draft202012Validator(schema)
        valid_payload = node_valid_samples[node_type]
        validator.validate(valid_payload)

        # invalid: drop the first required field
        required = schema.get("required", [])
        if required:
            bad = dict(valid_payload)
            bad.pop(required[0], None)
            with pytest.raises(ValidationError):
                validator.validate(bad)


def test_workflow_schema_and_structure(node_valid_samples):
    workflow = {
        "workflow_id": "00000000-0000-0000-0000-000000000000",
        "version": 1,
        "status": "draft",
        "name": "Test Workflow",
        "nodes": [
            {
                "id": "n1",
                "type": "manual_trigger",
                "category": "trigger",
                "name": "Manual",
                "config": node_valid_samples["manual_trigger"],
                "position": {"x": 0, "y": 0},
            },
            {
                "id": "n2",
                "type": "llm_call",
                "category": "ai",
                "name": "LLM",
                "config": node_valid_samples["llm_call"],
                "position": {"x": 100, "y": 100},
            },
        ],
        "edges": [
            {"id": "e1", "source": "n1", "target": "n2"},
        ],
        "triggers": [
            {"type": "manual_trigger", "node_id": "n1", "config": {"payload": {}}}
        ],
        "metadata": {"created_by": "00000000-0000-0000-0000-000000000001", "created_at": "2024-01-01T00:00:00Z"},
    }

    validator = workflow_validator()
    validator.validate(workflow)
    assert validate_workflow_structure(workflow) == []

    # invalid: missing trigger node, dangling edge
    workflow_bad = {
        **workflow,
        "nodes": [
            {"id": "n2", "type": "llm_call", "category": "ai", "name": "LLM", "config": node_valid_samples["llm_call"], "position": {"x": 1, "y": 1}}
        ],
        "edges": [{"id": "e1", "source": "n1", "target": "n2"}],
    }
    validator.validate(workflow_bad)
    errors = validate_workflow_structure(workflow_bad)
    assert "missing trigger node" in errors
    assert "edge source missing node: n1" in errors
