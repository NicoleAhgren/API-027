import jwt from "jsonwebtoken"
import { GraphQLError } from "graphql"

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

export const requireAuth = (user) => {
  if (!user) {
    throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED", http: { status: 401 } } })
  }
}