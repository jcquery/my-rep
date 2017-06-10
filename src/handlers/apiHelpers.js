'use strict'
const path = require('path')
const dotenv = require('dotenv').config({path: path.join(__dirname, '../.env')})
const axios = require('axios')

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
  },

  nameSearch: function (id) {
    return axios.get(`https://api.propublica.org/congress/v1/members/${id}.json`, {
      headers: {
        'X-API-Key': process.env.PROPUBLICA_KEY
      }
    })
      .then((res) => {
        const rep = res.data.results[0]

        return new Promise(function (resolve, reject) {
          resolve({
            name: `${rep.first_name} ${rep.last_name}`,
            party: rep.current_party,
            role: rep.roles[0].title.split(',')[0],
            state: rep.roles[0].state,
            term_start: rep.roles[0].start_date,
            term_end: rep.roles[0].end_date,
            phone: rep.roles[0].phone,
            twitter: rep.twitter_account,
            office: rep.roles[0].office
          })
        })
      })
      .catch((err) => {
        throw new Error(err)
      })
  }
}

module.exports = helpers
