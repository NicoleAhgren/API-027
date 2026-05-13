import jwt from "jsonwebtoken"
import Song from "../models/Song.js"
import User from "../models/User.js"
import { requireAuth } from "../middleware/auth.js"
import { GraphQLError } from "graphql"

const resolvers = {
  Query: {
    // Implement pagination and search for songs
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
    // Fetch a single song by ID
    song: async (__, { id }) => {
      const song = await Song.findById(id)
      if (!song) throw new GraphQLError("Song not found", { extensions: { code: "NOT_FOUND", http: { status: 404 } } })
      return song
    },
    // Implement pagination for artists and aggregate their songs and total streams
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
      // Map the aggregation result to match the Artist type
      return result.map((a) => ({
        name: a._id,
        songs: a.songs,
        numberOfSongs: a.numberOfSongs,
        totalStreams: a.totalStreams,
      }))
    },
    // Fetch a single artist by name and aggregate their songs and total streams
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
      // Fetch top chart songs based on position
      topChart: async (__, { limit = 20 }) => {
        const songs = await Song.find({ position: { $exists: true } }).sort({ position: 1 }).limit(limit)
        return songs.map(s => ({ position: s.position, song: s}))
      },
  },

  Mutation: {
    // User registration with JWT authentication
    register: async (__, { username, password }) => {
      const existingUser = await User.findOne({ username })
      if (existingUser) throw new GraphQLError("User already exists", { extensions: { code: "BAD_USER_INPUT", http: { status: 400 } } })
      const user = new User({ username, password })
      await user.save()
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })
      return { token, user }
    },
    // User login with JWT authentication and password verification
    login: async (__, { username, password }) => {
      const user = await User.findOne({ username })
      const isMatch = user ? await user.comparePassword(password) : false
      if (!user || !isMatch) throw new GraphQLError("Invalid username or password", { extensions: { code: "UNAUTHENTICATED", http: { status: 401 } } })
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })
      return { token, user }
    },
    // Add a new song (requires authentication)
    addSong: async (__, { title, artist, daysReleased, position, top10, peakPosition, peakPositionTimes, peakStreams, totalStreams }, { user }) => {
      requireAuth(user)
      const song = new Song({ title, artist, daysReleased, position, top10, peakPosition, peakPositionTimes, peakStreams, totalStreams })
      return song.save()
    },
    // Update an existing song (requires authentication)
    updateSong: async (__, { id, ...updates}, { user }) => {
      requireAuth(user)
      const song = await Song.findByIdAndUpdate(id, updates, {new: true})
      if (!song) throw new GraphQLError("Song not found", { extensions: { code: "NOT_FOUND", http: { status: 404 } } })
      return song
    },
    // Delete a song (requires authentication)
      deleteSong: async (__, { id }, { user }) => {
        requireAuth(user)
        const song = await Song.findByIdAndDelete(id)
        if (!song) throw new GraphQLError("Song not found", { extensions: { code: "NOT_FOUND", http: { status: 404 } } })
        return true
      },
  }
}

export default resolvers
