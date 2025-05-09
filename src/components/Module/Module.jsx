import React, { useState, useEffect, useMemo } from 'react'
import {
  Table,
  Button,
  Form,
  Spinner,
  Alert,
  Collapse,
  Modal,
} from 'react-bootstrap'
import Leftside from '../nav/Leftside'
import authService from '../../services/authService'

export default function ModuleTableWithAssign() {
  // Data
  const [modules, setModules] = useState([])
  const [tickets, setTickets] = useState([])

  // Loading & error
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters & search
  const [searchTerm, setSearchTerm] = useState('')
  const [withTicketsOnly, setWithTicketsOnly] = useState(false)

  // Inline expand
  const [openId, setOpenId] = useState(null)
  const toggleOpen = id => setOpenId(openId === id ? null : id)

  // Track selection per module
  const [selectedTicket, setSelectedTicket] = useState({})

  // Add/Edit Modal
  const [showModal, setShowModal] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [form, setForm] = useState({ designation: '', code: '' })
  const [saving, setSaving] = useState(false)

  // Load modules & tickets
  useEffect(() => {
    ;(async () => {
      try {
        const [m, t] = await Promise.all([
          authService.getModules(),
          authService.getAllTickets(),
        ])
        setModules(m)
        setTickets(t)
      } catch {
        setError('Failed to load modules or tickets')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Ticket counts per module
  const ticketCount = useMemo(() => {
    const m = new Map()
    modules.forEach(md => m.set(md.id, 0))
    tickets.forEach(t => {
      const mid = t.idModule?.id
      if (mid != null) m.set(mid, (m.get(mid) || 0) + 1)
    })
    return m
  }, [modules, tickets])

  // Filtered modules
  const displayed = useMemo(() => {
    return modules.filter(md => {
      if (
        searchTerm &&
        !md.designation.toLowerCase().includes(searchTerm.toLowerCase())
      ) return false
      if (withTicketsOnly && (ticketCount.get(md.id) || 0) === 0) return false
      return true
    })
  }, [modules, searchTerm, withTicketsOnly, ticketCount])

  const fmtDate = ts =>
    ts ? new Date(ts).toLocaleDateString() : '—'

  // Assign ticket
  const assignTicket = async moduleId => {
    const tid = selectedTicket[moduleId]
    if (!tid) return alert('Select a ticket')
    const dto = await authService.getTicket(tid)
    dto.idModule = { id: moduleId }
    await authService.updateTicket(tid, dto)
    const m = await authService.getModules()
    setModules(m)
    setSelectedTicket({ ...selectedTicket, [moduleId]: '' })
  }

  // Unassign ticket
  const unassignTicket = async tid => {
    const dto = await authService.getTicket(tid)
    dto.idModule = null
    await authService.updateTicket(tid, dto)
    const m = await authService.getModules()
    setModules(m)
  }

  // Open add/edit modal
  const openModal = md => {
    if (md) {
      setEditingModule(md)
      setForm({ designation: md.designation, code: md.code })
    } else {
      setEditingModule(null)
      setForm({ designation: '', code: '' })
    }
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)

  // Save module
  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      let res
      if (editingModule) {
        res = await authService.updateModule(editingModule.id, form)
        setModules(ms => ms.map(m => (m.id === res.id ? res : m)))
      } else {
        res = await authService.createModule(form)
        setModules(ms => [res, ...ms])
      }
      closeModal()
    } catch {
      alert('Save failed')
    } finally {
      setSaving(false)
    }
  }

  // Delete module
  const handleDelete = async id => {
    if (!window.confirm('Delete this module?')) return
    await authService.deleteModule(id)
    setModules(ms => ms.filter(m => m.id !== id))
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
        <div className="container mt-5" style={{ marginLeft: 250 }}>
          <h2 className="mb-4">Module Management</h2>

          {/* Controls */}
          <div className="d-flex mb-3">
            <Form.Control
              placeholder="Search modules..."
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
            <Button variant="success" onClick={() => openModal(null)}>
              + Add Module
            </Button>
          </div>

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th></th>
                <th>Designation</th>
                <th>Code</th>
                <th>Created On</th>
                <th>Created By</th>
                <th>Tickets</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(md => (
                <React.Fragment key={md.id}>
                  <tr>
                    <td>
                      <Button
                        size="sm"
                        onClick={() => toggleOpen(md.id)}
                      >
                        {openId === md.id ? '▼' : '▶'}
                      </Button>
                    </td>
                    <td>{md.designation}</td>
                    <td>{md.code}</td>
                    <td>{fmtDate(md.creationDate)}</td>
                    <td>{md.creationUser}</td>
                    <td>{ticketCount.get(md.id) || 0}</td>
                    <td>
                      <Button
                        size="sm"
                        className="me-2"
                        onClick={() => openModal(md)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(md.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={7} className="p-0">
                      <Collapse in={openId === md.id}>
                        <div className="p-3 bg-light">
                          <Form.Select
                            value={selectedTicket[md.id] || ''}
                            onChange={e =>
                              setSelectedTicket({
                                ...selectedTicket,
                                [md.id]: e.target.value,
                              })
                            }
                          >
                            <option value="">— Select Ticket —</option>
                            {tickets
                              .filter(
                                t =>
                                  t.idModule?.id !== md.id &&
                                  t.status === 'En_Attende'
                              )
                              .map(t => (
                                <option key={t.id} value={t.id}>
                                  #{t.numTicket} – {t.designation}
                                </option>
                              ))}
                          </Form.Select>
                          <Button
                            size="sm"
                            className="ms-2"
                            onClick={() => assignTicket(md.id)}
                          >
                            Assign
                          </Button>

                          {md.ticketList?.length ? (
                            <Table
                              size="sm"
                              bordered
                              className="mt-3"
                            >
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>#</th>
                                  <th>Status</th>
                                  <th>Priority</th>
                                  <th>Due</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {md.ticketList.map(t => (
                                  <tr key={t.id}>
                                    <td>{t.id}</td>
                                    <td>{t.numTicket}</td>
                                    <td>{t.status}</td>
                                    <td>{t.priorite}</td>
                                    <td>{t.echeance}</td>
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
                          ) : (
                            <p className="mt-3">No tickets assigned.</p>
                          )}
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingModule ? 'Edit Module' : 'Add Module'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>Designation</Form.Label>
              <Form.Control
                value={form.designation}
                onChange={e =>
                  setForm(f => ({ ...f, designation: e.target.value }))
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Code</Form.Label>
              <Form.Control
                value={form.code}
                onChange={e =>
                  setForm(f => ({ ...f, code: e.target.value }))
                }
                required
              />
            </Form.Group>
            <div className="text-end">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="ms-2"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}
