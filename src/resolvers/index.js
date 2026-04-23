import jwt from 'jsonwebtoken'
import Song from '../models/Song.js'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const resolvers = {
  Query: {
    songs: async (__, { page = 1, limit = 20, search}) => {
      const query = search ? { $or: [{title: new RegExp(search, 'i')}, {artist: new RegExp(search, 'i')}] } : {}
      return Song.find(query).skip((page - 1) * limit).limit(limit)
    }
  }
}