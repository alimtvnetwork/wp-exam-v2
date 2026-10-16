#!/usr/bin/env pwsh
<#
.SYNOPSIS
    WP Exam - one-liner installer (GitMap/AGM style).

.DESCRIPTION
    1. Detects OS/arch and checks prerequisites (node 20+, npm; php 8.3 optional).
    2. Installs npm dependencies (npm ci when the lockfile is clean, else npm install).
    3. Compiles theme styles (npm run build:less).
    4. Runs the production build (npm run build).
    5. Prints next steps.

    Idempotent: safe to re-run; steps already satisfied are skipped.
    Zero-storage mandate: never uploads anything anywhere.

.EXAMPLE
    .\scripts\install.ps1
    From a repo checkout.

.EXAMPLE
    iwr -useb https://raw.githubusercontent.com/alimtvnetwork/wp-exam-v2/main/scripts/install.ps1 | iex
    One-liner from the web (clones the repo when needed).
#>

[CmdletBinding()]
param (
    [switch]$Help,
    [switch]$DryRun,
    [switch]$SkipBuild,
    [int]$Port = 5174
)

$ErrorActionPreference = "Stop"

function Write-Step  { param([string]$Label, [string]$Text) Write-Host "`n[$Label] $Text" -ForegroundColor Yellow }
function Write-Ok    { param([string]$Text) Write-Host "  [ok] $Text" -ForegroundColor Green }
function Write-Warn  { param([string]$Text) Write-Host "  [warn] $Text" -ForegroundColor DarkYellow }
function Write-Skip  { param([string]$Text) Write-Host "  [skip] $Text" -ForegroundColor Cyan }

function Invoke-InstallerStep {
    # Runs the scriptblock, or prints the command line in dry-run mode.
    param([string]$CommandLine, [scriptblock]$Action)
    if ($DryRun) {
        Write-Host "  [dry-run] would run: $CommandLine" -ForegroundColor Cyan
        return
    }
    & $Action
}

function Test-VersionAtLeast {
    # Test-VersionAtLeast <actual> <required> — both "major.minor" strings.
    param([string]$Actual, [string]$Required)
    $a = $Actual -split '\.'
    $r = $Required -split '\.'
    $aMajor = [int]$a[0]; $aMinor = [int]$a[1]
    $rMajor = [int]$r[0]; $rMinor = [int]$r[1]
    if ($aMajor -gt $rMajor) { return $true }
    if ($aMajor -lt $rMajor) { return $false }
    return ($aMinor -ge $rMinor)
}

function Test-HasBuildLessScript {
    param([string]$Dir)
    $pkg = Join-Path $Dir "package.json"
    if (-not (Test-Path $pkg)) { return $false }
    return ((Get-Content $pkg -Raw) -match '"build:less"')
}

if ($Help) {
    # $MyInvocation.MyCommand.Path is empty when piped via iwr | iex.
    $helpPath = $MyInvocation.MyCommand.Path
    if ($helpPath) {
        Get-Help $helpPath -Detailed
    } else {
        Write-Host @'
WP Exam - one-liner installer (GitMap/AGM style).

Usage:
  .\scripts\install.ps1 [-Help] [-DryRun] [-SkipBuild] [-Port <n>]
  iwr -useb https://raw.githubusercontent.com/alimtvnetwork/wp-exam-v2/main/scripts/install.ps1 | iex

Checks prerequisites (node 20+, npm; php 8.3 optional), installs npm
dependencies, compiles theme styles (npm run build:less), runs the production
build (npm run build), and prints next steps. Idempotent; zero storage.
'@
    }
    exit 0
}

# ---------------------------------------------------------------------------
# Repo root detection (works when piped via iwr | iex)
# ---------------------------------------------------------------------------
$RepoDir = $null

