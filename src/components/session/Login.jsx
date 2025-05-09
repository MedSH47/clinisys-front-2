// src/components/Login.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import authService from '../../services/authService'
import decodeToken from '../../services/decodeToken';

export default function Login() {
  const [credentials, setCredentials] = useState({ login: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate() 
  useEffect(() => {
    localStorage.clear()
  }, []) 

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const tokenorgine =await authService.login(credentials)
      const token=decodeToken(tokenorgine)
      const role = token.roles[0].authority;
      const username = token.sub;
      localStorage.setItem('token', tokenorgine)
      localStorage.setItem('userrole', role)
      localStorage.setItem('username', username)
     
      if (role === "ROLE_Admin") {
        navigate('/AdminDashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Erreur de connexion'
      setError(errorMessage)
    }
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              {/* Login Form Card */}
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-muted">Sign In to your account</p>

                    {error && <CAlert color="danger">{error}</CAlert>}

                    {/* Username */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={credentials.login}
                        onChange={(e) => {
                          setError('')
                          setCredentials({ ...credentials, login: e.target.value })
                        }}
                        required
                      />
                    </CInputGroup>

                    {/* Password */}
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={credentials.password}
                        onChange={(e) => {
                          setError('')
                          setCredentials({ ...credentials, password: e.target.value })
                        }}
                        required
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" type="submit" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <Link to="/forgot-password">
                          <CButton color="link" className="px-0">
                            Forgot password?
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              {/* Sign-up Promo Card */}
              <CCard className="text-white bg-primary py-5 d-md-down-none" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Don’t have an account yet? Register now to get started with Clinisys.
                    </p>
                    <Link to="/register">
                      <CButton color="light" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}
