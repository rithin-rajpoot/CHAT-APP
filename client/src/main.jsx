import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/home/Home.jsx";
import Login from "./pages/authentication/Login.jsx";
import Signup from "./pages/authentication/Signup.jsx";
import { store } from "./store/store.js";
import { Provider } from "react-redux";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Settings from "./pages/home/Settings.jsx";
import Profile from "./pages/home/Profile.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
    <RouterProvider router={router} />
  </Provider>
);
