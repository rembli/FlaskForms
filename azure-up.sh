#/bin/bash

# Variables
appName="demo-baas"
resourceGroup="demo-baas"
containerImage="rembli/baas"

# build container

echo "BUILD AND PUSH CONTAINER **************************************************************"
docker build -t $containerImage .
docker push $containerImage

# NOTE: az login

# update and restart

echo "UPDATE APP **************************************************************"
az webapp update --https-only true --name $appName --resource-group $resourceGroup

echo "RESTART APP **************************************************************"
az webapp restart --name $appName --resource-group $resourceGroup

