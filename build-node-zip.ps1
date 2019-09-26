$ErrorActionPreference = 'stop'

$env:PATH = "$(get-item .)\node_modules\.bin;$($env:path)"
remove-item .\distribution\narrafirma -Recurse -Force
mkdir distribution\narrafirma -Force 
tsc 
npm run build-wp:webapp 
npm run build-wp:optimize:survey 
npm run build-wp:optimize:admin 
npm run build-wp:optimize:narrafirma 
Copy-Item server-data .\distribution\narrafirma\server-data -Recurse
Copy-Item server .\distribution\narrafirma\server -Recurse
Remove-Item .\distribution\narrafirma\server-data\journals\NarraFirmaProject-* -Recurse -Force
Remove-Item .\distribution\narrafirma\narrafirma.php

# all javascript is bundled by require on the optimize steps, so we don't need the source javascript
Remove-Item .\distribution\narrafirma\webapp\js -Recurse -Force
Remove-Item  .\distribution\narrafirma\narrafirmaWordPressAdmin.js 
$(git describe --tags) > .\distribution\narrafirma\webapp\version.txt
Push-Location .\distribution\narrafirma
    Compress-Archive -Path .\* -DestinationPath narrafirma.zip
Pop-Location
write-host Done building NarraFirma package at "$(Get-Item .\distribution\narrafirma\narrafirma.zip)"
