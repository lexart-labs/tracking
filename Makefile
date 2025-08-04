SHELL := /bin/bash

ENV_FILES_DIR      := ./env_files
DEPLOYMENT_DIR     := ./deployment
SWARM_DIR          := ./deployment/swarm

ENV_FILE_LOCAL     := $(ENV_FILES_DIR)/.env.local
ENV_FILE_DEV       := $(ENV_FILES_DIR)/.env.dev
ENV_FILE_PROD      := $(ENV_FILES_DIR)/.env.prod

COMPOSE_BASE       := $(DEPLOYMENT_DIR)/docker-compose.base.yaml
COMPOSE_LOCAL      := $(DEPLOYMENT_DIR)/docker-compose.local.yaml
COMPOSE_DEV        := $(DEPLOYMENT_DIR)/docker-compose.dev.yaml
COMPOSE_PROD       := $(DEPLOYMENT_DIR)/docker-compose.prod.yaml

COMPOSE_SWARM_DEV  := $(SWARM_DIR)/docker-compose.swarm.dev.yaml
COMPOSE_SWARM_PROD := $(SWARM_DIR)/docker-compose.swarm.prod.yaml

COMPOSE_MONITOR    := $(DEPLOYMENT_DIR)/monitor/docker-compose.monitor.yaml

# --- Base Project Management ---
BASE_BRANCH := develop

.PHONY: all local dev prod clean clean-local clean-dev clean-prod help swarm-dev swarm-prod monitor clean-monitor clean-swarm-dev clean-swarm-prod setup-upstream update-from-base

all: help

local: $(ENV_FILE_LOCAL) $(COMPOSE_BASE) $(COMPOSE_LOCAL)
	@echo "==> Running Local Environment..."
	@echo "Building Docker images without cache..."
	@docker compose --env-file $(ENV_FILE_LOCAL) \
		-f $(COMPOSE_BASE) -f $(COMPOSE_LOCAL) build --no-cache && \
		echo "Images for local built successfully!" || \
		(echo "Error building images for local. Please check the logs."; exit 1)
	@echo "Starting Docker containers..."
	@docker compose --env-file $(ENV_FILE_LOCAL) \
		-f $(COMPOSE_BASE) -f $(COMPOSE_LOCAL) up -d && \
		echo "Local containers started successfully!" || \
		(echo "Error starting local containers. Please check the logs."; exit 1)

dev: $(ENV_FILE_DEV) $(COMPOSE_BASE) $(COMPOSE_DEV)
	@echo "==> Running Local Development..."
	@echo "Building Docker images without cache..."
	@docker compose --env-file $(ENV_FILE_DEV) \
		-f $(COMPOSE_BASE) -f $(COMPOSE_DEV) build --no-cache && \
		echo "Images for development built successfully!" || \
		(echo "Error building images for development. Please check the logs."; exit 1)
	@echo "Starting Docker containers..."
	@docker compose --env-file $(ENV_FILE_DEV) \
		-f $(COMPOSE_BASE) -f $(COMPOSE_DEV) up -d && \
		echo "Development containers started successfully!" || \
		(echo "Error starting development containers. Please check the logs."; exit 1)

prod: $(ENV_FILE_PROD) $(COMPOSE_BASE) $(COMPOSE_PROD)
	@echo "==> Running Production Environment..."
	@echo "Building Docker images without cache..."
	@docker compose --env-file $(ENV_FILE_PROD) \
		-f $(COMPOSE_BASE) -f $(COMPOSE_PROD) build --no-cache && \
		echo "Images for production built successfully!" || \
		(echo "Error building images for production. Please check the logs."; exit 1)
	@echo "Starting Docker containers..."
	@docker compose --env-file $(ENV_FILE_PROD) \
		-f $(COMPOSE_BASE) -f $(COMPOSE_PROD) up -d && \
		echo "Production containers started successfully!" || \
		(echo "Error starting Production containers. Please check the logs."; exit 1)

swarm-dev: $(ENV_FILE_DEV) $(COMPOSE_BASE) $(COMPOSE_SWARM_DEV)
	@echo "==> Running Development Environment..."
	@if [ ! -f "$(ENV_FILE_DEV)" ]; then \
		echo "File $(ENV_FILE_DEV) not found."; \
		exit 1; \
	fi
	@echo "Loading variables from $(ENV_FILE_DEV)..."
	$(eval _PROJECT_NAME_DEV := $(shell bash -c 'set -a; . $(ENV_FILE_DEV) >/dev/null 2>&1; set +a; echo $COMPOSE_PROJECT_NAME'))
	@if [ -z "$(_PROJECT_NAME_DEV)" ]; then \
		echo "Error: COMPOSE_PROJECT_NAME variable was not found in $(ENV_FILE_DEV) file."; \
		exit 1; \
	fi
	@echo "Using stack: $(_PROJECT_NAME_DEV)"
	@echo "Deploying stack and starting containers..."
	@env $(cat $(ENV_FILE_DEV) | grep -v '^#' | xargs) docker stack deploy \
		-c $(COMPOSE_BASE) -c $(COMPOSE_SWARM_DEV) $(_PROJECT_NAME_DEV) --with-registry-auth && \
		echo "Development stack '$(_PROJECT_NAME_DEV)' deployed successfully!" || \
		(echo "Error deploying development stack. Please check the logs."; exit 1)

