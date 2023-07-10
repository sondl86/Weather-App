import {
  setLocationObject,
  getHomeLocation,
  getWeatherFromCoords,
  getCoordsFromApi,
  cleanText,
} from "./dataFunctions.js";
import {
  setPlaceholderText,
  addSpinner,
  displayError,
  displayApiError,
  updateScreenReaderConfirmation,
  updateDisplay,
} from "./domFunctions.js";
import CurrentLocation from "./CurrentLocation.js";
const currentLoc = new CurrentLocation(); // currentLoc is now our current weather state

const initApp = () => {
  //add listeners for 6 different events
  const geoButton = document.getElementById("getLocation");
  geoButton.addEventListener("click", getGeoWeather);

  const homeButton = document.getElementById("home");
  homeButton.addEventListener("click", loadWeather);

  const saveButton = document.getElementById("save");
  saveButton.addEventListener("click", saveLocation);

  const unitButton = document.getElementById("unit");
  unitButton.addEventListener("click", setUnitPref);

  const refrehButton = document.getElementById("refresh");
  refrehButton.addEventListener("click", refreshWeather);

  //searchBar form
  const locationEntry = document.getElementById("searchBar__form");
  //event gets triggered by press enter key or by clicking the search button
  locationEntry.addEventListener("submit", submitNewLocation);

  // set up
  //javascript media query
  setPlaceholderText();

  // load weather
  loadWeather();
};
//we call the initApp function, when the page is loaded
document.addEventListener("DOMContentLoaded", initApp);

const getGeoWeather = (event) => {
  // we work with the navigator.geo location from the browser
  if (event && event.type === "click") {
    //add spinenr for animation
    const mapIcon = document.querySelector(".fa-map-marker-alt");
    addSpinner(mapIcon);
  }
  //we call geoError callback and we see if it is supported
  if (!navigator.geolocation) {
    return geoError();
  } else {
    // if yes we still can have an error
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
  }
};

const geoError = (errObj) => {
  // that covers both options from the upper function
  const errMsg = errObj ? errObj.message : "Geolocation not supported";
  displayError(errMsg, errMsg);
};

const geoSuccess = (position) => {
  // we create an object
  const myCoordsObj = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
    name: `Lat:${position.coords.latitude} Long:${position.coords.longitude}`,
  };
  //set location object
  //currentLoc from the class with the state
  setLocationObject(currentLoc, myCoordsObj);
  // update data and display
  updateDataAndDisplay(currentLoc);
};

const loadWeather = (event) => {
  // look for saved or favourite location
  const savedLocation = getHomeLocation();
  // if we dont have a saved one in local storage and no event - that means when the app loads
  // first
  //than get the geo location weather - if it is turned on in the browser
  if (!savedLocation && !event) {
    return getGeoWeather();
  }
  if (!savedLocation && event.type === "click") {
    displayError(
      "No Home Location saved.",
      "Sorry. Please save your home location first."
    );
    // beim ersten laden der app
  } else if (savedLocation && !event) {
    displayHomeLocationWeather(savedLocation);
  } else {
    const homeIcon = document.querySelector(".fa-home");
    addSpinner(homeIcon);
    displayHomeLocationWeather(savedLocation);
  }
};

const displayHomeLocationWeather = (home) => {
  // checkt type of, shuld be string from local storage
  if (typeof home === "string") {
    //than we want to define it as JSON
    const locationJson = JSON.parse(home);
    //than we create an object
    const myCoordsObj = {
      lat: locationJson.lat,
      lon: locationJson.lon,
      name: locationJson.name,
      unit: locationJson.unit,
    };
    setLocationObject(currentLoc, myCoordsObj);
    updateDataAndDisplay(currentLoc);
  }
};

const saveLocation = () => {
  //this is from the one object we defined from above from the class
  if (currentLoc.getLat() && currentLoc.getLon()) {
    const saveIcon = document.querySelector(".fa-save");
    addSpinner(saveIcon);
    const location = {
      name: currentLoc.getName(),
      lat: currentLoc.getLat(),
      lon: currentLoc.getLon(),
      unit: currentLoc.getUnit(),
    };
    //we store it in the local storage
    localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
    updateScreenReaderConfirmation(
      `Saved ${currentLoc.getName()} as home location.`
    );
  }
};

const setUnitPref = () => {
  const unitIcon = document.querySelector(".fa-chart-bar");
  addSpinner(unitIcon);
  currentLoc.toggleUnit();
  updateDataAndDisplay(currentLoc);
};

const refreshWeather = () => {
  const refreshIcon = document.querySelector(".fa-sync-alt");
  addSpinner(refreshIcon);
  updateDataAndDisplay(currentLoc);
};

//async function submitNewLocation (event){
const submitNewLocation = async (event) => {
  // a form reloads the page by default
  // event.preventDefault prevents it
  event.preventDefault();
  const text = document.getElementById("searchBar__text").value;
  const entryText = cleanText(text);
  // if there is no value
  if (!entryText.length) {
    return;
  }
  const locationIcon = document.querySelector(".fa-search");
  addSpinner(locationIcon);
  // call a async funtion for coordinates - we pass in value from form and Unit
  const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());
  //check if data exist or not
  if (coordsData) {
    // an HTPP response sucess (=200)
    if (coordsData.cod === 200) {
      // work with API data
      // we define the coordsObj, with the data from the api request
      const myCoordsObj = {
        // coordData is the data
        // coord thats where the coordinates are stored
        lat: coordsData.coord.lat,
        lon: coordsData.coord.lon,
        // we check the name
        // if the name exist than do a cityname and countryname
        name: coordsData.sys.country
          ? `${coordsData.name}, ${coordsData.sys.country}`
          : coordsData.name,
      };
      setLocationObject(currentLoc, myCoordsObj);
      updateDataAndDisplay(currentLoc);
    } else {
      displayApiError(coordsData);
    }
  } else {
    displayError("Connection Error", "Connection Error");
  }
};

const updateDataAndDisplay = async (locationObj) => {
  const weatherJson = await getWeatherFromCoords(locationObj);
  console.log(weatherJson);
  if (weatherJson) updateDisplay(weatherJson, locationObj);
};
