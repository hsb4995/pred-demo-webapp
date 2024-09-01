
# PriceAI Prototype

An AI model which can predict pricing for shipment considering quantitative data variables and indicators using real world datasets.

This is a sub-directory for prototype which is hosted on the cloud with pickled models.
The complete code-base containing datasets and jupyter can be found here - .






## Demo

Demo is hosted: https://hs95.pythonanywhere.com/

Feel free to test, the model loaded predict min cost for domestic shipping of parcel between 2 pincodes in India along with other parameters.
We support all 19300 pincodes of India.


## Run Locally

Clone the project

```bash
  git clone https://github.com/hsb4995/pred-demo-webapp.git
```

Go to the project directory

```bash
  cd pred-demo-webapp
```

Install libraries mentioned in requirements.txt

```bash
  pip install -r requirements.txt
```

In case you are facing issues with any libraries, also install dep in pip freeeze 

```bash
  pip install -r pip_freeze.txt
```

Run Mysql server

```bash
  brew services start mysql
```

Kindly ensure the following are same for Mysql
```bash
    username="testUser"
    password="password"
    hostname="localhost"
    databasename="testdb"
```

Create the DB and table, the commands are as follows
```bash
    mysql --local-infile=1 -u root
    create database testdb;
    use testdb;
    create table pin_directory(nid int, pincode int primary key, po_del bool, stateName varchar(255), gen_del bool, latV decimal(11,7),longV decimal(11,7), isMetro int, isSpecDest int);
    load data local infile 'pincode_directory.csv' into table pin_directory fields terminated by ',' lines terminated by '\n';

```

Run the app using python
```bash
    python app.py // In case of any error, ensure all dependency are installed 
```

The application can be accessed at http://127.0.0.1:5000/

