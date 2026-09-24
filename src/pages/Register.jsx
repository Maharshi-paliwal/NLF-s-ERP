// // src/Register.jsx
// import React, { useState, useEffect } from "react";
// import { Card, Row, Col, Form, Container, Button } from "react-bootstrap";
// import { FaArrowLeft } from "react-icons/fa";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import toast from "react-hot-toast";

// // --- API BASE URL (LIVE) ---
// const API_BASE = "https://nlfs.in/erp/index.php/Api";

// const Register = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // 🔹 If we came from Edit button, user object will be in state
//   const editingUser = location.state?.user || null;
//   const isEditMode = !!editingUser;

//   // 🔹 Role options from master API
//   const [roles, setRoles] = useState([]);
//   const [rolesLoading, setRolesLoading] = useState(false);

//   // 🔹 Full Employee list from API
//   const [employeeList, setEmployeeList] = useState([]);
//   const [employeeLoading, setEmployeeLoading] = useState(false);

//   // 🔹 Initialise formData from either the editing user or blank
//   const [formData, setFormData] = useState({
//     id: editingUser?.id || "",
//     name: editingUser?.name || "",
//     mob: editingUser?.mob || "",
//     email: editingUser?.email || "",
//     roll: editingUser?.roll || "",
//     password: editingUser?.password || "",
//     assigned_by: editingUser?.assigned_by || "",
//   });

//   const [submitting, setSubmitting] = useState(false);

//   // ---------- FETCH ROLES FROM MASTER (list_role) ----------
//   useEffect(() => {
//     const fetchRoles = async () => {
//       setRolesLoading(true);
//       try {
//         const res = await fetch(`${API_BASE}/list_role`, {
//           method: "GET",
//         });

//         const data = await res.json();
//         console.log("list_role response (Register):", data);

//         if (
//           (data.status === true || data.status === "true") &&
//           data.success === "1"
//         ) {
//           setRoles(data.data || []);
//         } else {
//           console.error(data.message || "Failed to fetch roles.");
//         }
//       } catch (err) {
//         console.error("Error fetching roles in Register:", err);
//       } finally {
//         setRolesLoading(false);
//       }
//     };

//     fetchRoles();
//   }, []);

//   // ---------- FETCH FULL EMPLOYEE LIST ----------
//   // This effect runs only ONCE when the component mounts to get all employees.
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       setEmployeeLoading(true);
//       try {
//         // Fetch the full list without any filter
//         const res = await fetch(`https://nlfs.in/erp/index.php/Erp/employee_list`, {
//           method: "GET",
//         });

//         const data = await res.json();
//         console.log("Full employee_list response (Register):", data);

//         if (
//           data.status === true &&
//           data.success === "1" &&
//           Array.isArray(data.data)
//         ) {
//           setEmployeeList(data.data || []);
//         } else {
//           console.error(data.message || "Failed to fetch employees.");
//           setEmployeeList([]);
//         }
//       } catch (err) {
//         console.error("Error fetching employees in Register:", err);
//         setEmployeeList([]);
//       } finally {
//         setEmployeeLoading(false);
//       }
//     };

//     fetchEmployees();
//   }, []); // <-- Empty dependency array ensures this runs only once

