const Alexa = require('ask-sdk-core');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');

const whatsOn = require('./whatsOn');

const persistenceAdapter = new DynamoDbPersistenceAdapter({
    tableName: 'WhatsOnBrisbane',
    createTable: true
});

const CARD_TITLE = 'What\'s on Brisbane';

const sendEventsInfo = async (handlerInput) => {
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();
    const day = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
    let events = [];
    const storedEvents = attributes[day];
    if (storedEvents) {
        events = storedEvents;
    } else {
        events = await whatsOn.getEvents();
        attributes[day] = {
            events: events
        };
        handlerInput.attributesManager.setPersistentAttributes(attributes);
        await handlerInput.attributesManager.savePersistentAttributes();
    }
    let eventsText = '';
    events.forEach(event => {
        eventsText += `${event.event}. ${event.date}`;
    });
    const speechText = eventsText ? 
        'Here are the top events happening in Brisbane this week: ' + eventsText
        : 'Sorry, there was an error in retrieving the events. Please try again shortly.';
    console.log('sendingEVentsInfo: ', speechText);
    return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withSimpleCard(CARD_TITLE, speechText)
        .getResponse();
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handler(handlerInput) {
        return sendEventsInfo(handlerInput);
    }
};

const WhatsOnIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'WhatsOnIntent';
    },
    handler(handlerInput) {
        return sendEventsInfo(handlerInput);
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handler(handlerInput) {
        let speechText = 'Find out about th events happening in Brisbane this week.';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(CARD_TITLE, speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(CARD_TITLE, speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
}

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command yet. Please say again.')
            .reprompt('Sorry, I can\'t understand the command yet. Please say again.')
            .getResponse();
    },
};

// Lambda function
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        WhatsOnIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
    .withPersistenceAdapter(persistenceAdapter)
    .addErrorHandlers(ErrorHandler)
    .lambda();