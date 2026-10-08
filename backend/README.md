# Backend

Django REST API for the AI Chat Assistant. It handles authentication, chat persistence, usage quotas and communication with the Ollama inference server.

For the project overview, see the [root README](../README.md).

## Applications

| App | Responsibility |
|---|---|
| `users` | Custom user model, registration, profile, password change and logout. |
| `chats` | Chats, messages and the endpoint that sends a message to the model. |
| `usage` | Monthly message quota per user. |
| `ai` | Ollama client (`llm_service.call_llm`). |
| `healthcheck` | Liveness endpoint. |

## Requirements

- Python 3.14
- [uv](https://docs.astral.sh/uv/)
- An Ollama server reachable at `OLLAMA_HOST` (default `http://ollama:11434`, which is the Docker Compose service name)

## Running locally

```bash
cp .env.example .env
uv sync
source .venv/bin/activate        # Windows: .venv\Scripts\activate

cd restApi
python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver
```

The API is available at `http://localhost:8000` and the interactive documentation at `http://localhost:8000/api/docs/`.

## Configuration

Settings are read from environment variables, optionally loaded from a `.env` file.

| Variable | Default | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | development key | Secret key. Must be set in production. |
| `DEBUG` | `True` | Debug mode. Set to `False` in production. |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,0.0.0.0` | Comma-separated list of allowed hosts. |
| `USE_POSTGRES` | `false` | `true` selects PostgreSQL, otherwise SQLite is used. |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT` | see `settings.py` | PostgreSQL connection. |
| `CORS_ALLOW_ALL_ORIGINS` | `True` | Allow every origin. Disable it and set `CORS_ALLOWED_ORIGINS` in production. |
| `CORS_ALLOWED_ORIGINS` | empty | Comma-separated list of allowed origins. |
| `OLLAMA_HOST` | `http://ollama:11434` | Ollama server URL. |
| `OLLAMA_MODEL` | `llama3.2:3b` | Model used for chat completions. |

## Testing

```bash
cd restApi
python manage.py test
```

The tests cover registration and validation, profile and password management, token blacklisting, chat isolation between users, quota enforcement and renewal, and message storage. The LLM call is mocked, so Ollama is not required.

## Docker

The image is built in two stages and runs as an unprivileged user. On start-up it applies the migrations and launches the development server. Use the root `docker-compose.yml` to run it together with its dependencies:

```bash
docker compose up --build backend
```

The Compose file mounts `./backend` into the container, so source changes are picked up without rebuilding. For production, replace the development server with a WSGI server such as Gunicorn.
