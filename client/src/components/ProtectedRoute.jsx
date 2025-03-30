import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const ProtectedRoute = ({children}) => {
    
    const {isAuthenticated, screenLoading} = useSelector(state=>state.userReducer)
    const navigate = useNavigate()
    useEffect(() =>{
        // Check if user is authenticated before rendering children
        if(!isAuthenticated  && !screenLoading){
            navigate('/login')
        }
    },[isAuthenticated, screenLoading]);

  return children // returns home component(refer main.jsx)
}

export default ProtectedRoute
