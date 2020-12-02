
const GooglePlaces = require("node-googleplaces");
 
const places = new GooglePlaces('AIzaSyDAvHu2mSi0RbhcRuUL3Nn6haQcXdo5yGA');
const params = {
  location: '49.250964,-123.102192',
  radius: 1000
};
 
// Callback
places.nearbySearch(query, (err, res) => {
  console.log(res.body);
});
 
// Promise
places.nearbySearch(query).then((res) => {
  console.log(res.body);
});