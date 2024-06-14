import React, { useState, useEffect } from "react";
import Web3 from "web3";
import TokenTransferContract from "./contracts/TokenTransfer.json";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [connectedAccount, setConnectedAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [transactionError, setTransactionError] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      if (web3 && connectedAccount) {
        const ethBalance = await web3.eth.getBalance(connectedAccount);
        setBalance(web3.utils.fromWei(ethBalance, "ether"));
      }
    };

    fetchBalance();
  }, [web3, connectedAccount]);

  useEffect(() => {
    const checkBlockchainConnection = async () => {
      try {
        const storedAccount = localStorage.getItem("connectedAccount");
        if (storedAccount) {
          setConnectedAccount(storedAccount);
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = TokenTransferContract.networks[networkId];
          const instance = new web3Instance.eth.Contract(
            TokenTransferContract.abi,
            deployedNetwork && deployedNetwork.address
          );
          setContract(instance);
        }
      } catch (error) {
        console.error("Error checking blockchain connection:", error);
      }
    };

    checkBlockchainConnection();
  }, []);

  const connectToBlockchain = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable();
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        const account = accounts[0];
        setConnectedAccount(account);
        localStorage.setItem("connectedAccount", account);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = TokenTransferContract.networks[networkId];
        const instance = new web3Instance.eth.Contract(
          TokenTransferContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(instance);
        setMessage("");
      } else {
        setMessage("Please install MetaMask to use this dApp");
      }
    } catch (error) {
      console.error("Error connecting to blockchain", error);
      setMessage("Error connecting to blockchain");
    }
  };

  const disconnectFromBlockchain = () => {
    localStorage.removeItem("connectedAccount");
    window.location.reload();
  };

  const sendTransaction = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.sendETH(recipient).send({
        from: accounts[0],
        value: web3.utils.toWei(amount.toString(), "ether"),
      });
      setMessage("Transaction sent successfully");
      setTransactionError("");
    } catch (error) {
      console.error("Error sending transaction", error);
      setMessage("");
      setTransactionError(error.message || error);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="max-w-lg p-8 bg-white rounded-lg shadow-lg mt-7">
        <h1 className="text-blue-700 text-3xl mb-4 font-bold">Token Transfer</h1>
        {!web3 && (
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={connectToBlockchain}>Connect to Blockchain</button>
        )}
        {web3 && (
          <div className="mt-4">
            {connectedAccount && (
              <div className="mb-2">
                <p className="text-base">
                  <span className="text-red-600">Connected Account : </span>
                  <span className="font-semibold">{connectedAccount}</span>
                </p>
                <p className="text-base">
                  <span className="text-red-600">Balance : </span>
                  <span className="font-semibold">{balance}</span>
                </p>
              </div>
            )}
            <input type="text" placeholder="Recipient Address" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full mb-2 p-2 border border-gray-300 rounded" />
            <br />
            <input type="number" placeholder="Amount (ETH)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full mb-2 p-2 border border-gray-300 rounded" />
            <br />
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" onClick={sendTransaction}>Send Transaction</button>
            <br />
            {message && <p className="mt-2 text-green-600">{message}</p>}
            {transactionError && <p className="mt-2 text-red-600">Error: {transactionError}</p>}
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-4" onClick={disconnectFromBlockchain}>Disconnect</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;