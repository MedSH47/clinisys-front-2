import React, { useEffect, useState } from "react";
import {
  FaTrash,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaUserPlus,
  FaTicketAlt,
} from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import authService from "../../services/authService";
import "bootstrap/dist/css/bootstrap.min.css";
import Leftside from "../nav/Leftside";

export default function EquipeListe() {
  const [equipes, setEquipes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // track selected user & ticket per équipe
  const [selectedUser, setSelectedUser] = useState({});
  const [selectedTicket, setSelectedTicket] = useState({});

  useEffect(() => {
    (async () => {
      const eqs = await authService.getEquipes();
      const uss = await authService.getUsers();
      const tks = await authService.getAllTickets();
      setEquipes(eqs);
      setFiltered(eqs);
      setUsers(uss);
      setTickets(tks);
    })();
  }, []);

  const formatDate = (ts) =>
    ts ? new Date(Number(ts)).toISOString().split("T")[0] : "N/A";

  const toggleExpand = (id) =>
    setExpandedId(expandedId === id ? null : id);

  const handleSearch = (e) => {
    const v = e.target.value.toLowerCase();
    setSearch(v);
    setFiltered(equipes.filter((eq) =>
      eq.nomEquipe.toLowerCase().includes(v)
    ));
  };

  // === USER ASSIGN/UNASSIGN ===

  const handleAddUser = async (equipeId) => {
    const userId = selectedUser[equipeId];
    if (!userId) return alert("Choisissez un utilisateur.");
    const userDto = await authService.getUser(userId);
    userDto.idEquip = { id: equipeId };
    await authService.updateUser(userId, userDto);
    const eqs = await authService.getEquipes();
    setEquipes(eqs);
    setFiltered(eqs);
    setSelectedUser({ ...selectedUser, [equipeId]: "" });
  };

  const handleUnassignUser = async (userId) => {
    if (!window.confirm("Retirer cet utilisateur ?")) return;
    const dto = await authService.getUser(userId);
    dto.idEquip = null;
    await authService.updateUser(userId, dto);
    const eqs = await authService.getEquipes();
    setEquipes(eqs);
    setFiltered(eqs);
  };

  // === TICKET ASSIGN/UNASSIGN ===

  const handleAssignTicket = async (equipeId) => {
    const ticketId = selectedTicket[equipeId];
    if (!ticketId) return alert("Choisissez un ticket.");
    const ticketDto = await authService.getTicket(ticketId);
    ticketDto.idEquip = { id: equipeId };
    await authService.updateTicket(ticketId, ticketDto);
    const eqs = await authService.getEquipes();
    setEquipes(eqs);
    setFiltered(eqs);
    setSelectedTicket({ ...selectedTicket, [equipeId]: "" });
  };

  const handleUnassignTicket = async (ticketId) => {
    if (!window.confirm("Retirer ce ticket ?")) return;
    const t = await authService.getTicket(ticketId);
    t.idEquip = null;
    await authService.updateTicket(ticketId, t);
    const eqs = await authService.getEquipes();
    setEquipes(eqs);
    setFiltered(eqs);
  };

  return (
    <div style={{ display: "flex" }}>
      <Leftside />
      <div className="container mt-5" style={{ marginLeft: 250, width: "100%" }}>
        <h2 className="text-center">Liste des Équipes</h2>

        {/* Search */}
        <div className="input-group my-3">
          <span className="input-group-text"><FaSearch/></span>
          <input
            className="form-control"
            placeholder="Rechercher..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Créée le</th>
                <th>Par</th>
                <th>Voir</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((eq) => (
                <React.Fragment key={eq.id}>
                  <tr>
                    <td>{eq.id}</td>
                    <td>{eq.nomEquipe}</td>
                    <td>{formatDate(eq.creationDate)}</td>
                    <td>{eq.creationUser}</td>
                    <td>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => toggleExpand(eq.id)}
                      >
                        {expandedId === eq.id ? <FaChevronUp/> : <FaChevronDown/>}
                      </button>
                    </td>
                  </tr>

                  {expandedId === eq.id && (
                    <tr>
                      <td colSpan={5}>
                        {/* TICKETS */}
                        <div className="mb-4">
                          <h5>
                            Tickets <FaTicketAlt className="ms-2" />
                          </h5>
                          <div className="d-flex mb-2">
                            <Form.Select
                              value={selectedTicket[eq.id]||""}
                              onChange={(e)=>setSelectedTicket({
                                ...selectedTicket,
                                [eq.id]: e.target.value
                              })}
                            >
                              <option value="">— Sélectionnez —</option>
                              {tickets
                                .filter(t=>
                                  !eq.ticketList?.some(x=>x.id===t.id)
                                )
                                .map(t=>(
                                  <option key={t.id} value={t.id}>
                                    #{t.numTicket} ({t.status})
                                  </option>
                                ))}
                            </Form.Select>
                            <Button
                              className="ms-2"
                              onClick={()=>handleAssignTicket(eq.id)}
                            >
                              Assigner
                            </Button>
                          </div>

                          {eq.ticketList?.length ? (
                            <table className="table table-bordered table-sm">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>#</th>
                                  <th>Status</th>
                                  <th>Priorité</th>
                                  <th>Échéance</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {eq.ticketList.map(t=>(
                                  <tr key={t.id}>
                                    <td>{t.id}</td>
                                    <td>{t.numTicket}</td>
                                    <td>{t.status}</td>
                                    <td>{t.priorite}</td>
                                    <td>{t.echeance}</td>
                                    <td>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={()=>handleUnassignTicket(t.id)}
                                      >
                                        <FaTrash/>
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>Aucun ticket assigné.</p>
                          )}
                        </div>

                        {/* USERS */}
                        <div>
                          <h5>
                            Utilisateurs <FaUserPlus className="ms-2" />
                          </h5>
                          <div className="d-flex mb-2">
                            <Form.Select
                              value={selectedUser[eq.id]||""}
                              onChange={(e)=>setSelectedUser({
                                ...selectedUser,
                                [eq.id]: e.target.value
                              })}
                            >
                              <option value="">— Sélectionnez —</option>
                              {users
                                .filter(u=>
                                  !eq.utilisateurList?.some(x=>x.id===u.id)
                                )
                                .map(u=>(
                                  <option key={u.id} value={u.id}>
                                    {u.login}
                                  </option>
                                ))}
                            </Form.Select>
                            <Button
                              className="ms-2"
                              onClick={()=>handleAddUser(eq.id)}
                            >
                              Assigner
                            </Button>
                          </div>

                          {eq.utilisateurList?.length ? (
                            <table className="table table-bordered table-sm">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Login</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {eq.utilisateurList.map(u=>(
                                  <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.login}</td>
                                    <td>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={()=>handleUnassignUser(u.id)}
                                      >
                                        <FaTrash/>
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>Aucun utilisateur assigné.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
