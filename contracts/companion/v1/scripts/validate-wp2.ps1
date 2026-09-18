# Validates companion v1 WP2 request schema and examples.
# Pinned validator: ajv-cli@5.0.0 (ajv@8.17.1). No repo runtime dependency.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Schema = Join-Path $Root "schema\ingest-batch-request.schema.json"
$RequestExamples = Join-Path $Root "examples\request"
$InvalidExamples = Join-Path $RequestExamples "invalid"

Write-Host "Validator: ajv-cli@5.0.0 (ajv@8.17.1 via npx)"
Write-Host "Schema: $Schema"

$Spec = "--spec=draft2020"

Write-Host "`n[1/3] Compile schema (draft 2020-12 meta-validation)..."
npx --yes ajv-cli@5.0.0 compile $Spec -s $Schema
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n[2/3] Validate positive request examples..."
Get-ChildItem -Path $RequestExamples -Filter "*.json" | ForEach-Object {
    Write-Host "  valid: $($_.Name)"
    npx --yes ajv-cli@5.0.0 test $Spec -s $Schema -d $_.FullName --valid
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "`n[3/3] Reject schema-invalid fixtures..."
@(
    "category-yeet.json",
    "extra-envelope-field.json",
    "spell-without-spell-id.json",
    "invalid-instant-precision.json"
) | ForEach-Object {
    $path = Join-Path $InvalidExamples $_
    Write-Host "  invalid: $_"
    npx --yes ajv-cli@5.0.0 test $Spec -s $Schema -d $path --invalid
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "`nWP2 contract validation passed."
