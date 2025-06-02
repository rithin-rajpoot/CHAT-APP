
import "./index.css";
import App from "./App.jsx";
import ReactDom from "react-dom/client";
import { store } from "./store/store.js";
import { Provider } from "react-redux";


ReactDom.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
