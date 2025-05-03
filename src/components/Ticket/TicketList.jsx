import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import authService from '../../services/authService';

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [filterPriority, setFilterPriority] = useState('All');

  useEffect(() => {
    authService.getAllTickets().then(setTickets);
  }, []);

  // Dynamically collect all unique priorities from fetched tickets
  const priorities = React.useMemo(() => {
    const setPrior = new Set(tickets.map(t => t.priorite).filter(Boolean));
    return ['All', ...Array.from(setPrior)];
  }, [tickets]);

  // Filter tickets by the selected priority
  const filtered = tickets.filter(t => {
    if (filterPriority === 'All') return true;
    return t.priorite === filterPriority;
  });

  return (
    <div className="container mt-4">
      {/* Dynamic Priority Filter */}
      <Form.Group as={Row} className="mb-3" controlId="priorityFilter">
        <Form.Label column sm="2">Filter by Priority:</Form.Label>
        <Col sm="4">
          <Form.Select 
            value={filterPriority} 
            onChange={e => setFilterPriority(e.target.value)}
          >
            {priorities.map(pr => (
              <option key={pr} value={pr}>{pr}</option>
            ))}
          </Form.Select>
        </Col>
      </Form.Group>

      {/* Cards Grid */}
      <Row className="g-4">
        {filtered.map(t => (
          <Col key={t.id} md={4}>
            <Card className="h-100 shadow-sm hover-shadow">
              <Card.Body className="d-flex flex-column">
                <Card.Title>#{t.numTicket}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{t.status}</Card.Subtitle>
                <Card.Text className="flex-grow-1">
                  <strong>Priority:</strong> {t.priorite}<br/>
                  <strong>Created:</strong> {new Date(t.dateCreation).toLocaleDateString()}<br/>
                  <strong>Assignee:</strong> {t.collaborateur || '—'}
                </Card.Text>
                <Button 
                  variant="primary" 
                  onClick={() => console.log('View details of', t.id)}
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
        {filtered.length === 0 && (
          <Col>
            <p className="text-center">No tickets match this priority.</p>
          </Col>
        )}
      </Row>
    </div>
  );
}
