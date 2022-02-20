
//Esta funcion va a ser la alerta
function display_toast(mensaje, header, color) {
    const toast = document.createElement('ion-toast');
    toast.header = header;
    toast.icon = 'information-circle',
        toast.position = 'top';
    toast.message = mensaje;
    toast.duration = 3000;
    toast.color = color;
    document.body.appendChild(toast);
    toast.present();
}



function createO(sel, op, arr) {
    arr.forEach(item => {
        op = `<ion-select-option value="${item.nombre}">${item.nombre}</ion-select-option>`
        sel.innerHTML += op
    })
}


//Encontrar lati
function buscarLat(c, arr) {
    let lat = ''
    arr.forEach(item => {
        if (item.nombre == c) {
            lat = item.latitud

        }
    })
    return lat
}

//Encontrar Longitud segun el id de la ciudad.
function buscarLong(c, arr) {
    let long = ''
    arr.forEach(item => {
        if (item.nombre == c) {

            long = item.longitud
        }
    })
    return long;
}
// function findCityName(cID, arr) {
//     let cityName = '';
//     arr.forEach(item => {
//         if (item.id == cID) {
//             cityName = item.nombre;
//         }
//     })
//     return cityName;
// }

function obtenerId(n, arr) {
    let id;
    arr.forEach(item => {
        if (item.nombre == n) {
            id = item.id
        }
    })
    return id
}



function rad(x) {
    return x * Math.PI / 180;
}


function calcular_distancia(lat1, lon1, lat2, lon2) {
    var R = 6378.137; //Radio de la tierra en km
    var dLat = rad(lat2 - lat1);
    var dLong = rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(1); //Retorna 1 decimal
}


function createMap(lat_o, long_o, lat_d, long_d, c_o, c_d) {
    const lat_local_o = lat_o
    const lng_local_o = long_o
    const lat_local_d = lat_d
    const lng_local_d = long_d

    if (map != undefined) {
        map.remove();
    }

    map = L.map('map').setView([lat_local_o, lng_local_o], 18);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const distance = calcular_distancia(lat_o, long_o, long_d, lat_d)
    sessionStorage.setItem("distancia", distance)

    L.marker([lat_local_o, lng_local_o]).addTo(map)
        .bindPopup(`${c_o} <br> La distancia entre ${c_o} y ${c_d} es ${distance} KM `)
        .openPopup();

    L.marker([lng_local_d, lat_local_d]).addTo(map)
        .bindPopup(`${c_d} <br> La distancia entre ${c_d} y ${c_o} es ${distance} KM `)
        .openPopup();
}


function calcularPrecio(peso, distance) {
    let precio = 50;
    while (peso >= 1000) {
        precio += 10;
        peso -= 1000;
    }
    while (distance >= 100) {
        precio += 50;
        distance -= 100;
    }

    return precio
}