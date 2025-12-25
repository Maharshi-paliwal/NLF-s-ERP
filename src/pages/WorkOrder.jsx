// // WorkOrder.jsx
// import React, { useState, useMemo, useEffect } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Table,
//   Spinner,
//   Pagination, // ⭐ ADDED
// } from "react-bootstrap";
// import { FaPlus, FaEye, FaEdit, FaSearch } from "react-icons/fa";
// import toast from "react-hot-toast";
// import { Link, useNavigate, useLocation } from "react-router-dom";

// const API_BASE_URL = "https://nlfs.in/erp/index.php/Api";

// export default function WorkOrder() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [workOrders, setWorkOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const location = useLocation();
//   const navigate = useNavigate();

//   // ⭐ PAGINATION STATE
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // Determine if this page was accessed from the Design section
//   const viewContext = location.state?.viewContext;

//   // Fetch work orders on component mount
//   useEffect(() => {
//     fetchWorkOrders();
//   }, []);

//   const fetchWorkOrders = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${API_BASE_URL}/list_work_order`);
//       const result = await response.json();

//       if (result.status === "true" && result.success === "1") {
//         setWorkOrders(result.data || []);
//       } else {
//         toast.error(result.message || "Failed to fetch work orders");
//         setWorkOrders([]);
//       }
//     } catch (error) {
//       console.error("Error fetching work orders:", error);
//       toast.error("Failed to load work orders. Please try again.");
//       setWorkOrders([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter work orders based on search term
//   const filteredWorkOrders = useMemo(() => {
//     if (!searchTerm) {
//       return workOrders;
//     }
//     const lowercasedSearchTerm = searchTerm.toLowerCase();
//     return workOrders.filter(
//       (wo) =>
//         wo.work_id?.toLowerCase().includes(lowercasedSearchTerm) ||
//         wo.quto_id?.toLowerCase().includes(lowercasedSearchTerm) ||
//         wo.general_design?.toLowerCase().includes(lowercasedSearchTerm)
//     );
//   }, [searchTerm, workOrders]);

//   // ⭐ PAGINATION BASED ON filteredWorkOrders
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentWorkOrders = filteredWorkOrders.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredWorkOrders.length / itemsPerPage);

//   const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

//   const handleView = (workId) => {
//     if (viewContext === "design") {
//       navigate(`/design/${workId}`, { state: { viewContext, mode: "view" } });
//     } else {
//       navigate(`/workorderform/${workId}`, {
//         state: { viewContext: viewContext || "operations", mode: "view" },
//       });
//     }
//   };

//   const handleEdit = (workId) => {
//     navigate(`/workorderform/${workId}`, {
//       state: { viewContext: viewContext || "operations", mode: "edit" },
//     });
//   };

//   return (
//     <Container fluid>
//       <Row>
//         <Col md="12">
//           <Card className="strpied-tabled-with-hover">
//             <Card.Header
//               style={{ backgroundColor: "#fff", borderBottom: "none" }}
//             >
//               <Row className="align-items-center">
//                 <Col>
//                   <Card.Title
//                     style={{ marginTop: "2rem", fontWeight: "700" }}
//                   >
//                     Work Order
//                   </Card.Title>
//                 </Col>

//                 <Col className="d-flex justify-content-end align-items-center gap-2">
//                   <div className="position-relative">
//                     <Form.Control
//                       type="text"
//                       placeholder="Search W.O., Quote ID, Design..."
//                       value={searchTerm}
//                       onChange={(e) => {
//                         setSearchTerm(e.target.value);
//                         setCurrentPage(1); // ⭐ reset page on search
//                       }}
//                       style={{ width: "20vw", paddingRight: "35px" }}
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

//                   <Button
//                     as={Link}
//                     to="/workorderform"
//                     state={{ viewContext, mode: "create" }}
//                     className="btn btn-primary add-customer-btn"
//                     style={{ width: "15vw" }}
//                   >
//                     <FaPlus size={14} className="me-1" /> Add Work Order
//                   </Button>
//                 </Col>
//               </Row>
//             </Card.Header>

