"""
Security Headers and Request Rate Limiting Middleware (TASK-09-04)
Enforces OWASP Top 10 recommendations, zero MIME sniffing, clickjacking protection,
and sliding window client rate limiting.
"""
import time
from typing import Dict, List, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Appends OWASP-recommended HTTP security headers to all outbound responses.
    """
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Clickjacking defense
        response.headers["X-Frame-Options"] = "DENY"
        # MIME type sniffing defense
        response.headers["X-Content-Type-Options"] = "nosniff"
        # XSS filtering
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # Referrer privacy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # HSTS (1 year + subdomains)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # Restrict hardware features
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
        # Content Security Policy (strict self policy with data URIs allowed for charts/PDF previews)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' data: blob:; "
            "style-src 'self' 'unsafe-inline'; "
            "script-src 'self' 'unsafe-inline'; "
            "font-src 'self' data:; "
            "connect-src 'self' http: https: ws: wss:; "
            "frame-ancestors 'none';"
        )
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    In-memory sliding window rate limiter per client IP.
    Protects API endpoints from brute force and DoS floods.
    """
    def __init__(self, app, max_requests_per_minute: int = 300):
        super().__init__(app)
        self.max_requests = max_requests_per_minute
        # Dict mapping ip -> list of timestamps
        self.clients: Dict[str, List[float]] = {}
        self.window_seconds = 60.0

    async def dispatch(self, request: Request, call_next):
        # Exclude health check and docs from strict rate limit
        path = request.url.path
        if path in ("/api/v1/health", "/", "/docs", "/openapi.json", "/redoc"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        # Clean timestamps older than window
        timestamps = self.clients.get(client_ip, [])
        cutoff = now - self.window_seconds
        valid_timestamps = [ts for ts in timestamps if ts > cutoff]

        if len(valid_timestamps) >= self.max_requests:
            retry_after = int(self.window_seconds - (now - valid_timestamps[0]))
            return JSONResponse(
                status_code=429,
                content={
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": f"Too many requests from {client_ip}. Please wait {max(1, retry_after)} seconds.",
                        "details": {"retry_after": max(1, retry_after)}
                    }
                },
                headers={"Retry-After": str(max(1, retry_after))}
            )

        valid_timestamps.append(now)
        self.clients[client_ip] = valid_timestamps

        response = await call_next(request)
        remaining = max(0, self.max_requests - len(valid_timestamps))
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response

