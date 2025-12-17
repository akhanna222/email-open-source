from __future__ import annotations

import json
from pathlib import Path
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List, Optional

from .schema_registry import registry_payload

# Path to sample workflows
SAMPLES_DIR = Path(__file__).resolve().parents[2] / "samples" / "workflows"

# Path to persisted workflows
WORKFLOWS_DIR = Path(__file__).resolve().parents[2] / "data" / "workflows"
WORKFLOWS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Workflow Agent Studio API", version="0.0.1")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache for workflows
workflows_db: Dict[str, Dict] = {}


class Workflow(BaseModel):
    id: str
    name: str
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class WorkflowVersion(BaseModel):
    version: int
    workflow: Workflow
    timestamp: str
    author: Optional[str] = None
    comment: Optional[str] = None


# Helper functions for persistence and versioning
def get_workflow_path(workflow_id: str) -> Path:
    """Get the base path for a workflow's files"""
    return WORKFLOWS_DIR / workflow_id


def get_workflow_file(workflow_id: str) -> Path:
    """Get the current workflow file path"""
    return get_workflow_path(workflow_id) / "current.json"


def get_versions_dir(workflow_id: str) -> Path:
    """Get the versions directory for a workflow"""
    versions_dir = get_workflow_path(workflow_id) / "versions"
    versions_dir.mkdir(parents=True, exist_ok=True)
    return versions_dir


def get_next_version(workflow_id: str) -> int:
    """Get the next version number for a workflow"""
    versions_dir = get_versions_dir(workflow_id)
    versions = [int(f.stem.split('_')[1]) for f in versions_dir.glob("v_*.json")]
    return max(versions, default=0) + 1


def save_workflow_version(workflow_id: str, workflow_data: dict, comment: Optional[str] = None) -> int:
    """Save a new version of the workflow"""
    version = get_next_version(workflow_id)
    versions_dir = get_versions_dir(workflow_id)

    version_data = {
        "version": version,
        "workflow": workflow_data,
        "timestamp": datetime.utcnow().isoformat(),
        "author": "system",
        "comment": comment or f"Version {version}"
    }

    version_file = versions_dir / f"v_{version}.json"
    with version_file.open("w", encoding="utf-8") as f:
        json.dump(version_data, f, indent=2)

    return version


def save_workflow_to_disk(workflow: Workflow, comment: Optional[str] = None) -> int:
    """Save workflow to disk with versioning"""
    workflow_path = get_workflow_path(workflow.id)
    workflow_path.mkdir(parents=True, exist_ok=True)

    workflow_data = workflow.dict()

    # Save version
    version = save_workflow_version(workflow.id, workflow_data, comment)

    # Update current
    current_file = get_workflow_file(workflow.id)
    with current_file.open("w", encoding="utf-8") as f:
        json.dump(workflow_data, f, indent=2)

    return version


def load_workflow_from_disk(workflow_id: str) -> Optional[dict]:
    """Load workflow from disk"""
    current_file = get_workflow_file(workflow_id)
    if current_file.exists():
        with current_file.open("r", encoding="utf-8") as f:
            return json.load(f)
    return None


def load_all_workflows() -> List[dict]:
    """Load all workflows from disk"""
    workflows = []
    for workflow_dir in WORKFLOWS_DIR.iterdir():
        if workflow_dir.is_dir():
            current_file = workflow_dir / "current.json"
            if current_file.exists():
                with current_file.open("r", encoding="utf-8") as f:
                    workflows.append(json.load(f))
    return workflows


def get_workflow_versions(workflow_id: str) -> List[dict]:
    """Get all versions of a workflow"""
    versions_dir = get_versions_dir(workflow_id)
    versions = []

    for version_file in sorted(versions_dir.glob("v_*.json")):
        with version_file.open("r", encoding="utf-8") as f:
            versions.append(json.load(f))

    return sorted(versions, key=lambda x: x["version"], reverse=True)


def load_workflow_version(workflow_id: str, version: int) -> Optional[dict]:
    """Load a specific version of a workflow"""
    versions_dir = get_versions_dir(workflow_id)
    version_file = versions_dir / f"v_{version}.json"

    if version_file.exists():
        with version_file.open("r", encoding="utf-8") as f:
            return json.load(f)
    return None


# Load existing workflows into memory on startup
def init_workflows():
    """Initialize workflows from disk"""
    for workflow_data in load_all_workflows():
        workflows_db[workflow_data["id"]] = workflow_data


init_workflows()


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
    """Create a new workflow with versioning"""
    # Save to disk with versioning
    version = save_workflow_to_disk(workflow, comment="Initial version")

    # Update memory cache
    workflows_db[workflow.id] = workflow.dict()

    return {
        "success": True,
        "workflow": workflow.dict(),
        "version": version,
        "message": f"Workflow created successfully (version {version})"
    }


@app.put("/workflows/{workflow_id}")
def update_workflow(workflow_id: str, workflow: Workflow) -> dict:
    """Update workflow with automatic versioning"""
    # Save to disk with new version
    version = save_workflow_to_disk(workflow, comment="Updated via UI")

    # Update memory cache
    workflows_db[workflow_id] = workflow.dict()

    return {
        "success": True,
        "workflow": workflow.dict(),
        "version": version,
        "message": f"Workflow updated successfully (version {version})"
    }


@app.delete("/workflows/{workflow_id}")
def delete_workflow(workflow_id: str) -> dict:
    """Delete workflow (keeps version history)"""
    if workflow_id in workflows_db:
        del workflows_db[workflow_id]

    # Note: We keep the files on disk for history
    # To truly delete, you'd need to remove the directory
    return {"success": True, "message": "Workflow removed from active list"}


@app.get("/workflows/{workflow_id}/versions")
def list_workflow_versions(workflow_id: str) -> dict:
    """Get all versions of a workflow"""
    versions = get_workflow_versions(workflow_id)
    return {
        "workflow_id": workflow_id,
        "versions": versions,
        "total": len(versions)
    }


@app.get("/workflows/{workflow_id}/versions/{version}")
def get_workflow_version(workflow_id: str, version: int) -> dict:
    """Get a specific version of a workflow"""
    version_data = load_workflow_version(workflow_id, version)
    if not version_data:
        return {"error": f"Version {version} not found for workflow {workflow_id}"}, 404
    return version_data


@app.post("/workflows/{workflow_id}/restore/{version}")
def restore_workflow_version(workflow_id: str, version: int) -> dict:
    """Restore a specific version as the current workflow"""
    version_data = load_workflow_version(workflow_id, version)
    if not version_data:
        return {"error": f"Version {version} not found"}, 404

    # Get the workflow from the version
    workflow_dict = version_data["workflow"]
    workflow = Workflow(**workflow_dict)

    # Save as new version with restore comment
    new_version = save_workflow_to_disk(
        workflow,
        comment=f"Restored from version {version}"
    )

    # Update memory cache
    workflows_db[workflow_id] = workflow.dict()

    return {
        "success": True,
        "workflow": workflow.dict(),
        "restored_from": version,
        "new_version": new_version,
        "message": f"Restored version {version} as version {new_version}"
    }


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
