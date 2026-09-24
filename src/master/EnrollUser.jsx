import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const initialFormState = {
  name: "",
  mob: "",
  email: "",
  password: "",
  show_pass: "",
  roll: "sales"
};

const roles = [
  { value: "sales", label: "Sales" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" }
];

export default function EnrollUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationList, setRegistrationList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing registrations on component mount
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await axios.get("https://nlfs.in/erp/index.php/Api/list_registration");
        if (response.data && Array.isArray(response.data.data)) {
          setRegistrationList(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching registrations:", err);
        toast.error("Failed to load existing registrations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For mobile number, only allow digits
    if (name === "mob") {
      const onlyDigits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: onlyDigits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Update show_pass when password changes
    if (name === "password") {
      setFormData((prev) => ({ ...prev, show_pass: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Validate form
      if (!formData.name || !formData.mob || !formData.email || !formData.password) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }
      
      // Phone validation (10-digit check)
      if (!/^\d{10}$/.test(formData.mob)) {
        toast.error("Please enter a valid 10-digit mobile number");
        setIsSubmitting(false);
        return;
      }

      console.log("Sending payload:", formData);
      
      // API call to register user
      const response = await axios.post(
        "https://nlfs.in/erp/index.php/Api/add_registration",
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Registration API response:", response.data);
      
      // ✅ FIXED: Check for status === true (boolean) and success === "1" or 1
      if (
        (response.data.status === true || response.data.status === "true") &&
        (response.data.success === "1" || response.data.success === 1)
      ) {
        // Show success toast
        toast.success(response.data.message || "User registered successfully");
        
        // Reset form
        setFormData(initialFormState);
        
        // Navigate after a short delay - matching the pattern from NewQuotation.jsx
        setTimeout(() => {
          navigate("/usertable", { replace: true });
        }, 100);
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      toast.error(err.response?.data?.message || "An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/usertable");

  if (isLoading) {
    return (
      <Container fluid className="my-4 text-center">
        <Spinner animation="border" role="status" style={{ color: "#ed3131" }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading user data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="my-4">
      <Link to="/usertable">
        <Button className="mb-3 btn btn-primary" style={{ backgroundColor: "rgb(237, 49, 49)", border: "none" }}>
          <FaArrowLeft />
        </Button>
      </Link>
      
      <Row>
        <Col md="8" className="mx-auto">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Enroll New User</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Full Name <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter full name"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Mobile Number <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="mob"
                        value={formData.mob}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter 10-digit mobile number"
                        maxLength="10"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Email Address <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter email address"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Role <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        as="select"
                        name="roll"
                        value={formData.roll}
                        onChange={handleInputChange}
                        required
                      >
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Password <span style={{ color: "red" }}>*</span>
                      </Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter password"
                          minLength={6}
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          type="button"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-end mt-4 gap-3">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: "#ed3131", border: "none" }}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Enrolling...
                      </>
                    ) : (
                      "Enroll User"
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}