# Phase 1 Validate gate for companion v1 (Markdown + JSON only).
# Pinned validator: ajv-cli@5.0.0 (ajv@8.17.1). No repo runtime dependency.
param(
    [switch]$WriteChecksums
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$RepoRoot = Resolve-Path (Join-Path $Root "..\..\..")
$RequestSchema = Join-Path $Root "schema\ingest-batch-request.schema.json"
$ResponseSchema = Join-Path $Root "schema\ingest-batch-response.schema.json"
$ErrorSchema = Join-Path $Root "schema\error.schema.json"
$RequestExamples = Join-Path $Root "examples\request"
$RequestInvalid = Join-Path $RequestExamples "invalid"
$ResponseExamples = Join-Path $Root "examples\response"
$ErrorExamples = Join-Path $Root "examples\error"
$ChecksumPath = Join-Path $Root "CHECKSUMS.sha256"
$Failures = [System.Collections.Generic.List[string]]::new()

$AjvCli = "ajv-cli@5.0.0"
$AjvLibNote = "ajv@8.17.1 (bundled with ajv-cli@5.0.0)"
Write-Host "Validator: $AjvCli ($AjvLibNote via npx --yes)"
$Spec = "--spec=draft2020"

$SchemaInvalidRequests = @(
    "category-yeet.json",
    "extra-envelope-field.json",
    "spell-without-spell-id.json",
    "invalid-instant-precision.json",
    "empty-events.json",
    "invalid-batch-id.json",
    "invalid-character-guid.json",
    "invalid-ordinal.json",
    "invalid-encounter.json",
    "too-many-causes.json",
    "extra-cause-field.json",
    "schema-version-mismatch.json"
)

$SemanticSchemaValidRequests = @(
    "cause-rank-gap.json",
    "cause-rank-duplicate.json",
    "client-run-id-hash-mismatch.json",
    "client-event-id-hash-mismatch.json",
    "death-before-run-start.json"
)

$EnvelopeCodes = @(
    "invalid_json",
    "missing_api_key",
    "invalid_api_key",
    "batch_conflict",
    "event_id_conflict",
    "payload_too_large",
    "unsupported_media_type",
    "unsupported_content_encoding",
    "schema_validation_failed",
    "schema_version_mismatch",
    "empty_events",
    "batch_size_exceeded",
    "json_depth_exceeded",
    "trailing_json_not_allowed",
    "invalid_batch_id",
    "rate_limit_exceeded",
    "companion_api_unconfigured",
    "ingest_temporarily_unavailable"
)

function Invoke-Ajv {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)
    & npx --yes $AjvCli @Arguments
    if ($LASTEXITCODE -ne 0) {
        $Failures.Add("ajv failed: $($Arguments -join ' ')") | Out-Null
        exit $LASTEXITCODE
    }
}

function Encode-HashField([string]$Value) {
    $normalized = $Value.Normalize([Text.NormalizationForm]::FormC)
    $bytes = [Text.Encoding]::UTF8.GetBytes($normalized)
    $len = [BitConverter]::GetBytes([uint32]$bytes.Length)
    if ([BitConverter]::IsLittleEndian) { [Array]::Reverse($len) }
    return , ($len + $bytes)
}

function Get-ContractDigest([string[]]$Fields) {
    $ms = New-Object System.IO.MemoryStream
    foreach ($field in $Fields) {
        $chunk = Encode-HashField $field
        $ms.Write($chunk, 0, $chunk.Length)
    }
    $sha = [Security.Cryptography.SHA256]::Create()
    $digest = $sha.ComputeHash($ms.ToArray())
    return ("sha256:" + [BitConverter]::ToString($digest).Replace("-", "").ToLowerInvariant())
}

function Get-ExpectedRunId($Run) {
    return Get-ContractDigest @(
        "yeetcraft-run-v1",
        [string]$Run.challengeModeStartInstant,
        [string]$Run.challengeMapId,
        [string]$Run.keystoneLevel
    )
}

function Get-ExpectedEventId($Event) {
    return Get-ContractDigest @(
        "yeetcraft-death-v1",
        [string]$Event.run.clientRunId,
        [string]$Event.characterGuid,
        [string]$Event.deathInstant,
        [string]$Event.ordinal
    )
}

function Test-JsonParse([string]$Path) {
    $raw = Get-Content -Raw -LiteralPath $Path
    $null = $raw | ConvertFrom-Json
}

