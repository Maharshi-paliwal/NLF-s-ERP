import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Pagination, // ⭐ ADDED
} from "react-bootstrap";
import { FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://nlfs.in/erp/index.php/Erp";

const Unit = () => {
  const [unitSearch, setUnitSearch] = useState("");
  const [unitName, setUnitName] = useState("");
  const [units, setUnits] = useState([]);
  const [unitLoading, setUnitLoading] = useState(false);
  const [unitSubmitting, setUnitSubmitting] = useState(false);

  // ⭐ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // ========== 1) LIST UNIT API (unit_list) ==========
  const fetchUnits = async () => {
    setUnitLoading(true);
    try {
      const formData = new FormData(); // no keyword → all units
      const res = await fetch(`${API_BASE}/unit_list`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("unit_list response:", data);

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        setUnits(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch units.");
      }
    } catch (err) {
      console.error("Error fetching units:", err);
      toast.error("Something went wrong while loading units.");
    } finally {
      setUnitLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // ========== 3) DELETE UNIT API (delete_unit) ==========
  const deleteUnit = async (UnitId) => {
    try {
      console.log("🛑 DELETE CLICKED → ID =", UnitId);
      console.log("📌 Current Units:", units);

      const res = await axios.post(
        "https://nlfs.in/erp/index.php/Api/delete_unit",
        { unit_id: UnitId },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("🟦 delete_unit RESPONSE:", res.data);

      if (res.data.success === 1 || res.data.status === "true") {
        toast.success("Unit deleted successfully");

        setUnits((prev) => {
          const filtered = prev.filter((u) => u.unit_id != UnitId);

          console.log("🟨 Before Delete:", prev);
          console.log("🟩 After Delete:", filtered);

          return filtered;
        });
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      console.error("❌ DELETE ERROR:", err);
      toast.error("Something went wrong");
    }
  };

  // Search filter (frontend)
  const filteredUnits = useMemo(() => {
    if (!unitSearch) return units;
    const s = unitSearch.toLowerCase();
    return units.filter((u) => (u.unit || "").toLowerCase().includes(s));
  }, [unitSearch, units]);

  // ⭐ PAGINATION BASED ON filteredUnits
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUnits = filteredUnits.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // ========== 2) ADD UNIT API (add_unit) ==========
  const handleAddUnit = async (e) => {
    e.preventDefault();

    if (!unitName.trim()) {
      toast.error("Please enter a unit.");
      return;
    }

    setUnitSubmitting(true);

    try {
      const payload = {
        unit: unitName.trim(), // { "unit": "quintal" }
      };

      const res = await fetch(`${API_BASE}/add_unit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("add_unit response:", data);

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        toast.success(data.message || "Unit added successfully.");
        setUnitName("");
        fetchUnits(); // refresh list
        setCurrentPage(1); // ⭐ Start from first page after adding
      } else {
        toast.error(data.message || "Failed to add unit.");
      }
    } catch (err) {
      console.error("Error adding unit:", err);
      toast.error("Something went wrong while adding the unit.");
    } finally {
      setUnitSubmitting(false);
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
                      value={unitSearch}
                      onChange={(e) => {
                        setUnitSearch(e.target.value);
                        setCurrentPage(1); // ⭐ reset page on search
                      }}
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
              {/* Add Unit Form (uses add_unit) */}
              <Form onSubmit={handleAddUnit} className="mb-3 d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Enter new unit (e.g. kg, pcs)"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                />
                <Button
                  type="submit"
                  className="btn btn-primary add-customer-btn"
                  disabled={unitSubmitting}
                >
                  {unitSubmitting ? (
                    "Adding..."
                  ) : (
                    <>
                      <FaPlus size={14} className="me-1" /> Add Unit
                    </>
                  )}
                </Button>
              </Form>

              {/* Units Table (data from unit_list) */}
              <div className="table-full-width table-responsive">
                {unitLoading ? (
                  <p className="text-center">Loading units...</p>
                ) : (
                  <>
                    <Table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Sr. No.</th>
                          <th>Unit</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentUnits.length > 0 ? (
                          currentUnits.map((u, index) => (
                            <tr key={u.unit_id || index}>
                              {/* ⭐ Sr no with pagination offset */}
                              <td>{indexOfFirstItem + index + 1}</td>
                              <td>{u.unit}</td>
                              <td>
                                 <Button
                                                              variant="danger"
                                                              size="sm"
                                                              onClick={() => deleteUnit(u.unit_id)}
                                                             
                                                            >
                                                              <FaTrash />
                                                            </Button>
                                
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center">
                              No units found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>

                    {/* ⭐ Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center p-3">
                        <Pagination>
                          <Pagination.First
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                          />
                          <Pagination.Prev
                            onClick={() =>
                              handlePageChange(currentPage - 1)
                            }
                            disabled={currentPage === 1}
                          />
                          {Array.from({ length: totalPages }, (_, i) => (
                            <Pagination.Item
                              key={i + 1}
                              active={i + 1 === currentPage}
                              onClick={() => handlePageChange(i + 1)}
                            >
                              {i + 1}
                            </Pagination.Item>
                          ))}
                          <Pagination.Next
                            onClick={() =>
                              handlePageChange(currentPage + 1)
                            }
                            disabled={currentPage === totalPages}
                          />
                          <Pagination.Last
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Unit;