if (Test-HasBuildLessScript (Get-Location).Path) {
    # Already inside the wp-exam-v2 checkout.
    $RepoDir = (Get-Location).Path
} else {
    # One-liner mode: clone (or reuse) the repo into the current directory.
    $repoUrl = "https://github.com/alimtvnetwork/wp-exam-v2.git"
    $cloneDir = Join-Path (Get-Location).Path "wp-exam-v2"
    if ((Test-Path $cloneDir) -and (Test-HasBuildLessScript $cloneDir)) {
        Write-Skip "wp-exam-v2 directory already exists; reusing it (idempotent)."
        $RepoDir = $cloneDir
    } else {
        Write-Step "0" "Cloning wp-exam-v2 (one-liner mode)..."
        if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
            Write-Error "git is not on PATH; needed to clone the repo in one-liner mode. Clone it manually: git clone $repoUrl"
            exit 1
        }
        Invoke-InstallerStep -CommandLine "git clone $repoUrl" -Action { git clone $repoUrl }
        $RepoDir = $cloneDir
    }
}

if ($DryRun) {
    Write-Host "  [dry-run] would cd into: $RepoDir" -ForegroundColor Cyan
} else {
    Set-Location $RepoDir
}
$RepoRoot = (Get-Location).Path

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  WP Exam - one-liner installer" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  repo root : $RepoRoot"
Write-Host "  dry run   : $(if ($DryRun) { 'yes' } else { 'no' })"

# ---------------------------------------------------------------------------
# [1/5] OS / arch detection
# ---------------------------------------------------------------------------
Write-Step "1/5" "Detecting OS and architecture..."

if ($IsWindows) { $osLabel = "windows" }
elseif ($IsMacOS) { $osLabel = "macos" }
elseif ($IsLinux) { $osLabel = "linux" }
else { $osLabel = "unknown" }

$archLabel = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString()
Write-Host "  os   : $osLabel"
Write-Host "  arch : $archLabel"

# Keep the Vite/SWC native binding cache inside the repo to dodge Windows
# MAX_PATH (260-char) truncation in long home-directory paths (run.ps1 pattern).
if (-not $env:SWC_NATIVE_BINDING_CACHE) {
    $swcCacheDir = Join-Path $RepoRoot "node_modules\.cache\swc"
    if ($DryRun) {
        Write-Host "  [dry-run] would set SWC_NATIVE_BINDING_CACHE=$swcCacheDir" -ForegroundColor Cyan
    } else {
        if (-not (Test-Path $swcCacheDir)) {
            New-Item -ItemType Directory -Path $swcCacheDir -Force | Out-Null
        }
        $env:SWC_NATIVE_BINDING_CACHE = $swcCacheDir
    }
}

# ---------------------------------------------------------------------------
# [2/5] Prerequisites: node 20+, npm, php 8.3 (optional)
# ---------------------------------------------------------------------------
Write-Step "2/5" "Checking prerequisites..."

$hasNode = Get-Command node -ErrorAction SilentlyContinue
if (-not $hasNode) {
    Write-Error "node is not on PATH. Install node 20+ from https://nodejs.org and re-run."
    exit 1
}
$nodeVer = (node --version).TrimStart('v')
if (Test-VersionAtLeast $nodeVer "20.0") {
    Write-Ok "node $nodeVer (>= 20 required)"
} else {
    Write-Error "node $nodeVer found; node 20+ is required."
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not on PATH. Reinstall node 20+ (ships with npm) and re-run."
    exit 1
}
Write-Ok "npm $(npm --version)"

$hasPhp = Get-Command php -ErrorAction SilentlyContinue
if ($hasPhp) {
    $phpVer = (php -r 'echo PHP_MAJOR_VERSION . "." . PHP_MINOR_VERSION;')
    if (Test-VersionAtLeast $phpVer "8.3") {
        Write-Ok "php $phpVer (>= 8.3, optional prerequisite satisfied)"
    } else {
        Write-Warn "php $phpVer found (< 8.3); backend features need php 8.3+. Continuing with frontend-only setup."
    }
} else {
    Write-Warn "php not found; the WordPress/PHP backend stays optional - continuing with the frontend app."
}

# ---------------------------------------------------------------------------
# [3/5] npm dependencies (idempotent)
# ---------------------------------------------------------------------------
Write-Step "3/5" "Installing npm dependencies..."

