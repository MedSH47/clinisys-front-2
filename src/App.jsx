import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/nav/Navbar';
import Login from './components/session/Login';
import Register from './components/session/Register';
import UsersList from './components/Admin_page/UsersList';
import PrivateRoute from './components/error/PrivateRoute';
import CreateUser from './components/Admin_page/CreateUser';
import RequireAdmin from './components/error/RequireAdmin';
import AccessDenied from './components/error/AccessDenied';
import Dashboard from './components/User/Dashboard';
import PublicRoute from './components/error/PublicRoute';
import TicketList from './components/Ticket/TicketList';
import UserDetailPage from './components/Admin_page/UserDetails';
import AdminDashboard from './components/Admin_page/AdminDashboard';
import Test from './components/testing/test';
import EquipeListe from './components/Equipe/EquipeListe';
import Module from './components/Module/Module';
function AppWrapper() {
  const location = useLocation();
  const hideNavbar1 = location.pathname === '/login';
  const hideNavbar2 = location.pathname === '/register';


  return (
    <>
      {!hideNavbar1 && !hideNavbar2 && <Navbar />}
      <div className="container">
        <Routes>
          <Route path="/Dashboard" element={<PublicRoute><Dashboard /></PublicRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/AdminDashboard/users" element={<RequireAdmin><UsersList /></RequireAdmin>} />
          <Route path="/" element={<Login />} />
          <Route path="/AccessDenied" element={<AccessDenied />} />
          <Route path="/users/create" element={<PrivateRoute><CreateUser /></PrivateRoute>} />
          <Route path='/AdminDashboard/ticket' element={<TicketList/>} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path='/AdminDashboard' element={<PrivateRoute><AdminDashboard/></PrivateRoute>}/>
          <Route path='/AdminDashboard/EquipeListe' element={<EquipeListe/>}/>
          <Route path="/AdminDashboard/modules" element={<Module />} />
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
