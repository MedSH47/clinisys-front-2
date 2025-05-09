import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import { User, Calendar, FileText, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomAlert from '../custom/CustomAlert';
import authService from '../../services/authService';
import MyTicket from './Ticket/MyTicket';

export default function Dashboard() {
  const [showAlert, setShowAlert] = useState(false);
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [modules, setModules] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Fetch all data on mount
  useEffect(() => {
    (async () => {
      try {
        const [t, c, e, m, u] = await Promise.all([
          authService.getAllTickets(),
          authService.getClient(),
          authService.getEquipes(),
          authService.getModules(),
          authService.getUsers(),
        ]);
        setTickets(t);
        setClients(c);
        setEquipes(e);
        setModules(m);
        setUsers(u);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    })();
  }, []);

  const username = localStorage.getItem('username');
  const mytickets = tickets.filter(t => t.collaborateur === username);

  const handleShowAlert = () => setShowAlert(true);
  const handleCloseAlert = () => setShowAlert(false);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <div className="bg-dark text-white p-3" style={{ width: '250px', marginLeft: -100 }}>
        <h4 className="mb-4">CLINISYS</h4>
        <Nav className="flex-column">
          <Nav.Link href="/dashboard" className="text-white">Dashboard</Nav.Link>
          <Nav.Link href="/ticket" className="text-white">Tickets</Nav.Link>
          <Nav.Link href="/appointments" className="text-white">Appointments</Nav.Link>
          <Nav.Link href="/billing" className="text-white">Billing</Nav.Link>
          <Nav.Link href="/reports" className="text-white">Reports</Nav.Link>
        </Nav>
      </div>

      {/* Main area */}
      <div className="flex-grow-1 bg-light">
        <Navbar bg="light" className="px-4 shadow-sm">
          <Navbar.Text className="me-auto">
            Welcome back, <strong>{username}</strong>
          </Navbar.Text>
          <Button variant="outline-danger" size="sm" onClick={handleShowAlert}>
            Logout
          </Button>
          <CustomAlert
            showAlert={showAlert}
            handleClose={handleCloseAlert}
            handleLogout={handleLogout}
          />
        </Navbar>

        <Container className="py-4">
          <h2 className="mb-4">Dashboard Overview</h2>
          <Row className="g-4">
            <Col md={3}>
              <Card
                className="text-center shadow"
                onClick={() => navigate('/patients')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  <User size={32} className="text-primary mb-2" />
                  <Card.Title>Clients</Card.Title>
                  <Card.Text>{clients.length} registered</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            {/* <-- This card now toggles MyTicket display --> */}
            <Col md={3}>
              <Card
                className="text-center shadow"
                onClick={() => setShowMyTickets(!showMyTickets)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  <Calendar size={32} className="text-success mb-2" />
                  <Card.Title>My tickets</Card.Title>
                  <Card.Text>Today: {mytickets.length}</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card
                className="text-center shadow"
                onClick={() => navigate('/billing')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  <DollarSign size={32} className="text-warning mb-2" />
                  <Card.Title>Billing</Card.Title>
                  <Card.Text>$8,530 this week</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card
                className="text-center shadow"
                onClick={() => navigate('/reports')}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  <FileText size={32} className="text-danger mb-2" />
                  <Card.Title>Reports</Card.Title>
                  <Card.Text>5 new reports</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Conditionally render MyTicket below the cards */}
          {showMyTickets && (
            <div className="mt-4">
              <MyTicket tickets={mytickets} />
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}
