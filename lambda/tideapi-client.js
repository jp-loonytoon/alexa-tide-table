/* 
	https://api.hood.land/api/tides

	STEP 1 - use Google Maps Platform to get Lat/Long
	API_KEY=AIzaSyDAvHu2mSi0RbhcRuUL3Nn6haQcXdo5yGA
	
	curl https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&types=food&name=harbour&key=AIzaSyDAvHu2mSi0RbhcRuUL3Nn6haQcXdo5yGA

curl https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry&key=AIzaSyDAvHu2mSi0RbhcRuUL3Nn6haQcXdo5yGA

*/

const unirest = require("unirest");
const portsDB = require('./ports.json');
const listOfPorts = portsDB.ports


function getTideInfo(portName) {
	const portInfo = listOfPorts.find(elem => elem.name === portName);

	console.log(`%%% Port = ${portInfo.name}, lat=${portInfo.latitude}, lon=${portInfo.longitude}`);

	const req = unirest.get("https://tides.p.rapidapi.com/tides");
	req
		.headers({
			"x-rapidapi-key": "9901cd1ec3mshb4180d89857beb9p17fe17jsn20bd8bd44375",
			"x-rapidapi-host": "tides.p.rapidapi.com",
			"useQueryString": true
		})
		.query({
			"latitude": portInfo.latitude,
			"longitude": portInfo.longitude,
			"interval": "0",
			"radius": "5",
			"duration": "1440"
		})
		.end(function (res) {
			if (res.error) throw new Error(res.error);
		
			const extremes = res.body.extremes;
			const nextHighTide = extremes.find(elem => elem.state === 'HIGH TIDE');
			console.log(`Next high tide for ${portName} will be at ${nextHighTide.datetime}`);
		});
}

const ullapool = listOfPorts.find(elem => elem.name === 'Ullapool');
console.log(`Ullapool's location is LAT=${ullapool.latitude}, LONG=${ullapool.longitude}`);
getTideInfo('Ullapool');

// useful for debug...
function printListOfPorts() {
	listOfPorts.forEach(p => {
		console.log(`${p.name}: ${p.latitude}`);
	});
}