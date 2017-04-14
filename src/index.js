'use strict'

const Alexa = require('alexa-sdk')
let appId

const searchHandlers = require('./handlers/search.js')
const infoHandler = require('./handlers/info.js')

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context)

  if (typeof process.env.DEBUG === 'undefined') {
    alexa.appId = appId
  }
  alexa.dynamoDBTableName = 'tableName'
  alexa.registerHandlers(launchHandlers, searchHandlers, infoHandler)
  alexa.execute()
}

const states = {
  RESULTS: '_RESULTS',
  SEARCHING: '_SEARCHING'
}

const launchHandlers = {
  'LaunchRequest': function () {
    if (!this.attributes['address']) {
      this.attributes['speechOutput'] = 'Welcome to MyRep. If you\'d like to set a default address, you can say, "set my address to," followed by your address. Or you can ask for the representatives for a particular address.'
      this.attributes['repromptOutput'] = 'Sorry, I didn\'t catch that. You can ask for the representatives for a particular address, or you can set a new default search address.'
    } else {
      this.attributes['speechOutput'] = 'Welcome to MyRep. You can ask for the representatives for your address, or you can ask for the representatives for a particular address.'
      this.attributes['repromptOutput'] = 'Sorry, I didn\'t catch that. You can ask for the representatives for your saved address, a particular address, or you can set a new default search address.'
    }

    this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
  }
}
