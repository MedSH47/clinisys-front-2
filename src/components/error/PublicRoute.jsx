import { Navigate, useNavigate } from "react-router-dom";

export default function PublicRoute({children}){
    if (localStorage.getItem('userrole')!="ROLE_User") {
        return <Navigate to={"/AccessDenied"}/>
    }
    return children
}