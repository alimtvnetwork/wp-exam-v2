#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Remote Publishing & Automated Deployment Script for WP Exam Laravel & Web Application.
    Supports SSH archive extraction, rsync synchronization, and Git remote pull methods.

.DESCRIPTION
    Deploys the Laravel application and compiled frontend assets to a remote server.
    Loads configurations from deploy.json (or environment variables) if available,
    packages production assets excluding dev files, and runs post-deployment optimizations.

.EXAMPLE
    # Deploy using deploy.json configuration:
    .\scripts\publish-remote.ps1

    # Deploy to staging environment:
    .\scripts\publish-remote.ps1 -Environment staging

    # Deploy with explicit parameters:
    .\scripts\publish-remote.ps1 -ServerHost "192.168.1.100" -User "deploy" -RemotePath "/var/www/wp-exam"

    # Preview deployment without transferring files (dry-run):
    .\scripts\publish-remote.ps1 -DryRun
#>

[CmdletBinding()]
param (
    [string]$ServerHost = "",
    [string]$User = "",
    [int]$Port = 22,
    [string]$RemotePath = "",
    [string]$KeyPath = "",
    [ValidateSet('archive-ssh', 'rsync', 'git-pull')]
    [string]$Method = "archive-ssh",
    [string]$Environment = "production",
    [string]$ConfigFile = "deploy.json",
    [switch]$BuildFrontend,
    [switch]$SkipOptimizations,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  WP Exam - Remote Laravel Publishing Automation" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Load configuration from deploy.json if present
$ConfigFullPath = Join-Path $RepoRoot $ConfigFile
$hasConfigFile = Test-Path $ConfigFullPath

if ($hasConfigFile) {
    Write-Host "[1/5] Loading deployment settings from $ConfigFile ($Environment)..." -ForegroundColor Yellow
    try {
        $jsonRaw = Get-Content -Path $ConfigFullPath -Raw
        $configObj = ConvertFrom-Json $jsonRaw
        $envConfig = $configObj.environments.$Environment

        $hasEnvConfig = ($null -ne $envConfig)

        if ($hasEnvConfig) {
            $isHostEmpty = [string]::IsNullOrWhiteSpace($ServerHost)

            if ($isHostEmpty) {
                $ServerHost = $envConfig.host
            }

            $isUserEmpty = [string]::IsNullOrWhiteSpace($User)

            if ($isUserEmpty) {
                $User = $envConfig.user
            }

            $hasPortSetting = ($null -ne $envConfig.port)

            if ($hasPortSetting) {
                $Port = [int]$envConfig.port
            }

            $isPathEmpty = [string]::IsNullOrWhiteSpace($RemotePath)

            if ($isPathEmpty) {
                $RemotePath = $envConfig.remotePath
            }

            $isKeyEmpty = [string]::IsNullOrWhiteSpace($KeyPath)

            if ($isKeyEmpty) {
                $KeyPath = $envConfig.keyPath
            }

            $isMethodDefault = ($Method -eq "archive-ssh")
            $hasConfigMethod = ($null -ne $envConfig.method)

            if ($isMethodDefault) {
                if ($hasConfigMethod) {
                    $Method = $envConfig.method
                }
            }

            $hasBuildFlag = ($null -ne $envConfig.buildFrontend)

            if ($hasBuildFlag) {
                $isBuildActive = [bool]$envConfig.buildFrontend

                if ($isBuildActive) {
                    $BuildFrontend = $true
                }
            }

            $hasSkipFlag = ($null -ne $envConfig.skipOptimizations)

            if ($hasSkipFlag) {
                $isSkipActive = [bool]$envConfig.skipOptimizations

                if ($isSkipActive) {
                    $SkipOptimizations = $true
                }
            }
        }
    } catch {
        Write-Host "  [WARN] Failed to parse $ConfigFile. Falling back to parameters." -ForegroundColor DarkYellow
    }
}

# Fallback to Environment Variables
$isHostStillEmpty = [string]::IsNullOrWhiteSpace($ServerHost)

if ($isHostStillEmpty) {
    $envHost = $env:DEPLOY_HOST
    $hasEnvHost = (-not [string]::IsNullOrWhiteSpace($envHost))

    if ($hasEnvHost) {
        $ServerHost = $envHost
    }
}

$isUserStillEmpty = [string]::IsNullOrWhiteSpace($User)

if ($isUserStillEmpty) {
    $envUser = $env:DEPLOY_USER
    $hasEnvUser = (-not [string]::IsNullOrWhiteSpace($envUser))

    if ($hasEnvUser) {
        $User = $envUser
    }
}

$isPathStillEmpty = [string]::IsNullOrWhiteSpace($RemotePath)

if ($isPathStillEmpty) {
    $envPath = $env:DEPLOY_PATH
    $hasEnvPath = (-not [string]::IsNullOrWhiteSpace($envPath))

    if ($hasEnvPath) {
        $RemotePath = $envPath
    }
}

# 2. Validate Target Server Configuration
$isDryRun = [bool]$DryRun
$isMissingHost = [string]::IsNullOrWhiteSpace($ServerHost)
$isMissingUser = [string]::IsNullOrWhiteSpace($User)
$isMissingPath = [string]::IsNullOrWhiteSpace($RemotePath)

if ($isMissingHost) {
    Write-Host "`n[ERROR] Remote server host is not specified." -ForegroundColor Red
    Write-Host "Please pass -ServerHost or create deploy.json using deploy.example.json as a template." -ForegroundColor Yellow
    exit 1
}

if ($isMissingUser) {
    Write-Host "`n[ERROR] Remote user is not specified." -ForegroundColor Red
    Write-Host "Please pass -User or specify 'user' in deploy.json." -ForegroundColor Yellow
    exit 1
}

if ($isMissingPath) {
    Write-Host "`n[ERROR] Remote destination path is not specified." -ForegroundColor Red
    Write-Host "Please pass -RemotePath or specify 'remotePath' in deploy.json." -ForegroundColor Yellow
    exit 1
}

Write-Host "  Target Environment: $Environment" -ForegroundColor Green
Write-Host "  Destination:        $User@${ServerHost}:${RemotePath} (Port $Port)" -ForegroundColor Green
Write-Host "  Publish Method:     $Method" -ForegroundColor Green

if ($isDryRun) {
    Write-Host "  Mode:               DRY RUN (Previewing only, no changes applied)" -ForegroundColor Magenta
}

# 3. Compile Frontend Assets (Vite)
Write-Host "`n[2/5] Checking frontend production build..." -ForegroundColor Yellow
$distPath = Join-Path $RepoRoot "dist"
$hasDist = Test-Path $distPath
$needsBuild = ($BuildFrontend -or -not $hasDist)

if ($needsBuild) {
    if ($isDryRun) {
        Write-Host "  [DRY-RUN] Would run: npm run build" -ForegroundColor Cyan
    } else {
        Write-Host "  Compiling frontend with Vite (npm run build)..." -ForegroundColor Cyan
        npm run build
        Write-Host "  [OK] Frontend assets built into dist/" -ForegroundColor Green
    }
} else {
    Write-Host "  [OK] Using existing dist/ assets." -ForegroundColor Green
}

# 4. Packaging or Synchronization
Write-Host "`n[3/5] Preparing deployment payload..." -ForegroundColor Yellow

$itemsToInclude = @(
    "app",
    "bootstrap",
    "config",
    "database",
    "dist",
    "includes",
    "public",
    "resources",
    "routes",
    "src",
    "vendor",
    "artisan",
    "composer.json",
    "package.json",
    "router.php",
    "index.php",
    "README.md"
)

$existingItems = @()

foreach ($item in $itemsToInclude) {
    $fullItemPath = Join-Path $RepoRoot $item
    $hasItem = Test-Path $fullItemPath

    if ($hasItem) {
        $existingItems += $item
    }
}

Write-Host "  Payload components: $($existingItems.Count) directories and files" -ForegroundColor Cyan

# Prepare SSH / SCP Key Arguments
$keyArgSsh = ""
$keyArgScp = ""
$hasKeyPath = (-not [string]::IsNullOrWhiteSpace($KeyPath))

if ($hasKeyPath) {
    $keyArgSsh = "-i `"$KeyPath`""
    $keyArgScp = "-i `"$KeyPath`""
}

# Execute Publish Strategy
$isArchiveMethod = ($Method -eq "archive-ssh")
$isRsyncMethod = ($Method -eq "rsync")
$isGitMethod = ($Method -eq "git-pull")

if ($isArchiveMethod) {
    $timestamp = (Get-Date).ToString("yyyyMMddHHmmss")
    $zipFileName = "deploy-package-$timestamp.zip"
    $localZipPath = Join-Path $RepoRoot $zipFileName
    $remoteZipPath = "/tmp/$zipFileName"

    if ($isDryRun) {
        Write-Host "  [DRY-RUN] Would create archive: $zipFileName" -ForegroundColor Cyan
        Write-Host "  [DRY-RUN] Would upload via SCP: scp -P $Port $keyArgScp $localZipPath $User@${ServerHost}:$remoteZipPath" -ForegroundColor Cyan
        Write-Host "  [DRY-RUN] Would extract via SSH to: $RemotePath" -ForegroundColor Cyan
    } else {
        Write-Host "`n[4/5] Creating deployment archive ($zipFileName)..." -ForegroundColor Yellow
        $sourcePaths = $existingItems | ForEach-Object { Join-Path $RepoRoot $_ }
        Compress-Archive -Path $sourcePaths -DestinationPath $localZipPath -Force
        $zipSize = (Get-Item $localZipPath).Length / 1MB
        Write-Host "  [OK] Created $zipFileName ($([Math]::Round($zipSize, 2)) MB)" -ForegroundColor Green

        Write-Host "`n[5/5] Transferring package to remote server..." -ForegroundColor Yellow
        $scpCmd = "scp -P $Port $keyArgScp `"$localZipPath`" `"${User}@${ServerHost}:${remoteZipPath}`""
        Write-Host "  Running: $scpCmd" -ForegroundColor Cyan
        Invoke-Expression $scpCmd

        Write-Host "  Extracting on remote server..." -ForegroundColor Cyan
        $remoteExtractScript = "mkdir -p '$RemotePath' && unzip -o -q '$remoteZipPath' -d '$RemotePath' && rm -f '$remoteZipPath' && mkdir -p '$RemotePath/storage/framework/cache' '$RemotePath/storage/framework/sessions' '$RemotePath/storage/framework/views' '$RemotePath/storage/logs' '$RemotePath/bootstrap/cache' && chmod -R 775 '$RemotePath/storage' '$RemotePath/bootstrap/cache'"
        $sshExtractCmd = "ssh -p $Port $keyArgSsh `${User}@${ServerHost} `"$remoteExtractScript`""
        Invoke-Expression $sshExtractCmd

        # Remote Optimizations
        if (-not $SkipOptimizations) {
            Write-Host "  Running Laravel remote optimizations..." -ForegroundColor Cyan
            $remoteOptScript = "cd '$RemotePath' && php artisan route:list || true"
            $sshOptCmd = "ssh -p $Port $keyArgSsh `${User}@${ServerHost} `"$remoteOptScript`""
            Invoke-Expression $sshOptCmd
        }

        # Cleanup local zip
        Remove-Item -Path $localZipPath -Force -ErrorAction SilentlyContinue
    }
}

