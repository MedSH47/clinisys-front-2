// src/components/settings/Settings.jsx
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
  CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilMagnifyingGlass } from '@coreui/icons'
import authService from '../../services/authService'

export default function Settings() {
  const [me, setMe] = useState(null)
  const [profile, setProfile] = useState({ login: '', password: '' })
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('')
  const [alert, setAlert] = useState({ color: '', text: '' })
  const [openUsers, setOpenUsers] = useState(true)

  // Load current user + all users
  useEffect(() => {
    ;(async () => {
      try {
        const current = await authService.getCurrentUser()
        setMe(current)
        setProfile({ login: current.login, password: '' })
        const all = await authService.getUsers()
        setUsers(all)
      } catch (e) {
        console.error(e)
      }
    })()
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
      setUsers((us) =>
        us.map((u) => (u.id === user.id ? { ...u, actif: !u.actif } : u)),
      )
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
    } catch {
      setAlert({ color: 'danger', text: 'Erreur de transfert.' })
    }
  }

  // Filtered list
  const visibleUsers = users.filter((u) =>
    u.login.toLowerCase().includes(filter),
  )

  return (
    <CContainer className="py-4" style={{marginTop:50}}>
      <CRow>
        {/* My Profile Card */}
        <CCol md={4}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader>
              <CIcon icon={cilUser} className="me-2" style={{width:10}}/>
              Mon Profil
            </CCardHeader>
            <CCardBody>
              {alert.text && (
                <CAlert color={alert.color} dismissible onClose={() => setAlert({})}>
                  {alert.text}
                </CAlert>
              )}
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
                  <CFormLabel>
                    <CIcon icon={cilLockLocked} className="me-1" />
                    New Password
                  </CFormLabel>
                  <CFormInput
                    type="password"
                    value={profile.password}
                    onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                    placeholder="Laisser vide pour conserver"
                  />
                </div>
                <CButton type="submit" color="primary">
                  Enregistrer
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        {/* User Management Card */}
        <CCol md={8}>
          <CCard className="shadow-sm">
            <CCardHeader
              onClick={() => setOpenUsers(!openUsers)}
              style={{ cursor: 'pointer' }}
            >
              <CIcon
                icon={cilMagnifyingGlass}
                className="me-2"
                style={{width:100}}
              />
              Gestion des Utilisateurs{' '}
              <span className="float-end">
                {openUsers ? '▲' : '▼'}
              </span>
            </CCardHeader>
            <CCollapse visible={openUsers}>
              <CCardBody>
                <div className="mb-3 d-flex align-items-center">
                  <CFormInput
                    placeholder="Rechercher par login..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value.toLowerCase())}
                    style={{ maxWidth: '300px' }}
                  />
                </div>
                <CTable hover responsive bordered>
                  <CTableHead color="dark">
                    <CTableRow>
                      <CTableHeaderCell>ID</CTableHeaderCell>
                      <CTableHeaderCell>Login</CTableHeaderCell>
                      <CTableHeaderCell>Role</CTableHeaderCell>
                      <CTableHeaderCell>Actif</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">
                        Actions
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {visibleUsers.map((u) => (
                      <CTableRow key={u.id}>
                        <CTableDataCell>{u.id}</CTableDataCell>
                        <CTableDataCell>{u.login}</CTableDataCell>
                        <CTableDataCell>
                          <strong
                            className={
                              u.role === 'Admin' ? 'text-danger' : 'text-muted'
                            }
                          >
                            {u.role}
                          </strong>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CFormSwitch
                            checked={u.actif}
                            onChange={() => toggleActive(u)}
                          />
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
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
            </CCollapse>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}
