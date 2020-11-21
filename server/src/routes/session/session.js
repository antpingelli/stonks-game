const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const { createDBHelper, incrementIndexDBHelper } = require('./dbUtils');
const { dbRunQuery, dbGetSessionsInState, dbChangeSessionState } = require('../../common/dbClient');
const { collectionNames, sessionState } = require('../../common/constants');

const stockData = require('../../../data/prices.json');

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
  const result = await dbRunQuery(collectionNames.SESSIONS, createDBHelper, params);

  if (!result) {
    return res.sendStatus(500);
  }

  return res.status(201).send(uuid);
});

router.get('/start', async (req, res) => {
  const result = await dbChangeSessionState(req.body.sid, sessionState.ACTIVE);
  if (result === 0) {
    return res.status(400).send({ code: 56 });
  }

  setInterval(async () => {
    const sessions = await dbGetSessionsInState({ state: sessionState.ACTIVE });

    await sessions.forEach(async (session) => {
      res.locals.io.emit('stockData', stockData[session.index]); // `PG: ${priceData[i].PG}, INTC: ${priceData[i].INTC}`)
      // TODO might need await here for multiple
      dbRunQuery(collectionNames.SESSIONS, incrementIndexDBHelper, { sid: session.sid });
    });
  }, 5000); // TODO figure out how to not hardcode this

  return res.sendStatus(200);
});

module.exports = router;
