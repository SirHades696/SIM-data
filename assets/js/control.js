var map = L.map("map", {
    center: [19.2812646, -99.6948895], // Toluca
    zoom: 10,
});

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});


var cartodb_voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}' + (L.Browser.retina ? '@2x.png' : '.png'), {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    minZoom: 0
}).addTo(map);

var baseMaps = {
    "CARTO Voyager": cartodb_voyager,
    "Open Street Map": osm,
    "ESRI": esri
};

var groupedOverlays = {
    "Zona de estudio": {},
    "Oferta y demanda": {},
    "Restricción en el origen": {}
};
var layerControl = L.control.groupedLayers(baseMaps, groupedOverlays, { collapsed: false }).addTo(map);

// ----------- Limite municipal
fetch('layers/limite_municipal.geojson').then(r => r.json()).then(d => {
    var origstyle;
    function highlight(e) {
        origstyle = {
            weight: e.target.options.weight
        }
        e.target.setStyle({
            weight: 2
        });
    }
    function resetStyle(e) {
        e.target.setStyle(origstyle);
    }

    function tooltip(feature, layer) {
        layer.on('mousemove',e=>{
            e.target.getTooltip().setLatLng(e.latlng);
        });
        if (feature.properties.ClaveEnt) {
            layer.bindTooltip(
                "<strong>Clave de la Entidad: </strong>" + feature.properties.ClaveEnt + "<br>" +
                "<strong>Nombre del municipio: </strong>" + feature.properties.NOM_MUN
            );
        }
        layer.on({
            mouseover: highlight,
            mouseout: resetStyle
        });
    }
    window.lim_municipal = L.geoJSON(d, {
        style: {
            fillColor: '#fdf9c4',
            fillOpacity: 0.8,
            color: 'black',
            weight: 0.5,
        },
        onEachFeature: tooltip
    }).addTo(map);
    layerControl.addOverlay(lim_municipal, "Límite municipal", "Zona de estudio");
});

// --------------- Poblacion indigena
fetch('layers/pob_indigena.geojson').then(r => r.json()).then(d => {
    var origstyle;
    function highlight(e) {
        origstyle = {
            weight: e.target.options.weight
        }
        e.target.setStyle({
            weight: 2
        });
    }
    function resetStyle(e) {
        e.target.setStyle(origstyle);
    }

    function tooltip(feature, layer) {
        layer.on('mousemove',e=>{
            e.target.getTooltip().setLatLng(e.latlng);
        });
        if (feature.properties.P5_HLI) {
            layer.bindTooltip(
                "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
                "<strong>Nombre del municipio: </strong>" + feature.properties.NOM_MUN + "<br>" +
                "<strong>Nombre de la localidad: </strong>" + feature.properties.NOM_LOC + "<br>" +
                "<strong>Población de 5 años y más que habla alguna lengua indígena: </strong>" + feature.properties.P5_HLI);
        }
        layer.on({
            mouseover: highlight,
            mouseout: resetStyle
        });
    }
    window.pob_ind = L.dataClassification(d, {
        style: { color: "black", weight: 0},
        id: "pob_ind",
        mode: 'jenks',
        classes: 5,
        field: 'P5_HLI',
        colorCustom: ['#ffd3bf', '#fbb4b9', '#f768a1', '#c51b8a', '#7a0177'],
        legendTitle: 'Población de 5 años y más que habla alguna lengua indígena',
        legendTemplate: { highest: '{low} y más', lowest: 'menor a {high}' },
        onEachFeature: tooltip
    });
    layerControl.addOverlay(pob_ind, "Población indígena", "Zona de estudio");
});

