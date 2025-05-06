// UsersList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import authService from '../../services/authService';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isPasswordActive, setIsPasswordActive] = useState(false);
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "",
    password: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    authService.getUsers()
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
          setFilteredUsers(data);
        } else {
          throw new Error('Invalid data format from API');
        }
      })
      .catch(err => {
        if (err === 'Authorization header is missing or invalid') {
          navigate('/login');
        }
        alert(err.error || 'Failed to fetch users');
      });
  }, [navigate]);

  useEffect(() => {
    setFilteredUsers(
      users.filter(user =>
        user.login.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, users]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp); // timestamp in ms
    return date.toLocaleDateString(); // e.g., "5/5/2025"
  };
  const toggleExpandUser = (userId) =>
    setExpandedUserId(expandedUserId === userId ? null : userId);

  const handleEdit = (user) => {
    setEditUser({ ...user });
    setIsPasswordActive(false);
    setShowEditModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await authService.deleteUser(userId);
      const updated = users.filter(u => u.id !== userId);
      setUsers(updated);
      setFilteredUsers(updated);
      alert('User deleted successfully.');
    } catch (err) {
      alert(err.error || 'Delete failed');
    }
  };

  const handleUpdateSubmit = async () => {
    // omit password if not active
    const payload = { ...editUser };
    if (!isPasswordActive || !payload.password) {
      delete payload.password;
    }
    try {
      const updated = await authService.updateUser(payload.id, payload);
      const newUsers = users.map(u => (u.id === updated.id ? updated : u));
      setUsers(newUsers);
      setFilteredUsers(
        newUsers.filter(u =>
          u.login.toLowerCase().includes(search.toLowerCase())
        )
      );
      setShowEditModal(false);
      alert('User updated successfully.');
    } catch (err) {
      alert(err.error || 'Update failed');
    }
  };

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUser({
      ...editUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const activeCount = users.filter(user => user.actif).length;
  const adminCount = users.filter(user => user.role === 'admin').length;

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">
          <i className="bi bi-person-gear me-2"></i>User Management Dashboard
        </h2>
        <Link to="/users/create" className="btn btn-success shadow">
          <i className="bi bi-plus-circle me-2"></i>Create User
        </Link>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        {[["Total Users", users.length], ["Active Users", activeCount], ["Admin Users", adminCount]].map(([label, count], idx) => (
          <div key={idx} className="col-md-4">
            <div className="p-3 bg-white shadow rounded text-center border">
              <h6>{label}</h6>
              <h4>{count}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="input-group mb-4 shadow-sm">
        <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
        <Form.Control
          placeholder="Search by username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* User Cards */}
      <div className="row">
        {filteredUsers.map(user => (
          <div key={user.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title text-primary">
                  <i className="bi bi-person-circle me-2"></i>{user.login}
                </h5>
                <p className="mb-1"><strong>Role:</strong> {user.role}</p>
                <p className="mb-2">
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${user.actif ? 'bg-success' : 'bg-secondary'}`}>
                    {user.actif ? 'Active' : 'Inactive'}
                  </span>
                </p>

                {expandedUserId === user.id && (
                  <div className="bg-light rounded p-2 small mb-2">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Created:</strong> {formatDate(user.creationDate)}</p>
                    <p><strong>By:</strong> {user.creationUser || 'N/A'}</p>
                    <p><strong>Poste ID:</strong> {user.idPoste?.id || 'N/A'}</p>
                    <p><strong>Equip ID:</strong> {user.idEquip ?? 'N/A'}</p>

                    {/* Show More button */}
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate(`/users/${user.id}`)}>
                      Show More
                    </Button>
                  </div>
                )}

                <div className="d-flex justify-content-between">
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => toggleExpandUser(user.id)}
                  >
                    {expandedUserId === user.id ? 'Hide' : 'Details'}
                  </Button>
                  <div>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
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
          <Modal.Title>Edit User: {editUser?.login}</Modal.Title>
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
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </Form.Select>
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Active"
              name="actif"
              checked={!!editUser.actif}
              onChange={handleFieldChange}
            />

            <Form.Group className="mb-3 mt-3">
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
          <Button variant="success" onClick={handleUpdateSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsersList;
