"use strict"

require("dotenv").config()

const { TinderClient } = require("tinder-client")
const db = require("../lib/db")
const Agenda = require("agenda")

const message = "[🤖] Hi! I like you too. Let's go out? " + process.env.URL
const facebookUserId = process.env.FACEBOOK_ID
const facebookToken = process.env.FACEBOOK_TOKEN
const agenda = new Agenda({ db: { address: process.env.DB_URL } })

const run = async () => {
  try {
    agenda.on("ready", async () => {
      await db.AgendaJob.remove()

      console.log("Starting bot...")

      agenda.every("1 minutes", "handle matches")
      agenda.start()
    })
  } catch (error) {
    throw error
  }
}

agenda.define("handle matches", async (job, done) => {
  try {
    const client = await TinderClient.create({ facebookUserId, facebookToken })
    const matches = await client
      .client({
        method: "get",
        url: `/v2/matches`
      })
      .then(response => response.data)

    for (let match of matches.data.matches) {
      // is this a new match?
      let currentMatch = await db.Match.findOne({
        matchId: match._id
      })

      // if so, send them the scheduling message
      // save match id so we don't re-message them
      if (!currentMatch) {
        console.log("New match!", match.person.name, "-", match.person.bio)

        let newMatch = new db.Match({ matchId: match._id })

        await newMatch.save()

        await client.messageMatch({
          matchId: match._id,
          message: message
        })
      }
    }
    done()
  } catch (error) {
    console.log(error)
    done()
  }
})

run()
