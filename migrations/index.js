require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.PGPORT
})
function up (migration, fileName) {
  pool.query(migration, (error, results) => {
    if (results) {
      console.log('Migration Successful', fileName)
    } else if (error) {
      console.log('Migration Error', error.code, fileName)
    }
  })
}

fs.readdir( __dirname, ( err, files ) => {
  files.forEach( (file, index) => {
    if (file !== 'index.js') {
      var fileContents = fs.readFileSync(path.join(__dirname, file))
      up(fileContents.toString(), file)
    }
  })
});
