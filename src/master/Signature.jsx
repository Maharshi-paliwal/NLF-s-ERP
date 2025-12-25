// src/Signaturemaster.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Pagination,
  Image,
  Modal,
} from "react-bootstrap";
import { FaPlus, FaSearch, FaTrash, FaUpload, FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

const ERP_API_BASE = "https://nlfs.in/erp/index.php/Api";
const ERP_DELETE_BASE = "https://nlfs.in/erp/index.php/Api";

const Signaturemaster = () => {
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(false);

  const [signatureSearch, setSignatureSearch] = useState("");
  const [signatureType, setSignatureType] = useState("");
  const [signatureName, setSignatureName] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fileInputRefs = useRef({});

  // ---------------- FETCH ----------------
  const fetchSignatures = async () => {
    setLoading(true);
    try {
      // Fixed: Changed from "list_signature" to "list_signiture"
      const res = await fetch(`${ERP_API_BASE}/list_signiture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.status && data.success === "1") {
        setSignatures(data.data || []);
        console.log("Fetched signatures:", data.data); // Debug log
      } else {
        toast.error(data.message || "Failed to fetch signatures");
      }
    } catch {
      toast.error("Error loading signatures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  // ---------------- ADD ----------------
  const handleAddSignature = async (e) => {
    e.preventDefault();

    if (!signatureName.trim()) {
      toast.error("Signature name is required");
      return;
    }

    const fd = new FormData();
    fd.append("signature_name", signatureName.trim());

    if (signatureType.trim()) {
      fd.append("signature_type", signatureType.trim());
    }

    if (selectedFile) {
      fd.append("signature_image", selectedFile);
    }

    try {
      // Fixed: Changed from "add_signature" to "add_signiture" (assuming similar typo)
      const res = await fetch(`${ERP_API_BASE}/add_signiture`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!data.status) {
        toast.error(data.message || "Failed to add signature");
        return;
      }

      toast.success(data.message || "Signature added successfully");

      // reset form
      setSignatureType("");
      setSignatureName("");
      setSelectedFile(null);
      setPreview(null);

      await fetchSignatures();
      setCurrentPage(1);
    } catch {
      toast.error("Something went wrong while adding signature");
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this signature?")) return;

    try {
      // Fixed: Changed from "delete_signature" to "delete_signiture" (assuming similar typo)
      const res = await fetch(`${ERP_DELETE_BASE}/delete_signiture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (data.status && data.success === "1") {
        toast.success("Signature deleted");
        setSignatures((prev) => prev.filter((s) => s.id !== id));
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch {
      toast.error("Delete error");
    }
  };

  // ---------------- UPDATE ----------------
  const handleUpdateSignature = async (e) => {
    e.preventDefault();

    if (!signatureName.trim()) {
      toast.error("Signature name is required");
      return;
    }

    const fd = new FormData();
    fd.append("id", editingId);
    fd.append("signature_name", signatureName.trim());
    
    if (signatureType.trim()) {
      fd.append("signature_type", signatureType.trim());
    }

    if (selectedFile) {
      fd.append("signature_image", selectedFile);
    }

    try {
      // Fixed: Changed from "update_signature" to "update_signiture" (assuming similar typo)
      const res = await fetch(`${ERP_API_BASE}/update_signiture`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!data.status) {
        toast.error(data.message || "Failed to update signature");
        return;
      }

      toast.success(data.message || "Signature updated successfully");

      // reset form
      setSignatureType("");
      setSignatureName("");
      setSelectedFile(null);
      setPreview(null);
      setEditingId(null);
      setShowEditModal(false);

      await fetchSignatures();
    } catch {
      toast.error("Something went wrong while updating signature");
    }
  };

  // ---------------- FILE HANDLER ----------------
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ---------------- EDIT HANDLER ----------------
  const handleEdit = (signature) => {
    setEditingId(signature.id);
    setSignatureType(signature.signature_type || "");
    setSignatureName(signature.signature_name || "");
    // Use the correct field name from API response
    setPreview(signature.image_url || signature.sign_img || null);
    setSelectedFile(null);
    setShowEditModal(true);
  };

  // ---------------- FILTER + PAGINATION ----------------
  const filtered = useMemo(() => {
    if (!signatureSearch) return signatures;
    return signatures.filter((s) =>
      (s.signature_name && s.signature_name.toLowerCase().includes(signatureSearch.toLowerCase())) ||
      (s.signature_type && s.signature_type.toLowerCase().includes(signatureSearch.toLowerCase()))
    );
  }, [signatureSearch, signatures]);

  const start = (currentPage - 1) * itemsPerPage;
  const current = filtered.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // ---------------- RENDER ----------------
  return (
    <Container fluid>
      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col><h4 className="fw-bold mt-3">Signature Management</h4></Col>
            <Col className="text-end">
              <Form.Control
                placeholder="Search signature..."
                value={signatureSearch}
                onChange={(e) => {
                  setSignatureSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: 300, display: "inline-block" }}
              />
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* ADD FORM */}
          <Form onSubmit={handleAddSignature} className="mb-4">
            <Row className="g-2 align-items-center">
              <Col md={3}>
                <Form.Select
                  value={signatureType}
                  onChange={(e) => setSignatureType(e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="company_stamp">Company Stamp</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Control
                  placeholder="Signature name"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                />
              </Col>

              <Col md={3}>
                <Form.Control type="file" accept="image/*" onChange={onFileChange} />
              </Col>

              <Col md={2}>
                <Button type="submit" className="add-customer-btn">
                  <FaPlus /> Add
                </Button>
              </Col>

              {preview && (
                <Col md={2}>
                  <img
                    src={preview}
                    alt="preview"
                    style={{ width: 100, height: 50, objectFit: "cover" }}
                  />
                </Col>
              )}
            </Row>
          </Form>

          {/* TABLE */}
          <Table striped hover>
            <thead>
              <tr>
                <th>Sr no</th>
                <th>Type</th>
                <th>Name</th>
                <th>Signature Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {current.map((s, i) => (
                <tr key={s.id}>
                  <td>{start + i + 1}</td>
                  <td>{s.signature_type || "—"}</td>
                  <td>{s.signature_name || "—"}</td>
                  <td>
                    {/* Use the correct field name from API response */}
                    {s.image_url || s.sign_img ? (
                      <Image
                        src={s.image_url || s.sign_img}
                        thumbnail
                        style={{ width: 120, height: 60, objectFit: "cover" }}
                      />
                    ) : "—"}
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="primary"
                      className="me-2"
                      onClick={() => handleEdit(s)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(s.id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </Card.Body>
      </Card>

      {/* EDIT MODAL */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Signature</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateSignature}>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={signatureType}
                onChange={(e) => setSignatureType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="company_stamp">Company Stamp</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                placeholder="Signature name"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Signature Image</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={onFileChange} />
              {preview && (
                <div className="mt-2">
                  <img
                    src={preview}
                    alt="preview"
                    style={{ width: 200, height: 100, objectFit: "cover" }}
                  />
                </div>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Signaturemaster;