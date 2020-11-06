const express = require('express')
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid')
const _ = require('lodash')

const { dbRunQuery } = require('./dbClient')
const transactionRouter = require('./transaction')

const port = 3000
const sessions = {}

app.use(express.json())
app.use(async (req, res, next) => {
  const { 
    stonkSession,
    username,
  } = req.body

  if (stonkSession) {
    const result = await dbRunQuery('sessionData', (collection, { stonkSession }) => {
      return new Promise(async (resolve, reject) => {
        let result
        try {
          console.log(`Fetching sessionData for ${stonkSession}`)
          const result = await collection.findOne({ sid: stonkSession })
          resolve(result)
        } catch(e) {
          console.log(`Error: Fetching sessionData\n ${e}`)
          reject(e)
        }
      })
    }, { stonkSession })

    if (_.isEmpty(result)) {
      console.log(`Error: Empty sessionData for ${stonkSession}`)
      return res.status(400).send('30')
    }

    res.locals.interval = result.interval
    res.locals.index = result.index
    res.locals.sid = result.sid
  }

  next()
})

app.route('/session')
  // .get((req, res) => {
  //   res.send(sessions)
  // })
  .post(async (req, res) => {
    // starting with single day
    // take in total time in seconds for session to last
    const { totalTime } = req.body
    if (!totalTime) {
      return res.status(401).send("100")
    }

    const uuid = uuidv4()
    const result = await dbRunQuery('sessionData', (collection, params) => {
      return new Promise(async (resolve, reject) => {
        const { totalTime } = params
        const doc = {
          sid: uuid,
          // users: [], may need this but not sure
          interval: totalTime / 50, // TODO this should not be hard coded
          index: 0
        }

        try {
          console.log(`Inserting session ${uuid}`)
          await collection.insertOne(doc)
          resolve(true)
        } catch(e) {
          console.log(`Error: Inserting session\n ${e}`)
          reject(e)
        }
      })
    }, { totalTime })

    if (!result) {
      return res.sendStatus(500)
    }

    return res.status(201).send(uuid)
  })

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

app.post('/user', async (req, res) => {
  const {
    username,
    password,
  } = req.body
  // password should be encrypted
  if (!username || !password) {
    return res.status(400).send("200")
  }

  const success = await dbRunQuery('userData', (collection, params) => {
    return new Promise(async (resolve, reject) => {
      const {
        username,
        password
      } = params
      const doc = {
        sid: res.locals.sid,
        username: username,
        password: password,
        transactions: {},
        remainingCash: 100000,
        portfolio: {},
        totalTaxPaid: 0,
      }

      try {
        console.log(`Inserting user ${username}`)
        await collection.insertOne(doc)
        resolve(true)
      } catch(e) {
        console.log(`Error: Inserting user\n ${e}`)
        reject(e)
      }
    })
  }, { username, password })

  if (!success) {
    return res.sendStatus(500)
  }
  
  return res.sendStatus(201)
})

// app.get('/start', (req, res) => {
//   function sendStockData() {
//     // this may fail if sessionData changes ie another session is created while still evaling
//     io.emit('stock price', priceData[sessionData.stockDataIndex]) // `PG: ${priceData[i].PG}, INTC: ${priceData[i].INTC}`)
//     sessionData.stockDataIndex += 1
//   }

//   sessionData.stockDataInterval = setInterval(sendStockData, sessionData.interval);
  
//   res.sendStatus(200)
// })

app.use('/transaction', transactionRouter)

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });
})

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})