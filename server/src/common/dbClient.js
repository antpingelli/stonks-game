const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'stonkGame';

async function dbRunQuery(collectionName, operation, params) {
  const client = new MongoClient(url, { useUnifiedTopology: true });
  try {
    await client.connect();
  } catch (e) {
    console.log(`Error: Connection to client ${e}`);
    return undefined;
  }
  const collection = client.db(dbName).collection(collectionName);
  console.log(`Connected successfully to ${collectionName}`);

  let result;
  try {
    result = await operation(collection, params);
  } catch (e) {
    result = undefined;
  } finally {
    await client.close();
    console.log(`Closed connection to ${collectionName}`);
  }

  return result;
}

// function dbGetLatestStockData() {
//   return dbRunQuery('stockData', async (collection, callback) => {
//     const options = {
//       sort: { uid: -1 },
//     };

//     let result;
//     try {
//       result = await collection.findOne({}, options);
//     } finally {
//       callback();
//     }

//     return result;
//   });
// }

async function dbGetUserData(filter, projection) {
  return dbRunQuery('userData', async (collection) => {
    try {
      console.log(`Fetching userData`);
      const cursor = await collection.find(filter).project(projection);
      if ((await cursor.count()) === 0) {
        return Promise.resolve(0);
      }

      const result = await cursor.next();
      return Promise.resolve(result);
    } catch (e) {
      console.log(`Error: Fetching userData\n ${e}`);
      return Promise.reject(e);
    }
  });
}

module.exports = {
  dbRunQuery,
  dbGetUserData,
};
