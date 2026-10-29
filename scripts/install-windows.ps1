#!/usr/bin/env pwsh
<#
.SYNOPSIS
    WP Exam - Zero-Dependency One-Liner Windows Installer.

.DESCRIPTION
    1. Downloads pre-packaged standalone release zip (wp-exam-windows-x64.zip)
       containing portable PHP 8.3, pre-compiled frontend, and wp-exam.exe.
    2. Installs into %LOCALAPPDATA%\Programs\wp-exam with safe backup / update.
    3. Creates Desktop Shortcut ("WP Exam.lnk") and Start Menu Shortcut.
    4. Auto-launches wp-exam.exe, running frontend & backend simultaneously,
       and automatically opens Google Chrome in full-screen application mode.

.EXAMPLE
    irm https://raw.githubusercontent.com/alimtvnetwork/wp-exam-v2/main/scripts/install-windows.ps1 | iex
#>

[CmdletBinding()]
param (
    [string]$InstallDir = (Join-Path $env:LOCALAPPDATA "Programs\wp-exam"),
    [switch]$NoLaunch,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  WP Exam & Universal Form Engine - Windows Setup   " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$repoOwner = "alimtvnetwork"
$repoName = "wp-exam-v2"
$zipFileName = "wp-exam-windows-x64.zip"
$shaFileName = "$zipFileName.sha256"

# 1. Resolve Latest Release Asset URL
Write-Host "`n[1/4] Checking latest release from GitHub..." -ForegroundColor Yellow
$downloadUrl = "https://github.com/$repoOwner/$repoName/releases/latest/download/$zipFileName"
$shaUrl = "https://github.com/$repoOwner/$repoName/releases/latest/download/$shaFileName"

try {
    $apiUrl = "https://api.github.com/repos/$repoOwner/$repoName/releases/latest"
    $headers = @{ "User-Agent" = "WPExam-Installer" }
    $releaseJson = Invoke-RestMethod -Uri $apiUrl -Headers $headers -ErrorAction SilentlyContinue

    if ($releaseJson -and $releaseJson.assets) {
        $matchedAsset = $releaseJson.assets | Where-Object { $_.name -eq $zipFileName } | Select-Object -First 1
        if ($matchedAsset) {
            $downloadUrl = $matchedAsset.browser_download_url
        }

        $matchedSha = $releaseJson.assets | Where-Object { $_.name -eq $shaFileName } | Select-Object -First 1
        if ($matchedSha) {
            $shaUrl = $matchedSha.browser_download_url
        }
    }
} catch {
    Write-Host "  Note: Using direct release endpoint fallback." -ForegroundColor DarkGray
}

# 2. Download Release Package to Temporary Storage
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) "wp-exam-setup"
if (-not (Test-Path $tempDir)) {
    New-Item -Path $tempDir -ItemType Directory -Force | Out-Null
}

$tempZip = Join-Path $tempDir $zipFileName
$tempSha = Join-Path $tempDir $shaFileName

Write-Host "[2/4] Downloading $zipFileName..." -ForegroundColor Yellow
Write-Host "  Source: $downloadUrl" -ForegroundColor DarkGray

Invoke-WebRequest -Uri $downloadUrl -OutFile $tempZip -UseBasicParsing

# Optional SHA256 checksum verification
try {
    Invoke-WebRequest -Uri $shaUrl -OutFile $tempSha -UseBasicParsing -ErrorAction SilentlyContinue
    if (Test-Path $tempSha) {
        $expectedSha = (Get-Content $tempSha -Raw).Trim().Split(" ")[0]
        $computedSha = (Get-FileHash -Path $tempZip -Algorithm SHA256).Hash
        if ($expectedSha -and ($expectedSha.ToLower() -eq $computedSha.ToLower())) {
            Write-Host "  [OK] SHA256 verification passed: $computedSha" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "  Checksum verification skipped (direct release package)." -ForegroundColor DarkGray
}

# 3. Extract and Perform Safe Non-Destructive Update
Write-Host "[3/4] Installing application into $InstallDir..." -ForegroundColor Yellow

if (-not (Test-Path $InstallDir)) {
    New-Item -Path $InstallDir -ItemType Directory -Force | Out-Null
} else {
    $backupFolder = Join-Path $tempDir "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item -Path $InstallDir -Destination $backupFolder -Recurse -Force -ErrorAction SilentlyContinue
}

Expand-Archive -Path $tempZip -DestinationPath $InstallDir -Force

# Copy App Icon from assets or public if not at root
$iconSource = Join-Path $InstallDir "public\favicon.ico"
$iconDest = Join-Path $InstallDir "wp-exam.ico"
if ((Test-Path $iconSource) -and (-not (Test-Path $iconDest))) {
    Copy-Item -Path $iconSource -Destination $iconDest -Force
}

# 4. Create Desktop & Start Menu Shortcuts
Write-Host "[4/4] Creating Desktop shortcut..." -ForegroundColor Yellow
$exePath = Join-Path $InstallDir "wp-exam.exe"

$wshShell = New-Object -ComObject WScript.Shell
$desktopPath = [Environment]::GetFolderPath('Desktop')
$desktopShortcut = $wshShell.CreateShortcut((Join-Path $desktopPath "WP Exam.lnk"))
$desktopShortcut.TargetPath = $exePath
$desktopShortcut.WorkingDirectory = $InstallDir
if (Test-Path $iconDest) {
    $desktopShortcut.IconLocation = "$iconDest,0"
} elseif (Test-Path $iconSource) {
    $desktopShortcut.IconLocation = "$iconSource,0"
}
$desktopShortcut.Description = "WP Exam - Modern Quiz and Universal Form Engine"
$desktopShortcut.Save()

# Start Menu Shortcut
$startMenuDir = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs"
if (Test-Path $startMenuDir) {
    $startShortcut = $wshShell.CreateShortcut((Join-Path $startMenuDir "WP Exam.lnk"))
    $startShortcut.TargetPath = $exePath
    $startShortcut.WorkingDirectory = $InstallDir
    if (Test-Path $iconDest) {
        $startShortcut.IconLocation = "$iconDest,0"
    }
    $startShortcut.Description = "WP Exam - Modern Quiz and Universal Form Engine"
    $startShortcut.Save()
}

Write-Host "`n====================================================" -ForegroundColor Green
Write-Host "  Installation Completed Successfully!              " -ForegroundColor Green
Write-Host "  Desktop Icon : $desktopPath\WP Exam.lnk           " -ForegroundColor Cyan
Write-Host "  App Location : $InstallDir                        " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Green

# Cleanup temporary archive
Remove-Item -Path $tempZip -Force -ErrorAction SilentlyContinue
Remove-Item -Path $tempSha -Force -ErrorAction SilentlyContinue

# Auto-launch application
if (-not $NoLaunch) {
    if (Test-Path $exePath) {
        Write-Host "`nLaunching WP Exam and opening Google Chrome in full-screen..." -ForegroundColor Green
        Start-Process -FilePath $exePath -WorkingDirectory $InstallDir
    }
}
