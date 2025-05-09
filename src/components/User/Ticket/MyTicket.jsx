import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, Alert, Button } from 'react-bootstrap';

export default function MyTicket({ tickets }) {
  const [ticketList, setTicketList] = useState(tickets || []);

  const handleAccept = (index) => {
    const updatedTickets = [...ticketList];
    updatedTickets[index].status = 'Accepte';
    setTicketList(updatedTickets);
  };

  if (!ticketList || ticketList.length === 0) {
    return <Alert variant="info">You have no tickets right now.</Alert>;
  }

  return (
    <div>
      <h3 className="mb-3">My Tickets</h3>
      <Row className="g-2">
        {ticketList.map((ticket, idx) => (
          <Col md={2} lg={2} key={ticket.id ?? idx}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>#{ticket.numTicket}</Card.Title>
                <Card.Text><strong>Designation:</strong> {ticket.designation}</Card.Text>
                <Card.Text><strong>Status:</strong> {ticket.status}</Card.Text>
                <Card.Text><strong>Priorité:</strong> {ticket.priorite}</Card.Text>
                {ticket.status !== 'Accepte' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAccept(idx)}
                  >
                    Accepter
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

MyTicket.propTypes = {
  tickets: PropTypes.arrayOf(
    PropTypes.shape({
      id:         PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      numTicket:  PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      status:     PropTypes.string.isRequired,
      priorite:   PropTypes.string.isRequired,
      designation: PropTypes.string, // added if you use it
    })
  ),
};
