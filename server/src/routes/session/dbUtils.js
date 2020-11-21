const { sessionState } = require('../../common/constants');

async function createDBHelper(collection, params) {
  const { totalTime, uuid } = params;
  const doc = {
    sid: uuid,
    // users: [], may need this but not sure
    interval: totalTime / 50, // TODO this should not be hard coded
    index: 0,
    state: sessionState.WAITING,
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

async function incrementIndexDBHelper(collection, { sid }) {
  const updateDoc = {
    $inc: {
      index: 1,
    },
  };

  try {
    console.log(`Incrementing index for ${sid}`);
    const result = await collection.updateOne({ sid }, updateDoc);
    return Promise.resolve(result.modifiedCount);
  } catch (e) {
    console.log(`Error: Incrementing index for ${sid}\n ${e}`);
    return Promise.reject(e);
  }
}

module.exports = {
  createDBHelper,
  startDBHelper,
  incrementIndexDBHelper,
};
