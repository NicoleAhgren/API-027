import 'dotenv/config'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import mongoose from 'mongoose'

async function start() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const server = new ApolloServer({ typeDefs, resolvers })

  const { url } = await startStandaloneServer(server, {
    listen: { port: process.env.PORT || 2000 },
    context: async ({ req }) => ({ user: getUser(req) })
  })

  console.log(`GraphQL server running at ${url}`)
}

start().catch(console.error)
