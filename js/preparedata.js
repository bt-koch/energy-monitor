// api url
const api_url = "https://data.bs.ch/api/records/1.0/search/?dataset=100233&q=&rows=-1&sort=timestamp_interval_start&facet=timestamp_interval_start&facet=year&facet=month&facet=day&facet=weekday&facet=dayofyear&facet=quarter&facet=weekofyear"
// Defining async function
async function getapi(url) {
    console.log("start api request...");
    // Storing response
    const response = await fetch(url);
   
    // Storing data in form of JSON
    var data = await response.json();
    console.log(data);
    // show(data);
    console.log("api request finished.");
}
// Calling that async function
getapi(api_url);
