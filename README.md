# Tide Table
<<<<<<< HEAD
=======

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






# Alexa Developers Notebook

There are several diffent ways you can build an Alexa skill. The entry-level method is to use the Alexa Developer Console:

https://developer.amazon.com/alexa/console/

You create the intents and the AWS Lambda backend all in one browser-based tool.

The next step up is to use the Alexa Skills Kit (ASK) which is a CLI that allows you to develop your skill offline using tools like Visual Studio Code. The current version of ASK is ASK v2.

Now, on top of ASK there is the Controls Framework which allows you to assemble a skill using re-usable components, called Controls:

https://github.com/alexa/ask-sdk-controls

It's also supposed to show developers best practice.

There are also third-party tools that allow you to create cross-platform skills (for Google Home and Alexa for instance); the best known of which is Jovo.

In what follows we'll develop a simple skill called TideTable that allows you to find out the following:

* The next high tide for a port around the UK
* The next low tide for a port around the UK
* The current state of the tide for a port around the UK

## TideTable Skill

The way the TideTable skill works is that the user activates the skill as follows:

U: Alexa, launch Tide Table.
A. Say where you'd like to know the next high or low tide.

U. When is the next high tide at Portsmouth?
A. The tide at Portsmouth is coming in now, and high tide will be in 50 minutes, at 9.45pm.

U. What is the current tide at Portsmouth?
A. The tide at Portsmouth is coming in; high tide will be in 50 minutes, at 9.45pm.

U. When is the next low tide at Portsmouth?
A. The tide is coming in at Portsmouth now, however the next low tide will be in 8 hours 25 minutes time, at 2.18am.

We'll allow the following one-shot utterances too:

U. Alexa, ask Tide Table when the next high tide at Dover will be.
A. The tide at Portsmouth is coming in now, and high tide will be in 50 minutes, at 9.45pm.

### Summary

SKILL_NAME: Tide Table
Skill ID: amzn1.ask.skill.a34389ed-8bbd-4a82-9130-d82ff119e117
INVOCATION_NAME: tide table
Default Region (Lambda): arn:aws:lambda:us-east-1:352075535194:function:a34389ed-8bbd-4a82-9130-d82ff119e117:Release_0


### Standalone TideTable Lambda:

When you develop using the Alexa Developer Console or ASK by default you will use an Alexa-hosted Skill which means that all the guts of creating and managing the Lambda function is handled for you. This automatically creates the resources you need for the function to work with Alexa, including the Lambda function itself, the SDK dependencies (node_modules), the trigger that grants Alexa the necessary invocation permissions for your function, and the roles that defines the AWS resources the function can access. Alternately you can create a new Lambda function from scratch and then upload a ZIP file containing the files from the /lambda folder.

Default Region (Lambda): arn:aws:lambda:us-east-1:587756526018:function:TideTable

You can use the following commands to create a deployment package for your Lambda function on your local developmemt workstation and use it to update the remote Lambda:

```bash
cd lambda
zip -rq tidetable.zip *
mv tidetable.zip ..
cd ..
aws lambda update-function-code --function-name TideTable \
    --zip-file fileb://tidetable.zip --output yaml
```

See the AWS Lambda Development Guide for more details: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html

Its still useful to have the option to use the Alexa-hosted Skill; you can treat it as your remote dev environment, and your own AWS Lambda as your staging environment. When you are ready to go live you can swap the service endpoint in the Alexa Developer Console to use your staging Lambda ARN. Building a comprehensive set of regression tests that can be run against both dev and staging is critically important here.


### Intents

NextHighTideIntent
NextLowTideIntent
CurrentTideIntent

The Location slot is used to capture the port, which can then be accessed in the code like this:

const portName = Alexa.getSlotValue(r, 'Location');

>>>>>>> master
