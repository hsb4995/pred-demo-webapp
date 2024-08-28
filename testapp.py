import pickle
import pandas as pd
import numpy as np
from flask import Flask,request,app,jsonify,url_for,render_template
from flask_sqlalchemy import SQLAlchemy
import mysql.connector

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

db = SQLAlchemy(app)

model = pickle.load(open('../1stmodel.pkl','rb'))

class PincodeDirectory(db.Model):

    __tablename__ = "directory"
    pincode = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String(4096))


@app.route('/')
def home():
    pincodes=PincodeDirectory.query.all()
    print(pincodes[0].state)
    return render_template('index.html')

@app.route('/predict',methods=['POST'])
def predict():
    data=[float(x) for x in request.form.values()]
    for x in request.form.values():
    	print(x)
    data =np.array(data).reshape(1,-1)
    print(data)
    output=np.exp(model.predict(data))[0]
    return render_template("index.html",prediction_text="Estimated shipping cost is {}".format(output))


if __name__=="__main__":
    app.run(debug=True)