import React from 'react';

import './App.css';
import TransactionsSection from '../Transactions/TransactionsSection';

// import io from 'socket.io/client-dist/socket.io';
// const socket = io('http://localhost:3001');

//   socket.on('transaction', (transaction) => {
//     const transactionsCopy = _.cloneDeep(transactions);
//     // TODO have a limit on size of list
//     transactionsCopy.push(transaction);
//     updateTransactions(transactionsCopy);
//   });

function App() {
  return (
    <div className="App">
      <TransactionsSection />
    </div>
  );
}

export default App;
