export const setPlaceholderText = () => {
  const input = document.getElementById("searchBar__text");
  window.innerWidth < 400
    ? (input.placeholder = "City, State, Country")
    : (input.placeholder = "City, State, Country or Zip Code");
};

export const addSpinner = (element) => {
  //helperFunction
  animateButton(element);
  //window.settimeout, will be called after a sek
  setTimeout(animateButton, 1000, element);
};

const animateButton = (element) => {
  // we hide first the icon
  element.classList.toggle("none");
  element.nextElementSibling.classList.toggle("block");
  element.nextElementSibling.classList.toggle("none");
};

export const displayError = (headerMsg, srMsg) => {
  // helper functions
  updateWeatherLocationHeader(headerMsg);
  updateScreenReaderConfirmation(srMsg);
};

export const displayApiError = (statusCode) => {
  const properMsg = toProperCase(statusCode.message);
  updateWeatherLocationHeader(properMsg);
  updateScreenReaderConfirmation(`${properMsg}. Please try again.`);
  //here would be the place to debug
};

//helper function
const toProperCase = (text) => {
  // change text in array
  const words = text.split(" ");
  // map = for every element
  const properWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  // turn it back to string
  return properWords.join(" ");
};

const updateWeatherLocationHeader = (message) => {
  const h1 = document.getElementById("currentForecast__location");
  // if the index of Lat and Long is finded
  if (message.indexOf("Lat:") !== -1 && message.indexOf("Long:") !== -1) {
    // wandelt string in array
    const msgArray = message.split(" ");
    //creates a new Array and takes every element of the array and replaces the :
    const mapArray = msgArray.map((msg) => {
      return msg.replace(":", ": ");
    });
    // if indexof "-"  exist we need one more character
    const lat =
      mapArray[0].indexOf("-") === -1
        ? mapArray[0].slice(0, 10)
        : mapArray[0].slice(0, 11);
    // second element in the map array
    const lon =
      mapArray[1].indexOf("-") === -1
        ? mapArray[1].slice(0, 11)
        : mapArray[1].slice(0, 12);
    h1.textContent = `${lat} • ${lon}`;
  } else {
    h1.textContent = message;
  }
};

export const updateScreenReaderConfirmation = (message) => {
  document.getElementById("confirmation").textContent = message;
};

export const updateDisplay = (weatherJson, locationObj) => {
  //it will hide the infos
  fadeDisplay();
  clearDisplay();
  //get new Data.. get the icon
  const weatherClass = getWeatherClass(weatherJson.current.weather[0].icon);
  setBGImage(weatherClass);

  //build the screen reader statement
  const screenReaderWeather = buildScreenReaderWeather(
    weatherJson,
    locationObj
  );
  updateScreenReaderConfirmation(screenReaderWeather);

  //updateHeader will be updated on the top
  updateWeatherLocationHeader(locationObj.getName());

  //current conditions
  const ccArray = createCurrentConditionsDivs(
    weatherJson,
    locationObj.getUnit()
  );
  displayCurrentConditions(ccArray);

  // six day forecast
  displaySixDayForecast(weatherJson);

  setFocusOnSearch();

  //it will show the infos
  fadeDisplay();
};

//apply this one just to current conditions and the forecast
//its a toggle function
const fadeDisplay = () => {
  const cc = document.getElementById("currentForecast");
  // to hide what is there
  cc.classList.toggle("zero-vis");
  // to fade it in
  cc.classList.toggle("fade-in");

  const sixDay = document.getElementById("dailyForecast");
  sixDay.classList.toggle("zero-vis");
  sixDay.classList.toggle("fade-in");
};

//clearing out old data
const clearDisplay = () => {
  // the area with the dynamic content
  const currentConditions = document.getElementById(
    "currentForecast__conditions"
  );
  deleteContents(currentConditions);
  const sixDayForecast = document.getElementById("dailyForecast__contents");
  deleteContents(sixDayForecast);
};

// you can use it in any apps
const deleteContents = (parentElement) => {
  let child = parentElement.lastElementChild;
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
};

const getWeatherClass = (icon) => {
  console.log(icon);
  const firstTwoChars = icon.slice(0, 2);
  const lastChar = icon.slice(2);
  // translation of the api documentation
  // we find out what weather it is
  // and how to adjust our display
  const weatherLookup = {
    "09": "snow",
    10: "rain",
    11: "rain",
    13: "snow",
    50: "fog",
  };
  let weatherClass;
  if (weatherLookup[firstTwoChars]) {
    weatherClass = weatherLookup[firstTwoChars];
  } else if (lastChar === "d") {
    weatherClass = "clouds";
  } else {
    weatherClass = "night";
  }
  console.log(weatherClass);
  return weatherClass;
};

const setBGImage = (weatherClass) => {
  console.log(weatherClass);
  //root element from html
  document.documentElement.classList.add(weatherClass);
  document.documentElement.classList.forEach((img) => {
    //we just want the image if it matches the weatherclass
    // the partials (classe: snow, rain,...) from scss file are added
    if (img !== weatherClass) {
      document.documentElement.classList.remove(img);
    }
  });
};

// statement buil - read by a screen reader
const buildScreenReaderWeather = (weatherJson, locationObj) => {
  const location = locationObj.getName();
  const unit = locationObj.getUnit();
  //if it is imperial than fahrenheit
  const tempUnit = unit === "metric" ? "Celsius" : "Fahrenheit";
  return `${weatherJson.current.weather[0].description} and ${Math.round(
    Number(weatherJson.current.temp)
  )}°${tempUnit} in ${location}`;
};

const setFocusOnSearch = () => {
  document.getElementById("searchBar__text").focus();
};

