import jwt from 'jsonwebtoken'
// import { SocketSession } from '../mongoose/schemas/socketsession.js'
import { User } from '../mongoose/schemas/user.js'
import { verifyRefreshToken } from '../utils/utils.js'

export const isAdmin = (req, res, next) => {
  if (req.admin) {
    next()
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Only admin is allowed to access this route',
    })
  }
}

export const isProvider = (req, res, next) => {
  if (req.user?.provider) {
    next()
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Only provider is allowed to access this route'
    })
  }
}

export const isUser = (req, res, next) => {
  if (req.user?.role === 'user') {
    next()
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Only user is allowed to access this route'
    })
  }
}

export const logRequest = (req, res, next) => {
  const date = new Date().toLocaleString('en-US', {
    timeZone: "Asia/Jakarta",
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    timeZoneName: "short"
  });
  console.log(`${date} : ${req.method} ${req.path}`)
  next()
}

export const checkToken = async (req, res, next) => {
  let token = ''
  try {
    token = req.headers?.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Please login first' })
    }
  } catch (error) {
    return res.status(401).json({ message: 'Error', yourToken: token })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // All admin action will only need to access req.admin
    if (decoded.role === 'admin') {
      req.admin = decoded
    } else {
      req.user = decoded
    }
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // 1. decode refresh token
      // 2. match refresh token against lastRefresh of that user
      // 3. if match, update lastRefresh to now and send new token and refresh token
      let refToken = req.cookies?.refreshToken
      const isRefresh = await verifyRefreshToken(refToken)
      let newToken
      if (isRefresh?.result) {
        newToken = jwt.sign(
          { id: isRefresh.id, username: isRefresh.username },
          process.env.JWT_SECRET,
          { expiresIn: '10m' }
        );
        return res.status(201).json({ token: `Bearer ${newToken}` })
      } else {
        console.log("[TOKEN-REFRESH] FAILED")
        return res.status(201).json({ error: 'Token Expired' })
      }
    } else {
      console.log('Error : ', error)
      return res.status(201).json({ message: 'Error', yourToken: token })
    }
  }
}


export const socketToken = async (socket, next) => {
  // let token = socket?.handshake?.auth?.token.split(' ')[1]
  // TODO create data session to store session. if it deteect jwt token that is stored in there, reject the connection
  let token = ''
  let listConn = await SocketSession.find({})
  let hitCount = 0
  try {
    token = socket?.handshake?.auth?.token.split(' ')[1]
  } catch (error) {
    hitCount++
    console.log('Error : ', hitCount)
    return next(new Error('Unauthorized: Invalid token'));
  }
  // token = token?.split(' ')[1]
  if (!token) {
    console.log('No SOCKET token provided')
    return next(new Error('Unauthorized: Invalid token'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = decoded
    if (listConn.includes(socket.user.username)) {
      console.log(`User ${socket.user.username} already connected`)
      return res.status(401).json({ message: 'Error', detail: 'Another connection exxist' }) /* TODO */
    }
    const u = new SocketSession({
      username: socket.user.username
    })
    const usave = await u.save()

    console.log(`Socket granted for ${socket.user.username}`)
    next()
  } catch (error) {
    return next(new Error('Unauthorized: Token verification failed'));
  }
}
// create middleware to auth / assign user / role to each array
