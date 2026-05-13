import jwt from "jsonwebtoken"
import { GraphQLError } from "graphql"

// Middleware to extract user from JWT token in Authorization header
export const getUser = (req) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  try {
    if (token) {
      return jwt.verify(token, process.env.JWT_SECRET)
    } else {
      return null
    }
} catch {
    return null
  }
}

// Middleware to require authentication for certain resolvers
export const requireAuth = (user) => {
  if (!user) {
    throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED", http: { status: 401 } } })
  }
}