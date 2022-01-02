#!/bin/bash
export FLASK_ENV=development

#MONGO_CONTAINER_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' baas-db)
#echo $MONGO_CONTAINER_IP
#export MONGO_URI="mongodb://baas:baas@$MONGO_CONTAINER_IP:27017/baas"

export MONGO_URI="mongodb://localhost:27017/baas"

python ./src/app.py
