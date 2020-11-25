import React from 'react';
import PropTypes from 'prop-types';

import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/core/styles';

import TransactionsEntry from './TransactionsEntry';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: '36ch',
    backgroundColor: theme.palette.background.paper,
  },
}));

function TransactionsList({ transactions }) {
  const entries = [];
  transactions.forEach(({ type, ticker, price, shares, id }, index) => {
    let divider;
    if (index !== 0) {
      divider = <Divider variant="inset" component="li" />;
    }

    entries.push(
      <div key={id}>
        {divider}
        <TransactionsEntry type={type} ticker={ticker} price={price} shares={shares} />
      </div>
    );
  });

  const classes = useStyles();
  return <List className={classes.root}>{entries}</List>;
}

TransactionsList.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      ticker: PropTypes.string,
      price: PropTypes.number,
      shares: PropTypes.string,
    })
  ).isRequired,
};

export default TransactionsList;
