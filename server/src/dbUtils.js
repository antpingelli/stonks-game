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

async function authorizeUserDBHelper(collection, params) {
  const { sid, username, password } = params;

  const filter = {
    sid,
    username,
    password,
  };

  try {
    console.log(`Checking for user ${username}`);
    const result = await collection.findOne(filter);
    return Promise.resolve(result);
  } catch (e) {
    console.log(`Error: Checking for user ${username}\n ${e}`);
    return Promise.reject(e);
  }
}

module.exports = {
  authorizeUserDBHelper,
  getSessionDBHelper,
};
