const express = require('express');

const router = express.Router();

const { createDBHelper } = require('./dbUtils');
const { dbRunQuery } = require('../../common/dbClient');

router.post('/create', async (req, res) => {
  const { username, password } = req.body;
  // password should be encrypted
  if (!username || !password) {
    return res.status(400).send('200');
  }

  const params = {
    username,
    password,
    sid: req.body.sid,
  };
  const success = await dbRunQuery('userData', createDBHelper, params);

  if (!success) {
    return res.sendStatus(500);
  }

  return res.sendStatus(201);
});

router.post('/stats', async (req, res) => {
  const { username, password } = req.body;
  // password should be encrypted
  if (!username || !password) {
    return res.status(400).send('200');
  }

  const params = {
    username,
    password,
    sid: res.locals.sid,
  };
  const success = await dbRunQuery('userData', createDBHelper, params);

  if (!success) {
    return res.sendStatus(500);
  }

  return res.sendStatus(201);
});

module.exports = router;