swarm-prod: $(ENV_FILE_PROD) $(COMPOSE_BASE) $(COMPOSE_SWARM_PROD)
	@echo "==> Running Production Environment..."
	@if [ ! -f "$(ENV_FILE_PROD)" ]; then \
		echo "File $(ENV_FILE_PROD) not found."; \
		exit 1; \
	fi
	@echo "Loading variables from $(ENV_FILE_PROD)..."
	$(eval _PROJECT_NAME_PROD := $(shell bash -c 'set -a; . $(ENV_FILE_PROD) >/dev/null 2>&1; set +a; echo $COMPOSE_PROJECT_NAME'))
	@if [ -z "$(_PROJECT_NAME_PROD)" ]; then \
		echo "Error: COMPOSE_PROJECT_NAME variable was not found in $(ENV_FILE_PROD) file."; \
		exit 1; \
	fi
	@echo "Using stack: $(_PROJECT_NAME_PROD)"
	@echo "Deploying stack and starting containers..."
	@env $(cat $(ENV_FILE_PROD) | grep -v '^#' | xargs) docker stack deploy \
		-c $(COMPOSE_BASE) -c $(COMPOSE_SWARM_PROD) $(_PROJECT_NAME_PROD) --with-registry-auth && \
		echo "Production stack '$(_PROJECT_NAME_PROD)' deployed successfully!" || \
		(echo "Error deploying production stack. Please check the logs."; exit 1)

monitor:
	@echo "==> Running Monitoring Environment..."
	@echo "Building and starting monitoring containers..."
	@docker compose -f $(COMPOSE_MONITOR) build --no-cache && \
		echo "Images for monitoring built successfully!" || \
		(echo "Error building images for monitoring. Please check the logs."; exit 1)
	@echo "Starting monitoring containers..."
	@docker compose -f $(COMPOSE_MONITOR) up -d && \
		echo "Monitoring containers started successfully!" || \
		(echo "Error starting monitoring containers. Please check the logs."; exit 1)

clean-local:
	@echo "==> Stopping and removing Local environment containers..."
	@docker compose --env-file $(ENV_FILE_LOCAL) \
		-f $(COMPOSE_BASE) -f $(COMPOSE_LOCAL) down -v --remove-orphans && \
		echo "Local environment cleaned successfully." || \
		(echo "Error cleaning local environment or some resources might still exist."; exit 1)

clean-dev:
	@echo "==> Stopping and removing Development environment containers..."
	@docker compose --env-file $(ENV_FILE_DEV) \
		-f $(COMPOSE_BASE) -f $(COMPOSE_DEV) down -v --remove-orphans && \
		echo "Development environment cleaned successfully." || \
		(echo "Error cleaning development environment or some resources might still exist."; exit 1)

clean-prod:
	@echo "==> Stopping and removing Production environment containers..."
	@docker compose --env-file $(ENV_FILE_PROD) \
		-f $(COMPOSE_BASE) -f $(COMPOSE_PROD) down -v --remove-orphans && \
		echo "Production environment cleaned successfully." || \
		(echo "Error cleaning Production environment or some resources might still exist."; exit 1)

clean-swarm-dev:
	@echo "==> Attempting to clean Development environment stack..."
	@if [ ! -f "$(ENV_FILE_DEV)" ]; then \
		echo "Error: Environment file $(ENV_FILE_DEV) not found. Cannot determine COMPOSE_PROJECT_NAME."; \
		echo "Please remove the stack manually: docker stack rm <your-dev-stack-name>"; \
		exit 1; \
	fi
	$(eval _PROJECT_NAME_DEV_CLEAN := $(shell bash -c 'set -a; . $(ENV_FILE_DEV) >/dev/null 2>&1; set +a; echo $COMPOSE_PROJECT_NAME'))
	@if [ -z "$(_PROJECT_NAME_DEV_CLEAN)" ]; then \
		echo "Error: COMPOSE_PROJECT_NAME not found or empty in $(ENV_FILE_DEV)."; \
		echo "Cannot remove Development stack automatically."; \
		echo "Please remove the stack manually: docker stack rm <your-dev-stack-name>"; \
		exit 1; \
	fi
	@echo "Removing Development stack: $(_PROJECT_NAME_DEV_CLEAN)..."
	@docker stack rm $(_PROJECT_NAME_DEV_CLEAN) && \
		echo "Development stack '$(_PROJECT_NAME_DEV_CLEAN)' removed successfully." || \
		(echo "Error removing Development stack '$(_PROJECT_NAME_DEV_CLEAN)' or stack not found.") # No exit 1 here, as 'stack rm' fails if not found

