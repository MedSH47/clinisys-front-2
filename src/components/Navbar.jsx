import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username')
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">JWT Auth</Link>
        <div className="navbar-nav">
          {token ? (
            <>
              <Link className="nav-link" to="/users">Users</Link>
              <button className="nav-link btn btn-link" onClick={handleLogout}>Logout</button>
              <Link className="nav-link" to="/users/create">Create User</Link>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="nav-link" to="/register">Register</Link>
              
            </>
          )}
        </div>
      </div>
    </nav>
  );
}