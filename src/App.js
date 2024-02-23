import React, { useEffect, useState } from "react";
import axios from "axios";
//import {config} from 'dotenv';
import { axiosWithAuth } from "./utils/axiosWithAuth";
import Header from "./components/Header";
import Transactions from "./components/Transactions";
import Buttons from "./components/Buttons";
import Chart from "./components/Chart";
import "./App.css";

//// Source the .env file
//config();

function App() {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [price, setPrice] = useState(null);
  const [balance, setBalance] = useState(0.0);
  const [user, setUser] = useState(null);
  const [channelBalance, setChannelBalance] = useState(0.0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    // If user is logged in, get user info
    if (token) {
      axiosWithAuth()
        .get(`${backendUrl}/users/user`)
        .then((res) => {
          setIsLoggedIn(true);
          setUser(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

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
    axios
      .get(`${backendUrl}/lightning/balance`)
      .then((res) => {
        setBalance(res.data.total_balance);
      })
      .catch((err) => console.log(err));
  };

  const getChannelBalance = () => {
    axios
      .get(`${backendUrl}/lightning/channelbalance`)
      .then((res) => {
        setChannelBalance(res.data.balance);
      })
      .catch((err) => console.log(err));
  };

  const getTransactions = () => {
    axios
      .get(`${backendUrl}/lightning/invoices`)
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
    getChannelBalance();
    getTransactions();
  }, []);

  useEffect(() => {
    // setInterval will run whatever is in the callback function every 5 seconds
    const interval = setInterval(() => {
      getChannelBalance();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getPrice();
      getWalletBalance();
      getTransactions();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Header isLoggedIn={isLoggedIn} user={user} />
      <Buttons isLoggedIn={isLoggedIn} user={user} />
      <div className="row">
        <div className="balance-card">
          <h2>Balances</h2>
          <p>On-chain balance:&nbsp; <img src="Satoshi-symbol-small.png"
                  height={16} width={9} style={{maxWidth:"9px"}}
                  alt="Satoshi unit symbol" /> {balance}</p>
          <p>Channel balance:&nbsp; <img src="Satoshi-symbol-small.png"
                  height={16} width={9} style={{maxWidth:"9px"}}
                  alt="Satoshi unit symbol" /> {channelBalance}</p>
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
