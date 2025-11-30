// src/Department.jsx → Department Master
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Pagination,
} from "react-bootstrap"; // ✅ Pagination added
import { FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "https://nlfs.in/erp/index.php/Erp";

const Department = () => {
  const [deptSearch, setDeptSearch] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptSubmitting, setDeptSubmitting] = useState(false);

  const navigate = useNavigate();

  // ----------------------------------------------------
  // ✅ PAGINATION STATES
  // ----------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ========== 1) LIST + SEARCH DEPARTMENT API ==========  
  const fetchDepartments = async (keyword = "") => {
    setDeptLoading(true);
    try {
      const payload = keyword ? { keyword } : {};

      const res = await fetch(`${API_BASE}/department_list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        setDepartments(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch departments.");
      }
    } catch (err) {
      toast.error("Something went wrong while loading departments.");
    } finally {
      setDeptLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments("");
  }, []);

  // Delete Department
  const deleteUnit = async (UnitId) => {
    try {
      const response = await axios.post(
        "https://nlfs.in/erp/index.php/Api/delete_department",
        { dpt_id: UnitId },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success === "1") {
        setDepartments((prev) =>
          prev.filter((dept) => dept.dpt_id !== UnitId)
        );
        toast.success(response.data.message || "Deleted successfully");
      } else {
        toast.error(response.data.error || "Failed to delete data!");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  // Search by API
  const handleDeptSearchChange = (e) => {
    const value = e.target.value;
    setDeptSearch(value);
    fetchDepartments(value.trim());
  };

  // Add Department
  const handleAddDepartment = async (e) => {
    e.preventDefault();

    if (!departmentName.trim()) {
      toast.error("Please enter a department.");
      return;
    }

    setDeptSubmitting(true);

    try {
      const payload = { department: departmentName.trim() };

      const res = await fetch(`${API_BASE}/add_department`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        toast.success("Department added successfully.");
        setDepartmentName("");
        fetchDepartments(deptSearch.trim());
      } else {
        toast.error(data.message || "Failed to add department.");
      }
    } catch (err) {
      toast.error("Something went wrong while adding department.");
    } finally {
      setDeptSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // ✅ PAGINATION LOGIC
  // ----------------------------------------------------
  const totalPages = Math.ceil(departments.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = departments.slice(indexFirst, indexLast);

  const paginate = (page) => setCurrentPage(page);

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
                    Department Master
                  </Card.Title>
                </Col>

                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search department..."
                      value={deptSearch}
                      onChange={handleDeptSearchChange}
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
              {/* Add Department */}
              <Form onSubmit={handleAddDepartment} className="mb-3 d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Enter new department (e.g. Development)"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                />

                <Button
                  type="submit"
                  className="btn btn-primary add-customer-btn"
                  disabled={deptSubmitting}
                >
                  {deptSubmitting ? (
                    "Adding..."
                  ) : (
                    <>
                      <FaPlus size={14} className="me-1" /> Add Department
                    </>
                  )}
                </Button>
              </Form>

              {/* Table */}
              <div className="table-full-width table-responsive">
                {deptLoading ? (
                  <p className="text-center">Loading departments...</p>
                ) : (
                  <Table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Department</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentItems.map((d, index) => (
                        <tr key={d.dpt_id}>
                          <td>{indexFirst + index + 1}</td>
                          <td>{d.department}</td>
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
                      ))}

                      {departments.length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center">
                            No departments found.
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

export default Department;