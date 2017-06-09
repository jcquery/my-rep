'use strict'

const fsp = require('../src/node_modules/fs-promise')
const axios = require('../src/node_modules/axios')
const path = require('path')
const Promise = require('../src/node_modules/bluebird')
const dynamos = require('../src/handlers/dynamoHelpers')

function getReps () {
  console.log('getting reps')
  axios.get('https://congress.api.sunlightfoundation.com/legislators?fields=aliases,bioguide_id&per_page=all')
    .then((res) => {
      console.log('got \'em')
      createEntries(buildMap(res.data.results))
    })
    .catch((err) => {
      console.error(err)
      throw err
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

function createEntries (current) {
  console.log('creating database entries')
  dynamos.scan()
    .then((data) => {
      const processed = {}

      for (let item of data.Items) {
        processed[item.rep_name.S] = item.rep_id.S.split(',')
      }

      return processed
    })
    .then((old) => {
      var promiseArr = []

      for (let name of Object.keys(current)) {
        if (!old[name]) {
          // rep doesn't exist; create an entry
          promiseArr.push(dynamos.put({ name, id: current[name] }))
          console.log(`Creating an entry for ${name}`)
        } else {
          const oldArr = old[name].sort()
          const curArr = current[name].sort()

          if (oldArr.length !== curArr.length) {
            // id arrays don't match; update entry
            promiseArr.push(dynamos.put({ name, id: current[name] }))
            console.log(`Updating the entry for ${name}`)
          } else {
            for (let i = 0; i < curArr.length; i++) {
              if (curArr[i] !== oldArr[i]) {
                // id array items don't match; update entry
                promiseArr.push(dynamos.put({ name, id: current[name] }))
                console.log(`Updating IDs for ${name}`)
                break
              }
            }
          }
        }
      }

      for (let oldName of Object.keys(old)) {
        if (!current[oldName]) {
          promiseArr.push(dynamos.delete(oldName))
          console.log(`Deleting an entry for ${oldName}`)
        }
      }

      console.log(`${promiseArr.length} updates queued`)

      Promise.map(promiseArr, (put) => put, { concurrency: 3 })
    })
 
    .then(() => {
      console.log('writing to slot')
      const toWrite = Object.keys(current).join('\n')

      fsp.writeFile(path.join(__dirname, '../speechAssets/customSlotTypes/REP_NAME.txt'), toWrite)
    })
    .then(() => {
      console.log('success')
    })
    .catch((err) => {
      console.error(err)
    })
}

getReps()
