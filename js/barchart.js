function barchart(){
    // 1. Load the data from external source
    d3.csv("./data/eff_erw_daily.csv").then(function(data) {
        

        //parse the data
        var parseDate = d3.timeParse("%d.%m.%y");
        data.forEach(function(d) {
            d.date=parseDate(d.Tag);
            d.value= +d["Differenz Stromverbrauch (effektiv-erwartet)"]/10**6; // Convert value to a number
        });

        const lastDay = d3.max(data, d => d.date);

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
        if(document.getElementById("m-barchart").checked) {
            var formatAggregation = d3.timeFormat("%Y-%m");
            var formatTooltip = d3.timeFormat("%b %Y");
            var extendY = 0.5;
            // filter out unfinished month
            if(lastDay.getDate() < getLastDayOfMonth(lastDay)){
                data = data.filter(d => d.date.getMonth() !== lastDay.getMonth());
            }
        } else if(document.getElementById("y-barchart").checked) {
            var formatAggregation = d3.timeFormat("%Y");
            var formatTooltip = d3.timeFormat("%Y")
            var extendY = 1;
            // filter out unfinished year
            if(lastDay.getDate() < getLastDayOfYear(lastDay)){
                data = data.filter(d => d.date.getFullYear() !== lastDay.getFullYear());
            }
        } else {
            var formatTooltip = d3.timeFormat("%d.%m.%Y")
            var extendY = 0.1;
        }

        // aggregate data conditional on selected frequency
        if(!document.getElementById("d-barchart").checked){
        var aggregatedData = {};
        data.forEach(function(d) {
            var t = formatAggregation(d.date);
            if (!aggregatedData[t]) {
            aggregatedData[t] = {
                valueSum: 0
            };
            }
            aggregatedData[t].valueSum += d.value;
        });  
    
        data = Object.entries(aggregatedData).map(([t, values]) => {
            return {
            date: new Date(t),
            value: values.valueSum
            }
        })
        }

        console.log(data);

        // sort data according to date
        function sortByDateAscending(a, b) {
            return a.date - b.date;
        }
        data = data.sort(sortByDateAscending);

        // 2. Append svg-object for the bar chart to a div in your webpage
        // (here we use a div with id=container)
        var width = 0.75*window.innerWidth;
        var height = 500;
        var margin = {left: 90, top: 70, bottom: 50, right: 20};

        const svg = d3.select("#barchart")
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
                        .html(formatTooltip(d.date) + "</br>" + Math.round(d.value*10)/10 + " GWh" );
            })
            .on("mousemove", function(event){
                tooltip.style("left", event.pageX+10+"px");
            })
            .on("mouseout", function(){
                tooltip.style("visibility", "hidden");
            });

        // 6. Finalize chart by adding title and axes labels
        /*
        svg.append("text")
            .attr("x", margin.left + (width - margin.left - margin.right) / 2)
            .attr("y", height - margin.bottom / 5)
            .attr("class", "label")
            .text("Date");
        */

        svg.append("text")
        .attr("y", margin.left/4)
        .attr("x", -height/2)
        .attr("transform", "rotate(-90)")
        .attr("class", "label")
        .text("Differenz effektiv-erwartet [GWh]");

        /*
        svg.append("text")
            .attr("x", margin.left + (width - margin.left - margin.right) / 2)
            .attr("y", margin.top / 2)
            .attr("id", "title")
            .text("United States GDP");
        */
    });
}

barchart();

const optionSelectionBar = document.querySelectorAll('input[name="options-barchart"]');
// Remove the svg element and call the callback function
function removeSvg(callback) {
    const svg = d3.select('#barchart svg');
    svg.transition().duration(0).remove().on('end', callback);
  }
  
  // Rerun barchart function
  function rerunBarchart() {
    removeSvg(barchart);
  }
  
  // Event listeners
  optionSelectionBar.forEach(function(opt) {
    opt.addEventListener('change', function() {
      console.log("ringidingidingding");
      rerunBarchart();
    });
  });
  
  window.addEventListener('resize', function() {
    console.log('Window resized ding dong ding dong');
    rerunBarchart();
  });