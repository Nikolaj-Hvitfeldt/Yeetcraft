# Validates companion v1 WP3 schemas and examples (extends WP2 request coverage).
# Pinned validator: ajv-cli@5.0.0 (ajv@8.17.1). No repo runtime dependency.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$RequestSchema = Join-Path $Root "schema\ingest-batch-request.schema.json"
$ResponseSchema = Join-Path $Root "schema\ingest-batch-response.schema.json"
$ErrorSchema = Join-Path $Root "schema\error.schema.json"
$RequestExamples = Join-Path $Root "examples\request"
$RequestInvalid = Join-Path $RequestExamples "invalid"
$ResponseExamples = Join-Path $Root "examples\response"
$ErrorExamples = Join-Path $Root "examples\error"

Write-Host "Validator: ajv-cli@5.0.0 (ajv@8.17.1 via npx)"
$Spec = "--spec=draft2020"

function Invoke-Ajv {
    param(
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )
    & npx --yes ajv-cli@5.0.0 @Arguments
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "`n[1/6] Meta-validate schemas (draft 2020-12)..."
foreach ($schema in @($RequestSchema, $ResponseSchema, $ErrorSchema)) {
    Write-Host "  compile: $(Split-Path -Leaf $schema)"
    Invoke-Ajv @("compile", $Spec, "-s", $schema)
}

Write-Host "`n[2/6] Validate positive request examples..."
Get-ChildItem -Path $RequestExamples -Filter "*.json" | ForEach-Object {
    Write-Host "  request: $($_.Name)"
    Invoke-Ajv @("test", $Spec, "-s", $RequestSchema, "-d", $_.FullName, "--valid")
}

Write-Host "`n[3/6] Validate positive response examples (HTTP 200)..."
@(
    "all-accepted.json",
    "mixed-duplicate-needs-review.json",
    "unknown-character.json"
) | ForEach-Object {
    $path = Join-Path $ResponseExamples $_
    Write-Host "  response: $_"
    Invoke-Ajv @("test", $Spec, "-s", $ResponseSchema, "-d", $path, "--valid")
}

Write-Host "`n[4/6] Validate error envelope examples..."
Get-ChildItem -Path $ErrorExamples -Filter "*.json" | ForEach-Object {
    Write-Host "  error: $($_.Name)"
    Invoke-Ajv @("test", $Spec, "-s", $ErrorSchema, "-d", $_.FullName, "--valid")
}
$unsupportedVersion = Join-Path $ResponseExamples "unsupported-version.json"
Write-Host "  response error: unsupported-version.json"
Invoke-Ajv @("test", $Spec, "-s", $ErrorSchema, "-d", $unsupportedVersion, "--valid")

Write-Host "`n[5/6] Reject schema-invalid request fixtures..."
@(
    "category-yeet.json",
    "extra-envelope-field.json",
    "spell-without-spell-id.json",
    "invalid-instant-precision.json"
) | ForEach-Object {
    $path = Join-Path $RequestInvalid $_
    Write-Host "  invalid request: $_"
    Invoke-Ajv @("test", $Spec, "-s", $RequestSchema, "-d", $path, "--invalid")
}

Write-Host "`n[6/6] Documented non-JSON invalid_json fixture..."
$invalidJson = Join-Path $ErrorExamples "invalid-json.txt"
if (-not (Test-Path $invalidJson)) {
    Write-Error "Missing invalid-json.txt fixture"
}
try {
    Get-Content -Raw $invalidJson | ConvertFrom-Json | Out-Null
    Write-Error "invalid-json.txt must not parse as JSON"
} catch {
    Write-Host "  invalid-json.txt is not valid JSON (expected)"
}

Write-Host "`nWP3 contract validation passed."
