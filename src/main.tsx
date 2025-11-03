import React from "react";

import { createRoot } from "react-dom/client";
import App from "./App";
import { core, initRenderer } from "./lib/webRenderer";

import './index.css'

let ctx = new AudioContext();
initRenderer(ctx);

const root = createRoot(document.getElementById("root")!);

const RenderApp = () => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

core.on("load", async () => {
  RenderApp();
});
