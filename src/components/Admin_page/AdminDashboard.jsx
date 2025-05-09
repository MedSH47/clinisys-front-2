import { useEffect, useState } from 'react';
import LeftSidebar from '../nav/Leftside';
import { Outlet } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import authService from '../../services/authService';

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(0);
  const [modulesCount, setModulesCount] = useState(0);
  const [equipesCount, setEquipesCount] = useState(0);
  const [ticketStatusCounts, setTicketStatusCounts] = useState({
    REFUSED: 0,
    EN_ATTENTE: 0,
    ACCEPTED: 0
  });

  const [equipesWithoutTickets, setEquipesWithoutTickets] = useState([]);
  const [ticketsPerEquipe, setTicketsPerEquipe] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);

  const fmtDate = v => {
    if (!v) return '—'
    const d = new Date(v)
    return isNaN(d) ? '—' : d.toISOString().split('T')[0]
  }

  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const [users, modules, equipes, tickets] = await Promise.all([
          authService.getUsers(),
          authService.getModules(),
          authService.getEquipes(),
          authService.getAllTickets()
        ]);

        setUsersCount(users.length);
        setModulesCount(modules.length);
        setEquipesCount(equipes.length);

        const statusCount = { REFUSED: 0, EN_ATTENTE: 0, ACCEPTED: 0 };

        // Sort tickets by date for recent ticket list
        const sortedTickets = [...tickets].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
        setRecentTickets(sortedTickets.slice(0, 5));

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

        // Equipes with 0 tickets
        let equipesWithZeroTickets = [];
        equipes.forEach(equipe => {
          if (equipe.ticketList.length === 0) {
            equipesWithZeroTickets.push(equipe.nomEquipe);
          }
        });

        // Count tickets per equipe
        const equipeTicketMap = new Map();
        equipes.forEach(equipe => {
          equipeTicketMap.set(equipe.nomEquipe, 0);
        });
        
        equipes.forEach(element => {
          
          equipeTicketMap.set(element.nomEquipe,element.ticketList.length)
        });
        const equipeStats = Array.from(equipeTicketMap.entries()).map(([name, count]) => ({
          name,
          count
        }));

        setTicketStatusCounts(statusCount);
        setEquipesWithoutTickets(equipesWithZeroTickets);
        setTicketsPerEquipe(equipeStats);
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

          <div className="row mt-4">
            <div className="col-md-6">
              <h5 className="text-center">Ticket per Equipe</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ticketsPerEquipe}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="col-md-6">
              <h5 className="text-center">Equipes without Tickets</h5>
              <ul className="list-group">
                {
                  equipesWithoutTickets.length === 0 ? (
                    <li className="list-group-item">All teams are active 🎉</li>
                  ) : (
                    equipesWithoutTickets.map((equipe, index) => (
                      <li key={index} className="list-group-item">{equipe}</li>
                    ))
                  )
                }
              </ul>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-7">
              <h5 className="text-center">Recent Tickets</h5>
              <ul className="list-group">
                {recentTickets.map((ticket, index) => (
                  <li key={index} className="list-group-item">
                    "{ticket.designation || 'No Title'}" - {ticket.status} - {fmtDate(ticket.dateCreation)} - {ticket.collaborateur ? ticket.collaborateur : "none"}
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-5">
              <h5 className="text-center">Users with Ticket Haute</h5>
              <ul className="list-group">
                {
                  recentTickets
                  
                    .filter(ticket => ticket.priorite === "Haute")
                    .map((ticket, index) => (
                      <li key={index} className="list-group-item">
                        {ticket.collaborateur} – {ticket.designation}
                      </li>
                    ))
                }
                
              </ul>

            </div>
          </div>


          <div className="mt-5">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
