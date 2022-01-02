#/bin/bash

# Variables
location="francecentral"
appName="demo-baas"
dbName="demo-baas-db"
resourceGroup="demo-baas"
servicePlan="ASP-demobaas-84bb"
containerImage="rembli/baas"

echo "Create a Resource Group"
az group create --name $resourceGroup --location $location

echo "Create an App Service Plan"
az appservice plan create --name $servicePlan --resource-group $resourceGroup --location $location

echo "Create a Web App"
az webapp create --name $appName --plan $servicePlan --resource-group $resourceGroup -i $containerImage

echo "Create a Cosmos DB with MongoDB API"
az cosmosdb create --name $dbName --resource-group $resourceGroup --kind MongoDB

echo "Get the MongoDB URL"
connectionString=$(az cosmosdb list-connection-strings --name $dbName --resource-group $resourceGroup --query connectionStrings[0].connectionString --output tsv)

echo "Assign the connection string to an App Setting in the Web App"
az webapp config appsettings set --name $appName --resource-group $resourceGroup --settings "MONGO_URI=$connectionString" 

# REFERENCES
# https://docs.microsoft.com/en-us/azure/cosmos-db/mongodb/connect-mongodb-account#get-the-mongodb-connection-string-to-customize 
# https://docs.microsoft.com/en-us/azure/app-service/scripts/cli-connect-to-documentdb 
# https://www.phillipsj.net/posts/deploying-dash-to-azure-app-service/






