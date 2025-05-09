// src/components/User/UsersList.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Modal, Button, Form, Table } from 'react-bootstrap'
import authService from '../../services/authService'
import Leftside from '../nav/Leftside'

const UsersList = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [tickets, setTickets] = useState([])
  const [search, setSearch] = useState('')
  const [expandedUserId, setExpandedUserId] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isPasswordActive, setIsPasswordActive] = useState(false)
  const [editUser, setEditUser] = useState({
    id: '', login: '', role: '', actif: false, password: ''
  })
  const navigate = useNavigate()

  // Load users + tickets
  useEffect(() => {
    ;(async () => {
      try {
        const [uData, tData] = await Promise.all([
          authService.getUsers(),
          authService.getAllTickets()
        ])
        setUsers(uData)
        setFilteredUsers(uData)
        setTickets(tData)
      } catch (err) {
        if (err === 'Authorization header is missing or invalid') {
          return navigate('/login')
        }
        alert(err.error || 'Failed to load data')
      }   
    })()
  }, [navigate])

  // Search filter
  useEffect(() => {
    setFilteredUsers(
      users.filter(u =>
        u.login.toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [search, users])

  const formatDate = ts =>
    ts ? new Date(ts).toLocaleDateString() : 'N/A'

  const toggleExpandUser = id =>
    setExpandedUserId(expandedUserId === id ? null : id)

  const handleEdit = user => {
    setEditUser({ ...user, password: '' })
    setIsPasswordActive(false)
    setShowEditModal(true)
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return
    try {
      await authService.deleteUser(id)
      const updated = users.filter(u => u.id !== id)
      setUsers(updated)
      setFilteredUsers(updated)
      alert('User deleted')
    } catch (err) {
      alert(err.error || 'Delete failed')
    }
  }

  const handleUpdateSubmit = async () => {
    const payload = { ...editUser }
    if (!isPasswordActive || !payload.password) delete payload.password
    try {
      const updated = await authService.updateUser(payload.id, payload)
      const newList = users.map(u => (u.id === updated.id ? updated : u))
      setUsers(newList)
      setFilteredUsers(newList.filter(u =>
        u.login.toLowerCase().includes(search.toLowerCase())
      ))
      setShowEditModal(false)
      alert('User updated')
    } catch (err) {
      alert(err.error || 'Update failed')
    }
  }

  const handleFieldChange = e => {
    const { name, value, type, checked } = e.target
    setEditUser({
      ...editUser,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  // Tickets assigned to a given user (by collaborator field)
  const ticketsForUser = login =>
    tickets.filter(t => t.collaborateur === login)

  const activeCount = users.filter(u => u.actif).length
  const adminCount = users.filter(u => u.role === 'Admin').length

  return (
    <div style={{ display: 'flex' }}>
      <Leftside />
      <div className="container mt-5" style={{ marginLeft: 250, width: '100%' }}>
        <br />
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary">
            <i className="bi bi-people-fill me-2"></i>
            User Management
          </h2>
          <Link to="/users/create" className="btn btn-success">
            <i className="bi bi-plus-circle me-1"></i>Create User
          </Link>
        </div>

        {/* Stats */}
        <div className="row mb-2">
          {[
            ['Total Users', users.length],
            ['Active Users', activeCount],
            ['Admin Users', adminCount],
          ].map(([label, count]) => (
            <div key={label} className="col-md-4 mb-2">
              <div className="p-3 bg-white shadow-sm rounded text-center">
                <h6 className="mb-1">{label}</h6>
                <h3>{count}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="input-group mb-4">
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            className="form-control"
            placeholder="Search by username..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* User Cards */}
        <div className="row">
          {filteredUsers.map(user => (
            <div key={user.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-person-circle me-1"></i>
                    {user.login}
                  </h5>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className={`badge ${user.actif ? 'bg-success' : 'bg-secondary'}`}>
                      {user.actif ? 'Active' : 'Inactive'}
                    </span>
                  </p>

                  {/* Expanded details */}
                  {expandedUserId === user.id && (
                    <>
                      <hr />
                      <p><strong>ID:</strong> {user.id}</p>
                      <p><strong>Created:</strong> {formatDate(user.creationDate)}</p>
                      <p><strong>By:</strong> {user.creationUser}</p>

                      {/* Tickets Table */}
                      <h6 className="mt-3">Assigned Tickets</h6>
                      <Table size="sm" bordered hover className="mb-3">
                        <thead>
                          <tr>
                            <th>#</th><th>Status</th><th>Due</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ticketsForUser(user.login).map(t => (
                            <tr key={t.id}>
                              <td>{t.numTicket}</td>
                              <td>{t.status}</td>
                              <td>{t.echeance}</td>
                            </tr>
                          ))}
                          {!ticketsForUser(user.login).length && (
                            <tr>
                              <td colSpan="3" className="text-center">No tickets</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </>
                  )}

                  <div className="d-flex justify-content-between">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => toggleExpandUser(user.id)}
                    >
                      {expandedUserId === user.id ? 'Hide Details' : 'Details'}
                    </Button>

                    <div>
                      <Button
                        size="sm"
                        variant="warning"
                        className="me-2"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User: {editUser.login}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Login</Form.Label>
                <Form.Control
                  name="login"
                  value={editUser.login || ''}
                  onChange={handleFieldChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={editUser.role || ''}
                  onChange={handleFieldChange}
                >
                  <option>Admin</option>
                  <option>User</option>
                </Form.Select>
              </Form.Group>

              <Form.Check
                className="mb-3"
                label="Active"
                name="actif"
                checked={!!editUser.actif}
                onChange={handleFieldChange}
              />

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  name="password"
                  type="password"
                  value={editUser.password || ''}
                  onChange={handleFieldChange}
                  disabled={!isPasswordActive}
                />
                {!isPasswordActive && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => setIsPasswordActive(true)}
                  >
                    Change Password
                  </Button>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateSubmit}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  )
}

export default UsersList
