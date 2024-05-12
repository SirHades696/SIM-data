var map = L.map("map", {
    center: [19.2812646, -99.6948895], // Toluca
    zoom: 10,
});

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);


var cartodb_voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}' + (L.Browser.retina ? '@2x.png' : '.png'), {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
    minZoom: 0
});

var baseMaps = {
    "CARTO Voyager": cartodb_voyager,
    "Open Street Map": osm,
    "ESRI": esri
};

var groupedOverlays = {
    "Zona de estudio": {},
    "Oferta y demanda": {},
    "Restricción en el origen": {},
    "Restricción en el destino": {}
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
        legendFooter: 'Elaborado a partir de: Censo de Población y Vivienda - INEGI, 2020.',
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
        legendTitle: 'Grado de marginación',
        legendFooter: 'Elaborado a partir de: Censo de Población y Vivienda - INEGI, 2020.',
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
        legendFooter: 'Elaborado a partir de: Marco Geoestadístico - INEGI, 2023.',
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
        legendFooter: 'Elaborado a partir de: Censo de Población y Vivienda - INEGI, 2020.',      
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
        legendFooter: 'Elaborado a partir de: Censo de Población y Vivienda - INEGI, 2020.',
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
        onEachFeature: tooltip,
        legendFooter: 'Elaborado a partir de: Red Nacional de Caminos RNC - INEGI, 2020.',
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
                "<strong>Etiqueta: </strong>" + feature.properties.TAG + "<br>" +
                "<strong>Demanda potencial: </strong>" + feature.properties.DEMPOT);
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
        legendFooter: 'Elaborado a partir de: Censo de Población y Vivienda - INEGI, 2020.',
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
        onEachFeature: tooltip,
        legendFooter: 'Elaborado a partir de: Catálogo de Clave Única de Establecimientos de Salud (CLUES) - Secretaría de Salud, 2023.',
    });
    layerControl.addOverlay(ofe_pot, "Oferta potencial", "Oferta y demanda");
});

// --------------- RO friccion de distancia 0
fetch('layers/FD0_CLUES_RO.geojson').then(r => r.json()).then(d => {
    function tooltip(feature, layer) {
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave: </strong>" + feature.properties.CLUES + "<br>" +
                "<strong>Nombre: </strong>" + feature.properties.NOMBRE_S + "<br>" +
                "<strong>Municipio: </strong>" + feature.properties.MUNICIPIO + "<br>" +
                "<strong>Localidad: </strong>" + feature.properties.LOCALIDAD + "<br>" +
                "<strong>OI: </strong>" + Math.ceil(feature.properties.OI_SUM).toString() + "<br>" +
                "<strong>OI Normalizado: </strong>" + feature.properties.OI_SUM_N.toFixed(4));
        }
    }
    window.ro_fd0 = L.dataClassification(d, {
        style: { 'radius': 10 },
        mode: 'manual',
        id: "ro_fd0",
        classes: [1, 2, 3, 4, 5],
        pointMode: 'color',
        pointShape: 'circle',
        field: 'class',
        colorCustom: ["#d7191c", "#b7b7b7", "#f7f7f7", "#c2a5cf","#7b3294"],
        legendTitle: 'Oferta potencial estimada - Fricción de distancia igual a 0',
        legendTemplate: {
            lowest: '{high}',
            middle: '{low} - {high}',
            highest: '{low}',
        },
        legendFooter: 'Elaborado a partir de: Catálogo de Clave Única de Establecimientos de Salud (CLUES) - Secretaría de Salud, 2023.',
        onEachFeature: tooltip,
        
    });

    layerControl.addOverlay(ro_fd0, "Fricción de distancia = 0", "Restricción en el origen");
});

// --------------- RO friccion de distancia 0.5
fetch('layers/FD05_CLUES_RO.geojson').then(r => r.json()).then(d => {
    function tooltip(feature, layer) {
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave: </strong>" + feature.properties.CLUES + "<br>" +
                "<strong>Nombre: </strong>" + feature.properties.NOMBRE_S + "<br>" +
                "<strong>Municipio: </strong>" + feature.properties.MUNICIPIO + "<br>" +
                "<strong>Localidad: </strong>" + feature.properties.LOCALIDAD + "<br>" +
                "<strong>OI: </strong>" + Math.ceil(feature.properties.OI_SUM).toString() + "<br>" +
                "<strong>OI Normalizado: </strong>" + feature.properties.OI_SUM_N.toFixed(4));
        }
    }
    window.ro_fd05 = L.dataClassification(d, {
        style: { 'radius': 10 },
        mode: 'manual',
        id: "ro_fd05",
        classes: [1, 2, 3, 4, 5],
        pointMode: 'color',
        pointShape: 'circle',
        field: 'class',
        colorCustom: ["#d7191c", "#b7b7b7", "#f7f7f7", "#c2a5cf","#7b3294"],
        legendTitle: 'Oferta potencial estimada - Fricción de distancia igual a 0.5',
        legendTemplate: {
            lowest: '{high}',
            middle: '{low} - {high}',
            highest: '{low}',
        },
        legendFooter: 'Elaborado a partir de: Catálogo de Clave Única de Establecimientos de Salud (CLUES) - Secretaría de Salud, 2023.',
        onEachFeature: tooltip,
        
    });

    layerControl.addOverlay(ro_fd05, "Fricción de distancia = 0.5", "Restricción en el origen");
});

