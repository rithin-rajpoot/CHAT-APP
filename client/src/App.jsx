import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from 'react-redux'
import { getUserProfileThunk, getOtherUsersThunk } from "./store/slice/user/userThunk";

function App() {

  const dispatch = useDispatch();

  useEffect(() =>{
    ( async () =>{
       const r = await dispatch(getUserProfileThunk());
       console.log(r?.payload)
    })()
  }, [])

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
