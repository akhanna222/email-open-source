from __future__ import annotations

from typing import Dict, List, Set

from jsonschema import Draft202012Validator
from pathlib import Path

WORKFLOW_SCHEMA_PATH = Path(__file__).parent / "workflow.schema.json"


def load_schema(path):
    import json

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def workflow_validator():
    schema = load_schema(WORKFLOW_SCHEMA_PATH)
    return Draft202012Validator(schema)


def validate_workflow_structure(payload: Dict) -> List[str]:
    """Perform supplemental validations not captured by JSON Schema references."""
    errors: List[str] = []

    node_ids: Set[str] = set()
    for node in payload.get("nodes", []):
        node_id = node.get("id")
        if node_id in node_ids:
            errors.append(f"duplicate node id: {node_id}")
        node_ids.add(node_id)

    edges = payload.get("edges", [])
    for edge in edges:
        src = edge.get("source")
        tgt = edge.get("target")
        if src not in node_ids:
            errors.append(f"edge source missing node: {src}")
        if tgt not in node_ids:
            errors.append(f"edge target missing node: {tgt}")

    trigger_nodes = [n for n in payload.get("nodes", []) if n.get("category") == "trigger"]
    if not trigger_nodes:
        errors.append("missing trigger node")

    return errors