clean-swarm-prod:
	@echo "==> Attempting to clean Production environment stack..."
	@if [ ! -f "$(ENV_FILE_PROD)" ]; then \
		echo "Error: Environment file $(ENV_FILE_PROD) not found. Cannot determine COMPOSE_PROJECT_NAME."; \
		echo "Please remove the stack manually: docker stack rm <your-prod-stack-name>"; \
		exit 1; \
	fi
	$(eval _PROJECT_NAME_PROD_CLEAN := $(shell bash -c 'set -a; . $(ENV_FILE_PROD) >/dev/null 2>&1; set +a; echo $COMPOSE_PROJECT_NAME'))
	@if [ -z "$(_PROJECT_NAME_PROD_CLEAN)" ]; then \
		echo "Error: COMPOSE_PROJECT_NAME not found or empty in $(ENV_FILE_PROD)."; \
		echo "Cannot remove Production stack automatically."; \
		echo "Please remove the stack manually: docker stack rm <your-prod-stack-name>"; \
		exit 1; \
	fi
	@echo "Removing Production stack: $(_PROJECT_NAME_PROD_CLEAN)..."
	@docker stack rm $(_PROJECT_NAME_PROD_CLEAN) && \
		echo "Production stack '$(_PROJECT_NAME_PROD_CLEAN)' removed successfully." || \
		(echo "Error removing Production stack '$(_PROJECT_NAME_PROD_CLEAN)' or stack not found.") # No exit 1 here

clean-monitor:
	@echo "==> Stopping and removing Monitoring environment containers..."
	@docker compose -f $(COMPOSE_MONITOR) down -v --remove-orphans && \
		echo "Monitoring environment cleaned successfully." || \
		(echo "Error cleaning monitoring environment or some resources might still exist."; exit 1)

clean: clean-local
	@echo ""
	@echo "Local environment has been cleaned."
	@echo "To clean the Development stack (if running), run: make clean-dev"
	@echo "To clean the Production stack (if running), run: make clean-prod"

setup-upstream:
	@if git remote get-url upstream > /dev/null 2>&1; then \
		echo "Upstream remote is already configured:"; \
		git remote get-url upstream; \
	else \
		echo "Configuring upstream remote for base-project."; \
		read -p "Enter the base-project repository URL: " UPSTREAM_URL; \
		if [ -z "$$UPSTREAM_URL" ]; then \
			echo "URL cannot be empty. Aborting."; \
			exit 1; \
		fi; \
		git remote add upstream $$UPSTREAM_URL; \
		echo "Upstream remote configured successfully."; \
	fi

update-from-base:
	@if ! git remote get-url upstream > /dev/null 2>&1; then \
		echo "Error: Upstream remote not configured."; \
		echo "Please run 'make setup-upstream' first."; \
		exit 1; \
	fi
	@echo "==> Fetching updates from base-project..."
	@git fetch upstream
	@echo "==> Merging updates from base-project (branch: main)..."
	@git merge upstream/main --allow-unrelated-histories
	@echo "Update complete. Please review any conflicts and commit the changes."

help:
	@echo "Available commands:"
	@echo "  make local        - Build (no-cache) and run containers for the Local environment."
	@echo "  make dev          - Build (no-cache) and run containers for the Development environment."
	@echo "  make prod         - Build (no-cache) and run containers for the Production environment."
	@echo ""
	@echo "  make clean-local  - Stop and remove containers for the Local environment."
	@echo "  make clean-dev    - Stop and remove containers for the Development environment."
	@echo "  make clean-prod   - Stop and remove containers for the Production environment."
	@echo "  make clean        - Clean Local environment and show instructions for dev/prod."
	@echo ""
	@echo "  make swarm-dev    - Deploy stack for the Development environment in Swarm mode."
	@echo "  make swarm-prod   - Deploy stack for the Production environment in Swarm mode."
	@echo ""
	@echo "  make monitor      - Build (no-cache) and start monitoring containers."
	@echo "  make clean-monitor - Stop and remove monitoring containers."
	@echo ""
	@echo "  make clean-swarm-dev - Clean the Development environment stack in Swarm mode."
	@echo "  make clean-swarm-prod - Clean the Production environment stack in Swarm mode."
	@echo ""
	@echo "  --- Base Project Management ---"
	@echo "  make setup-upstream    - (One-time setup) Configure the base-project repository as a remote 'upstream'."
	@echo "  make update-from-base  - Fetch and merge the latest updates from the base-project."
	@echo ""
	@echo "  make help         - Show this help message."
	@echo "  make all          - Show this help message (default)."