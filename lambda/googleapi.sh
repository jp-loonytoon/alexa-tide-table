# try out Google Places API

# https://maps.googleapis.com/maps/api/place/findplacefromtext/output?parameters

API_KEY=AIzaSyDAvHu2mSi0RbhcRuUL3Nn6haQcXdo5yGA
PLACE=$1

curl -X GET 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json' \
  -G -d "key=${API_KEY}" \
  -d "input=${PLACE}" -d 'inputtype=textquery' \
  -d 'fields=formatted_address,name,geometry'
