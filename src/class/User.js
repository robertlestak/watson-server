const { Pool } = require('pg')
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.PGPORT
})

class User {
  constructor (id, token) {
    this.id = id
    this.token = token
  }

  auth () {
    return new Promise(async (resolve, reject) => {
      if (!this.token) return reject('Token Required')
      try {
        const query = `SELECT COUNT(*) FROM users WHERE token = $1`
        const params = [this.token]
        const response = await pool.query(query, params)
        if (response.rows && response.rows.length > 0 && response.rows[0].count > 0) {
          resolve(true)
        } else {
          return reject('Authorization Required')
        }
      } catch (e) {
        return reject(e)
      }
    })
  }
}

module.exports = User
