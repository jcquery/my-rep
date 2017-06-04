'use strict'

const dotenv = require('../src/node_modules/dotenv').config()
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
  scan: function () {
    const params = {
      AttributesToGet: ['rep_name', 'rep_id']
    }
  
    return table.scan(params).promise()
  },

  put: function(rep) {
    const params = {
      Item: {
        rep_name: { S: rep.name },
        rep_id: { S: rep.id.join(',') }
      }
    }

    return table.putItem(params).promise()
  },

  delete: function(name) {
    const params = {
      Key: {
        rep_name: { S: name }
      }
    }

    return table.deleteItem(params).promise() 
  }
}

module.exports = dynamos