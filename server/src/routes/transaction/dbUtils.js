async function buyDBHelper(collection, params) {
  const {
    username,
    newTransaction,
    userSession: { remainingCash, ticker, portfolioOfTicker },
  } = params;

  const updateDoc = {
    $set: { remainingCash },
    $push: {
      transactions: newTransaction,
    },
  };
  updateDoc.$set[`portfolio.${ticker}`] = portfolioOfTicker;
  // updateDoc.$set[`transactions.${newTransaction.id}`] = newTransaction

  try {
    console.log(`Updating ${username} for buy ${newTransaction.ticker}`);
    const result = await collection.updateOne({ username }, updateDoc);
    if (result.result.ok !== 1) {
      console.log('Failed to update document');
      return Promise.reject(new Error('Failed to update document'));
    }

    return Promise.resolve(result);
  } catch (e) {
    console.log(`Error: Failed to update \n ${e}`);
    return Promise.reject(e);
  }
}

async function sellDBHelper(collection, params) {
  const { username, password } = params;

  try {
    console.log(`Updating sell transactions for ${username}`);
    const result = await collection.updateOne({ username, password }, { $set: params });
    if (result.result.ok !== 1) {
      console.log('Failed to update document');
      return Promise.reject(new Error('Failed to update document'));
    }

    return Promise.resolve(result);
  } catch (e) {
    console.log(`Error: Failed to update \n ${e}`);
    return Promise.reject(e);
  }
}

module.exports = {
  buyDBHelper,
  sellDBHelper,
};
