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
//   Tabs,
//   Tab,
//   Badge,
//   Pagination,
// } from "react-bootstrap";
// import {
//   FaEye,
//   FaSearch,
//   FaPlus,
//   FaReceipt,
//   FaTruck,
//   FaShippingFast,
//   FaBox,
// } from "react-icons/fa";
// import { Link } from "react-router-dom";
// import toast from "react-hot-toast";
// import axios from "axios";

// const API_BASE = "https://nlfs.in/erp/index.php/Api";

// const PoVendor = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [poVendors, setPoVendors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [statusFilter, setStatusFilter] = useState("all");
  
//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10; // Number of items per page

//   // For demo: assume POs with IDs 2 and 4 have delivery memos
//   // In real app, this should come from backend or a separate API
//   const [posWithDeliveryMemo] = useState([2, 4]);

//   const isApprovedValue = (val) => {
//     if (!val) return false;
//     const s = String(val).trim().toLowerCase();
//     return ["yes", "approved", "true", "1"].includes(s);
//   };

//   const hasDeliveryMemo = (poId) => {
//     return posWithDeliveryMemo.includes(Number(poId));
//   };

//   // 🔹 Fetch real PO data from API
//   useEffect(() => {
//     const fetchPoVendors = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(`${API_BASE}/list_po`);

//         if (String(res.data?.success) === "1") {
//           const data = res.data.data || [];

//           // Enrich each PO with computed total from items array
//           const enrichedData = data.map((po) => {
//             // Calculate total from items array
//             let itemsTotal = 0;
//             if (po.items && Array.isArray(po.items)) {
//               itemsTotal = po.items.reduce((sum, item) => {
//                 return sum + (parseFloat(item.total) || 0);
//               }, 0);
//             }
            
//             return {
//               ...po,
//               itemsTotal: itemsTotal,
//             };
//           });

//           setPoVendors(enrichedData);
//         } else {
//           toast.error("Failed to fetch Purchase Orders");
//           setPoVendors([]);
//         }
//       } catch (error) {
//         console.error("Error fetching PO Vendors:", error);
//         toast.error("Error loading Purchase Orders");
//         setPoVendors([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPoVendors();
//   }, []);

//   // 🔹 Filter logic
//   const filteredPoVendors = useMemo(() => {
//     let result = poVendors.filter((po) => {
//       const term = searchTerm.toLowerCase();
//       return (
//         (po.po_no && po.po_no.toLowerCase().includes(term)) ||
//         (po.quotation_name && po.quotation_name.toLowerCase().includes(term)) ||
//         (po.delivery_schedule && po.delivery_schedule.toLowerCase().includes(term)) ||
//         (po.date && po.date.toLowerCase().includes(term)) ||
//         (String(po.itemsTotal).includes(term))
//       );
//     });

//     if (statusFilter === "pending") {
//       result = result.filter((po) => !isApprovedValue(po.po_approval));
//     } else if (statusFilter === "approved") {
//       result = result.filter((po) => isApprovedValue(po.po_approval));
//     }

//     return result;
//   }, [searchTerm, poVendors, statusFilter]);

//   // 🔹 Pagination logic
//   const indexLast = currentPage * itemsPerPage;
//   const indexFirst = indexLast - itemsPerPage;
//   const currentPoVendors = filteredPoVendors.slice(indexFirst, indexLast);
//   const totalPages = Math.ceil(filteredPoVendors.length / itemsPerPage);

//   const paginate = (page) => setCurrentPage(page);

//   // Reset to first page when search term or status filter changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, statusFilter]);

//   const isAssigned = (po) => {
//     return po.po_id != null && po.po_no != null;
//   };

//   const handleTabSelect = (k) => {
//     setStatusFilter(k);
//   };

//   return (
//     <Container fluid>
//       <Row>
//         <Col md="12">
//           <Card className="strpied-tabled-with-hover">
//             <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
//               <Row className="align-items-center">
//                 <Col>
//                   <Card.Title style={{ marginTop: "2rem", fontWeight: "700" }}>
//                     Vendor Purchase Orders
//                   </Card.Title>
//                 </Col>
//                 <Col className="d-flex justify-content-end align-items-center gap-2">
//                   <div className="position-relative">
//                     <Form.Control
//                       type="text"
//                       placeholder="Search by PO No, Quotation Name, WO No, Date, Total..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
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

//                   <Button as={Link} to="/directpo" className="btn btn-primary add-customer-btn">
//                     <FaPlus size={14} className="me-1" /> Add Direct PO
//                   </Button>
//                 </Col>
//               </Row>
//             </Card.Header>

//             <Card.Body className="table-full-width table-responsive">
//               <Tabs
//                 id="po-status-tabs"
//                 activeKey={statusFilter}
//                 onSelect={handleTabSelect}
//                 className="mb-4"
//               >
//                 <Tab eventKey="all" title="All" />
//                 <Tab eventKey="pending" title="Pending" />
//                 <Tab eventKey="approved" title="Approved" />
//               </Tabs>

