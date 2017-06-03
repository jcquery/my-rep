'use strict'

const fsp = require('../src/node_modules/fs-promise')
const axios = require('../src/node_modules/axios')
const path = require('path')
const Promise = require('../src/node_modules/bluebird')
const dynamos = require('./dynamoHelpers')

function getReps () {
  console.log('getting reps')
  axios.get('https://congress.api.sunlightfoundation.com/legislators?fields=aliases,bioguide_id&per_page=all')
    .then((res) => {
      console.log('got \'em')
      return createEntries(buildMap(res.data.results))
    })
    .catch((err) => {
      throw { err }
    })
}
function buildMap (list) {
  console.log('building a hashmap')
  return list.reduce((obj, rep) => {
    for (let alias of rep.aliases) {
      if (alias === null || alias.includes('Rep. ') || alias.includes('Sen. ') || alias.includes('Com. ')) {
        continue
      }

      if (!obj[alias]) {
        obj[alias] = [rep.bioguide_id]
      } else {
        obj[alias].push(rep.bioguide_id)
      }
    }
    return obj
  }, {})
}
function createEntries (obj) {
  console.log('creating database entries')
  var promiseArr = []

  Object.keys(obj).forEach((name) => {
    promiseArr.push(dynamos.put({ name, id: obj[name] }))
  })
  console.log('created promises')

  Promise.map(promiseArr, (put) => put, { concurrency: 3 })
    .then(() => {
      fsp.writeFile(path.join(__dirname, '/congressMap.json'), JSON.stringify(obj))
    })
    .then(() => {
      console.log('success')
    })
    .catch((err) => {
      console.error(err)
      throw
    })
}

getReps()
