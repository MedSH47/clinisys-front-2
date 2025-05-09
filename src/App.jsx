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
import Poste from './components/Poste/Poste'
import Settings from './components/Admin_page/Settings';
function AppWrapper() {
  const location = useLocation();
  
  


  return (
    <>
      {localStorage.getItem("token")?<Navbar />:null}
      <div className="container">
        <Routes>
          <Route path="/Dashboard" element={<PublicRoute><Dashboard /></PublicRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/AdminDashboard/users" element={<UsersList />} />
          <Route path="/" element={<Login />} />
          <Route path="/AccessDenied" element={<AccessDenied />} />
          <Route path="/users/create" element={<PrivateRoute><CreateUser /></PrivateRoute>} />
          <Route path='/AdminDashboard/ticket' element={<TicketList/>} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path='/AdminDashboard' element={<PrivateRoute><AdminDashboard/></PrivateRoute>}/>
          <Route path='/AdminDashboard/EquipeListe' element={<PrivateRoute><EquipeListe/></PrivateRoute>}/>
          <Route path="/AdminDashboard/modules" element={<PrivateRoute><Module /></PrivateRoute>} />
          <Route path='/AdminDashboard/postes' element={<PrivateRoute><Poste/></PrivateRoute>} />
          <Route path='/AdminDashboard/settings' element={<PrivateRoute><Settings /></PrivateRoute>} />
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
