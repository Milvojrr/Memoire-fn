import { useState, useEffect } from "react";
import { Container, Card, Table, Button, Modal, Form } from "react-bootstrap";
import API from "../services/api";

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ nom: "", email: "", password: "" });

  const fetchAgents = async () => {
    try {
      const res = await API.get("/users/agent");
      setAgents(res.data);
    } catch (e) {
      console.error("Failed to fetch agents", e);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleShowModal = (agent = null) => {
    if (agent) {
      setEditMode(true);
      setCurrentId(agent.id);
      setFormData({ nom: agent.nom, email: agent.email, password: "" });
    } else {
      setEditMode(false);
      setCurrentId(null);
      setFormData({ nom: "", email: "", password: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/users/${currentId}`, { ...formData, role: "agent" });
      } else {
        await API.post("/users", { ...formData, role: "agent" });
      }
      fetchAgents();
      handleCloseModal();
    } catch (e) {
      console.error("Failed to save agent", e);
      alert("Error saving agent");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      try {
        await API.delete(`/users/${id}`);
        fetchAgents();
      } catch (e) {
        console.error("Failed to delete agent", e);
        alert("Error deleting agent");
      }
    }
  };

  return (
    <div className="min-vh-100 bg-body pb-5">
      <div className="bg-dark text-white py-4 shadow-sm mb-5">
        <Container>
          <h2 className="mb-0 fw-bold"><i className="bi bi-headset me-3 text-primary"></i> Manage Agents</h2>
        </Container>
      </div>
      <Container>
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-0">
            <div className="p-4 border-bottom bg-body-tertiary d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Agents List</h5>
              <Button variant="primary" onClick={() => handleShowModal()}>
                <i className="bi bi-person-plus-fill me-2"></i> Add Agent
              </Button>
            </div>
            <div className="table-responsive p-3">
              <Table hover className="align-middle mb-0">
                <thead className="text-muted">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.length ? agents.map(a => (
                    <tr key={a.id}>
                      <td className="fw-bold">#{a.id}</td>
                      <td>{a.nom}</td>
                      <td>{a.email}</td>
                      <td className="text-end">
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal(a)}>
                          <i className="bi bi-pencil-fill"></i> Edit
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(a.id)}>
                          <i className="bi bi-trash-fill"></i> Delete
                        </Button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="4" className="text-center py-4 text-muted">No agents found</td></tr>}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="bg-body-tertiary border-bottom-0">
            <Modal.Title className="fw-bold">{editMode ? "Edit Agent" : "Add Agent"}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Jane Doe" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="jane@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{editMode ? "Password (leave blank to keep current)" : "Password"}</Form.Label>
              <Form.Control type="password" placeholder="***" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editMode} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">{editMode ? "Save Changes" : "Add Agent"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
