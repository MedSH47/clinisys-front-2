import { Navigate } from 'react-router-dom'
import AccessDenied from './AccessDenied';

export default function PrivateRoute({ children }) {
  const role = localStorage.getItem('userrole');

  if (role === 'ROLE_Admin') {
    return children;
  } else {
    localStorage.clear();
    return <AccessDenied/>
  }
}
