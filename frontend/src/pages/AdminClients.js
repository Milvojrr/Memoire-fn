import { useState, useEffect } from "react";
import { Container, Card, Table, Button, Modal, Form } from "react-bootstrap";
import API from "../services/api";

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ nom: "", email: "", password: "" });

  const fetchClients = async () => {
    try {
      const res = await API.get("/users/client");
      setClients(res.data);
    } catch (e) {
      console.error("Failed to fetch clients", e);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleShowModal = (client = null) => {
    if (client) {
      setEditMode(true);
      setCurrentId(client.id);
      setFormData({ nom: client.nom, email: client.email, password: "" });
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
        await API.put(`/users/${currentId}`, { ...formData, role: "client" });
      } else {
        await API.post("/users", { ...formData, role: "client" });
      }
      fetchClients();
      handleCloseModal();
    } catch (e) {
      console.error("Failed to save client", e);
      alert("Error saving client");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await API.delete(`/users/${id}`);
        fetchClients();
      } catch (e) {
        console.error("Failed to delete client", e);
        alert("Error deleting client");
      }
    }
  };

  return (
    <div className="min-vh-100 bg-body pb-5">
      <div className="bg-dark text-white py-4 shadow-sm mb-5">
        <Container>
          <h2 className="mb-0 fw-bold"><i className="bi bi-people-fill me-3 text-primary"></i> Manage Clients</h2>
        </Container>
      </div>
      <Container>
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-0">
            <div className="p-4 border-bottom bg-body-tertiary d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Clients List</h5>
              <Button variant="primary" onClick={() => handleShowModal()}>
                <i className="bi bi-person-plus-fill me-2"></i> Add Client
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
                  {clients.length ? clients.map(c => (
                    <tr key={c.id}>
                      <td className="fw-bold">#{c.id}</td>
                      <td>{c.nom}</td>
                      <td>{c.email}</td>
                      <td className="text-end">
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal(c)}>
                          <i className="bi bi-pencil-fill"></i> Edit
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(c.id)}>
                          <i className="bi bi-trash-fill"></i> Delete
                        </Button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="4" className="text-center py-4 text-muted">No clients found</td></tr>}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="bg-body-tertiary border-bottom-0">
            <Modal.Title className="fw-bold">{editMode ? "Edit Client" : "Add Client"}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="John Doe" value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{editMode ? "Password (leave blank to keep current)" : "Password"}</Form.Label>
              <Form.Control type="password" placeholder="***" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editMode} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="primary" type="submit">{editMode ? "Save Changes" : "Add Client"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
