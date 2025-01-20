import { render } from "preact";
import "./index.css";
import { App } from "./app.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";

render(
  <ThemeProvider defaultTheme="dark" storageKey="theme">
    <App />
  </ThemeProvider>,
  document.getElementById("app")!
);
