let dotenvConfig = {}
if (process.cwd().indexOf('/build') !== -1) {
  dotenvConfig = {path: '../.env'}
}

require('dotenv').config(dotenvConfig)
const fs = require('fs')
const path = require('path')

let config = [
  {
    file: path.join(__dirname, '..', 'docker-compose.proxy.yml'),
    sample: path.join(__dirname, '..', 'docker-compose.proxy-sample.yml'),
    env: [
      {match: 'PROXY_DOMAIN:', value: process.env.PROXY_DOMAIN},
      {match: 'PROXY_SSL:', value: process.env.PROXY_SSL},
      {match: '#volumes:', bool: process.env.LETSENCRYPT, values: {
        true: `volumes:\n       - /etc/letsencrypt:/etc/letsencrypt
        `,
        false: '#volumes:'
      }}
    ]
  },
  {
    file: path.join(__dirname, 'deploy.sh'),
    sample: path.join(__dirname, 'deploy-sample.sh'),
    env: [
      {find: 'build@remote.server', replace: process.env.SSH_ENDPOINT}
    ]
  }
]


function setFileConfig (file, env) {
  return new Promise((resolve, reject) => {
    console.log('Set File Config:', file)
    let config = ''
    fs.readFile(file, (err, data) => {
      if (err) return reject(err)
      config = data.toString()
      for (var i = 0; i < env.length; i++) {
        if (env[i].value) {
          let regex = new RegExp(env[i].match + '.*')
          const trailingComma = config.match(regex)
          let trailComma = ''
          if (trailingComma && trailingComma[0].indexOf(',') !== -1) {
            if (trailingComma[0].indexOf(',') === (trailingComma[0].length - 1)) {
              trailComma = ','
            }
          }
          config = config.replace(regex, env[i].match + ' ' + JSON.stringify(env[i].value) + trailComma)
        } else if (env[i].bool) {
          let regex = new RegExp(env[i].match + '.*')
          if (env[i].bool === 'true') {
            config = config.replace(regex, env[i].values.true)
          } else {
            config = config.replace(regex, env[i].values.false)
          }
        } else if (env[i].find) {
          config = config.replace(env[i].find, env[i].replace)
        }
      }
      fs.writeFile(file, config, (err) => {
        if (err) return reject(err)
        resolve(file)
      })
    })
  })
}


function copySampleFile (sample, file) {
  return new Promise((resolve, reject) => {
    console.log('Copy Sample File', sample)
    fs.copyFile(sample, file, (err) => {
      if (err) return reject(err)
      resolve(file)
    })
  })
}

async function main () {
  try {
    for (var i = 0; i < config.length; i++) {
      if (config[i].sample) {
        await copySampleFile(config[i].sample, config[i].file)
      }
      await setFileConfig(config[i].file, config[i].env)
    }
  } catch (e) {
    console.log(e)
  }
}
main()