//   // ---------- DERIVE FILTERED EMPLOYEES ----------
//   // This variable is recalculated whenever formData.roll or employeeList changes.
//   const filteredEmployees = formData.roll
//     ? employeeList.filter(emp => emp.role === formData.roll)
//     : [];

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "mob") {
//       const onlyDigits = value.replace(/\D/g, "");
//       setFormData((prev) => ({ ...prev, [name]: onlyDigits }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };
  
//   // We can remove the separate handleEmployeeChange as handleChange covers it.
//   // The 'name' of the select is 'assigned_by', so handleChange will update the state correctly.

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       const endpoint = isEditMode
//         ? `${API_BASE}/update_registration`
//         : `${API_BASE}/add_registration`;

//       const payload = isEditMode
//         ? {
//             id: formData.id,
//             name: formData.name,
//             mob: formData.mob,
//             email: formData.email,
//             roll: formData.roll,
//             password: formData.password,
//             assigned_by: formData.assigned_by,
//           }
//         : {
//             name: formData.name,
//             mob: formData.mob,
//             email: formData.email,
//             roll: formData.roll,
//             password: formData.password,
//             assigned_by: formData.assigned_by,
//           };

//       console.log("Sending payload:", payload);

//       const res = await fetch(endpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//       console.log("Registration API response:", data);

//       if (
//         (data.status === true || data.status === "true") &&
//         data.success === "1"
//       ) {
//         toast.success(
//           data.message || 
//           (isEditMode ? "User updated successfully" : "User registered successfully")
//         );
        
//         navigate("/usertable", { replace: true });
//       } else {
//         toast.error(
//           data.message ||
//             (isEditMode ? "Updating user failed." : "Registration failed.")
//         );
//       }
//     } catch (err) {
//       console.error("Error in user registration/edit:", err);
//       toast.error("Something went wrong while saving the user.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Container className="py-4">
//       <Button
//         as={Link}
//         to="/usertable"
//         className="add-customer-btn mb-4"
//         size="sm"
//       >
//         <FaArrowLeft />
//       </Button>

//       <Card className="shadow-sm border-0">
//         <Card.Header className="bg-white d-flex justify-content-between align-items-center">
//           <h5 className="mb-0 fw-bold">
//             {isEditMode ? "Edit User" : "Register Users"}
//           </h5>
//         </Card.Header>

//         <Card.Body>
//           <Form onSubmit={handleSubmit}>
//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Name *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     required
//                     placeholder="Enter full name"
//                   />
//                 </Form.Group>
//               </Col>

//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Mobile No *</Form.Label>
//                   <Form.Control
//                     type="tel"
//                     name="mob"
//                     value={formData.mob}
//                     onChange={handleChange}
//                     required
//                     maxLength={10}
//                     placeholder="Enter 10-digit mobile no"
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
//                     required
//                     placeholder="Enter email"
//                   />
//                 </Form.Group>
//               </Col>

//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Role *</Form.Label>
//                   <Form.Select
//                     name="roll"
//                     value={formData.roll}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">Select Role</option>
//                     {rolesLoading && <option>Loading...</option>}
//                     {!rolesLoading &&
//                       roles.map((r) => (
//                         <option key={r.roll_id} value={r.roll}>
//                           {r.roll}
//                         </option>
//                       ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>

//             <Row className="mb-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Password *</Form.Label>
//                   <Form.Control
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                     minLength={6}
//                     placeholder="Enter password"
//                   />
//                 </Form.Group>
//               </Col>

//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Employee</Form.Label>
//                   <Form.Select
//                     name="assigned_by"
//                     value={formData.assigned_by}
//                     onChange={handleChange} // Use the single handleChange function
//                     disabled={!formData.roll || employeeLoading} // Disable if no role is selected or still loading
//                   >
//                     <option value="">
//                       {formData.roll ? "Please Select" : "Select a role first"}
//                     </option>
//                     {employeeLoading && <option>Loading...</option>}
//                     {/* Check if a role is selected, loading is finished, but no employees match */}
//                     {!employeeLoading && formData.roll && filteredEmployees.length === 0 && (
//                       <option>No employees found for this role</option>
//                     )}
//                     {/* Map over the FILTERED list */}
//                     {!employeeLoading &&
//                       filteredEmployees.map((emp) => (
//                         <option key={emp.emp_id} value={emp.emp_id}>
//                           {emp.name}
//                         </option>
//                       ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>

//             <div className="d-flex justify-content-end mt-4">
//               <Button
//                 className="add-customer-btn"
//                 type="submit"
//                 disabled={submitting}
//               >
//                 {submitting
//                   ? isEditMode
//                     ? "Updating..."
//                     : "Registering..."
//                   : isEditMode
//                   ? "Update"
//                   : "Register"}
//               </Button>
//             </div>
//           </Form>
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// };

// export default Register;

// src/Register.jsx
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Container, Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

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

  // 🔹 Full Employee list from API
  const [employeeList, setEmployeeList] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  // 🔹 Initialise formData from either the editing user or blank
  const [formData, setFormData] = useState({
    id: editingUser?.id || "",
    name: editingUser?.name || "",
    mob: editingUser?.mob || "",
    email: editingUser?.email || "",
    roll: editingUser?.roll || "",
    password: editingUser?.password || "",
    assigned_by: editingUser?.assigned_by || "",
    emp_id: editingUser?.emp_id || "", // Add emp_id to formData
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

  // ---------- FETCH FULL EMPLOYEE LIST ----------
  // This effect runs only ONCE when the component mounts to get all employees.
  useEffect(() => {
    const fetchEmployees = async () => {
      setEmployeeLoading(true);
      try {
        // Fetch the full list without any filter
        const res = await fetch(`https://nlfs.in/erp/index.php/Erp/employee_list`, {
          method: "GET",
        });

        const data = await res.json();
        console.log("Full employee_list response (Register):", data);

        if (
          data.status === true &&
          data.success === "1" &&
          Array.isArray(data.data)
        ) {
          setEmployeeList(data.data || []);
        } else {
          console.error(data.message || "Failed to fetch employees.");
          setEmployeeList([]);
        }
      } catch (err) {
        console.error("Error fetching employees in Register:", err);
        setEmployeeList([]);
      } finally {
        setEmployeeLoading(false);
      }
    };

    fetchEmployees();
  }, []); // <-- Empty dependency array ensures this runs only once

  // ---------- DERIVE FILTERED EMPLOYEES ----------
  // This variable is recalculated whenever formData.roll or employeeList changes.
  const filteredEmployees = formData.roll
    ? employeeList.filter(emp => emp.role === formData.roll)
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mob") {
      const onlyDigits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: onlyDigits }));
    } else if (name === "assigned_by") {
      // When an employee is selected, update both assigned_by and emp_id
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        emp_id: value // Set emp_id to the same value as assigned_by
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const endpoint = isEditMode
        ? `${API_BASE}/update_registration`
        : `${API_BASE}/add_registration`;

      const payload = isEditMode
        ? {
            id: formData.id,
            name: formData.name,
            mob: formData.mob,
            email: formData.email,
            roll: formData.roll,
            password: formData.password,
            assigned_by: formData.assigned_by,
            emp_id: formData.emp_id, // Include emp_id in the payload
          }
        : {
            name: formData.name,
            mob: formData.mob,
            email: formData.email,
            roll: formData.roll,
            password: formData.password,
            assigned_by: formData.assigned_by,
            emp_id: formData.emp_id, // Include emp_id in the payload
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
        toast.success(
          data.message || 
          (isEditMode ? "User updated successfully" : "User registered successfully")
        );
        
        navigate("/usertable", { replace: true });
      } else {
        toast.error(
          data.message ||
            (isEditMode ? "Updating user failed." : "Registration failed.")
        );
      }
    } catch (err) {
      console.error("Error in user registration/edit:", err);
      toast.error("Something went wrong while saving the user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Button
        as={Link}
        to="/usertable"
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
                    required
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
                    required
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
                    required
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
                    required
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
                    required
                    minLength={6}
                    placeholder="Enter password"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    name="assigned_by"
                    value={formData.assigned_by}
                    onChange={handleChange}
                    disabled={!formData.roll || employeeLoading}
                  >
                    <option value="">
                      {formData.roll ? "Please Select" : "Select a role first"}
                    </option>
                    {employeeLoading && <option>Loading...</option>}
                    {!employeeLoading && formData.roll && filteredEmployees.length === 0 && (
                      <option>No employees found for this role</option>
                    )}
                    {!employeeLoading &&
                      filteredEmployees.map((emp) => (
                        <option key={emp.emp_id} value={emp.emp_id}>
                          {emp.name}
                        </option>
                      ))}
                  </Form.Select>
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