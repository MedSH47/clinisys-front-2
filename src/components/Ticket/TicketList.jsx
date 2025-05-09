// src/components/Ticket/TicketList.jsx
import React, { useEffect, useState, useMemo } from 'react'
import {
  Table,
  Button,
  Form,
  Modal,
  Card,
  Row,
  Col,
} from 'react-bootstrap'
import authService from '../../services/authService'
import Leftside from '../nav/Leftside'
import 'bootstrap/dist/css/bootstrap.min.css'

// Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return <div className="alert alert-danger">Something went wrong.</div>
    }
    return this.props.children
  }
}

export default function TicketList() {
  const [tickets, setTickets] = useState([])
  const [clients, setClients] = useState([])
  const [equipes, setEquipes] = useState([])
  const [modules, setModules] = useState([])
  const [users, setUsers] = useState([])

  // Filters
  const [fPriority, setFPriority] = useState('All')
  const [fStatus, setFStatus] = useState('All')
  const [fTeam, setFTeam] = useState('All')
  const [fModule, setFModule] = useState('All')

  const [showModal, setShowModal] = useState(false)
  const [editingTicket, setEditing] = useState(null)
  const [form, setForm] = useState({
    numTicket: '', designation: '', status: '', priorite: '', collaborateur: '',
    echeance: '', idClient: '', idEquip: '', idModule: '',
  })

  // load data
  useEffect(() => {
    ; (async () => {
      const [t, c, e, m, u] = await Promise.all([
        authService.getAllTickets(),
        authService.getClient(),
        authService.getEquipes(),
        authService.getModules(),
        authService.getUsers(),
      ])
      setTickets(t); setClients(c); setEquipes(e); setModules(m); setUsers(u)
    })()
  }, [])

  // distinct filter lists
  const priorities = useMemo(() => ['All', ...new Set(tickets.map(t => t.priorite))], [tickets])
  const statuses = ['All', 'Accepte', 'Refuse', 'En_Attende']
  const teams = useMemo(() => ['All', ...equipes.map(e => e.nomEquipe)], [equipes])
  const mods = useMemo(() => ['All', ...modules.map(m => m.designation)], [modules])

  // filtered tickets
  const displayed = tickets
    .filter(t => fPriority === 'All' || t.priorite === fPriority)
    .filter(t => fStatus === 'All' || t.status === fStatus)
    .filter(t => fTeam === 'All' || t.idEquip?.nomEquipe === fTeam)
    .filter(t => fModule === 'All' || t.idModule?.designation === fModule)
    .sort((a, b) => new Date(a.echeance) - new Date(b.echeance))

  // for collaborator select
  const teamUsers = useMemo(() => {
    const eid = form.idEquip ? +form.idEquip : editingTicket?.idEquip?.id
    return users.filter(u => u.idEquip?.id === eid)
  }, [users, form.idEquip, editingTicket])

  // modal open/close
  const openModal = ticket => {
    if (ticket) {
      setEditing(ticket)
      setForm({
        numTicket: ticket.numTicket,
        status: ticket.status,
        priorite: ticket.priorite,
        collaborateur: ticket.collaborateur,
        echeance: ticket.echeance,
        idClient: ticket.idClient?.id + '',
        idEquip: ticket.idEquip?.id + '',
        idModule: ticket.idModule?.id + '',
        designation: ticket.designation || '',

      })
    } else {
      setEditing(null)
      setForm({ numTicket: '', status: '', priorite: '', collaborateur: '', echeance: '', idClient: '', idEquip: '', idModule: '' })
    }
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  // save
  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.idClient) return alert('Client is required')
    const payload = {
      numTicket: +form.numTicket,
      status: form.status,
      priorite: form.priorite,
      dateEffectationEquip: Date.now(),
      dateCreation: Date.now(),
      creationUser: localStorage.getItem('username') || '',
      collaborateur: form.collaborateur,
      echeance: form.echeance,
      idClient: +form.idClient,
      idEquip: form.idEquip ? +form.idEquip : null,
      idModule: form.idModule ? +form.idModule : null,
      designation: form.designation,

    }
    try {
      let res
      if (editingTicket) {
        res = await authService.updateTicket(editingTicket.id, payload)
        setTickets(ts => ts.map(t => t.id === res.id ? res : t))
      } else {
        res = await authService.createTicket(payload)
        setTickets(ts => [res, ...ts])
      }
      closeModal()
    } catch {
      alert('Save failed')
    }
  }

  const fmtDate = v => {
    if (!v) return '—'
    const d = new Date(v)
    return isNaN(d) ? '—' : d.toISOString().split('T')[0]
  }

  return (
    <ErrorBoundary>
      <div className="d-flex">
        <Leftside />
        <div style={{ marginLeft: 250, marginTop: 40 }} className="p-4 flex-grow-1">
          {/* page header */}
          <div className="d-flex align-items-center mb-4">
            <h2 className="flex-grow-1">Ticket Management</h2>
            <Button onClick={() => openModal(null)}>+ New Ticket</Button>
          </div>

          {/* filters */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Row className="gy-2 gx-3">
                <Col md>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select value={fPriority} onChange={e => setFPriority(e.target.value)}>
                    {priorities.map(p => <option key={p}>{p}</option>)}
                  </Form.Select>
                </Col>
                <Col md>
                  <Form.Label>Status</Form.Label>
                  <Form.Select value={fStatus} onChange={e => setFStatus(e.target.value)}>
                    {statuses.map(s => <option key={s}>{s}</option>)}
                  </Form.Select>
                </Col>
                <Col md>
                  <Form.Label>Team</Form.Label>
                  <Form.Select value={fTeam} onChange={e => setFTeam(e.target.value)}>
                    {teams.map(t => <option key={t}>{t}</option>)}
                  </Form.Select>
                </Col>
                <Col md>
                  <Form.Label>Module</Form.Label>
                  <Form.Select value={fModule} onChange={e => setFModule(e.target.value)}>
                    {mods.map(m => <option key={m}>{m}</option>)}
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ticket table */}
          <Table striped hover responsive className="shadow-sm bg-white rounded">
            <thead className="table-dark">
              <tr>
                <th>ID</th><th>#</th><th>Designation</th><th>Status</th><th>Priority</th>
                <th>Team</th><th>Client</th><th>Module</th><th>Due</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.numTicket}</td>
                  <td>{t.designation}</td>
                  <td>{t.status}</td>
                  <td>{t.priorite}</td>
                  <td>{t.idEquip?.nomEquipe || '—'}</td>
                  <td>{t.idClient ? `${t.idClient.nom} ${t.idClient.prenom}` : '—'}</td>
                  <td>{t.idModule?.designation || '—'}</td>
                  <td>{fmtDate(t.echeance)}</td>
                  <td>
                    <Button size="sm" onClick={() => openModal(t)} className="me-2">Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => { if (window.confirm('Delete?')) authService.deleteTicket(t.id) && setTickets(ts => ts.filter(x => x.id !== t.id)) }}>Del</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* modal */}
          <Modal show={showModal} onHide={closeModal}>
            <Modal.Header closeButton>
              <Modal.Title>{editingTicket ? 'Edit' : 'New'} Ticket</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Row className="gy-2">
                  <Col md={6}>
                    <Form.Label>Ticket #</Form.Label>
                    <Form.Control type="number" value={form.numTicket} onChange={e => setForm({ ...form, numTicket: e.target.value })} required />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Designation</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.designation}
                      onChange={e => setForm({ ...form, designation: e.target.value })}
                      required
                    />
                  </Col>

                  <Col md={6}>
                    <Form.Label>Status</Form.Label>
                    <Form.Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} required>
                      <option value="">– Select –</option>
                      <option>Accepte</option>
                      <option>Refuse</option>
                      <option>En_Attende</option>
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Priority</Form.Label>
                    <Form.Select value={form.priorite} onChange={e => setForm({ ...form, priorite: e.target.value })} required>
                      <option>– Select –</option>
                      {priorities.filter(p => 'All' !== p).map(p => <option key={p}>{p}</option>)}
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Due Date</Form.Label>
                    <Form.Control type="date" value={form.echeance} onChange={e => setForm({ ...form, echeance: e.target.value })} required />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Team</Form.Label>
                    <Form.Select value={form.idEquip} onChange={e => setForm({ ...form, idEquip: e.target.value, collaborateur: '' })}>
                      <option value="">None</option>
                      {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nomEquipe}</option>)}
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Collaborator</Form.Label>
                    <Form.Select value={form.collaborateur} onChange={e => setForm({ ...form, collaborateur: e.target.value })} required>
                      <option>– Select member –</option>
                      {teamUsers.map(u => <option key={u.id}>{u.login}</option>)}
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Client</Form.Label>
                    <Form.Select value={form.idClient} onChange={e => setForm({ ...form, idClient: e.target.value })} required>
                      <option>– Select client –</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>)}
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label>Module</Form.Label>
                    <Form.Select value={form.idModule} onChange={e => setForm({ ...form, idModule: e.target.value })}>
                      <option>None</option>
                      {modules.map(m => <option key={m.id} value={m.id}>{m.designation}</option>)}
                    </Form.Select>
                  </Col>
                </Row>
                <div className="text-end mt-3">
                  <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                  <Button type="submit" className="ms-2">Save</Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

        </div>
      </div>
    </ErrorBoundary>
  )
}
