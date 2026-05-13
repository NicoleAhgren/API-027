import jwt from "jsonwebtoken"
import Song from "../models/Song.js"
import User from "../models/User.js"
import { requireAuth } from "../middleware/auth.js"
import { GraphQLError } from "graphql"

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
        const totalCount = await Song.countDocuments(query)
        const songs = await Song.find(query).skip((page - 1) * limit).limit(limit)
        return {
          songs,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
        }
    },
    song: async (__, { id }) => {
      const song = await Song.findById(id)
      if (!song) throw new GraphQLError("Song not found", { extensions: { code: "NOT_FOUND", http: { status: 404 } } })
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
      if (!result.length) throw new GraphQLError("Artist not found", { extensions: { code: "NOT_FOUND", http: { status: 404 } } })
        const artistData = result[0]
        return { name: artistData._id, songs: artistData.songs, numberOfSongs: artistData.numberOfSongs, totalStreams: artistData.totalStreams}
      },

      topChart: async (__, { page = 1, limit = 20 }) => {
        const songs = await Song.find({ position: { $exists: true } }).sort({ position: 1 }).limit(limit)
        return songs.map(s => ({ position: s.position, song: s}))
      },
  },

  Mutation: {
    register: async (__, { username, password }) => {
      const existingUser = await User.findOne({ username })
      if (existingUser) throw new GraphQLError("User already exists", { extensions: { code: "BAD_USER_INPUT", http: { status: 400 } } })
      const user = new User({ username, password })
      await user.save()
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })
      return { token, user }
    },
    login: async (__, { username, password }) => {
      const user = await User.findOne({ username })
      const isMatch = user ? await user.comparePassword(password) : false
      if (!user || !isMatch) throw new GraphQLError("Invalid username or password", { extensions: { code: "UNAUTHENTICATED", http: { status: 401 } } })
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })
      return { token, user }
    },
    addSong: async (__, { title, artist, daysReleased, position, top10, peakPosition, peakPositionTimes, peakStreams, totalStreams }, { user }) => {
      requireAuth(user)
      const song = new Song({ title, artist, daysReleased, position, top10, peakPosition, peakPositionTimes, peakStreams, totalStreams })
      return song.save()
    },
    updateSong: async (__, { id, ...updates}, { user }) => {
      requireAuth(user)
      const song = await Song.findByIdAndUpdate(id, updates, {new: true})
      if (!song) throw new GraphQLError("Song not found", { extensions: { code: "NOT_FOUND", http: { status: 404 } } })
      return song
    },
      deleteSong: async (__, { id }, { user }) => {
        requireAuth(user)
        const song = await Song.findByIdAndDelete(id)
        if (!song) throw new GraphQLError("Song not found", { extensions: { code: "NOT_FOUND", http: { status: 404 } } })
        return true
      },
  }
}

export default resolvers
