import React from "react";

import { createRoot } from "react-dom/client";
import App from "./App";
import { core, initRenderer } from "./lib/webRenderer";

import './index.css'

let ctx: AudioContext | null = null;

const root = createRoot(document.getElementById("root")!);

function StartGate() {
  const [started, setStarted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const start = async () => {
    try {
      if (!ctx) ctx = new AudioContext();
      if (ctx.state === "suspended") await ctx.resume();
      await initRenderer(ctx);
      setStarted(true);
    } catch (e) {
      setError("Failed to start audio. Try again.");
    }
  };

  if (!started) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:12}}>
        <button onClick={start} style={{padding:'12px 20px',fontSize:16,cursor:'pointer'}}>Tap to start audio</button>
        {error ? <div style={{color:'red',fontSize:12}}>{error}</div> : null}
      </div>
    );
  }

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

root.render(<StartGate />);
