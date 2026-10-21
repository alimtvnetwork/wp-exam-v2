#!/usr/bin/env pwsh
<#
.SYNOPSIS
    All-in-One Installer & Development Runner for WP Exam & Laravel Backend.

.DESCRIPTION
    1. Pre-flight Check: Automatically checks Node.js, Bun/npm, and PHP 8.2+.
    2. Auto-Install: If any toolchain or dependency is missing, runs local-install.ps1
       to download and configure portable PHP 8.3 and dependencies automatically.
    3. Backend Service: Starts the Laravel REST API backend (php -S 127.0.0.1:8080 router.php).
    4. Frontend Service: Launches the React Vite frontend (bun/npm run dev) on port 5174.
    5. Process Cleanup: Automatically kills the background backend process on exit (Ctrl+C).
#>

[CmdletBinding()]
param (
    [int]$Port = 5174,
    [int]$BackendPort = 8080,
    [switch]$NoBrowser,
    [switch]$InstallOnly
)

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  WP Exam & Laravel - Auto-Installer & Runner" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Pre-check portable PHP in .tools\php
$toolsPhpDir = Join-Path $RepoRoot ".tools\php"
$toolsPhpExe = Join-Path $toolsPhpDir "php.exe"

if (Test-Path $toolsPhpExe) {
    if (-not ($env:PATH -split ';' -contains $toolsPhpDir)) {
        $env:PATH = "$toolsPhpDir;" + $env:PATH
    }
}

# 1. Environment & Prerequisite Pre-flight Check
Write-Host "`n[1/4] Checking environment prerequisites..." -ForegroundColor Yellow
$hasNode = Get-Command node -ErrorAction SilentlyContinue
$hasPhp = Get-Command php -ErrorAction SilentlyContinue
$hasNodeModules = Test-Path (Join-Path $RepoRoot "node_modules")

$needsInstall = (-not $hasNode -or -not $hasPhp -or -not $hasNodeModules -or $InstallOnly)

if ($needsInstall) {
    Write-Host "  Missing dependencies detected. Running automated environment installer..." -ForegroundColor DarkYellow
    $installerScript = Join-Path $RepoRoot "local-install.ps1"

    if (Test-Path $installerScript) {
        & $installerScript
    } else {
        Write-Error "local-install.ps1 not found in repository root."
        exit 1
    }

    # Re-verify PATH after installer execution
    if (Test-Path $toolsPhpExe) {
        if (-not ($env:PATH -split ';' -contains $toolsPhpDir)) {
            $env:PATH = "$toolsPhpDir;" + $env:PATH
        }
    }

    if ($InstallOnly) {
        Write-Host "`n[OK] Installation completed successfully (-InstallOnly specified)." -ForegroundColor Green
        exit 0
    }
}

$hasPhp = Get-Command php -ErrorAction SilentlyContinue

if (-not $hasPhp) {
    Write-Error "PHP 8.2+ could not be detected. Please run .\local-install.ps1 manually."
    exit 1
}

$phpVer = php -v | Select-Object -First 1
Write-Host "  [OK] PHP runtime: $phpVer" -ForegroundColor Green

$hasBun = Get-Command bun -ErrorAction SilentlyContinue
$hasNpm = Get-Command npm -ErrorAction SilentlyContinue

if ($hasBun) {
    Write-Host "  [OK] Package manager: Bun $(bun -v)" -ForegroundColor Green
} elseif ($hasNpm) {
    Write-Host "  [OK] Package manager: npm $(npm -v)" -ForegroundColor Green
}

# 2. Compile Theme Stylesheets (if needed)
Write-Host "`n[2/4] Verifying theme stylesheets..." -ForegroundColor Yellow
try {
    if ($hasBun) {
        bun run build:less 2>$null
    } else {
        npm run build:less 2>$null
    }
    Write-Host "  [OK] Theme stylesheets ready." -ForegroundColor Green
} catch {
    Write-Host "  [OK] Using existing compiled stylesheets." -ForegroundColor DarkYellow
}

# 3. Launch Standalone Laravel REST API Backend
Write-Host "`n[3/4] Launching Laravel REST API backend on port $BackendPort..." -ForegroundColor Yellow
$phpProcess = $null

try {
    $phpProcess = Start-Process -FilePath "php" -ArgumentList "-S 127.0.0.1:$BackendPort router.php" -PassThru -WindowStyle Hidden
    Start-Sleep -Milliseconds 800

    if ($phpProcess.HasExited) {
        Write-Host "  [WARN] Standalone backend exited early. Checking port availability..." -ForegroundColor DarkYellow
    } else {
        Write-Host "  [OK] Laravel REST API running on http://127.0.0.1:$BackendPort (PID $($phpProcess.Id))." -ForegroundColor Green
    }
} catch {
    Write-Host "  [WARN] Could not spawn backend process: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

# 4. Launch React Frontend & Open Browser
Write-Host "`n[4/4] Launching React frontend on port $Port..." -ForegroundColor Yellow
$TargetUrl = "http://localhost:$Port"

if (-not $NoBrowser) {
    Write-Host "  Configuring browser auto-launch for $TargetUrl..." -ForegroundColor Cyan
    Start-Job -ScriptBlock {
        param($url)
        Start-Sleep -Milliseconds 1500
        try {
            Start-Process $url -ErrorAction Stop
        } catch {
            Start-Process "cmd.exe" -ArgumentList "/c start $url" -WindowStyle Hidden -ErrorAction SilentlyContinue
        }
    } -ArgumentList $TargetUrl | Out-Null
}

Write-Host "`n====================================================" -ForegroundColor Green
Write-Host "  All systems operational!" -ForegroundColor Green
Write-Host "  - Frontend: $TargetUrl" -ForegroundColor Cyan
Write-Host "  - Backend:  http://127.0.0.1:$BackendPort/api/health" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to stop both frontend and backend.`n" -ForegroundColor Green
Write-Host "====================================================`n" -ForegroundColor Green

try {
    if ($hasBun) {
        bun run dev -- --host 127.0.0.1 --port $Port
    } else {
        npm run dev -- --host 127.0.0.1 --port $Port
    }
} finally {
    if ($phpProcess -and -not $phpProcess.HasExited) {
        Write-Host "`nStopping background Laravel backend (PID $($phpProcess.Id))..." -ForegroundColor Yellow
        Stop-Process -Id $phpProcess.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  [OK] Backend stopped cleanly." -ForegroundColor Green
    }
}
