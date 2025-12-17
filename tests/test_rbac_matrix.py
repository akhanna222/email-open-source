from __future__ import annotations

import pytest

from packages.shared.rbac.permissions import PERMISSIONS, role_allowed, Roles


def test_roles_declared():
    assert set(Roles) == {"admin", "builder", "operator", "viewer"}


def test_matrix_has_all_entities():
    assert {
        "tenant",
        "user",
        "workflow",
        "workflow_version",
        "run",
        "step",
        "review_task",
        "artifact",
        "audit_event",
        "credential",
    }.issubset(PERMISSIONS.keys())


def test_admin_has_everything():
    for entity, rules in PERMISSIONS.items():
        assert "admin" in rules
        assert len(rules["admin"]) > 0


def test_builder_cannot_approve_reviews():
    assert role_allowed("review_task", "builder", "approve") is False
    assert role_allowed("review_task", "builder", "reject") is False


def test_viewer_is_read_only():
    forbidden = ["create", "update", "delete", "publish", "rollback", "run", "retry", "cancel", "approve", "reject", "manage_credentials"]
    for entity, rules in PERMISSIONS.items():
        for action in forbidden:
            assert role_allowed(entity, "viewer", action) is False


def test_operator_can_retry_and_cancel_runs():
    assert role_allowed("run", "operator", "retry") is True
    assert role_allowed("run", "operator", "cancel") is True


def test_role_allowed_handles_unknowns():
    assert role_allowed("workflow", "unknown", "create") is False
    assert role_allowed("unknown", "admin", "create") is False
