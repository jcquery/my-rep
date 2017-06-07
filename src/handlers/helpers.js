'use strict'

const axios = require('axios')
const dotenv = require('dotenv').config()

const helpers = {
  addressSearch: function (address, office) {
    let roles
    const key = process.env.CIVICS_KEY

    if (office === 'house') {
      roles = 'legislatorLowerBody'
    } else if (office === 'senate') {
      roles = 'legislatorUpperBody'
    } else {
      roles = 'legislatorLowerBody, legislatorUpperBody'
    }

    axios.get('https://www.googleapis.com/civicinfo/v2/representatives', {
      params: {
        levels: 'country',
        roles,
        key,
        address
      }
    })
    .then((res) => {
      console.log(res.data.officials)
    })
    .catch((err) => {
      console.error(err.response.data)
    })
  }
}

exports.helpers = helpers
