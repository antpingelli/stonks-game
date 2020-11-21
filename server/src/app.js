const express = require('express');
const _ = require('lodash');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const sessionRouter = require('./routes/session/session');
const userRouter = require('./routes/user/user');
const transactionRouter = require('./routes/transaction/transaction');

const { getSessionDBHelper, authorizeUserDBHelper } = require('./dbUtils');
const { dbRunQuery } = require('./common/dbClient');
const { collectionNames } = require('./common/constants');

const port = 3000;

app.use(express.json());
app.use((req, res, next) => {
  res.locals.io = io;
  next();
});
// eslint-disable-next-line consistent-return
app.use(async (req, res, next) => {
  const { sid } = req.body;

  if (sid) {
    const sessionResult = await dbRunQuery(collectionNames.SESSIONS, getSessionDBHelper, { sid });

    if (_.isEmpty(sessionResult)) {
      console.log(`Error: Empty sessionData for ${sid}`);
      return res.status(400).send({ code: 30 });
    }

    res.locals.interval = sessionResult.interval;
    res.locals.index = sessionResult.index;

    // authorization
    const { username, password } = req.body;
    if (username && password && req.path !== '/user/create') {
      try {
        const userResult = await dbRunQuery(collectionNames.USERS, authorizeUserDBHelper, { sid, username, password });

        if (_.isEmpty(userResult)) {
          console.log(`Error: No user found for ${username} in session ${sid}`);
          return res.status(401).send({ code: 40 });
        }

        res.locals.isAuthorized = true;
      } catch (e) {
        return res.sendStatus(401).send({ code: 45 });
      }
    }
  }

  next();
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use('/session', sessionRouter);
app.use('/user', userRouter);
app.use('/transaction', transactionRouter);

io.on('connection', (socket) => {
  io.emit('stockData', 'hi'); // `PG: ${priceData[i].PG}, INTC: ${priceData[i].INTC}`)
  console.log('we here');
  socket.on('stockData', (msg) => {
    console.log(`message: ${msg}`);
  });
});

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
