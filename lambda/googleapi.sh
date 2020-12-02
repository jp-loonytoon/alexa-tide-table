# try out Google Places API

# https://maps.googleapis.com/maps/api/place/findplacefromtext/output?parameters

API_KEY=AIzaSyDAvHu2mSi0RbhcRuUL3Nn6haQcXdo5yGA
PLACE=$1

#curl "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${PLACE}&inputtype=textquery&fields=formatted_address,name&locationbias=circle:2000@47.6918452,-122.2226413&key=${API_KEY}"

curl "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${PLACE}&inputtype=textquery&fields=formatted_address,name,geometry&key=${API_KEY}"
