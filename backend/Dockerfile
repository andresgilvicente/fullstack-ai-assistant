# Backend image (Django REST API)
# Multi-stage build to keep the final image small.

# Stage 1: builder
FROM python:3.14-slim AS builder

# System packages required to compile Python dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# uv is used for fast, reproducible dependency installation
RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock ./

RUN uv venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN uv pip install -r pyproject.toml

# Stage 2: runner
FROM python:3.14-slim AS runner

# PostgreSQL client library needed at runtime
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Run as an unprivileged user
RUN groupadd -r django && useradd -r -g django django

COPY --from=builder /opt/venv /opt/venv
COPY restApi ./restApi

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PATH="/opt/venv/bin:$PATH"
ENV USE_POSTGRES=true

RUN chown -R django:django /app
USER django

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python restApi/manage.py check || exit 1

# Apply migrations, then start the server
CMD cd restApi && \
    python manage.py migrate --noinput && \
    python manage.py runserver 0.0.0.0:8000
