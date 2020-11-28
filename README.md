# Tide Table

Tide Table is a simple Alexa skill that allows you to ask for the next high or low tide. Currently it only works for the coast around the United Kingdom. It relies on the Tides API from Marea which is access via RapidAPI:

https://rapidapi.com/apihood/api/tides

It allows you to find out the following:

* The next high tide for a port around the UK
* The next low tide for a port around the UK
* The current state of the tide for a port around the UK
## Usage

The way the Tide Table skill works is that the user activates the skill as follows:

U: Alexa, launch Tide Table.
A. Say where you'd like to know the next high or low tide.

They can then ask about the next high or low tide, for instance:

U. When is the next high tide at Portsmouth?
A. The tide at Portsmouth is coming in now, and high tide will be in 50 minutes, at 9.45pm.

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

You can use the following commands to create a deployment package for your Lambda function on your local developmemt workstation and use it to update the remote Lambda:

```bash
cd lambda
zip -rq tidetable.zip *
mv tidetable.zip ..
cd ..
aws lambda update-function-code --function-name TideTable \
    --zip-file fileb://tidetable.zip --output yaml
```

Alternately you can use the `UpdateLambda.sh` script to do this.

See the AWS Lambda Development Guide for more details: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html

