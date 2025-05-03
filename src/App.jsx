import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import UsersList from './components/User/UsersList';
import PrivateRoute from './components/PrivateRoute';
import CreateUser from './components/User/CreateUser';
import RequireAdmin from './components/RequireAdmin';
import AccessDenied from './error/AccessDenied';
import Dashboard from './components/Dashboard';
import PublicRoute from './components/PublicRoute';
import TicketList from './components/Ticket/TicketList';
import UserDetailPage from './components/User/UserDetails';

function AppWrapper() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/Dashboard';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="container">
        <Routes>
          <Route path="/Dashboard" element={<PublicRoute><Dashboard /></PublicRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/users" element={<RequireAdmin><UsersList /></RequireAdmin>} />
          <Route path="/" element={<Login />} />
          <Route path="/AccessDenied" element={<AccessDenied />} />
          <Route path="/users/create" element={<PrivateRoute><CreateUser /></PrivateRoute>} />
          <Route path='/ticket' element={<TicketList/>} />
          <Route path="/users/:id" element={<UserDetailPage />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
