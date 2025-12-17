#!/usr/bin/env bash
set -euo pipefail

DEFAULT_REPO_URL="https://github.com/akhanna222/email-open-source.git"
REPO_URL="${REPO_URL:-$DEFAULT_REPO_URL}"
TARGET_DIR="${TARGET_DIR:-email-open-source}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_DIR="${REPO_DIR:-$DEFAULT_REPO_DIR}"
COMPOSE_CMD=""

log() { printf "[bootstrap] %s\n" "$*"; }
need() { command -v "$1" >/dev/null 2>&1; }

ensure_docker() {
  if need docker; then
    log "docker already installed"
    return
  fi

  if need apt-get; then
    log "installing docker via apt-get (docker.io + docker-compose-plugin)"
    sudo apt-get update -y
    sudo apt-get install -y git curl docker.io docker-compose-plugin
    sudo systemctl enable --now docker || true
  elif need yum; then
    log "installing docker via yum"
    sudo yum install -y git docker
    sudo systemctl enable --now docker || true
    if ! need docker-compose && ! docker compose version >/dev/null 2>&1; then
      log "docker compose plugin not found; installing docker-compose via pip"
      sudo yum install -y python3-pip
      sudo pip3 install docker-compose
    fi
  else
    log "unsupported package manager; install docker manually and rerun"
    exit 1
  fi
}

resolve_compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
  elif need docker-compose; then
    COMPOSE_CMD="docker-compose"
  else
    log "docker compose not available; please install docker-compose or the compose plugin"
    exit 1
  fi
  log "using compose command: ${COMPOSE_CMD}"
}

wait_for_health() {
  local url=$1
  for i in $(seq 1 30); do
    if curl -sf "$url" >/dev/null 2>&1; then
      log "service is healthy at ${url}"
      return 0
    fi
    sleep 1
  done
  log "service did not become healthy at ${url}"
  return 1
}

main() {
  if [ ! -d "${REPO_DIR}/.git" ]; then
    REPO_DIR="$(pwd)/${TARGET_DIR}"
    if [ -d "$REPO_DIR" ] && [ ! -d "${REPO_DIR}/.git" ]; then
      log "target directory ${REPO_DIR} exists but is not a git repo; remove or set TARGET_DIR"
      exit 1
    fi
    log "cloning ${REPO_URL} into ${REPO_DIR}"
    git clone "${REPO_URL}" "${REPO_DIR}"
  fi

  cd "$REPO_DIR"
  log "starting bootstrap in ${REPO_DIR}"

  ensure_docker
  resolve_compose_cmd

  if [ ! -f .env ]; then
    log "copying .env.example to .env"
    cp .env.example .env
  fi

  log "building and starting stack"
  ${COMPOSE_CMD} up -d --build

  log "waiting for API health"
  wait_for_health "http://localhost:8000/health"

  log "running tests inside api service"
  ${COMPOSE_CMD} run --rm api pytest

  log "all done"
  log "API:    http://localhost:8000/health"
  log "Schemas: http://localhost:8000/schemas/nodes"
  log "Web UI: http://localhost:3000"
}

main "$@"
