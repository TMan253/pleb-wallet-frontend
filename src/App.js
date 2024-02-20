// https://tinyurl.com/pleb-wallet-react

import React, { useEffect, useState } from "react";
import axios from "axios";
//import {config} from 'dotenv';
import Transactions from "./components/Transactions";
import Buttons from "./components/Buttons";
import Chart from "./components/Chart";
import "./App.css";

//// Source the .env file
//config();

function App() {
  const apiKey = process.env.REACT_APP_API_KEY;
  const [price, setPrice] = useState(null);
  const [balance, setBalance] = useState(0.0);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState(null);

  const getPrice = () => {
    // Axios is a library that makes it easy to make http requests
    // After we make a request, we can use the .then() method to handle the response asynchronously
    // This is an alternative to using async/await
    axios
      .get("https://api.coinbase.com/v2/prices/BTC-USD/spot")
      // .then is a promise that will run when the API call is successful
      .then((res) => {
        // Force price to only two decimal places.
        const formattedPrice = Number(res.data.data.amount).toFixed(2);
        setPrice(formattedPrice);
        updateChartData(formattedPrice);
      })
      // .catch is a promise that will run if the API call fails
      .catch((err) => {
        console.log(err);
      });
  };

  const getWalletBalance = () => {
    const headers = {
      "X-Api-Key": apiKey,
    };
    axios
      .get("https://legend.lnbits.com/api/v1/wallet", { headers })
      .then((res) => {
        // Divide the balance by 1000 since it is denominated in millisats.
        setBalance(res.data.balance / 1000);
      })
      .catch((err) => console.log(err));
  };

  const getTransactions = () => {
    const headers = {
      "X-Api-Key": apiKey,
    };
    axios
      .get("https://legend.lnbits.com/api/v1/payments", { headers })
      .then((res) => {
        setTransactions(res.data);
      })
      .catch((err) => console.log(err));
  };

  const updateChartData = (currentPrice) => {
    const timestamp = Date.now();
    // We are able to grab the previous state to look at it and do logic before adding new data to it
    setChartData((prevState) => {
      // If we have no previous state, create a new array with the new price data
      if (!prevState)
        return [
          {
            x: timestamp,
            y: Number(currentPrice),
          },
        ];
      // If the timestamp or price has not changed, we don't want to add a new point
      if (
        prevState[prevState.length - 1].x === timestamp ||
        prevState[prevState.length - 1].y === Number(currentPrice)
      )
        return prevState;
      // If we have previous state than keep it and add the new price data to the end of the array
      return [
        // Here we use the "spread operator" to copy the previous state
        ...prevState,
        {
          x: timestamp,
          y: Number(currentPrice),
        },
      ];
    });
  };

  // useEffect is a 'hook' or special function that will run code based on a trigger
  // The brackets hold the trigger that determines when the code inside of useEffect will run
  // Since it is empty [] that means this code will run once on page load
  useEffect(() => {
    getPrice();
    getWalletBalance();
    getTransactions();
  }, []);

  useEffect(() => {
    // setInterval will run whatever is in the callback function every 5 seconds
    const interval = setInterval(() => {
      getPrice();
      getWalletBalance();
      getTransactions();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header>
        <h1>Pleb wallet</h1>
      </header>
      <Buttons />
      <div className="row">
        <div className="balance-card">
          <h2>Balance</h2>
          {/* <p><img src="Satoshi-symbol-small.png"
                  height="40" width="22"
                  alt="Satoshi unit symbol" />{balance} sats</p> */}
          <p>{balance} sats</p>
        </div>
        <div className="balance-card">
          <h2>Price</h2>
          <p>${price}</p>
        </div>
      </div>
      <div className="row">
        <div className="row-item">
          <Transactions transactions={transactions} />
        </div>
        <div className="row-item">
          <Chart chartData={chartData} />
        </div>
      </div>
      <footer>
        <p>Made by plebs, for plebs.</p>
      </footer>
    </div>
  );
}

export default App;
