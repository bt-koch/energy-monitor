# Energy Consumption Canton Basel-Stadt

Building an Open Government Data visualization for data about the energy
consumption of Canton Basel-Stadt.

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

The line chart is based on [this code](https://github.com/arnauddri/d3-stock).  
Following major changes were made:  
- updated from d3 v3 to d3 v7
- allowed changing the frequency of data (daily, weekly, monthly, yearly)
- removed the area chart in the middle
- option to display confidence intervals of model
- option to highlight certain time periods
- option to display moving average

### Calendar Heatmap

The calendar heatmap is based on [this code](https://gist.github.com/alansmithy/6fd2625d3ba2b6c9ad48).  
Following major changes were made:  
- updated from d3 v3 to d3 v7

### Bar Chart

The bar chart is based on [this code](https://marcwie.github.io/blog/responsive-bar-chart-d3/).  
Following major changes were made:
- updated from d3 v4 to d3 v7
- allowed for negative values

## About
This project was created as a part of the Lecture "Durchführung eines Open Data Projekts"
at the University of Bern.