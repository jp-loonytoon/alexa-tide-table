/* 
	Test script to use Google and Rapid APIs to access location and tide info.

	STEP 1 - Use Places API from Google Maps platform to get Lat/Long
		see https://developers.google.com/places/web-service/overview for more detail
	STEP 2 - Call the Tides API to get the tidal info
		see https://rapidapi.com/apihood/api/tides for more detail
	STEP 3 - Return the relevant text to be included in the skill's response
*/

const tides = require("./tides.js");

tides.speakTideInfo('Leith', tides.HIGH_TIDE)
	.then((speech) => {
		console.log(speech);
	});
