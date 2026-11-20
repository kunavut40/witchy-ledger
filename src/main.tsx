import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/sarabun/thai-400.css";
import "@fontsource/sarabun/thai-500.css";
import "@fontsource/sarabun/thai-600.css";
import "@fontsource/sarabun/latin-400.css";
import "@fontsource/sarabun/latin-600.css";
import App from "./App";
import "./style.css";
import "./fantasy/grand-theme.css";
import "@fontsource/sarabun/thai-700.css";
import "@fontsource/sarabun/latin-700.css";
if (window.WitchyNative) document.documentElement.classList.add("native-app");
function fitViewport() {
  document.documentElement.style.setProperty(
    "--app-height",
    (window.visualViewport?.height || window.innerHeight) + "px",
  );
}
fitViewport();
window.addEventListener("resize", fitViewport);
window.visualViewport?.addEventListener("resize", fitViewport);
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
import "./ui/interaction.css";

import "./ui/overlays.css";
