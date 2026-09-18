import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("wp-exam-app") || document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
