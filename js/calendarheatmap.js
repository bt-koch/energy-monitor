    
function calendarheatmap(preview=false){
    const svg = d3.select('#calendarheatmap svg').remove(); // to prevent adding multiple plots since function is called each time tab is klicked
    var title="Stromverbrauch effektiv in GWh";
    var units=" GWh";

    // choose number of categories
    if(preview){
        var n = 8;
    } else {
        var n = Number(document.getElementById("nCategories").value);
    }
    
    var domainMin = 2;
    var domainMax = 6;

    var baseColor = "#7f8faf"; // Base color

    var breaks = [];
    var step = (domainMax - domainMin) / n;

    for (var i = 0; i <= n; i++) {
        breaks.push(domainMin + i * step);
    }

    var colours = [];

    // step size for lightness
    var lightnessStep = Math.floor(100 / (n + 1));

    for (var i = 0; i < n; i++) {
        var lightness = 100 - (i + 1) * lightnessStep; // reverse the lightness calculation
        var color = "hsl(216, 48%, " + lightness + "%)"; // blue-gray color scheme using HSL
        colours.push(color);
    }
        
    // general layout information
    if(preview){
        var previewScale = 0.65;
        var cellSize = 17*previewScale;
        var xOffset=20*previewScale;
        var yOffset=60*previewScale;
        var calY=35*previewScale;
        var calX=25*previewScale;
        var width = 960*previewScale;
        var height = 163*previewScale;
    } else {
        var cellSize = 17;
        var xOffset=20;
        var yOffset=60;
        var calY=35;
        var calX=25;
        var width = 960;
        var height = 163;
    }

    var parseDate = d3.timeParse("%Y-%m-%d");
    format = d3.timeFormat("%d-%m-%Y");
    toolDate = d3.timeFormat("%d.%m.%Y");
    
    d3.csv("./data/eff_erw_daily.csv").then(function(data) {
        
        // set up an array of all the dates in the data which we need to work out the range of the data
        var dates = new Array();
        var values = new Array();
        
        // parse the data
        data.forEach(function(d)    {
                dates.push(parseDate(d.Tag));
                values.push(d["Stromverbrauch effektiv"]/10**6);
                d.date=parseDate(d.Tag);
                d.value=d["Stromverbrauch effektiv"]/10**6;
                d.year=d.date.getFullYear();
        });

        // sort data according to date
        function sortByDateAscending(a, b) {
            return a.date - b.date;
        }
        data = data.sort(sortByDateAscending);

        // chose observation period
        let startYear, endYear;
        if(!preview){
            const sySelection = document.querySelectorAll('input[name="options-calendar-sy"]');
            sySelection.forEach(function(sy) {
                if(sy.checked){
                    startYear = sy.value;
                }
            });
    
            const eySelection = document.querySelectorAll('input[name="options-calendar-ey"]');
            eySelection.forEach(function(ey) {
                if(ey.checked){
                    endYear = ey.value;
                }
            })
    
            const displayStartYear = d3.select("#selected-start-year");
            displayStartYear.text(startYear);
            const displayEndYear = d3.select("#selected-end-year");
            displayEndYear.text(endYear);
        } else {
            startYear = 2022;
            endYear = 2023;
        }

        var numberOfYears = endYear-startYear+1;

        // filter data
        data = data.filter(function(d) {
            var year = d.year;
            return year >= startYear && year <= endYear;
        });
        
        var yearlyData = d3.group(data, function(d) { return d.year; });

        // draw svg
        var reference = "#calendarheatmap";
        var scale = "90%";
        if(preview){
            reference = reference+"-preview";
            scale = "100%"
        }
        var svg = d3.select(reference).append("svg")
            .attr("width",scale)
            .attr("viewBox","0 0 "+(xOffset+width)+" "+(yOffset+numberOfYears*height+numberOfYears*calY))
        
        // create an SVG group for each year
        var cals = svg.selectAll("g")
            .data(yearlyData)
            .enter()
            .append("g")
            .attr("id",function(d){
                return d[0];
            })
            .attr("transform",function(d,i){
                return "translate(0,"+(yOffset+(i*(height+calY)))+")";  
            });
        
        var labels = cals.append("text")
            .attr("class","yearLabel")
            .attr("x",xOffset)
            .attr("y",15)
            .text(function(d){return d[0]});
        
        // create a daily rectangle for each year
        var rects = cals.append("g")
            .attr("id","alldays")
            .selectAll(".day")
            .data(function(d) { return d3.timeDay.range(new Date(parseInt(d[0]), 0, 1), new Date(parseInt(d[0]) + 1, 0, 1)); })
            .enter().append("rect")
            .attr("id",function(d) {
                return "_"+format(d);
            })
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) {
                return xOffset+calX+(d3.timeWeek.count(d3.timeYear(d), d) * cellSize);
            })
            .attr("y", function(d) { return calY+(d.getDay() * cellSize); })
            .datum(format);
        
        // create day labels
        var days = ['So','Mo','Di','Mi','Do','Fr','Sa'];
        var dayLabels=cals.append("g").attr("id","dayLabels")
        days.forEach(function(d,i)    {
            dayLabels.append("text")
            .attr("class","dayLabel")
            .attr("x",xOffset)
            .attr("y",function(d) { return calY+(i * cellSize); })
            .attr("dy","0.9em")
            .text(d);
        })
        
        // let's draw the data on

        const tooltip = d3.select("body")
                        .append("div")
                        .attr("id", "tooltip")
                        .style("visibility", "hidden");

        var dataRects = cals.append("g")
            .attr("id","dataDays")
            .selectAll(".dataday")
            .data(function(d){
                return d[1];   
            })
            .enter()
            .append("rect")
            .attr("id",function(d) {
                return format(d.date)+":"+d.value;
            })
            .attr("stroke","#686868")
            .attr("width",cellSize)
            .attr("height",cellSize)
            .attr("x", function(d){return xOffset+calX+(d3.timeWeek.count(d3.timeYear(d.date), d.date) * cellSize);})
            .attr("y", function(d) { return calY+(d.date.getDay() * cellSize); })
            .attr("fill", function(d) {
                if (d.value<breaks[0]) {
                    return colours[0];
                }
                for (i=0;i<breaks.length+1;i++){
                    if (d.value>=breaks[i]&&d.value<breaks[i+1]){
                        return colours[i];
                    }
                }
                if (d.value>breaks.length-1){
                    return colours[breaks.length]   
                }
            })
            .on("mouseover", function(event, d){
                tooltip.style("visibility", "visible")
                        .style("left", event.pageX+10+"px")
                        .style("top", event.pageY-50+"px")
                        .attr("data-date", d.date)
                        .html(toolDate(d.date)+": "+Math.round(d.value*10)/10+units );
            })
            .on("mousemove", function(event){
                tooltip.style("left", event.pageX+"px");
            })
            .on("mouseout", function(){
                tooltip.style("visibility", "hidden");
            });
        
        // append a title element to give basic mouseover info
        dataRects.append("title")
            .text(function(d) { return toolDate(d.date)+":\n"+Math.round(d.value*10)/10+units; });
        
        // add monthly outlines for calendar
        var monthReference = "monthOutlines"
        if(preview){
            monthReference = monthReference+"-preview"
        }
        cals.append("g")
            .attr("id",monthReference)
            .selectAll(".month")
            .data(function(d) { 
                return d3.timeMonth.range(new Date(parseInt(d[0]), 0, 1), new Date(parseInt(d[0]) + 1, 0, 1)); 
            })
            .enter().append("path")
            .attr("class", "month")
            .attr("transform","translate("+(xOffset+calX)+","+calY+")")
            .attr("d", monthPath);
        
        // retrieve the bounding boxes of the outlines
        var BB = new Array();
        var mp = document.getElementById(monthReference).childNodes;
        for (var i=0;i<mp.length;i++){
            BB.push(mp[i].getBBox());
        }

        var monthX = new Array();
        BB.forEach(function(d,i){
            boxCentre = d.width/2;
            monthX.push(xOffset+calX+d.x+boxCentre);
        })

        // create centered month labels around the bounding box of each month path
        var months = ['JAN','FEB','MRZ','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'];
        var monthLabels=cals.append("g").attr("id","monthLabels")
        months.forEach(function(d,i)    {
            monthLabels.append("text")
            .attr("class","monthLabel")
            .attr("x",monthX[i])
            .attr("y",calY/1.2)
            .text(d);
        })
        
        // create key
        var key = svg.append("g")
            .attr("id","key")
            .attr("class","key")
            .attr("transform",function(d){
                return "translate("+xOffset+","+(yOffset-(cellSize*1.5))+")";
            });
        

        key.selectAll("rect")
            .data(colours)
            .enter()
            .append("rect")
            .attr("width",cellSize)
            .attr("height",cellSize)
            .attr("x",function(d,i){
                return i*90;
            })
            .attr("fill",function(d){
                return d;
            });
        
        key.selectAll("text")
            .data(colours)
            .enter()
            .append("text")
            .attr("x",function(d,i){
                return cellSize+5+(i*90);
            })
            .attr("y","1em")
            .text(function(d,i){
                if (i<colours.length-1){
                    return "bis zu "+Math.round(breaks[i]*100)/100+" GWh";
                }   else    {
                    return "über "+Math.round(breaks[i-1]*100)/100+" GWh";   
                }
            });
        
    }); //end data load
    
    //pure Bostock - compute and return monthly path data for any year
    function monthPath(t0) {
        var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
            d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
            d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
        return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
            + "H" + w0 * cellSize + "V" + 7 * cellSize
            + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
            + "H" + (w1 + 1) * cellSize + "V" + 0
            + "H" + (w0 + 1) * cellSize + "Z";
    }
}

calendarheatmap(preview=true);

/* Problem:
getBBox() returns 0 if relevant elements are not shown in browser. This leads to the problem that
labels are not positioned correctly.
For this reason, the code should be executed only when relevant tab is clicked and content is
displayed, allowing to calculate the positions correctly.
Unfortunately this leads to a short "loading time", however, this is rather short and is only
necessary when first displaying.
*/

document.getElementById("tab-calendar").addEventListener("click", function(){calendarheatmap(preview=false)});

/* rerun function conditional on frequency chosen */
const timeSelectionCal = document.querySelectorAll('input[name="options-calendar-sy"], input[name="options-calendar-ey"], input[name="options-calendar-categories"]');
timeSelectionCal.forEach(function(opt) {
  opt.addEventListener('change', function() {
    const svg = d3.select('#calendarheatmap svg').remove();
    calendarheatmap(preview=false);
  });
});