//initialize function called when the script loads - Debugged by Meiliu Wu 02/04/2019
/*eslint-env jquery*/
/*eslint-disable no-extra-semi*/
/*global document, alert*/

function initialize(){
	cities();
};

//function to create a table with cities and their populations
function cities(){
	//define two arrays for cities and population
	var cityPop = [
		{ 
			city: 'Madison',
			population: 233209
		},
		{
			city: 'Milwaukee',
			population: 594833
		},
		{
			city: 'Green Bay',
			population: 104057
		},
		{
			city: 'Superior',
			population: 27244
		}
	];

	//append the table element to the div
	$("#mydiv").append("<table>");

	//append a header row to the table
	$("table").append("<tr>");
	
	//add the "City" and "Population" columns to the header row
	$("tr").append("<th>City</th><th>Population</th>");
	
	//loop to add a new row for each city
    for (var i = 0; i < cityPop.length; i++){
        //assign longer html strings to a variable
        var rowHtml = "<tr><td>" + cityPop[i].city + "</td><td>" + cityPop[i].population + "</td></tr>";
        //add the row's html string to the table
        $("table").append(rowHtml);
    };
    // add the city size column 
    addColumns(cityPop);
    // add other events
    addEvents();
};

//function to add a column to the existing table
function addColumns(cityPop){
    // for each tr element, which will be indexed as i
    $("tr").each(function(i){
        // for the first table row, which is table header
        if (i == 0){
            $(this).append("<th>City Size</th>");
        } else {
            // for any other table rows, assign corresponding citySize according to the population 
            var citySize;
            // 'Small' if less than 100000
            if (cityPop[i-1].population < 100000){
                citySize = 'Small';
            // 'Medium' if more than 100000 and less than 500000
            } else if (cityPop[i-1].population < 500000){
                citySize = 'Medium';
            // 'Large' if more than 500000
            } else {
                citySize = 'Large';
            };
            // append the citySize var to this row
            $(this).append("<td>" + citySize + "</td>");
        };
    });
};

//function to add some events to the existing table
function addEvents(){
    // function will be triggered if mouse hovers over the table
	$('table').mouseover(function(){
		// composite the color var based on RBG values generated randomly
		var color = "rgb(";
        // generate three values for R,G,B
		for (var i=0; i<3; i++){
            // create a var random to store each RGB value generated randomly
			var random = Math.round(Math.random() * 255);
            // correctly format the color var format
			color += random;
            // (R,G,B)
			if (i<2){
				color += ",";
			
			} else {
				color += ")";
		};
        // this table's color will be changed based on the  
		$(this).css('color', color);
	}});
    // function to create an alert massage when called
	function clickme(){
        // alert message will pop up
		alert('Hey, you clicked me!');
	};
    // function clickme will be triggered if the table is clicked
	$('table').on('click', clickme);
};

//call the initialize function when the document has loaded
$(document).ready(initialize);