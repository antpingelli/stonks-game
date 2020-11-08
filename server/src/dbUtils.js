async function getSessionDBHelper(collection, { sid }) {
  try {
    console.log(`Fetching sessionData for ${sid}`);
    const result = await collection.findOne({ sid });
    return Promise.resolve(result);
  } catch (e) {
    console.log(`Error: Fetching sessionData\n ${e}`);
    return Promise.reject(e);
  }
}

module.exports = {
  getSessionDBHelper,
};
