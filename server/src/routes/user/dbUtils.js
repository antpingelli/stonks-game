async function createDBHelper(collection, params) {
  const { username, password, sid } = params;
  const doc = {
    sid,
    username,
    password,
    transactions: [],
    remainingCash: 100000,
    portfolio: {},
    totalTaxPaid: 0,
  };

  try {
    console.log(`Creating user ${username}`);
    await collection.insertOne(doc);
    return Promise.resolve(true);
  } catch (e) {
    console.log(`Error: Inserting user\n ${e}`);
    return Promise.reject(e);
  }
}

module.exports = {
  createDBHelper,
};
