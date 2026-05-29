import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./lib/env"; // validate env vars on boot
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
