const { Pool } = require('pg')
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.PGPORT
})
class Frame {
  constructor (data, frames, last_sync) {
    this.data = data
    this.frames = frames
    this.last_sync = last_sync
  }

  _createFrame () {
    return new Promise(async (resolve, reject) => {
      const query = `INSERT INTO frames
                    (id, project, start_at, end_at, tags)
                    VALUES
                    ($1, $2, $3, $4, $5)
                    ON CONFLICT (id) DO UPDATE SET
                    id = EXCLUDED.id,
                    project = EXCLUDED.project,
                    start_at = EXCLUDED.start_at,
                    end_at = EXCLUDED.end_at,
                    tags = EXCLUDED.tags
                  `
      const params = [
        this.data.id,
        this.data.project,
        this.data.start_at,
        this.data.end_at,
        JSON.stringify(this.data.tags)
      ]
      try {
        const response = await pool.query(query, params)
        resolve(response)
      } catch (e) {
        return reject(e)
      }
    })
  }


  list () {
    return new Promise(async (resolve, reject) => {
      try {
        let query = `SELECT * FROM frames
                      `
        let params = []
        if (this.last_sync) {
          query += ` WHERE sync_date > $1::date`
          params.push(this.last_sync)
        }
        const response = await pool.query(query, params)
        resolve(response.rows)
      } catch (e) {
        return reject(e)
      }
    })
  }

  import () {
    return new Promise(async (resolve, reject) => {
      if (!this.frames || this.frames.length === 0) {
        return reject('Frames Required')
      }
      try {
        for (let i in this.frames) {
          this.data = this.frames[i]
          await this._createFrame()
        }
        resolve(this.frames)
      } catch (e) {
        return reject(e)
      }
    })
  }
}

module.exports = Frame
