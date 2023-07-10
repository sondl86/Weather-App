const WEATHER_API_KEY = "39967d1cfbeba21a0d3f45bd923e6359";

// coordsObj is the info of the location/Browser
export const setLocationObject = (locationObj, coordsObj) => {
    //deconstruct the coordsObject
    const {lat, lon, name, unit} = coordsObj;
    locationObj.setLat(lat);
    locationObj.setLon(lon);
    locationObj.setName(name);
    if(unit){
        locationObj.setUnit(unit);
    }
};

export const getHomeLocation = () =>{
    //pulls homeLocation from LocalStorage
    return localStorage.getItem("defaultWeatherLocation");
};

//we replace this function with some serverless functionality
// it will hide the API key in the frontend code
export const getWeatherFromCoords = async (locationObj) => {
    const lat = locationObj.getLat();
    const lon = locationObj.getLon();
    const units = locationObj.getUnit();
    // its the get request from the api
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${WEATHER_API_KEY}`;
    
    // we dont need to encode the url here, because there is no user input, so lat, lon and unit
    // is provided programatically
    try{
        const weatherStream = await fetch(url);
        const weatherJson = await weatherStream.json();
        return weatherJson;
    }catch(err){
        console.error(err);
    }
};

export const getCoordsFromApi = async (entryText, units) => {
    //zip codes things that starts and ends with numbers
    const regex = /^\d+$/g;
    const flag = regex.test(entryText) ? "zip" : "q";

    // inpoint: api.openweathermap.org/data/2.5/weather?
    // string literal searches for flag (zip code) or for name (entryText)
    const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${entryText}&units=
    ${units}&appid=${WEATHER_API_KEY}`;
    // we encode the url, because zou have maybe a word that has a whitespace in it
    // with endode for example the whitespace is replaced to %20, 
    //the minus sign at latitude or longitude is than %2d
    const encodedUrl = encodeURI(url);
    // connect to api
    try{
        // we get the data
        const dataStream = await fetch(encodedUrl);
        // we convert data to JSON
        const jsonData = await dataStream.json();
        console.log(jsonData);
        return jsonData;
    }catch(err){
        console.log(err.stack);
    }
};

export const cleanText = (text) => {
    //we clean stuff in front or after the text and look
    // for 2 or more spaces in a row
    const regex = / {2,}/g; 
    // wenn mehr als 2 leerzeilen sind, werden sie mit einem leerzeichen ersetzt
    const entryText = text.replaceAll(regex, " ").trim();
    return entryText;
}