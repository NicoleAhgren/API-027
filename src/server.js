import 'dotenv/config'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import mongoose from 'mongoose'
import typeDefs from './schema/typeDefs.js'
import { getUser } from './middleware/auth.js'
import resolvers from './resolvers/index.js'


async function start() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
  })

  const { url } = await startStandaloneServer(server, {
    listen: { port: process.env.PORT || 2000 },
    context: async ({ req }) => ({ user: getUser(req) })
  })

  console.log(`GraphQL server running at ${url}`)
}

start().catch(console.error)
