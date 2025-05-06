import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function LeftSide() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`bg-dark text-white p-4 ${isCollapsed ? 'w-75' : 'w-250'} transition-all`}
      style={{ height: '100vh', position: 'fixed',left:'0px' }}
    >
      <button
        className="btn btn-link text-white mb-3"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <i className={`bi ${isCollapsed ? 'bi-arrow-right-square' : 'bi-arrow-left-square'}`} />
      </button>
      <h3 className="text-center mb-4">Admin Dashboard</h3>
      <ul className="list-unstyled">
        <li className="nav-item mb-3">
          <Link className="nav-link text-white" to="/AdminDashboard/users">
            <i className="bi bi-person-lines-fill"></i> Users
          </Link>
        </li>
        <li className="nav-item mb-3">
          <Link className="nav-link text-white" to="/AdminDashboard/EquipeListe">
            <i className="bi bi-people-fill"></i> Equipe
          </Link>
        </li>
        <li className="nav-item mb-3">
          <Link className="nav-link text-white" to="/AdminDashboard/modules">
            <i className="bi bi-people-fill"></i> Module
          </Link>
        </li>
        <li className="nav-item mb-3">
          <Link className="nav-link text-white" to="/AdminDashboard/ticket">
            <i className="bi bi-ticket-detailed"></i> Tickets
          </Link>
        </li>
        <li className="nav-item mb-3">
          <Link className="nav-link text-white" to="/AdminDashboard/postes">
            <i className="bi bi-people-fill"></i> Postes
          </Link>
        </li>
        <li className="nav-item mb-3">
          <Link className="nav-link text-white" to="/AdminDashboard/settings">
            <i className="bi bi-gear"></i> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}
