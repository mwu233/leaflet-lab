// Javascripts by Meiliu Wu, 2019

/*eslint-env jquery*/
/*eslint-disable no-extra-semi*/
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-console*/

/* Map of GeoJSON data from MegaCities.geojson */

var curLayer;
var curMap;
var curResponsecurResponsecurResponsecurResponsecurResponse;
var curAttrs;
//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [35,-95.7129],
        zoom: 4
    });
    
    curMap = map;
    
    //add OSM base tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(curMap);

    //call getData function
    getData(curMap);

};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/pop.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);
            curAttrs = attributes;
            curResponse = response;
            //create input control
            //createTextControls(response,map,attributes);
            
            createChart(response,attributes);
            
            //create proportional symbols
            curLayer = createPropSymbols(response, map, attributes, 0);
            map.addLayer(curLayer);
            
            //create sequential control over the 7 years
            createSequenceControls(response, map, attributes); //add response here
            
            //create legend
            createLegend(map);
            
            //update legend
            updateLegend(map, attributes[0]);
            
        }
    });

};

//Above Example 3.8...Step 3: build an attributes array from the data
function processData(data){
    //empty array to hold attributes
    var attrs = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("20") > -1){
            attrs.push(attribute);
        };
    };

    return attrs;
};

function createChart(response,attrs){

    var featureValues = [
        [attrs[0],7021],
        [attrs[1],7828],
        [attrs[2],7117],
        [attrs[3],7031],
        [attrs[4],7694],
        [attrs[5],7721],
        [attrs[6],7518]
    ] 
    var arr = featureValues.map(function(value,index) { return value[1]; });
    var min = Math.min.apply( null, arr );
    var max = Math.max.apply( null, arr );
    
    var chartData ={
        type: 'line',
        "utc": true,
        "title": {
            "text": "Average Population from 20 Metros",
            "font-size": "13px",
            "adjust-layout":true,
            wrapText: true,
            margin: 5,
        },
        plotarea: {
            margin: "dynamic 15 30 dynamic",
        },
        series: [
        {
          values: featureValues
        }],
        "scale-y": {
            //"values": "0:1000:250",
            "values": (Math.floor(min*0.95/100)*100).toString()+":"+(Math.ceil(max*1.05/100)*100).toString()+":200",
            "line-color": "#f6f7f8",
            "shadow": 0,
            "guide": {
                "line-style": "dashed"
            },
            "label": {
                "text": "Population",
            },
            "minor-ticks": 0,
            "thousands-separator": ","
        },
        "plot": {
            "highlight":true,
            "tooltip-text": "Pop: %v<br>%k",
            "shadow": 0,
            "line-width": "2px",
            "marker": {
                "type": "circle",
                "size": 3
            },
            "highlight-state": {
                "line-width":3
            },
            "animation":{
              "effect":1,
              "sequence":2,
              "speed":50,
            }
        },

    };
    zingchart.render({
        id: 'chart-div',
        data: chartData,
        height: '100%',
        width: '100%'
    });
}

//Create Text controls
/*function createTextControls(response, map, attrs){
    var InputTextControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'inputtext-control-container');

            //create range input element (text)
              
            $(container).append('<label for="range-min" style = "padding-right: 3px">Min:</label>');
            $(container).append('<input id="range-min" type="text" value = '+inputMin+'>');
            $(container).append('<label for="range-max" style = "padding-right: 3px">Max:</label>');
            $(container).append('<input id="range-max" type="text" value = '+inputMax+'>');
            $(container).append('<button class="filter">Filter</button>');
            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;
        }
    });
    
    //map.addControl(new InputTextControl());
    map.addControl(new InputTextControl());
    
    $('.filter').html('<img src="img/filter.png" style = "width:85px">');
    
    $('.filter').click(function(){
        //get the old index value
        inputMin = Number($('#range-min').val());
        inputMax = Number($('#range-max').val());
        //console.log(inputMin);
        //console.log($("#range-min").val());
        //Step 8: update slider
        var index = $('.range-slider').val();
		//Called in both skip button and slider event listener handlers
		//Step 9: pass new attribute to update symbols
        
        curLayer = createPropSymbols(response, map, attrs, index);
        map.addLayer(curLayer);
        
		updatePropSymbols(map, attrs[index]);
        updateLegend(map, attrs[index]);
    });
}*/

//Example 2.1 line 34...Add circle markers for point features to the map
function createPropSymbols(data, map, attrs, idx){
    if (curLayer){
        map.removeLayer(curLayer);
    };

    //create a Leaflet GeoJSON layer and add it to the map
    var geoJsonLayer = L.geoJson(data, {
        filter: function(feature, layer) {
            return filterMinMax(feature, layer, idx);
        },
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attrs, idx);
        }
    });
    return geoJsonLayer;
};

