// UserDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import authService from '../../services/authService';

const UserDetailPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await authService.getUser(id);
        setUser(data);
      } catch (err) {
        console.error(err);
        setError(err.error || err.message || 'Failed to fetch user');
      }
    };
    fetchUser();
  }, [id]);

  if (error) return <p className="text-danger">Error: {error}</p>;
  if (!user) return <p>Loading user details...</p>;

  return (
    <div className="container mt-4">
      <h2>Full Details for {user.login}</h2>
      <ul className="list-group">
        <li className="list-group-item"><strong>ID:</strong> {user.id}</li>
        <li className="list-group-item"><strong>Login:</strong> {user.login}</li>
        <li className="list-group-item">
          <strong>Created At:</strong>{' '}
          {user.creationDate
            ? new Date(user.creationDate).toLocaleString()
            : 'N/A'}
        </li>
        <li className="list-group-item"><strong>Created By:</strong> {user.creationUser || 'N/A'}</li>
        <li className="list-group-item">
          <strong>Active:</strong> {user.actif ? 'Yes' : 'No'}
        </li>
        <li className="list-group-item"><strong>Role:</strong> {user.role}</li>
        <li className="list-group-item"><strong>Equip ID:</strong> {user.idEquip ?? 'N/A'}</li>
        <li className="list-group-item">
          <strong>Poste:</strong>{' '}
          {user.idPoste
            ? `${user.idPoste.designation} (ID: ${user.idPoste.id}, Code: ${user.idPoste.code})`
            : 'N/A'}
        </li>
        {user.idPoste?.utilisateurList && (
          <li className="list-group-item">
            <strong>Utilisateurs in Poste:</strong> {user.idPoste.utilisateurList.length}
          </li>
        )}
        {/* If utilisateurList is always null in your payload, you can omit that */}
      </ul>
    </div>
  );
};

export default UserDetailPage;
