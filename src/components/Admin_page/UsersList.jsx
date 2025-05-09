// src/components/User/UsersTable.jsx
import React, { useState, useEffect, useMemo } from 'react'
import {
  Table,
  Button,
  Form,
  Spinner,
  Alert,
  Modal,
  Row,
  Col,
} from 'react-bootstrap'
import Leftside from '../nav/Leftside'
import authService from '../../services/authService'

export default function UsersTable() {
  // Data
  const [users, setUsers] = useState([])
  const [tickets, setTickets] = useState([])
  const [equipes, setEquipes] = useState([])

  // Loading / error
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters & search
  const [searchTerm, setSearchTerm] = useState('')
  const [withTicketsOnly, setWithTicketsOnly] = useState(false)
  const [selectedEquipe, setSelectedEquipe] = useState('All')

  // Tickets modal
  const [showTicketsModal, setShowTicketsModal] = useState(false)
  const [modalTickets, setModalTickets] = useState([])
  const [modalUser, setModalUser] = useState(null)

  // User add/edit modal
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({
    login: '',
    role: 'User',
    actif: false,
    idEquip: '',
  })
  const [savingUser, setSavingUser] = useState(false)

  // Load initial data
  useEffect(() => {
    ;(async () => {
      try {
        const [uData, tData, eData] = await Promise.all([
          authService.getUsers(),
          authService.getAllTickets(),
          authService.getEquipes(),
        ])
        setUsers(uData)
        setTickets(tData)
        setEquipes(eData)
      } catch (err) {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Helpers
  const usersWithTickets = useMemo(() => {
    const s = new Set()
    tickets.forEach(t => {
      if (t.collaborateur?.id) s.add(t.collaborateur.id)
    })
    return s
  }, [tickets])

  const displayedUsers = useMemo(() => {
    return users.filter(u => {
      if (
        searchTerm &&
        !u.login.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false
      if (withTicketsOnly && !usersWithTickets.has(u.id)) return false
      if (
        selectedEquipe !== 'All' &&
        u.idEquip?.id.toString() !== selectedEquipe
      )
        return false
      return true
    })
  }, [users, searchTerm, withTicketsOnly, selectedEquipe, usersWithTickets])

  const fmtDate = ts =>
    ts ? new Date(ts).toLocaleDateString() : '—'

  // Open tickets modal
  const handleCountClick = user => {
    const ut = tickets.filter(t => t.collaborateur?.id === user.id)
    setModalUser(user)
    setModalTickets(ut)
    setShowTicketsModal(true)
  }

  // Open add/edit user modal
  const openUserModal = user => {
    if (user) {
      setEditingUser(user)
      setUserForm({
        login: user.login,
        role: user.role,
        actif: user.actif,
        idEquip: user.idEquip?.id || '',
      })
    } else {
      setEditingUser(null)
      setUserForm({ login: '', role: 'User', actif: false, idEquip: '' })
    }
    setShowUserModal(true)
  }
  const closeUserModal = () => setShowUserModal(false)

  // Save user (create or update)
  const handleUserSubmit = async e => {
    e.preventDefault()
    setSavingUser(true)
    try {
      const payload = {
        login: userForm.login,
        role: userForm.role,
        actif: userForm.actif,
        idEquip: userForm.idEquip ? { id: +userForm.idEquip } : null,
      }
      let res
      if (editingUser) {
        res = await authService.updateUser(editingUser.id, payload)
        setUsers(us => us.map(u => (u.id === res.id ? res : u)))
      } else {
        res = await authService.createUser(payload)
        setUsers(us => [res, ...us])
      }
      closeUserModal()
    } catch {
      alert('Save user failed')
    } finally {
      setSavingUser(false)
    }
  }

  // Delete user
  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return
    try {
      await authService.deleteUser(id)
      setUsers(us => us.filter(u => u.id !== id))
    } catch {
      alert('Delete failed')
    }
  }

  if (loading)
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    )
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <>
      <div style={{ display: 'flex' }}>
        <Leftside />
        <div className="container mt-5" style={{ marginLeft: 250, width: '100%' }}>
          <h2 className="mb-4">User Management</h2>

          {/* Controls */}
          <div className="d-flex align-items-center mb-3">
            <Form.Control
              type="text"
              placeholder="Search by login..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ maxWidth: 200 }}
              className="me-3"
            />
            <Button
              variant={withTicketsOnly ? 'primary' : 'outline-primary'}
              className="me-3"
              onClick={() => setWithTicketsOnly(w => !w)}
            >
              {withTicketsOnly ? 'Only With Tickets' : 'Show With Tickets'}
            </Button>
            <Form.Select
              style={{ maxWidth: 200 }}
              value={selectedEquipe}
              onChange={e => setSelectedEquipe(e.target.value)}
              className="me-3"
            >
              <option value="All">All Équipes</option>
              {equipes.map(eq => (
                <option key={eq.id} value={eq.id}>
                  {eq.nomEquipe}
                </option>
              ))}
            </Form.Select>
            <Button variant="success" onClick={() => openUserModal(null)}>
              + Add User
            </Button>
          </div>

          {/* Table */}
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Login</th>
                <th>Role</th>
                <th>Active</th>
                <th>Équipe</th>
                <th>Tickets</th>
                <th>Created On</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map(u => {
                const count = tickets.filter(t => t.collaborateur?.id === u.id).length
                return (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.login}</td>
                    <td>{u.role}</td>
                    <td>{u.actif ? 'Yes' : 'No'}</td>
                    <td>{u.idEquip?.nomEquipe || '—'}</td>
                    <td>
                      <Button variant="link" size="sm" onClick={() => handleCountClick(u)}>
                        {count}
                      </Button>
                    </td>
                    <td>{fmtDate(u.creationDate)}</td>
                    <td>{u.creationUser || '—'}</td>
                    <td>
                      <Button size="sm" className="me-2" onClick={() => openUserModal(u)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(u.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Tickets Modal */}
      <Modal
        show={showTicketsModal}
        onHide={() => setShowTicketsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Tickets for {modalUser?.login}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalTickets.length === 0 ? (
            <Alert variant="info">No tickets assigned.</Alert>
          ) : (
            
            <Table striped bordered hover responsive>
              
              <thead>
                <tr>
                  <th>ID</th><th>#</th><th>Designation</th><th>Status</th>
                  <th>Priorité</th><th>Due</th><th>Created</th><th>By</th>
                  <th>Client</th><th>Équipe</th><th>Module</th>
                </tr>
              </thead>
              <tbody>
                {modalTickets.map(t => (
                  
                  <tr key={t.id}>
                    
                    <td>{t.id}</td>
                    <td>{t.numTicket}</td>
                    <td>{t.designation}</td>
                    <td>{t.status}</td>
                    <td>{t.priorite}</td>
                    <td>{t.echeance}</td>
                    <td>{new Date(t.dateCreation).toLocaleString()}</td>
                    <td>{t.creationUser}</td>
                    <td>{t.idClient ? `${t.idClient.nom} ${t.idClient.prenom}` : '—'}</td>
                    <td>{t.idEquip?.nomEquipe || '—'}</td>
                    <td>{t.idModule?.designation || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>

      {/* Add/Edit User Modal */}
      <Modal show={showUserModal} onHide={closeUserModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUserSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Login</Form.Label>
              <Form.Control
                value={userForm.login}
                onChange={e => setUserForm(f => ({ ...f, login: e.target.value }))}
                required
              />
            </Form.Group>
            <Row className="mb-3">
              <Col>
                <Form.Check
                  type="checkbox"
                  label="Active"
                  checked={userForm.actif}
                  onChange={e => setUserForm(f => ({ ...f, actif: e.target.checked }))}
                />
              </Col>
              <Col>
                <Form.Select
                  value={userForm.role}
                  onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                >
                  <option>User</option>
                  <option>Admin</option>
                </Form.Select>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Équipe</Form.Label>
              <Form.Select
                value={userForm.idEquip}
                onChange={e => setUserForm(f => ({ ...f, idEquip: e.target.value }))}
              >
                <option value="">None</option>
                {equipes.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nomEquipe}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <div className="text-end">
              <Button variant="secondary" onClick={closeUserModal}>Cancel</Button>
              <Button type="submit" className="ms-2" disabled={savingUser}>
                {savingUser ? <Spinner animation="border" size="sm" /> : 'Save'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}