//             <Card.Body className="table-full-width table-responsive">
//               {loading ? (
//                 <div className="text-center py-5">
//                   <Spinner animation="border" role="status">
//                     <span className="visually-hidden">Loading...</span>
//                   </Spinner>
//                 </div>
//               ) : (
//                 <>
//                   <Table className="table table-striped table-hover">
//                     <thead>
//                       <tr>
//                         <th>Sr. No.</th>
//                         <th>Work Order ID</th>
//                         <th>Quote ID</th>
//                         <th>General Design</th>
//                         <th>Expected Delivery</th>
//                         <th>Payment Term</th>
//                         <th>Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {currentWorkOrders.length > 0 ? (
//                         currentWorkOrders.map((workOrder, index) => (
//                           <tr key={workOrder.work_id}>
//                             {/* ⭐ Sr. No. with pagination offset */}
//                             <td>{indexOfFirstItem + index + 1}</td>
//                             <td>{workOrder.work_id}</td>
//                             <td>{workOrder.quto_id}</td>
//                             <td>{workOrder.general_design || "N/A"}</td>
//                             <td>{workOrder.exp_delivery_date || "N/A"}</td>
//                             <td>{workOrder.payment_term || "N/A"}</td>
//                             <td>
//                                   <Button
//                                as={Link}
//                                to={`/workorder/view/${workOrder.work_id}`}
//                                className="buttonEye me-3"
//                                title="View Work Order Details"
//                              >
//                                <FaEye />
//                              </Button>
//                               {/* <Button
//                                 onClick={() => handleEdit(workOrder.work_id)}
//                                 className="btn btn-warning"
//                                 title="Edit Work Order"
//                                 size="sm"
//                               >
//                                 <FaEdit />
//                               </Button> */}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="7" className="text-center">
//                             {searchTerm
//                               ? "No Work Orders found matching your search."
//                               : "No Work Orders available."}
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </Table>

//                   {/* ⭐ Pagination Controls */}
//                   {totalPages > 1 && (
//                     <div className="d-flex justify-content-center p-3">
//                       <Pagination>
//                         <Pagination.First
//                           onClick={() => handlePageChange(1)}
//                           disabled={currentPage === 1}
//                         />
//                         <Pagination.Prev
//                           onClick={() =>
//                             handlePageChange(currentPage - 1)
//                           }
//                           disabled={currentPage === 1}
//                         />
//                         {Array.from({ length: totalPages }, (_, i) => (
//                           <Pagination.Item
//                             key={i + 1}
//                             active={i + 1 === currentPage}
//                             onClick={() => handlePageChange(i + 1)}
//                           >
//                             {i + 1}
//                           </Pagination.Item>
//                         ))}
//                         <Pagination.Next
//                           onClick={() =>
//                             handlePageChange(currentPage + 1)
//                           }
//                           disabled={currentPage === totalPages}
//                         />
//                         <Pagination.Last
//                           onClick={() => handlePageChange(totalPages)}
//                           disabled={currentPage === totalPages}
//                         />
//                       </Pagination>
//                     </div>
//                   )}
//                 </>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// }
// src/pages/WorkOrder.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { FaPlus, FaEye, FaSearch, FaDownload } from "react-icons/fa";
import toast from "react-hot-toast";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PDFWorkorder from "../components/PDFWorkorder.jsx";

const API_BASE = "https://nlfs.in/erp/index.php/Api";

// ✅ same helper as Accounts.jsx
const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

