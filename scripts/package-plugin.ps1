#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Packages WP Exam and WP Sam plugins into installable zip archives.
#>

[CmdletBinding()]
param (
    [string]$OutputDir = "dist"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

$DistPath = Join-Path $RepoRoot $OutputDir
if (-not (Test-Path $DistPath)) {
    New-Item -ItemType Directory -Path $DistPath -Force | Out-Null
}

$Plugins = @("wp-exam", "wp-sam")

foreach ($Plugin in $Plugins) {
    $SourcePath = Join-Path $RepoRoot "wp-plugins\$Plugin"
    $ZipPath = Join-Path $DistPath "$Plugin.zip"

    if (Test-Path $SourcePath) {
        if (Test-Path $ZipPath) {
            Remove-Item $ZipPath -Force
        }
        Write-Host "Packaging $Plugin from $SourcePath -> $ZipPath..." -ForegroundColor Cyan
        Compress-Archive -Path "$SourcePath\*" -DestinationPath $ZipPath -CompressionLevel Optimal
        $ZipSize = (Get-Item $ZipPath).Length / 1KB
        Write-Host "  [OK] Created $Plugin.zip ($([math]::Round($ZipSize, 2)) KB)" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Source directory missing: $SourcePath" -ForegroundColor Red
    }
}

Write-Host "`nPlugin packaging completed successfully!" -ForegroundColor Green
