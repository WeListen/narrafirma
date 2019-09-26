$webAppName = ""
$webAppResourceGroup = ""
az webapp deployment source config-zip --resource-group $webAppResourceGroup --name $webAppName --src distribution\narrafirma\narrafirma.zip