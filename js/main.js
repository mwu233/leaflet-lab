// Javascripts by Meiliu Wu, 2019

/*eslint-env jquery*/
/*eslint-disable no-extra-semi*/
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-console*/

/* Map of GeoJSON data from Pop.geojson */

var curLayer;
var curMap;
var curResponse;
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
            // create an attributes array
            var attributes = processData(response);
            
            // update global variables curAttrs and curResponse
            curAttrs = attributes;
            curResponse = response;
            
            // create initial chart on the left panel with average data
            createChart(response,attributes);
            
            // create proportional symbols, with initial index as 0, i.e., 2010
            curLayer = createPropSymbols(response, map, attributes, 0);
            map.addLayer(curLayer);
            
            // create sequential control over the 7 years
            createSequenceControls(response, map, attributes); //add response here
            
            // create legend
            createLegend(map);
            
            // update legend
            updateLegend(map, attributes[0]);
            
        }
    });

};

// build an attributes array from the data
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
    // return the pop attrs retrieved from the first feature
    return attrs;
};

// create initial chart on the left panel with average data
function createChart(response,attrs){
    // create an matrix with the year as the 1st column, ave pop as 2nd
    var featureValues = [
        [attrs[0],7021],
        [attrs[1],7828],
        [attrs[2],7117],
        [attrs[3],7031],
        [attrs[4],7694],
        [attrs[5],7721],
        [attrs[6],7518]
    ] 
    
    // create an array with the 7 years' pop 
    var arr = featureValues.map(function(value,index) { return value[1]; });
    
    // record the min and max of the 7 years' pop
    var min = Math.min.apply( null, arr );
    var max = Math.max.apply( null, arr );
    
    // build the chartData var with certain settings
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

// Add circle markers for point features to the map
function createPropSymbols(data, map, attrs, idx){
    // remove current layer if exists
    if (curLayer){
        map.removeLayer(curLayer);
    };

    //create a new/updated Leaflet GeoJSON layer and return it to the map
    var geoJsonLayer = L.geoJson(data, {
        // for filtering with min and max
        filter: function(feature, layer) {
            return filterMinMax(feature, layer, idx);
        },
        // create circle markers for the metro points 
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attrs, idx);
        }
    });
    return geoJsonLayer;
};

// create circle markers for the metro points 
function pointToLayer(feature, latlng, attrs, idx){
    // Assign the current attribute based on the first index of the attributes array
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
    
    // create pop up for features
    createPopup(feature.properties, attribute, layer, options.radius);

    ///event listeners to open popup on hover and update the chart in panel on click
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        // update the chart on click
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

// initial global min and max for slider-range
var inputMin = 500;
var inputMax = 50000;

// function to update min and max for filtering
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

// Create new sequence controls
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
	
	// replace button content with images
    $('#reverse').html('<img src="img/reverse.png" style = "height:35px">');
    $('#forward').html('<img src="img/forward.png" style = "height:35px">');
	
    // click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        
        // increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            // if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            // if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        // update slider
        $('.range-slider').val(index);
        $('.sequence-text').html('<label class="sequence-text" for="sequence-control-container"><b>Year: 201' + index +'</b></label>');
		
        // Called in both skip button and slider event listener handlers
        // pass new attribute to update symbols
        curLayer = createPropSymbols(response, map, attrs, index);
        map.addLayer(curLayer);
        
		updatePropSymbols(map, attrs[index]);
        updateLegend(map, attrs[index]);
    });

    // input listener for slider
    $('.range-slider').on('input', function(){
        // get the new index value
        var index = $(this).val();
        // update slider text
        $('.sequence-text').html('<label class="sequence-text" for="sequence-control-container"><b>Year: 201' + index +'</b></label>');
		
        // Called in both skip button and slider event listener handlers
		// pass new attribute to update symbols
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

            // start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="250px" height="180px">';
            
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

// Update the legend with new attribute
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

        // add legend text
        if (circleValues[key]>1000){
            $('#'+key+'-text').text(numberWithCommas(Math.round(circleValues[key]/1000)*1000));
        }else{
            $('#'+key+'-text').text(numberWithCommas(Math.round(circleValues[key]/100)*100));
        }
        
    };
};

// add commas to numbers
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        //Example 3.16 line 4
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            
            // this is for circle marker
            layer.setRadius(radius);
            
            createPopup(props, attribute, layer, radius);
        };
    });
};

// proportional symbols
// calculate the radius of each proportional symbol
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