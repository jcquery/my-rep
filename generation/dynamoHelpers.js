'use strict'

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

const dynamos = {
  repScan: function () {
    const params = {
      AttributesToGet: ['rep_name', 'rep_id']
    }
    const formatResults = function(err, data) {
      if (err) {
        throw err
      }
      const processed = {}

      for (let item of data.Items) {
        processed[item.rep_name.S] = item.rep_id.S.split(',')
      }

      return processed
    }
  
    table.scan(params, formatResults)
  }
}

module.exports = dynamos