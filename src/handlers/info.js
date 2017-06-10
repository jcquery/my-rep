'use strict'
const dynamos = require('./dynamoHelpers')
const helpers = require('./apiHelpers')

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
          console.log(rep)
          this.attributes['speechOutput'] = `${rep.name} is a ${rep.role} from ${rep.state}.`
          this.emit(':tell', this.attributes['speechOutput'])
        })
        .catch((err) => {
          console.error(err)
          this.emit(':tell', 'Sorry, something went wrong.')
        })
    }
  }
}
