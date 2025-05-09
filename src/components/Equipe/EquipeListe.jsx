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

export default function Equipe() {
  // --- Data
  const [equipes, setEquipes] = useState([])
  const [tickets, setTickets] = useState([])
  const [users, setUsers] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // --- Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [withTicketsOnly, setWithTicketsOnly] = useState(false)

  // --- Modals state
  const [showTicketsModal, setShowTicketsModal] = useState(false)
  const [modalEquipe, setModalEquipe] = useState(null)
  const [availableTickets, setAvailableTickets] = useState([])
  const [assignedTickets, setAssignedTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState('')

  const [showUsersModal, setShowUsersModal] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [assignedUsers, setAssignedUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')

  // --- Equipe CRUD modal
  const [showEquipeModal, setShowEquipeModal] = useState(false)
  const [editingEquipe, setEditingEquipe] = useState(null)
  const [equipeForm, setEquipeForm] = useState({ nomEquipe: '' })
  const [savingEquipe, setSavingEquipe] = useState(false)

  // --- Initial load
  useEffect(() => {
    ;(async () => {
      try {
        const [eData, tData, uData] = await Promise.all([
          authService.getEquipes(),
          authService.getAllTickets(),
          authService.getUsers(),
        ])
        setEquipes(eData)
        setTickets(tData)
        setUsers(uData)
      } catch {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // --- Helpers
  const ticketCount = useMemo(() => {
    const m = new Map()
    equipes.forEach(eq => m.set(eq.id, 0))
    tickets.forEach(t => {
      const eid = t.idEquip?.id
      if (eid != null) m.set(eid, (m.get(eid) || 0) + 1)
    })
    return m
  }, [equipes, tickets])

  const userCount = useMemo(() => {
    const m = new Map()
    equipes.forEach(eq => m.set(eq.id, 0))
    users.forEach(u => {
      const eid = u.idEquip?.id
      if (eid != null) m.set(eid, (m.get(eid) || 0) + 1)
    })
    return m
  }, [equipes, users])

  const displayed = useMemo(() => {
    return equipes.filter(eq => {
      if (
        searchTerm &&
        !eq.nomEquipe.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false
      if (withTicketsOnly && (ticketCount.get(eq.id) || 0) === 0) return false
      return true
    })
  }, [equipes, searchTerm, withTicketsOnly, ticketCount])

  const fmtDate = ts => (ts ? new Date(ts).toLocaleDateString() : '—')

  // --- Tickets Modal
  const openTicketsModal = eq => {
    setModalEquipe(eq)
    setAssignedTickets(eq.ticketList || [])
    setAvailableTickets(
      tickets.filter(
        t => (!eq.ticketList?.some(x => x.id === t.id)) && t.status === 'En_Attende'
      )
    )
    setSelectedTicket('')
    setShowTicketsModal(true)
  }
  const closeTicketsModal = () => setShowTicketsModal(false)

  const assignTicket = async () => {
    if (!selectedTicket) return
    const dto = await authService.getTicket(selectedTicket)
    dto.idEquip = { id: modalEquipe.id }
    await authService.updateTicket(selectedTicket, dto)
    // refresh
    const eData = await authService.getEquipes()
    setEquipes(eData)
    openTicketsModal(eData.find(e=>e.id===modalEquipe.id))
  }
  const unassignTicket = async id => {
    const dto = await authService.getTicket(id)
    dto.idEquip = null
    await authService.updateTicket(id, dto)
    const eData = await authService.getEquipes()
    setEquipes(eData)
    openTicketsModal(eData.find(e=>e.id===modalEquipe.id))
  }

  // --- Users Modal
  const openUsersModal = eq => {
    setModalEquipe(eq)
    setAssignedUsers(eq.utilisateurList || [])
    setAvailableUsers(
      users.filter(u => !eq.utilisateurList?.some(x => x.id === u.id))
    )
    setSelectedUser('')
    setShowUsersModal(true)
  }
  const closeUsersModal = () => setShowUsersModal(false)

  const assignUser = async () => {
    if (!selectedUser) return
    const dto = await authService.getUser(selectedUser)
    dto.idEquip = { id: modalEquipe.id }
    await authService.updateUser(selectedUser, dto)
    const eData = await authService.getEquipes()
    setEquipes(eData)
    openUsersModal(eData.find(e=>e.id===modalEquipe.id))
  }
  const unassignUser = async id => {
    const dto = await authService.getUser(id)
    dto.idEquip = null
    await authService.updateUser(id, dto)
    const eData = await authService.getEquipes()
    setEquipes(eData)
    openUsersModal(eData.find(e=>e.id===modalEquipe.id))
  }

  // --- Equipe CRUD
  const openEquipeModal = eq => {
    if (eq) {
      setEditingEquipe(eq)
      setEquipeForm({ nomEquipe: eq.nomEquipe })
    } else {
      setEditingEquipe(null)
      setEquipeForm({ nomEquipe: '' })
    }
    setShowEquipeModal(true)
  }
  const closeEquipeModal = () => setShowEquipeModal(false)

  const handleEquipeSubmit = async e => {
    e.preventDefault()
    setSavingEquipe(true)
    try {
      let res
      if (editingEquipe) {
        res = await authService.updateEquipe(editingEquipe.id, {
          nomEquipe: equipeForm.nomEquipe,
        })
        setEquipes(es => es.map(x => (x.id === res.id ? res : x)))
      } else {
        res = await authService.createEquipe({ nomEquipe: equipeForm.nomEquipe })
        setEquipes(es => [res, ...es])
      }
      closeEquipeModal()
    } catch {
      alert('Save failed')
    } finally {
      setSavingEquipe(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this équipe?')) return
    await authService.deleteEquipe(id)
    setEquipes(es => es.filter(x => x.id !== id))
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
          <h2 className="mb-4">Liste des Équipes</h2>
          <div className="d-flex mb-3">
            <Form.Control
              placeholder="Search..."
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
              {withTicketsOnly ? 'Only with Tickets' : 'Show with Tickets'}
            </Button>
            <Button onClick={() => openEquipeModal(null)} variant="success">
              + Add Équipe
            </Button>
          </div>

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Créée le</th>
                <th>Par</th>
                <th>Tickets</th>
                <th>Users</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(eq => (
                <tr key={eq.id}>
                  <td>{eq.id}</td>
                  <td>{eq.nomEquipe}</td>
                  <td>{fmtDate(eq.creationDate)}</td>
                  <td>{eq.creationUser}</td>
                  <td>
                    <Button
                      variant="link"
                      onClick={() => openTicketsModal(eq)}
                    >
                      {ticketCount.get(eq.id) || 0}
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="link"
                      onClick={() => openUsersModal(eq)}
                    >
                      {userCount.get(eq.id) || 0}
                    </Button>
                  </td>
                  <td>
                    <Button className="me-2" onClick={() => openEquipeModal(eq)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(eq.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Tickets Modal */}
      <Modal show={showTicketsModal} onHide={closeTicketsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tickets for {modalEquipe?.nomEquipe}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="align-items-end mb-3">
            <Col md={8}>
              <Form.Select
                value={selectedTicket}
                onChange={e => setSelectedTicket(e.target.value)}
              >
                <option value="">— Select Ticket —</option>
                {availableTickets.map(t => (
                  <option key={t.id} value={t.id}>
                    #{t.numTicket} – {t.designation}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Button onClick={assignTicket}>Assign</Button>
            </Col>
          </Row>
          {assignedTickets.length === 0 ? (
            <Alert variant="info">No tickets assigned.</Alert>
          ) : (
            <Table size="sm" bordered>
              <thead>
                <tr>
                  <th>ID</th><th>#</th><th>Designation</th><th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedTickets.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.numTicket}</td>
                    <td>{t.designation}</td>
                    <td>{t.status}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => unassignTicket(t.id)}
                      >
                        Unassign
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>

      {/* Users Modal */}
      <Modal show={showUsersModal} onHide={closeUsersModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Users for {modalEquipe?.nomEquipe}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="align-items-end mb-3">
            <Col md={8}>
              <Form.Select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
              >
                <option value="">— Select User —</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.login}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col>
              <Button onClick={assignUser}>Assign</Button>
            </Col>
          </Row>
          {assignedUsers.length === 0 ? (
            <Alert variant="info">No users assigned.</Alert>
          ) : (
            <Table size="sm" bordered>
              <thead>
                <tr>
                  <th>ID</th><th>Login</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.login}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => unassignUser(u.id)}
                      >
                        Unassign
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
      </Modal>

      {/* Equipe CRUD Modal */}
      <Modal show={showEquipeModal} onHide={closeEquipeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingEquipe ? 'Edit Équipe' : 'Add Équipe'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEquipeSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom Équipe</Form.Label>
              <Form.Control
                value={equipeForm.nomEquipe}
                onChange={e =>
                  setEquipeForm(f => ({ ...f, nomEquipe: e.target.value }))
                }
                required
              />
            </Form.Group>
            <div className="text-end">
              <Button variant="secondary" onClick={closeEquipeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="ms-2"
                disabled={savingEquipe}
              >
                {savingEquipe ? <Spinner size="sm" /> : 'Save'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}
