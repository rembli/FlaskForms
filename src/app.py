from logging import NullHandler
from flask import Flask, config, jsonify, request, render_template, session, Response
from flask_login import LoginManager, login_required, current_user
from flask_cors import CORS
from flasgger import Swagger

from flask_pymongo import PyMongo
import pymongo
from bson.objectid import ObjectId
from bson.json_util import dumps, loads

import pandas as pd

import os
import json
import yaml
from dotenv import load_dotenv


# ENVIRONMENT

load_dotenv()  
app = Flask(__name__)

CORS(app)
Swagger(app)

MONGO_URI = os.environ['MONGO_URI']
mongo = PyMongo(app, MONGO_URI)
db = mongo.db


# WEB PAGES

@app.route('/')
def forms_builder():
    return render_template('forms-builder.html')

@app.route('/preview')
def forms_builder_demo():
    return render_template('forms-renderer.html')


# APIs

@app.route('/form-templates', methods=['POST'])
def form_templates_POST():
    _id = request.form["_id"]
    name = request.form["name"]
    definition = request.form["definition"]
    form_template = {
        "name": name,
        "definition": definition
    }

    cnt = 0
    if len(_id) > 1:
        cnt = db.form_templates.count_documents({'$and': [{'name': name},{'_id': ObjectId(_id)}]})
    if cnt > 0:
        db.form_templates.update_one (
            {"$and": [{'name': name},{'_id': ObjectId(_id)}]},
            {"$set": form_template}
        )
        # print ("UPDATE",_id,form_template)
    else:
        new_doc = db.form_templates.insert_one(form_template) 
        _id = new_doc.inserted_id 
        # print ("INSERT", form_template)        
    return str(_id)

@app.route('/form-templates', methods=['GET'])
def form_templates_GET():
    form_templates = db.form_templates.find().limit(1000).sort([("name", pymongo.ASCENDING)])
    return dumps(form_templates)

@app.route('/form-templates/<form_template_id>', methods=['GET'])
def form_template_GET(form_template_id):
    form_template = db.form_templates.find_one({"_id": ObjectId(form_template_id)}) 
    return dumps(form_template)    

@app.route('/form-templates/<form_template_id>', methods=['DELETE'])
def form_template_DELETE(form_template_id):
    db.form_templates.delete_one({"_id": ObjectId(form_template_id)}) 
    return "OK"    

@app.route('/forms', methods=['POST'])
def forms_POST():
    form_payload = convert_multidict_to_dict (request.form)
    db.forms.insert_one(form_payload)      
    return "OK"

@app.route('/forms', methods=['GET'])
def forms_GET():
    form_template_id = request.args.get("form_template_id")
    forms = []
    if form_template_id is not None:
        forms = db.forms.find({'_form_template_id': form_template_id}).limit(1000)
    return dumps(forms)

@app.route("/forms/csv", methods=['GET'])
def forms_GET_CSV():
    submissions_JSON = forms_GET()
    df = pd.read_json (submissions_JSON)
    csv = df.to_csv(sep=";")

    return Response(
        csv,
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=submissions.csv"})

@app.route('/forms/<forms_id>', methods=['DELETE'])
def form_DELETE(forms_id):
    db.forms.delete_one({"_id": ObjectId(forms_id)})
    return "OK"    

@app.route('/health')
def health():
    return "OK"


# UTIL 

def convert_multidict_to_dict (multi_dict):
    req_dic = {}
    for key, value in multi_dict.items():
    
        # checking for any nested dictionary
        l = key.split(".")
        
        # if nested dictionary is present
        if len(l) > 1: 
            i = l[0]
            j = l[1]
            if req_dic.get(i) is None:
                req_dic[i] = {}
                req_dic[i][j] = []
                req_dic[i][j].append(value)
            else:
                if req_dic[i].get(j) is None:
                    req_dic[i][j] = []
                    req_dic[i][j].append(value)
                else:
                    req_dic[i][j].append(value)
    
        else:  # if single dictionary is there
            if req_dic.get(l[0]) is None:
                req_dic[l[0]] = value
            else:
                req_dic[l[0]] = value
    return req_dic

# MAIN

def  main():
    app.run(host="0.0.0.0")

if __name__ == '__main__':
    main()    