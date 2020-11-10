const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const stockData = require('../../../data/prices.json');

const { 
  createDBHelper,
  getActiveSessionsDBHelper,
  activateSessionsDBHelper,
} = require('./dbUtils');
const { dbRunQuery } = require('../../common/dbClient');
const { collectionNames } = require('../../common/constants');

router.post('/', async (req, res) => {
  // starting with single day
  // take in total time in seconds for session to last
  const { totalTime } = req.body;
  if (!totalTime) {
    return res.status(401).send('100');
  }

  const uuid = uuidv4();
  const params = {
    totalTime,
    uuid,
  };
  const result = await dbRunQuery('sessionData', createDBHelper, params);

  if (!result) {
    return res.sendStatus(500);
  }

  return res.status(201).send(uuid);
});

router.get('/start', (req, res) => {
  const result = activateSessionsDBHelper(collectionNames.SESSIONS, {sid: params.body.sid});
  if (result === 0) {
    return res.status(400).send({code: 56});
  }
  
  // TODO this only works for one session at a time
  setInterval(
    () => {
      const cursor = await getActiveSessionsDBHelper(collectionNames.SESSIONS);

      await cursor.forEach((session) => {
        io.emit('stockData', stockData[session.index]) // `PG: ${priceData[i].PG}, INTC: ${priceData[i].INTC}`)
      });
    },
    res.locals.interval
  );
  return res.sendStatus(200);
});

module.exports = router;
