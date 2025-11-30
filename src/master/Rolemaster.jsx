// src/RoleMaster.jsx
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

const API_BASE = "https://nlfs.in/erp/index.php/Api";

const RoleMaster = () => {
  const [roleSearch, setRoleSearch] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roles, setRoles] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ⭐ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ========== 1) LIST ROLE API ==========
  useEffect(() => {
    const fetchRoles = async () => {
      setRoleLoading(true);
      try {
        const res = await fetch(`${API_BASE}/list_role`, {
          method: "GET",
        });

        const data = await res.json();
        console.log("list_role response:", data);

        if (
          (data.status === true || data.status === "true") &&
          data.success === "1"
        ) {
          // data.data: [ { roll_id, roll }, ... ]
          setRoles(data.data || []);
        } else {
          toast.error(data.message || "Failed to fetch roles.");
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        toast.error("Something went wrong while loading roles.");
      } finally {
        setRoleLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Search filter (by roll name)
  const filteredRoles = useMemo(() => {
    if (!roleSearch) return roles;
    const s = roleSearch.toLowerCase();
    return roles.filter((r) => (r.roll || "").toLowerCase().includes(s));
  }, [roleSearch, roles]);

  // ⭐ PAGINATION ON filteredRoles
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // ========== 2) ADD ROLE API ==========
  const handleAddRole = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      toast.error("Please enter a role name.");
      return;
    }

    setRoleSubmitting(true);

    try {
      const payload = {
        roll: roleName.trim(), // key must be "roll" as in Insomnia
      };

      const res = await fetch(`${API_BASE}/add_role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("add_role response:", data);

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        toast.success(data.message || "Role added successfully.");

        // refresh roles via list_role
        try {
          const refRes = await fetch(`${API_BASE}/list_role`);
          const refData = await refRes.json();
          if (
            (refData.status === true || refData.status === "true") &&
            refData.success === "1"
          ) {
            setRoles(refData.data || []);
            setCurrentPage(1); // ⭐ Go back to first page after adding
          }
        } catch (err) {
          console.error("Error refreshing roles:", err);
        }

        setRoleName("");
      } else {
        toast.error(data.message || "Failed to add role.");
      }
    } catch (err) {
      console.error("Error adding role:", err);
      toast.error("Something went wrong while adding the role.");
    } finally {
      setRoleSubmitting(false);
    }
  };

  // ========== 3) DELETE ROLE API ==========
  const handleDeleteRole = async (roll_id) => {
    if (!roll_id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this role?"
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(roll_id);

      const res = await fetch(`${API_BASE}/delete_role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roll_id }),
      });

      const data = await res.json();
      console.log("delete_role response:", data);

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        toast.success(data.message || "Role deleted successfully.");

        // remove from local state without refetch
        setRoles((prev) =>
          prev.filter((r) => String(r.roll_id) !== String(roll_id))
        );
      } else {
        toast.error(data.message || "Failed to delete role.");
      }
    } catch (err) {
      console.error("Error deleting role:", err);
      toast.error("Something went wrong while deleting the role.");
    } finally {
      setDeletingId(null);
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
                    Role Master
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search role..."
                      value={roleSearch}
                      onChange={(e) => {
                        setRoleSearch(e.target.value);
                        setCurrentPage(1); // ⭐ Reset page on search
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
              {/* Add Role Form (uses add_role) */}
              <Form onSubmit={handleAddRole} className="mb-3 d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Enter new role"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
                <Button
                  type="submit"
                  className="add-customer-btn"
                  disabled={roleSubmitting}
                  style={{ width: "12vw" }}
                >
                  {roleSubmitting ? (
                    "Adding..."
                  ) : (
                    <>
                      <FaPlus size={14} className="me-1" /> Add Role
                    </>
                  )}
                </Button>
              </Form>

              {/* Roles Table (data from list_role) */}
              <div className="table-full-width table-responsive">
                {roleLoading ? (
                  <p className="text-center">Loading roles...</p>
                ) : (
                  <>
                    <Table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Sr. No.</th>
                          <th>Role</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRoles.length > 0 ? (
                          currentRoles.map((role, index) => (
                            <tr key={role.roll_id || index}>
                              {/* ⭐ Sr. No. with pagination offset */}
                              <td>{indexOfFirstItem + index + 1}</td>
                              <td>{role.roll}</td>
                              <td>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteRole(role.roll_id)}
                                  disabled={deletingId === role.roll_id}
                                >
                                  <FaTrash />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center">
                              No roles found.
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

export default RoleMaster;
