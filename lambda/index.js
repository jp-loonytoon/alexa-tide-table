// sets up dependencies
const Alexa = require('ask-sdk-core');

let region = process.env.AWS_REGION
let versionInfo = process.env.AWS_LAMBDA_FUNCTION_NAME + "/" + process.env.AWS_LAMBDA_FUNCTION_VERSION;


const LaunchRequestHandler = {
    canHandle(handlerInput) {
      return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
      console.log(`THIS.EVENT = LaunchRequestHandler running on ${region}`);
      console.log(`VERSION INFO = ${versionInfo}`)
      const speakOutput = 'Where would you like to find the high tide for?';
      return handlerInput.responseBuilder
          .speak(speakOutput)
          .reprompt(speakOutput)
          .withSimpleCard('Tide Table', speakOutput)
          .getResponse();
    }
};


// core functionality for tide table skill
const GetNextTideHandler = {
  canHandle(handlerInput) {
    const r = handlerInput.requestEnvelope;
    
    // checks request type
    return Alexa.getRequestType(r) === 'LaunchRequest'
      || (Alexa.getRequestType(r) === 'IntentRequest'
        && Alexa.getIntentName(r) === 'NextHighTideIntent');
  },
  handle(handlerInput) {
    const r = handlerInput.requestEnvelope;
    const intentName = Alexa.getIntentName(r);
    console.log(`THIS.EVENT = GetNextTideHandler; with INTENT = ${intentName}`);

    const portName = Alexa.getSlotValue(r, 'Location');
    const speakOutput = `The tide at ${portName} is coming in now, and high tide will be in 18 minutes, at 7.29pm`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      // Uncomment the next line if you want to keep the session open so you can
      // ask for another fact without first re-opening the skill
      // .reprompt(requestAttributes.t('HELP_REPROMPT'))
      .getResponse();
  },
};


// handles the user asking for help
const HelpHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Where would you like to get the high tide for?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


// handles cancel and stop intents
const ExitHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};


// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest';
  },
  handle(handlerInput) {
      const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
      const speechText = `You just triggered ${intentName}`;

      return handlerInput.responseBuilder
          .speak(speechText)
          //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
          .getResponse();
  }
};

// log the JSON request to Amazon CloudWatch each time a request is received by the skill. 
const RequestLog = {
    process(handlerInput) {
        console.log("REQUEST ENVELOPE = " + JSON.stringify(handlerInput.requestEnvelope));
    }
};


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GetNextTideHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(
    ErrorHandler
  )
  .addRequestInterceptors(
    RequestLog
  )
  .withCustomUserAgent('tide-table/v1.0')
  .lambda();
