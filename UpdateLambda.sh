#!/usr/bin/env bash

# create a ZIP archive of the local Lambda code and
# use it to update our AWS Lambda function

LAMBDA_NAME=TideTable

cd lambda
zip -rq tidetable.zip *
mv tidetable.zip ..
cd ..
aws lambda update-function-code --function-name $LAMBDA_NAME \
    --zip-file fileb://tidetable.zip --output yaml
