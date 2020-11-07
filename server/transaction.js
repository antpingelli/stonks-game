var express = require('express')
var router = express.Router()
const { v4: uuidv4 } = require('uuid')

const { dbRunQuery, dbGetUserData } = require('./dbClient')
const { generateId } = require('./utils')

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

  const projection = {remainingCash: 1, portfolio: 1}
  const userSession = await dbGetUserData({ username, password }, projection)
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

  const newTransaction = {
    timeOfPurchase: Date.now(),
    id: generateId(),
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
      ticker,
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
          ticker,
          portfolioOfTicker,
        },
      } = params

      const updateDoc = {
        $set: { remainingCash },
        $push: {
          transactions: newTransaction,
        }
      }
      updateDoc.$set[`portfolio.${ticker}`] = portfolioOfTicker
      // updateDoc.$set[`transactions.${newTransaction.id}`] = newTransaction

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
    transactionID: newTransaction.id,
  })
})

router.post('/sell', async (req, res) => {
  const {
    username,
    password,
    transactionIDsToSell,
  } = req.body

  if (!username || !password || transactionIDsToSell.length === 0) {
    return res.status(401).send("100")
  }

  // filter['transactions.$.id'] = {$in: transactionIDsToSell}
  const projection = {remainingCash: 1, transactions: 1, portfolio: 1, totalTaxPaid: 1}
  const userSession = await dbGetUserData({ username, password }, projection)
  if (!userSession) {
    console.log('Username not found or password does not match')
    return res.status(401).send("140")
  }
  
  for (let i = 0; i < transactionIDsToSell.length; i++) {
    for (transaction of userSession.transactions) {
      if (transactionIDsToSell[i] === transaction.id) {
        transactionIDsToSell.shift()
        const pricePerShareToSell = 200
        const currentPriceOfTransaction = Math.floor((pricePerShareToSell * transaction.numberOfSharesPurchased) * 100) / 100
        const purchasePriceOfTransaction = Math.floor((transaction.numberOfSharesPurchased * transaction.pricePerSharePurchased) * 100) / 100
        const grossProfit = currentPriceOfTransaction - purchasePriceOfTransaction
        if (grossProfit > 0) {
          const netProfit = Math.floor((grossProfit * 0.85) * 100) / 100
          userSession.remainingCash += netProfit + purchasePriceOfTransaction
          userSession.totalTaxPaid += grossProfit - netProfit
          transaction.profit = netProfit
        } else {
          transaction.profit = grossProfit
        }
        
        transaction.timeOfSale = Date.now()
        transaction.pricePerShareSold = pricePerShareToSell
        transaction.indexOfSale = res.locals.index
      }
    }
  }

  // TODO update portfolio view

  const params = {
    username,
    password,
    transactions: userSession.transactions,
    totalTaxPaid: userSession.totalTaxPaid,
    remainingCash: userSession.remainingCash,
  }
  // TODO dont reinsert all of the transactions
  const result = await dbRunQuery('userData', (collection, params) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`Updating sell transactions for ${username}`)
        const result = await collection.updateOne({ username, password }, {$set: params})
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