//               <Table className="table table-striped table-hover">
//                 <thead>
//                   <tr>
//                     <th>Sr. No.</th>
//                     <th>PO Number</th>
//                     <th>Client Name</th>
//                     <th>WO No</th>
//                     {/* <th>Delivery Schedule</th> */}
//                     <th>Date</th>
//                     <th>Total</th>
//                     <th>Status</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td colSpan="9" className="text-center py-4">
//                         <Spinner animation="border" />
//                       </td>
//                     </tr>
//                   ) : currentPoVendors.length > 0 ? (
//                     currentPoVendors.map((po, index) => {
//                       const isApproved = isApprovedValue(po.po_approval);
//                       const deliveryMemoExists = hasDeliveryMemo(po.po_id);

//                       return (
//                         <tr key={po.po_id || `po-${index}`}>
//                           <td>{indexFirst + index + 1}</td>
//                           <td>{po.po_no || "TBA"}</td>
//                           <td>{po.quotation_name || "N/A"}</td>
//                           <td>{po.delivery_schedule || "Direct Po"}</td>
//                           {/* <td>{po.delivery_schedule || "N/A"}</td> */}
//                           <td>{po.date || "N/A"}</td>
//                           <td>
//                             {po.itemsTotal
//                               ? `₹${Number(po.itemsTotal).toLocaleString('en-IN')}`
//                               : "N/A"}
//                           </td>
//                           <td>
//                             <Badge
//                               className={`px-3 py-2 ${
//                                 isApproved
//                                   ? "bg-success text-light"
//                                   : "bg-warning text-dark"
//                               }`}
//                             >
//                               {isApproved ? "Approved" : "Pending"}
//                             </Badge>
//                           </td>
//                           <td>
//                             {isAssigned(po) ? (
//                               <>
//                                 <Button
//                                   as={Link}
//                                   to={`/povendor/${po.po_no}`}
//                                   className="buttonEye me-3"
//                                   title="View Vendor PO"
//                                 >
//                                   <FaEye />
//                                 </Button>
//                                 <Button
//                                   as={Link}
//                                   to={`/annextureviewer/${po.po_id}`}
//                                   variant="danger"
//                                   size="sm"
//                                   title="View Annexure"
//                                 >
//                                   <FaReceipt />
//                                 </Button>
//                               </>
//                             ) : (
//                               <span className="text-muted">No Actions</span>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })
//                   ) : (
//                     <tr>
//                       <td colSpan="9" className="text-center">
//                         No Vendor PO records found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </Table>

//               {totalPages > 1 && (
//                 <div className="d-flex justify-content-center p-3">
//                   <Pagination>
//                     <Pagination.First
//                       onClick={() => paginate(1)}
//                       disabled={currentPage === 1}
//                     />
//                     <Pagination.Prev
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                     />

//                     {Array.from({ length: totalPages }, (_, i) => (
//                       <Pagination.Item
//                         key={i + 1}
//                         active={currentPage === i + 1}
//                         onClick={() => paginate(i + 1)}
//                       >
//                         {i + 1}
//                       </Pagination.Item>
//                     ))}