// --------------- Grado de marginacion
fetch('layers/grado_marginacion.geojson').then(r => r.json()).then(d => {
    var origstyle;
    function highlight(e) {
        origstyle = {
            weight: e.target.options.weight
        }
        e.target.setStyle({
            weight: 2
        });
    }
    function resetStyle(e) {
        e.target.setStyle(origstyle);
    }

    function tooltip(feature, layer) {
        layer.on('mousemove',e=>{
            e.target.getTooltip().setLatLng(e.latlng);
        });
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
                "<strong>Nombre del municipio: </strong>" + feature.properties.NOMGEO + "<br>" +
                "<strong>Grado de marginación: </strong>" + feature.properties.GM_2020);
        }
        layer.on({
            mouseover: highlight,
            mouseout: resetStyle
        });
    }
    window.grad_mar = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        mode: 'manual',
        id: "grad_mar",
        classes: ["Muy bajo", "Bajo", "Medio", "Alto", 'Muy alto'],
        field: 'GM_2020',
        colorRamp: ["#d7191c", "#a6d96a", "#ffffbf", "#fdae61", "#1a9641"],
        legendTitle: 'Grado de marginación 2020',
        legendAscending: true,
        onEachFeature: tooltip
    });
    layerControl.addOverlay(grad_mar, "Grado de marginación", "Zona de estudio");
});

// --------------- Tipo de manzanas
fetch('layers/tipo_manzanas.geojson').then(r => r.json()).then(d => {
    var origstyle;
    function highlight(e) {
        origstyle = {
            weight: e.target.options.weight
        }
        e.target.setStyle({
            weight: 2
        });
    }
    function resetStyle(e) {
        e.target.setStyle(origstyle);
    }

    function tooltip(feature, layer) {
        layer.on('mousemove',e=>{
            e.target.getTooltip().setLatLng(e.latlng);
        });
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
                "<strong>Tipo de manzana: </strong>" + feature.properties.AMBITO);
        }
        layer.on({
            mouseover: highlight,
            mouseout: resetStyle
        });
    }
    window.t_manz = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        mode: 'manual',
        id: "t_manz",
        classes: ["Rural", "Urbana", ""],
        field: 'AMBITO',
        colorRamp: ["#a46200", "#6f619d"],
        legendTitle: 'Tipo de manzanas',
        legendTemplate: {
            lowest: 'Rural',
            middle: "{none}",
            highest: 'Urbana',
        },
        onEachFeature: tooltip
    });
    layerControl.addOverlay(t_manz, "Tipo de manzanas", "Zona de estudio");
});

// --------------- Habitantes por manzana
fetch('layers/pob_manzana.geojson').then(r => r.json()).then(d => {
    var origstyle;
    function highlight(e) {
        origstyle = {
            weight: e.target.options.weight
        }
        e.target.setStyle({
            weight: 2
        });
    }
    function resetStyle(e) {
        e.target.setStyle(origstyle);
    }

    function tooltip(feature, layer) {
        layer.on('mousemove',e=>{
            e.target.getTooltip().setLatLng(e.latlng);
        });
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
                "<strong>Nombre del municipio: </strong>" + feature.properties.NOM_MUN + "<br>" +
                "<strong>Nombre de la localidad: </strong>" + feature.properties.NOM_LOC + "<br>" +
                "<strong>Población total: </strong>" + feature.properties.POBTOT);
        }
        layer.on({
            mouseover: highlight,
            mouseout: resetStyle
        });
    }
    window.pob_manz = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        mode: 'jenks',
        id: "pob_manz",
        classes: 5,
        field: 'POBTOT',
        colorRamp: "YlOrBr",
        legendTitle: 'Población por manzana',
        legendTemplate: { highest: '{low} y más', lowest: 'menor a {high}' },
        onEachFeature: tooltip
    });
    layerControl.addOverlay(pob_manz, "Población por manzana", "Zona de estudio");
});

