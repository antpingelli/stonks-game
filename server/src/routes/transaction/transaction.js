const express = require('express');

const router = express.Router();

const { buyDBHelper, sellDBHelper } = require('./dbUtils');
const { dbRunQuery, dbGetUserData } = require('../../common/dbClient');
const { generateId } = require('../../common/utils');

router.post('/buy', async (req, res) => {
  const { username, password, ticker, numberOfSharesToPurchase } = req.body;

  // invalid ticker
  // invalid username
  // invalid shares

  if (!username || !password || !ticker || !numberOfSharesToPurchase) {
    return res.status(401).send({ code: '100' });
  }

  const projection = { remainingCash: 1, portfolio: 1 };
  const userSession = await dbGetUserData({ username, password }, projection);
  if (!userSession) {
    console.log('Username not found or password does not match');
    return res.status(401).send('140');
  }

  // get price data
  const pricePerShareToPurchase = 100; // priceData[sessions[stonkSession].index][ticker]
  const totalPrice = Math.ceil(pricePerShareToPurchase * numberOfSharesToPurchase * 100) / 100;
  if (userSession.remainingCash < totalPrice) {
    return res.status(401).send('200');
  }

  const newTransaction = {
    timeOfPurchase: Date.now(),
    id: generateId(),
    ticker,
    numberOfSharesPurchased: numberOfSharesToPurchase,
    pricePerSharePurchased: pricePerShareToPurchase,
    indexOfPurchase: res.locals.index,
  };

  if (ticker in userSession.portfolio) {
    const portfolioOfTicker = userSession.portfolio[ticker];
    portfolioOfTicker.averagePricePerShareOwned =
      (portfolioOfTicker.numberOfSharesOwned * portfolioOfTicker.averagePricePerShareOwned +
        numberOfSharesToPurchase * pricePerShareToPurchase) /
      (portfolioOfTicker.numberOfSharesOwned + numberOfSharesToPurchase);
    portfolioOfTicker.numberOfSharesOwned += numberOfSharesToPurchase;
  } else {
    userSession.portfolio[ticker] = {
      averagePricePerShareOwned: pricePerShareToPurchase,
      numberOfSharesOwned: numberOfSharesToPurchase,
    };
  }

  userSession.remainingCash -= totalPrice;

  const dbParams = {
    username,
    newTransaction,
    userSession: {
      ticker,
      portfolioOfTicker: {
        ...userSession.portfolio[ticker],
      },
      remainingCash: userSession.remainingCash,
    },
  };

  await dbRunQuery('userData', buyDBHelper, dbParams);

  return res.status(201).send({
    remainingCash: userSession.remainingCash,
    pricePerShareToPurchase,
    transactionID: newTransaction.id,
  });
});

router.post('/sell', async (req, res) => {
  const { username, password, transactionIDsToSell } = req.body;

  if (!username || !password || transactionIDsToSell.length === 0) {
    return res.status(401).send('100');
  }

  // filter['transactions.$.id'] = {$in: transactionIDsToSell}
  const projection = { remainingCash: 1, transactions: 1, portfolio: 1, totalTaxPaid: 1 };
  const userSession = await dbGetUserData({ username, password }, projection);
  if (!userSession) {
    console.log('Username not found or password does not match');
    return res.status(401).send('140');
  }

  for (let i = 0; i < transactionIDsToSell.length; i += 1) {
    for (let j = 0; j < userSession.transactions.length; j += 1) {
      const transaction = userSession.transactions[j];
      if (transactionIDsToSell[i] === transaction.id) {
        transactionIDsToSell.shift();
        const pricePerShareToSell = 200;
        const currentPriceOfTransaction =
          Math.floor(pricePerShareToSell * transaction.numberOfSharesPurchased * 100) / 100;
        const purchasePriceOfTransaction =
          Math.floor(transaction.numberOfSharesPurchased * transaction.pricePerSharePurchased * 100) / 100;
        const grossProfit = currentPriceOfTransaction - purchasePriceOfTransaction;
        if (grossProfit > 0) {
          const netProfit = Math.floor(grossProfit * 0.85 * 100) / 100;
          userSession.remainingCash += netProfit + purchasePriceOfTransaction;
          userSession.totalTaxPaid += grossProfit - netProfit;
          transaction.profit = netProfit;
        } else {
          transaction.profit = grossProfit;
        }
        transaction.timeOfSale = Date.now();
        transaction.pricePerShareSold = pricePerShareToSell;
        transaction.indexOfSale = res.locals.index;

        // calculate new portfolioOfTicker
        const portfolioOfTicker = userSession.portfolio[transaction.ticker];
        const updatedNumberOfSharesOwned = portfolioOfTicker.numberOfSharesOwned - transaction.numberOfSharesPurchased;
        if (updatedNumberOfSharesOwned === 0) {
          delete userSession.portfolio[transaction.ticker];
        } else {
          portfolioOfTicker.averagePricePerShareOwned =
            (portfolioOfTicker.averagePricePerShareOwned * portfolioOfTicker.numberOfSharesOwned -
              transaction.pricePerSharePurchased * transaction.numberOfSharesPurchased) /
            updatedNumberOfSharesOwned;
          portfolioOfTicker.numberOfSharesOwned = updatedNumberOfSharesOwned;
        }
      }
    }
  }

  const dbParams = {
    username,
    password,
    totalTaxPaid: userSession.totalTaxPaid,
    remainingCash: userSession.remainingCash,
    transactions: userSession.transactions,
    portfolio: userSession.portfolio,
  };
  // TODO dont reinsert all of the transactions
  await dbRunQuery('userData', sellDBHelper, dbParams);

  // TODO error handling for invalid transaction id
  return res.sendStatus(200);
});

module.exports = router;
