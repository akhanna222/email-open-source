"""Central RBAC matrix for Workflow Agent Studio.

The matrix is intentionally explicit and should be imported by both API and UI layers
so that permission checks and feature flags stay aligned.
"""
from __future__ import annotations

from typing import Dict, List, Set

Roles = ["admin", "builder", "operator", "viewer"]

# Entities and supported actions
PERMISSIONS: Dict[str, Dict[str, Set[str]]] = {
    "tenant": {
        "admin": {"create", "read", "update", "delete"},
        "builder": set(),
        "operator": set(),
        "viewer": set(),
    },
    "user": {
        "admin": {"create", "read", "update", "delete"},
        "builder": set(),
        "operator": set(),
        "viewer": set(),
    },
    "workflow": {
        "admin": {"create", "read", "update", "delete", "publish", "rollback"},
        "builder": {"create", "read", "update", "delete", "publish"},
        "operator": {"read"},
        "viewer": {"read"},
    },
    "workflow_version": {
        "admin": {"create", "read", "update", "delete", "publish", "rollback"},
        "builder": {"create", "read", "update", "delete", "publish"},
        "operator": {"read"},
        "viewer": {"read"},
    },
    "run": {
        "admin": {"create", "read", "update", "delete", "run", "retry", "cancel"},
        "builder": {"create", "read", "run", "retry", "cancel"},
        "operator": {"read", "run", "retry", "cancel"},
        "viewer": {"read"},
    },
    "step": {
        "admin": {"read"},
        "builder": {"read"},
        "operator": {"read"},
        "viewer": {"read"},
    },
    "review_task": {
        "admin": {"read", "approve", "reject"},
        "builder": set(),
        "operator": {"read", "approve", "reject"},
        "viewer": set(),
    },
    "artifact": {
        "admin": {"read", "download", "delete"},
        "builder": {"read", "download"},
        "operator": {"read", "download"},
        "viewer": {"read", "download"},
    },
    "audit_event": {
        "admin": {"read"},
        "builder": {"read"},
        "operator": {"read"},
        "viewer": set(),
    },
    "credential": {
        "admin": {"create", "read", "update", "delete", "manage_credentials"},
        "builder": {"create", "read", "update", "manage_credentials"},
        "operator": {"read"},
        "viewer": set(),
    },
}


def role_allowed(entity: str, role: str, action: str) -> bool:
    """Return True when a role is allowed to perform the action on the entity."""
    entity_permissions = PERMISSIONS.get(entity, {})
    return action in entity_permissions.get(role, set())


__all__ = ["PERMISSIONS", "role_allowed", "Roles"]
