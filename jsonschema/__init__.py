from __future__ import annotations

import re
from typing import Any, Dict, List


class ValidationError(Exception):
    """Minimal validation error to mirror jsonschema."""


class Draft202012Validator:
    def __init__(self, schema: Dict[str, Any]):
        self.schema = schema

    @staticmethod
    def check_schema(schema: Dict[str, Any]):
        # lightweight placeholder: real library performs full validation
        if not isinstance(schema, dict):
            raise ValidationError("schema must be dict")

    def validate(self, instance: Any):
        _validate(instance, self.schema)


def _validate(instance: Any, schema: Dict[str, Any]):
    # type handling
    if "type" in schema:
        expected = schema["type"]
        expected_types: List[str] = expected if isinstance(expected, list) else [expected]
        if not _matches_type(instance, expected_types):
            raise ValidationError(f"expected types {expected_types}, got {type(instance).__name__}")

    if "enum" in schema:
        if instance not in schema["enum"]:
            raise ValidationError(f"{instance} not in enum {schema['enum']}")

    if isinstance(instance, str):
        if "minLength" in schema and len(instance) < schema["minLength"]:
            raise ValidationError("string too short")
        if "pattern" in schema:
            if re.match(schema["pattern"], instance) is None:
                raise ValidationError("pattern mismatch")

    if isinstance(instance, (int, float)):
        if "minimum" in schema and instance < schema["minimum"]:
            raise ValidationError("below minimum")
        if "maximum" in schema and instance > schema.get("maximum", instance):
            if "maximum" in schema:
                raise ValidationError("above maximum")

    if isinstance(instance, list):
        if "minItems" in schema and len(instance) < schema["minItems"]:
            raise ValidationError("too few items")
        item_schema = schema.get("items")
        if item_schema:
            for item in instance:
                _validate(item, item_schema if isinstance(item_schema, dict) else item_schema.get("items", {}))

    if isinstance(instance, dict):
        required = schema.get("required", [])
        for key in required:
            if key not in instance:
                raise ValidationError(f"missing required property: {key}")

        properties = schema.get("properties", {})
        for key, value in instance.items():
            if key in properties:
                _validate(value, properties[key])
            elif schema.get("additionalProperties") is False:
                raise ValidationError(f"additional property not allowed: {key}")

    # handle allOf
    for clause in schema.get("allOf", []):
        _validate(instance, clause)

    # if/then/else minimal support
    if "if" in schema:
        try:
            _validate(instance, schema["if"])
            condition_passed = True
        except ValidationError:
            condition_passed = False
        if condition_passed and "then" in schema:
            _validate(instance, schema["then"])
        elif not condition_passed and "else" in schema:
            _validate(instance, schema["else"])


def _matches_type(instance: Any, expected: List[str]) -> bool:
    mapping = {
        "string": str,
        "integer": int,
        "number": (int, float),
        "object": dict,
        "array": list,
        "boolean": bool,
        "null": type(None),
    }
    for t in expected:
        py_type = mapping.get(t)
        if py_type is None:
            continue
        if isinstance(instance, py_type):
            return True
    return False
