// tutorials.js
/*global L*/
/*eslint-env jquery*/
/*eslint-env leaflet*/
/*eslint-disable no-unused-vars*/

// 1. Leaflet Quick Start Guide tutorials
/* Example from Leaflet Quick Start Guide*/
//
//var mymap = L.map('mapid').setView([51.505, -0.09], 13);
//
////add tile layer...replace project id and accessToken with your own
//L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
//}).addTo(mymap);
//
//// add marker to map
//var marker = L.marker([51.5, -0.09]).addTo(mymap);
//
//var circle = L.circle([51.508, -0.11], {
//    color: 'red',
//    fillColor: '#f03',
//    fillOpacity: 0.5,
//    radius: 500
//}).addTo(mymap);
//
//var polygon = L.polygon([
//    [51.509, -0.08],
//    [51.503, -0.06],
//    [51.51, -0.047]
//]).addTo(mymap);
//
//marker.bindPopup("<strong>Hello world!</strong><br />I am a popup.").openPopup();
//circle.bindPopup("I am a circle.");
//polygon.bindPopup("I am a polygon.");
//
//var popup = L.popup()
//    .setLatLng([51.5, -0.09])
//    .setContent("I am a standalone popup.")
//    .openOn(mymap);
//
//// var popup = L.popup();
//
//// pop up lat lon info about the clicked point
//function onMapClick(e) {
//    popup
//        .setLatLng(e.latlng)
//        .setContent("You clicked the map at " + e.latlng.toString())
//        .openOn(mymap);
//}
//
//mymap.on('click', onMapClick);
//

// 2. Using GeoJSON with Leaflet tutorials

// set up map container
var map = L.map('mapid').setView([39.75621, -104.99404], 14);

//add tile layer...replace project id and accessToken with your own
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

//var geojsonFeature = {
//    "type": "Feature",
//    "properties": {
//        "name": "Coors Field",
//        "amenity": "Baseball Stadium",
//        "popupContent": "This is where the Rockies play!"
//    },
//    "geometry": {
//        "type": "Point",
//        "coordinates": [-104.99404, 39.75621]
//    }
//};
//
////add geojsonFeature to map
//L.geoJSON(geojsonFeature).addTo(map);
//
////add a point to map
//var myLayer = L.geoJSON().addTo(map);
//myLayer.addData(geojsonFeature);

// add two lines to the map with specific style
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.8
};

L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

// polygon features
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

// add polygons to map with color setting
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);

// Maker set up options
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

//L.geoJSON(geojsonFeature, {
//    pointToLayer: function (feature, latlng) {
//        return L.circleMarker(latlng, geojsonMarkerOptions);
//    },
//    onEachFeature: onEachFeature
//}).addTo(map);
//
// onEachFeature function
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

//L.geoJSON(geojsonFeature, {
//    onEachFeature: onEachFeature
//}).addTo(map);

//// filtering
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true,
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false,
        "popupContent": "This is Busch Field!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

// add the filtered features to map
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    },
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: onEachFeature
}).addTo(map);
