import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
// import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles((theme) => ({
//   root: {
//     width: '100%',
//     maxWidth: '36ch',
//     backgroundColor: theme.palette.background.paper,
//   },
// }));

function TransactionsInput({ handleTickerChange, handleSharesChange, onClick }) {
  // const classes = useStyles();
  return (
    <div>
      <TextField
        onChange={(event) => handleTickerChange(event.target.value)}
        label="Ticker"
        id="transactions-ticker-text-field"
        variant="outlined"
      />
      <TextField
        onChange={(event) => handleSharesChange(event.target.value)}
        id="transactions-shares-text-field"
        label="Shares"
        type="number"
      />
      <Button variant="outlined" onClick={() => onClick()}>
        Execute
      </Button>
    </div>
  );
}

TransactionsInput.propTypes = {
  handleTickerChange: PropTypes.func.isRequired,
  handleSharesChange: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TransactionsInput;
