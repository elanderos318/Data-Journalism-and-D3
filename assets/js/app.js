var svgWidth = 1100;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 200
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// y axis labels : [Obese %, Smokes %, Lacks Healthcare %]
// x axis labels : [Poverty $, Age(median), Household Income (median)]

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
    // create scale
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
            d3.max(healthData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
    // create scale
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
            d3.max(healthData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "poverty") {
      var label = "In Poverty (%):";
    } else if (chosenXAxis === "age") {
      var label = "Age (Median):";
    } else {
      var label = "Household Income (Median):"
    }

    if (chosenYAxis === "obesity") {
        var yLabel = "Obesity (%):";
    } else if (chosenYAxis === "smokes") {
        var yLabel = "Smokes (%):";
    } else {
        var yLabel = "Lacks Healthcare (%):"
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.abbr}<br>${label} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", toolTip.show)
      .on("mouseout", toolTip.hide);
  
    return circlesGroup;
  }


// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(healthData) {
    console.log("this")

    // parse data
    healthData.forEach(function(data) {
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;

        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
    })

    // xScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);

    // yScale function above csv import
    var yLinearScale = yScale(healthData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    //append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles

    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)


    // update ToolTip function
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


    // y axis labels : [Obese %, Smokes %, Lacks Healthcare %]
    // x axis labels : [Poverty $, Age(median), Household Income (median)]

    // data.obesity = +data.obesity;
    // data.smokes = +data.smokes;
    // data.healthcare = +data.healthcare;

    // data.poverty = +data.poverty;
    // data.age = +data.age;
    // data.income = +data.income;

    // Create group for  x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if(value !== chosenXAxis) {
                //replaces chosenXAxis with value
                chosenXAxis = value;
                // updates x scale for new data
                xLinearScale = xScale(healthData, chosenXAxis);
                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);
                // updates circles with new x values
                renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

            }
        })

    // data.obesity = +data.obesity;
    // data.smokes = +data.smokes;
    // data.healthcare = +data.healthcare;

    // Create group for  y-axis labels
    var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(0, ${height / 2}), rotate(-90)`);
    
    var obesityLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -40)
        .attr("value", "obesity") // value to grab for event listener
        .classed("active", true)
        .text("Obese (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -60)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -80)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Lacks Healthcare (%)");

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if(value !== chosenYAxis) {
                //replaces chosenYAxis with value
                chosenYAxis = value;
                // updates y scale for new data
                yLinearScale = yScale(healthData, chosenYAxis);
                // updates x axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);
                // updates circles with new x values
                renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


                if (chosenYAxis === "obesity") {
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "smokes") {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

            }
        })


})