import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import WaitingList from "./WaitingList";

const WalletSignIn = () => {
  const [user, setUser] = useState("");
  const [binanceKey, setBinanceKey] = useState("");
  const [krakenKey, setKrakenKey] = useState("");

  // Detect Rainbow Wallet Ethereum provider
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts: string[]) => {
          // Assuming the first account is the user's account
          setUser(accounts[0]);
        })
        .catch((err: any) => {
          console.error(err);
          alert("Please sign in using Rainbow Wallet");
        });
    } else {
      alert("Please install Rainbow Wallet");
    }
  }, []);

  const encryptAndSaveKeys = () => {
    const encryptedBinanceKey = CryptoJS.AES.encrypt(
      binanceKey,
      "secret key phrase"
    ).toString();
    const encryptedKrakenKey = CryptoJS.AES.encrypt(
      krakenKey,
      "secret key phrase"
    ).toString();

    const keysObject = {
      Binance: encryptedBinanceKey,
      Kraken: encryptedKrakenKey,
    };

    localStorage.setItem("apiKeys", JSON.stringify(keysObject));
    alert("Keys saved successfully!");
  };

  if (!user) {
    return <div>Please sign in using your Ethereum wallet.</div>;
  }

  const handleFormSubmit = (event: any) => {
    event.preventDefault();
    encryptAndSaveKeys();
  };

  return (
    <div>
      <WaitingList />
    </div>
  );
};

export default WalletSignIn;
