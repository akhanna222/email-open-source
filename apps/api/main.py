from __future__ import annotations

import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List, Optional

from .schema_registry import registry_payload

# Path to sample workflows
SAMPLES_DIR = Path(__file__).resolve().parents[2] / "samples" / "workflows"

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
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


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


@app.get("/workflows/samples/list")
def list_sample_workflows() -> dict:
    """List all available sample workflows"""
    samples = []
    if SAMPLES_DIR.exists():
        for sample_file in SAMPLES_DIR.glob("*.json"):
            try:
                with sample_file.open("r", encoding="utf-8") as f:
                    data = json.load(f)
                    samples.append({
                        "id": data.get("id"),
                        "name": data.get("name"),
                        "description": data.get("description"),
                        "metadata": data.get("metadata", {}),
                        "filename": sample_file.name
                    })
            except Exception as e:
                print(f"Error loading sample {sample_file.name}: {e}")
    return {"samples": samples}


@app.get("/workflows/samples/{sample_id}")
def load_sample_workflow(sample_id: str) -> dict:
    """Load a specific sample workflow by ID"""
    if not SAMPLES_DIR.exists():
        return {"error": "Samples directory not found"}, 404

    for sample_file in SAMPLES_DIR.glob("*.json"):
        try:
            with sample_file.open("r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("id") == sample_id:
                    return {"workflow": data}
        except Exception as e:
            print(f"Error loading sample {sample_file.name}: {e}")

    return {"error": "Sample workflow not found"}, 404
