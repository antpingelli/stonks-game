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

function PortfolioList({ portfolio }) {
  const entries = [];
  portfolio.forEach(({ portfolioOfTicker }, index) => {
    let divider;
    if (index !== 0) {
      divider = <Divider variant="inset" component="li" />;
    }

    entries.push(
      <div key={portfolioOfTicker.ticker}>
        {divider}
        <PortfolioEntry portfolioOfTicker={portfolioOfTicker} />
      </div>
    );
  });

  const classes = useStyles();
  return <List className={classes.root}>{entries}</List>;
}

PortfolioList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  portfolio: PropTypes.object.isRequired,
};

export default PortfolioList;
