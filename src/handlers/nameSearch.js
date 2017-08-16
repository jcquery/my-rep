'use strict'

const dynamos = require('../helpers/dynamoHelpers')
const helpers = require('../helpers/apiHelpers')
const moment = require('moment')
const madison = require('madison')

const responseTemplate = function (rep, callback) {
  if (!rep) {
    this.emit('MissingRep')
  } else {
    rep = rep.toLowerCase()

    return dynamos.get(rep)
      .then((res) => {
        if (!res.Item) {
          console.log('Could not recognize: ', rep)
          this.emit('SearchFailure')
        } else {
          return helpers.nameSearch(res.Item.rep_id.S)
            .then(callback.bind(this, rep))
        }
      })
      .catch((err) => {
        console.error(err)
        this.emit(':tell', 'Sorry, something went wrong. Please try again later.')
      })
  }
}
const cardTemplate = function (rep, str) {
  this.emit(
    ':tellWithCard',
    this.attributes['speechOutput'],
    rep.name,
    `Role: ${rep.role}\nParty: ${rep.party}\nState: ${rep.state}${str ? `\n${str}` : ''}`
  )
}
const nameSearchResponse = function (name, rep) {
  const term = `${moment(rep.termStart).format('YYYY')} to ${moment(rep.termEnd).format('YYYY')}`
  const state = madison.getStateNameSync(rep.state)
  let party

  if (rep.party === 'D') {
    party = 'a Democratic'
  } else if (rep.party === 'R') {
    party = 'a Republican'
  } else {
    party = 'an Independent'
  }

  this.attributes['speechOutput'] = `${name} is ${party} ${rep.role} from ${state}. ${rep.gender === 'M' ? 'His' : 'Her'} term is from ${term}.`
  cardTemplate.call(this, rep, `Term: ${term}`)
}
const termSearchResponse = function (name, rep) {
  const term = `${moment(rep.termStart).format('YYYY')} to ${moment(rep.termEnd).format('YYYY')}`

  this.attributes['speechOutput'] = `${name}'s term is from ${term}.`
  cardTemplate.call(this, rep, `Term: ${term}`)
}
const twitterSearchResponse = function (name, rep) {
  if (rep.twitter) {
    this.attributes['speechOutput'] = `${name}'s Twitter username is ${rep.twitter}.`
  } else {
    this.attributes['speechOutput'] = `${name} is not on Twitter.`
  }
  cardTemplate.call(this, rep, `Twitter Username: ${rep.twitter}`)
}
const partyRoleSearchResponse = function (name, rep) {
  let party

  if (rep.party === 'D') {
    party = 'a Democratic'
  } else if (rep.party === 'R') {
    party = 'a Republican'
  } else {
    party = 'an Independent'
  }

  this.attributes['speechOutput'] = `${name} is ${party} ${rep.role}.`

  cardTemplate.call(this, rep)
}
const addressSearchResponse = function (name, rep) {
  let template

  if (rep.office) {
    template = `Office Address: ${rep.office}, Washington DC`
    this.attributes['speechOutput'] = `${name}'s office address is ${rep.office} in Washington, DC.`
  } else {
    template = ''
    this.attributes['speechOutput'] = `Sorry, I don't have information about ${name}'s office address.`
  }

  cardTemplate.call(this, rep, template)
}
const phoneSearchResponse = function (name, rep) {
  this.attributes['speechOutput'] = `${name}'s office phone number is ${rep.phone}.`

  cardTemplate.call(this, rep, `Office Phone: ${rep.phone}`)
}

module.exports = {
  'NameSearchIntent': function () {
    responseTemplate.call(this, this.event.request.intent.slots.RepName.value, nameSearchResponse)
  },
  'NameSearchTermIntent': function () {
    responseTemplate.call(this, this.event.request.intent.slots.RepName.value, termSearchResponse)
  },
  'NameSearchTwitterIntent': function () {
    responseTemplate.call(this, this.event.request.intent.slots.RepName.value, twitterSearchResponse)
  },
  'NameSearchPartyRoleIntent': function () {
    responseTemplate.call(this, this.event.request.intent.slots.RepName.value, partyRoleSearchResponse)
  },
  'NameSearchAddressIntent': function () {
    responseTemplate.call(this, this.event.request.intent.slots.RepName.value, addressSearchResponse)
  },
  'NameSearchPhoneIntent': function () {
    responseTemplate.call(this, this.event.request.intent.slots.RepName.value, phoneSearchResponse)
  },
  'MissingRep': function () {
    this.attributes['speechOutput'] = 'Sorry, I didn\'t catch that. Could you repeat the congressperson\'s name?'
    this.attributes['repromptOutput'] = this.attributes['speechOutput']

    this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
  },
  'SearchFailure': function () {
    this.attributes['speechOutput'] = 'Sorry, I couldn\'t find a congressperson by that name. ' +
    'If they are a current congressperson, try repeating their name or using a different alias of theirs.'
    this.attributes['repromptOutput'] = this.attributes['speechOutput']

    this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
  }
}
