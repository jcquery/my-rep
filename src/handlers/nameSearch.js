'use strict'
const dynamos = require('./dynamoHelpers')
const helpers = require('./apiHelpers')
const moment = require('moment')
const madison = require('madison')

module.exports = {
  'NameSearchIntent': function () {
    const repName = this.event.request.intent.slots.RepName.value
    console.log(repName)
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
            party = 'a Democrat'
          } else if (rep.party === 'R') {
            party = 'a Republican'
          } else {
            party = 'an Independent'
          }
          this.attributes['speechOutput'] = `${rep.name} is ${party} from ${state}. Their term is from ${term}.`
          this.emit(':tell', this.attributes['speechOutput'])
        })
        .catch((err) => {
          console.error(err)
          this.emit(':tell', 'Sorry, something went wrong.')
        })
    }
  }
}
