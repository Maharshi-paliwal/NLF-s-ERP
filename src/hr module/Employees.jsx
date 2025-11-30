// import React, { useState, useMemo } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Table,
//   Modal,
//   Badge,
// } from "react-bootstrap";
// import { FaArrowLeft, FaEye, FaSearch } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// const Employees = () => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   const employees = [
//     {
//       id: "1",
//       employeeId: "EMP001",
//       name: "John Doe",
//       email: "john.doe@company.com",
//       phone: "+1 234 567 8900",
//       designation: "Senior Developer",
//       joinDate: "2023-01-15",
//       performance: "Excellent",
//     },
//     {
//       id: "2",
//       employeeId: "EMP002",
//       name: "Jane Smith",
//       email: "jane.smith@company.com",
//       phone: "+1 234 567 8901",
//       designation: "Project Manager",
//       joinDate: "2022-06-20",
//       performance: "Outstanding",
//     },
//     {
//       id: "3",
//       employeeId: "EMP003",
//       name: "Mike Johnson",
//       email: "mike.johnson@company.com",
//       phone: "+1 234 567 8902",
//       designation: "Designer",
//       joinDate: "2023-03-10",
//       performance: "Good",
//     },
//     {
//       id: "4",
//       employeeId: "EMP004",
//       name: "Sarah Williams",
//       email: "sarah.williams@company.com",
//       phone: "+1 234 567 8903",
//       designation: "Developer",
//       joinDate: "2023-08-05",
//       performance: "Excellent",
//     },
//   ];

//   const filteredEmployees = useMemo(() => {
//     if (!searchQuery) return employees;
//     const term = searchQuery.toLowerCase();
//     return employees.filter(
//       (emp) =>
//         emp.name.toLowerCase().includes(term) ||
//         emp.employeeId.toLowerCase().includes(term) ||
//         emp.email.toLowerCase().includes(term)
//     );
//   }, [searchQuery]);

//   const getPerformanceVariant = (performance) => {
//     switch (performance) {
//       case "Outstanding":
//         return "success";
//       case "Excellent":
//         return "primary";
//       case "Good":
//         return "warning";
//       default:
//         return "secondary";
//     }
//   };

//   const handleViewDetails = (employee) => {
//     setSelectedEmployee(employee);
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedEmployee(null);
//   };

//   return (
//     <Container fluid>
//       <Button
//                       variant="danger"
//                       className="mb-3"
//                       size="sm"
//                       style={{ width: "36px", height: "36px", padding: 0 }}
//                       onClick={() => navigate(-1)}
//                     >
//                       <FaArrowLeft size={16} />
//                     </Button>
//       <Row>
//         <Col md="12">
//           <Card className="striped-tabled-with-hover">
//             <Card.Header
//               style={{
//                 backgroundColor: "#fff",
//                 borderBottom: "none",
//                 paddingTop: "2rem",
//               }}
//             >
//               <Row className="align-items-center">
//                 {/* LEFT: Title with back button */}
//                 <Col>
//                   <div className="d-flex align-items-center gap-3">
                    
//                     <Card.Title className="mb-0 mt-0" style={{ fontWeight: "700" }}>
//                       Employee Management
//                     </Card.Title>
//                   </div>
//                 </Col>

//                 {/* RIGHT: Search */}
//                 <Col className="d-flex justify-content-end">
//                   <div className="position-relative" style={{ width: "25vw" }}>
//                     <Form.Control
//                       type="text"
//                       placeholder="Search employees..."
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       style={{ paddingRight: "35px" }}
//                     />
//                     <FaSearch
//                       className="position-absolute"
//                       style={{
//                         right: "10px",
//                         top: "50%",
//                         transform: "translateY(-50%)",
//                         color: "#999",
//                       }}
//                     />
//                   </div>
//                 </Col>
//               </Row>
//             </Card.Header>

//             <Card.Body className="table-full-width table-responsive px-0">
//               <Table striped hover className="mb-0">
//                 <thead>
//                   <tr>
//                     <th>Sr. No.</th>
//                     <th>Employee ID</th>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Designation</th>
//                     <th>Join Date</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredEmployees.length > 0 ? (
//                     filteredEmployees.map((employee, index) => (
//                       <tr key={employee.id}>
//                         <td className="fw-medium">{index + 1}</td>
//                         <td>{employee.employeeId}</td>
//                         <td>{employee.name}</td>
//                         <td>{employee.email}</td>
//                         <td>{employee.designation}</td>
//                         <td>{employee.joinDate}</td>
//                         <td className="ps-4">
//                           <Button
//                           className="buttonEye"
//                           size="sm"
//                             onClick={() => handleViewDetails(employee)}
//                           >
//                             <FaEye />
                            
