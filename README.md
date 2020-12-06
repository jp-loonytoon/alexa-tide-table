# Tide Table

Tide Table is a simple Alexa skill that allows you to ask for the next high or low tide. Currently it only supports locations around for the coast of the British Isles. It relies on the Tides API from [API Hood](https://api.hood.land/api/tides). It's accessed via RapidAPI:

https://rapidapi.com/apihood/api/tides

The Places API from the Google Maps platform is used to get the location coordinates (lat/long) for the location, which is then used by the Tides API.

The Tide Table skill allows you to find out the following:

* The next high tide for a port around the UK
* The next low tide for a port around the UK
* The current state of the tide for a port around the UK
## Usage

The way the Tide Table skill works is that the user activates the skill as follows:

U: Alexa, launch Tide Table.
A. Say where you'd like to know the next high or low tide.

They can then ask about the next high or low tide, for instance:

U. When is the next high tide at Portland Bill?
A. It will be high tide at Portland Bill in 6 hours and 30 minutes.

## Skill Configuration

SKILL_NAME: Tide Table
SKILL_ID: amzn1.ask.skill.a34389ed-8bbd-4a82-9130-d82ff119e117
INVOCATION_NAME: tide table

Default Region (Lambda): arn:aws:lambda:us-east-1:352075535194:function:a34389ed-8bbd-4a82-9130-d82ff119e117:Release_0

### Intents

The following custom intents are used:

* NextHighTideIntent
* NextLowTideIntent
* CurrentTideIntent

## Lambda Function

Currently it is an Alexa hosted skill, but if you want to create and use your own Lambda function you can do so, and then use the UpdateLambda.sh and TestLambda.sh shell scripts to create a deployment package for your Lambda on ther local developmemt environment, publish it to the remote Lambda, and then test it.

See the AWS Lambda Development Guide for more details: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html
