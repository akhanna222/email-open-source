from __future__ import annotations

from fastapi import FastAPI

from .schema_registry import registry_payload

app = FastAPI(title="Workflow Agent Studio API", version="0.0.1")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/schemas/nodes")
def list_node_schemas() -> dict:
    return {"nodes": registry_payload()}
