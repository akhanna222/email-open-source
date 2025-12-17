from __future__ import annotations

from typing import Any


class _Response:
    def __init__(self, json_data: Any, status_code: int = 200) -> None:
        self._json = json_data
        self.status_code = status_code

    def json(self) -> Any:  # pragma: no cover - trivial
        return self._json


class TestClient:
    __test__ = False  # prevent pytest from collecting this helper as a test
    def __init__(self, app) -> None:
        self.app = app

    def get(self, path: str) -> _Response:
        handler = self.app.routes.get(path)
        if handler is None:
            return _Response({"detail": "not found"}, status_code=404)
        result = handler()
        return _Response(result)
