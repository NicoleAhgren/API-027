import gql from 'graphql-tag'

const typeDefs = gql`
  type Song {
    id: ID!
    title: String!
    artist: String!
    daysReleased: Int
    position: Int
    top10: Int
    peakPosition: Int
    peakPositionTimes: String
    peakStreams: Float
    totalStreams: Float
  }
  
  type Artist {
    name: String!
    songs: [Song!]!
    numberOfSongs: Int!
    totalStreams: Float!
    }

    type ChartEntry {
    position: Int!
    song: Song!
    }

    type User {
    id: ID!
    username: String!
    }

    type AuthPayload {
    token: String!
    user: User!
    }

    type SongsResult {
    songs: [Song!]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
    }

    type Query {
    songs(page: Int, limit: Int, search: String): SongsResult!
    song(id: ID!): Song
    artists(page: Int, limit: Int): [Artist!]!
    artist(name: String!): Artist
    topChart(limit: Int): [ChartEntry!]!
    }

    type Mutation {
    register(username: String!, password: String!): AuthPayload!
    login(username: String!, password: String!): AuthPayload!
    addSong(title: String!, artist: String!): Song!
    updateSong(id: ID!, title: String, artist: String): Song!
    deleteSong(id: ID!): Boolean!
    }
  `

  export default typeDefs