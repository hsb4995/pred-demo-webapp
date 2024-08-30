// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    // Array.from(forms).forEach(form => {
    //   form.addEventListener('submit', event => {
    //     if (!form.checkValidity()) {
    //       event.preventDefault()
    //       event.stopPropagation()
    //     }
  
    //     form.classList.add('was-validated')
    //   }, false)
    // })

    // var divsToHide = document.getElementsByClassName("org_cls"); //divsToHide is an array
    // for(var i = 0; i < divsToHide.length; i++){
    //     divsToHide[i].style.visibility = "hidden"; // or
    //     divsToHide[i].style.display = "none"; // depending on what you're doing
    // }

    // var map = L.map('map').setView([51.505, -0.09], 13);
    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     maxZoom: 19,
    //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    // }).addTo(map);


  })()
  
var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

ins = document.getElementById("insights");
ins.style.display = "None";
dash = document.getElementById("dashboard");
dash.style.display = "auto"

function getAnalytics(obj) {
    console.log("You sent: " + obj.name);
    // var marker = L.marker([51.5, -0.09]).addTo(map);
    var marker2 = L.marker([29, 78]).addTo(map);
    group = new L.featureGroup([marker2]);
    map.fitBounds(group.getBounds());
    // var x = document.getElementById("org_pin").value;
    // console.log("You selected: " + x);
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
