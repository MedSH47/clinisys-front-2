// src/components/AccessDenied.jsx
import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AccessDenied = () => {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.clear(); 
  }, []);

  return (
    <div 
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}
    >
      <Card
        border="danger"
        className="text-center p-4"
        style={{ maxWidth: '400px', width: '100%' }}
      >
        <Card.Body>
          <div className="mb-3">
            <i className="bi bi-slash-circle" style={{ fontSize: '4rem', color: '#dc3545' }} />
          </div>
          <Card.Title className="h4 text-danger">Access Denied</Card.Title>
          <Card.Text className="mb-4">
            You don’t have permission to view this page.
          </Card.Text>
          <Button variant="danger" onClick={() => navigate('/')}>
            Go back
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AccessDenied;
