const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const { createDBHelper } = require('./dbUtils');
const { dbRunQuery } = require('../../common/dbClient');

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

module.exports = router;