// --------------- Densidad de población
fetch('layers/densidad_pob.geojson').then(r => r.json()).then(d => {
    var origstyle;
    function highlight(e) {
        origstyle = {
            weight: e.target.options.weight
        }
        e.target.setStyle({
            weight: 2
        });
    }
    function resetStyle(e) {
        e.target.setStyle(origstyle);
    }

    function tooltip(feature, layer) {
        layer.on('mousemove',e=>{
            e.target.getTooltip().setLatLng(e.latlng);
        });
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
                "<strong>Nombre del municipio: </strong>" + feature.properties.NOM_MUN + "<br>" +
                "<strong>Nombre de la localidad: </strong>" + feature.properties.NOM_LOC + "<br>" +
                "<strong>Densidad de población por m^2: </strong>" + feature.properties.Densidad);
        }
        layer.on({
            mouseover: highlight,
            mouseout: resetStyle
        });
    }
    window.den_pob = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        mode: 'jenks',
        id: "den_pob",
        classes: 5,
        field: 'Densidad',
        colorRamp: "RdYlGn",
        reverseColorRamp: true,
        legendTitle: 'Densidad de población por m^2',
        legendTemplate: { highest: '{low} y más', lowest: 'menor a {high}' },
        onEachFeature: tooltip
    });
    layerControl.addOverlay(den_pob, "Densidad de población", "Zona de estudio");
});

// --------------- Red vial
fetch('layers/red_vial.geojson').then(r => r.json()).then(d => {
    var origstyle;
    function highlight(e) {
        origstyle = {
            weight: e.target.options.weight
        }
        e.target.setStyle({
            weight: 10
        });
    }
    function resetStyle(e) {
        e.target.setStyle(origstyle);
    }

    function tooltip(feature, layer) {
        layer.on('mousemove',e=>{
            e.target.getTooltip().setLatLng(e.latlng);
        });
        if (feature.properties) {
            var tipoClase = feature.properties.Class === 1 ? "Primaria" :
                feature.properties.Class === 2 ? "Secundaria" :
                    feature.properties.Class === 3 ? "Terciaria" :
                        "Desconocida";
            layer.bindTooltip(
                "<strong>ID de la red vial: </strong>" + feature.properties.ID_RED + "<br>" +
                "<strong>Nombre: </strong>" + feature.properties.NOMBRE + "<br>" +
                "<strong>Estatus: </strong>" + feature.properties.CONDICION + "<br>" +
                "<strong>Tipo de red vial: </strong>" + tipoClase);
        }
        layer.on({
            mouseover: highlight,
            mouseout: resetStyle
        });
    }
    window.red_vial = L.dataClassification(d, {
        style: { weight: 2 },
        mode: 'manual',
        id: "red_vial",
        classes: [1, 2, 3],
        field: 'Class',
        lineMode: 'color',
        colorCustom: ["#000000", "#d00000", "#ae5a00"],
        legendTitle: 'Tipo de red vial',
        legendTemplate: {
            lowest: 'Primaria',
            middle: 'Secundaria',
            highest: 'Terciaria',
        },
        onEachFeature: tooltip
    });
    layerControl.addOverlay(red_vial, "Tipo de red vial", "Zona de estudio");
});

// --------------- Demanda potencial
fetch('layers/VIMR.geojson').then(r => r.json()).then(d => {
    var origstyle;
    function highlight(e) {
        origstyle = {
            weight: e.target.options.weight
        }
        e.target.setStyle({
            weight: 2
        });
    }
    function resetStyle(e) {
        e.target.setStyle(origstyle);
    }

    function tooltip(feature, layer) {
        layer.on('mousemove',e=>{
            e.target.getTooltip().setLatLng(e.latlng);
        });
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
                "<strong>Nombre del municipio: </strong>" + feature.properties.NOM_MUN + "<br>" +
                "<strong>Nombre de la localidad: </strong>" + feature.properties.NOM_LOC + "<br>" +
                "<strong>Demanda potencial: </strong>" + feature.properties.TAG);
        }
        layer.on({
            mouseover: highlight,
            mouseout: resetStyle
        });
    }
    window.dem_pot = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        id: "dem_pot",
        mode: 'manual',
        classes: [1, 2, 3, 4, 5, 6],
        field: 'RTAG',
        colorRamp: "RdYlGn",
        reverseColorRamp: true,
        legendTitle: 'Demanda potencial (Valor índice medio)',
        onEachFeature: tooltip,
    });
    layerControl.addOverlay(dem_pot, "Demanda potencial", "Oferta y demanda");
});

