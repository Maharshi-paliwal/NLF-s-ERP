

// import React, { useState } from "react";
// import {
//   Container,
//   Card,
//   Form,
//   Row,
//   Col,
//   Button,
//   Alert,
// } from "react-bootstrap";
// import { ArrowLeft, Upload } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const AddEmployee = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     gender: "",
//     email: "",
//     mob: "",
//     location: "",
//     status: "active", // Default value
//     dob: "",
//     designation: "",
//     experience: "",
//     joining_date: "",
//     doc: null,
//     role: "",
//   });

//   const [showToast, setShowToast] = useState(false);
//   const [error, setError] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData((prev) => ({ ...prev, doc: file }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError(null);

//     try {
//       // Create FormData for file upload
//       const data = new FormData();
      
//       // Append all form fields
//       data.append("name", formData.name);
//       data.append("gender", formData.gender);
//       data.append("email", formData.email);
//       data.append("mob", formData.mob);
//       data.append("location", formData.location);
//       data.append("status", formData.status);
//       data.append("dob", formData.dob);
//       data.append("designation", formData.designation);
//       data.append("experience", formData.experience);
//       data.append("joining_date", formData.joining_date);
//       data.append("role", formData.role);
      
//       // Append file if exists
//       if (formData.doc) {
//         data.append("doc", formData.doc);
//       }

//       // Make API call
//       const response = await fetch("https://nlfs.in/erp/index.php/Erp/add_employee", {
//         method: "POST",
//         body: data,
//         // Don't set Content-Type header when using FormData
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }

//       const result = await response.json();
      
//       // Show success message
//       setShowToast(true);
      
//       // Redirect after delay
//       setTimeout(() => {
//         setShowToast(false);
//         navigate("/hr/employees"); // or wherever you want to go
//       }, 2000);
//     } catch (err) {
//       setError(err.message || "Failed to add employee. Please try again.");
//       console.error("Error adding employee:", err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleBack = () => {
//     navigate(-1); // or navigate("/hr/employees")
//   };

//   return (
//     <Container className="py-4">
//       <Button
//         className="buttonEye me-3 mb-4"
//         style={{ background: "#ed3131" }}
//         title="View Work Order Details"
//         onClick={handleBack}
//       >
//         <ArrowLeft />
//       </Button>
      
//       <Card className="shadow-sm border-0">
//         {/* Card Header: Title + Back Button */}
//         <Card.Header className="bg-white d-flex justify-content-between align-items-center">
//           <h5 className="mb-0 fw-bold">Add/Onboard Employee</h5>
//           <Button
//             variant="outline-primary"
//             size="sm"
//             onClick={handleBack}
//           >
//             <ArrowLeft size={14} className="me-2" />
//             Back
//           </Button>
//         </Card.Header>

//         {/* Card Body: Form */}
//         <Card.Body>
//           {error && <Alert variant="danger">{error}</Alert>}
          
//           <Form onSubmit={handleSubmit}>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Full Name *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Mobile No. *</Form.Label>
//                   <Form.Control
//                     type="tel"
//                     name="mob"
//                     value={formData.mob}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Email *</Form.Label>
//                   <Form.Control
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Date of Birth *</Form.Label>
//                   <Form.Control
//                     type="date"
//                     name="dob"
//                     value={formData.dob}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Gender *</Form.Label>
//                   <Form.Select
//                     name="gender"
//                     value={formData.gender}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">Select gender</option>
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Location *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="location"
//                     value={formData.location}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Designation *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="designation"
//                     value={formData.designation}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Experience *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="experience"
//                     value={formData.experience}
//                     onChange={handleChange}
//                     placeholder="e.g., 5 years"
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Joining Date *</Form.Label>
//                   <Form.Control
//                     type="date"
//                     name="joining_date"
//                     value={formData.joining_date}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Status *</Form.Label>
//                   <Form.Select
//                     name="status"
//                     value={formData.status}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                     <option value="pending">Pending</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Role *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="role"
//                     value={formData.role}
//                     onChange={handleChange}
//                     placeholder="e.g., supervisor"
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Documents</Form.Label>
//                   <div>
//                     <Form.Control
//                       type="file"
//                       name="doc"
//                       onChange={handleFileChange}
//                       style={{ display: "none" }}
//                       id="document-upload"
//                     />
//                     <Button 
//                       className="w-100 d-flex align-items-center justify-content-center gap-2 buttonEye" 
//                       style={{color:"white"}}
//                       onClick={() => document.getElementById('document-upload').click()}
//                     >
//                       <Upload size={16} />
//                       {formData.doc ? formData.doc.name : "Upload Documents"}
//                     </Button>
//                   </div>
//                 </Form.Group>
//               </Col>
//             </Row>

