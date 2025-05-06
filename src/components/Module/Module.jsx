// src/components/Module/ModuleListe.jsx

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
  FaTicketAlt,
  FaPlusCircle,
  FaTrash,
} from "react-icons/fa";
import authService from "../../services/authService";
import Leftside from "../nav/Leftside";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ModuleListe() {
  const [modules, setModules] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState({});

  // Load modules + all tickets
  useEffect(() => {
    (async () => {
      try {
        const [mData, tData] = await Promise.all([
          authService.getModules(),
          authService.getAllTickets(),
        ]);
        setModules(mData);
        setFiltered(mData);
        setTickets(tData);
      } catch (err) {
        console.error("Error loading modules/tickets", err);
      }
    })();
  }, []);

  const formatDate = (ts) =>
    ts ? new Date(Number(ts)).toLocaleDateString() : "N/A";

  const handleSearch = (e) => {
    const v = e.target.value.toLowerCase();
    setSearch(v);
    setFiltered(modules.filter((m) =>
      m.designation.toLowerCase().includes(v)
    ));
  };

  const toggle = (id) => setOpenId(openId === id ? null : id);

  // Assign ticket to module
  const handleAssign = async (moduleId) => {
    const ticketId = selectedTicket[moduleId];
    if (!ticketId) return alert("Choisissez un ticket.");
    try {
      const dto = await authService.getTicket(ticketId);
      dto.idModule = { id: moduleId };
      await authService.updateTicket(ticketId, dto);
      // refresh
      const updated = await authService.getModules();
      setModules(updated);
      setFiltered(updated);
      setSelectedTicket({ ...selectedTicket, [moduleId]: "" });
    } catch (err) {
      console.error(err);
      alert("Erreur d'affectation de ticket");
    }
  };

  // Unassign ticket
  const handleUnassign = async (ticketId) => {
    if (!window.confirm("Retirer ce ticket de son module ?")) return;
    try {
      const dto = await authService.getTicket(ticketId);
      dto.idModule = null;
      await authService.updateTicket(ticketId, dto);
      const updated = await authService.getModules();
      setModules(updated);
      setFiltered(updated);
    } catch (err) {
      console.error(err);
      alert("Erreur de désaffectation");
    }
  };

  return (
    <div className="d-flex">
      <Leftside />
      <div className="p-4 flex-grow-1" style={{ marginLeft: 250 }}>
        <br />
        <br />
        <h1 className="mb-4 text-center">Gestion des Modules</h1>

        <InputGroup className="mb-4 shadow-sm">
          <InputGroup.Text className="bg-primary text-white">
            <FaSearch />
          </InputGroup.Text>
          <Form.Control
            placeholder="Rechercher un module..."
            value={search}
            onChange={handleSearch}
            className="border-primary"
          />
        </InputGroup>

        <Row xs={1} md={2} lg={3} className="g-4">
          {filtered.map((mod) => (
            <Col key={mod.id}>
              <Card className="h-100 shadow border-0">
                <Card.Header className="d-flex align-items-center bg-info text-white">
                  <h5 className="mb-0 flex-grow-1">{mod.designation}</h5>
                  <Badge bg="light" text="dark">#{mod.id}</Badge>
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="ms-2"
                    onClick={() => toggle(mod.id)}
                  >
                    {openId === mod.id ? <FaChevronUp /> : <FaChevronDown />}
                  </Button>
                </Card.Header>

                <Card.Body>
                  <p><strong>Code:</strong> {mod.code}</p>
                  <p>
                    <strong>Créé le:</strong> {formatDate(mod.creationDate)}
                  </p>
                  <p><strong>Par:</strong> {mod.creationUser}</p>

                  <Collapse in={openId === mod.id}>
                    <div className="mt-3">
                      <h6>
                        <FaTicketAlt className="me-2 text-secondary" />
                        Tickets <Badge bg="secondary">{mod.ticketList?.length||0}</Badge>
                      </h6>

                      <div className="d-flex mb-2">
                        <Form.Select
                          size="sm"
                          value={selectedTicket[mod.id]||""}
                          onChange={(e)=>setSelectedTicket({
                            ...selectedTicket,
                            [mod.id]: e.target.value
                          })}
                        >
                          <option value="">— Sélectionnez —</option>
                          {tickets
                            .filter(t=> !mod.ticketList?.some(x=>x.id===t.id))
                            .map(t=>(
                              <option key={t.id} value={t.id}>
                                #{t.numTicket} ({t.status})
                              </option>
                            ))
                          }
                        </Form.Select>
                        <Button
                          variant="success"
                          size="sm"
                          className="ms-2"
                          onClick={()=>handleAssign(mod.id)}
                        >
                          <FaPlusCircle /> Assigner
                        </Button>
                      </div>

                      {mod.ticketList?.length > 0 ? (
                        <table className="table table-bordered table-sm">
                          <thead>
                            <tr>
                              <th>ID</th><th>#</th><th>Status</th>
                              <th>Priorité</th><th>Échéance</th><th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mod.ticketList.map(t=>(
                              <tr key={t.id}>
                                <td>{t.id}</td>
                                <td>{t.numTicket}</td>
                                <td>{t.status}</td>
                                <td>{t.priorite}</td>
                                <td>{t.echeance}</td>
                                <td>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={()=>handleUnassign(t.id)}
                                  >
                                    <FaTrash />
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
