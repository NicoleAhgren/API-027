import jwt from "jsonwebtoken"
import Song from "../models/Song.js"
import User from "../models/User.js"
import { requireAuth } from "../middleware/auth.js"

const resolvers = {
  Query: {
    songs: async (__, { page = 1, limit = 20, search }) => {
      const query = search
        ? {
            $or: [
              { title: new RegExp(search, "i") },
              { artist: new RegExp(search, "i") },
            ],
          }
        : {}
      return Song.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
    },

    song: async (__, { id }) => {
      const song = await Song.findById(id)
      if (!song) throw new Error("Song not found")
      return song
    },

    artists: async (__, { page = 1, limit = 20 }) => {
      const result = await Song.aggregate([
        {$group: {
            _id: "$artist",
            songs: { $push: "$$ROOT" },
            numberOfSongs: { $sum: 1 },
            totalStreams: { $sum: "$totalStreams" },
          },
        },
        { $sort: { totalStreams: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ])
      return result.map((a) => ({
        name: a._id,
        songs: a.songs,
        numberOfSongs: a.numberOfSongs,
        totalStreams: a.totalStreams,
      }))
    },
    artist: async (__, { name }) => {
      const result = await Song.aggregate([
        { $match: { artist: name } },
        { $group: {
            _id: "$artist",
            songs: { $push: "$$ROOT" },
            numberOfSongs: { $sum: 1 },
            totalStreams: { $sum: "$totalStreams" },
         } }
      ])
      if (!result.length) throw new Error('Artist not found')
        const artistData = result[0]
        return { name: artistData._id, songs: artistData.songs, numberOfSongs: artistData.numberOfSongs, totalStreams: artistData.totalStreams}
      },

      topChart: async (__, { page = 1, limit = 20 }) => {
        const songs = await Song.find({ position: { $exists: true } }).sort({ position: 1 }).limit(limit)
        return songs.map(s => ({ position: s.position, song: s}))
      },
  },
}
