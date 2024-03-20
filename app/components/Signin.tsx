import React, { useState, useEffect } from "react";
import WaitingList from "./WaitingList";

const WalletSignIn = () => {
  const [user, setUser] = useState("");

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

  if (!user) {
    return <div>Please sign in using your Ethereum wallet.</div>;
  }

  return (
    <div>
      <WaitingList />
    </div>
  );
};

export default WalletSignIn;
