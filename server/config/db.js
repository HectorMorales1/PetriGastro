const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'petrigastro',
  user: 'postgres',
  password: 'password'
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

module.exports = pool