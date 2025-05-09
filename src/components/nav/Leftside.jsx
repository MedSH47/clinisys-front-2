// src/components/nav/LeftSide.jsx
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function LeftSide() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { pathname } = useLocation()
  

  const navItems = [
    { to: '/AdminDashboard/users', icon: 'bi-person-lines-fill', label: 'Users' },
    { to: '/AdminDashboard/EquipeListe', icon: 'bi-people-fill', label: 'Equipe' },
    { to: '/AdminDashboard/modules', icon: 'bi-folder-fill', label: 'Module' },
    { to: '/AdminDashboard/ticket', icon: 'bi-ticket-detailed', label: 'Tickets' },
    { to: '/AdminDashboard/postes', icon: 'bi-briefcase-fill', label: 'Postes' },
    { to: '/AdminDashboard/settings', icon: 'bi-gear-fill', label: 'Settings' },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        top: 56, // below a fixed-top navbar (height: 56px)
        left: 0,
        width: isCollapsed ? 80 : 250,
        height: 'calc(100vh - 56px)',
        background: '#343a40',
        color: 'white',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        zIndex: 1050,
      }}
    >
      <button
        onClick={() => setIsCollapsed(c => !c)}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: 24,
          padding: '0.5rem',
          display: 'block',
        }}
      >
        <i
          className={`bi ${isCollapsed ? 'bi-arrow-right-square' : 'bi-arrow-left-square'}`}
        />
      </button>

      <h3
        style={{
          fontSize: 18,
          textAlign: 'center',
          margin: '0.5rem 0 1rem',
          whiteSpace: 'nowrap',
          opacity: isCollapsed ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        
        <Link className="navbar-brand" to="/AdminDashboard">
          <strong className="admin-dashboard-link">Admin Dashboard</strong>
        </Link>
      </h3>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {navItems.map(({ to, icon, label }) => {
          const active = pathname === to
          return (
            <li key={to} style={{ margin: '0.5rem 0' }}>
              <Link
                to={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: active ? '#ffc107' : 'white',
                  padding: '0.5rem 1rem',
                  background: active ? 'rgba(255,193,7,0.15)' : 'transparent',
                  borderRadius: 4,
                }}
              >
                <i className={`bi ${icon}`} style={{ fontSize: 20 }} />
                <span
                  style={{
                    marginLeft: isCollapsed ? 0 : 12,
                    opacity: isCollapsed ? 0 : 1,
                    whiteSpace: 'nowrap',
                    transition: 'opacity 0.3s ease, margin 0.3s ease',
                  }}
                >
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
