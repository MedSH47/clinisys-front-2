// src/components/error/Settings.jsx

import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CAlert,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormSwitch,
} from '@coreui/react'
import authService from '../../services/authService'

export default function Settings() {
  const [me, setMe] = useState(null)
  const [profile, setProfile] = useState({ login: '', password: '' })
  const [users, setUsers] = useState([])
  const [alert, setAlert] = useState({ color: '', text: '' })

  // Load current user + all users
  useEffect(() => {
    ;(async () => {
      const current = await authService.getCurrentUser()
      setMe(current)
      setProfile({ login: current.login, password: '' })
      const all = await authService.getUsers()
      setUsers(all)
    })().catch(console.error)
  }, [])

  // Submit profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...me, login: profile.login }
      if (profile.password) payload.password = profile.password
      const updated = await authService.updateUser(me.id, payload)
      setMe(updated)
      setAlert({ color: 'success', text: 'Profil mis à jour.' })
      setProfile({ ...profile, password: '' })
    } catch (err) {
      setAlert({ color: 'danger', text: err.message || 'Erreur lors de la mise à jour.' })
    }
  }

  // Toggle active/inactive
  const toggleActive = async (user) => {
    try {
      await authService.updateUser(user.id, { ...user, actif: !user.actif })
      setUsers(users.map(u => (u.id === user.id ? { ...u, actif: !u.actif } : u)))
    } catch (err) {
      console.error(err)
    }
  }

  // Transfer admin role
  const transferAdmin = async (newAdmin) => {
    if (!window.confirm(`Transférer Admin à ${newAdmin.login} ?`)) return
    try {
      // demote current
      await authService.updateUser(me.id, { ...me, role: 'User' })
      // promote chosen
      await authService.updateUser(newAdmin.id, { ...newAdmin, role: 'Admin' })
      setAlert({ color: 'success', text: 'Rôle Admin transféré.' })
      const all = await authService.getUsers()
      setUsers(all)
    } catch (err) {
      setAlert({ color: 'danger', text: 'Erreur de transfert.' })
    }
  }

  return (
    <CContainer className="py-4">
      <CRow>
        {/* My Profile */}
        <CCol md={4}>
          <CCard className="mb-4">
            <CCardHeader>Mon Profil</CCardHeader>
            <CCardBody>
              {alert.text && <CAlert color={alert.color}>{alert.text}</CAlert>}
              <CForm onSubmit={handleProfileSubmit}>
                <div className="mb-3">
                  <CFormLabel>Username</CFormLabel>
                  <CFormInput
                    value={profile.login}
                    onChange={(e) => setProfile({ ...profile, login: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel>New Password</CFormLabel>
                  <CFormInput
                    type="password"
                    value={profile.password}
                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                    placeholder="Laisser vide pour conserver"
                  />
                </div>
                <CButton type="submit" color="primary">Enregistrer</CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        {/* User Management */}
        <CCol md={8}>
          <CCard>
            <CCardHeader>Gestion des Utilisateurs</CCardHeader>
            <CCardBody>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Login</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Actif</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.map((u) => (
                    <CTableRow key={u.id}>
                      <CTableDataCell>{u.id}</CTableDataCell>
                      <CTableDataCell>{u.login}</CTableDataCell>
                      <CTableDataCell>
                        <strong className={u.role === 'Admin' ? 'text-danger' : 'text-muted'}>
                          {u.role}
                        </strong>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormSwitch
                          checked={u.actif}
                          onChange={() => toggleActive(u)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        {me?.role === 'Admin' && u.role !== 'Admin' && (
                          <CButton
                            size="sm"
                            color="warning"
                            onClick={() => transferAdmin(u)}
                          >
                            Transférer Admin
                          </CButton>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}
