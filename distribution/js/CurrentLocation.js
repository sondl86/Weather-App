export default class CurrentLocation {
  constructor() {
    this._name = "Current Location"; // unterstrich kennzeichnet eine private Eigenschaft
    this._lat = null; // latitude - breitengrad
    this._lon = null; // longitude - laengengrad
    this._unit = "imperial"; //or metric
  }

  getName() {
    return this._name;
  }

  setName(name) {
    this._name = name;
  }

  getLat() {
    return this._lat;
  }

  setLat(lat) {
    this._lat = lat;
  }

  getLon() {
    return this._lon;
  }

  setLon(lon) {
    this._lon = lon;
  }

  getUnit() {
    return this._unit;
  }

  setUnit(unit) {
    this._unit = unit;
  }

  toggleUnit() {
    if (this._unit === "metric") {
      this._unit = "imperial";
    } else {
      this._unit = "metric";
    }
  }
}