//                     <Pagination.Next
//                       onClick={() => paginate(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                     />
//                     <Pagination.Last
//                       onClick={() => paginate(totalPages)}
//                       disabled={currentPage === totalPages}
//                     />
//                   </Pagination>
//                 </div>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default PoVendor;

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
  Tabs,
  Tab,
  Badge,
  Pagination,
} from "react-bootstrap";
import {
  FaEye,
  FaSearch,
  FaPlus,
  FaReceipt,
  FaTruck,
  FaShippingFast,
  FaBox,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import PoView from "../components/PoView";  

const API_BASE = "https://nlfs.in/erp/index.php/Api";

const PoVendor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [poVendors, setPoVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [enableApproval, setEnableApproval] = useState(true);

  // For demo: assume POs with IDs 2 and 4 have delivery memos
  // In real app, this should come from backend or a separate API
  const [posWithDeliveryMemo] = useState([2, 4]);

  const isApprovedValue = (val) => {
    if (!val) return false;
    const s = String(val).trim().toLowerCase();
    return ["yes", "approved", "true", "1"].includes(s);
  };

  const hasDeliveryMemo = (poId) => {
    return posWithDeliveryMemo.includes(Number(poId));
  };

  // 🔹 Fetch real PO data from API
  useEffect(() => {
    const fetchPoVendors = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/list_po`);

        if (String(res.data?.success) === "1") {
          const data = res.data.data || [];

          // Enrich each PO with computed total from items array
          const enrichedData = data.map((po) => {
            // Calculate total from items array
            let itemsTotal = 0;
            if (po.items && Array.isArray(po.items)) {
              itemsTotal = po.items.reduce((sum, item) => {
                return sum + (parseFloat(item.total) || 0);
              }, 0);
            }
            
            return {
              ...po,
              itemsTotal: itemsTotal,
            };
          });

          setPoVendors(enrichedData);
        } else {
          toast.error("Failed to fetch Purchase Orders");
          setPoVendors([]);
        }
      } catch (error) {
        console.error("Error fetching PO Vendors:", error);
        toast.error("Error loading Purchase Orders");
        setPoVendors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPoVendors();
  }, []);

  // 🔹 Filter logic
  const filteredPoVendors = useMemo(() => {
    let result = poVendors.filter((po) => {
      const term = searchTerm.toLowerCase();
      return (
        (po.po_no && po.po_no.toLowerCase().includes(term)) ||
        (po.quotation_name && po.quotation_name.toLowerCase().includes(term)) ||
        (po.delivery_schedule && po.delivery_schedule.toLowerCase().includes(term)) ||
        (po.date && po.date.toLowerCase().includes(term)) ||
        (String(po.itemsTotal).includes(term))
      );
    });

    if (statusFilter === "pending") {
      result = result.filter((po) => !isApprovedValue(po.po_approval));
    } else if (statusFilter === "approved") {
      result = result.filter((po) => isApprovedValue(po.po_approval));
    }

    return result;
  }, [searchTerm, poVendors, statusFilter]);

  // 🔹 Pagination logic
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentPoVendors = filteredPoVendors.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredPoVendors.length / itemsPerPage);

  const paginate = (page) => setCurrentPage(page);

  // Reset to first page when search term or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const isAssigned = (po) => {
    return po.po_id != null && po.po_no != null;
  };

  const handleTabSelect = (k) => {
    setStatusFilter(k);
  };

  // Handle opening the modal with selected PO data
  const handleViewPO = (po) => {
    setSelectedPO(po);
    setShowModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPO(null);
  };

  // Handle PO approval callback
  const handlePOApproved = (poId) => {
    // Update the PO in the list to reflect the approval
    setPoVendors(prevPoVendors => 
      prevPoVendors.map(po => 
        po.po_id === poId ? { ...po, po_approval: "yes" } : po
      )
    );
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
              <Row className="align-items-center">
                <Col>
                  <Card.Title style={{ marginTop: "2rem", fontWeight: "700" }}>
                    Vendor Purchase Orders
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search by PO No, Quotation Name, WO No, Date, Total..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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

                  <Button as={Link} to="/directpo" className="btn btn-primary add-customer-btn">
                    <FaPlus size={14} className="me-1" /> Add Direct PO
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="table-full-width table-responsive">
              <Tabs
                id="po-status-tabs"
                activeKey={statusFilter}
                onSelect={handleTabSelect}
                className="mb-4"
              >
                <Tab eventKey="all" title="All" />
                <Tab eventKey="pending" title="Pending" />
                <Tab eventKey="approved" title="Approved" />
              </Tabs>

              <Table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>PO Number</th>
                    <th>Client Name</th>
                    <th>WO No</th>
                    {/* <th>Delivery Schedule</th> */}
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        <Spinner animation="border" />
                      </td>
                    </tr>
                  ) : currentPoVendors.length > 0 ? (
                    currentPoVendors.map((po, index) => {
                      const isApproved = isApprovedValue(po.po_approval);
                      const deliveryMemoExists = hasDeliveryMemo(po.po_id);

                      return (
                        <tr key={po.po_id || `po-${index}`}>
                          <td>{indexFirst + index + 1}</td>
                          <td>{po.po_no || "TBA"}</td>
                          <td>{po.quotation_name || "N/A"}</td>
                          <td>{po.delivery_schedule || "Direct Po"}</td>
                          {/* <td>{po.delivery_schedule || "N/A"}</td> */}
                          <td>{po.date || "N/A"}</td>
                          <td>
                            {po.itemsTotal
                              ? `₹${Number(po.itemsTotal).toLocaleString('en-IN')}`
                              : "N/A"}
                          </td>
                          <td>
                            <Badge
                              className={`px-3 py-2 ${
                                isApproved
                                  ? "bg-success text-light"
                                  : "bg-warning text-dark"
                              }`}
                            >
                              {isApproved ? "Approved" : "Pending"}
                            </Badge>
                          </td>
                          <td>
                            {isAssigned(po) ? (
                              <>
                                <Button
                                  onClick={() => handleViewPO(po)}
                                  className="buttonEye me-3"
                                  title="View Vendor PO"
                                >
                                  <FaEye />
                                </Button>
                               
                              </>
                            ) : (
                              <span className="text-muted">No Actions</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center">
                        No Vendor PO records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

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

      {/* POPreviewModal */}
      {selectedPO && (
        <PoView
          show={showModal}
          onHide={handleCloseModal}
          poData={selectedPO}
          enableApproval={enableApproval}
          onPOApproved={handlePOApproved}
        />
      )}
    </Container>
  );
};

export default PoVendor;