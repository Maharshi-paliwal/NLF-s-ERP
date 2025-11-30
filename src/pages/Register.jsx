// src/Register.jsx
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Container, Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";

// --- API BASE URL (LIVE) ---
const API_BASE = "https://nlfs.in/erp/index.php/Api";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 If we came from Edit button, user object will be in state
  const editingUser = location.state?.user || null;
  const isEditMode = !!editingUser;

  // 🔹 Role options from master API
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // 🔹 Initialise formData from either the editing user or blank
  const [formData, setFormData] = useState({
    id: editingUser?.id || "",
    name: editingUser?.name || "",
    mob: editingUser?.mob || "",
    email: editingUser?.email || "",
    // backend returns e.g. "admin", "hr", etc. for roll
    roll: editingUser?.roll || "",
    // show_pass is what the list API returns; use it for prefilling
    password: editingUser?.password || "",
  });

  const [submitting, setSubmitting] = useState(false);

  // ---------- FETCH ROLES FROM MASTER (list_role) ----------
  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true);
      try {
        const res = await fetch(`${API_BASE}/list_role`, {
          method: "GET",
        });

        const data = await res.json();
        console.log("list_role response (Register):", data);

        if (
          (data.status === true || data.status === "true") &&
          data.success === "1"
        ) {
          // data.data: [ { roll_id, roll }, ... ]
          setRoles(data.data || []);
        } else {
          console.error(data.message || "Failed to fetch roles.");
        }
      } catch (err) {
        console.error("Error fetching roles in Register:", err);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mob") {
      const onlyDigits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: onlyDigits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 🔹 Decide endpoint: add vs update
      const endpoint = isEditMode
        ? `${API_BASE}/update_registration`
        : `${API_BASE}/add_registration`;

      // 🔹 Payload exactly like API expects
      const payload = isEditMode
        ? {
            id: formData.id,
            name: formData.name,
            mob: formData.mob,
            email: formData.email,
            roll: formData.roll, // from dropdown (master)
            password: formData.password,
          }
        : {
            name: formData.name,
            mob: formData.mob,
            email: formData.email,
            roll: formData.roll,
            password: formData.password,
          };

      console.log("Sending payload:", payload);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Registration API response:", data);

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        alert(
          data.message ||
            (isEditMode
              ? "registration updated successfully"
              : "User registered successfully.")
        );
        navigate(-1);
      } else {
        alert(
          data.message ||
            (isEditMode ? "Updating user failed." : "Registration failed.")
        );
      }
    } catch (err) {
      console.error("Error in user registration/edit:", err);
      alert("Something went wrong while saving the user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Button
        as={Link}
        to={-1}
        onClick={(e) => {
          e.preventDefault();
          navigate(-1);
        }}
        className="add-customer-btn mb-4"
        size="sm"
      >
        <FaArrowLeft />
      </Button>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">
            {isEditMode ? "Edit User" : "Register Users"}
          </h5>
        </Card.Header>

        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    // required
                    placeholder="Enter full name"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Mobile No *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="mob"
                    value={formData.mob}
                    onChange={handleChange}
                    // required
                    maxLength={10}
                    placeholder="Enter 10-digit mobile no"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    // required
                    placeholder="Enter email"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Role *</Form.Label>
                  <Form.Select
                    name="roll"
                    value={formData.roll}
                    onChange={handleChange}
                    // required
                  >
                    <option value="">Select Role</option>
                    {rolesLoading && <option>Loading...</option>}
                    {!rolesLoading &&
                      roles.map((r) => (
                        <option key={r.roll_id} value={r.roll}>
                          {r.roll}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Password *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    // required
                    minLength={6}
                    placeholder="Enter password"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button
                className="add-customer-btn"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? isEditMode
                    ? "Updating..."
                    : "Registering..."
                  : isEditMode
                  ? "Update"
                  : "Register"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;
