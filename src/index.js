'use strict'

const Alexa = require('alexa-sdk')
let appId

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context)

  if (typeof process.env.DEBUG === 'undefined') {
    alexa.appId = appId
  }

  alexa.registerHandlers(handlers)
  alexa.execute()
}

const handlers = {}
