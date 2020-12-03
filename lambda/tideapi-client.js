/* 
	https://api.hood.land/api/tides

	STEP 1 - use Google Maps Platform to get Lat/Long
	API_KEY=AIzaSyDAvHu2mSi0RbhcRuUL3Nn6haQcXdo5yGA
	
	curl https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&types=food&name=harbour&key=AIzaSyDAvHu2mSi0RbhcRuUL3Nn6haQcXdo5yGA

curl https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry&key=AIzaSyDAvHu2mSi0RbhcRuUL3Nn6haQcXdo5yGA

*/

const axios = require('axios');
const portsDB = require('./ports.json');
const listOfPorts = portsDB.ports;

const RAPIDAPI_KEY = "9901cd1ec3mshb4180d89857beb9p17fe17jsn20bd8bd44375";
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
 * @returns a string containing the spoken output to return for the intent
 */
async function getTideInfo(requestedTideState, portName) {
	let spokenResponse = "";

	// STEP 1 - Find the Lat/Long for the port
	// TODO: change from using local db to Google Places API
	const portInfo = listOfPorts.find(elem => elem.name === portName);
	console.log(`%%% Port = ${portInfo.name}, lat=${portInfo.latitude}, lon=${portInfo.longitude}`);

	// STEP 2 - Call the Tides API to get the tidal info
	try {
		let response = await axios.get('https://tides.p.rapidapi.com/tides', {
			headers: {
				"x-rapidapi-key": RAPIDAPI_KEY,
				"x-rapidapi-host": "tides.p.rapidapi.com"
			},
			params: {
				latitude: portInfo.latitude,
				longitude: portInfo.longitude,
				radius: 25,
				interval: 0,
				duration: 1440
			}
		});

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
			if (requestedTideState === LOW_TIDE) {
				if (numHours >= 1) {
					spokenResponse = `It will be low tide at ${portName} in ${numHours} hours and ${numMins} minutes time.`;
				} else if (numMins >= 1) {
					spokenResponse = `It will be low tide at ${portName} in ${numMins} minutes time.`;
				} else {
					spokenResponse = `It's low tide at ${portName} right now.`;
				}
			} else if (requestedTideState === HIGH_TIDE) {
				if (numHours >= 1) {
					spokenResponse = `It will be high tide at ${portName} in ${numHours} hours and ${numMins} minutes time.`;
				} else if (numMins >= 1) {
					spokenResponse = `It will be high tide at ${portName} in ${numMins} minutes time.`;
				} else {
					spokenResponse = `It's high tide at ${portName} right now.`;
				}
			}
			console.log(spokenResponse);
		} else {
			spokenResponse = `I'm sorry, the API we use to get tide information for ${portName} returned an error. Try again later.`;
		}
	} catch (error) {
		console.error(error);
		spokenResponse = `I'm sorry, there was some error trying to get tidal information for ${portName}.`;
	}


	return spokenResponse;
}

speakOutput = getTideInfo(HIGH_TIDE, toTitleCase('wick'));
console.log(speakOutput);



// useful for debug...
function printListOfPorts() {
	listOfPorts.forEach(p => {
		console.log(`${p.name}: ${p.latitude}`);
	});
}