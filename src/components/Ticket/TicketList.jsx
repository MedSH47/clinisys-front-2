// src/components/Ticket/TicketList.jsx

import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Button, Form, Modal } from 'react-bootstrap'
import authService from '../../services/authService'

export default function TicketList() {
  const [tickets, setTickets] = useState([])
  const [clients, setClients] = useState([])
  const [equipes, setEquipes] = useState([])
  const [modules, setModules] = useState([])

  const [filterPriority, setFilterPriority] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingTicket, setEditingTicket] = useState(null)
  const [form, setForm] = useState({
    numTicket: '',
    status: '',
    priorite: '',
    collaborateur: '',
    echeance: '',
    idClient: '',    // always a string
    idEquip: '',
    idModule: ''
  })

  // Fetch data
  useEffect(() => {
    const loadAll = async () => {
      const [tData, cData, eData, mData] = await Promise.all([
        authService.getAllTickets(),
        authService.getClient(),
        authService.getEquipes(),
        authService.getModules(),
      ])
      setTickets(tData)
      setClients(cData)
      setEquipes(eData)
      setModules(mData)
    }
    loadAll()
  }, [])

  // Unique priorities
  const priorities = React.useMemo(() => {
    const s = new Set(tickets.map(t => t.priorite).filter(Boolean))
    return ['All', ...Array.from(s)]
  }, [tickets])

  // Filter & sort
  const displayed = tickets
    .filter(t => filterPriority === 'All' || t.priorite === filterPriority)
    .sort((a, b) => new Date(a.echeance) - new Date(b.echeance))

  // Open modal (create or edit)
  const openModal = ticket => {
    if (ticket) {
      setEditingTicket(ticket)
      setForm({
        numTicket: ticket.numTicket,
        status: ticket.status,
        priorite: ticket.priorite,
        collaborateur: ticket.collaborateur,
        echeance: ticket.echeance,
        idClient: ticket.idClient?.id?.toString() || '',
        idEquip: ticket.idEquip?.id?.toString() || '',
        idModule: ticket.idModule?.id?.toString() || '',
      })
    } else {
      setEditingTicket(null)
      setForm({
        numTicket: '',
        status: '',
        priorite: '',
        collaborateur: '',
        echeance: '',
        idClient: '',
        idEquip: '',
        idModule: '',
      })
    }
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  // Delete
  const handleDelete = async id => {
    if (!window.confirm('Delete this ticket?')) return
    await authService.deleteTicket(id)
    const updated = tickets.filter(t => t.id !== id)
    setTickets(updated)
  }

  // Submit
  const handleSubmit = async e => {
    e.preventDefault()
    if (form.idClient === '') {
      alert('Client is required')
      return
    }
    const payload = {
      numTicket: Number(form.numTicket),
      status: form.status,
      priorite: form.priorite,
      dateEffectationEquip: Date.now(),
      dateCreation: Date.now(),
      creationUser: localStorage.getItem('username') || '',
      collaborateur: form.collaborateur,
      echeance: form.echeance,
      idClient: Number(form.idClient),
      idEquip: form.idEquip ? Number(form.idEquip) : null,
      idModule: form.idModule ? Number(form.idModule) : null,
    }
    console.log('Sending payload:', payload)
    let result
    if (editingTicket) {
      result = await authService.updateTicket(editingTicket.id, payload)
      setTickets(tickets.map(t => (t.id === result.id ? result : t)))
    } else {
      result = await authService.createTicket(payload)
      setTickets([result, ...tickets])
    }
    closeModal()
  }

  return (
    
    <div className="container mt-4">
      <br />
      <br />
      <div className="d-flex justify-content-between mb-3">
        <Form.Select
          style={{ width: 200 }}
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          {priorities.map(pr => (
            <option key={pr} value={pr}>{pr}</option>
          ))}
        </Form.Select>
        <Button onClick={() => openModal(null)}>Add Ticket</Button>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {displayed.map(t => (
          <Col key={t.id}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title>#{t.numTicket}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{t.status}</Card.Subtitle>
                <Card.Text className="flex-grow-1">
                  <div><strong>Priority:</strong> {t.priorite}</div>
                  <div><strong>Team:</strong> {t.idEquip?.nomEquipe || '—'}</div>
                  <div><strong>Client:</strong> {t.idClient?.nom || '—'} {t.idClient?.prenom || '—'}</div>
                  <div><strong>Module:</strong>{t.idModule.designation}</div>
                  <div><strong>Due:</strong> {t.echeance}</div>

                </Card.Text>
                <div className="mt-auto">
                  <Button size="sm" onClick={() => openModal(t)} className="me-2">Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(t.id)}>Delete</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingTicket ? 'Edit' : 'Add'} Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="numTicket" className="mb-2">
              <Form.Label>Ticket #</Form.Label>
              <Form.Control
                type="number"
                value={form.numTicket}
                onChange={e => setForm({ ...form, numTicket: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group controlId="status" className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                required
              >
                <option value="" disabled>{tickets.status}</option>
                <option value="Accepte">Accepte</option>
                <option value="Refuse">Refuse</option>
                <option value="En_Attende">En_Attende</option>
              </Form.Select>
            </Form.Group>


            <Form.Group controlId="priorite" className="mb-2">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={form.priorite}
                onChange={e => setForm({ ...form, priorite: e.target.value })}
                required
              >
                <option value="">Select priority</option>
                {priorities
                  .filter(p => p !== 'All')
                  .map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="collaborateur" className="mb-2">
              <Form.Label>Collaborator</Form.Label>
              <Form.Control
                type="text"
                value={form.collaborateur}
                onChange={e => setForm({ ...form, collaborateur: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group controlId="echeance" className="mb-2">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={form.echeance}
                onChange={e => setForm({ ...form, echeance: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group controlId="idClient" className="mb-2">
              <Form.Label>Client</Form.Label>
              <Form.Select
                value={form.idClient}
                onChange={e => setForm({ ...form, idClient: e.target.value })}
                required
              >
                <option value="">-- Select client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nom} {c.prenom}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="idEquip" className="mb-2">
              <Form.Label>Team (optional)</Form.Label>
              <Form.Select
                value={form.idEquip}
                onChange={e => setForm({ ...form, idEquip: e.target.value })}
              >
                <option value="">None</option>
                {equipes.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.nomEquipe}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="idModule" className="mb-2">
              <Form.Label>Module (optional)</Form.Label>
              <Form.Select
                value={form.idModule}
                onChange={e => setForm({ ...form, idModule: e.target.value })}
              >
                <option value="">None</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>{m.designation}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button type="submit" className="ms-2">Save</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}
