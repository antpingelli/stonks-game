const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';
const dbName = 'stonkGame';

async function dbRunQuery(collectionName, operation, params) {
  const client = new MongoClient(url, { useUnifiedTopology: true });
  try {
    await client.connect()
  } catch(e) {
    console.log(`Error: Connection to client ${e}`)
    return undefined
  }
  const collection = client.db(dbName).collection(collectionName)
  console.log(`Connected successfully to ${collectionName}`)

  let result
  try {
    result = await operation(collection, params)
  } catch {
    result = undefined
  } finally {
    await client.close()
    console.log(`Closed connection to ${collectionName}`)
  }

  return result
}


function dbGetLatestStockData() {
  return dbRunQuery('stockData', async (collection, callback) => {
    const options = {
      sort: { uid: -1 },
    }
  
    let result
    try {
      result = await collection.findOne({}, options)
    } finally { 
      callback()
    }
    
    return result
  })
}

async function dbGetUserData(filter, projection) {
  return await dbRunQuery('userData', (collection) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`Fetching userData`)
        const cursor = await collection.find(filter).project(projection)
        if ((await cursor.count()) === 0) {
          resolve(0)
        }

        const result = await cursor.next();
        resolve(result)
      } catch(e) {
        console.log(`Error: Fetching userData\n ${e}`)
        reject(e)
      }
    })
  })
}

module.exports = {
  dbRunQuery,
  dbGetLatestStockData,
  dbGetUserData,
}