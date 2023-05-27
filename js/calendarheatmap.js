    
function calendarheatmap(){
    const svg = d3.select('#calendarheatmap svg').remove(); // to prevent adding multiple plots since function is called each time tab is klicked
    var title="Stromverbrauch effektiv in GWh";
    var units=" GWh";
    var breaks = [2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5];
    var colours = ["#ffffd4", "#ffeda0", "#fed98e", "#fdbe71", "#fe9929", "#d95f0e", "#a02c03", "#993404"];
    
    //general layout information
    var cellSize = 17;
    var xOffset=20;
    var yOffset=60;
    var calY=35;//offset of calendar in each group
    var calX=25;
    var width = 960;
    var height = 163;
    var parseDate = d3.timeParse("%d.%m.%y");
    format = d3.timeFormat("%d-%m-%Y");
    toolDate = d3.timeFormat("%d.%m.%Y");
    
    d3.csv("./data/eff_erw_daily.csv").then(function(data) {
        
        //set up an array of all the dates in the data which we need to work out the range of the data
        var dates = new Array();
        var values = new Array();
        
        //parse the data
        data.forEach(function(d)    {
                dates.push(parseDate(d.Tag));
                values.push(d["Stromverbrauch effektiv"]/10**6);
                d.date=parseDate(d.Tag);
                d.value=d["Stromverbrauch effektiv"]/10**6;
                d.year=d.date.getFullYear();//extract the year from the data
        });
        
        var startYear = document.getElementById("start-year").value;
        var endYear = document.getElementById("end-year").value;
        var numberOfYears = endYear - startYear + 1;
        console.log(numberOfYears);

        data = data.filter(function(d) {
            var year = d.year;
            return year >= startYear && year <= endYear;
          });
        
        var yearlyData = d3.group(data, function(d) { return d.year; });
        
        var svg = d3.select("#calendarheatmap").append("svg")
            .attr("width","90%")
            .attr("viewBox","0 0 "+(xOffset+width)+" "+(yOffset+numberOfYears*height+numberOfYears*calY))
            
        //title
        svg.append("text")
            .attr("x",xOffset)
            .attr("y",20)
            .text(title);
        
        //create an SVG group for each year
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
        
        //create a daily rectangle for each year
        var rects = cals.append("g")
            .attr("id","alldays")
            .selectAll(".day")
            .data(function(d) { return d3.timeDay.range(new Date(parseInt(d[0]), 0, 1), new Date(parseInt(d[0]) + 1, 0, 1)); })
            .enter().append("rect")
            .attr("id",function(d) {
                return "_"+format(d);
                //return toolDate(d.date)+":\n"+d.value+" dead or missing";
            })
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) {
                return xOffset+calX+(d3.timeWeek.count(d3.timeYear(d), d) * cellSize);
            })
            .attr("y", function(d) { return calY+(d.getDay() * cellSize); })
            .datum(format);
        
        //create day labels
        var days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        var dayLabels=cals.append("g").attr("id","dayLabels")
        days.forEach(function(d,i)    {
            dayLabels.append("text")
            .attr("class","dayLabel")
            .attr("x",xOffset)
            .attr("y",function(d) { return calY+(i * cellSize); })
            .attr("dy","0.9em")
            .text(d);
        })
        
        //let's draw the data on
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
            .attr("stroke","#ccc")
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
        
        //append a title element to give basic mouseover info
        dataRects.append("title")
            .text(function(d) { return toolDate(d.date)+":\n"+Math.round(d.value*10)/10+units; });
        
        //add monthly outlines for calendar
        cals.append("g")
            .attr("id","monthOutlines")
            .selectAll(".month")
            .data(function(d) { 
                return d3.timeMonth.range(new Date(parseInt(d[0]), 0, 1), new Date(parseInt(d[0]) + 1, 0, 1)); 
            })
            .enter().append("path")
            .attr("class", "month")
            .attr("transform","translate("+(xOffset+calX)+","+calY+")")
            .attr("d", monthPath);
        
        //retrieve the bounding boxes of the outlines
        var BB = new Array();
        var mp = document.getElementById("monthOutlines").childNodes;
        for (var i=0;i<mp.length;i++){
            BB.push(mp[i].getBBox());
        }
        
        var monthX = new Array();
        BB.forEach(function(d,i){
            boxCentre = d.width/2;
            monthX.push(xOffset+calX+d.x+boxCentre);
        })

        //create centered month labels around the bounding box of each month path
        //create day labels
        var months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        var monthLabels=cals.append("g").attr("id","monthLabels")
        months.forEach(function(d,i)    {
            monthLabels.append("text")
            .attr("class","monthLabel")
            .attr("x",monthX[i])
            .attr("y",calY/1.2)
            .text(d);
        })
        
        //create key
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
                return i*130;
            })
            .attr("fill",function(d){
                return d;
            });
        
        key.selectAll("text")
            .data(colours)
            .enter()
            .append("text")
            .attr("x",function(d,i){
                return cellSize+5+(i*130);
            })
            .attr("y","1em")
            .text(function(d,i){
                if (i<colours.length-1){
                    return "up to "+breaks[i];
                }   else    {
                    return "over "+breaks[i-1];   
                }
            });
        
    });//end data load
    
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

/* Problem:
getBBox() retourniert 0 wenn die relevanten Elemente nicht im Browser sichtbar sind. Dadurch werden die
Labels nicht richtig positioniert.
Aus diesem Grund soll der Code erst ausgeführt werden, wenn das relevante Tab per Click gewählt wird,
sodass dann die Positionen korrekt berechnet werden können. Etwas unschön ist die kleine "Ladezeit",
allerdings ist diese wirklich nur sehr kurz und nur beim ersten Anzeigen nötig.
*/
//calendarheatmap();
document.getElementById("tab-calendar").addEventListener("click", calendarheatmap);
document.getElementById("start-year").addEventListener("change", calendarheatmap);
document.getElementById("end-year").addEventListener("change", calendarheatmap);
