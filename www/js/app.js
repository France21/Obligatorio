
var map;//Creamos esta variable para luego utilizarla para el mapeo, usamos una especie de Singleton.

//no se que chota es esto, pero para algo sirve.
function getParam(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


//Esta funcion la llamamos cuando iniciamos sesion, guardamos algunos datos que nos van a venir al pelo luego, y luego pusheamos el router para que aparesca la pagina de calcular distancias.
function login(data, router) {
    sessionStorage.setItem("id", data.id);
    sessionStorage.setItem("apiKey", data.apiKey);
    sessionStorage.setItem("usuario", JSON.stringify(data.usuario))
    router.push('/distancias');
}

//Esta funcion se va a ejecutar, cuando el router este en /distancias, basicamente llama a la api con las ciudades, y llama a otra funcion
function ciudades() {
    let token = sessionStorage.getItem("apiKey");

    let url = `https://envios.develotion.com/ciudades.php`
    fetch(url, {
        method: 'GET',
        headers: {
            "apiKey": token,
            "Content-Type": "Aplication/JSON"
        }
    }).then(response => response.json())
        .then(data => createOptions(data))
}
//con esta funcion asignamos options al select vacio, llamando a las fucniones de library.
function createOptions(data) {
    let select = document.querySelector('#ciudad_o');
    let option = '';
    createO(select, option, data.ciudades)
    let select2 = document.querySelector('#ciudad_d');
    let option2 = '';
    createO(select2, option2, data.ciudades)
    document.querySelector('#calcular_distancias').onclick = function () {//al apretar calcular distancias, llamamos al mapa qlo fome, y calculamos la distancia en la funcion CreateMap.
        try {


            let city_o = document.querySelector('#ciudad_o').value
            let city_d = document.querySelector('#ciudad_d').value

            if (!city_o) {
                throw 'Seleccione ciudad de Origen!'
            }
            if (!city_d) {
                throw 'Seleccione destino!'
            }
            let long_o = buscarLong(city_o, data.ciudades);
            let lat_o = buscarLat(city_o, data.ciudades);
            let long_d = buscarLong(city_d, data.ciudades);
            let lat_d = buscarLat(city_d, data.ciudades);


            createMap(lat_o, long_o, long_d, lat_d, city_o, city_d);
            sessionStorage.setItem("ciudad_o", city_o);
            sessionStorage.setItem("ciudad_d", city_d);
            
            // sessionStorage.setItem("ciudades", data.ciudades);

        } catch (e) {
            display_toast(e, 'info', 'primary')
        }

    }
}
//llamamo de nuevo a la api de ciudades, y ta luego vamos a por agegarEnvios
function agregarDataEnvio() {
    let token = sessionStorage.getItem("apiKey");

    let url = `https://envios.develotion.com/ciudades.php`
    fetch(url, {
        method: 'GET',
        headers: {
            "apiKey": token,
            "Content-Type": "Aplication/JSON"
        }
    }).then(response => response.json())
        .then(data => agregarEnvios(data))

}
//esta chota la edite como 20 veces wacho, mas vale que funque Xd
function agregarEnvios(data) {
    const ciudad_origen = sessionStorage.getItem("ciudad_o");
    const ciudad_destino = sessionStorage.getItem("ciudad_d");
    let token = sessionStorage.getItem('apiKey')
    let idCOrigen = obtenerId(ciudad_origen, data.ciudades);
    let idCDestino = obtenerId(ciudad_destino, data.ciudades);
    let cat = document.querySelector('#cat')
    let optionCats = '';
    let sel = document.querySelector('#ciudad_o2')
    let sel2 = document.querySelector('#ciudad_d2')
    let op = `<ion-select-option value="${idCOrigen}">${ciudad_origen}</ion-select-option>`
    sel.innerHTML = op
    let op2 = `<ion-select-option value="${idCDestino}">${ciudad_destino}</ion-select-option>`
    sel2.innerHTML = op2


    let url = `https://envios.develotion.com/categorias.php`

    fetch(url, {
        method: 'GET',
        headers: {
            "apiKey": token,
            "Content-Type": "Aplication/JSON"
        }
    })
        .then(response => response.json()).then(data2 => data2.categorias.forEach(item => {
            optionCats = `<ion-select-option value="${item.id}">${item.nombre}</ion-select-option>`
            cat.innerHTML += optionCats
        }));

    document.querySelector('#agregar_envio').onclick = function () {
        try {


            let peso = document.querySelector('#peso').value;
            let categoria = document.querySelector('#cat').value;
            let distance = sessionStorage.getItem('distancia')
            let idUser = sessionStorage.getItem("id")
            let precioEnvio = calcularPrecio(peso, distance);
            if (!peso) {
                throw 'porfavor ingrese peso'
            }
            if (!categoria) {
                throw 'porfavor seleccione categoria.'
            }
            if (isNaN(peso)) {
                throw 'Porfavor, ingrese numeros.'
            }
            let url = `https://envios.develotion.com/envios.php`;
            fetch(url, {
                method: 'POST',
                body: JSON.stringify({ idUsuario: idUser, idCiudadOrigen: idCOrigen, idCiudadDestino: idCDestino, peso: peso, distancia: distance, precio: precioEnvio, idCategoria: categoria }),
                headers: {
                    "apiKey": token,
                    "Content-Type": "Aplication/JSON"
                }
            }).then(alert('vamo los pibe'))
                .catch(e => display_toast(e, 'info', 'primary'))

        } catch (e) {
            display_toast(e, 'info', 'primary')
        }
    }




    // let select = document.querySelector("#ciudad_o2");
    // let option = `<ion-select-option value="${ciudad_origen} selected>${cityNameO}</ion-select-option>"`

    // select.innerHTML = option

    // let select2 = document.querySelector("#ciudad_d2");
    // let option2 = `<ion-select-option value="${ciudad_destino} selected>${cityNameD}</ion-select-option>"`

    // select2.innerHTML = option2

}




document.addEventListener('DOMContentLoaded', function () {

    let router = document.querySelector('ion-router');
    router.addEventListener('ionRouteDidChange', function (e) {
        let nav = e.detail;
        //console.log('>>>>>',nav.to)
        let paginas = document.getElementsByTagName('ion-page');
        for (let i = 0; i < paginas.length; i++) {
            paginas[i].style.visibility = "hidden";
        }
        let ion_route = document.querySelectorAll(`[url="${nav.to}"]`)
        let id_pagina = ion_route[0].getAttribute('component');
        let pagina = document.getElementById(id_pagina);
        pagina.style.visibility = "visible";

        if (nav.to == '/distancias') {
            ciudades()
        }
        if (nav.to == '/agregar') {
            agregarDataEnvio();
        }
    });




    document.getElementById('registro').onclick = function () {
        try {
            const nombre = document.getElementById('name').value;
            const password = document.getElementById('password2').value;
            const repassword = document.getElementById('repassword').value;

            if (!nombre) {
                throw 'Nombre required';
            }
            if (!password) {
                throw 'Contraseña required'

            }
            if (password != repassword) {
                throw 'Contraseña y Nombre no coinciden';
            }


            //post a API registro de usuario
            const url = 'https://envios.develotion.com/usuarios.php';

            fetch(url, {
                method: 'POST',
                body: JSON.stringify({ usuario: nombre, password: password }),
                headers: {
                    "Content-type": "application/json"
                }
            }).then(response => (response.ok) ? response.json() : response.text().then(text => Promise.reject(JSON.parse(text).mensaje)))
                .then(data => router.push('/'))
                .catch(message => display_toast(message, info, 'primary'))
        }
        catch (e) {
            display_toast(e, 'info', 'primary')
        }
    }

    document.querySelector('#login').onclick = function () {
        const user = document.getElementById('user').value;
        const password = document.getElementById('password').value;
        try {
            if (!user) {
                throw 'user Required';
            }
            if (!password) {
                throw 'password Required';
            }

            const url = 'https://envios.develotion.com/login.php';
            fetch(url, {
                method: 'POST',
                body: JSON.stringify({ usuario: user, password: password }),
                headers: {
                    "Content-type": "application/json"
                }
            }).then(response => (response.ok) ? response.json() : response.text().then(text => Promise.reject(JSON.parse(text).mensaje)))
                .then(data => login(data, router))
                .catch(message => display_toast(message, info, 'primary'))

        }
        catch (e) {
            display_toast(e, 'Info', 'primary');
        }
    }


});