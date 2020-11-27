#!/usr/bin/env bash

# Invoke the Lambda function by calling each handler in turn
# Make sure you've installed the http utility firstb

LAMBDA_NAME=TideTable
LAUNCH_REQUEST_JSON=`cat LaunchRequest.json`

aws lambda invoke --function-name $LAMBDA_NAME \
    --cli-binary-format raw-in-base64-out \
    --payload "${LAUNCH_REQUEST_JSON}" \
    test-response.json | jq