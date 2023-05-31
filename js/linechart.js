function linechart(preview = false){
  
  // conditional alerts / displayed information
  if(document.getElementById("y-lineplot").checked && document.getElementById("showMA").checked && !preview){
    alert("Achtung: durch die Berechnung des rollenden Durchschnitts werden die ersten 6 Beobachtungen abgeschnitten. Dies ist insb. bei jährlicher Frequenz auffallend.");
  }
  if(document.getElementById("d-lineplot").checked
    && document.getElementById("showEff").checked
    && !preview ||
    document.getElementById("d-lineplot").checked
    && document.getElementById("showErw").checked
    && !preview){
    alert("Achtung: bei Anzeige täglicher Daten über gesamten Zeitraum sind Linien nicht mehr sichtbar. Es ist empfohlen entweder Zeitraum einzuschränken oder nur rollender Durchschnitt anzuzeigen.")
  }

  if (document.getElementById("dynY").checked) {
    document.getElementById("dynY-alert").style.display = "block";
  } else {
    document.getElementById("dynY-alert").style.display = "none";
  }
  

  // adjust graph width, height and margins
  let margin, margin2, width, height, height2;
  if(preview) {
    // todo
    margin = {top: 30, right: 40, bottom: 0, left: 20};
    margin2 = {top: 210, right: 0, bottom: 100, left: 0};
    width = 1.4*document.getElementById("card-barchart-preview").offsetWidth - margin.left - margin.right;
    height = 1*283 - margin.top - margin.bottom;
    height2 = 1*283 - margin2.top - margin2.bottom;
  } else {
    margin = {top: 30, right: 0, bottom: 100, left: 0};
    margin2 = {top: 210, right: 0, bottom: 100, left: 0};
    width = 0.8*window.innerWidth - margin.left - margin.right;
    height = 1.25*283 - margin.top - margin.bottom;
    height2 = 1.25*283 - margin2.top - margin2.bottom;
  }

  
  // define format of date
  const parseDate = d3.timeParse("%Y-%m-%d");
  const bisectDate = d3.bisector(d => d.date).left;
  if(document.getElementById("m-lineplot").checked && !preview) {
    var legendFormat = d3.timeFormat("%B %Y");
  } else if(document.getElementById("y-lineplot").checked && !preview) {
    var legendFormat = d3.timeFormat("%Y");
  } else {
    var legendFormat = d3.timeFormat('%d.%m.%Y');
  }

  // define scales
  const x = d3.scaleTime().range([0, width]); // defines width of displayed x axis for line and bar
  const x2 = d3.scaleTime().range([0, width]); // defines width of displayed x axis for area
  const y = d3.scaleLinear().range([height, 0]); // height of yaxis line
  const y1 = d3.scaleLinear().range([height, 0]); // ?
  const y2 = d3.scaleLinear().range([height2, 0]); // height of yaxis area

  const xAxis = d3.axisBottom(x); // xaxis labels below line line
  const xAxis2 = d3.axisBottom(x2); // xaxis labels below line area
  const yAxis = d3.axisLeft(y); // yaxis labels left of line line

  // draw eff line
  const effLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.valueEff));
  
  // draw erw line
  const erwLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.valueErw));

  // draw MA line
  const maLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.movingAverage));

  // draw CI
  const CIArea = d3.area()
    .x(d => x(d.date))
    .y0(d => y(d.lowerCI))
    .y1(d => y(d.upperCI));
  
  // draw area chart
  const area2 = d3.area()
    .x(d => x2(d.date))
    .y0(height2)
    .y1(d => y2(d.valueEff));
  
  // append the SVG to HTML
  var reference = "#lineplot"
  if(preview){
    reference = reference+"-preview"
  }
  const svg = d3.select(reference).append('svg')
    .attr('class', 'chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom + 60)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // This code creates a clipping rectangle that limits the visible area of the SVG element.
  // The 'defs' element is used to define reusable graphical elements,
  // and the 'clipPath' element is used to create a clipping path that can be applied to other elements.
  // The 'id' attribute sets a unique identifier for the clipping path.
  // The 'rect' element creates a rectangular shape that serves as the clipping path.
  // The 'width' and 'height' attributes set the dimensions of the clipping rectangle to match the SVG element.
  svg.append('defs').append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', width)
    .attr('height', height);

  // define y axis
  const make_y_axis = function () {
    return d3.axisLeft()
      .scale(y)
      .ticks(3); // vertical grid lines
  };
      
  // add linechart area
  const focus = svg.append('g')
    .attr('class', 'focus')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // add areachart area
  const context = svg.append('g')
    .attr('class', 'context')
    .attr('transform', `translate(${margin2.left},${margin2.top + 60})`);

  // add legend
  const legend = svg.append('g')
    .attr('class', 'chart__legend')
    .attr('width', width)
    .attr('height', 30)
    .attr('transform', `translate(${margin2.left}, 10)`);

  // add header
  legend.append('text')
    .attr('class', 'chart__symbol')
    .text('Stromverbrauch in GWh')
  
  // add filter selection
  const rangeSelection = legend
    .append('g')
    .attr('class', 'chart__range-selection')
    .attr('transform', 'translate(110, 0)');

  /*
  if(!preview){
    context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height2})`)
      .call(xAxis2);
  }
  */


  // read the data
  d3.csv('./data/eff_erw_daily.csv').then(function(data) {
    // get relevant columns and rename
    data = data.map(d => {
      return {
        date : parseDate(d.Tag),
        valueEff : +d["Stromverbrauch effektiv"]/10**6,
        valueErw : +d["Stromverbrauch erwartet"]/10**6,
        lowerCI : +d["Prognoseintervall tief"]/10**6,
        upperCI : +d["Prognoseintervall hoch"]/10**6
      }
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
    if(document.getElementById("m-lineplot").checked && !preview) {
      var formatAggregation = d3.timeFormat("%Y-%m");
      // filter out unfinished month
      if(lastDay.getDate() < getLastDayOfMonth(lastDay)){
        data = data.filter(d => d.date.getMonth() !== lastDay.getMonth());
      }
    } else if(document.getElementById("y-lineplot").checked && !preview) {
      var formatAggregation = d3.timeFormat("%Y");
      // filter out unfinished year
      if(lastDay.getDate() < getLastDayOfYear(lastDay)){
        data = data.filter(d => d.date.getFullYear() !== lastDay.getFullYear());
      }
    }

    // aggregate data conditional on selected frequency
    if(!document.getElementById("d-lineplot").checked && !preview){
      var aggregatedData = {};
      data.forEach(function(d) {
        var t = formatAggregation(d.date);
        if (!aggregatedData[t]) {
          aggregatedData[t] = {
            valueEffSum: 0,
            valueErwSum: 0,
            lowerCISum: 0,
            upperCISum: 0
          };
        }
        aggregatedData[t].valueEffSum += d.valueEff;
        aggregatedData[t].valueErwSum += d.valueErw;
        aggregatedData[t].lowerCISum += d.lowerCI;
        aggregatedData[t].upperCISum += d.upperCI;
      });  
  
      data = Object.entries(aggregatedData).map(([t, values]) => {
        return {
          date: new Date(t),
          valueEff: values.valueEffSum,
          valueErw: values.valueErwSum,
          lowerCI: values.lowerCISum,
          upperCI: values.upperCISum
        }
      })
    }

    // sort data according to date
    function sortByDateAscending(a, b) {
        return a.date - b.date;
    }
    data = data.sort(sortByDateAscending);

    if(preview){
      const cutoff = new Date(lastDay);
      cutoff.setMonth(cutoff.getMonth() - 6);
      data = data.filter(function(d) {
        return d.date >= cutoff;
      });
    }

    if(document.getElementById("showMA").checked && !preview){
      function calculateMovingAverage(data, periods) {
        const movingAverageData = [];
        for (let i = periods - 1; i < data.length; i++) {
          const sum = data.slice(i - periods + 1, i + 1).reduce((total, d) => total + d.valueEff, 0);
          const average = sum / periods;
          movingAverageData.push({ ...data[i], movingAverage: average });
        }
        return movingAverageData;
      }
  
      const movingAveragePeriods = 7; // give user possibility to change?
      data = calculateMovingAverage(data, movingAveragePeriods);
    }

    // Define a brush for selecting a range along the x-axis, with the
    // extent set to the dimensions of the second chart, and the 'brushed'
    // function called on each brush event.
    var brush = d3.brushX()
      .extent([[0, 0], [width, height2]])
      .on('brush', brushed);

    var xRange = d3.extent(data, function(d) { return d.date; });
    var min = d3.min(data, function(d) { return d.lowerCI; });
    var max = d3.max(data, function(d) { return d.upperCI; });

    x.domain(xRange);

    // define y domain: dynamic and fixed
    if(document.getElementById("dynY").checked){
      
      // variables which define y-domain
      var variables = ["upperCI", "lowerCI"];

      // Calculate the extent for both variable
      var extents = variables.map(function(variable) {
        return d3.extent(data, function(d) { return d[variable]; });
      });

      // concatenate both extents to one array
      extents = extents[0].concat(extents[1]);

      // set domain respectively
      y.domain(d3.extent(extents));
    } else {
      y.domain([0,max]);
    }

    x2.domain(x.domain());
    y2.domain(y.domain());

    var range = legend.append('text')
      .text(legendFormat(new Date(xRange[0])) + ' - ' + legendFormat(new Date(xRange[1])))
      .attr('x', width)
      .style('text-anchor', 'end');

    if(document.getElementById("showCI").checked && !preview) {
      var CIChart = focus.append("path")
        .datum(data)
        .attr("fill", "#e6f6fe")
        .attr("stroke", "none")
        .attr("d", CIArea);
    }

    focus.append('g')
        .attr('class', 'y chart__grid')
        .call(make_y_axis()
          .tickSize(-width)
          .tickFormat(''));

    if(document.getElementById("showErw").checked || preview) {
      var erwChart = focus.append('path')
        .datum(data)
        .attr('class', 'chart__line chart__erw--focus line')
        .attr('d', erwLine);
    }

    if(document.getElementById("showMA").checked && !preview) {
      var maChart = focus.append('path')
        .datum(data)
        .attr('class', 'chart__line chart__ma--focus line')
        .attr('d', maLine)
    }
    
    if(document.getElementById("showEff").checked || preview) {
      var effChart = focus.append('path')
      .datum(data)
      .attr('class', 'chart__line chart__eff--focus line')
      .attr('d', effLine);
    }

    focus.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0 ,' + height + ')')
        .call(xAxis);

    focus.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(12, 0)') // pos of y labels
        .call(yAxis);

    var helper = focus.append('g')
      .attr('class', 'chart__helper')
      .style('text-anchor', 'end')
      .attr('transform', 'translate(' + width + ', 0)');

    var helperText = helper.append('text')

    if(document.getElementById("showEff").checked || preview) {
      var effTooltipRadius = 2.5;
    } else {
      var effTooltipRadius = 0;
    }
    var effTooltip = focus.append('g')
      .attr('class', 'chart__tooltip--eff')
      .append('circle')
      .style('display', 'none')
      .attr('r', effTooltipRadius);

    if(document.getElementById("showErw").checked || preview) {
      var erwTooltipRadius = 2.5;
    } else {
      var erwTooltipRadius = 0;
    }
    var erwTooltip = focus.append('g')
      .attr('class', 'chart__tooltip--erw')
      .append('circle')
      .style('display', 'none')
      .attr('r', erwTooltipRadius);
   

    const mouseArea = svg.append('g')
      .attr('class', 'chart__mouse')
      .append('rect')
      .attr('class', 'chart__overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .on('mouseover', function() {
        helper.style('display', null);
        effTooltip.style('display', null);
        erwTooltip.style('display', null);
      })
      .on('mouseout', function() {
        helper.style('display', 'none');
        effTooltip.style('display', 'none');
        erwTooltip.style('display', 'none');
      })
      .on('mousemove', mousemove);

    if(!preview){
      context.append('path')
        .datum(data)
        .attr('class', 'chart__area area')
        .attr('d', area2);
    
      
      context.append('g')
        .attr('class', 'x axis chart__axis--context')
        .attr('transform', `translate(0, ${height2 - 22})`)
        .call(xAxis2);
      
    
      context.append('g')
        .attr('class', 'x brush')
        .call(brush)
        .selectAll('rect')
          .attr('y', -6)
          .attr('height', height2 + 7);
    }

    function mousemove() {
      var x0 = x.invert(d3.pointer(event, this)[0]);
      var i = bisectDate(data, x0, 1);
      var d0 = data[i - 1];
      var d1 = data[i];
      var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      if(document.getElementById("showEff").checked || preview) {
        var effHelperText = " - effektiv: " + Math.round(d.valueEff*10)/10
      } else {
        var effHelperText = "";
      }
      if(document.getElementById("showErw").checked || preview) {
        var erwHelperText = ' - erwartet: ' + Math.round(d.valueErw*10)/10;
      } else {
        var erwHelperText = "";
      }
      helperText.text(legendFormat(new Date(d.date)) + effHelperText + erwHelperText);
      effTooltip.attr('transform', 'translate(' + x(d.date) + ',' + y(d.valueEff) + ')');
      erwTooltip.attr('transform', 'translate(' + x(d.date) + ',' + y(d.valueErw) + ')');

      const testdate = d3.select("#testdate");
      testdate.text(legendFormat(new Date(d.date)));
      const testvalue = d3.select("#testvalue");
      testvalue.text(d.valueEff);
    }
    
    function brushed() {
      let ext = d3.brushSelection(this);

      console.log(ext);
  
      // problem for range selection: stuff in condition doesnt run
      if (ext !== null) {
        // get x scale for the chart
        const xScale = d3.scaleTime()
          .domain([xRange[0], xRange[1]])
          .range([0, width]);

        // get corresponding x values for the brushed area
        const x0 = xScale.invert(ext[0]);
        const x1 = xScale.invert(ext[1]);

        console.log(x0);
        console.log(x1);

        x.domain([x0,x1]);


        if(document.getElementById("dynY").checked){
          y.domain([
            d3.min(data.map(function(d) { return (d.date >= x0 && d.date <= x1) ? d.lowerCI : max; })),
            d3.max(data.map(function(d) { return (d.date >= x0 && d.date <= x1) ? d.upperCI : min; }))
          ]);
        }
        
        range.text(legendFormat(new Date(x0)) + ' - ' + legendFormat(new Date(x1)))
      }

      if(document.getElementById("showCI").checked && !preview) {
        CIChart.attr("d", CIArea);
      }
      if(document.getElementById("showEff").checked || preview) {
        effChart.attr('d', effLine);
      }
      if(document.getElementById("showErw").checked || preview) {
        erwChart.attr('d', erwLine);
      }
      if(document.getElementById("showMA").checked && !preview) {
        maChart.attr('d', maLine);
      }
      
      focus.select('.x.axis').call(xAxis);
      focus.select('.y.axis').call(yAxis);

    }

  })// end Data

}
  
linechart(preview = true);
linechart(preview = false);


/* rerun function conditional on frequency chosen */
const optionSelection = document.querySelectorAll('input[name="options-lineplot"]');
// Add event listener to each radio button
optionSelection.forEach(function(opt) {
  opt.addEventListener('change', function() {
    const svg = d3.select('#lineplot svg').remove();
    linechart();
  });
});

window.addEventListener('resize', function() {
  const svg = d3.select('#lineplot svg').remove();
  linechart();
  const svg2 = d3.select('#lineplot-preview svg').remove();
  linechart(preview = true);
});
