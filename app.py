import pickle
import pandas as pd
import numpy as np
from flask import Flask,request,app,jsonify,url_for,render_template
from flask_sqlalchemy import SQLAlchemy
import mysql.connector
from math import radians, cos, sin, asin, sqrt
import json

app=Flask(__name__)
app.config["DEBUG"] = True

SQLALCHEMY_DATABASE_URI = "mysql+mysqlconnector://{username}:{password}@{hostname}/{databasename}".format(
    username="testUser",
    password="password",
    hostname="localhost",
    databasename="testdb",
)
app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_POOL_RECYCLE"] = 299
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# SQLALCHEMY_DATABASE_URI = "mysql+mysqlconnector://{username}:{password}@{hostname}/{databasename}".format(
#     username="hs95",
#     password="passAug123",
#     hostname="hs95.mysql.pythonanywhere-services.com",
#     databasename="hs95$testdb",
# )
db = SQLAlchemy(app)

from pathlib import Path
THIS_FOLDER = Path(__file__).parent.resolve()
pred_model_file = THIS_FOLDER / "models/min_price_pred_cat_1.pkl"
st_le_file = THIS_FOLDER / "models/stateLE.pkl"
max_pred_model_file = THIS_FOLDER / "models/xgbmodel_prem_pred_4.pkl"


pred_model = pickle.load(open(pred_model_file,'rb'))
stateLabelEncoder = pickle.load(open(st_le_file,'rb'))
max_pred_model = pickle.load(open(max_pred_model_file,'rb'))


class PincodeDirectory(db.Model):

    __tablename__ = "pin_directory"
    nid = db.Column(db.Integer)
    pincode = db.Column(db.Integer, primary_key=True)
    po_del = db.Column(db.Integer)
    stateName = db.Column(db.String(4096))
    gen_del = db.Column(db.Integer) 
    latV = db.Column(db.Float)
    longV = db.Column(db.Float)
    isMetro = db.Column(db.Integer)
    isSpecDest = db.Column(db.Integer)


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict',methods=['GET'])
def reDirectHome():
    return home()

@app.route('/predict',methods=['POST'])
def predict():

    dst_pin=request.form['dst_pin']
    org_pin=request.form['org_pin']
    obj_cost=request.form['obj_cost']
    dead_wt=request.form['dead_wt']
    leng=request.form['leng']
    wid=request.form['wid']
    dep=request.form['dep']

    vol_wt = (float(leng)*float(wid)*float(dep))/5
    if float(dead_wt) > vol_wt:
        vol_wt = dead_wt

    # Checking pin codes are not same
    if int(org_pin) == int(dst_pin):
        output = "Error: Both pincodes are the same"
        return render_template("index.html",prediction_text=output)
    
    # For origin and dest, using pincode we will query to find all columns in directory table
    dst_db = db.session.get(PincodeDirectory,dst_pin)
    org_db = db.session.get(PincodeDirectory,org_pin)
    
    output = ""
    # Null handling of pincode to ensure they are valid values 
    if dst_db is None:
        output = "Error: Destination pincode is invalid"
        return render_template("index.html",prediction_text=output)

    if org_db is None:
        output = "Error: Origin pincode is invalid"
        return render_template("index.html",prediction_text=output)

    # Fetching details of origin and destination
    orgState = org_db.stateName
    orgLat = org_db.latV
    orgLong = org_db.longV
    orgPo = org_db.po_del
    orgMetro = org_db.isMetro
    orgSD = org_db.isSpecDest

    dstState = dst_db.stateName
    dstLat = dst_db.latV
    dstLong = dst_db.longV
    dstPo = dst_db.po_del
    dstMetro = dst_db.isMetro
    dstSD = dst_db.isSpecDest

    # Compute distance using lat and long values
    dst_km = haversine(orgLong, orgLat, dstLong, dstLat)
    print("Distance is "+ str(dst_km))

    # Finding state label encoded value for ML model
    st = np.array([str(orgState)])
    orgSt = stateLabelEncoder.transform(st)
    st = np.array([str(dstState)])
    dstSt = stateLabelEncoder.transform(st)

    data = [org_pin, dst_pin, obj_cost, orgSt, orgMetro, orgSD, orgPo, dstSt, dstMetro, dstSD, dstPo, vol_wt,dst_km]
    data2 = [org_pin, dst_pin, obj_cost, vol_wt, orgSt, orgMetro, orgSD, orgPo, dstSt, dstMetro, dstSD, dstPo,dst_km]
    data=[float(x) for x in data]
    data2=[float(x) for x in data2]
    print(data)
    for x in request.form.values():
    	print(x)
    data = np.array(data).reshape(1,-1)
    data2 = np.array(data2).reshape(1,-1)
    print(data2)

    # Predict Shipment Price using model and round to 2 digit
    output="{:0.2f}".format(np.exp(pred_model.predict(data))[0]/2)
    output=str(output)

    output2="{:0.2f}".format(np.exp(max_pred_model.predict(data2))[0]/2)
    output2=str(output2)
    resp = {'cheap':output, 'fast':output2}
    print(json.dumps(resp))
    return json.dumps(resp)
    # return output

@app.route('/getPincode/<pin>',methods=['GET'])
def getPincodeData(pin):
    print("looking for"+ str(pin))
    pin_db = db.session.get(PincodeDirectory,pin)
    if pin_db is None:
        output = "Error: Origin pincode is invalid"
        return render_template("{\"error\":\"Invalid pincode\"}")

    state = pin_db.stateName
    latV = pin_db.latV
    longV = pin_db.longV
    isMetro = pin_db.isMetro
    isSD = pin_db.isSpecDest
    resp = {'state':state, 'latV':latV, 'longV':longV, 'isMetro': isMetro, 'isSD': isSD}
    print(json.dumps(resp))
    return json.dumps(resp)

def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance in kilometers between two points 
    on the earth (specified in decimal degrees)
    """
    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles. Determines return value units.
    return c * r


if __name__=="__main__":
    app.run(debug=True)