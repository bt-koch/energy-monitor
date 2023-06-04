# Energy Consumption Canton Basel-Stadt

Building an Open Government Data visualization for data about the energy
consumption of Canton Basel-Stadt.

## Preview

![](https://github.com/bt-koch/energy-monitor/blob/dbe9a498a6f05c66aafffeaa8cc18ed433917e7f/preview.jpeg)

## Context
After both the Confederation and the Canton of Basel-Stadt launched calls to
save electricity due to the threat of an energy shortage in the autumn of 2022,
the question whether the campaigns have had an impact on electricity consumption.

## Database
Total electrical energy drawn from the grid in the canton of Basel-Stadt within
15-minute intervals since 2012 as well as data on the consumption of customers
in the universal supply vs. the free market since 1 September 2022.

## Sources

### Line Chart

<img src="https://github.com/bt-koch/energy-monitor/blob/a6ef128c3bed94959a75e518be665a28a9491db7/img/line.png" width="200">


The line chart is based on [this code](https://github.com/arnauddri/d3-stock).  
Following major changes were made:  
- updated from d3 v3 to d3 v7
- allowed changing the frequency of data (daily, monthly, yearly)
- removed the area chart in the middle
- option to display confidence intervals of model
- option to display moving average
- option to show and hide the different lines
- option to choose between dynamic and static y axis

### Calendar Heatmap

The calendar heatmap is based on [this code](https://gist.github.com/alansmithy/6fd2625d3ba2b6c9ad48).  
Following major changes were made:  
- updated from d3 v3 to d3 v7
- option to select displayed years
- option to select number of categories

### Bar Chart

The bar chart is based on [this code](https://marcwie.github.io/blog/responsive-bar-chart-d3/).  
Following major changes were made:
- updated from d3 v4 to d3 v7
- allowed for negative values
- allowed changing frequency
- option to choose between absolute and relative differences

## About
This project was created as a part of the Lecture "Durchführung eines Open Data Projekts"
at the University of Bern.