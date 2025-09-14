
import React, { useEffect, useState } from "react";

// Simple token icons (replace with your own if needed)
const tokenLogos = {
  ETH: "https://w7.pngwing.com/pngs/268/1013/png-transparent-ethereum-eth-hd-logo.png",
  XAN: "https://static.chainbroker.io/mediafiles/projects/anoma/anoma.jpeg",
};

// ✅ Reads from Vercel env variable, falls back to localhost in dev
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

console.log("Frontend using BASE_URL:", BASE_URL);


function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState("alice");
  const [balance, setBalance] = useState(null);
  const [txs, setTxs] = useState([]);
  const [intents, setIntents] = useState([]);
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("ETH");
  const [to, setTo] = useState("bob");

  // Intent state
  const [intentAmount, setIntentAmount] = useState("");
  const [fromAsset, setFromAsset] = useState("ETH");
  const [toAsset, setToAsset] = useState("XAN");

  // Load balances + txs + intents
  function loadData() {
    fetch(`${BASE_URL}/balance?user=${user}`)
      .then((res) => res.json())
      .then((data) => setBalance(data))
      .catch(() => setBalance(null));

    fetch(`${BASE_URL}/txs`)
      .then((res) => res.json())
      .then((data) => setTxs(data))
      .catch(() => setTxs([]));

    fetch(`${BASE_URL}/intents`)
      .then((res) => res.json())
      .then((data) => setIntents(data))
      .catch(() => setIntents([]));
  }

  useEffect(() => {
    loadData();
  }, [user]);

  // Faucet
  function requestFaucet() {
    fetch(`${BASE_URL}/faucet?user=${user}`)
      .then((res) => res.json())
      .then((data) => setBalance(data))
      .catch(() => alert("Faucet failed"));
  }

  // Send transaction
  function sendTx(e) {
    e.preventDefault();
    fetch(`${BASE_URL}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: user, to, token, amount: Number(amount) }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setBalance({ user, balances: data.senderBalance.balances });
        setTxs((prev) => [...prev, data.tx]);
        setAmount("");
      })
      .catch(() => alert("Transaction failed"));
  }

  // Create intent
  function createIntent(e) {
    e.preventDefault();
    fetch(`${BASE_URL}/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maker: user,
        action: "swap",
        amount: Number(intentAmount),
        from_asset: fromAsset,
        to_asset: toAsset,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setIntents((prev) => [...prev, data.intent]);
        setIntentAmount("");
      })
      .catch(() => alert("Creating intent failed"));
  }

  // Copy user address
  function copyAddress() {
    navigator.clipboard.writeText(user);
    alert(`Copied: ${user}`);
  }

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#0f172a",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <header style={{ textAlign: "center", padding: "20px" }}>
        <img src="/logo.png" alt="Wallet Logo" style={{ width: "60px" }} />
        <h1 style={{ margin: "10px 0" }}>Intent Wallet</h1>

        {/* Account info */}
        <div
          style={{
            background: "#1e293b",
            padding: "10px 15px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        >
          <select
            value={user}
            onChange={(e) => setUser(e.target.value)}
            style={{
              background: "transparent",
              color: "white",
              border: "none",
              fontSize: "16px",
            }}
          >
            <option value="alice">Alice</option>
            <option value="bob">Bob</option>
          </select>
          <button
            onClick={copyAddress}
            style={{
              marginLeft: "10px",
              background: "#3b82f6",
              border: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              color: "white",
              fontWeight: "bold",
            }}
          >
            Copy
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-around",
          width: "100%",
          backgroundColor: "#1e293b",
          padding: "10px 0",
        }}
      >
        {["home", "send", "create-intent", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              backgroundColor: activeTab === tab ? "#3b82f6" : "transparent",
              color: "white",
              fontWeight: activeTab === tab ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{ padding: "20px", width: "100%", maxWidth: "420px" }}>
        {/* Home */}
        {activeTab === "home" && (
          <div>
            <h2 style={{ marginBottom: "15px" }}>Balances</h2>
            {balance ? (
              <div style={{ display: "grid", gap: "15px" }}>
                {Object.entries(balance.balances).map(([sym, val]) => (
                  <div
                    key={sym}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#1e293b",
                      padding: "15px",
                      borderRadius: "15px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                    }}
                  >
                    <img
                      src={tokenLogos[sym]}
                      alt={sym}
                      style={{
                        width: "35px",
                        height: "35px",
                        borderRadius: "50%",
                        marginRight: "12px",
                      }}
                    />
                    <div>
                      <p style={{ margin: 0, fontWeight: "bold" }}>{sym}</p>
                      <p style={{ margin: 0, color: "#94a3b8" }}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Loading...</p>
            )}
            <button
              onClick={requestFaucet}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#10b981",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              💧 Deposit Asset
            </button>
          </div>
        )}

        {/* Send */}
        {activeTab === "send" && (
          <div
            style={{
              backgroundColor: "#1e293b",
              padding: "20px",
              borderRadius: "15px",
            }}
          >
            <h2>Send Tokens</h2>
            <form onSubmit={sendTx}>
              <input
                type="text"
                placeholder="Recipient (bob)"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  border: "none",
                }}
              />
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  border: "none",
                }}
              >
                <option value="ETH">ETH</option>
                <option value="XAN">XAN</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  border: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Create Intent */}
        {activeTab === "create-intent" && (
          <div
            style={{
              backgroundColor: "#1e293b",
              padding: "20px",
              borderRadius: "15px",
            }}
          >
            <h2>Create Intent</h2>
            <form onSubmit={createIntent}>
              <input
                type="number"
                placeholder="Amount"
                value={intentAmount}
                onChange={(e) => setIntentAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  border: "none",
                }}
              />
              <select
                value={fromAsset}
                onChange={(e) => setFromAsset(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  border: "none",
                }}
              >
                <option value="ETH">ETH</option>
                <option value="XAN">XAN</option>
              </select>
              <select
                value={toAsset}
                onChange={(e) => setToAsset(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  border: "none",
                }}
              >
                <option value="ETH">ETH</option>
                <option value="XAN">XAN</option>
              </select>
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#f59e0b",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Create Intent
              </button>
            </form>
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div>
            <h2>Transactions & Intents</h2>

            {/* Normal Transactions */}
            <h3 style={{ marginTop: "15px" }}>Sent/Received</h3>
            {txs.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {txs.map((tx, i) => (
                  <li
                    key={`tx-${i}`}
                    style={{
                      backgroundColor: "#1e293b",
                      padding: "12px",
                      borderRadius: "10px",
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      {tx.from} → {tx.to}
                    </span>
                    <span>
                      {tx.amount} {tx.token}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No transactions yet</p>
            )}

            {/* Intent Transactions */}
            <h3 style={{ marginTop: "20px" }}>Intents</h3>
            {intents.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {intents.map((intent, i) => (
                  <li
                    key={`intent-${i}`}
                    style={{
                      backgroundColor: "#1e293b",
                      padding: "12px",
                      borderRadius: "10px",
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderLeft: "4px solid #f59e0b",
                    }}
                  >
                    <span>
                      {intent.maker} wants to swap {intent.amount}{" "}
                      {intent.from_asset} → {intent.to_asset}
                    </span>
                    <span style={{ color: "#f59e0b", fontWeight: "bold" }}>
                      INTENT
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No intents yet</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
