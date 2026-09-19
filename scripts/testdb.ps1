#Requires -Version 5.1
<#
.SYNOPSIS
  Start/stop local testdb Postgres and run testdb / integration commands.

.EXAMPLE
  .\scripts\testdb.ps1 up
  .\scripts\testdb.ps1 prepare
  .\scripts\testdb.ps1 integration
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet('up', 'down', 'destroy', 'logs', 'prepare', 'seed', 'reset', 'verify', 'integration', 'env')]
    [string]$Command = 'up'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot
. (Join-Path $PSScriptRoot 'testdb-env.ps1')

function Invoke-Compose {
    param([Parameter(Mandatory = $true)][string[]]$ComposeArgs)
    $dockerArgs = @('compose') + $ComposeArgs
    & docker @dockerArgs
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose failed with exit code $LASTEXITCODE"
    }
}

function Invoke-Testdb {
    param([Parameter(Mandatory = $true)][string]$Subcommand)
    Push-Location (Join-Path $RepoRoot 'backend')
    try {
        & go run ./cmd/testdb $Subcommand
        if ($LASTEXITCODE -ne 0) {
            throw "testdb $Subcommand failed with exit code $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}

switch ($Command) {
    'up' {
        Invoke-Compose -ComposeArgs @('up', '-d', '--wait')
        Write-Host "testdb listening at $env:TEST_DATABASE_URL"
    }
    'down' { Invoke-Compose -ComposeArgs @('down') }
    'destroy' { Invoke-Compose -ComposeArgs @('down', '-v') }
    'logs' {
        $dockerArgs = @('compose', 'logs', '-f', 'testdb')
        & docker @dockerArgs
    }
    'prepare' {
        Invoke-Compose -ComposeArgs @('up', '-d', '--wait')
        Invoke-Testdb prepare
    }
    'seed' { Invoke-Testdb seed }
    'reset' { Invoke-Testdb reset }
    'verify' { Invoke-Testdb verify }
    'integration' {
        Invoke-Compose -ComposeArgs @('up', '-d', '--wait')
        Push-Location (Join-Path $RepoRoot 'backend')
        try {
            & go test ./internal/repository -tags=integration
            if ($LASTEXITCODE -ne 0) {
                throw "integration tests failed with exit code $LASTEXITCODE"
            }
        }
        finally {
            Pop-Location
        }
    }
    'env' {
        Write-Host "YEETCRAFT_TEST_MODE=$($env:YEETCRAFT_TEST_MODE)"
        Write-Host "TEST_DATABASE_URL=$($env:TEST_DATABASE_URL)"
        Write-Host 'These apply inside this script. For Playwright in the same shell, run:'
        Write-Host '  . .\scripts\testdb-env.ps1'
        Write-Host '  $env:API_KEY = ''e2e-test-token'''
        Write-Host '  $env:E2E_WRITE_TOKEN = ''e2e-test-token'''
    }
}
