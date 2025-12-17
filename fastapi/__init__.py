from __future__ import annotations

from typing import Any, Callable, Dict, List


class FastAPI:
    def __init__(self, title: str = "FastAPI", version: str = "0.0.0") -> None:
        self.title = title
        self.version = version
        self.routes: Dict[str, Callable[..., Any]] = {}

    def get(self, path: str):
        def decorator(func: Callable[..., Any]):
            self.routes[path] = func
            return func

        return decorator


__all__: List[str] = ["FastAPI"]