export default function WorkOrder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // ⭐ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // PDF modal state (for direct download / preview)
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  // Determine if this page was accessed from the Design section
  const viewContext = location.state?.viewContext;

  // Fetch work orders on component mount (using axios like Accounts.jsx)
  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/list_work_order`);
        if (res.data?.success) {
          setWorkOrders(res.data.data || []);
        } else {
          toast.error(res.data?.message || "Failed to fetch work orders");
          setWorkOrders([]);
        }
      } catch (error) {
        console.error("Error fetching work orders:", error);
        toast.error("Failed to load work orders. Please try again.");
        setWorkOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  // Filter + sort work orders
  // ✅ ONLY include Account-approved work orders
  const filteredWorkOrders = useMemo(() => {
    // 1) keep only approved
    let data = (workOrders || []).filter((wo) =>
      isApprovedValue(wo.acc_approval)
    );

    // 2) sort latest first by work_id (like Accounts)
    data = data.sort((a, b) => Number(b.work_id) - Number(a.work_id));

    if (!searchTerm) return data;

    const q = searchTerm.toLowerCase();

    return data.filter(
      (wo) =>
        (wo.work_id || "").toLowerCase().includes(q) ||
        (wo.wo_no || "").toLowerCase().includes(q) ||
        (wo.quto_id || "").toLowerCase().includes(q) ||
        (wo.general_design || "").toLowerCase().includes(q) ||
        (wo.color_scheme || "").toLowerCase().includes(q)
    );
  }, [searchTerm, workOrders]);

  // ⭐ PAGINATION BASED ON filteredWorkOrders
  const totalPages = Math.max(
    1,
    Math.ceil(filteredWorkOrders.length / itemsPerPage)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWorkOrders = filteredWorkOrders.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const handleView = (workId) => {
    if (viewContext === "design") {
      navigate(`/design/${workId}`, { state: { viewContext, mode: "view" } });
    } else {
      navigate(`/workorderform/${workId}`, {
        state: { viewContext: viewContext || "operations", mode: "view" },
      });
    }
  };

  // PDF handlers (for direct download/preview)
  const handleShowPDFPreview = (workOrder) => {
    setSelectedWorkOrder(workOrder);
    setShowPDFPreview(true);
  };

  const handleClosePDFPreview = () => {
    setShowPDFPreview(false);
    setSelectedWorkOrder(null);
  };

  // reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
                    style={{ marginTop: "2rem", fontWeight: "700" }}
                  >
                    Work Order (Accounts Approved Only)
                  </Card.Title>
                </Col>

                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search W.O., Quote ID, Design..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
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
                    to="/workorderform"
                    state={{ viewContext, mode: "create" }}
                    className="btn btn-primary add-customer-btn"
                    style={{ width: "15vw" }}
                  >
                    <FaPlus size={14} className="me-1" /> Add Work Order
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="table-full-width table-responsive">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <>
                  <Table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Work Order No</th>
                        <th>Quote ID</th>
                        <th>General Design</th>
                        <th>Expected Delivery</th>
                        <th>Payment Term</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentWorkOrders.length > 0 ? (
                        currentWorkOrders.map((workOrder, index) => {
                          const srNo = indexOfFirstItem + index + 1;
                          return (
                            <tr key={workOrder.work_id}>
                              <td>{srNo}</td>
                              <td>{workOrder.wo_no || workOrder.work_id}</td>
                              <td>{workOrder.quto_id}</td>
                              <td>{workOrder.general_design || "N/A"}</td>
                              <td>{workOrder.exp_delivery_date || "N/A"}</td>
                              <td>{workOrder.payment_term || "N/A"}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  {/* View Work Order (existing behaviour) */}
                                  <Button
                                    className="buttonEye"
                                    title="View Work Order Details"
                                    onClick={() =>
                                      handleView(workOrder.work_id)
                                    }
                                  >
                                    <FaEye />
                                  </Button>

                                  {/* ✅ Direct download / PDF button */}
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    title="Download Work Order PDF"
                                    onClick={() =>
                                      handleShowPDFPreview(workOrder)
                                    }
                                  >
                                    <FaDownload />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">
                            {searchTerm
                              ? "No approved Work Orders found matching your search."
                              : "No approved Work Orders available."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  {/* ⭐ Pagination Controls */}
                  {filteredWorkOrders.length > itemsPerPage && (
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

      {/* ✅ PDF Preview / Download Modal (same component as Accounts) */}
      <PDFWorkorder
        show={showPDFPreview}
        onHide={handleClosePDFPreview}
        workOrderId={selectedWorkOrder?.work_id}
        workOrderData={selectedWorkOrder}
        enableAccountApproval={false} // no approval here, only download
        onAccountApproved={() => {}}
      />
    </Container>
  );
}
