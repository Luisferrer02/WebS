//models/nosql/tracks.js
const mongoose = require("mongoose")
const mongooseDelete = require("mongoose-delete")

const TracksSchema = new mongoose.Schema({
  name: { type: String, required: true },
  album: { type: String, required: true },
  cover: { type: String, required: true },
  artist: {
    name: { type: String, required: true },
    nickname: { type: String, required: true },
    nationality: { type: String, required: true }
  },
  duration: {
    start: { type: Number, required: true },
    end: { type: Number, required: true }
  },
  mediaId: { type: String, required: true }
})

// Plugin para soft delete
TracksSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true })

module.exports = mongoose.model("tracks", TracksSchema)
