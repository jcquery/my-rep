'use strict'
const dynamos = require('./dynamoHelpers')
const helpers = require('./apiHelpers')
const moment = require('moment')
const madison = require('madison')

module.exports = {
  'NameSearchIntent': function () {
    const repName = this.event.request.intent.slots.RepName.value

    if (!repName) {
      this.attributes['speechOutput'] = 'Sorry, I didn\'t catch that. Could you repeat the congressperson\'s name?'
      this.attributes['repromptOutput'] = this.attributes['speechOutput']

      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
    } else {
      dynamos.get(repName)
        .then((res) => {
          const id = res.Item.rep_id.S
          return helpers.nameSearch(id)
        })
        .then((rep) => {
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

          this.attributes['speechOutput'] = `${rep.name} is ${party} ${rep.role} from ${state}. Their term is from ${term}.`
          this.emit(':tell', this.attributes['speechOutput'])
        })
        .catch((err) => {
          console.error(err)
          this.emit(':tell', 'Sorry, something went wrong.')
        })
    }
  },
  'NameSearchTermIntent': function () {
    const repName = this.event.request.intent.slots.RepName.value

    if (!repName) {
      this.attributes['speechOutput'] = 'Sorry, I didn\'t catch that. Could you repeat the congressperson\'s name?'
      this.attributes['repromptOutput'] = this.attributes['speechOutput']

      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
    } else {
      dynamos.get(repName)
        .then((res) => {
          const id = res.Item.rep_id.S
          return helpers.nameSearch(id)
        })
        .then((rep) => {
          const term = `${moment(rep.termStart).format('YYYY')} to ${moment(rep.termEnd).format('YYYY')}`

          this.attributes['speechOutput'] = `${rep.name}'s term is from ${term}.`
          this.emit(':tell', this.attributes['speechOutput'])
        })
        .catch((err) => {
          console.error(err)
          this.emit(':tell', 'Sorry, something went wrong.')
        })
    }
  },
  'NameSearchTwitterIntent': function () {
    const repName = this.event.request.intent.slots.RepName.value

    if (!repName) {
      this.attributes['speechOutput'] = 'Sorry, I didn\'t catch that. Could you repeat the congressperson\'s name?'
      this.attributes['repromptOutput'] = this.attributes['speechOutput']

      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
    } else {
      dynamos.get(repName)
        .then((res) => {
          const id = res.Item.rep_id.S
          return helpers.nameSearch(id)
        })
        .then((rep) => {
          if (rep.twitter) {
            this.attributes['speechOutput'] = `${rep.name}'s Twitter username is ${rep.twitter}.`
          } else {
            this.attributes['speechOutput'] = `${rep.name} is not on Twitter.`
          }
          this.emit(':tell', this.attributes['speechOutput'])
        })
        .catch((err) => {
          console.error(err)
          this.emit(':tell', 'Sorry, something went wrong.')
        })
    }
  },
  'NameSearchPartyRoleIntent': function () {
    const repName = this.event.request.intent.slots.RepName.value

    if (!repName) {
      this.attributes['speechOutput'] = 'Sorry, I didn\'t catch that. Could you repeat the congressperson\'s name?'
      this.attributes['repromptOutput'] = this.attributes['speechOutput']

      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
    } else {
      dynamos.get(repName)
        .then((res) => {
          const id = res.Item.rep_id.S
          return helpers.nameSearch(id)
        })
        .then((rep) => {
          let party

          if (rep.party === 'D') {
            party = 'a Democratic'
          } else if (rep.party === 'R') {
            party = 'a Republican'
          } else {
            party = 'an Independent'
          }

          this.attributes['speechOutput'] = `${rep.name} is ${party} ${rep.role}.`

          this.emit(':tell', this.attributes['speechOutput'])
        })
        .catch((err) => {
          console.error(err)
          this.emit(':tell', 'Sorry, something went wrong.')
        })
    }
  },
  'NameSearchAddressIntent': function () {
    const repName = this.event.request.intent.slots.RepName.value

    if (!repName) {
      this.attributes['speechOutput'] = 'Sorry, I didn\'t catch that. Could you repeat the congressperson\'s name?'
      this.attributes['repromptOutput'] = this.attributes['speechOutput']

      this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptOutput'])
    } else {
      dynamos.get(repName)
        .then((res) => {
          const id = res.Item.rep_id.S
          return helpers.nameSearch(id)
        })
        .then((rep) => {
          this.attributes['speechOutput'] = `${rep.name}'s office address is ${rep.office} in Washington, DC.`

          this.emit(':tell', this.attributes['speechOutput'])
        })
        .catch((err) => {
          console.error(err)
          this.emit(':tell', 'Sorry, something went wrong.')
        })
    }
  }
}