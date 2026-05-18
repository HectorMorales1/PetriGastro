const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, nombre: user.nombre, apellidos: user.apellidos, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
}

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

exports.register = async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { nombre, apellidos, email, password } = req.body

    const existingUser = await client.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ message: 'El email ya está registrado' })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await client.query(
      'INSERT INTO usuarios (nombre, apellidos, email, password_hash, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, apellidos, email, rol',
      [nombre, apellidos || '', email, passwordHash, 'cliente']
    )

    const newUser = result.rows[0]

    const token = generateToken(newUser)
    const refreshToken = generateRefreshToken(newUser)

    await client.query('COMMIT')

    res.status(201).json({
      token,
      refreshToken,
      user: { id: newUser.id, nombre: newUser.nombre, apellidos: newUser.apellidos, email: newUser.email, rol: newUser.rol }
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error en registro:', error)
    res.status(500).json({ message: 'Error del servidor' })
  } finally {
    client.release()
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await pool.query(
      'SELECT id, nombre, apellidos, email, password_hash, rol FROM usuarios WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const user = result.rows[0]

    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)

    res.json({
      token,
      refreshToken,
      user: { id: user.id, nombre: user.nombre, apellidos: user.apellidos, email: user.email, rol: user.rol }
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.me = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, apellidos, email, rol FROM usuarios WHERE id = $1',
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error en me:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token requerido' })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Token inválido' })
    }

    const result = await pool.query(
      'SELECT id, nombre, apellidos, email, rol FROM usuarios WHERE id = $1',
      [decoded.id]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' })
    }

    const user = result.rows[0]
    const newToken = generateToken(user)
    const newRefreshToken = generateRefreshToken(user)

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      user: { id: user.id, nombre: user.nombre, apellidos: user.apellidos, email: user.email, rol: user.rol }
    })
  } catch (error) {
    console.error('Error en refresh token:', error)
    res.status(401).json({ message: 'Token inválido o expirado' })
  }
}