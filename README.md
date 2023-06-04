# Energy Consumption Canton Basel-Stadt

Building an Open Government Data visualization for data about the energy
consumption of Canton Basel-Stadt.

## Preview

![](https://github.com/bt-koch/energy-monitor/blob/dbe9a498a6f05c66aafffeaa8cc18ed433917e7f/preview.jpeg)

## Context
After both the Confederation and the Canton of Basel-Stadt launched calls to
save electricity due to the threat of an energy shortage in the autumn of 2022,
the question whether the campaigns have had an impact on electricity consumption.
This dashboard allows to analyze the Open Government Dataset about actual and 
expected Cantonal electricity consumption of the Canton Basel-Stadt published by
its office for OGD.

## Database
The dataset contains the daily electricity consumption as well as the expected electricity consumption
calculated by means of a model based on the calendar day and the weather.

Electricity consumption is the sum of the electrical energy drawn daily from the grid in the canton of Basel-Stadt,
including grid losses. The daily electricity consumption is the sum of the quarter-hourly reported electricity consumption.
Electrical energy consumed locally directly at the point of production (e.g. from photovoltaic systems), which is not fed
into the public grid, is not included in the available data. The data include the consumption measured at all remotely read
meters installed in the grid and, as not 100% of the meters can be read remotely, supplementary data from the electricity
quantities fed into the grid.

## Sources of Code Snippets

### Line Chart

<img src="https://github.com/bt-koch/energy-monitor/blob/a6ef128c3bed94959a75e518be665a28a9491db7/img/line.png" width="50%">

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

<img src="https://github.com/bt-koch/energy-monitor/blob/4b1473dbd6e9c5e92b345e934b3862f631eb1d4c/img/calendar.png" width="50%">

The calendar heatmap is based on [this code](https://gist.github.com/alansmithy/6fd2625d3ba2b6c9ad48).  
Following major changes were made:  
- updated from d3 v3 to d3 v7
- option to select displayed years
- option to select number of categories

### Bar Chart

<img src="https://github.com/bt-koch/energy-monitor/blob/4b1473dbd6e9c5e92b345e934b3862f631eb1d4c/img/bar.png" width="50%">

The bar chart is based on [this code](https://marcwie.github.io/blog/responsive-bar-chart-d3/).  
Following major changes were made:
- updated from d3 v4 to d3 v7
- allowed for negative values
- allowed changing frequency
- option to choose between absolute and relative differences

## About
This project was created as a part of the Lecture "Durchführung eines Open Data Projekts"
at the University of Bern.