import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { getUserProfileThunk } from "./store/slice/user/userThunk";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader } from "lucide-react";
import Navbar from "./components/Navbar";

// Lazy load components
const Login = lazy(() => import("./pages/authentication/Login"));
const Signup = lazy(() => import("./pages/authentication/Signup"));
const Profile = lazy(() => import("./pages/home/Profile"));
const Settings = lazy(() => import("./pages/home/Settings"));
const Home = lazy(() => import("./pages/home/Home"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

// Loading component for fallback
const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-screen">
    <Loader className="size-10 animate-spin text-black dark:text-white" />
    <p>Loading...</p>
  </div>
);

const App = () => {
  const dispatch = useDispatch();
  const { currTheme } = useSelector((state) => state.themeReducer);
  const { screenLoading, isAuthenticated } = useSelector(
    (state) => state.userReducer
  );

  useEffect(() => {
    // Only try to get user profile if we're not already authenticated
    // This prevents auto-login after logout
    if (!isAuthenticated) {
      (async () => {
        await dispatch(getUserProfileThunk());
      })();
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currTheme);
  }, [currTheme]);

  if (screenLoading && !isAuthenticated) return <LoadingSpinner />;

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <div className="min-h-screen bg-base-100">
          <Navbar />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route
              path="/"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                </Suspense>
              }
            />
            <Route
              path="/login"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/signup"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Signup />
                </Suspense>
              }
            />
            <Route
              path="/profile"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Profile />
                </Suspense>
              }
            />
            <Route
              path="/settings"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Settings />
                </Suspense>
              }
            />
          </Routes>
        </Suspense>
        </div>
      </BrowserRouter>
    </>
  );
};

export default App;
