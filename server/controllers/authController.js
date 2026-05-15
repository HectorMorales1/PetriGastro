const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, nombre: user.nombre, apellidos: user.apellidos, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

let nextId = 3
const users = [
  {
    id: 1,
    nombre: 'Administrador',
    apellidos: '',
    email: 'admin@petrigastro.com',
    password_hash: bcrypt.hashSync('admin123', 12),
    rol: 'admin'
  },
  {
    id: 2,
    nombre: 'Cliente',
    apellidos: 'De Prueba',
    email: 'cliente@petrigastro.com',
    password_hash: bcrypt.hashSync('cliente123', 12),
    rol: 'cliente'
  }
]

exports.register = async (req, res) => {
  try {
    const { nombre, apellidos, email, password } = req.body

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'El email ya está registrado' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const newUser = {
      id: nextId++,
      nombre,
      apellidos: apellidos || '',
      email,
      password_hash: passwordHash,
      rol: 'cliente'
    }
    users.push(newUser)

    const token = generateToken(newUser)

    res.status(201).json({
      token,
      user: { id: newUser.id, nombre: newUser.nombre, apellidos: newUser.apellidos, email: newUser.email, rol: newUser.rol }
    })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const token = generateToken(user)

    res.json({
      token,
      user: { id: user.id, nombre: user.nombre, apellidos: user.apellidos, email: user.email, rol: user.rol }
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}

exports.me = async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    res.json({ id: user.id, nombre: user.nombre, apellidos: user.apellidos, email: user.email, rol: user.rol })
  } catch (error) {
    console.error('Error en me:', error)
    res.status(500).json({ message: 'Error del servidor' })
  }
}
