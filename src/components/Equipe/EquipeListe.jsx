import React, { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa";
import authService from "../../services/authService";
import "bootstrap/dist/css/bootstrap.min.css";

const EquipeListe = () => {
  const [equipes, setEquipes] = useState([]);
  const [editEquipe, setEditEquipe] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredEquipes, setFilteredEquipes] = useState([]);

  useEffect(() => {
    fetchEquipes();
  }, []);

  const fetchEquipes = async () => {
    try {
      const data = await authService.getEquipes();
      setEquipes(data);
      setFilteredEquipes(data);
    } catch (err) {
      console.error("Erreur lors de la récupération des équipes", err);
    }
  };

  const handleEdit = (equipe) => {
    setEditEquipe({ ...equipe });
  };

  const handleDelete = async (id) => {
    try {
      await authService.deleteEquipe(id);
      const updated = equipes.filter((e) => e.id !== id);
      setEquipes(updated);
      setFilteredEquipes(updated);
    } catch (err) {
      console.error("Erreur lors de la suppression", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const updated = await authService.updateEquipe(editEquipe.id, editEquipe);
      const updatedList = equipes.map((e) =>
        e.id === editEquipe.id ? updated : e
      );
      setEquipes(updatedList);
      setFilteredEquipes(updatedList);
      setEditEquipe(null);
    } catch (err) {
      console.error("Erreur lors de la mise à jour", err);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = equipes.filter((e) =>
      (e.nomEquipe || "").toLowerCase().includes(value)
    );
    setFilteredEquipes(filtered);
  };
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(Number(timestamp));
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toISOString().split('T')[0]; // e.g. 2023-06-18
  };
  
  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Liste des Équipes</h2>

      {/* Search bar */}
      <div className="input-group mb-3">
        <span className="input-group-text">
          <FaSearch />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher une équipe..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nom Équipe</th>
              <th>Date de création</th>
              <th>Créée par</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipes.map((equipe) => (
              <tr key={equipe.id}>
                <td>{equipe.id}</td>
                <td>
                  {editEquipe && editEquipe.id === equipe.id ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editEquipe.nomEquipe}
                      onChange={(e) =>
                        setEditEquipe({ ...editEquipe, nomEquipe: e.target.value })
                      }
                    />
                  ) : (
                    equipe.nomEquipe
                  )}
                </td>
                <td>{formatDate(equipe.creationDate)}</td>
                <td>{equipe.creationUser}</td>
                <td>
                  {editEquipe && editEquipe.id === equipe.id ? (
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={handleUpdate}
                    >
                      Sauvegarder
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleEdit(equipe)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(equipe.id)}
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquipeListe;
