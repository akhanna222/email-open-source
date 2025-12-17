from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List

from .schema_registry import registry_payload

app = FastAPI(title="Workflow Agent Studio API", version="0.0.1")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for workflows (replace with database later)
workflows_db: Dict[str, Dict] = {}


class Workflow(BaseModel):
    id: str
    name: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/schemas/nodes")
def list_node_schemas() -> dict:
    return {"nodes": registry_payload()}


@app.get("/workflows")
def list_workflows() -> dict:
    return {"workflows": list(workflows_db.values())}


@app.get("/workflows/{workflow_id}")
def get_workflow(workflow_id: str) -> dict:
    if workflow_id not in workflows_db:
        return {"error": "Workflow not found"}, 404
    return workflows_db[workflow_id]


@app.post("/workflows")
def create_workflow(workflow: Workflow) -> dict:
    workflows_db[workflow.id] = workflow.dict()
    return {"success": True, "workflow": workflow.dict()}


@app.put("/workflows/{workflow_id}")
def update_workflow(workflow_id: str, workflow: Workflow) -> dict:
    workflows_db[workflow_id] = workflow.dict()
    return {"success": True, "workflow": workflow.dict()}


@app.delete("/workflows/{workflow_id}")
def delete_workflow(workflow_id: str) -> dict:
    if workflow_id in workflows_db:
        del workflows_db[workflow_id]
    return {"success": True}
