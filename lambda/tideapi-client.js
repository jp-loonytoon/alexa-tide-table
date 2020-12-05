/* 
	Test script to use Google and Rapid APIs to access location and tide info.

	STEP 1 - Use Places API from Google Maps platform to get Lat/Long
		see https://developers.google.com/places/web-service/overview for more detail
	STEP 2 - Call the Tides API to get the tidal info
		see https://rapidapi.com/apihood/api/tides for more detail
	STEP 3 - Return the relevant text to be included in the skill's response
*/

const axios = require('axios');
const config = require('./config.json');

const USER_AGENT = "tide-table/v1.0";
const RAPIDAPI_KEY = config.RAPIDAPI_KEY;
const GOOGLE_MAPS_API_KEY = config.GOOGLE_MAPS_API_KEY;

// default params for Tides API
const DEFAULT_RADIUS = 25;			// if no prediction is found in requested coordinates widen the search by this distance (in kms)
const DEFAULT_INTERVAL = 0;			// don't return interval measurements
const DEFAULT_DURATION = 24 * 60;	// return data for next 24 hours

const HIGH_TIDE = "HIGH TIDE";
const LOW_TIDE = "LOW TIDE";


/**
 * @param {str} a string you wish to convert to title case
 * @returns the string converted to title text
 */
function toTitleCase(str) {
	return str.replace(
	  /\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	);
}


/**
 * @param {portName} the coastal location to get location info for
 * @returns a portInfo object containing name, latitude and longitude of port
 */
function getPortLocation(portName) {
	return new Promise((resolve, reject) => {
		// the p record will store location info for the port
		const p = {
			name: toTitleCase(portName),
			latitude: "",
			longitude: ""
		};

		// call the Places API from Google Maps to get the tidal info
		axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
			headers: {
				"accept": "application/json",
				"user-agent": USER_AGENT
			},
			params: {
				key: GOOGLE_MAPS_API_KEY,
				input: p.name,
				inputtype: "textquery",
				fields: "name,geometry"
			}
		})
		.then(function(response) {		// fill in the p record and resolve the promise
			if (response && response.status === 200 && response.data) {
				const result = response.data.candidates[0];
				console.log(`Found location "${result.name}" for port "${p.name}"`);
				p.latitude = result.geometry.location.lat;
				p.longitude = result.geometry.location.lng;
				resolve(p);
			} else {					// or reject if there was a problem
				reject(response.status);
			}
		});
	});
 }


/**
 * @param {portName} the coastal location to get tide info for
 * @param {tideState} HIGH_TIDE or LOW_TIDE
 * @returns a tideInfo object containing info on the next tide for the given port
 */
function getTideInfo(portInfo, tideState) {
	return new Promise((resolve, reject) => {
		// the t record will store tide info for the port
		const t = {
			name: portInfo.name,
			latitude: portInfo.latitude,
			longitude: portInfo.longitude,
			state: tideState,
			hoursUntil: 0,
			minutesUntil: 0,
			isTomorrow: false
		};

		// call the Tides API to get the tidal info
		axios.get('https://tides.p.rapidapi.com/tides', {
			headers: {
				"x-rapidapi-key": RAPIDAPI_KEY,
				"x-rapidapi-host": "tides.p.rapidapi.com",
				"accept": "application/json",
				"user-agent": USER_AGENT
			},
			params: {
				latitude: portInfo.latitude,
				longitude: portInfo.longitude,
				radius: DEFAULT_RADIUS,
				interval: DEFAULT_INTERVAL,
				duration: DEFAULT_DURATION
			}
		})
		.then(function(response) {
			if (response && response.status === 200 && response.data) {
				const result = response.data.extremes;
				const nextTide = result.find(elem => elem.state === tideState);
				const nextTideTime = nextTide.timestamp;
				const timeNow = Math.floor(Date.now() / 1000);
				const timeToNextTide = nextTideTime - timeNow;
				t.hoursUntil = Math.floor(timeToNextTide / 3600);
				t.minutesUntil = Math.floor((timeToNextTide - (t.hoursUntil * 3600)) / 60);
				resolve(t);
			} else {
				reject(response.status);
			}
		})
		.catch(function(error) {
			console.error(error);
		});
	});
}


let port = 'portsmouth';
let tidestate = LOW_TIDE;

getPortLocation(port)
	.then((portInfo) => {
		console.log(`${portInfo.name} is at latitude ${portInfo.latitude} and longitude ${portInfo.longitude}.`);
		return getTideInfo(portInfo, tidestate);
	})
	.then((tideInfo) => {
		console.log(`${tideInfo.name} *${tideInfo.state}* is in ${tideInfo.hoursUntil} hours and ${tideInfo.minutesUntil} mins.`);
	});
