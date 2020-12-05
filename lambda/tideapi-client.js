/* 
	Test script to use Google and Rapid APIs to access location and tide info.

	STEP 1 - Use Google Maps Platform to get Lat/Long
	STEP 2 - Call the Tides API to get the tidal info
	STEP 3 - Return the relevant text to be included in the skill's response
*/

const axios = require('axios');
const {Client} = require("@googlemaps/google-maps-services-js");
const config = require('./config.json');
const portsDB = require('./ports.json');
const listOfPorts = portsDB.ports;

const USER_AGENT = "tide-table/v1.0";
const RAPIDAPI_KEY = config.RAPIDAPI_KEY;
const GOOGLE_MAPS_API_KEY = config.GOOGLE_MAPS_API_KEY;
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
 * @returns a portInfo object containing latitude and longitude
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


function getTideInfo(requestedTideState, portName, latitude, longitude) {
	return new Promise((resolve, reject) => {
		console.log(`### getting tide info ${requestedTideState} for ${portName}`);
		setTimeout(function() {
			const t = {
				name: portName,
				latitude: latitude,
				longitdue: longitude,
				hrs: 4,
				mins: 16
			};
			console.log('retrieved tideinfo');
			resolve(t)
		 }, 200);
	});
}


// attempt to resolve into speakable text whatever the
// value is
function speakOutput(value) {
	console.log(value);
}

let port = 'inverness';
let promise = getPortLocation(port);
promise.then((portInfo) => {
	console.log(`${portInfo.name} is at latitude ${portInfo.latitude} and longitude ${portInfo.longitude}.`);
})

// useful for debug...
function printListOfPorts() {
	listOfPorts.forEach(p => {
		console.log(`${p.name}: ${p.latitude}`);
	});
}