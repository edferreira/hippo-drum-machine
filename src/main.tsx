import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AudioProvider, useAudio } from "./contexts/AudioContext";
import "./index.css";
import "./StartGate.css";

const root = createRoot(document.getElementById("root")!);

function StartGate() {
  const [started, setStarted] = useState(false);
  const { initialize, error } = useAudio();

  const handleStart = async () => {
    try {
      await initialize();
      setStarted(true);
    } catch (e) {
      // Error is already in context state
      console.error("Failed to start:", e);
    }
  };

  if (!started) {
    return (
      <div className="start-gate">
        <button onClick={handleStart} className="start-button">
          Tap to start audio
        </button>
        {error && <div className="start-error">{error}</div>}
      </div>
    );
  }

  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

root.render(
  <AudioProvider>
    <StartGate />
  </AudioProvider>
);
