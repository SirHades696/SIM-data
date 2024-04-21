var map = L.map("map", {
    center: [19.2812646, -99.6948895], // Toluca
    zoom: 10,
});

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var baseMaps = {
    "Open Street Map": osm,
    "ESRI": esri
};

var groupedOverlays = {
    "Zona de estudio": {},
    "Oferta y demanda": {}
};
var layerControl = L.control.groupedLayers(baseMaps, groupedOverlays, { collapsed: false }).addTo(map);
// ----------- Limite municipal
fetch('layers/limite_municipal.geojson').then(r => r.json()).then(d => {
    function tooltip(feature, layer) {
        if (feature.properties.ClaveEnt) {
            layer.bindTooltip(
                "<strong>Clave de la Entidad: </strong>" + feature.properties.ClaveEnt + "<br>" +
                "<strong>Nombre del municipio: </strong>" + feature.properties.NOM_MUN
            );
        }
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
    function tooltip(feature, layer) {
        if (feature.properties.P5_HLI) {
            layer.bindTooltip(
                "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
                "<strong>Nombre del municipio: </strong>" + feature.properties.NOM_MUN + "<br>" +
                "<strong>Nombre de la localidad: </strong>" + feature.properties.NOM_LOC + "<br>" +
                "<strong>Población de 5 años y más que habla alguna lengua indígena: </strong>" + feature.properties.P5_HLI);
        }
    }
    window.pob_ind = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
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
    function tooltip(feature, layer) {
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
                "<strong>Nombre del municipio: </strong>" + feature.properties.NOMGEO + "<br>" +
                "<strong>Grado de marginación: </strong>" + feature.properties.GM_2020);
        }
    }
    window.grad_mar = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        mode: 'manual',
        classes: ["Muy bajo", "Bajo", "Medio", "Alto", 'Muy alto'],
        field: 'GM_2020',
        colorRamp: ["#d7191c", "#a6d96a", "#ffffbf", "#fdae61", "#1a9641"],
        legendTitle: 'Grado de marginación 2020',
        legendTemplate: {
            lowest: 'Alto y más',
            middle: '{low}',
            highest: 'Muy bajo',
            nodata: 'Sin dato'
        },
        onEachFeature: tooltip
    });
    layerControl.addOverlay(grad_mar, "Grado de marginación", "Zona de estudio");
});

// --------------- Tipo de manzanas
fetch('layers/tipo_manzanas.geojson').then(r => r.json()).then(d => {
    function tooltip(feature, layer) {
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
                "<strong>Tipo de manzana: </strong>" + feature.properties.AMBITO);
        }
    }
    window.t_manz = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        mode: 'manual',
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
    function tooltip(feature, layer) {
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
                "<strong>Nombre del municipio: </strong>" + feature.properties.NOM_MUN + "<br>" +
                "<strong>Nombre de la localidad: </strong>" + feature.properties.NOM_LOC + "<br>" +
                "<strong>Población total: </strong>" + feature.properties.POBTOT);
        }
    }
    window.pob_manz = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        mode: 'jenks',
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
    function tooltip(feature, layer) {
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
                "<strong>Nombre del municipio: </strong>" + feature.properties.NOM_MUN + "<br>" +
                "<strong>Nombre de la localidad: </strong>" + feature.properties.NOM_LOC + "<br>" +
                "<strong>Densidad de población por m^2: </strong>" + feature.properties.Densidad);
        }
    }
    window.den_pob = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        mode: 'jenks',
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
    function tooltip(feature, layer) {
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
    }
    window.red_vial = L.dataClassification(d, {
        style: { weight: 2 },
        mode: 'manual',
        classes: [1,2,3],
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
fetch('layers/VIM.geojson').then(r => r.json()).then(d => {
    function tooltip(feature, layer) {
        if (feature.properties) {
            layer.bindTooltip(
                "<strong>Clave geográfica: </strong>" + feature.properties.CVEGEO + "<br>" +
                "<strong>Nombre del municipio: </strong>" + feature.properties.NOM_MUN + "<br>" +
                "<strong>Nombre de la localidad: </strong>" + feature.properties.NOM_LOC + "<br>" +
                "<strong>Demanda potencial: </strong>" + feature.properties.TAG);
        }
    }
    window.dem_pot = L.dataClassification(d, {
        style: { color: "black", weight: 0 },
        mode: 'manual',
        classes: ["Muy Bajo", "Bajo", "Medio Bajo", "Medio Alto", "Alto", "Muy Alto", "Otro"],
        field: 'TAG',
        colorRamp: "RdYlGn",
        legendTitle: 'Demanda potencial (Valor índice medio)',
        onEachFeature: tooltip
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
        style: {fillColor: '#B136E3'},
        mode: 'jenks',
        classes: 5,
        pointMode: 'size',
		pointSize: {min: 3, max: 12},
        pointShape: 'diamond',
        field: 'Oferta',
        colorRamp: "RdYlGn",
        legendTitle: 'Oferta potencial (Consultas)',
        legendTemplate: { highest: '{low} y más', lowest: 'menor a {high}' },
        onEachFeature: tooltip
    });
    layerControl.addOverlay(ofe_pot, "Oferta potencial", "Oferta y demanda");
});


map.on("overlayadd overlayremove", function (eventLayer) {
    if (eventLayer.name === "Tipo de manzanas") {
        var legendDataRows = document.querySelectorAll('.legendDataRow');
        legendDataRows.forEach(function (row) {
            var icon = row.querySelector('i');
            var div = icon.nextElementSibling;
            if (div &&  div.tagName === 'DIV' && div.textContent.trim() === "{none}") {
                icon.nextElementSibling.remove();
                icon.remove();
            }
        });
    }

    if (eventLayer.name === "Grado de marginación") {
        var legendDataRows = document.querySelectorAll('.legendDataRow');
        legendDataRows.forEach(function (row) {
            var icon = row.querySelector('i');
            var div = icon.nextElementSibling;
            if (div && div.tagName === 'DIV' && div.textContent.trim() === "Medio") {
                row.remove();
            } else if (div && div.tagName === 'DIV' && div.textContent.trim() === "Alto") {
                div.textContent = "Medio";
            }
        });
    }
});

