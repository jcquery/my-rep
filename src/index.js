'use strict'

const Alexa = require('alexa-sdk')
const appId = 'amzn1.ask.skill.a83f444e-1a69-483f-9b86-5c2512f1c079'

const locationHandlers = require('./handlers/locationSearch')
const nameHandlers = require('./handlers/nameSearch')

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context)

  if (typeof process.env.DEBUG === 'undefined') {
    alexa.APP_ID = appId
  }
  alexa.registerHandlers(basicHandlers, nameHandlers, locationHandlers)
  alexa.execute()
}

const basicHandlers = {
  'LaunchRequest': function () {
    this.attributes['speechOutput'] = 'Welcome to My Rep! You can ask for information about individual members of congress. For example, "tell me about Paul Ryan," or "which political party does Nancy Pelosi belong to?"'
    this.attributes['repromptOutput'] = 'Sorry, I didn\'t catch that. Could you repeat what you\'re looking for?'

    this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
  },
  'AMAZON.HelpIntent': function () {
    this.attributes['speechOutput'] = 'You can search for general information for a congressperson by saying, "tell me about..." followed by their name. ' +
    'You can also ask for more specific information, like Twitter username, phone number, or address.'
    this.attributes['repromptOutput'] = this.attributes['speechOutput']

    this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
  },
  'AMAZON.RepeatIntent': function () {
    this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
  },
  'AMAZON.StopIntent': function () {
    this.emit('SessionEndedRequest')
  },
  'AMAZON.CancelIntent': function () {
    this.emit('SessionEndedRequest')
  },
  'SessionEndedRequest': function () {
    this.emit(':tell', 'Goodbye!')
  }
}
