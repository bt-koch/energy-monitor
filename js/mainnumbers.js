function mainnumbers(){
    // 1. Load the data from external source
    d3.csv("./data/eff_erw_daily.csv").then(function(data) {
        
        //parse the data
        var parseDate = d3.timeParse("%Y-%m-%d");
        data.forEach(function(d) {
            d.date=parseDate(d.Tag);
            d.value = +d["Stromverbrauch effektiv"]/10**6;
        });

        function calculateMovingAverage(data, periods) {
            const movingAverageData = [];
            for (let i = periods - 1; i < data.length; i++) {
              const sum = data.slice(i - periods + 1, i + 1).reduce((total, d) => total + d.value, 0);
              const average = sum / periods;
              movingAverageData.push({ ...data[i], movingAverage: average });
            }
            return movingAverageData;
        }
        const movingAveragePeriods = 7; // Adjust this value to set the number of periods for the moving average
        data = calculateMovingAverage(data, movingAveragePeriods);


        const lastDay = d3.max(data, d => d.date);
        var objLastDay = data.filter(function(d) {
            return d.date === lastDay;
        })
        var valueLastDay = objLastDay[0].value;
        var maLastDay = objLastDay[0].movingAverage;

        // text element 1
        const domValueLastDay = d3.select("#energy-consumption-lastDay");
        var textValueLastDay = Math.round(valueLastDay*10)/10+" GWh"
        textValueLastDay = textValueLastDay
        domValueLastDay.text(textValueLastDay);
    
        // text element 2
        const domMaLastDay = d3.select("#energy-consumption-MA");
        domMaLastDay.text(Math.round(maLastDay*10)/10+" GWh");

    }

)};

mainnumbers();
