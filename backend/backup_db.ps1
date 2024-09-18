$env_content = Get-Content .env
$mongodb_uri = $env_content | Where-Object { $_ -match "MONGODB_URI=" } | ForEach-Object { $_ -replace "MONGODB_URI=", "" }

if ($mongodb_uri) {
    Write-Host "Executing mongodump..."
    mongodump --uri="$mongodb_uri" --out="./backup"
} else {
    Write-Host "MONGODB_URI not found in .env file"
}