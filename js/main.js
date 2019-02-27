// Javascripts by Meiliu Wu, 2019

/*eslint-env jquery*/
/*eslint-disable no-extra-semi*/
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-console*/

/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [40,-95.7129],
        zoom: 4
    });

    //add OSM base tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
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
            //create an attributes array
            var attributes = processData(response);
            //create proportional symbols
            createPropSymbols(response, map, attributes);
            //create sequential control over the 7 years
            createSequenceControls(map, attributes);
            
            createLegend(map, attributes);
            
            updateLegend(map, attributes[0]);
            // filter function
            // filterProcess(response, map, attributes);
        }
    });
    
    // pop up info about the dataset
    /*L.popup({
        maxWidth: 640,
        keepInView: true,
        autoClose: false
    })
        .setLatLng([50,-95.7129])
        .setContent("<strong style='font-size:15px'>Population of scientific research and development services in U.S. Metropolitans, 2016</strong><br />"+
                     "<p style='font-size:11px;font-style:italic;'>This industry group comprises establishments engaged in conducting original investigation undertaken on a systematic basis to gain new knowledge (research) and/or the application of research findings or other scientific knowledge for the creation of new or significantly improved products or processes (experimental development). The industries within this industry group are defined on the basis of the domain of research; that is, on the scientific expertise of the establishment.</p>"+
                   "<p style='font-size:11px'><b>Data Source: </b>American FactFinder, 2012 NAICS code</p>")
        .openOn(map);*/
    
    //
    /*var content = "<strong style='font-size:15px'>Population of scientific research and development services in U.S. Metropolitans, 2016</strong><br />"+"<p style='font-size:11px'><b>Data Source: </b>American FactFinder, 2012 NAICS code</p>"
    var marker = L.marker([52,-125],{opacity: 0.01}).addTo(map);
    marker.bindTooltip(content,{
        permanent: true,
        direction: 'right',
        
    }).openTooltip();
*/
};

//Above Example 3.8...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("20") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Example 2.1 line 34...Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

// a consolidated popup-creation function
function createPopup(properties, attribute, layer, radius){
    
    //popup content is now just the city name
    var popupContent = properties.Cities;
    //add formatted attribute to panel content string
    popupContent += "<p><b>Population of scientific research and development services in " + attribute + ":</b> " + properties[attribute] + "</p>";
    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius),
        closeButton: false 
    });
};

function pointToLayer(feature, latlng, attributes){
    //Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    //check
    console.log(attribute);
    
    //create marker options
    var options = {
        fillColor: "#add8e6",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    };
    
    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(feature.properties[attribute]);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    //var layer = L.marker(latlng, options);
    
    createPopup(feature.properties, attribute, layer, options.radius);

    ///event listeners to open popup on hover and fill panel on click...Example 2.5 line 4
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
        /*click: function(){
            $("#panel").html(popupContent);
        }*/
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Step 1: Create new sequence controls
function createSequenceControls(map, attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');
            
            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');

            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);
            
            return container;
        }
    });

    map.addControl(new SequenceControl());
    
	//set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
	
	//Below Example 3.5...replace button content with images
    $('#reverse').html('<img src="img/reverse.png" style = "height:30px">');
    $('#forward').html('<img src="img/forward.png" style = "height:30px">');
	
	//Below Example 3.6 in createSequenceControls()
    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
		//Called in both skip button and slider event listener handlers
		//Step 9: pass new attribute to update symbols
		updatePropSymbols(map, attributes[index]);
        updateLegend(map, attributes[index]);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
		
		//Called in both skip button and slider event listener handlers
		//Step 9: pass new attribute to update symbols
		updatePropSymbols(map, attributes[index]);
		updateLegend(map, attributes[index]);
    });

};

// create legend
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="250px" height="180px">';

            //array of circle names to base loop on
            //object to base loop on...replaces Example 3.10 line 1
                   //Example 3.6 line 4...array of circle names to base loop on
            /*var circles = ["max", "mean", "min"];

            //Step 2: loop to add each circle and text to svg string
            for (var i=0; i<circles.length; i++){
                //circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + 
                '" fill="#add8e6" fill-opacity="0.8" stroke="#000000" cx="90"/>';

                //text string
                svg += '<text id="' + circles[i] + '-text" x="160" y="'+ (i+1)*43 + '"></text>';
            };*/
            
            var circles = {
                max: 30,
                mean: 80,
                min: 150
            };
            
            //loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle + '" fill="#add8e6" fill-opacity="0.7" stroke="#000000" cx="100"/>';

                //text string
                svg += '<text id="' + circle + '-text" x="180" y="' + circles[circle] + '"></text>';
            };
            
            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

            return container;
        }
    });

    map.addControl(new LegendControl());
};

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//Example 3.7 line 1...Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    var content = "<h3>Population of scientific research </br>in " + attribute +"</h3>";

    //replace legend content
    $('#temporal-legend').html(content);

    //Example 3.8 line 43...get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);

     for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        $('#'+key).attr({
            cy: 160 - radius,
            r: radius
        });

        //Step 4: add legend text
        if (circleValues[key]>1000){
            $('#'+key+'-text').text(numberWithCommas(Math.round(circleValues[key]/1000)*1000));
        }else{
            $('#'+key+'-text').text(numberWithCommas(Math.round(circleValues[key]/100)*100));
        }
        
    };
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        //Example 3.16 line 4
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            
            /*var icon2 = L.icon({
                    iconUrl: 'img/research.png',
                    iconSize: calcPropRadius(props[attribute])
                })

            layer.setIcon(layer.options.icon = icon2);*/
            // this is for circle marker
            layer.setRadius(radius);
            
            createPopup(props, attribute, layer, radius);
        };
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

// proportional symbols
//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 0.3;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

$(document).ready(createMap);