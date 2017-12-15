require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const fs = require('fs')
const path = require('path')
const Frame = require('./class/Frame')
const User = require('./class/User')
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({}))

const server = http.createServer(app).listen(process.env.WATSON_PORT, () => {
  console.log('Listening on port ' + process.env.WATSON_PORT)
})

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,token')
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})


app.use(async (req, res, next) => {
  if (!req.headers['authorization']) return res.status(403).send({error: 'Authorization Required'})
  try {
    const user = new User()
    user.token = req.headers['authorization'].replace('Token ', '')
    const authed = await user.auth()
    next()
  } catch (e) {
    res.status(403).send({error: 'Authorization Required'})
  }
})

app.get('/*', async (req, res) => {
  try {
    const frame = new Frame()
    frame.last_sync = req.query.last_sync
    const response = await frame.list()
    res.status(200).send(response)
  } catch (e) {
    console.log(e)
    res.status(400).send('Error')
  }
})


app.post('/frames/bulk', async (req, res) => {
  try {
    const frame = new Frame()
    frame.frames = req.body
    if (frame.frames && frame.frames.length > 0) {
      const response = await frame.import()
    }
    res.status(201).send('uploaded')
  } catch (e) {
    console.log(e)
    res.status(400).send('Error')
  }
})
