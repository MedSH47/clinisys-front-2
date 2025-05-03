import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAdmin({ children }) {
  const role = localStorage.getItem('userRole');

  if (role !== 'Admin') {
    return <Navigate to="/AccessDenied" replace/>;
  }

  return children;
}
