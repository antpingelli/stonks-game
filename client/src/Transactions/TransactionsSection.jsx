/* eslint-disable */
import React from 'react';
import _ from 'lodash';
import axios from 'axios';

// import { makeStyles } from '@material-ui/core/styles';

import TransactionsInput from './TransactionsInput';
import TransactionsList from './TransactionsList';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     width: '100%',
//     maxWidth: '36ch',
//     backgroundColor: theme.palette.background.paper,
//   },
// }));

class TransactionsSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      ticker: '',
      shares: '',
      type: 'Buy',
      remainingCash: 10000,
      isLoading: false,
      hasError: false,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  handleClick() {
    // TODO check for error
    this.setState({ 
      isLoading: true,
      hasError: false,
    });
    const { transactions, ticker, shares, type } = this.state;
    const data = {
      ticker,
      numberOfSharesToPurchase: shares,
      username: 'anthony',
      password: 'password',
      sid: '0d295961-5a95-406f-9444-b103164a4883',
    };
    axios
      .post('http://localhost:3000/transaction/buy', data)
      .then((response) => {
        const transactionsCopy = _.cloneDeep(transactions);
        transactionsCopy.push({
          ticker,
          shares,
          type,
          price: response.data.price,
          id: response.data.transactionId,
        });
        this.setState({
          transactions: transactionsCopy,
          remainingCash: response.data.remainingCash,
        });
      })
      .catch((error) => {
        console.log(`ERROR: Could not complete transaction`);
        console.log(error);
        this.setState({ hasError: true });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }

  handleTickerChange(ticker) {
    this.setState({ ticker });
  };

  handleSharesChange(shares) {
    this.setState({ shares });
  };

  // const classes = useStyles();
  render() {
    const { transactions } = this.state;
    return (
      <div>
        <h3>Available Cash: {this.state.remainingCash}</h3>
        <TransactionsList transactions={transactions} />
        <TransactionsInput handleTickerChange={(value) => this.handleTickerChange(value)} handleSharesChange={(value) => this.handleSharesChange(value)} onClick={() => this.handleClick()} />
      </div>
    );
  }
}

export default TransactionsSection;