const createCurrentConditionsDivs = (weatherObj, unit) => {
  const tempUnit = unit === "metric" ? "C" : "F";
  const windUnit = unit === "metric" ? "m/s" : "mph";
  const icon = createMainImgDiv(
    weatherObj.current.weather[0].icon,
    weatherObj.current.weather[0].description
  );
  const temp = createElem(
    "div",
    "temp",
    `${Math.round(Number(weatherObj.current.temp))}°`,
    tempUnit
  );
  const properDesc = toProperCase(weatherObj.current.weather[0].description);
  const desc = createElem("div", "desc", properDesc);

  const feels = createElem(
    "div",
    "feels",
    `Feels Like ${Math.round(Number(weatherObj.current.feels_like))}°`
  );

  const maxTemp = createElem(
    "div",
    "maxtemp",
    `High ${Math.round(Number(weatherObj.daily[0].temp.max))}°`
  );

  const minTemp = createElem(
    "div",
    "mintemp",
    `Low ${Math.round(Number(weatherObj.daily[0].temp.min))}°`
  );

  const humidity = createElem(
    "div",
    "humidity",
    `Humidity ${weatherObj.current.humidity}%`
  );

  const wind = createElem(
    "div",
    "wind",
    `Wind ${Math.round(Number(weatherObj.current.wind_speed))} ${windUnit}`
  );

  return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind];
};

const createMainImgDiv = (icon, altText) => {
  const iconDiv = createElem("div", "icon");
  iconDiv.id = "icon";
  const faIcon = translateIconToFontAwesome(icon);
  //for accessibility
  faIcon.ariaHidden = true;
  faIcon.title = altText;
  iconDiv.appendChild(faIcon);
  return iconDiv;
};

const createElem = (elemType, divClassName, divText, unit) => {
  const div = document.createElement(elemType);
  div.className = divClassName;
  if (divText) {
    div.textContent = divText;
  }
  if (divClassName === "temp") {
    const unitDiv = document.createElement("div");
    unitDiv.className = "unit";
    unitDiv.textContent = unit;
    div.appendChild(unitDiv);
  }
  return div;
};

// translates the icons from open weather app to similar icons of font awesome
const translateIconToFontAwesome = (icon) => {
  const i = document.createElement("i");
  const firstTwoChars = icon.slice(0, 2);
  const lastChar = icon.slice(2);
  switch (firstTwoChars) {
    case "01":
      if (lastChar === "d") {
        i.classList.add("far", "fa-sun");
      } else {
        i.classList.add("far", "fa-moon");
      }
      break;
    case "02":
      if (lastChar === "d") {
        i.classList.add("fas", "fa-cloud-sun");
      } else {
        i.classList.add("fas", "fa-cloud-moon");
      }
      break;
    case "03":
      i.classList.add("fas", "fa-cloud");
      break;
    case "04":
      i.classList.add("fas", "fa-cloud-meatball");
      break;
    case "09":
      i.classList.add("fas", "fa-cloud-rain");
      break;
    case "10":
      if (lastChar === "d") {
        i.classList.add("fas", "fa-cloud-sun-rain");
      } else {
        i.classList.add("fas", "fa-cloud-moon-rain");
      }
      break;
    case "11":
      i.classList.add("fas", "fa-poo-storm");
      break;
    case "13":
      i.classList.add("far", "fa-snowflake");
      break;
    case "50":
      i.classList.add("fas", "fa-smog");
      break;
    default:
      i.classList.add("far", "fa-question-circle");
  }
  return i;
};

const displayCurrentConditions = (currentConditionsArray) => {
  const ccContainer = document.getElementById("currentForecast__conditions");
  currentConditionsArray.forEach((cc) => {
    ccContainer.appendChild(cc);
  });
};

const displaySixDayForecast = (weatherJson) => {
  for (let i = 1; i <= 6; i++) {
    // it gets the daily forecast of the day we need
    const dfArray = createDailyForecastDivs(weatherJson.daily[i]);
    displayDailyForecast(dfArray);
  }
};

const createDailyForecastDivs = (dayWeather) => {
  // abbreviation = Abkuerzung
  const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
  const dayAbbreviation = createElem(
    "p",
    "dayAbbreviation",
    dayAbbreviationText
  );
  //const dayIcon
  const dayIcon = createDailyForecastIcon(
    dayWeather.weather[0].icon,
    dayWeather.weather[0].description
  );
  const dayHigh = createElem(
    "p",
    "dayHigh",
    `${Math.round(Number(dayWeather.temp.max))}°`
  );
  const dayLow = createElem(
    "p",
    "dayLow",
    `${Math.round(Number(dayWeather.temp.min))}°`
  );
  return [dayAbbreviation, dayIcon, dayHigh, dayLow];
};

const getDayAbbreviation = (data) => {
  // we need to multiply the data from the api with 1000 for creating a accurate Date
  const dateObject = new Date(data * 1000);
  //we get our string for the day like SUN, MON...
  const utcString = dateObject.toUTCString();
  return utcString.slice(0, 3).toUpperCase();
};

const createDailyForecastIcon = (icon, altText) => {
  const img = document.createElement("img");
  // we check again the width of the used screen to set a propersize  of the icon
  if (window.innerWidth < 768 || window.innerHeight < 1025) {
    // get the icon from open weather api
    img.src = `https://openweathermap.org/img/wn/${icon}.png`;
  } else {
    img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
  img.alt = altText;
  return img;
};

const displayDailyForecast = (dailyForecastArray) => {
  const dayDiv = createElem("div", "forecastDay");
  dailyForecastArray.forEach((el) => {
    dayDiv.appendChild(el);
  });
  const dailyForecastContainer = document.getElementById(
    "dailyForecast__contents"
  );
  dailyForecastContainer.appendChild(dayDiv);
};
