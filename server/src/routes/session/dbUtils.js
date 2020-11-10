const { sessionState } = require('../../common/constants');

async function createDBHelper(collection, params) {
  const { totalTime, uuid } = params;
  const doc = {
    sid: uuid,
    // users: [], may need this but not sure
    interval: totalTime / 50, // TODO this should not be hard coded
    index: 0,
  };

  try {
    console.log(`Creating session ${uuid}`);
    await collection.insertOne(doc);
    return Promise.resolve(true);
  } catch (e) {
    console.log(`Error: Inserting session\n ${e}`);
    return Promise.reject(e);
  }
}

async function startDBHelper(collection, params) {
  const { totalTime, uuid } = params;
  const doc = {
    sid: uuid,
    interval: totalTime / 50, // TODO this should not be hard coded
    index: 0,
  };

  try {
    console.log(`Creating session ${uuid}`);
    await collection.insertOne(doc);
    return Promise.resolve(true);
  } catch (e) {
    console.log(`Error: Inserting session\n ${e}`);
    return Promise.reject(e);
  }
}

async function activateSessionsDBHelper(collection, params) {
  const { sid, status } = params;
  const updateDoc = {
    $set: {
      status,
    },
  };

  try {
    console.log(`Changing status of ${sid} to ${status}`);
    const result = await collection.updateOne({ sid }, updateDoc);
    return Promise.resolve(result.modifiedCount);
  } catch (e) {
    console.log(`Error: Changing status of ${sid} to ${status}\n ${e}`);
    return Promise.reject(e);
  }
}

async function getActiveSessionsDBHelper(collection) {
  try {
    console.log(`Creating session ${uuid}`);
    const cursor = await collection.find({ status: sessionState.ACTIVE });
    return Promise.resolve(cursor);
  } catch (e) {
    console.log(`Error: Getting active sessions\n ${e}`);
    return Promise.reject(e);
  }
}

module.exports = {
  createDBHelper,
  startDBHelper,
  activateSessionsDBHelper,
  getActiveSessionsDBHelper,
};
