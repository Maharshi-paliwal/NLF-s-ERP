import React, { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Table,
  Pagination,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import { FaEdit, FaPlus } from "react-icons/fa";

/* ───────────────────────── APIs ───────────────────────── */
const ERP_API_BASE = "https://nlfs.in/erp/index.php/Erp";
const ERP_API_MATERIAL = "https://nlfs.in/erp/index.php/Api";

export default function AllRawMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const itemsPerPage = 10;

  /* ───────── Edit Modal ───────── */
  const [editModal, setEditModal] = useState({
    show: false,
    material: null,
    newQuantity: "",
  });

  /* ───────── Add Modal ───────── */
  const [addModal, setAddModal] = useState({
    show: false,
    name: "",
    qty: "",
    unit: "",
  });

  /* ───────── Success Modal ───────── */
  const [successModal, setSuccessModal] = useState({
    show: false,
    message: "",
  });

  /* ─────────────────────────
     FETCH MATERIAL LIST
  ───────────────────────── */
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ERP_API_BASE}/material_list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.status && data.success === "1") {
        setMaterials(data.data || []);
      } else {
        toast.error(data.message || "Failed to load materials");
      }
    } catch (err) {
      toast.error("Error fetching materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  /* ─────────────────────────
     FILTER + SORT
  ───────────────────────── */
  const filteredMaterials = useMemo(() => {
    const s = search.toLowerCase();
    return materials
      .filter((m) => m.name?.toLowerCase().includes(s))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [materials, search]);

  /* ─────────────────────────
     PAGINATION
  ───────────────────────── */
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredMaterials.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);

  /* ─────────────────────────
     EDIT MATERIAL
  ───────────────────────── */
  const openEditModal = (mat) => {
    setEditModal({
      show: true,
      material: mat,
      newQuantity: mat.qty,
    });
  };

  const saveUpdatedQty = async () => {
    const qty = Number(editModal.newQuantity);
    if (!qty || qty < 0) {
      toast.error("Enter valid quantity");
      return;
    }

    try {
      const res = await fetch(`${ERP_API_MATERIAL}/update_material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editModal.material.id,
          qty,
        }),
      });

      const data = await res.json();

      if (data.status && data.success === "1") {
        fetchMaterials();
        setEditModal({ show: false, material: null, newQuantity: "" });
        setSuccessModal({
          show: true,
          message: `${editModal.material.name} updated successfully`,
        });
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch {
      toast.error("Error updating material");
    }
  };

  /* ─────────────────────────
     ADD MATERIAL
  ───────────────────────── */
  const addMaterial = async () => {
    const { name, qty, unit } = addModal;

    if (!name.trim() || !qty || !unit.trim()) {
      toast.error("All fields required");
      return;
    }

    try {
      const res = await fetch(`${ERP_API_BASE}/add_material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          qty: Number(qty),
          unit: unit.trim(),
        }),
      });

      const data = await res.json();

      if (data.status && data.success === "1") {
        fetchMaterials();
        setAddModal({ show: false, name: "", qty: "", unit: "" });
        setCurrentPage(1);
        setSuccessModal({
          show: true,
          message: `Material "${name}" added successfully`,
        });
      } else {
        toast.error(data.message || "Failed to add material");
      }
    } catch {
      toast.error("Error adding material");
    }
  };

  /* ───────────────────────── RENDER ───────────────────────── */
  return (
    <Container fluid>
      <Card>
        <Card.Header className="bg-white border-0">
          <Row className="align-items-center">
            <Col>
              <Card.Title style={{ marginTop: "2rem", fontWeight: 700 }}>
                Materials
              </Card.Title>
            </Col>
            <Col className="d-flex justify-content-end gap-2">
              <Form.Control
                placeholder="Search material..."
                style={{ width: "20vw" }}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Button
                className="add-customer-btn"
                onClick={() =>
                  setAddModal({ show: true, name: "", qty: "", unit: "" })
                }
              >
                <FaPlus className="me-1" /> Add Material
              </Button>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Sr No</th>
                  <th>Material</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length ? (
                  currentItems.map((m, i) => (
                    <tr key={m.id}>
                      <td>{indexFirst + i + 1}</td>
                      <td>{m.name}</td>
                      <td>{m.qty}</td>
                      <td>{m.unit}</td>
                      <td>
                        <Button size="sm" onClick={() => openEditModal(m)}>
                          <FaEdit />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No materials found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === currentPage}
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
      <Modal show={editModal.show} onHide={() => setEditModal({ show: false })}>
        <Modal.Header closeButton>
          <Modal.Title>Update Quantity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="number"
            value={editModal.newQuantity}
            onChange={(e) =>
              setEditModal((p) => ({ ...p, newQuantity: e.target.value }))
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModal({ show: false })}>
            Cancel
          </Button>
          <Button className="add-customer-btn" onClick={saveUpdatedQty}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ADD MODAL */}
      <Modal show={addModal.show} onHide={() => setAddModal({ show: false })}>
        <Modal.Header closeButton>
          <Modal.Title>Add Material</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            className="mb-2"
            placeholder="Material name"
            value={addModal.name}
            onChange={(e) =>
              setAddModal((p) => ({ ...p, name: e.target.value }))
            }
          />
          <Form.Control
            className="mb-2"
            placeholder="Unit"
            value={addModal.unit}
            onChange={(e) =>
              setAddModal((p) => ({ ...p, unit: e.target.value }))
            }
          />
          <Form.Control
            type="number"
            placeholder="Quantity"
            value={addModal.qty}
            onChange={(e) =>
              setAddModal((p) => ({ ...p, qty: e.target.value }))
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAddModal({ show: false })}>
            Cancel
          </Button>
          <Button className="add-customer-btn" onClick={addMaterial}>
            <FaPlus className="me-1" /> Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal
        show={successModal.show}
        onHide={() => setSuccessModal({ show: false, message: "" })}
        centered
      >
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center text-success">
          {successModal.message}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => setSuccessModal({ show: false, message: "" })}
          >
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
