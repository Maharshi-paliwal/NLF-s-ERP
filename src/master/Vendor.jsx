import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

const API_BASE = "https://nlfs.in/erp/index.php/Api";

export default function VendorMaster() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({ vender_name: "" });
  const [editId, setEditId] = useState(null); // ID being edited, or null for add mode

  // Fetch vendor list
  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_BASE}/list_mst_vender`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch vendors");
      const data = await response.json();
      // Adjust based on actual API response structure
      setVendors(Array.isArray(data) ? data : data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleInputChange = (e) => {
    const { value } = e.target;
    
    // Logic to capitalize the first letter of each word
    // \b matches a word boundary, \w matches the first character after the boundary
    const capitalizedValue = value.replace(/\b\w/g, (char) => char.toUpperCase());
    
    setForm({ vender_name: capitalizedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vender_name.trim()) return;

    try {
      let response;
      if (editId) {
        // Update
        response = await fetch(`${API_BASE}/update_mst_vender`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, vender_name: form.vender_name }),
        });
      } else {
        // Add
        response = await fetch(`${API_BASE}/add_mst_vender`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vender_name: form.vender_name }),
        });
      }

      if (!response.ok) throw new Error(editId ? "Failed to update vendor" : "Failed to add vendor");

      setSuccess(editId ? "Vendor updated successfully!" : "Vendor added successfully!");
      setForm({ vender_name: "" });
      setEditId(null);
      fetchVendors();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    }
  };

  const handleEdit = (vendor) => {
    setForm({ vender_name: vendor.vender_name });
    setEditId(vendor.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const response = await fetch(`${API_BASE}/delete_mst_vender`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete vendor");

      setSuccess("Vendor deleted successfully!");
      fetchVendors();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setForm({ vender_name: "" });
    setEditId(null);
  };

  return (
    <Container fluid className="my-4">
      <Card>
        <Card.Header>
          <Card.Title as="h4">{editId ? "Edit Vendor" : "Add New Vendor"}</Card.Title>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row className="align-items-end">
              <Col md="10">
                <Form.Group className="mb-3">
                  <Form.Label>Vendor Name *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter vendor name"
                    value={form.vender_name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md="2" className="d-flex gap-2 mb-3">
                <Button
                  type="submit"
                  variant="primary"
                  style={{ backgroundColor: "#ed3131", border: "none" }}
                  className="w-25"
                  title={editId ? "Update Vendor" : "Add Vendor"}
                >
                  {editId ? <FaEdit /> : <FaPlus />}
                </Button>
                {editId && (
                  <Button variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <Card.Title as="h4">Vendor List</Card.Title>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <p className="text-center">Loading vendors...</p>
          ) : error && !vendors.length ? (
            <Alert variant="warning text-center">No vendors found. {error}</Alert>
          ) : (
            <Table striped bordered hover responsive className="text-center">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vendor Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length > 0 ? (
                  vendors.map((vendor) => (
                    <tr key={vendor.id || vendor.vender_id}>
                      <td>{vendor.id || vendor.vender_id}</td>
                      <td>{vendor.vender_name || vendor.vendor_name}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            className="buttonEye"
                            onClick={() => handleEdit(vendor)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(vendor.id || vendor.vender_id)}
                          >
                            <FaTrash/>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No vendors available.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}