//             {/* Action Buttons */}
//             <div className="d-flex justify-content-end gap-3 mt-4">
//               <Button variant="outline-secondary" onClick={handleBack}>
//                 Cancel
//               </Button>
//               <Button variant="danger" type="submit" disabled={isSubmitting}>
//                 {isSubmitting ? "Adding Employee..." : "Add Employee"}
//               </Button>
//             </div>
//           </Form>
//         </Card.Body>
//       </Card>

//       {/* Simple Toast Notification (Bootstrap-styled) */}
//       {showToast && (
//         <div
//           style={{
//             position: "fixed",
//             top: "20px",
//             right: "20px",
//             zIndex: 1050,
//           }}
//         >
//           <div className="toast show" role="alert" aria-live="assertive">
//             <div className="toast-header">
//               <strong className="me-auto">Success</strong>
//               <button
//                 type="button"
//                 className="btn-close"
//                 onClick={() => setShowToast(false)}
//               ></button>
//             </div>
//             <div className="toast-body">
//               New employee has been successfully onboarded.
//             </div>
//           </div>
//         </div>
//       )}
//     </Container>
//   );
// };

// export default AddEmployee;

import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button,
  Alert,
} from "react-bootstrap";
import { ArrowLeft, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddEmployee = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    email: "",
    mob: "",
    location: "",
    status: "active", // Default value
    dob: "",
    designation: "",
    experience: "",
    joining_date: "",
    doc: null,
    role: "",
  });

  // State for roles dropdown
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState(null);

  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch roles from the API when the component mounts
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        setRolesError(null);
        const response = await fetch("https://nlfs.in/erp/index.php/Api/list_role");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        // Check if the API call was successful based on the response structure
        if (result.status === 'true' && result.data) {
          setRoles(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch roles");
        }
      } catch (err) {
        setRolesError(err.message);
        console.error("Error fetching roles:", err);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []); // The empty array [] means this effect runs only once on mount

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, doc: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("gender", formData.gender);
      data.append("email", formData.email);
      data.append("mob", formData.mob);
      data.append("location", formData.location);
      data.append("status", formData.status);
      data.append("dob", formData.dob);
      data.append("designation", formData.designation);
      data.append("experience", formData.experience);
      data.append("joining_date", formData.joining_date);
      data.append("role", formData.role);

      if (formData.doc) {
        data.append("doc", formData.doc);
      }

      const response = await fetch(
        "https://nlfs.in/erp/index.php/Erp/add_employee",
        {
          method: "POST",
          body: data,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/hr/employees");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to add employee. Please try again.");
      console.error("Error adding employee:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container className="py-4">
      <Button
        className="buttonEye me-3 mb-4"
        style={{ background: "#ed3131" }}
        title="Back"
        onClick={handleBack}
      >
        <ArrowLeft />
      </Button>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Add/Onboard Employee</h5>
          <Button variant="outline-primary" size="sm" onClick={handleBack}>
            <ArrowLeft size={14} className="me-2" />
            Back
          </Button>
        </Card.Header>

        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* ... (other form fields remain the same) ... */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Mobile No. *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="mob"
                    value={formData.mob}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date of Birth *</Form.Label>
                  <Form.Control
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Gender *</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Designation *</Form.Label>
                  <Form.Control
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Experience *</Form.Label>
                  <Form.Control
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 5 years"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Joining Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status *</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Role *</Form.Label>
                  {rolesLoading && <Form.Control as="select" disabled><option>Loading roles...</option></Form.Control>}
                  {rolesError && <Alert variant="danger" className="mt-2">{rolesError}</Alert>}
                  {!rolesLoading && !rolesError && (
                    <Form.Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select role</option>
                      {roles.map((role) => (
                        <option key={role.roll_id} value={role.roll}>
                          {role.roll}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Documents</Form.Label>
                  <div>
                    <Form.Control
                      type="file"
                      name="doc"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      id="document-upload"
                    />
                    <Button
                      className="w-100 d-flex align-items-center justify-content-center gap-2 buttonEye"
                      style={{ color: "white" }}
                      onClick={() => document.getElementById('document-upload').click()}
                    >
                      <Upload size={16} />
                      {formData.doc ? formData.doc.name : "Upload Documents"}
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button variant="outline-secondary" onClick={handleBack}>
                Cancel
              </Button>
              <Button variant="danger" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding Employee..." : "Add Employee"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {showToast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1050,
          }}
        >
          <div className="toast show" role="alert" aria-live="assertive">
            <div className="toast-header">
              <strong className="me-auto">Success</strong>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowToast(false)}
              ></button>
            </div>
            <div className="toast-body">
              New employee has been successfully onboarded.
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default AddEmployee;