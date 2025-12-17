from __future__ import annotations

from fastapi.testclient import TestClient

from apps.api.main import app


def test_schema_registry_lists_nodes():
    client = TestClient(app)
    resp = client.get("/schemas/nodes")
    assert resp.status_code == 200
    payload = resp.json()
    assert "nodes" in payload
    types = {node["type"] for node in payload["nodes"]}
    # ensure a few critical node types exist
    for expected in {"manual_trigger", "llm_call", "human_approval", "http_request"}:
        assert expected in types


def test_health_endpoint():
    client = TestClient(app)
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
