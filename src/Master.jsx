// src/MasterTable.jsx
import React, { useState, useEffect, useMemo } from "react";
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

const API_BASE = "https://nlfs.in/erp/index.php/Api";

const Master = () => {
  // --------- BRANCH MASTER (STATIC FOR NOW) ----------
  const [branchSearch, setBranchSearch] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branches, setBranches] = useState([
    { id: 1, name: "Head Office" },
    { id: 2, name: "Mumbai Branch" },
    { id: 3, name: "Pune Branch" },
  ]);

  const filteredBranches = useMemo(() => {
    if (!branchSearch) return branches;
    const s = branchSearch.toLowerCase();
    return branches.filter((b) => b.name.toLowerCase().includes(s));
  }, [branchSearch, branches]);

  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!branchName.trim()) {
      toast.error("Please enter a branch name.");
      return;
    }

    const newBranch = {
      id: branches.length + 1,
      name: branchName.trim(),
    };

    setBranches((prev) => [...prev, newBranch]);
    setBranchName("");
    toast.success("Branch added (static only for now).");
  };

  // --------- ROLE MASTER (API INTEGRATED) ----------
  const [roleSearch, setRoleSearch] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roles, setRoles] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  // Fetch existing roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      setRoleLoading(true);
      try {
        // ⚠️ Adjust endpoint if your backend uses a different name
        const res = await fetch(`${API_BASE}/view_role`, {
          method: "GET",
        });

        const data = await res.json();

        // Expecting: { status: true, success: "1", data: [...] }
        if (data.status && data.success === "1") {
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

  const filteredRoles = useMemo(() => {
    if (!roleSearch) return roles;
    const s = roleSearch.toLowerCase();
    return roles.filter((r) => r.role?.toLowerCase().includes(s));
  }, [roleSearch, roles]);

  // Add role using API
  const handleAddRole = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      toast.error("Please enter a role name.");
      return;
    }

    setRoleSubmitting(true);

    try {
      // Using FormData like your other APIs
      const formData = new FormData();
      // ⚠️ FIELD NAME — adjust to whatever backend expects: "role" / "role_name"
      formData.append("role", roleName.trim());

      const res = await fetch(`${API_BASE}/add_role`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status && data.success === "1") {
        toast.success(data.message || "Role added successfully.");

        // Option 1: re-fetch full list
        // Option 2: just push new role locally (if API returns it)
        // Here we'll re-fetch to be safe:
        try {
          const refRes = await fetch(`${API_BASE}/view_role`);
          const refData = await refRes.json();
          if (refData.status && refData.success === "1") {
            setRoles(refData.data || []);
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

  return (
    <Container fluid>
      <Row>
        {/* ---------- BRANCH MASTER ---------- */}
        <Col md="6">
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
                    Branch Master
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search branch..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      style={{ width: "14vw", paddingRight: "35px" }}
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
              <Form onSubmit={handleAddBranch} className="mb-3 d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Enter new branch name"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                />
                <Button
                  type="submit"
                  className="btn btn-primary add-customer-btn"
                >
                  <FaPlus size={14} className="me-1" /> Add Branch
                </Button>
              </Form>

              <div className="table-full-width table-responsive">
                <Table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Branch Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBranches.map((branch, index) => (
                      <tr key={branch.id}>
                        <td>{index + 1}</td>
                        <td>{branch.name}</td>
                      </tr>
                    ))}

                    {filteredBranches.length === 0 && (
                      <tr>
                        <td colSpan="2" className="text-center">
                          No branches found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* ---------- ROLE MASTER ---------- */}
        <Col md="6">
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
                    Role Master
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search role..."
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      style={{ width: "14vw", paddingRight: "35px" }}
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
              <Form onSubmit={handleAddRole} className="mb-3 d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Enter new role"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
                <Button
                  type="submit"
                  className="btn btn-primary add-customer-btn"
                  disabled={roleSubmitting}
                >
                  {roleSubmitting ? "Adding..." : <><FaPlus size={14} className="me-1" /> Add Role</>}
                </Button>
              </Form>

              <div className="table-full-width table-responsive">
                {roleLoading ? (
                  <p className="text-center">Loading roles...</p>
                ) : (
                  <Table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRoles.map((role, index) => (
                        <tr key={role.id || index}>
                          <td>{index + 1}</td>
                          {/* ⚠️ Adjust `role.role` if backend uses `role_name` etc. */}
                          <td>{role.role}</td>
                        </tr>
                      ))}

                      {filteredRoles.length === 0 && (
                        <tr>
                          <td colSpan="2" className="text-center">
                            No roles found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Master;