function Get-HeadingSlugs([string]$MarkdownPath) {
    $counts = @{}
    $slugs = New-Object "System.Collections.Generic.HashSet[string]"
    Get-Content -LiteralPath $MarkdownPath | ForEach-Object {
        if ($_ -notmatch '^(#{1,6})\s+(.+)$') { return }
        $text = $Matches[2].Trim()
        $text = $text -replace '`', ''
        $text = $text -replace '\*\*', ''
        $text = $text.ToLowerInvariant()
        $text = [regex]::Replace($text, '[^\p{L}\p{N} \-]', '')
        $text = [regex]::Replace($text, '\s+', '-')
        $text = $text.Trim('-')
        if (-not $counts.ContainsKey($text)) { $counts[$text] = 0 }
        else {
            $counts[$text]++
            $text = "$text-$($counts[$text])"
        }
        [void]$slugs.Add($text)
    }
    return $slugs
}

function Test-RelativeMarkdownLinks([string]$MarkdownPath) {
    $dir = Split-Path -Parent $MarkdownPath
    $content = Get-Content -Raw -LiteralPath $MarkdownPath
    $rx = [regex]'\[(?:[^\]]+)\]\(([^)]+)\)'
    foreach ($match in $rx.Matches($content)) {
        $href = $match.Groups[1].Value.Trim()
        if ($href -match '^(https?:|mailto:|#)') {
            if ($href.StartsWith("#")) {
                $slugs = Get-HeadingSlugs $MarkdownPath
                $frag = $href.Substring(1)
                if (-not $slugs.Contains($frag)) {
                    $Failures.Add("$MarkdownPath fragment not found: $href") | Out-Null
                }
            }
            continue
        }
        $pathPart = $href
        $frag = $null
        if ($href.Contains("#")) {
            $split = $href.Split("#", 2)
            $pathPart = $split[0]
            $frag = $split[1]
        }
        if ([string]::IsNullOrWhiteSpace($pathPart)) { continue }
        $resolved = [IO.Path]::GetFullPath((Join-Path $dir ($pathPart -replace '/', [IO.Path]::DirectorySeparatorChar)))
        if (-not (Test-Path -LiteralPath $resolved)) {
            $Failures.Add("$MarkdownPath broken link: $href") | Out-Null
            continue
        }
        if ($frag -and $resolved.ToLowerInvariant().EndsWith(".md")) {
            $slugs = Get-HeadingSlugs $resolved
            if (-not $slugs.Contains($frag)) {
                $Failures.Add("$MarkdownPath fragment not found: $href") | Out-Null
            }
        }
    }
}

Write-Host "`n[1/10] JSON parse schemas and examples..."
Get-ChildItem -Path (Join-Path $Root "schema") -Filter "*.json" | ForEach-Object {
    Write-Host "  parse schema: $($_.Name)"
    Test-JsonParse $_.FullName
}
Get-ChildItem -Path $RequestExamples, $ResponseExamples, $ErrorExamples -Filter "*.json" -Recurse | ForEach-Object {
    Write-Host "  parse example: $($_.Name)"
    Test-JsonParse $_.FullName
}

Write-Host "`n[2/10] Meta-validate schemas (draft 2020-12)..."
foreach ($schema in @($RequestSchema, $ResponseSchema, $ErrorSchema)) {
    Write-Host "  compile: $(Split-Path -Leaf $schema)"
    Invoke-Ajv @("compile", $Spec, "-s", $schema)
}

Write-Host "`n[3/10] Positive request examples (schema + ID recipes)..."
Get-ChildItem -Path $RequestExamples -Filter "*.json" | ForEach-Object {
    Write-Host "  request: $($_.Name)"
    Invoke-Ajv @("test", $Spec, "-s", $RequestSchema, "-d", $_.FullName, "--valid")
    $payload = Get-Content -Raw $_.FullName | ConvertFrom-Json
    if ($payload.PSObject.Properties.Name -contains '$comment' -or $payload.PSObject.Properties.Name -contains 'Status') {
        $Failures.Add("$($_.Name) has a non-contract banner field") | Out-Null
    }
    foreach ($event in $payload.events) {
        $expectedRun = Get-ExpectedRunId $event.run
        if ($event.run.clientRunId -ne $expectedRun) {
            $Failures.Add("$($_.Name) clientRunId mismatch: got $($event.run.clientRunId) expected $expectedRun") | Out-Null
        }
        $expectedEvent = Get-ExpectedEventId $event
        if ($event.clientEventId -ne $expectedEvent) {
            $Failures.Add("$($_.Name) clientEventId mismatch: got $($event.clientEventId) expected $expectedEvent") | Out-Null
        }
        if ($event.deathInstant -lt $event.run.challengeModeStartInstant) {
            $Failures.Add("$($_.Name) deathInstant precedes run start") | Out-Null
        }
    }
}

