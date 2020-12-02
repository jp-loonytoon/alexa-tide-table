#!/usr/bin/env bash

# Run all tests locally, then upload to AWS Lambda and re-run
bst tests

sleep 2

./UpdateLambda.sh

sleep 5

./TestLambda.sh