// src/User.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
} from "react-bootstrap";
import { FaPlus, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";

// ⚙️ API BASE for Unit Master
const API_BASE = "https://nlfs.in/erp/index.php/Erp";

export default function User() {
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // ---------------- FETCH UNIT LIST (with optional search) ----------------
  const fetchUnits = async (keyword = "") => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (keyword) {
        formData.append("keyword", keyword); // as per sheet: { "keyword": "..." }
      }

      const res = await fetch(`${API_BASE}/unit_list`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("unit_list response:", data);

      if (data.status && data.success === "1") {
        setUnits(data.data || []);
      } else {
        setUnits([]);
        toast.error(data.message || "Failed to fetch units.");
      }
    } catch (err) {
      console.error("Error fetching units:", err);
      toast.error("Something went wrong while loading units.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load (no keyword)
    fetchUnits();
  }, []);

  // 🔍 search using backend API (Unit list and search)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchUnits(value);
  };

  // ---------------- ADD UNIT ----------------
  const handleAddUnit = async (e) => {
    e.preventDefault();

    const trimmed = newUnit.trim();
    if (!trimmed) {
      toast.error("Please enter a unit.");
      return;
    }

    setAdding(true);
    try {
      const formData = new FormData();
      // as per sheet: { "unit": "10" }
      formData.append("unit", trimmed);

      const res = await fetch(`${API_BASE}/add_unit`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("add_unit response:", data);

      if (data.status && data.success === "1") {
        toast.success(data.message || "Unit inserted successfully");
        setNewUnit("");
        setShowAddForm(false);
        // reload list with current search term
        fetchUnits(searchTerm);
      } else {
        toast.error(data.message || "Failed to add unit.");
      }
    } catch (err) {
      console.error("Error adding unit:", err);
      toast.error("Something went wrong while adding unit.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header
              style={{ backgroundColor: "#fff", borderBottom: "none" }}
            >
              <Row className="align-items-center">
                <Col>
                  <Card.Title
                    style={{
                      marginTop: "2rem",
                      fontWeight: "700",
                    }}
                  >
                    Unit Master
                  </Card.Title>
                </Col>

                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search unit..."
                      value={searchTerm}
                      onChange={handleSearchChange}
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

                  <Button
                    className="btn btn-primary add-customer-btn"
                    style={{ width: "10vw" }}
                    onClick={() => setShowAddForm((prev) => !prev)}
                  >
                    <FaPlus size={14} className="me-1" /> Add Unit
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="table-full-width table-responsive">
              {/* Add Unit Form */}
              {showAddForm && (
                <Form onSubmit={handleAddUnit} className="mb-3">
                  <Row className="align-items-end">
                    <Col md={4}>
                      <Form.Group controlId="unitName">
                        <Form.Label>Unit</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter unit (e.g. kg, pcs)"
                          value={newUnit}
                          onChange={(e) => setNewUnit(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="auto">
                      <Button
                        type="submit"
                        disabled={adding}
                        className="btn btn-success mt-3"
                      >
                        {adding ? "Saving..." : "Save Unit"}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}

              {loading ? (
                <p className="text-center">Loading units...</p>
              ) : (
                <Table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((item, index) => (
                      <tr key={item.unit_id || index}>
                        <td>{index + 1}</td>
                        <td>{item.unit}</td>
                      </tr>
                    ))}

                    {units.length === 0 && (
                      <tr>
                        <td colSpan="2" className="text-center">
                          No units found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}