// --------------- Oferta potencial
fetch('layers/oferta_potencial.geojson').then(r => r.json()).then(d => {
    function tooltip(feature, layer) {
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave: </strong>" + feature.properties.CLUES + "<br>" +
                "<strong>Nombre: </strong>" + feature.properties.NOMBRE_SS + "<br>" +
                "<strong>Municipio: </strong>" + feature.properties.MUNICIPIO + "<br>" +
                "<strong>Localidad: </strong>" + feature.properties.LOCALIDAD + "<br>" +
                "<strong>Oferta potencial: </strong>" + feature.properties.Oferta);
        }
    }
    window.ofe_pot = L.dataClassification(d, {
        style: { fillColor: '#B136E3' },
        mode: 'jenks',
        id: "ofe_pot",
        classes: 5,
        pointMode: 'size',
        pointSize: { min: 3, max: 12 },
        pointShape: 'diamond',
        field: 'Oferta',
        colorRamp: "RdYlGn",
        legendTitle: 'Oferta potencial (Consultas)',
        legendTemplate: { highest: '{low} y más', lowest: 'menor a {high}' },
        onEachFeature: tooltip
    });
    layerControl.addOverlay(ofe_pot, "Oferta potencial", "Oferta y demanda");
});

// --------------- RO friccion de distancia 0
fetch('layers/FD0_CLUES_RO.geojson').then(r => r.json()).then(d => {
    function tooltip(feature, layer) {
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave: </strong>" + feature.properties.CLUES + "<br>" +
                "<strong>Nombre: </strong>" + feature.properties.NOMBRE_SS + "<br>" +
                "<strong>Municipio: </strong>" + feature.properties.MUNICIPIO + "<br>" +
                "<strong>Localidad: </strong>" + feature.properties.LOCALIDAD + "<br>" +
                "<strong>Oferta potencial: </strong>" + feature.properties.class);
        }
    }
    window.ro_fd0 = L.dataClassification(d, {
        style: { 'radius': 8 },
        mode: 'manual',
        id: "ro_fd0",
        classes: [1, 2, 3, 4, 5],
        pointMode: 'color',
        pointSize: { min: 3, max: 12 },
        pointShape: 'circle',
        field: 'class',
        colorRamp: "RdYlGn",
        legendTitle: 'Oferta potencial RD-0',
        legendTemplate: {
            lowest: '{high}',
            middle: '{low} - {high}',
            highest: '{low}',
        },
        onEachFeature: tooltip
    });

    layerControl.addOverlay(ro_fd0, "Fricción de distancia = 0", "Restricción en el origen");
});

var loader = L.control.loader().addTo(map);
setTimeout(function () { loader.hide(); }, 12000);

