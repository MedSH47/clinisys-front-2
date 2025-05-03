// UserDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import authService from '../../services/authService';

const UserDetailPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
        
    } catch (error) {
        
    }
    res =authService.getUser(id)
  }, [id]);

  if (!user) return <p>Loading user details...</p>;

  return (
    <div>
      <h2>Full Details for {user.name}</h2>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Created At:</strong> {user.createdAt}</p>
      {/* Add more fields as needed */}
    </div>
  );
};

export default UserDetailPage;
