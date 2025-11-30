// src/Material.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Modal,
  Pagination,   // ✅ Added Pagination
} from "react-bootstrap";
import { FaEdit, FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const ERP_API_BASE = "https://nlfs.in/erp/index.php/Erp";   
const ERP_API_MATERIAL = "https://nlfs.in/erp/index.php/Api";

const Material = () => {
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [modalQty, setModalQty] = useState("");

  const [qtyOptions, setQtyOptions] = useState([]);
  const [qtyLoading, setQtyLoading] = useState(false);

  // ----------------------------------------------------
  // ✅ PAGINATION STATES
  // ----------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // -------- FETCH MATERIAL LIST --------
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
        toast.error(data.message || "Failed to fetch materials.");
      }
    } catch (err) {
      toast.error("Error fetching materials.");
    } finally {
      setLoading(false);
    }
  };

  // -------- FETCH UNIT LIST --------
  const fetchQtyOptions = async () => {
    setQtyLoading(true);
    try {
      const res = await fetch(`${ERP_API_BASE}/unit_list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.status && data.success === "1") {
        setQtyOptions(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch qty options.");
      }
    } catch (err) {
      toast.error("Error fetching qty options.");
    } finally {
      setQtyLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchQtyOptions();
  }, []);

  // -------- FILTER SEARCH --------
  const filteredMaterials = useMemo(() => {
    if (!materialSearch) return materials;
    const s = materialSearch.toLowerCase();

    return materials.filter((m) => {
      const name = m.name?.toLowerCase() || "";
      const qtyStr = (m.qty ?? "").toString().toLowerCase();
      const unitStr = m.unit?.toLowerCase() || "";
      return name.includes(s) || qtyStr.includes(s) || unitStr.includes(s);
    });
  }, [materialSearch, materials]);

  // ----------------------------------------------------
  // ✅ PAGINATION CALCULATION
  // ----------------------------------------------------
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredMaterials.slice(indexFirst, indexLast);

  const paginate = (page) => setCurrentPage(page);

  // -------- ADD MATERIAL --------
  const handleAddMaterial = async (e) => {
    e.preventDefault();

    if (!materialName.trim()) return toast.error("Enter material name.");
    if (!qty) return toast.error("Select unit.");
    if (!unit.trim()) return toast.error("Enter quantity.");

    setSubmitting(true);

    try {
      const payload = {
        name: materialName.trim(),
        qty: Number(qty),
        unit: unit.trim(),
      };

      const res = await fetch(`${ERP_API_BASE}/add_material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status && data.success === "1") {
        toast.success("Material added.");
        setMaterialName("");
        setQty("");
        setUnit("");
        fetchMaterials();
      } else {
        toast.error(data.message || "Failed to add material.");
      }
    } catch (err) {
      toast.error("Error adding material.");
    } finally {
      setSubmitting(false);
    }
  };

  // -------- DELETE MATERIAL --------
  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      setDeletingId(id);

      const res = await fetch(`${ERP_API_MATERIAL}/delete_material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (data.status && data.success === "1") {
        toast.success("Material deleted.");
        setMaterials((prev) => prev.filter((m) => m.id !== id));
      } else {
        toast.error(data.message || "Failed to delete.");
      }
    } catch (err) {
      toast.error("Error deleting material.");
    } finally {
      setDeletingId(null);
    }
  };

  // -------- UPDATE MODAL --------
  const openUpdateModal = (mat) => {
    setSelectedMaterial(mat);
    setModalQty(mat.qty ?? "");
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedMaterial(null);
    setModalQty("");
  };

  const handleSaveUpdatedQty = async () => {
    if (!selectedMaterial) return;
    if (!modalQty) return toast.error("Select quantity.");

    const id = selectedMaterial.id;

    try {
      setUpdatingId(id);

      const payload = { id, qty: Number(modalQty) };

      const res = await fetch(`${ERP_API_MATERIAL}/update_material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status && data.success === "1") {
        toast.success("Updated successfully.");
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, qty: modalQty } : m
          )
        );
        closeUpdateModal();
      } else {
        toast.error(data.message || "Update failed.");
      }
    } catch (err) {
      toast.error("Error updating material.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
              <Row className="align-items-center">
                <Col>
                  <Card.Title style={{ marginTop: "2rem", fontWeight: "700" }}>
                    Material Master
                  </Card.Title>
                </Col>

                {/* Search */}
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search material, qty, unit..."
                      value={materialSearch}
                      onChange={(e) => setMaterialSearch(e.target.value)}
                      style={{ width: "20vw", paddingRight: "35px" }}
                    />
                    <FaSearch
                      className="position-absolute"
                      style={{
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#999",
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              {/* Add Material Form */}
              <Form onSubmit={handleAddMaterial} className="mb-3 d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Material name"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                />

                <Form.Select
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                >
                  <option value="">Select unit</option>
                  {qtyLoading && <option>Loading...</option>}
                  {!qtyLoading &&
                    qtyOptions.map((opt) => (
                      <option key={opt.unit_id} value={opt.unit}>
                        {opt.unit}
                      </option>
                    ))}
                </Form.Select>

                <Form.Control
                  type="text"
                  placeholder="quantity (e.g. Bags, Kg)"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />

                <Button
                  type="submit"
                  className="btn btn-primary add-customer-btn"
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : <>
                    <FaPlus size={14} className="me-1" /> Add Material
                  </>}
                </Button>
              </Form>

              {/* Material Table */}
              <div className="table-full-width table-responsive">
                {loading ? (
                  <p className="text-center">Loading materials...</p>
                ) : (
                  <Table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Name</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentItems.map((mat, index) => (
                        <tr key={mat.id}>
                          <td>{indexFirst + index + 1}</td>
                          <td>{mat.name}</td>
                          <td>{mat.qty}</td>
                          <td>{mat.unit}</td>
                          <td>
                            <Button
                              size="sm"
                              className="me-2"
                              onClick={() => openUpdateModal(mat)}
                              disabled={updatingId === mat.id}
                            >
                              <FaEdit />
                            </Button>

                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteMaterial(mat.id)}
                              disabled={deletingId === mat.id}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {filteredMaterials.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center">No materials found.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                )}
              </div>

              {/* ------------------------------------------------ */}
              {/* ✅ PAGINATION UI (NO DESIGN CHANGE) */}
              {/* ------------------------------------------------ */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-3">
                  <Pagination>
                    <Pagination.First
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    />

                    {Array.from({ length: totalPages }, (_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={currentPage === i + 1}
                        onClick={() => paginate(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}

                    <Pagination.Next
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />

                    <Pagination.Last
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}

            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Update Qty Modal */}
      <Modal show={showUpdateModal} onHide={closeUpdateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Update Quantity {selectedMaterial ? ` - ${selectedMaterial.name}` : ""}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>Quantity</Form.Label>
            <Form.Select
              value={modalQty}
              onChange={(e) => setModalQty(e.target.value)}
            >
              <option value="">Select Qty</option>
              {qtyOptions.map((opt) => (
                <option key={opt.unit_id} value={opt.unit}>
                  {opt.unit}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeUpdateModal}>
            Cancel
          </Button>
          <Button
            className="add-customer-btn"
            onClick={handleSaveUpdatedQty}
            disabled={updatingId === selectedMaterial?.id}
          >
            {updatingId === selectedMaterial?.id ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Material;