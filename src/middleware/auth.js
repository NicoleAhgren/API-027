import jwt from "jsonwebtoken"

export const getUser = (req) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  try {
    if (token) {
      return jwt.verify(token, process.env.JWT_SECRET)
    } else {
      return null
    }
} catch (err) {
    return null
  }
}

export const requireAuth = (user) => {
  if (!user) {
    throw new Error('Not authenticated')
  }
}