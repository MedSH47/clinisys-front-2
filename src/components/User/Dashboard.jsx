import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Navbar, Nav } from 'react-bootstrap';
import { User, Calendar, FileText, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomAlert from '../custom/CustomAlert';

export default function Dashboard() {
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();

   
    const handleCardClick = (path) => {
        navigate(path); 
    };

    // Function to show the alert
    const handleShowAlert = () => setShowAlert(true);

    // Function to close the alert
    const handleCloseAlert = () => setShowAlert(false);

    // Function to logout after alert confirmation
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
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

            <div className="flex-grow-1 bg-light">
                <Navbar bg="light" className="px-4 shadow-sm">
                    <Navbar.Text className="me-auto">
                        Welcome back, <strong>{localStorage.getItem('username')}</strong>
                    </Navbar.Text>
                    <div>
                        {/* Logout button, shows alert first */}
                        <Button variant="outline-danger" size="sm" onClick={handleShowAlert}>Logout</Button>
                        <CustomAlert
                            showAlert={showAlert}
                            handleClose={handleCloseAlert}
                            handleLogout={handleLogout} // pass the logout function to alert component
                        />
                    </div>
                </Navbar>

                {/* Content */}
                <Container className="py-4">
                    <h2 className="mb-4">Dashboard Overview</h2>
                    <div className="container">
      <Row className="g-4">
        <Col md={3}>
          <Card className="text-center shadow" onClick={() => handleCardClick('/patients')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <User size={32} className="text-primary mb-2" />
              <Card.Title>Clients</Card.Title>
              <Card.Text>1,245 registered</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow" onClick={() => handleCardClick('/appointments')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <Calendar size={32} className="text-success mb-2" />
              <Card.Title>Appointments</Card.Title>
              <Card.Text>Today: 38</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow" onClick={() => handleCardClick('/billing')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <DollarSign size={32} className="text-warning mb-2" />
              <Card.Title>Billing</Card.Title>
              <Card.Text>$8,530 this week</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow" onClick={() => handleCardClick('/reports')} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <FileText size={32} className="text-danger mb-2" />
              <Card.Title>Reports</Card.Title>
              <Card.Text>5 new reports</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
                </Container>
            </div>
        </div>
    );
}