// --------------- RO friccion de distancia 1
fetch('layers/FD1_CLUES_RO.geojson').then(r => r.json()).then(d => {
    function tooltip(feature, layer) {
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave: </strong>" + feature.properties.CLUES + "<br>" +
                "<strong>Nombre: </strong>" + feature.properties.NOMBRE_S + "<br>" +
                "<strong>Municipio: </strong>" + feature.properties.MUNICIPIO + "<br>" +
                "<strong>Localidad: </strong>" + feature.properties.LOCALIDAD + "<br>" +
                "<strong>OI: </strong>" + Math.ceil(feature.properties.OI_SUM).toString() + "<br>" +
                "<strong>OI Normalizado: </strong>" + feature.properties.OI_SUM_N.toFixed(4));
        }
    }
    window.ro_fd1 = L.dataClassification(d, {
        style: { 'radius': 10 },
        mode: 'manual',
        id: "ro_fd1",
        classes: [1, 2, 3, 4, 5],
        pointMode: 'color',
        pointShape: 'circle',
        field: 'class',
        colorCustom: ["#d7191c", "#b7b7b7", "#f7f7f7", "#c2a5cf","#7b3294"],
        legendTitle: 'Oferta potencial estimada - Fricción de distancia igual a 1',
        legendTemplate: {
            lowest: '{high}',
            middle: '{low} - {high}',
            highest: '{low}',
        },
        legendFooter: 'Elaborado a partir de: Catálogo de Clave Única de Establecimientos de Salud (CLUES) - Secretaría de Salud, 2023.',
        onEachFeature: tooltip,
        
    });
    layerControl.addOverlay(ro_fd1, "Fricción de distancia = 1", "Restricción en el origen");
});

// --------------- Demanda potencial
// fetch('layers/VIMR.geojson').then(r => r.json()).then(d => {
//     var origstyle;
//     function highlight(e) {
//         origstyle = {
//             weight: e.target.options.weight
//         }
//         e.target.setStyle({
//             weight: 2
//         });
//     }
//     function resetStyle(e) {
//         e.target.setStyle(origstyle);
//     }

//     function tooltip(feature, layer) {
//         layer.on('mousemove',e=>{
//             e.target.getTooltip().setLatLng(e.latlng);
//         });
//         if (feature.properties) {
//             layer.bindTooltip(
//                 "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
//                 "<strong>Nombre del municipio: </strong>" + feature.properties.NOM_MUN + "<br>" +
//                 "<strong>Nombre de la localidad: </strong>" + feature.properties.NOM_LOC + "<br>" +
//                 "<strong>Demanda potencial: </strong>" + feature.properties.DEMPOT + "<br>" +
//                 "<strong>Demanda potencial (N): </strong>" + feature.properties.DEMPOT_N);
//         }
//         layer.on({
//             mouseover: highlight,
//             mouseout: resetStyle
//         });
//     }
//     window.dem_pot_RO = L.dataClassification(d, {
//         style: { color: "black", weight: 0 },
//         id: "dem_pot_RO",
//         mode: 'jenks',
//         classes: 5,
//         field: 'DEMPOT_N',
//         colorRamp: "RdYlGn",
//         reverseColorRamp: true,
//         legendTitle: 'Demanda potencial Normalizado',
//         legendTemplate: { highest: '{low} y más', lowest: 'menor a {high}' },
//         onEachFeature: tooltip,
//         legendFooter: 'Elaborado a partir de: Censo de Población y Vivienda - INEGI, 2020.',
//     });
//     layerControl.addOverlay(dem_pot_RO, "Demanda potencial", "Restricción en el origen");
// });

// --------------- RD Fricción de distancia 0
fetch('layers/FD0_Manzanas_RD.geojson').then(r => r.json()).then(d => {
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
                "<strong>Demanda potencial: </strong>" + feature.properties.DEMPOT + "<br>" +
                "<strong>DJ: </strong>" + feature.properties.DJ_SUM + "<br>" +  
                "<strong>DJ Normalizado: </strong>" + feature.properties.DJ_SUM_N);
        }
        layer.on({
            mouseover: highlight,
            mouseout: resetStyle
        });
    }
    window.rd_fd0 = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        id: "rd_fd0",
        mode: 'jenks',
        classes: 5,
        field: 'DJ_SUM_N',
        colorRamp: "RdYlGn",
        reverseColorRamp: true,
        legendTitle: 'Demanda potencial estimada',
        legendTemplate: { highest: '{low} y más', lowest: 'menor a {high}' },
        onEachFeature: tooltip,
        legendFooter: 'Elaborado a partir de: Censo de Población y Vivienda - INEGI, 2020.',
    });
    layerControl.addOverlay(rd_fd0, "Fricción de distancia = 0", "Restricción en el destino");
});

