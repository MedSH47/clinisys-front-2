// src/components/Poste/PosteListe.jsx

import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  Collapse,
  Badge,
} from "react-bootstrap";
import {
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaUserPlus,
  FaTrash,
} from "react-icons/fa";
import authService from "../../services/authService";
import Leftside from "../nav/Leftside";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PosteListe() {
  const [postes, setPostes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [selectedUser, setSelectedUser] = useState({});

  // Load postes + all users
  useEffect(() => {
    (async () => {
      try {
        const [pData, uData] = await Promise.all([
          authService.getPostes(),  // you need a getPostes() method in authService
          authService.getUsers(),
        ]);
        setPostes(pData);
        setFiltered(pData);
        setUsers(uData);
      } catch (err) {
        console.error("Error loading postes/users", err);
      }
    })();
  }, []);

  const formatDate = (ts) =>
    ts ? new Date(Number(ts)).toLocaleDateString() : "N/A";

  const handleSearch = (e) => {
    const v = e.target.value.toLowerCase();
    setSearch(v);
    setFiltered(postes.filter((p) => p.designation.toLowerCase().includes(v)));
  };

  const toggle = (id) => setOpenId(openId === id ? null : id);

  // Assign user to poste
  const handleAssignUser = async (posteId) => {
    const userId = selectedUser[posteId];
    if (!userId) return alert("Choisissez un utilisateur.");
    try {
      const userDto = await authService.getUser(userId);
      userDto.idPoste = { id: posteId };
      await authService.updateUser(userId, userDto);
      // refresh
      const updated = await authService.getPostes();
      setPostes(updated);
      setFiltered(updated);
      setSelectedUser({ ...selectedUser, [posteId]: "" });
    } catch (err) {
      console.error(err);
      alert("Erreur affectation utilisateur");
    }
  };

  // Unassign user
  const handleUnassignUser = async (userId) => {
    if (!window.confirm("Retirer cet utilisateur de son poste ?")) return;
    try {
      const userDto = await authService.getUser(userId);
      userDto.idPoste = null;
      await authService.updateUser(userId, userDto);
      const updated = await authService.getPostes();
      setPostes(updated);
      setFiltered(updated);
    } catch (err) {
      console.error(err);
      alert("Erreur désaffectation utilisateur");
    }
  };

  return (
    <div className="d-flex">
      <Leftside />
      <div className="p-4 flex-grow-1" style={{ marginLeft: 250 ,marginTop:"50px"}}>
        
        <h1 className="mb-4 text-center">Gestion des Postes</h1>

        <InputGroup className="mb-4 shadow-sm">
          <InputGroup.Text className="bg-dark text-white">
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Rechercher un poste..."
            value={search}
            onChange={handleSearch}
            className="border-dark"
          />
        </InputGroup>

        <Row xs={1} md={2} lg={3} className="g-4">
          {filtered.map((poste) => (
            <Col key={poste.id}>
              <Card className="h-100 shadow border-0">
                <Card.Header className="d-flex align-items-center bg-success text-white">
                  <h5 className="mb-0 flex-grow-1">
                    {poste.designation}
                  </h5>
                  <Badge bg="light" text="dark">
                    #{poste.id}
                  </Badge>
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="ms-2"
                    onClick={() => toggle(poste.id)}
                  >
                    {openId === poste.id ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </Button>
                </Card.Header>

                <Card.Body>
                  <p className="text-muted">
                    Code : <strong>{poste.code}</strong>
                  </p>

                  <Collapse in={openId === poste.id}>
                    <div>
                      <h6>
                        <FaUserPlus className="me-2 text-secondary" />
                        Utilisateurs{" "}
                        <Badge bg="secondary">
                          {poste.utilisateurList?.length || 0}
                        </Badge>
                      </h6>

                      <div className="d-flex mb-2">
                        <Form.Select
                          size="sm"
                          value={selectedUser[poste.id] || ""}
                          onChange={(e) =>
                            setSelectedUser({
                              ...selectedUser,
                              [poste.id]: e.target.value,
                            })
                          }
                        >
                          <option value="">— Sélectionnez —</option>
                          {users
                            .filter(
                              (u) =>
                                !poste.utilisateurList?.some(
                                  (x) => x.id === u.id
                                )
                            )
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.login}
                              </option>
                            ))}
                        </Form.Select>
                        <Button
                          size="sm"
                          className="ms-2"
                          onClick={() => handleAssignUser(poste.id)}
                        >
                          Assigner
                        </Button>
                      </div>

                      {poste.utilisateurList?.map((u) => (
                        <div
                          key={u.id}
                          className="d-flex justify-content-between align-items-center border-bottom py-1"
                        >
                          <span>{u.login}</span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleUnassignUser(u.id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Collapse>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