if ($isRsyncMethod) {
    if ($isDryRun) {
        Write-Host "  [DRY-RUN] Would run rsync to $User@${ServerHost}:${RemotePath}" -ForegroundColor Cyan
    } else {
        Write-Host "`n[4/5] Synchronizing files via rsync..." -ForegroundColor Yellow
        $distignoreFile = Join-Path $RepoRoot ".distignore"
        $hasDistignore = Test-Path $distignoreFile
        $excludeArg = ""

        if ($hasDistignore) {
            $excludeArg = "--exclude-from=`"$distignoreFile`""
        }

        $sshRsyncArg = "-e `"ssh -p $Port $keyArgSsh`""
        $rsyncCmd = "rsync -avz --delete $excludeArg $sshRsyncArg `"$RepoRoot/`" `"${User}@${ServerHost}:${RemotePath}/`""
        Write-Host "  Running: $rsyncCmd" -ForegroundColor Cyan
        Invoke-Expression $rsyncCmd
    }
}

if ($isGitMethod) {
    if ($isDryRun) {
        Write-Host "  [DRY-RUN] Would execute git pull and composer install on $ServerHost" -ForegroundColor Cyan
    } else {
        Write-Host "`n[4/5] Updating remote server via git pull..." -ForegroundColor Yellow
        $gitScript = "cd '$RemotePath' && git fetch --all && git pull && composer install --no-dev --optimize-autoloader"
        $sshGitCmd = "ssh -p $Port $keyArgSsh `${User}@${ServerHost} `"$gitScript`""
        Write-Host "  Running: $sshGitCmd" -ForegroundColor Cyan
        Invoke-Expression $sshGitCmd
    }
}

Write-Host "`n====================================================" -ForegroundColor Green
Write-Host "  [SUCCESS] Deployment completed successfully!" -ForegroundColor Green
Write-Host "  Server:   $ServerHost" -ForegroundColor Green
Write-Host "  Path:     $RemotePath" -ForegroundColor Green
Write-Host "  Time:     $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
