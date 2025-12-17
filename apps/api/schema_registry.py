from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List

ROOT = Path(__file__).resolve().parents[2] / "packages" / "shared" / "schemas" / "nodes"


@dataclass
class NodeMetadata:
    type: str
    name: str
    category: str
    description: str
    inputs: List[str]
    outputs: List[str]


NODE_METADATA: Dict[str, NodeMetadata] = {
    "manual_trigger": NodeMetadata(
        type="manual_trigger",
        name="Manual Trigger",
        category="trigger",
        description="Start a workflow with a user-supplied payload.",
        inputs=[],
        outputs=["payload"],
    ),
    "webhook_trigger": NodeMetadata(
        type="webhook_trigger",
        name="Webhook Trigger",
        category="trigger",
        description="Start runs from inbound HTTP events with idempotency support.",
        inputs=[],
        outputs=["payload"],
    ),
    "schedule_trigger": NodeMetadata(
        type="schedule_trigger",
        name="Schedule Trigger",
        category="trigger",
        description="Cron-like schedule that enqueues runs at a fixed cadence.",
        inputs=[],
        outputs=["payload"],
    ),
    "gmail_trigger_stub": NodeMetadata(
        type="gmail_trigger_stub",
        name="Gmail Trigger (Simulated)",
        category="trigger",
        description="Simulated Gmail new message event.",
        inputs=[],
        outputs=["message"],
    ),
    "outlook_trigger_stub": NodeMetadata(
        type="outlook_trigger_stub",
        name="Outlook Trigger (Simulated)",
        category="trigger",
        description="Simulated Outlook new message event.",
        inputs=[],
        outputs=["message"],
    ),
    "whatsapp_trigger_stub": NodeMetadata(
        type="whatsapp_trigger_stub",
        name="WhatsApp Trigger (Simulated)",
        category="trigger",
        description="Simulated WhatsApp inbound message.",
        inputs=[],
        outputs=["message"],
    ),
    "telegram_trigger_stub": NodeMetadata(
        type="telegram_trigger_stub",
        name="Telegram Trigger (Simulated)",
        category="trigger",
        description="Simulated Telegram inbound message.",
        inputs=[],
        outputs=["message"],
    ),
    "send_gmail_stub": NodeMetadata(
        type="send_gmail_stub",
        name="Send Gmail (Simulated)",
        category="messaging",
        description="Render and send an email through the Gmail connector stub.",
        inputs=["payload"],
        outputs=["message_sent"],
    ),
    "send_outlook_stub": NodeMetadata(
        type="send_outlook_stub",
        name="Send Outlook (Simulated)",
        category="messaging",
        description="Send an Outlook email via stub connector.",
        inputs=["payload"],
        outputs=["message_sent"],
    ),
    "send_whatsapp_stub": NodeMetadata(
        type="send_whatsapp_stub",
        name="Send WhatsApp (Simulated)",
        category="messaging",
        description="Send a WhatsApp message via stub connector.",
        inputs=["payload"],
        outputs=["message_sent"],
    ),
    "send_telegram_stub": NodeMetadata(
        type="send_telegram_stub",
        name="Send Telegram (Simulated)",
        category="messaging",
        description="Send a Telegram message via stub connector.",
        inputs=["payload"],
        outputs=["message_sent"],
    ),
    "reply_router": NodeMetadata(
        type="reply_router",
        name="Reply Router",
        category="messaging",
        description="Route messages to existing threads and enforce idempotency.",
        inputs=["payload"],
        outputs=["thread"],
    ),
    "llm_call": NodeMetadata(
        type="llm_call",
        name="LLM Call",
        category="ai",
        description="Call a chat completion style model with optional JSON mode.",
        inputs=["prompt"],
        outputs=["response"],
    ),
    "ai_agent": NodeMetadata(
        type="ai_agent",
        name="AI Agent",
        category="ai",
        description="Tool-using agent with ephemeral memory.",
        inputs=["prompt", "context"],
        outputs=["response", "actions"],
    ),
    "memory_write": NodeMetadata(
        type="memory_write",
        name="Memory Write",
        category="ai",
        description="Store key/value pairs with optional embedding.",
        inputs=["payload"],
        outputs=["memory_reference"],
    ),
    "memory_read": NodeMetadata(
        type="memory_read",
        name="Memory Read",
        category="ai",
        description="Retrieve memory entries by key or semantic search (simulated).",
        inputs=["query"],
        outputs=["records"],
    ),
    "prompt_template": NodeMetadata(
        type="prompt_template",
        name="Prompt Template",
        category="ai",
        description="Render string templates using prior step variables.",
        inputs=["context"],
        outputs=["prompt"],
    ),
    "if": NodeMetadata(
        type="if",
        name="IF",
        category="control",
        description="Boolean branching with labels for true/false.",
        inputs=["payload"],
        outputs=["true", "false"],
    ),
    "switch": NodeMetadata(
        type="switch",
        name="Switch",
        category="control",
        description="Multi-branch routing based on expression match.",
        inputs=["payload"],
        outputs=["branches"],
    ),
    "merge": NodeMetadata(
        type="merge",
        name="Merge",
        category="control",
        description="Merge multiple branches with wait-all or first-wins behavior.",
        inputs=["branches"],
        outputs=["payload"],
    ),
    "loop_foreach": NodeMetadata(
        type="loop_foreach",
        name="Loop / ForEach",
        category="control",
        description="Iterate over array items with safety limits.",
        inputs=["list"],
        outputs=["item"],
    ),
    "wait": NodeMetadata(
        type="wait",
        name="Wait",
        category="control",
        description="Delay execution or wait for an external event.",
        inputs=["payload"],
        outputs=["payload"],
    ),
    "human_approval": NodeMetadata(
        type="human_approval",
        name="Human Approval",
        category="control",
        description="Pause a run until a human approves or rejects.",
        inputs=["payload"],
        outputs=["payload"],
    ),
    "http_request": NodeMetadata(
        type="http_request",
        name="HTTP Request",
        category="utility",
        description="Perform an HTTP call as an integration escape hatch.",
        inputs=["payload"],
        outputs=["response"],
    ),
    "transform_js": NodeMetadata(
        type="transform_js",
        name="Transform / JS Code",
        category="utility",
        description="Run sandboxed JavaScript to reshape payloads.",
        inputs=["payload"],
        outputs=["payload"],
    ),
    "set_fields": NodeMetadata(
        type="set_fields",
        name="Set / Edit Fields",
        category="utility",
        description="Set, rename, or drop fields on an object.",
        inputs=["payload"],
        outputs=["payload"],
    ),
    "error_handler": NodeMetadata(
        type="error_handler",
        name="Error Handler",
        category="utility",
        description="Catch failures and apply retry/notify/fail strategies.",
        inputs=["error"],
        outputs=["payload"],
    ),
    # LLM Provider Nodes
    "openai_chat": NodeMetadata(
        type="openai_chat",
        name="OpenAI Chat",
        category="ai",
        description="Call OpenAI GPT models (GPT-4, GPT-3.5) with API key configuration.",
        inputs=["prompt", "context"],
        outputs=["response", "tokens_used"],
    ),
    "claude_chat": NodeMetadata(
        type="claude_chat",
        name="Claude Chat",
        category="ai",
        description="Call Anthropic Claude models with API key configuration.",
        inputs=["prompt", "context"],
        outputs=["response", "tokens_used"],
    ),
    "gemini_chat": NodeMetadata(
        type="gemini_chat",
        name="Google Gemini",
        category="ai",
        description="Call Google Gemini models with API key configuration.",
        inputs=["prompt", "context"],
        outputs=["response", "tokens_used"],
    ),
    "deepseek_chat": NodeMetadata(
        type="deepseek_chat",
        name="DeepSeek Chat",
        category="ai",
        description="Call DeepSeek models with API key configuration.",
        inputs=["prompt", "context"],
        outputs=["response", "tokens_used"],
    ),
    # Database Nodes
    "postgres_query": NodeMetadata(
        type="postgres_query",
        name="PostgreSQL Query",
        category="database",
        description="Execute SQL queries on PostgreSQL database.",
        inputs=["query", "parameters"],
        outputs=["rows", "row_count"],
    ),
    "postgres_insert": NodeMetadata(
        type="postgres_insert",
        name="PostgreSQL Insert",
        category="database",
        description="Insert records into PostgreSQL database.",
        inputs=["table", "data"],
        outputs=["inserted_id", "success"],
    ),
    "postgres_vector_store": NodeMetadata(
        type="postgres_vector_store",
        name="PostgreSQL Vector Store",
        category="database",
        description="Store embeddings in PostgreSQL with pgvector extension.",
        inputs=["text", "embedding", "metadata"],
        outputs=["vector_id", "success"],
    ),
    "postgres_vector_search": NodeMetadata(
        type="postgres_vector_search",
        name="PostgreSQL Vector Search",
        category="database",
        description="Semantic search using pgvector similarity.",
        inputs=["query_embedding", "limit"],
        outputs=["results", "scores"],
    ),
    "redis_get": NodeMetadata(
        type="redis_get",
        name="Redis Get",
        category="database",
        description="Retrieve value from Redis cache by key.",
        inputs=["key"],
        outputs=["value", "found"],
    ),
    "redis_set": NodeMetadata(
        type="redis_set",
        name="Redis Set",
        category="database",
        description="Store key-value pair in Redis with optional TTL.",
        inputs=["key", "value", "ttl"],
        outputs=["success"],
    ),
}


def load_node_schema(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def registry_payload() -> List[Dict[str, Any]]:
    registry: List[Dict[str, Any]] = []
    for schema_path in sorted(ROOT.glob("*.node.schema.json")):
        node_type = schema_path.name.replace(".node.schema.json", "")
        meta = NODE_METADATA.get(node_type)
        schema = load_node_schema(schema_path)
        registry.append(
            {
                "type": node_type,
                "schema": schema,
                "name": meta.name if meta else node_type,
                "category": meta.category if meta else "utility",
                "description": meta.description if meta else "",
                "inputs": meta.inputs if meta else [],
                "outputs": meta.outputs if meta else [],
            }
        )
    return registry
