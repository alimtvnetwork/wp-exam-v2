#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Local Test Execution Runner for WP Exam & WP Sam.
    Spins up backend verification / PHP server, starts the Vite development server,
    and opens the modern application in your default browser.
#>

[CmdletBinding()]
param (
    [int]$Port = 5173,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  WP Exam & WP Sam — Local Development & Test Runner" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Verify Node and PHP prerequisites
Write-Host "`n[1/3] Checking environment prerequisites..." -ForegroundColor Yellow
$hasNode = Get-Command node -ErrorAction SilentlyContinue
$hasNpm = Get-Command npm -ErrorAction SilentlyContinue
$hasPhp = Get-Command php -ErrorAction SilentlyContinue

if (-not $hasNode -or -not $hasNpm) {
    Write-Error "Node.js and npm are required to run the frontend application."
    exit 1
}

if ($hasPhp) {
    Write-Host "  ✓ PHP found: $(php -v | Select-Object -First 1)" -ForegroundColor Green
} else {
    Write-Host "  ! PHP CLI not found in PATH; running frontend with client-side fallback storage." -ForegroundColor DarkYellow
}

# 2. Build Less styles if needed
Write-Host "`n[2/3] Compiling theme stylesheets..." -ForegroundColor Yellow
try {
    npm run build:less
    Write-Host "  ✓ Theme compiled successfully." -ForegroundColor Green
} catch {
    Write-Host "  ! Theme compilation warning (will use existing compiled css)." -ForegroundColor DarkYellow
}

# 3. Launch Vite Dev Server and Open Browser
Write-Host "`n[3/3] Launching Vite development server on port $Port..." -ForegroundColor Yellow
$TargetUrl = "http://127.0.0.1:$Port"

# Open browser after short delay
if (-not $NoBrowser) {
    [System.Threading.Tasks.Task]::Run([Action]{
        Start-Sleep -Seconds 2
        Write-Host "`nOpening browser at $TargetUrl..." -ForegroundColor Cyan
        Start-Process $TargetUrl
    }) | Out-Null
}

Write-Host "`nServer running! Press Ctrl+C to stop.`n" -ForegroundColor Green
npm run dev -- --host 127.0.0.1 --port $Port
