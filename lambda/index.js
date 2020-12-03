// sets up dependencies
const Alexa = require('ask-sdk-core');
const axios = require('axios');
const portsDB = require('./ports.json');
const listOfPorts = portsDB.ports;

const RAPIDAPI_KEY = "9901cd1ec3mshb4180d89857beb9p17fe17jsn20bd8bd44375";
const HIGH_TIDE = "HIGH TIDE";
const LOW_TIDE = "LOW TIDE";

let region = process.env.AWS_REGION
let versionInfo = process.env.AWS_LAMBDA_FUNCTION_NAME + "/" + process.env.AWS_LAMBDA_FUNCTION_VERSION;



// Utility Functions ///////////////////////////////////
// TODO: move to a sepearate JS module

/**
 * @param {str} a string you wish to convert to title case
 * @returns the string converted to title text
 */
function toTitleCase(str) {
	return str.replace(
	  /\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	);
}


/**
 * @param {requestedTideState} HIGH_TIDE or LOW_TIDE
 * @param {portName} the coastal location to get tide info for
 * @returns a string containing the spoken output to return for the intent
 */
function getTideInfo(requestedTideState, portName, callback) {
	let spokenResponse = "";

	// STEP 1 - Find the Lat/Long for the port
	// TODO: change from using local db to Google Places API
	const portInfo = listOfPorts.find(elem => elem.name === portName);
	console.log(`%%% Port = ${portInfo.name}, lat=${portInfo.latitude}, lon=${portInfo.longitude}`);

  // STEP 2 - Call the Tides API to get the tidal info
  axios.get('https://tides.p.rapidapi.com/tides', {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "tides.p.rapidapi.com"
    },
    params: {
      latitude: portInfo.latitude,
      longitude: portInfo.longitude,
      radius: 25,
      interval: 0,
      duration: 1440
    }
  })
  .then(function(response) {
    // STEP 3 - Return the relevant text to be included in the skill's response
    if (response && response.status === 200 && response.data) {
      const extremes = response.data.extremes;
      const nextTide = extremes.find(elem => elem.state === requestedTideState);
      const nextTideTime = nextTide.timestamp;
      console.log(nextTide);
      const timeNow = Math.floor(Date.now() / 1000);
      const timeToNextTide = nextTideTime - timeNow;
      const numHours = Math.floor(timeToNextTide / 3600);
      const numMins = Math.floor((timeToNextTide - (numHours * 3600)) / 60);

      // STEP 3 - Return the relevant text to be included in the skill's response
      // TODO we could add some randomness in here in future...
      if (requestedTideState === LOW_TIDE) {
        if (numHours >= 1) {
          spokenResponse = `It will be low tide at ${portName} in ${numHours} hours and ${numMins} minutes time.`;
        } else if (numMins >= 1) {
          spokenResponse = `It will be low tide at ${portName} in ${numMins} minutes time.`;
        } else {
          spokenResponse = `It's low tide at ${portName} right now.`;
        }
      } else if (requestedTideState === HIGH_TIDE) {
        if (numHours >= 1) {
          spokenResponse = `It will be high tide at ${portName} in ${numHours} hours and ${numMins} minutes time.`;
        } else if (numMins >= 1) {
          spokenResponse = `It will be high tide at ${portName} in ${numMins} minutes time.`;
        } else {
          spokenResponse = `It's high tide at ${portName} right now.`;
        }
      }
    } else {
      spokenResponse = `I'm sorry, the API we use to get tide information for ${portName} returned an error. Try again later.`;
    }
    callback(spokenResponse);
  })
  .catch(function (error) {
    console.log(error);
    spokenResponse = `I'm sorry, there was some error trying to get tidal information for ${portName}.`;
  })
  .then(function () {
    console.log("Promise for Rapid API call has completed");
  });

	return spokenResponse;
}


// Intent Handling Functions ///////////////////////////////////

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
    return Alexa.getRequestType(r) === 'IntentRequest'
        && (Alexa.getIntentName(r) === 'NextHighTideIntent');
  },
  handle(handlerInput) {
    const r = handlerInput.requestEnvelope;
    const intentName = Alexa.getIntentName(r);
    console.log(`THIS.EVENT = GetNextTideHandler; with INTENT = ${intentName}`);

    const portName = Alexa.getSlotValue(r, 'Location');

    return new Promise(resolve => {
      getTideInfo(HIGH_TIDE, portName, tideInfo => {
        const speakOutput = tideInfo;
        console.log("Resolved promise");
        resolve(
          handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse()
        );
      });
    });
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


// expose the skillBuilder object for use by Alexa //////////////////////////

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
