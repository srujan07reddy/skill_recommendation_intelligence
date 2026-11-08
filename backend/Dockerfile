# Multi-stage production Dockerfile for SSIP Backend (TASK-10-01)
# Traceability: DEPLOYMENT.md §5.1, SECURITY_ARCHITECTURE.md §4

# ----------------- Stage 1: Build Dependencies -----------------
FROM python:3.12-slim AS builder

WORKDIR /build

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ----------------- Stage 2: Runtime Minimal Image -----------------
FROM python:3.12-slim AS runtime

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/install/bin:$PATH" \
    PYTHONPATH="/install/lib/python3.12/site-packages:$PYTHONPATH"

# Install runtime libraries only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user
RUN groupadd -r ssipgroup && useradd -r -g ssipgroup -u 1001 -s /sbin/nologin ssipuser

# Copy installed packages from builder
COPY --from=builder /install /install

# Copy backend application code
COPY . /app

# Ensure proper non-root permissions
RUN chown -R ssipuser:ssipgroup /app

USER ssipuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

