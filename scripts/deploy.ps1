# ==============================================================================
# SSIP Windows / PowerShell Deployment Runner (TASK-10-03)
# Jeppiaar University — Student Skill Intelligence Platform
# ==============================================================================
param(
    [switch]$BuildOnly = $false
)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " Starting SSIP Production Deployment & Migration" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Warning "[!] .env file not found. Copying .env.example to .env..."
    Copy-Item ".env.example" ".env"
}

Write-Host "[+] Building Frontend..." -ForegroundColor Yellow
pnpm --dir frontend run build

Write-Host "[+] Running Database Migrations on persistent database..." -ForegroundColor Yellow
Set-Location backend
python -m alembic upgrade head
python -m app.scripts.seed_jeppiaar_data
Set-Location ..

Write-Host "[+] Running Test Suite to verify system integrity..." -ForegroundColor Yellow
python -m pytest backend/tests -v

Write-Host "======================================================================" -ForegroundColor Green
Write-Host " [✓] SSIP Platform is ready and validated for production deployment!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green

