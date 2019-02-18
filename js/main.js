// Javascripts by Meiliu Wu, 2019
/*global document L*/
/*eslint-env jquery*/
/*eslint-disable no-extra-semi*/
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/

/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [40,-95.7129],
        zoom: 4
    });

    //add OSM base tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    //call getData function
    getData(map);

};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/pop.geojson", {
        dataType: "json",
        success: function(response){
            //create marker options
            /*var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };*/
            
            // create a Leaflet GeoJSON layer and assign it to var geoJsonLayer
            // 1. applying pointToLayer to AJAX data in geojson.js
            // 2. applying onEachFeature function
            // 3. use filter function to only show cities with 2015 populations greater than 20 million
            // var geoJsonLayer = L.geoJson(response, {
            L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    //Step 5: For each feature, determine its value for the selected attribute
                    var attribute = "2016";
                    var attValue = Number(feature.properties['2016']);

                    //Step 6: Give each feature's circle marker a radius based on its attribute value
                    //geojsonMarkerOptions.radius = calcPropRadius(attValue);

                    //create circle markers
                    // return L.circleMarker(latlng, geojsonMarkerOptions);
                    var layer = L.marker(latlng, {
                        icon: L.icon({
                            iconUrl: 'img/research.png',
                            iconSize: calcPropRadius(attValue)
                        }),
                        title: feature.properties['Cities']
                    })

                    //build popup content string
                    var popupContent = "<p><b>City:</b> " + feature.properties['Cities'] + "</p>"

                    //add formatted attribute to popup content string
                    popupContent += "<p><b>Population of scientific research and development services in " + attribute + ":</b> " + attValue + "</p>";

                    //bind the popup to the circle marker
                    layer.bindPopup(popupContent);
                    
                    //return the circle marker to the L.geoJson pointToLayer option
                    return layer;
                },
                //onEachFeature: onEachFeature,
                filter: function(feature, layer) {
                    return feature.properties['2016'] > 500;
                }
            }).addTo(map);
            
            /*// 4. create a L.markerClusterGroup layer
            var markers = L.markerClusterGroup();
            //add geojson to marker cluster layer
            markers.addLayer(geoJsonLayer);
            //add marker cluster layer to map
            map.addLayer(markers);*/
        }
    });
    
    L.popup({
        maxWidth: 640,
        keepInView: true,
        autoClose: false
    })
        .setLatLng([50,-95.7129])
        .setContent("<strong style='font-size:15px'>Population of scientific research and development services in U.S. Metropolitans, 2016</strong><br />"+
                     "<p style='font-size:11px;font-style:italic;'>This industry group comprises establishments engaged in conducting original investigation undertaken on a systematic basis to gain new knowledge (research) and/or the application of research findings or other scientific knowledge for the creation of new or significantly improved products or processes (experimental development). The industries within this industry group are defined on the basis of the domain of research; that is, on the scientific expertise of the establishment.</p>"+
                   "<p style='font-size:11px'><b>Data Source: </b>American FactFinder, 2012 NAICS code</p>")
        .openOn(map);
    
    //
    /*var content = "<strong style='font-size:15px'>Population of scientific research and development services in U.S. Metropolitans, 2016</strong><br />"+"<p style='font-size:11px'><b>Data Source: </b>American FactFinder, 2012 NAICS code</p>"
    var marker = L.marker([52,-125],{opacity: 0.01}).addTo(map);
    marker.bindTooltip(content,{
        permanent: true,
        direction: 'right',
        
    }).openTooltip();
*/
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

// proportional symbols
//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.8;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

$(document).ready(createMap);