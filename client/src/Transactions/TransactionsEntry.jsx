// import React, { useState } from 'react';
import React from 'react';
import PropTypes from 'prop-types';
// import _ from 'lodash';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
// import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     width: '100%',
//     maxWidth: '36ch',
//     backgroundColor: theme.palette.background.paper,
//   },
// }));

function TransactionsEntry({ type, ticker, price, shares }) {
  // const classes = useStyles();
  return (
    <ListItem>
      <ListItemText primary={`${type} ${ticker}`} secondary={`${shares} share${shares > 1 ? 's' : ''} @ $${price}`} />
    </ListItem>
  );
}

TransactionsEntry.propTypes = {
  type: PropTypes.string.isRequired,
  ticker: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  shares: PropTypes.string.isRequired,
};

export default TransactionsEntry;