Write-Host "`n[4/10] HTTP 200 response examples..."
Get-ChildItem -Path $ResponseExamples -Filter "*.json" | ForEach-Object {
    if ($_.Name -eq "unsupported-version.json") { return }
    Write-Host "  response: $($_.Name)"
    Invoke-Ajv @("test", $Spec, "-s", $ResponseSchema, "-d", $_.FullName, "--valid")
    $payload = Get-Content -Raw $_.FullName | ConvertFrom-Json
    if ($payload.PSObject.Properties.Name -contains '$comment' -or $payload.PSObject.Properties.Name -contains 'Status') {
        $Failures.Add("$($_.Name) has a non-contract banner field") | Out-Null
    }
}

Write-Host "`n[5/10] Error envelope examples..."
Get-ChildItem -Path $ErrorExamples -Filter "*.json" | ForEach-Object {
    Write-Host "  error: $($_.Name)"
    Invoke-Ajv @("test", $Spec, "-s", $ErrorSchema, "-d", $_.FullName, "--valid")
}
$unsupportedVersion = Join-Path $ResponseExamples "unsupported-version.json"
Write-Host "  response error: unsupported-version.json"
Invoke-Ajv @("test", $Spec, "-s", $ErrorSchema, "-d", $unsupportedVersion, "--valid")

Write-Host "`n[6/10] Schema-invalid request fixtures..."
foreach ($name in $SchemaInvalidRequests) {
    $path = Join-Path $RequestInvalid $name
    if (-not (Test-Path $path)) {
        $Failures.Add("missing schema-invalid fixture: $name") | Out-Null
        continue
    }
    Write-Host "  invalid request: $name"
    Invoke-Ajv @("test", $Spec, "-s", $RequestSchema, "-d", $path, "--invalid")
}

Write-Host "`n[7/10] Semantic (schema-valid) negative request fixtures..."
foreach ($name in $SemanticSchemaValidRequests) {
    $path = Join-Path $RequestInvalid $name
    Write-Host "  semantic request: $name"
    Invoke-Ajv @("test", $Spec, "-s", $RequestSchema, "-d", $path, "--valid")
    $payload = Get-Content -Raw $path | ConvertFrom-Json
    $event = $payload.events[0]
    $expectedRun = Get-ExpectedRunId $event.run
    $expectedEvent = Get-ExpectedEventId $event
    switch ($name) {
        "client-run-id-hash-mismatch.json" {
            if ($event.run.clientRunId -eq $expectedRun) {
                $Failures.Add("$name must not match the run hash recipe") | Out-Null
            }
        }
        "client-event-id-hash-mismatch.json" {
            if ($event.clientEventId -eq $expectedEvent) {
                $Failures.Add("$name must not match the event hash recipe") | Out-Null
            }
        }
        "death-before-run-start.json" {
            if ($event.run.clientRunId -ne $expectedRun -or $event.clientEventId -ne $expectedEvent) {
                $Failures.Add("$name IDs must match recipes; only instant order is invalid") | Out-Null
            }
            if ($event.deathInstant -ge $event.run.challengeModeStartInstant) {
                $Failures.Add("$name deathInstant must precede run start") | Out-Null
            }
        }
        "cause-rank-gap.json" {
            $ranks = @($event.causes | ForEach-Object { $_.rank }) | Sort-Object
            if ($ranks.Count -lt 2 -or $ranks[-1] -eq $ranks.Count) {
                $Failures.Add("$name must have a rank gap") | Out-Null
            }
        }
        "cause-rank-duplicate.json" {
            $ranks = @($event.causes | ForEach-Object { $_.rank })
            if (($ranks | Select-Object -Unique).Count -eq $ranks.Count) {
                $Failures.Add("$name must have duplicate ranks") | Out-Null
            }
        }
    }
}