function Test-DepsSatisfied {
    # Idempotent when: node_modules exists AND the installed lockfile matches
    # the committed lockfile (npm's own marker).
    if (-not (Test-Path "node_modules")) { return $false }
    if (-not (Test-Path "package-lock.json")) { return $true }
    if (-not (Test-Path "node_modules\.package-lock.json")) { return $false }
    $committed = $null
    $installed = $null
    try { $committed = (Get-Content "package-lock.json" -Raw | ConvertFrom-Json).lockfileVersion } catch { }
    try { $installed = (Get-Content "node_modules\.package-lock.json" -Raw | ConvertFrom-Json).lockfileVersion } catch { }
    if ($null -eq $committed) { return $true }
    return ($committed -eq $installed)
}

if (Test-DepsSatisfied) {
    Write-Skip "node_modules already matches the lockfile; nothing to install."
} elseif ($DryRun) {
    if (Test-Path "package-lock.json") {
        Write-Host "  [dry-run] would run: npm ci" -ForegroundColor Cyan
    } else {
        Write-Host "  [dry-run] would run: npm install" -ForegroundColor Cyan
    }
} else {
    if (Test-Path "package-lock.json") {
        # Prefer ci for reproducible installs; fall back to install when the
        # lockfile is out of sync with package.json (ci would refuse).
        try {
            npm ci 2>$null
            Write-Ok "dependencies installed via npm ci."
        } catch {
            Write-Warn "npm ci refused (lockfile out of sync); falling back to npm install."
            npm install
            Write-Ok "dependencies installed via npm install."
        }
    } else {
        Write-Warn "no package-lock.json; using npm install (non-reproducible)."
        npm install
        Write-Ok "dependencies installed via npm install."
    }
}

# ---------------------------------------------------------------------------
# [4/5] Theme styles + production build (idempotent)
# ---------------------------------------------------------------------------
Write-Step "4/5" "Compiling theme styles and building the app..."

$lessSrc = "src\styles\theme.less"
$lessOut = "src\styles\theme.css"

if (Test-Path $lessSrc) {
    $themeFresh = $false
    if ((Test-Path $lessOut) -and -not $DryRun) {
        $themeFresh = (Get-Item $lessOut).LastWriteTime -gt (Get-Item $lessSrc).LastWriteTime
    }
    if ($themeFresh) {
        Write-Skip "$lessOut is newer than $lessSrc; theme styles already compiled."
    } else {
        Write-Host "  compiling theme styles (npm run build:less)..."
        # Same pattern as run.ps1: warn and keep going on style errors.
        try {
            Invoke-InstallerStep -CommandLine "npm run build:less" -Action { npm run build:less }
            if (-not $DryRun) { Write-Ok "theme styles compiled." }
        } catch {
            Write-Warn "build:less reported an error; keeping the existing compiled css."
        }
    }
} else {
    Write-Warn "$lessSrc not found; skipping theme compilation."
}

if ($SkipBuild) {
    Write-Skip "-SkipBuild given; skipping vite build."
} elseif ($DryRun) {
    Write-Host "  [dry-run] would run: npm run build" -ForegroundColor Cyan
} else {
    $distIndex = "dist\index.html"
    $distFresh = $false
    if (Test-Path $distIndex) {
        $distTime = (Get-Item $distIndex).LastWriteTime
        $newer = Get-ChildItem "src" -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $_.LastWriteTime -gt $distTime } |
            Select-Object -First 1
        $distFresh = ($null -eq $newer)
    }
    if ($distFresh) {
        Write-Skip "dist/ is up to date; skipping vite build."
    } else {
        Write-Host "  building the app (npm run build)..."
        npm run build
        Write-Ok "production build written to dist/."
    }
}

# ---------------------------------------------------------------------------
# [5/5] Next steps
# ---------------------------------------------------------------------------
Write-Step "5/5" "Done. Next steps:"

@"

  Start the dev server (hot reload):
    npm run dev -- --host 127.0.0.1 --port $Port

  Then open:
    http://127.0.0.1:$Port

  Backend (WordPress/PHP) quick start, if php 8.3+ is installed:
    php -S 127.0.0.1:8080 router.php

  Full local-dev runner (backend + frontend + browser):
    .\run.ps1 -Port $Port

  Re-run this installer any time - steps already satisfied are skipped.

  Zero-storage note: this installer only downloads from npm/github and
  writes local files; it never uploads anything anywhere.
"@

if ($DryRun) {
    Write-Host "[dry-run] no changes were made." -ForegroundColor Cyan
}
