Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path "../Cloud client website.zip"))
$zip.Entries | Where-Object { $_.FullName -match 'travel|flight|stay|car|taxi|attraction|\.js$|\.css$' } | Select-Object -Property FullName, Length | Format-Table -AutoSize
$zip.Dispose()
