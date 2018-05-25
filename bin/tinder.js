"use strict"

require("dotenv").config()

const { TinderClient } = require('tinder-client')
const db = require("../lib/db")

const facebookUserId = process.env.FACEBOOK_ID
const facebookToken = process.env.FACEBOOK_TOKEN

const run = async () => {
  const client = await TinderClient.create({ facebookUserId, facebookToken })
  const matches = await client.client({
    method: 'get',
    url: `/v2/matches`,
  }).then(response => response.data)

  // save current matches so we don't re-message them (one-time)
  for (let match of matches.data.matches) {
    let newMatch = new db.Match({
      matchId: match._id
    })

    await newMatch.save()
  }
  // is this a new match?

  // if so, send them the scheduling message
  // save match id so we don't re-message them

}

run()
