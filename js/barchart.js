function barchart(preview = false){
    // 1. Load the data from external source
    d3.csv("./data/eff_erw_daily.csv").then(function(data) {
        
        // parse the data
        var parseDate = d3.timeParse("%Y-%m-%d");
        data.forEach(function(d) {
            d.date=parseDate(d.Tag);
            d.value= +d["Differenz Stromverbrauch (effektiv-erwartet)"]/10**6; // Convert value to a number
            d.valueEff = +d["Stromverbrauch effektiv"]/10**6;
            d.valueErw = +d["Stromverbrauch erwartet"]/10**6;
        });

        // sort data according to date
        function sortByDateAscending(a, b) {
            return a.date - b.date;
        }
        data = data.sort(sortByDateAscending);

        // if selected, calculate relative difference
        if(document.getElementById("relDiff").checked && !preview){
            data.forEach(function(d) {
                d.value = ((d.valueEff - d.valueErw) / d.valueEff)*100;
              });
            var unit = "%"
        } else {
            var unit = "GWh"
        }

        // determine the last observed day
        const lastDay = d3.max(data, d => d.date);

        // some helper functions
        function getLastDayOfMonth(date) {
            // Set the date to the first day of the next month
            date.setMonth(date.getMonth() + 1, 0);
            return date;
        }
        function getLastDayOfYear(date) {
            // Set the date to the first day of the next year
            date.setFullYear(date.getFullYear() + 1, 0, 0);
            return date;
        }
        
        // define date format conditional on selected frequency
        if(document.getElementById("m-barchart").checked && !preview) {
            var formatAggregation = d3.timeFormat("%Y-%m");
            var formatTooltip = d3.timeFormat("%b %Y");
            var extendY = 0.05;
            // filter out unfinished month
            if(lastDay.getDate() < getLastDayOfMonth(lastDay)){
                data = data.filter(d => d.date.getMonth() !== (lastDay.getMonth() && lastDay.getFullYear()));
            }
        } else if(document.getElementById("y-barchart").checked && !preview) {
            var formatAggregation = d3.timeFormat("%Y");
            var formatTooltip = d3.timeFormat("%Y")
            var extendY = 0.01;
            // filter out unfinished year
            if(lastDay.getDate() < getLastDayOfYear(lastDay)){
                data = data.filter(d => d.date.getFullYear() !== lastDay.getFullYear());
            }
        } else {
            var formatTooltip = d3.timeFormat("%d.%m.%Y")
            var extendY = 0.1;
        }

        // aggregate data conditional on selected frequency
        if(!document.getElementById("d-barchart").checked && !preview){
        var aggregatedData = {};
        var dataCount = {};

        data.forEach(function(d) {
            var t = formatAggregation(d.date);
            if (!aggregatedData[t]) {
            aggregatedData[t] = {
                valueSum: 0
            };
            dataCount[t] = 0;
            }
            aggregatedData[t].valueSum += d.value;
            dataCount[t] += 1;
        });  

        data = Object.entries(aggregatedData).map(([t, values]) => {
            var count = dataCount[t];
            return {
                date: new Date(t),
                value: values.valueSum / count
            }
        })

        }

        // filter: keep displayed observation period
        let startYear, endYear;
        if(!preview){
            const sySelection = document.querySelectorAll('input[name="options-barchart-sy"]');
            sySelection.forEach(function(sy) {
                if(sy.checked){
                    startYear = sy.value;
                }
            });
    
            const eySelection = document.querySelectorAll('input[name="options-barchart-ey"]');
            eySelection.forEach(function(ey) {
                if(ey.checked){
                    endYear = ey.value;
                }
            })            
            const displayStartYear = d3.select("#barchart-selected-start-year");
            displayStartYear.text(startYear);
            const displayEndYear = d3.select("#barchart-selected-end-year");
            displayEndYear.text(endYear);

            data = data.filter(function(d) {
                var year = d.date.getFullYear();
                return year >= startYear && year <= endYear;
            });

        } else {
            const cutoff = new Date(lastDay);
            cutoff.setMonth(cutoff.getMonth() - 6);
            data = data.filter(function(d) {
                return d.date >= cutoff;
            });
        }

        // 2. Append svg-object for the bar chart to a div in webpage
        // (here we use a div with id=container)
        if(preview){
            // to do
            var width = 0.95*document.getElementById("card-barchart-preview").offsetWidth;
            var height = 400;
            var margin = {left: 90, top: 10, bottom: 50, right: 20};
        } else {
            var width = 0.75*window.innerWidth;
            var height = 500;
            var margin = {left: 90, top: 70, bottom: 50, right: 20};
        }


        var reference = "#barchart";
        if(preview){
            reference = reference+"-preview"
        }
        const svg = d3.select(reference)
                    .append("svg")
                    .attr("id", "svg")
                    .attr("width", width)
                    .attr("height", height);

        // 3. Define scales to translate domains of the data to the range of the svg
        var xMin = d3.min(data, function(d){return d.date});
        var xMax = d3.max(data, function(d){return d.date});
       

        var yMin = d3.min(data, function(d){return d.value})-extendY;
        var yMax = d3.max(data, function(d){return d.value})+extendY;

        var xScale = d3.scaleTime()
                    .domain([new Date(xMin), new Date(xMax)])
                    .range([margin.left, width-margin.right]);

        var yScale = d3.scaleLinear()
                    .domain([d3.min([yMin, 0]), yMax]) // Adjusted domain to include negative values
                    .range([height-margin.bottom, margin.top]);

        // 4. Draw and transform/translate horizontal and vertical axes
        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .attr("id", "x-axis")
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .attr("id", "y-axis")
            .call(yAxis);

        // 5. Draw individual bars and define mouse events for the tooltip
        var barwidth = (xScale.range()[1] - xScale.range()[0]) / data.length;


        const tooltip = d3.select("body")
                        .append("div")
                        .attr("id", "tooltip")
                        .style("visibility", "hidden");

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d) => xScale(new Date(d.date)))
            .attr("y", (d) => yScale(Math.max(0, d.value))) // Adjusted positioning of bars
            .attr("width", barwidth)
            .attr("height", (d) => Math.abs(yScale(d.value) - yScale(0))) // Adjusted height calculation
            .attr("class", "bar")
            .attr("data-date", (d) => d.date)
            .attr("data-gdp", (d) => d.value)
            .on("mouseover", function(event, d){
                tooltip.style("visibility", "visible")
                        .style("left", event.pageX+10+"px")
                        .style("top", event.pageY-80+"px")
                        .attr("data-date", d.date)
                        .html(formatTooltip(d.date) + ": " + Math.round(d.value*100)/100 + " " + unit );
            })
            .on("mousemove", function(event){
                tooltip.style("left", event.pageX+10+"px");
            })
            .on("mouseout", function(){
                tooltip.style("visibility", "hidden");
            });

        // 6. Finalize chart by adding title and axes labels

        svg.append("text")
            .attr("y", margin.left/4)
            .attr("x", -height/2)
            .attr("transform", "rotate(-90)")
            .attr("class", "label")
            .text("Differenz effektiv-erwartet [in "+unit+"]");

    });
}

barchart(preview=true);
barchart();

// Remove the svg element and call the callback function
function removeSvg(callback, preview) {
    if(!preview){
        reference="#barchart svg";
    } else {
        reference="#barchart-preview svg"
    }
    const svg = d3.select(reference);
    svg.transition().duration(0).remove().on('end', callback);
}
  
// Rerun barchart function
function rerunBarchart() {
    removeSvg(function(){
        barchart(preview=true);
    }, preview=true);
    removeSvg(function(){
        barchart(preview=false);
    }, preview=false)
}

window.addEventListener('resize', function() {
    rerunBarchart();
});
  
const optionsSelectionBar = document.querySelectorAll('input[name="options-barchart-sy"], input[name="options-barchart-ey"], input[name="options-barchart"], input[name="options-barchart-freq"]');
// Add event listener
optionsSelectionBar.forEach(function(opt) {
  opt.addEventListener('change', function() {
    const svg = d3.select("#barchart svg").remove();
    barchart();
  });
});

