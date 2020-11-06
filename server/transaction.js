var express = require('express')
const { update } = require('lodash')
var router = express.Router()
const { v4: uuidv4 } = require('uuid')

const { dbRunQuery, dbGetUserData } = require('./dbClient')

router.post('/buy', async (req, res) => {
  const {
    username,
    password,
    ticker,
    numberOfSharesToPurchase,
  } = req.body

  // invalid ticker
  // invalid username
  // invalid shares

  if (!username || !password || !ticker || !numberOfSharesToPurchase) {
    return res.status(401).send("100")
  }

  // maybe only get part of the object here
  const projection = {remainingCash: 1, portfolio: 1}
  const userSession = await dbGetUserData(username, password, projection)
  if (!userSession) {
    console.log('Username not found or password does not match')
    return res.status(401).send("140")
  }

  // get price data
  const pricePerShareToPurchase = 100 //priceData[sessions[stonkSession].index][ticker]
  const totalPrice = Math.ceil((pricePerShareToPurchase * numberOfSharesToPurchase) * 100) / 100
  if (userSession.remainingCash < totalPrice) {
    res.status(401).send("200")
    return
  }

  const transactionId = uuidv4()
  const newTransaction = {
    timeOfPurchase: Date.now(),
    id: transactionId,
    ticker,
    numberOfSharesPurchased: numberOfSharesToPurchase,
    pricePerSharePurchased: pricePerShareToPurchase,
    indexOfPurchase: res.locals.index,
  }

  if (ticker in userSession.portfolio) {
    const portfolioOfTicker = userSession.portfolio[ticker]
    portfolioOfTicker.averagePricePerShareOwned = 
      ((portfolioOfTicker.numberOfSharesPurchased * portfolioOfTicker.averagePricePerShareOwned) 
      + (numberOfSharesToPurchase * pricePerShareToPurchase)) 
      / (portfolioOfTicker.numberOfSharesPurchased + numberOfSharesToPurchase)
    portfolioOfTicker.numberOfSharesPurchased += numberOfSharesToPurchase
  } else {
    userSession.portfolio[ticker] = {
      averagePricePerShareOwned: pricePerShareToPurchase,
      numberOfSharesPurchased: numberOfSharesToPurchase,
    }
  }

  userSession.remainingCash -= totalPrice

  const params = { 
    username,
    newTransaction,
    userSession: {
      portfolioOfTicker: {
        ...userSession.portfolio[ticker], 
      },
      remainingCash: userSession.remainingCash
    }
  }

  const result = await dbRunQuery('userData', (collection, params) => {
    return new Promise(async (resolve, reject) => {
      const {
        username,
        newTransaction,
        userSession: {
          remainingCash,
          portfolioOfTicker,
        },
      } = params

      const portfolio = {}
      portfolio[ticker] = portfolioOfTicker

      const updateDoc = {
        $set: { 
          remainingCash,
          portfolio,
        },
        $push: { 
          transactions: {
            $each: [newTransaction],
            $position: 0,
          } 
        }
      }

      try {
        console.log(`Updating ${username} for buy ${newTransaction.ticker}`)
        const result = await collection.updateOne({ username }, updateDoc)
        if (result.result.ok != 1) {
          console.log('Failed to update document')  
          reject(0)
        }

        resolve(result)
      } catch(e) {
        console.log(`Error: Failed to update \n ${e}`)
        reject(e)
      }
    })
  }, params)

  res.status(201).send({
    remainingCash: userSession.remainingCash,
    pricePerShareToPurchase,
    transactionId,
  })
})

router.post('/sell', async (req, res) => {
  const {
    username,
    password,
    transactionIDs,
  } = req.body

  if (!username || !password || transactionIDs.length === 0) {
    return res.status(401).send("100")
  }

  const projection = {remainingCash: 1, transactions: 1, portfolio: 1}
  const userSession = await dbGetUserData(username, password, projection)
  if (!userSession) {
    console.log('Username not found or password does not match')
    return res.status(401).send("140")
  }
  
  let taxPaid = 0
  for (transactionId of transactionIDs) {
    for (transaction of userSession.transactions) {
      if (transactionId === transaction.id) {
        const pricePerShareToSell = 200
        const currentPriceOfTransaction = Math.floor((pricePerShareToSell * transaction.numberOfSharesPurchased) * 100) / 100
        const grossProfit = currentPriceOfTransaction - (transaction.numberOfSharesPurchased * transaction.pricePerSharePurchased)
        if (grossProfit > 0) {
          const netProfit = Math.floor((grossProfit * 0.85) * 100) / 100
          userSession.remainingCash += netProfit
          taxPaid += grossProfit - netProfit
          transaction.profit = netProfit
        } else {
          transaction.profit = grossProfit
        }
        
        transaction.totalTaxPaid -= taxPaid
        transaction.timeOfSale = Date.now()
        transaction.pricePerShareSold = pricePerShareToSell
        transaction.indexOfSale = res.locals.index
      }
    }
  }

  // TODO update portfolio view

  const result = await dbRunQuery('userData', (collection, params) => {
    return new Promise(async (resolve, reject) => {
      const {
        username,
        remainingCash,
        totalTaxPaid,
        tranactions,
      } = params

      
      // const portfolio = {}
      // portfolio[ticker] = portfolioOfTicker
      
      const filter = { username, 'transactions.id': transactionID}
      const updateDoc = {
        $set: { 
          remainingCash,
          totalTaxPaid,
          // portfolio,
          'transactions.$.timeOfSale': timeOfSale,
          'transactions.$.totalTaxPaid': totalTaxPaid,
          'transactions.$.timeOfSale': timeOfSale,
          'transactions.$.pricePerShareSold': pricePerShareSold,
          'transactions.$.indexOfSale': indexOfSale,
        }
      }

      try {
        console.log(`Updating ${username}, transactionID: ${transactionID}`)
        const result = await collection.updateOne(filter, updateDoc)
        if (result.result.ok != 1) {
          console.log('Failed to update document')  
          reject(0)
        }

        resolve(result)
      } catch(e) {
        console.log(`Error: Failed to update \n ${e}`)
        reject(e)
      }
    })
  }, params)

  

  
  
  
  // TODO error handling for invalid transaction id
  res.sendStatus(200)
})

module.exports = router