// src/pages/Stage.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Pagination,   // ✅ ADDED
} from "react-bootstrap";
import { FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const API_BASE = "https://nlfs.in/erp/index.php/Erp";

const Stage = () => {
  const [stageSearch, setStageSearch] = useState("");
  const [stageName, setStageName] = useState("");
  const [stages, setStages] = useState([]);
  const [stageLoading, setStageLoading] = useState(false);
  const [stageSubmitting, setStageSubmitting] = useState(false);

  // ----------------------------------------------------
  // ✅ PAGINATION STATES
  // ----------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ========== LIST STAGE ==========
  const fetchStages = async () => {
    setStageLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stage_list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        setStages(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch stages.");
      }
    } catch (err) {
      toast.error("Something went wrong while loading stages.");
    } finally {
      setStageLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  // ========== DELETE STAGE ==========
  const handleDeleteStage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stage?")) return;

    try {
      const res = await fetch("https://nlfs.in/erp/index.php/Api/delete_stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id.toString() }),
      });

      const data = await res.json();

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        toast.success("Stage deleted successfully");
        fetchStages();
      } else {
        toast.error(data.message || "Failed to delete stage");
      }
    } catch (err) {
      toast.error("Error deleting stage.");
    }
  };

  // ========== SEARCH FILTER ==========
  const filteredStages = useMemo(() => {
    if (!stageSearch) return stages;
    const s = stageSearch.toLowerCase();
    return stages.filter((st) => (st.name || "").toLowerCase().includes(s));
  }, [stageSearch, stages]);

  // ----------------------------------------------------
  // ✅ PAGINATION LOGIC
  // ----------------------------------------------------
  const totalPages = Math.ceil(filteredStages.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredStages.slice(indexFirst, indexLast);

  const paginate = (page) => setCurrentPage(page);

  // ========== ADD STAGE ==========
  const handleAddStage = async (e) => {
    e.preventDefault();

    if (!stageName.trim()) {
      toast.error("Please enter a stage name.");
      return;
    }

    setStageSubmitting(true);

    try {
      const payload = { name: stageName.trim() };

      const res = await fetch(`${API_BASE}/add_stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        toast.success("Stage added successfully.");
        setStageName("");
        fetchStages();
      } else {
        toast.error(data.message || "Failed to add stage.");
      }
    } catch (err) {
      toast.error("Something went wrong while adding the stage.");
    } finally {
      setStageSubmitting(false);
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
                  <Card.Title
                    style={{
                      marginTop: "2rem",
                      fontWeight: "700",
                    }}
                  >
                    Stage Master
                  </Card.Title>
                </Col>

                {/* Search */}
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search stage..."
                      value={stageSearch}
                      onChange={(e) => setStageSearch(e.target.value)}
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
              {/* Add Stage Form */}
              <Form onSubmit={handleAddStage} className="mb-3 d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Enter new stage"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                />

                <Button
                  type="submit"
                  className="btn btn-primary add-customer-btn"
                  disabled={stageSubmitting}
                >
                  {stageSubmitting ? "Adding..." : <>
                    <FaPlus size={14} className="me-1" /> Add Stage
                  </>}
                </Button>
              </Form>

              {/* Stage Table */}
              <div className="table-full-width table-responsive">
                {stageLoading ? (
                  <p className="text-center">Loading stages...</p>
                ) : (
                  <Table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Stage</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentItems.map((st, index) => (
                        <tr key={st.id}>
                          <td>{indexFirst + index + 1}</td>
                          <td>{st.name}</td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteStage(st.id)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}

                      {filteredStages.length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center">
                            No stages found.
                          </td>
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
    </Container>
  );
};

export default Stage;