function pointToLayer(feature, latlng, attrs, idx){
    //Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attrs[idx];
    //check
    //console.log(attribute);
    
    //create marker options
    var options = {
        fillColor: "#add8e6",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.6
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
        },
        click: function(){
            
            var featureValues = [
                [attrs[0],feature.properties[attrs[0]]],
                [attrs[1],feature.properties[attrs[1]]],
                [attrs[2],feature.properties[attrs[2]]],
                [attrs[3],feature.properties[attrs[3]]],
                [attrs[4],feature.properties[attrs[4]]],
                [attrs[5],feature.properties[attrs[5]]],
                [attrs[6],feature.properties[attrs[6]]]
            ]
            var arr = featureValues.map(function(value,index) { return value[1]; });
            var min = Math.min.apply( null, arr );
            var max = Math.max.apply( null, arr );
            console.log((Math.floor(min/100)*100).toString())
            var chartData ={
                type: 'line',
                "utc": true,
                "title": {
                    "text": feature.properties["Cities"],
                    "font-size": "13px",
                    "adjust-layout":true,
                    wrapText: true,
                    margin: 5,
                },
                plotarea: {
                    margin: "dynamic 15 30 dynamic",
                },
                series: [
                {
                  values: featureValues
                }],
                "scale-y": {
                    //"values": "0:1000:250",
                    "values": (Math.floor(min*0.95/100)*100).toString()+":"+(Math.ceil(max*1.11/100)*100).toString()+":200",
                    "line-color": "#f6f7f8",
                    "shadow": 0,
                    "guide": {
                        "line-style": "dashed"
                    },
                    "label": {
                        "text": "Population",
                    },
                    "minor-ticks": 0,
                    "thousands-separator": ","
                },
                "plot": {
                    "highlight":true,
                    "tooltip-text": "Pop: %v<br>%k",
                    "shadow": 0,
                    "line-width": "2px",
                    "marker": {
                        "type": "circle",
                        "size": 3
                    },
                    "highlight-state": {
                        "line-width":3
                    },
                    "animation":{
                      "effect":1,
                      "sequence":2,
                      "speed":50,
                    }
                },
                
            };
            zingchart.render({
                id: 'chart-div',
                data: chartData,
                height: '100%',
                width: '100%'
            });
        }
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

var inputMin = 500;
var inputMax = 50000;

$( function() {
    $( "#slider-range" ).slider({
        range: true,
        min: 0,
        max: 60000,
        step: 500,
        values: [ 500, 50000 ],
        slide: function( event, ui ) {
            $( "#amount" ).val(numberWithCommas(ui.values[0]) + " - " + numberWithCommas(ui.values[1]));
            inputMin = ui.values[0];
            inputMax = ui.values[1];
            
            var index = $('.range-slider').val();
            curLayer = createPropSymbols(curResponse, curMap, curAttrs, index);
            curMap.addLayer(curLayer);
        
            updatePropSymbols(curMap, curAttrs[index]);
            updateLegend(curMap, curAttrs[index]);
        }
    });
    $( "#amount" ).val(numberWithCommas(inputMin) + " - " + numberWithCommas(inputMax) );
} );

// for filtering with min and max
function filterMinMax(feature, layer, idx){
    var year = '201'+idx;
    //console.log(year);
    
    return (feature.properties[year] >= inputMin && feature.properties[year] <= inputMax);
}

//Step 1: Create new sequence controls
function createSequenceControls(response, map, attrs){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');

            //create range input element (slider)
            $(container).append('<label class="sequence-text" for="sequence-control-container"><b>Year: 2010</b></label>');
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
    $('#reverse').html('<img src="img/reverse.png" style = "height:35px">');
    $('#forward').html('<img src="img/forward.png" style = "height:35px">');
	
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
        $('.sequence-text').html('<label class="sequence-text" for="sequence-control-container"><b>Year: 201' + index +'</b></label>');
		//Called in both skip button and slider event listener handlers
		//Step 9: pass new attribute to update symbols
        
        curLayer = createPropSymbols(response, map, attrs, index);
        map.addLayer(curLayer);
        
		updatePropSymbols(map, attrs[index]);
        updateLegend(map, attrs[index]);
    });

    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
        $('.sequence-text').html('<label class="sequence-text" for="sequence-control-container"><b>Year: 201' + index +'</b></label>');
		//Called in both skip button and slider event listener handlers
		//Step 9: pass new attribute to update symbols
        curLayer = createPropSymbols(response, map, attrs, index);
        map.addLayer(curLayer);
        
		updatePropSymbols(map, attrs[index]);
		updateLegend(map, attrs[index]);
    });

};

// create legend
function createLegend(map){
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
    var content = "<h3 style='font-size:13px'>Population of scientific research </br>in " + attribute +"</h3>";

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

// a consolidated popup-creation function
function createPopup(properties, attribute, layer, radius){
    
    //popup content is now just the city name
    var popupContent = properties.Cities;
    //add formatted attribute to panel content string
    popupContent += "<p><b>Population of scientific research and development services in " + attribute + ":</b> " + numberWithCommas(properties[attribute]) + "</p>";
    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius),
        closeButton: false 
    });
};

$(document).ready(createMap);