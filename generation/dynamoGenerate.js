'use strict'

const fsp = require('../src/node_modules/fs-promise')
const axios = require('../src/node_modules/axios')
const dotenv = require('../src/node_modules/dotenv').config()
const path = require('path')
const AWS = require('../src/node_modules/aws-sdk')
const Promise = require('../src/node_modules/bluebird')

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_FULL_ID,
  secretAccessKey: process.env.AWS_FULL_SECRET
})
AWS.config.setPromisesDependency(Promise)

const table = new AWS.DynamoDB({apiVersion: '2012-08-10', params: {TableName: 'represent'}})

function getReps () {
  console.log('getting reps')
  axios.get('https://congress.api.sunlightfoundation.com/legislators?fields=aliases,bioguide_id&per_page=all')
    .then((res) => {
      console.log('got \'em')
      return createEntries(buildMap(res.data.results))
    })
    .catch((error) => {
      return { error }
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
    var params = {
      Item: {
        rep_name: { S: name },
        rep_id: { S: obj[name].join(',') }
      }
    }

    promiseArr.push(table.putItem(params).promise())
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
      throw err
    })
}

getReps()
