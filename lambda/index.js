// sets up dependencies
const Alexa = require('ask-sdk-core');
const axios = require('axios');
const config = require('./config.json');

const USER_AGENT = "tide-table/v1.0";
const RAPIDAPI_KEY = config.RAPIDAPI_KEY;
const GOOGLE_MAPS_API_KEY = config.GOOGLE_MAPS_API_KEY;

// default params for Tides API
const DEFAULT_RADIUS = 25;			// if no prediction is found in requested coordinates widen the search by this distance (in kms)
const DEFAULT_INTERVAL = 0;			// don't return interval measurements
const DEFAULT_DURATION = 24 * 60;	// return data for next 24 hours

const HIGH_TIDE = "HIGH TIDE";
const LOW_TIDE = "LOW TIDE";

const region = process.env.AWS_REGION
const versionInfo = process.env.AWS_LAMBDA_FUNCTION_NAME + "/" + process.env.AWS_LAMBDA_FUNCTION_VERSION;



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
 * @param {portName} the coastal location to get location info for
 * @returns a portInfo object containing name, latitude and longitude of port
 */
function getPortLocation(portName) {
	return new Promise((resolve, reject) => {
		// the p record will store location info for the port
		const p = {
			name: toTitleCase(portName),
			latitude: "",
			longitude: ""
		};

		// call the Places API from Google Maps to get the tidal info
		axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
			headers: {
				"accept": "application/json",
				"user-agent": USER_AGENT
			},
			params: {
				key: GOOGLE_MAPS_API_KEY,
				input: p.name,
				inputtype: "textquery",
				fields: "name,geometry"
			}
		})
		.then(function(response) {		// fill in the p record and resolve the promise
			if (response && response.status === 200 && response.data) {
				const result = response.data.candidates[0];
				console.log(`Found location "${result.name}" for port "${p.name}"`);
				p.latitude = result.geometry.location.lat;
				p.longitude = result.geometry.location.lng;
				resolve(p);
			} else {					// or reject if there was a problem
				reject(response.status);
			}
		});
	});
 }


/**
 * @param {extremes} tidal extremes record from Tides API
 * @param {tideState} HIGH_TIDE or LOW_TIDE
 * @returns the time until the next tide (in seconds)
 */
function getNextTideData(extremes, tideState) {
	const timeNow = Math.floor(Date.now() / 1000);
	const nextTide = extremes.find(
		elem => elem.state === tideState && elem.timestamp > timeNow
	);
	const nextTideTime = nextTide.timestamp;
	const timeToNextTide = nextTideTime - timeNow;

	return timeToNextTide;
}


/**
 * @param {portInfo} the coastal location to get tide info for
 * @param {tideState} HIGH_TIDE or LOW_TIDE
 * @returns a tideInfo object containing info on the next tide for the given port
 */
function getTideInfo(portInfo, tideState) {
	return new Promise((resolve, reject) => {
		// the t record will store tide info for the port
		const t = {
			name: portInfo.name,
			latitude: portInfo.latitude,
			longitude: portInfo.longitude,
			state: tideState,
			tidalTimezone: "UTC",   
			deviceTimezone: "UTC",   // for future support of non-UK zones
			hoursUntil: 0,
			minutesUntil: 0,
			isTomorrow: false
		};

		// call the Tides API to get the tidal info
		axios.get('https://tides.p.rapidapi.com/tides', {
			headers: {
				"x-rapidapi-key": RAPIDAPI_KEY,
				"x-rapidapi-host": "tides.p.rapidapi.com",
				"accept": "application/json",
				"user-agent": USER_AGENT
			},
			params: {
				latitude: portInfo.latitude,
				longitude: portInfo.longitude,
				radius: DEFAULT_RADIUS,
				interval: DEFAULT_INTERVAL,
				duration: DEFAULT_DURATION
			}
		})
		.then(function(response) {
			if (response && response.status === 200 && response.data) {
				console.log(response.data);
				const result = response.data.extremes;
				const timeToNextTide = getNextTideData(result, tideState);
				t.hoursUntil = Math.floor(timeToNextTide / 3600);
				t.minutesUntil = Math.floor((timeToNextTide - (t.hoursUntil * 3600)) / 60);
				resolve(t);
			} else {
				reject(response.data.error);
			}
		})
		.catch(function(error) {
			console.error(error);
		});
	});
}


/**
 * @param {port} the name of the port
 * @param {tideState} HIGH_TIDE or LOW_TIDE
 * @returns a string containing the text to speak
 */
function speakTideInfo(port, tidestate) {
	return new Promise((resolve, reject) => {
		let spokenResponse = "";

		getPortLocation(port)
			.then((portInfo) => {
				console.log(`${portInfo.name} is at latitude ${portInfo.latitude} and longitude ${portInfo.longitude}.`);
				return getTideInfo(portInfo, tidestate);
			})
			.then((tideInfo) => {
				let tideDescription = "";
				if (tideInfo.state === LOW_TIDE) {
					tideDescription = "low tide";
				} else if (tideInfo.state === HIGH_TIDE) {
					tideDescription = "high tide";
				}
				// first handle cases where time to tide is < 1 hour
				if (tideInfo.hoursUntil === 0 && tideInfo.minutesUntil === 0) {
					spokenResponse = `It's ${tideDescription} at ${tideInfo.name} right now.`;
				} else if (tideInfo.hoursUntil === 0 && tideInfo.minutesUntil > 1) {
					spokenResponse = `It will be ${tideDescription} at ${tideInfo.name} in ` +
						`${tideInfo.minutesUntil} minutes.`;
				} else if (tideInfo.hoursUntil === 0 && tideInfo.minutesUntil === 1) {
					spokenResponse = `It will be ${tideDescription} at ${tideInfo.name} in ` +
						`${tideInfo.minutesUntil} minute.`;
				} else {
					// now handle cases where it is >= 1 hour
					if (tideInfo.hoursUntil > 1) {
						spokenResponse = `It will be ${tideDescription} at ${tideInfo.name} in ` +
							`${tideInfo.hoursUntil} hours`;
					} else if (tideInfo.hoursUntil === 1) {
						spokenResponse = `It will be ${tideDescription} at ${tideInfo.name} in ` +
							`${tideInfo.hoursUntil} hour`;
					}
					if (tideInfo.minutesUntil > 1) {
						spokenResponse += ` and ${tideInfo.minutesUntil} minutes.`;
					} else if (tideInfo.hoursUntil === 1) {
						spokenResponse += ` and ${tideInfo.minutesUntil} minute.`;
					} else if (tideInfo.hoursUntil === 0) {
						spokenResponse += ` exactly.`;
					}
				}

				resolve(spokenResponse);
			});
	});
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
    const portName = Alexa.getSlotValue(r, 'Location');
    console.log(`THIS.EVENT = GetNextTideHandler; with INTENT = ${intentName} and port name = ${portName}`);
   
    return new Promise((resolve, reject) => {
      speakTideInfo(portName, HIGH_TIDE)
      	.then((speechOutput) => {
        	console.log(speechOutput);
        	resolve(
          		handlerInput.responseBuilder
            	.speak(speechOutput)
            	.getResponse()
        	);
        });
    });    
  }
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
