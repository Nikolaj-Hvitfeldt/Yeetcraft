# Dot-source this file to set testdb variables in the current PowerShell session.
# Does not start Docker and does not set API_KEY / E2E_WRITE_TOKEN.
#
#   . .\scripts\testdb-env.ps1

$env:YEETCRAFT_TEST_MODE = '1'
$env:TEST_DATABASE_URL = 'postgres://postgres@127.0.0.1:55432/yeetcraft_test?sslmode=disable'
