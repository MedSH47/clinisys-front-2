import LeftSidebar from '../nav/Leftside';
import { Outlet } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="d-flex">
      <LeftSidebar />

      {/* Main Content Area */}
      <div className="flex-grow-1 ml-250" style={{ marginLeft: '250px' }}>
        <div className="container-fluid">
          
          

          {/* Content */}
          <div className="mt-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
