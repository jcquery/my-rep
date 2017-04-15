'use strict'

const Alexa = require('alexa-sdk')
let appId

const searchHandlers = require('./handlers/search.js')
const infoHandlers = require('./handlers/info.js')

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context)

  if (typeof process.env.DEBUG === 'undefined') {
    alexa.appId = appId
  }
  alexa.dynamoDBTableName = 'tableName'
  alexa.registerHandlers(basicHandlers, searchHandlers, infoHandlers)
  alexa.execute()
}

const states = {
  INFO: '_INFO',
  SEARCH: '_SEARCH'
}

const basicHandlers = {
  'LaunchRequest': function () {
    if (!this.attributes['address']) {
      this.attributes['speechOutput'] = 'Welcome to MyRep. If you\'d like to set a default address, you can say, "set my address to," followed by your address. Or you can ask for the representatives for a particular address.'
      this.attributes['repromptOutput'] = 'Sorry, I didn\'t catch that. You can ask for the representatives for a particular address, or you can set a new default search address.'
    } else {
      this.attributes['speechOutput'] = 'Welcome to MyRep. You can ask for the representatives for your address, or you can ask for the representatives for a particular address.'
      this.attributes['repromptOutput'] = 'Sorry, I didn\'t catch that. You can ask for the representatives for your saved address, a particular address, or you can set a new default search address.'
    }

    this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
  },
  'AMAZON.HelpIntent': function () {
    this.attributes['speechOutput'] = 'You can search for congressional representatives by address by asking, "who is the representative for..." followed by an address. You can also search for senators or congresspeople. If you have a saved address, you can ask, "who is my representative?" or "who are my senators?" If you do not have a saved address, you can say "set my address to..." followed by an address to save your address for future searches. To get contact and term information for a congressperson, ask for information about them by name. For example, "tell me about Maria Cantwell," or "what is Maria Cantwell\'s address?" If you\'re done searching, you can say "cancel" or "stop."'
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
