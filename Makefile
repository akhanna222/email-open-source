.PHONY: test test-fast fmt lint up down

PYTHON ?= python

install:
	$(PYTHON) -m pip install -r requirements-dev.txt

fmt:
	$(PYTHON) -m pip install ruff
	ruff check --select I --fix .

lint:
	ruff check .
	ts-node --version >/dev/null 2>&1 || true
	npm run lint --prefix apps/web || true

test-fast:
	$(PYTHON) -m pytest -q

test:
	$(PYTHON) -m pytest

up:
	docker compose up -d

down:
	docker compose down