map.on("overlayadd overlayremove", function (eventLayer) {

    // if (eventLayer.name === "Tipo de manzanas") {
    //     var legendDataRows = document.querySelectorAll('.legendDataRow');
    //     legendDataRows.forEach(function (row) {
    //         var icon = row.querySelector('i');
    //         if (icon) {
    //             var div = icon.nextElementSibling;
    //             if (div && div.tagName === 'DIV' && div.textContent.trim() === "{none}") {
    //                 icon.nextElementSibling.remove();
    //                 icon.remove();
    //             }
    //         }
    //     });
    // }

    // if (eventLayer.name === "Grado de marginación") {
    //     var legendDataRows = document.querySelectorAll('.legendDataRow');
    //     legendDataRows.forEach(function (row) {
    //         var icon = row.querySelector('i');
    //         if (icon) {
    //             var div = icon.nextElementSibling;
    //             if (div && div.tagName === 'DIV' && div.textContent.trim() === "< Bajo") {
    //                 div.textContent = "Alto";
    //             }
    //             if (div && div.tagName === 'DIV' && div.textContent.trim() === "Muy alto <") {
    //                 div.textContent = "Muy bajo";
    //             }
    //             if (div && div.tagName === 'DIV' && div.textContent.trim() === "Alto – Muy alto") {
    //                 div.textContent = "Medio";
    //             }
    //             if (div && div.tagName === 'DIV' && div.textContent.trim() === "Bajo – Medio") {
    //                 div.textContent = "Bajo";
    //             }
    //             if (div && div.tagName === 'DIV' && div.textContent.trim() === "Medio – Alto") {
    //                 icon.nextElementSibling.remove();
    //                 icon.remove();
    //             }
    //         }
    //     });
    // }

    // if (eventLayer.name === "Fricción de distancia = 0") {
    //     var legendDataRows = document.querySelectorAll('.legendDataRow');
    //     legendDataRows.forEach(function (row) {
    //         var icon = row.querySelector('svg');
    //         var div = icon.nextElementSibling;
    //         if (div && div.tagName === 'DIV' && div.textContent.trim() === "5") {
    //             div.textContent = "0.75 - 1";
    //         }
    //         if (div && div.tagName === 'DIV' && div.textContent.trim() === "4 - 5") {
    //             div.textContent = "0.5 - 0.75";
    //         }
    //         if (div && div.tagName === 'DIV' && div.textContent.trim() === "3 - 4") {
    //             div.textContent = "0.25 - 0.5";
    //         }
    //         if (div && div.tagName === 'DIV' && div.textContent.trim() === "2 - 3") {
    //             div.textContent = "0 - 0.25";
    //         }
    //         if (div && div.tagName === 'DIV' && div.textContent.trim() === "2") {
    //             div.textContent = "0";
    //         }
    //     });
    // }

    // if (eventLayer.name === "Demanda potencial") {
    //     var legendDataRows = document.querySelectorAll('.legendDataRow');
    //     legendDataRows.forEach(function (row) {
    //         var icon = row.querySelector('i');
    //         var div = icon.nextElementSibling;
    //         if (div && div.tagName === 'DIV' && div.textContent.trim() === "6 <") {
    //             div.textContent = "Muy Alto";
    //         }
    //         if (div && div.tagName === 'DIV' && div.textContent.trim() === "5 – 6") {
    //             div.textContent = "Alto";
    //         }
    //         if (div && div.tagName === 'DIV' && div.textContent.trim() === "4 – 5") {
    //             div.textContent = "Medio Alto";
    //         }
    //         if (div && div.tagName === 'DIV' && div.textContent.trim() === "3 – 4") {
    //             div.textContent = "Medio Bajo";
    //         }
    //         if (div && div.tagName === 'DIV' && div.textContent.trim() === "2 – 3") {
    //             div.textContent = "Bajo";
    //         }
    //         if (div && div.tagName === 'DIV' && div.textContent.trim() === "< 2") {
    //             div.textContent = "Muy Bajo";
    //         }
    //     });
    // }

    // ------------------------- Remove legends
    if (!map.hasLayer(pob_ind)) {
        var div = document.querySelector('div.pob_ind');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    if (!map.hasLayer(grad_mar)) {
        var div = document.querySelector('div.grad_mar');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    if (!map.hasLayer(t_manz)) {
        var div = document.querySelector('div.t_manz');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }

    if (!map.hasLayer(pob_manz)) {
        var div = document.querySelector('div.pob_manz');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    if (!map.hasLayer(den_pob)) {
        var div = document.querySelector('div.den_pob');
        if (div) {
            div.parentNode.removeChild(div);
        }

    }
    if (!map.hasLayer(red_vial)) {
        var div = document.querySelector('div.red_vial');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    if (!map.hasLayer(dem_pot)) {
        var div = document.querySelector('div.dem_pot');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    if (!map.hasLayer(ofe_pot)) {
        var div = document.querySelector('div.ofe_pot');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    if (!map.hasLayer(ro_fd0)) {
        var div = document.querySelector('div.ro_fd0');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
});

