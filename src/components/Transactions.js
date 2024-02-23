import React from "react";
import "./Transactions.css";

// This component renders a list of transaction objects.
const Transactions = ({ transactions }) => {
  // ToDo: Improve tx parsing to display internal payments, incomplete payments, and further verify the transactions we are listing out
  console.log(transactions)

  // Helper function takes a timestamp and formats it to a human-readable date-time string.
  const formatDate = (timestamp) => {
    // Turn unix timestamp into a date.
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Helper function formats a transaction's value as a string.
  // If the transaction is a send, it prepends a '-'; else, a '+'.
  const formatValue = (value, send) => {
    return `${send ? "-" : "+"}${value} sats`;
  };

  // Helper function creates a descriptive string for the transaction.
  // If the transaction is not settled, it returns 'Unpaid invoice'.
  // Otherwise, it uses parts of the payment request to describe the transaction.
  const formatDescription = (tx) => {
    let description;
    if (tx.settled === false) {
      description = "Unpaid invoice";
    } else {
      description = `${
        tx.send === 0 ? "Received from" : "Sent to"
      } ${
        tx.payment_request.substring(0, 25)
      }...`;
    }
    return description;
  };

  // This creates a new, sorted array of transactions, ordered from newest to oldest.
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // The returned JSX displays a list of sorted transactions.
  // Each transaction includes a description, value, and date.
  return (
    <div className="transactions">
      <h3>Transactions</h3>
      {sortedTransactions.map((transaction) => (
        <div
          key={transaction.id}
          className={`tx-item ${transaction.settled === 0 ? "unsettled" : ""}`}>
            <p>{formatDescription(transaction)}</p>
            <p>{formatValue(transaction.value, transaction.send)}</p>
            <p className="transaction-date">{formatDate(transaction.created_at)}</p>
        </div>
      ))}
    </div>
  );
};

export default Transactions;
