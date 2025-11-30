// src/UserTable.jsx
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
import { FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

// API BASE
const API_BASE = "https://nlfs.in/erp/index.php/Api";

export default function UserTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]); // STORED USERS FROM API
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  // ⭐ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ---------------- FETCH USERS FROM API ----------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE}/list_registration`, {
          method: "GET",
        });

        const data = await res.json();
        console.log("list_registration response:", data);

        if (
          (data.status === true || data.status === "true") &&
          data.success === "1"
        ) {
          setUsers(data.data || []);
        } else {
          toast.error(data.message || "Failed to fetch users.");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error("Something went wrong while loading users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ---------------- DELETE USER (delete_registration) ----------------
  const handleDeleteUser = async (id) => {
    if (!id) {
      toast.error("Invalid user id.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    setDeletingId(id);

    try {
      const payload = { id };

      const res = await fetch(`${API_BASE}/delete_registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("delete_registration response:", data);

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        toast.success(data.message || "User deleted successfully.");
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        toast.error(data.message || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Something went wrong while deleting the user.");
    } finally {
      setDeletingId(null);
    }
  };

  // ---------------- GO TO EDIT PAGE ----------------
  const handleEditUser = (user) => {
    // 🔹 Navigate to RegisterUser and pass user in route state
    navigate("/registeruser", { state: { user } });
  };

  // ---------------- FILTER USERS ----------------
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    const s = searchTerm.toLowerCase();
    return users.filter((u) => {
      const name = u.name?.toLowerCase() || "";
      const email = u.email?.toLowerCase() || "";
      const mob = (u.mob ?? "").toString().toLowerCase();
      const roll = (u.roll ?? "").toString().toLowerCase();

      return (
        name.includes(s) ||
        email.includes(s) ||
        mob.includes(s) ||
        roll.includes(s)
      );
    });
  }, [searchTerm, users]);

  // ⭐ PAGINATION BASED ON filteredUsers
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

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
                    Registered Users
                  </Card.Title>
                </Col>

                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search name, email, mobile, role..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
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

                  <Button
                    as={Link}
                    to="/registeruser"
                    className="btn btn-primary add-customer-btn"
                    style={{ width: "10vw" }}
                  >
                    <FaPlus size={14} className="me-1" /> Add User
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="table-full-width table-responsive">
              {loading ? (
                <p className="text-center">Loading users...</p>
              ) : (
                <>
                  <Table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Role</th>
                        <th>Password</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.length > 0 ? (
                        currentUsers.map((user, index) => (
                          <tr key={user.id || index}>
                            {/* ⭐ Sr no with pagination offset */}
                            <td>{indexOfFirstItem + index + 1}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.mob}</td>
                            <td>{user.roll}</td>
                            <td>{user.show_pass}</td>
                            <td className="d-flex justify-content-between">
                              <button
                                type="button"
                                className="buttonEye text-light"
                                onClick={() => handleEditUser(user)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deletingId === user.id}
                                className="bg-danger text-light border-0 rounded px-2 py-1 me-3"
                              >
                                {deletingId === user.id ? "..." : <FaTrash />}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">
                            No users found.
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
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
