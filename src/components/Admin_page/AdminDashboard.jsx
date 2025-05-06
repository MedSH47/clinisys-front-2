import { useEffect, useState } from 'react';
import LeftSidebar from '../nav/Leftside';
import { Outlet } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import authService from '../../services/authService'; // adjust path if needed

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(0);
  const [modulesCount, setModulesCount] = useState(0);
  const [equipesCount, setEquipesCount] = useState(0);
  const [ticketStatusCounts, setTicketStatusCounts] = useState({
    REFUSED: 0,
    EN_ATTENTE: 0,
    ACCEPTED: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await authService.getUsers();
        const modules = await authService.getModules();
        const equipes = await authService.getEquipes();
        const tickets = await authService.getAllTickets();

        // Count ticket statuses based on backend enum values
        const statusCount = { REFUSED: 0, EN_ATTENTE: 0, ACCEPTED: 0 };
        tickets.forEach(ticket => {
          switch (ticket.status) {
            case 'Refuse':
              statusCount.REFUSED++;
              break;
            case 'En_Attende':
              statusCount.EN_ATTENTE++;
              break;
            case 'Accepte':
              statusCount.ACCEPTED++;
              break;
            default:
              console.warn('Unexpected status:', ticket.status);
          }
        });

        setUsersCount(users.length);
        setModulesCount(modules.length);
        setEquipesCount(equipes.length);
        setTicketStatusCounts(statusCount);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, []);

  const statsData = [
    { name: 'Users', count: usersCount },
    { name: 'Modules', count: modulesCount },
    { name: 'Equipes', count: equipesCount },
    {
      name: 'Tickets',
      count:
        ticketStatusCounts.REFUSED +
        ticketStatusCounts.EN_ATTENTE +
        ticketStatusCounts.ACCEPTED
    }
  ];

  const ticketStatusData = [
    { name: 'Refuse', value: ticketStatusCounts.REFUSED },
    { name: 'En Attente', value: ticketStatusCounts.EN_ATTENTE },
    { name: 'Accepte', value: ticketStatusCounts.ACCEPTED }
  ];

  const COLORS = ['#FF4C4C', '#FFD93D', '#4CAF50'];

  return (
    <div className="d-flex">
      <LeftSidebar />

      {/* Main Content Area */}
      <div className="flex-grow-1 ml-250" style={{ marginLeft: '250px' }}>
        <div className="container-fluid">
          <h2 className="mt-4">Welcome to Admin Dashboard</h2>

          <div className="row mt-4">
            <div className="col-md-6">
              <h5 className="text-center">Global Stats</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="col-md-6">
              <h5 className="text-center">Ticket Status</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ticketStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {ticketStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Routed content */}
          <div className="mt-5">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
