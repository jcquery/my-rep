'use strict'

const fsp = require('fs-promise')
const axios = require('axios')
const dotenv = require('dotenv').config()
const path = require('path')

function getSenators (congress) {
  return axios.get(`https://api.propublica.org/congress/v1/${congress}/senate/members.json`, {
    headers: {
      'X-API-Key': process.env.SUNLIGHT_KEY
    }
  })
}
function getReps (congress) {
  return axios.get(`https://api.propublica.org/congress/v1/${congress}/house/members.json`, {
    headers: {
      'X-API-Key': process.env.SUNLIGHT_KEY
    }
  })
}
function buildFiles (conArray) {
  return conArray.reduce((obj, mem) => {
    const name = `${mem.first_name} ${mem.last_name}`
    if (obj.idMap[name]) {
      obj.idMap[name].push(mem.id)
    } else {
      obj.nameList.push(name)
      obj.idMap[name] = [mem.id]
    }

    return obj
  }, {nameList: [], idMap: {}})
}
function outputFiles (conNum) {
  let obj

  axios.all([getSenators(conNum), getReps(conNum)])
    .then(axios.spread((senators, reps) => {
      return buildFiles(senators.data.results[0].members.concat(reps.data.results[0].members))
    }))
    .then((built) => {
      obj = built
      return fsp.writeFile(path.join(__dirname, '../speechAssets/customSlotTypes/REP_NAME.txt'), obj.nameList.join('\n'))
    })
    .then(() => {
      return fsp.writeFile(path.join(__dirname, '/handlers/congressMap.json'), JSON.stringify(obj.idMap))
    })
    .catch((err) => {
      console.log(err)
    })
}

outputFiles(115)
