/* global d3, _ */

(function() {
  // adjust graph width, height and margins
  const margin = {top: 30, right: 20, bottom: 100, left: 20};
  const margin2 = {top: 210, right: 20, bottom: 100, left: 20};
  /* const width = 764 - margin.left - margin.right; */
  const width = 0.8*window.innerWidth - margin.left - margin.right;
  const height = 1.25*283 - margin.top - margin.bottom;
  const height2 = 1.25*283 - margin2.top - margin2.bottom;
  
  // define format of date
  /* const parseDate = d3.timeParse('%d/%m/%Y'); */
  const parseDate = d3.timeParse('%d.%m.%y');
  const bisectDate = d3.bisector(d => d.date).left;
  const legendFormat = d3.timeFormat('%b %d, %Y');
  

  const x = d3.scaleTime().range([0, width]); // defines width of displayed x axis for line and bar
  const x2 = d3.scaleTime().range([0, width]); // defines width of displayed x axis for area
  const y = d3.scaleLinear().range([height, 0]); // height of yaxis line
  const y1 = d3.scaleLinear().range([height, 0]); // ?
  const y2 = d3.scaleLinear().range([height2, 0]); // height of yaxis area
  const y3 = d3.scaleLinear().range([60, 0]); // height of the bars
  
  const xAxis = d3.axisBottom(x); // xaxis labels below line line
  const xAxis2 = d3.axisBottom(x2); // xaxis labels below line area
  const yAxis = d3.axisLeft(y); // yaxis labels left of line line
  
  // draw price line
  const priceLine = d3.line()
    /* .curve(d3.curveMonotoneX) */
    .x(d => x(d.date))
    .y(d => y(d.price));
  
  // draw moving average line
  const avgLine = d3.line()
    /* .curve(d3.curveMonotoneX) */
    .x(d => x(d.date))
    .y(d => y(d.average));
  
  // draw area chart
  const area2 = d3.area()
    /* .curve(d3.curveMonotoneX) */
    .x(d => x2(d.date))
    .y0(height2)
    .y1(d => y2(d.price));
  
  // append the SVG to HTML
  const svg = d3.select('#lineplot').append('svg')
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

    const make_y_axis = function () {
      return d3.axisLeft()
        .scale(y)
        .ticks(3); // vertical grid lines
    };
    
    // add some html elements
    // add linechart area
    const focus = svg.append('g')
      .attr('class', 'focus')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    // add barchart area
    /* const barsGroup = svg.append('g')
      .attr('class', 'volume')
      .attr('clip-path', 'url(#clip)')
      .attr('transform', `translate(${margin.left},${margin.top + 60 + 20})`); */
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
      .text('Stromverbrauch')
    // add filter selection
    const rangeSelection = legend
      .append('g')
      .attr('class', 'chart__range-selection')
      .attr('transform', 'translate(110, 0)');
    // y axis of line chart
    focus.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);
    // x axis of line chart
    focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);
    // y axis for bar chart
    /* barsGroup.append("g")
      .attr("class", "axis axis--y")
      .call(make_y_axis()); */
    // x axis for area chart
    context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height2})`)
      .call(xAxis2);

  // read the data
  d3.csv('./data/test.csv').then(function(data) {
    // get relevant columns and rename
    data = data.map(d => {
      return {
        date    : parseDate(d.Date),
        price   : +d.Close,
        average : +d.Average,
        volume : +d.Volume,
      }
    });

    // Define a brush for selecting a range along the x-axis, with the
    // extent set to the dimensions of the second chart, and the 'brushed'
    // function called on each brush event.
    var brush = d3.brushX()
      .extent([[0, 0], [width, height2]])
      .on('brush', brushed);
  
    var xRange = d3.extent(data, function(d) { return d.date; });
    console.log("xRange: " + xRange);
  
    x.domain(xRange);
    y.domain(d3.extent(data, function(d) { return d.price; }));
    y3.domain(d3.extent(data, function(d) { return d.price; }));
    x2.domain(x.domain());
    y2.domain(y.domain());
  
    var min = d3.min(data, function(d) { return d.price; });
    var max = d3.max(data, function(d) { return d.price; });
  
    var range = legend.append('text')
      .text(legendFormat(new Date(xRange[0])) + ' - ' + legendFormat(new Date(xRange[1])))
      .attr('x', width)
      .style('text-anchor', 'end');
  
    focus.append('g')
        .attr('class', 'y chart__grid')
        .call(make_y_axis()
          .tickSize(-width)
          .tickFormat(''));
  
    var averageChart = focus.append('path')
        .datum(data)
        .attr('class', 'chart__line chart__average--focus line')
        .attr('d', avgLine);
  
    var priceChart = focus.append('path')
        .datum(data)
        .attr('class', 'chart__line chart__price--focus line')
        .attr('d', priceLine);
  
    focus.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0 ,' + height + ')')
        .call(xAxis);
  
    focus.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(12, 0)')
        .call(yAxis);
  
    /* var focusGraph = barsGroup.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('class', 'chart__bars')
        .attr('x', function(d, i) { return x(d.date); })
        .attr('y', function(d) { return 155 - y3(d.price); })
        .attr('width', 1)
        .attr('height', function(d) { return y3(d.price); }); */
  
    var helper = focus.append('g')
      .attr('class', 'chart__helper')
      .style('text-anchor', 'end')
      .attr('transform', 'translate(' + width + ', 0)');
  
    var helperText = helper.append('text')
  
    var priceTooltip = focus.append('g')
      .attr('class', 'chart__tooltip--price')
      .append('circle')
      .style('display', 'none')
      .attr('r', 2.5);
  
    var averageTooltip = focus.append('g')
      .attr('class', 'chart__tooltip--average')
      .append('circle')
      .style('display', 'none')
      .attr('r', 2.5);

      const mouseArea = svg.append('g')
      .attr('class', 'chart__mouse')
      .append('rect')
      .attr('class', 'chart__overlay')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .on('mouseover', function() {
        helper.style('display', null);
        priceTooltip.style('display', null);
        averageTooltip.style('display', null);
      })
      .on('mouseout', function() {
        helper.style('display', 'none');
        priceTooltip.style('display', 'none');
        averageTooltip.style('display', 'none');
      })
      .on('mousemove', mousemove);
    
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

    function mousemove() {
      var x0 = x.invert(d3.pointer(event, this)[0]);
      var i = bisectDate(data, x0, 1);
      var d0 = data[i - 1];
      var d1 = data[i];
      var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      helperText.text(legendFormat(new Date(d.date)) + ' - effektiv: ' + d.price + ' erwartet: ' + d.average);
      priceTooltip.attr('transform', 'translate(' + x(d.date) + ',' + y(d.price) + ')');
      averageTooltip.attr('transform', 'translate(' + x(d.date) + ',' + y(d.average) + ')');

      const testdate = d3.select("#testdate");
      testdate.text(legendFormat(new Date(d.date)));
      const testvalue = d3.select("#testvalue");
      testvalue.text(d.price);
    }
    
    function brushed() {
      let ext = d3.brushSelection(this);
      console.log(d3.brushSelection(this));
      /* 
      if(input === "update") {
        console.log("bliblabu");
        ext = [start, end];
      } */
      // problem for range selection: stuff in condition doesnt run
      if (ext !== null) {
        // get x scale for the chart
        const xScale = d3.scaleTime()
          .domain([xRange[0], xRange[1]])
          .range([0, width]);

        // get corresponding x values for the brushed area
        const x0 = xScale.invert(ext[0]);
        const x1 = xScale.invert(ext[1]);
        console.log("x0: "+x0);
        console.log("x1: "+x1);

        x.domain([x0,x1]);
        y.domain([
          d3.min(data.map(function(d) { return (d.date >= x0 && d.date <= x1) ? d.price : max; })),
          d3.max(data.map(function(d) { return (d.date >= x0 && d.date <= x1) ? d.price : min; }))
        ]);
        range.text(legendFormat(new Date(x0)) + ' - ' + legendFormat(new Date(x1)))
        /* focusGraph.attr('x', function(d, i) { return x(d.date); }); */
        /* var days = Math.ceil((x1 - x0) / (24 * 3600 * 1000))
        focusGraph.attr('width', (40 > days) ? (40 - days) * 5 / 6 : 5) */
      }
    
      priceChart.attr('d', priceLine);
      averageChart.attr('d', avgLine);
      focus.select('.x.axis').call(xAxis);
      focus.select('.y.axis').call(yAxis);
    }
    
    const dateRange = ['1w', '1m', '3m', '6m', '1y', '5y'];
    dateRange.forEach((v, i) => {
      rangeSelection
        .append('text')
        .attr('class', 'chart__range-selection')
        .text(v)
        .attr('transform', `translate(${18 * i}, 0)`)
        .on('click', function(d) { focusOnRange(this.textContent); });
    });

    function focusOnRange(range) {

      const today = new Date(data[data.length - 1].date);
      const ext = new Date(data[data.length - 1].date);

      if (range === '1m') {
        ext.setMonth(ext.getMonth() - 1);
      }
    
      if (range === '1w') {
        ext.setDate(ext.getDate() - 7);
      }
    
      if (range === '3m') {
        ext.setMonth(ext.getMonth() - 3);
      }
    
      if (range === '6m') {
        ext.setMonth(ext.getMonth() - 6);
      }
    
      if (range === '1y') {
        ext.setFullYear(ext.getFullYear() - 1);
      }
    
      if (range === '5y') {
        ext.setFullYear(ext.getFullYear() - 5);
      }        

      brush.extent([ext, today]);
      brushed();
      context.select('brush').call(brush.extent([ext, today]));
    }

  })// end Data

  function type(d) {
    return {
      date    : parseDate(d.Date),
      price   : +d.Close,
      average : +d.Average,
      volume : +d.Volume,
    }
  }
}());