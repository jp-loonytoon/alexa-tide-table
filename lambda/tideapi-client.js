/* 
	https://api.hood.land/api/tides


	STEP 1 - use Google Maps Platform to get Lat/Long
	API_KEY=AIzaSyDAvHu2mSi0RbhcRuUL3Nn6haQcXdo5yGA
	
	curl https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&types=food&name=harbour&key=AIzaSyDAvHu2mSi0RbhcRuUL3Nn6haQcXdo5yGA

curl https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Museum%20of%20Contemporary%20Art%20Australia&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry&key=AIzaSyDAvHu2mSi0RbhcRuUL3Nn6haQcXdo5yGA


*/


var unirest = require("unirest");

var req = unirest("GET", "https://tides.p.rapidapi.com/tides");

// Portsmouth, UK
req.query({
	"latitude": "50.8036831",
	"longitude": "-1.075614",
	"interval": "60",
	"duration": "1440"
});

req.headers({
	"x-rapidapi-key": "9901cd1ec3mshb4180d89857beb9p17fe17jsn20bd8bd44375",
	"x-rapidapi-host": "tides.p.rapidapi.com",
	"useQueryString": true
});


req.end(function (res) {
	if (res.error) throw new Error(res.error);

	console.log(res.body);
});
