import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserProfileThunk,
} from "./store/slice/user/userThunk";

function App() {
  const dispatch = useDispatch();
  const { currTheme } = useSelector((state) => state.themeReducer);

  useEffect(() => {
    (async () => {
      await dispatch(getUserProfileThunk());
    })();
  }, []);

  
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currTheme); 
  }, []);

  return (
    <div>
      <Toaster className="bg-primary" position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;
