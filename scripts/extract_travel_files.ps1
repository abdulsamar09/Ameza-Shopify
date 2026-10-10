Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipPath = (Resolve-Path "../Cloud client website.zip")
$tempDir = Join-Path (Get-Location) "restore_temp"

if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$patterns = @('stays', 'flight', 'car-rental', 'attraction', 'airport-taxis', 'travel.css', 'booking-cars-api.js', 'flight-api-service.js', 'flights-data.js', 'travel-engine.js', 'travel-searchbox.js')

foreach ($entry in $zip.Entries) {
    foreach ($pat in $patterns) {
        if ($entry.Name -like "*$pat*") {
            $destPath = Join-Path $tempDir $entry.Name
            Write-Host "Extracting: $($entry.FullName) -> $destPath"
            [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destPath, $true)
            break
        }
    }
}
$zip.Dispose()
Write-Host "Done extracting travel files to restore_temp."
