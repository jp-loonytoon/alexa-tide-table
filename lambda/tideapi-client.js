/* 
	Test script to use Google and Rapid APIs to access location and tide info.

	STEP 1 - Use Google Maps Platform to get Lat/Long
	STEP 2 - Call the Tides API to get the tidal info
	STEP 3 - Return the relevant text to be included in the skill's response
*/

const axios = require('axios');
const config = require('./config.json');
const portsDB = require('./ports.json');
const listOfPorts = portsDB.ports;

const RAPIDAPI_KEY = config.RAPIDAPI_KEY;
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
 * @param {requestedTideState} HIGH_TIDE or LOW_TIDE
 * @param {portName} the coastal location to get tide info for
 * @param {callback} the callback function for use by the Promise
 * @returns a string containing the spoken output to return for the intent
 */
function getTideInfo(requestedTideState, portName, callback) {
	let spokenResponse = "";

	// STEP 1 - Find the Lat/Long for the port
	// TODO: change from using local db to Google Places API
	const portInfo = listOfPorts.find(elem => elem.name === portName);
	console.log(`%%% Port = ${portInfo.name}, lat=${portInfo.latitude}, lon=${portInfo.longitude}`);

	// STEP 2 - Call the Tides API to get the tidal info
	axios.get('https://tides.p.rapidapi.com/tides', {
		headers: {
		"x-rapidapi-key": RAPIDAPI_KEY,
		"x-rapidapi-host": "tides.p.rapidapi.com",
		"accept": "application/json",
		"user-agent": "tide-table/v1.0"
		},
		params: {
		latitude: portInfo.latitude,
		longitude: portInfo.longitude,
		radius: 25,
		interval: 0,
		duration: 1440
		}
	})
	.then(function(response) {
		// STEP 3 - Return the relevant text to be included in the skill's response
		if (response && response.status === 200 && response.data) {
		const extremes = response.data.extremes;
		const nextTide = extremes.find(elem => elem.state === requestedTideState);
		const nextTideTime = nextTide.timestamp;
		console.log(nextTide);
		const timeNow = Math.floor(Date.now() / 1000);
		const timeToNextTide = nextTideTime - timeNow;
		const numHours = Math.floor(timeToNextTide / 3600);
		const numMins = Math.floor((timeToNextTide - (numHours * 3600)) / 60);

		// STEP 3 - Return the relevant text to be included in the skill's response
		// TODO we could add some randomness in here in future...
				let tideState = "";
				if (requestedTideState === LOW_TIDE) {
					tideState = "low tide";
				} else if (requestedTideState === HIGH_TIDE) {
					tideState = "high tide";
				}
				if (numHours > 1) {
					spokenResponse = `It will be ${tideState} at ${portName} in ${numHours} hours and ${numMins} minutes time.`;
				} else if (numHours == 1) {
					spokenResponse = `It will be ${tideState} at ${portName} in ${numHours} hour and ${numMins} minutes time.`;
				} else if (numMins > 1) {
					spokenResponse = `It will be ${tideState} at ${portName} in ${numMins} minutes time.`;
				} else if (numMins == 1) {
					spokenResponse = `It will be ${tideState} at ${portName} in ${numMins} minute time.`;       
				} else {
					spokenResponse = `It's ${tideState} at ${portName} right now.`;
				}
		} else {
		spokenResponse = `I'm sorry, the API we use to get tide information for ${portName} returned an error. Try again later.`;
		}
		callback(spokenResponse);
	})
	.catch(function (error) {
		console.log(error);
		spokenResponse = `I'm sorry, there was some error trying to get tidal information for ${portName}.`;
	})
	.then(function () {
		console.log("Promise for Rapid API call has completed");
	});

	return spokenResponse;
}

speakOutput = getTideInfo(HIGH_TIDE, toTitleCase('wick'));
console.log(speakOutput);

const portName = 'ullapool';
return new Promise(resolve => {
  getTideInfo(HIGH_TIDE, toTitleCase(portName), tideInfo => {
	const speakOutput = tideInfo;
	console.log("Resolved promise");
	resolve(
		console.log(speakOutput)
	);
  });
});


// useful for debug...
function printListOfPorts() {
	listOfPorts.forEach(p => {
		console.log(`${p.name}: ${p.latitude}`);
	});
}