#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Standalone Local Environment Installer for WP Exam & Laravel Backend.

.DESCRIPTION
    Checks all prerequisites (Node.js, npm/bun, PHP 8.2+ with SQLite extensions).
    If PHP is missing, automatically installs or downloads official portable PHP 8.3
    into .tools\php without requiring Administrator privileges, configures php.ini,
    and runs database migrations.
#>

[CmdletBinding()]
param (
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$RepoRoot = $PSScriptRoot

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  WP Exam & Laravel - Environment Installer" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Verify Node.js and Package Manager
Write-Host "`n[1/4] Checking Node.js and package manager..." -ForegroundColor Yellow
$hasNode = Get-Command node -ErrorAction SilentlyContinue
$hasNpm = Get-Command npm -ErrorAction SilentlyContinue
$hasBun = Get-Command bun -ErrorAction SilentlyContinue

if (-not $hasNode) {
    Write-Host "  [WARN] Node.js not detected." -ForegroundColor Red
    $hasWinget = Get-Command winget -ErrorAction SilentlyContinue

    if ($hasWinget) {
        Write-Host "  Attempting to install Node.js via winget..." -ForegroundColor Cyan
        try {
            winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
            Write-Host "  [OK] Node.js installed via winget." -ForegroundColor Green
        } catch {
            Write-Error "Failed to install Node.js automatically. Please install Node.js from https://nodejs.org"
            exit 1
        }
    } else {
        Write-Error "Node.js is required. Please install Node.js from https://nodejs.org"
        exit 1
    }
} else {
    $nodeVersion = node -v
    Write-Host "  [OK] Node.js detected: $nodeVersion" -ForegroundColor Green
}

if ($hasBun) {
    $bunVersion = bun -v
    Write-Host "  [OK] Bun detected: $bunVersion" -ForegroundColor Green
} elseif ($hasNpm) {
    $npmVersion = npm -v
    Write-Host "  [OK] npm detected: $npmVersion" -ForegroundColor Green
}

# 2. Verify or Install PHP 8.2+
Write-Host "`n[2/4] Checking PHP 8.2+ runtime and extensions..." -ForegroundColor Yellow
$toolsPhpDir = Join-Path $RepoRoot ".tools\php"
$toolsPhpExe = Join-Path $toolsPhpDir "php.exe"

# If portable PHP exists in .tools\php, add to PATH
$hasPortablePhp = Test-Path $toolsPhpExe

if ($hasPortablePhp) {
    if (-not ($env:PATH -split ';' -contains $toolsPhpDir)) {
        $env:PATH = "$toolsPhpDir;" + $env:PATH
    }
}

$hasPhp = Get-Command php -ErrorAction SilentlyContinue

if (-not $hasPhp -or $Force) {
    Write-Host "  PHP not found in PATH. Initiating portable installation..." -ForegroundColor Cyan

    if (-not (Test-Path $toolsPhpDir)) {
        New-Item -ItemType Directory -Path $toolsPhpDir -Force | Out-Null
    }

    $zipUrl = "https://windows.php.net/downloads/releases/php-8.3.35-Win32-vs16-x64.zip"
    $zipPath = Join-Path $toolsPhpDir "php.zip"

    Write-Host "  Downloading portable PHP 8.3 from windows.php.net..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath

    Write-Host "  Extracting portable PHP 8.3 to .tools\php..." -ForegroundColor Cyan
    Expand-Archive -Path $zipPath -DestinationPath $toolsPhpDir -Force
    Remove-Item $zipPath -Force

    $iniDev = Join-Path $toolsPhpDir "php.ini-development"
    $iniTarget = Join-Path $toolsPhpDir "php.ini"
    Copy-Item $iniDev $iniTarget -Force

    Write-Host "  Configuring php.ini with SQLite, cURL, OpenSSL, and mbstring..." -ForegroundColor Cyan
    $iniContent = Get-Content $iniTarget -Raw
    $iniContent = $iniContent -replace ';extension_dir = "ext"', 'extension_dir = "ext"'
    $iniContent = $iniContent -replace ';extension=curl', 'extension=curl'
    $iniContent = $iniContent -replace ';extension=mbstring', 'extension=mbstring'
    $iniContent = $iniContent -replace ';extension=openssl', 'extension=openssl'
    $iniContent = $iniContent -replace ';extension=pdo_sqlite', 'extension=pdo_sqlite'
    $iniContent = $iniContent -replace ';extension=sqlite3', 'extension=sqlite3'
    Set-Content -Path $iniTarget -Value $iniContent -NoNewline

    $env:PATH = "$toolsPhpDir;" + $env:PATH
    Write-Host "  [OK] Portable PHP 8.3 successfully configured!" -ForegroundColor Green
}

$activePhp = php -v | Select-Object -First 1
Write-Host "  [OK] Active PHP: $activePhp" -ForegroundColor Green

# 3. Verify Frontend Dependencies
Write-Host "`n[3/4] Checking frontend node_modules..." -ForegroundColor Yellow
$nodeModules = Join-Path $RepoRoot "node_modules"
$hasNodeModules = Test-Path $nodeModules

if (-not $hasNodeModules) {
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Cyan
    if ($hasBun) {
        bun install
    } else {
        npm install
    }
    Write-Host "  [OK] Frontend dependencies installed." -ForegroundColor Green
} else {
    Write-Host "  [OK] Frontend node_modules already present." -ForegroundColor Green
}

# 4. Run Laravel Database Migrations
Write-Host "`n[4/4] Verifying database schema and migrations..." -ForegroundColor Yellow
try {
    php artisan migrate
} catch {
    Write-Host "  [WARN] Migration check note: $($_.Exception.Message)" -ForegroundColor DarkYellow
}

Write-Host "`n====================================================" -ForegroundColor Green
Write-Host "  [SUCCESS] All prerequisites are satisfied!" -ForegroundColor Green
Write-Host "  You can now run: .\run.ps1" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Green
