import { Modal, Button } from 'react-bootstrap';
import React from 'react';

function CustomAlert({ showAlert, handleClose, handleLogout }) {
  return (
    <Modal show={showAlert} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Logout</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to log out?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="danger" onClick={() => { handleLogout(); handleClose(); }}>Logout</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CustomAlert;
