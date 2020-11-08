const express = require('express');
const _ = require('lodash');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const { dbRunQuery } = require('./common/dbClient');
const { getSessionDBHelper } = require('./dbUtils');

const sessionRouter = require('./routes/session/session');
const userRouter = require('./routes/user/user');
const transactionRouter = require('./routes/transaction/transaction');

const port = 3000;

app.use(express.json());
// eslint-disable-next-line consistent-return
app.use(async (req, res, next) => {
  const { stonkSession } = req.body;

  if (stonkSession) {
    const result = await dbRunQuery('sessionData', getSessionDBHelper, { sid: stonkSession });

    if (_.isEmpty(result)) {
      console.log(`Error: Empty sessionData for ${stonkSession}`);
      return res.status(400).send('30');
    }

    res.locals.interval = result.interval;
    res.locals.index = result.index;
    res.locals.sid = result.sid;
  }

  next();
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

// app.get('/start', (req, res) => {
//   function sendStockData() {
//     // this may fail if sessionData changes ie another session is created while still evaling
//     io.emit('stock price', priceData[sessionData.stockDataIndex]) // `PG: ${priceData[i].PG}, INTC: ${priceData[i].INTC}`)
//     sessionData.stockDataIndex += 1
//   }

//   sessionData.stockDataInterval = setInterval(sendStockData, sessionData.interval);

//   res.sendStatus(200)
// })

app.use('/session', sessionRouter);
app.use('/user', userRouter);
app.use('/transaction', transactionRouter);

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    console.log(`message: ${msg}`);
  });
});

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