//                           </Button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="7" className="text-center py-4">
//                         No employees found matching your search.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Modal */}
//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         size="lg"
//         centered
//         backdrop="static"
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Employee Details</Modal.Title>
//         </Modal.Header>
//         {selectedEmployee && (
//           <>
//             <Modal.Body>
//               <Row className="g-4">
//                 <Col md={6}>
//                   <small className="text-muted">Employee ID</small>
//                   <p className="fw-semibold mb-0">{selectedEmployee.employeeId}</p>
//                 </Col>
//                 <Col md={6}>
//                   <small className="text-muted">Full Name</small>
//                   <p className="fw-semibold mb-0">{selectedEmployee.name}</p>
//                 </Col>
//                 <Col md={6}>
//                   <small className="text-muted">Email</small>
//                   <p className="fw-semibold mb-0">{selectedEmployee.email}</p>
//                 </Col>
//                 <Col md={6}>
//                   <small className="text-muted">Phone</small>
//                   <p className="fw-semibold mb-0">{selectedEmployee.phone}</p>
//                 </Col>
//                 <Col md={6}>
//                   <small className="text-muted">Designation</small>
//                   <p className="fw-semibold mb-0">{selectedEmployee.designation}</p>
//                 </Col>
//                 <Col md={6}>
//                   <small className="text-muted">Join Date</small>
//                   <p className="fw-semibold mb-0">{selectedEmployee.joinDate}</p>
//                 </Col>
//                 <Col xs={12}>
//                   <small className="text-muted">Performance Metrics</small>
//                   <div className="mt-1">
//                     <Badge bg={getPerformanceVariant(selectedEmployee.performance)}>
//                       {selectedEmployee.performance}
//                     </Badge>
//                   </div>
//                 </Col>
//               </Row>
//             </Modal.Body>
//             <Modal.Footer>
//               <Button variant="outline-secondary" onClick={handleCloseModal}>
//                 Close
//               </Button>
//               <Button variant="primary">Edit</Button>
//             </Modal.Footer>
//           </>
//         )}
//       </Modal>
//     </Container>
//   );
// };

// export default Employees;

