const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'stonkGame';

// Use connect method to connect to the Server
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

async function dbGetUserData(username, password, projection) {
  return await dbRunQuery('userData', (collection, params) => {
    return new Promise(async (resolve, reject) => {
      const { username, password } = params
      
      try {
        console.log(`Fetching userData for ${username}`)
        const cursor = await collection.find({ username, password }).project(projection);
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
  }, { username, password })
}

module.exports = {
  dbRunQuery,
  dbGetLatestStockData,
  dbGetUserData,
}