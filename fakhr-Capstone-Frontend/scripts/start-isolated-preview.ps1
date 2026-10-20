param([int]$Port = 8116)
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$env:EXPO_PUBLIC_SMART_PLAN_PREVIEW='true'
$env:EXPO_PUBLIC_SMART_PLAN_FIXTURES='true'
$env:EXPO_OFFLINE='1'
$env:EXPO_NO_TELEMETRY='1'
node node_modules/expo/bin/cli start --web --localhost --port $Port
