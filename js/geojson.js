// geojson.js created by Meiliu Wu

/*global document L*/
/*eslint-env jquery*/
/*eslint-disable no-extra-semi*/
/*eslint-disable no-unused-vars*/

/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    //call getData function
    getData(map);
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){
            //create marker options
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            
            // create a Leaflet GeoJSON layer and assign it to var geoJsonLayer
            // 1. applying pointToLayer to AJAX data in geojson.js
            // 2. applying onEachFeature function
            // 3. use filter function to only show cities with 2015 populations greater than 20 million
            var geoJsonLayer = L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                onEachFeature: onEachFeature,
                filter: function(feature, layer) {
                    return feature.properties.Pop_2015 > 20;
                }
            });
            
            // 4. create a L.markerClusterGroup layer
            var markers = L.markerClusterGroup();
            //add geojson to marker cluster layer
            markers.addLayer(geoJsonLayer);
            //add marker cluster layer to map
            map.addLayer(markers);
        }
    });
};

//added at Example 2.3 line 20...function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

$(document).ready(createMap);