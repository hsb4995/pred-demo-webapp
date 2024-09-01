(() => {
    'use strict'


  })()
  
var map = L.map('map').setView([28.6304, 77.2177], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

ins = document.getElementById("insights");
ins.style.display = "None";
dash = document.getElementById("dashboard");
dash.style.display = "auto"

function getAnalytics(obj) {
    console.log("You sent: " + obj.name);
    if(obj.name == "org_pin" || obj.name == "dst_pin") {
        // We will add markers to the map after getting lang lat 
        // Also will update the anaytics section
        if (markers.get(obj)) {
            map.removeLayer(markers.get(obj))
            markers.delete(obj)
        }
        updateLatLongInfo(obj.value, obj)
    } else if(obj.name == "obj_cost") {
        costV = document.getElementById("cost_info")
        if(isValidCost(obj.value)) {
            costV.style.visibility = "visible"
            costV.textContent = "Cost of the object is important and has direct impact in insurance cost"
        } else {
            costV.style.visibility = "visible"
            costV.textContent = "Please enter a valid Number"
        }
    } else if(obj.name == "dead_wt") {
        wtV = document.getElementById("wt_info")
        if(isValidWeight(obj.value)) {
            wtV.style.visibility = "visible"
            wtV.textContent = "Weight of object (dead weight) and Volumetric weight (using dimensions) are important factors"
        } else {
            wtV.style.visibility = "visible"
            wtV.textContent = "Please enter a valid Number"
        }
    }
}

var markers = new Map();

function updateLatLongInfo(code, obj) {
    // Ajax code to backend api to fetch details
    console.log("Calling backend api for ",code)

    $.ajax({
        url: "/getPincode/"+code,
        type: 'GET',
        dataType: 'json', // added data type
        success: function(res) {
            console.log(res);
            state = res.state
            latV = res.latV
            longV = res.longV
            isMetro = res.isMetro
            isSD = res.isSD
            addMarkerToMap(latV, longV, obj)
            // Find values from resp and update analytics screen
            updateStateAnalytics(obj, state, isMetro, isSD)
            updateDistance()
        },
        error: function() {
            alert("Invalid pincode entered")
            updateDistance()   
            stTitle = document.getElementById(obj.name+"_title")
            stName = document.getElementById(obj.name+"_st")
            stInfo = document.getElementById(obj.name+"_info")
            stTitle.style.visibility = "hidden"
            stName.textContent = ""
            stInfo.textContent = ""
        }
    });
}

function changeTab(obj) {
    if(obj.value == 1){
        dash.style.display = "flex"
        ins.style.display = "None";
    } else {
        ins.style.display = "flex";
        dash.style.display = "None"
    }
}


function addMarkerToMap(latV,longV, obj) {
    var marker = L.marker([latV, longV]).addTo(map);
    markers.set(obj,marker)

    group = new L.featureGroup(Array.from(markers.values()));
    map.fitBounds(group.getBounds());

    count=0;
    group.eachLayer(function (layer) {
        count++;
    });
    if (count == 1) {
        map.zoomOut(10)
    }
}

function updateStateAnalytics(obj, state, isMetro, isSD) {
    stTitle = document.getElementById(obj.name+"_title")
    stName = document.getElementById(obj.name+"_st")
    stInfo = document.getElementById(obj.name+"_info")
    console.log(stName)
    stName.textContent = state
    stTitle.style.visibility = "visible"
    if(isMetro == 1) {
        stInfo.textContent = "Comes in Metropolitan region"
    } else if (isSD == 1){
        stInfo.textContent = "Comes in Special delivery region"
    } else {
        stInfo.textContent = ""
    }
    analyticsCls = document.getElementsByClassName("hdn-cls")
    visCount=0;
    for(i=0;i<analyticsCls.length;++i) {
        if(analyticsCls[i].style.visibility == "visible"){visCount=1;}
    }
    analyticsLst = document.getElementById("hdn-lst")
    map2 = document.getElementById("map")
    pred = document.getElementById("hdn-pred")
    if(visCount > 0) {
        analyticsLst.style.visibility = "visible"
        map2.style.visibility = "visible"
        pred.style.visibility = "visible"
    }

}

function updateDistance() {
    // Check if both markers are set and then update the distance
    arrMarker = Array.from(markers.values())
    distObj = document.getElementById("dst_v3")
    distTitleObj = document.getElementById("dst_v1")
    distInfoObj = document.getElementById("dst_v2")
    if(arrMarker.length == 2) {
        lat1 = arrMarker[0]._latlng.lat
        lng1 = arrMarker[0]._latlng.lng
        lat2 = arrMarker[1]._latlng.lat
        lng2 = arrMarker[1]._latlng.lng
        dist = getDistance(lat1,lng1,lat2,lng2)
        distObj.textContent = dist+"KM"
        distObj.style.visibility = "visible"
        distTitleObj.style.visibility = "visible"
        distInfoObj.style.visibility = "visible"
    } else {
        distObj.textContent = ""
        distObj.style.visibility = "hidden"
        distTitleObj.style.visibility = "hidden"
        distInfoObj.style.visibility = "hidden"
    }
}

function deg2rad(degrees){
    radians = degrees * (Math.PI/180);
    return radians;
}


function getDistance(lat1, lon1, lat2, lon2) {
    deltaLat = lat2 - lat1 ;
    deltaLon = lon2 - lon1 ;
    earthRadius =  6371 ; // in meters 3959 in miles.
    alpha    = deltaLat/2;
    beta     = deltaLon/2;
    a        = Math.sin(deg2rad(alpha)) * Math.sin(deg2rad(alpha)) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(deg2rad(beta)) * Math.sin(deg2rad(beta)) ;
    c        = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    distance =  earthRadius * c;
    return distance.toFixed(2);
}

function isValidCost(val) {
    if(isNaN(val)) {
        return false;
    }
    return true;
}

function isValidWeight(val) {
    if(isNaN(val)) {
        return false;
    }
    return true;
}

function getPred(obj) {
    console.log("Calling backend api for getting prediction")
    console.log(obj.serialize)
    $.ajax({
        url: "/predict",
        type: 'POST',
        data: $(obj).serialize(), 
        dataType: 'json', // added data type
        success: function(res) {
            console.log(res);
            predEle = document.getElementById("pred-out");
            predEle.textContent = "min:" + res.cheap + "    fast:" + res.fast
        },
        error: function() {
            alert("Invalid data entered")
        }
    });
}

$( document ).ready(function() {
    $("form").submit(function(e) {
        e.preventDefault(); // prevent page refresh
        getPred(this)
    });
});