import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Modal,
  Badge,
  Spinner,
} from "react-bootstrap";
import { FaArrowLeft, FaEye, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Employees = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // State for API data, loading, and error
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employees from the API when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state

        const response = await fetch(
          "https://nlfs.in/erp/index.php/Erp/employee_list"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Assuming the API returns an object with a key like 'message' and the actual data array
        // The screenshot shows the data as an array of objects within the main response object.
        // Adjust this based on the exact structure returned by your API.
        // If the data is directly the array, use `data`.
        // If it's wrapped in a property like `data` or `employees`, use that.
        // Based on the preview, it seems the data is an array of objects directly in the response.
        // However, sometimes APIs wrap the list in a property. Let's assume it's direct for now.
        // If you get an error, check the console log and adjust accordingly.
        // For example, if the API returns { message: "...", data: [...] }, then use `data.data`.

        // Check if the response has a 'message' and the actual data might be under another key
        // The preview shows the array directly. Let's try using `data` first.
        // If it doesn't work, you might need to do `setEmployees(data.data)` or similar.

        // For safety, let's check if data is an array
        if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          // If it's not an array, maybe the data is under a different key.
          // Common patterns:
          // - data.employees
          // - data.data
          // - data.result
          // You might need to inspect the actual response in the browser console.
          // As a fallback, try to extract an array from the object.
          const dataArray = Object.values(data).find(Array.isArray);
          if (dataArray) {
            setEmployees(dataArray);
          } else {
            // If no array found, set to empty array
            setEmployees([]);
            console.warn("API response did not contain an array of employees:", data);
          }
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError(err.message || "An error occurred while fetching employees.");
        setEmployees([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []); // Empty dependency array means this runs once on mount

  // Memoize the filtered list
  const filteredEmployees = useMemo(() => {
    if (loading || error) return [];
    if (!searchQuery) return employees;
    const term = searchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(term) ||
        emp.emp_id?.toLowerCase().includes(term) || // Using emp_id as per API response
        emp.email?.toLowerCase().includes(term)
    );
  }, [searchQuery, employees, loading, error]);

  const getPerformanceVariant = (performance) => {
    // Since the API response doesn't have a 'performance' field,
    // you might need to adjust this logic or remove it.
    // For now, we'll return a default variant or handle undefined.
    switch (performance) {
      case "Outstanding":
        return "success";
      case "Excellent":
        return "primary";
      case "Good":
        return "warning";
      default:
        return "secondary"; // Or perhaps "light" or "info" if you want to indicate missing data
    }
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  return (
    <Container fluid>
      <Button
        variant="danger"
        className="mb-3"
        size="sm"
        style={{ width: "36px", height: "36px", padding: 0 }}
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft size={16} />
      </Button>

      <Row>
        <Col md="12">
          <Card className="striped-tabled-with-hover">
            <Card.Header
              style={{
                backgroundColor: "#fff",
                borderBottom: "none",
                paddingTop: "2rem",
              }}
            >
              <Row className="align-items-center">
                {/* LEFT: Title with back button */}
                <Col>
                  <div className="d-flex align-items-center gap-3">
                    <Card.Title className="mb-0 mt-0" style={{ fontWeight: "700" }}>
                      Employee Management
                    </Card.Title>
                  </div>
                </Col>

                {/* RIGHT: Search */}
                <Col className="d-flex justify-content-end">
                  <div className="position-relative" style={{ width: "25vw" }}>
                    <Form.Control
                      type="text"
                      placeholder="Search employees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingRight: "35px" }}
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

            <Card.Body className="table-full-width table-responsive px-0">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading employees...</p>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-danger">
                  <p>Error: {error}</p>
                  <Button
                    variant="outline-danger"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <Table striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Designation</th>
                      <th>Join Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee, index) => (
                        <tr key={employee.emp_id || index}>
                          <td className="fw-medium">{index + 1}</td>
                          <td>{employee.emp_id}</td>
                          <td>{employee.name}</td>
                          <td>{employee.email}</td>
                          <td>{employee.designation}</td>
                          <td>{employee.joining_date}</td>
                          <td className="ps-4">
                            <Button
                              className="buttonEye"
                              size="sm"
                              onClick={() => handleViewDetails(employee)}
                            >
                              <FaEye />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No employees found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Employee Details</Modal.Title>
        </Modal.Header>
        {selectedEmployee && (
          <>
            <Modal.Body>
              <Row className="g-4">
                <Col md={6}>
                  <small className="text-muted">Employee ID</small>
                  <p className="fw-semibold mb-0">{selectedEmployee.emp_id}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Full Name</small>
                  <p className="fw-semibold mb-0">{selectedEmployee.name}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Email</small>
                  <p className="fw-semibold mb-0">{selectedEmployee.email}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Phone</small>
                  <p className="fw-semibold mb-0">{selectedEmployee.mob}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Designation</small>
                  <p className="fw-semibold mb-0">{selectedEmployee.designation}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Join Date</small>
                  <p className="fw-semibold mb-0">{selectedEmployee.joining_date}</p>
                </Col>
                <Col xs={12}>
                  <small className="text-muted">Performance Metrics</small>
                  <div className="mt-1">
                    {/* Since the API doesn't provide performance, you might want to remove this or handle it differently */}
                    {/* For now, showing a default badge or a message */}
                    <Badge bg="secondary">
                      {selectedEmployee.performance || "N/A"}
                    </Badge>
                  </div>
                </Col>
                {/* Add other fields from the API if needed, e.g., gender, dob, location, status, total_sales, doc_full */}
                <Col md={6}>
                  <small className="text-muted">Gender</small>
                  <p className="fw-semibold mb-0">{selectedEmployee.gender}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Date of Birth</small>
                  <p className="fw-semibold mb-0">{selectedEmployee.dob}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Location</small>
                  <p className="fw-semibold mb-0">{selectedEmployee.location}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Status</small>
                  <p className="fw-semibold mb-0">{selectedEmployee.status}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Experience</small>
                  <p className="fw-semibold mb-0">{selectedEmployee.experience}</p>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Total Sales</small>
                  <p className="fw-semibold mb-0">{selectedEmployee.total_sales}</p>
                </Col>
                {/* Image */}
                {selectedEmployee.doc_full && (
                  <Col xs={12}>
                    <small className="text-muted">Profile Picture</small>
                    <div className="mt-2">
                      <img
                        src={selectedEmployee.doc_full}
                        alt="Profile"
                        style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }}
                      />
                    </div>
                  </Col>
                )}
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={handleCloseModal}>
                Close
              </Button>
              <Button variant="primary">Edit</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default Employees;