// --------------- RD Fricción de distancia 05
fetch('layers/FD05_Manzanas_RD.geojson').then(r => r.json()).then(d => {
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
                "<strong>Demanda potencial: </strong>" + feature.properties.DEMPOT + "<br>" +
                "<strong>DJ: </strong>" + feature.properties.DJ_SUM + "<br>" +  
                "<strong>DJ Normalizado: </strong>" + feature.properties.DJ_SUM_N);
        }
        layer.on({
            mouseover: highlight,
            mouseout: resetStyle
        });
    }
    window.rd_fd05 = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        id: "rd_fd05",
        mode: 'jenks',
        classes: 5,
        field: 'DJ_SUM_N',
        colorRamp: "RdYlGn",
        reverseColorRamp: true,
        legendTitle: 'Demanda potencial estimada',
        legendTemplate: { highest: '{low} y más', lowest: 'menor a {high}' },
        onEachFeature: tooltip,
        legendFooter: 'Elaborado a partir de: Censo de Población y Vivienda - INEGI, 2020.',
    });
    layerControl.addOverlay(rd_fd05, "Fricción de distancia = 0.5", "Restricción en el destino");
});

// --------------- RD Fricción de distancia 1
fetch('layers/FD1_Manzanas_RD.geojson').then(r => r.json()).then(d => {
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
                "<strong>Demanda potencial: </strong>" + feature.properties.DEMPOT + "<br>" +
                "<strong>DJ: </strong>" + feature.properties.DJ_SUM + "<br>" +  
                "<strong>DJ Normalizado: </strong>" + feature.properties.DJ_SUM_N);
        }
        layer.on({
            mouseover: highlight,
            mouseout: resetStyle
        });
    }
    window.rd_fd1 = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        id: "rd_fd1",
        mode: 'jenks',
        classes: 5,
        field: 'DJ_SUM_N',
        colorRamp: "RdYlGn",
        reverseColorRamp: true,
        legendTitle: 'Demanda potencial estimada',
        legendTemplate: { highest: '{low} y más', lowest: 'menor a {high}' },
        onEachFeature: tooltip,
        legendFooter: 'Elaborado a partir de: Censo de Población y Vivienda - INEGI, 2020.',
    });
    layerControl.addOverlay(rd_fd1, "Fricción de distancia = 1", "Restricción en el destino");
});

// --------------- Oferta potencial para RD
// fetch('layers/oferta_potencial.geojson').then(r => r.json()).then(d => {
//     function tooltip(feature, layer) {
//         if (feature.properties) {
//             layer.bindTooltip(
//                 "<strong>Clave: </strong>" + feature.properties.CLUES + "<br>" +
//                 "<strong>Nombre: </strong>" + feature.properties.NOMBRE_SS + "<br>" +
//                 "<strong>Municipio: </strong>" + feature.properties.MUNICIPIO + "<br>" +
//                 "<strong>Localidad: </strong>" + feature.properties.LOCALIDAD + "<br>" +
//                 "<strong>Oferta potencial: </strong>" + feature.properties.Oferta);
//         }
//     }
//     window.ofe_potRD = L.dataClassification(d, {
//         style: { fillColor: '#B136E3' },
//         mode: 'jenks',
//         id: "ofe_potRD",
//         classes: 5,
//         pointMode: 'size',
//         pointSize: { min: 3, max: 12 },
//         pointShape: 'circle',
//         field: 'Oferta',
//         legendTitle: 'Oferta potencial (Consultas)',
//         legendTemplate: { highest: '{low} y más', lowest: 'menor a {high}' },
//         onEachFeature: tooltip,
//         legendFooter: 'Elaborado a partir de: Catálogo de Clave Única de Establecimientos de Salud (CLUES) - Secretaría de Salud, 2023.',
//     });
//     layerControl.addOverlay(ofe_potRD, "Oferta potencial", "Restricción en el destino");
// });

var loader = L.control.loader().addTo(map);
setTimeout(function () { loader.hide(); }, 30000);

map.on("overlayadd overlayremove", function (eventLayer) {
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
    if (!map.hasLayer(ro_fd05)) {
        var div = document.querySelector('div.ro_fd05');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    if (!map.hasLayer(ro_fd1)) {
        var div = document.querySelector('div.ro_fd1');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    if (!map.hasLayer(dem_pot_RO)) {
        var div = document.querySelector('div.dem_pot_RO');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    if (!map.hasLayer(rd_fd0)) {
        var div = document.querySelector('div.rd_fd0');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    if (!map.hasLayer(rd_fd05)) {
        var div = document.querySelector('div.rd_fd05');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    if (!map.hasLayer(rd_fd1)) {
        var div = document.querySelector('div.rd_fd1');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
    if (!map.hasLayer(ofe_potRD)) {
        var div = document.querySelector('div.ofe_potRD');
        if (div) {
            div.parentNode.removeChild(div);
        }
    }
});

