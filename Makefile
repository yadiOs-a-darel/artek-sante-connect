.PHONY: dev test build deploy lint clean seed setup

dev:
	docker-compose up -d db redis mongo influxdb
	pnpm turbo dev --parallel &
	cd apps/backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

test:
	cd apps/backend && . .venv/bin/activate && pytest tests/ --cov=app --cov-report=html
	pnpm turbo test

build:
	pnpm turbo build
	docker build -f infra/docker/backend.Dockerfile -t artek/backend:latest apps/backend/
	docker build -f infra/docker/web.Dockerfile -t artek/web:latest apps/web/

deploy:
	./scripts/deploy.sh

lint:
	cd apps/backend && . .venv/bin/activate && black app/ && isort app/ && flake8 app/
	pnpm turbo lint

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	pnpm turbo clean

seed:
	./scripts/seed-db.sh

setup:
	./scripts/setup.sh