Write-Host "`n[8/10] Envelope error-code fixtures and non-JSON invalid_json..."
$schemaJson = Get-Content -Raw $ErrorSchema | ConvertFrom-Json
$enumCodes = @($schemaJson.'$defs'.errorCode.enum)
foreach ($code in $EnvelopeCodes) {
    if ($enumCodes -notcontains $code) {
        $Failures.Add("CONTRACT envelope code missing from error schema: $code") | Out-Null
    }
}
foreach ($code in $enumCodes) {
    if ($EnvelopeCodes -notcontains $code) {
        $Failures.Add("error schema code not in Validate envelope list: $code") | Out-Null
    }
    $file = Join-Path $ErrorExamples (($code -replace '_', '-') + ".json")
    if ($code -eq "invalid_json") {
        $file = Join-Path $ErrorExamples "invalid-json.txt"
    }
    if (-not (Test-Path $file)) {
        $Failures.Add("missing error fixture for $code") | Out-Null
        continue
    }
    if ($code -ne "invalid_json") {
        $body = Get-Content -Raw $file | ConvertFrom-Json
        if ($body.error.code -ne $code) {
            $Failures.Add("$file error.code is $($body.error.code), expected $code") | Out-Null
        }
    }
}
$invalidJson = Join-Path $ErrorExamples "invalid-json.txt"
try {
    Get-Content -Raw $invalidJson | ConvertFrom-Json | Out-Null
    $Failures.Add("invalid-json.txt must not parse as JSON") | Out-Null
}
catch {
    Write-Host "  invalid-json.txt is not valid JSON (expected)"
}

$requiredResponses = @(
    "mixed-duplicate-needs-review.json",
    "unknown-character.json",
    "unmapped-challenge-map.json",
    "season-needs-review.json",
    "unsupported-version.json",
    "rejected-death-before-run-start.json"
)
foreach ($name in $requiredResponses) {
    if (-not (Test-Path (Join-Path $ResponseExamples $name))) {
        $Failures.Add("missing required response fixture: $name") | Out-Null
    }
}

Write-Host "`n[9/10] Relative Markdown links and wire-example hygiene..."
# CHECKSUMS.sha256 is created in step 10; skip that target until it exists.
$markdownRoots = @(
    $Root,
    (Join-Path $RepoRoot "docs\adr")
)
Get-ChildItem -Path $markdownRoots -Filter "*.md" -Recurse | ForEach-Object {
    Write-Host "  links: $($_.FullName.Substring($RepoRoot.Path.Length + 1))"
    Test-RelativeMarkdownLinks $_.FullName
}

$piiRx = '(?i)(postgres(ql)?://.+|Player-(?!0001-00000001)[0-9A-Za-z\-]+)'
Get-ChildItem -Path (Join-Path $Root "examples"), (Join-Path $Root "schema") -Include *.json, *.txt -Recurse | ForEach-Object {
    $text = Get-Content -Raw $_.FullName
    if ([regex]::IsMatch($text, $piiRx)) {
        $Failures.Add("possible secret/PII pattern in $($_.FullName)") | Out-Null
    }
}

Write-Host "`n[10/10] Canonical checksums..."
$checksumTargets = @()
$checksumTargets += Get-ChildItem (Join-Path $Root "schema") -Filter "*.json"
$checksumTargets += Get-ChildItem $RequestExamples -Filter "*.json"
$checksumTargets += Get-ChildItem $RequestInvalid -Filter "*.json"
$checksumTargets += Get-ChildItem $ResponseExamples -Filter "*.json"
$checksumTargets += Get-ChildItem $ErrorExamples -Filter "*.json"
$checksumTargets += Get-Item (Join-Path $ErrorExamples "invalid-json.txt")
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("# SHA-256 of canonical companion v1 schemas and examples") | Out-Null
$lines.Add("# Validator: $AjvCli / $AjvLibNote") | Out-Null
$lines.Add("# Do not edit example bytes independently of Yeetcraft; regenerate with -WriteChecksums") | Out-Null
foreach ($file in ($checksumTargets | Sort-Object FullName)) {
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash.ToLowerInvariant()
    $rel = $file.FullName.Substring($Root.Length + 1) -replace '\\', '/'
    $lines.Add("$hash  $rel") | Out-Null
}
$generated = ($lines -join "`n") + "`n"
$utf8 = New-Object System.Text.UTF8Encoding $false
if ($WriteChecksums -or -not (Test-Path $ChecksumPath)) {
    [IO.File]::WriteAllText($ChecksumPath, $generated, $utf8)
    Write-Host "  wrote $ChecksumPath"
}
$existing = [IO.File]::ReadAllText($ChecksumPath)
if ($existing -ne $generated) {
    $Failures.Add("CHECKSUMS.sha256 is stale; re-run with -WriteChecksums after reviewing fixture changes") | Out-Null
}
else {
    Write-Host "  CHECKSUMS.sha256 matches $($checksumTargets.Count) artifacts"
}

if ($Failures.Count -gt 0) {
    Write-Host "`nValidate FAILED:"
    $Failures | ForEach-Object { Write-Host "  - $_" }
    exit 1
}

Write-Host "`nValidate passed. Validator: $AjvCli ($AjvLibNote)."
Write-Host "Deferred CI: GitHub Actions for this script; companion go-test drift harness (Phase 2/3)."
