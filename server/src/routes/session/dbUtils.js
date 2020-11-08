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

module.exports = {
  createDBHelper,
};
