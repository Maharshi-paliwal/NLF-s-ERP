// import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
// import {
//   Card,
//   Container,
//   Row,
//   Col,
//   Button,
//   Form,
//   Pagination,
//   Tabs,
//   Tab,
//   Badge,
//   Spinner,
//   Modal,
// } from "react-bootstrap";
// import { FaDownload, FaEye, FaReceipt } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";

// // ✅ LAZY-LOAD PDFPreview and POPreviewModal
// const PDFPreview = lazy(() => import("../components/PDFpreview.jsx"));
// const POPreviewModal = lazy(() => import("../components/POPreviewModal"));

// // ===============
// // UTILS
// // ===============
// const formatQuoteNumber = (quoteNo) => {
//   return quoteNo && quoteNo.trim() !== "" ? quoteNo : "-";
// };

// const isApprovedValue = (val) => {
//   if (!val) return false;
//   const s = String(val).trim().toLowerCase();
//   return ["yes", "approved", "true", "1"].includes(s);
// };

// const getRoundSortValue = (roundId) => {
//   if (!roundId || roundId === "Initial") return 0;
//   const match = roundId.match(/^R(\d+)$/);
//   return match ? parseInt(match[1]) : 0;
// };

// const formatDisplayDate = (dateStr) => {
//   if (!dateStr) return "-";
//   const parts = dateStr.split("-");
//   if (parts.length === 3 && parts[0].length === 4) {
//     const [y, m, d] = parts;
//     return `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
//   }
//   const d = new Date(dateStr);
//   if (!isNaN(d.getTime())) {
//     const dd = String(d.getDate()).padStart(2, "0");
//     const mm = String(d.getMonth() + 1).padStart(2, "0");
//     const yy = d.getFullYear();
//     return `${dd}-${mm}-${yy}`;
//   }
//   return dateStr;
// };

// // ====================
// // QUOTE TABLE COMPONENT
// // ====================
// const AdminApprovalTable = ({
//   quotes,
//   currentPage,
//   totalPages,
//   paginate,
//   onShowPDFPreview,
// }) => {
//   return (
//     <>
//       <div className="table-responsive">
//         <table className="table table-striped table-hover">
//           <thead>
//             <tr>
//               <th>Sr. No.</th>
//               <th>Quotation No</th>
//               <th>Client Name</th>
//               <th>Date</th>
//               <th>Amount (₹)</th>
//               <th>Admin Approval</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//            {quotes.length > 0 ? (
//   quotes.map((item, index) => {
//     const isAdminApproved = isApprovedValue(item.admin_approval);
//     const isRateApproved = isApprovedValue(item.rate_approval);
//     const isCreatedByAdmin = item.role === "admin";

//     return (
//       <tr key={item.key}>
//         <td>{(currentPage - 1) * 10 + index + 1}</td>
//         <td>
//           <div>
//             {item.formattedQuoteNo}
//             {/* Show a badge if this is an admin-created quote */}
//             {isCreatedByAdmin && (
//               <Badge className="ms-2" bg="info">Admin Created</Badge>
//             )}
//             {/* Show a badge if this is a rate-approved quote */}
//             {!isCreatedByAdmin && isRateApproved && (
//               <Badge className="ms-2" bg="success">Rate Approved</Badge>
//             )}
//           </div>
//         </td>
//         <td>{item.name}</td>
//         <td>{formatDisplayDate(item.date)}</td>
//         <td>₹ {parseFloat(item.total || 0).toLocaleString("en-IN")}</td>

//         {/* Checkbox */}
//         <td className="text-center">
//           <Form.Check
//             type="checkbox"
//             checked={isAdminApproved}
//             disabled={isAdminApproved}
//             onChange={() => {
//               if (!isAdminApproved) onShowPDFPreview(item);
//             }}
//           />
//         </td>

//         {/* Status + Download */}
//         <td>
//           <div className="d-flex align-items-center gap-2">
//             <Badge
//               className={`px-3 py-2 ${
//                 isAdminApproved
//                   ? "bg-success text-light"
//                   : "bg-warning text-dark"
//               }`}
//             >
//               {isAdminApproved ? "Approved" : "Pending"}
//             </Badge>

//             {isAdminApproved && (
//               <Button
//                 variant="outline-danger"
//                 size="sm"
//                 onClick={() => onShowPDFPreview(item)}
//               >
//                 <FaDownload />
//               </Button>
//             )}
//           </div>
//         </td>
//       </tr>
//     );
//   })
// ) : (
//               <tr>
//                 <td colSpan="7" className="text-center p-4">
//                   finding quotations
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {totalPages > 1 && (
//         <div className="d-flex justify-content-center p-3">
//           <Pagination>
//             {Array.from({ length: totalPages }, (_, i) => (
//               <Pagination.Item
//                 key={i + 1}
//                 active={i + 1 === currentPage}
//                 onClick={() => paginate(i + 1)}
//               >
//                 {i + 1}
//               </Pagination.Item>
//             ))}
//           </Pagination>
//         </div>
//       )}
//     </>
//   );
// };

// // ====================
// // PO TABLE COMPONENT
// // ====================
// const POApprovalTable = ({
//   poList,
//   currentPage,
//   totalPages,
//   paginate,
//   onShowPOPreview,
//   loading,
//   onViewVendorPO,
// }) => {
//   const isAssigned = (po) => {
//     return po.po_id != null && po.po_no != null;
//   };

//   return (
//     <>
//       <div className="table-responsive">
//         <table className="table table-striped table-hover">
//           <thead>
//             <tr>
//               <th>Sr. No.</th>
//               <th>Vendor Name</th>
//               <th>PO Number</th>
//               <th>Total Amount</th>
//               <th>Company</th>
//               <th>PO Approval</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan="8" className="text-center py-4">
//                   <Spinner animation="border" role="status">
//                     <span className="visually-hidden">Loading...</span>
//                   </Spinner>
//                 </td>
//               </tr>
//             ) : poList.length > 0 ? (
//               poList.map((po, index) => {
//                 const isApproved = isApprovedValue(po.po_approval);

//                 return (
//                   <tr key={po.po_id || `api-po-${index}`}>
//                     <td>{(currentPage - 1) * 10 + index + 1}</td>
//                     <td>{po.quotation_name || "Unknown"}</td>
//                     <td>{po.po_no || "TBA"}</td>
//                     <td>{po.total_amt ? `₹${Number(po.total_amt).toLocaleString('en-IN')}` : "N/A"}</td>
//                     <td>{po.company || "N/A"}</td>
                    
//                     <td className="text-center">
//                       <Form.Check
//                         type="checkbox"
//                         checked={isApproved}
//                         disabled={isApproved}
//                         onChange={() => {
//                           if (!isApproved) onShowPOPreview(po);
//                         }}
//                       />
//                     </td>
                    
//                     <td>
//                       <div className="d-flex align-items-center gap-2">
//                         <Badge
//                           className={`px-3 py-2 ${
//                             isApproved
//                               ? "bg-success text-light"
//                               : "bg-warning text-dark"
//                           }`}
//                         >
//                           {isApproved ? "Approved" : "Pending"}
//                         </Badge>

//                         {isApproved && (
//                           <Button
//                             variant="outline-danger"
//                             size="sm"
//                             onClick={() => onShowPOPreview(po)}
//                           >
//                             <FaDownload />
//                           </Button>
//                         )}
//                       </div>
//                     </td>
                    
//                     <td>
//                       {isAssigned(po) ? (
//                         <>
//                           <Button
//                             className="buttonEye me-3"
//                             title="View Vendor PO"
//                             onClick={() => onViewVendorPO(po)}
//                           >
//                             <FaEye />
//                           </Button>

//                           <Button
//                             as={Link}
//                             to={`/annextureviewer/${po.po_id}`}
//                             variant="danger"
//                             size="sm"
//                             title="View Annexure"
//                           >
//                             <FaReceipt />
//                           </Button>
//                         </>
//                       ) : (
//                         <Button
//                           as={Link}
//                           to="/annextureform/"
//                           variant="danger ms-1"
//                           size="sm"
//                           title="Create Vendor PO"
//                         >
//                           <FaDownload /> create
//                         </Button>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })
//             ) : (
//               <tr>
//                 <td colSpan="8" className="text-center p-4">
//                   No Vendor PO records found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {totalPages > 1 && (
//         <div className="d-flex justify-content-center p-3">
//           <Pagination>
//             {Array.from({ length: totalPages }, (_, i) => (
//               <Pagination.Item
//                 key={i + 1}
//                 active={i + 1 === currentPage}
//                 onClick={() => paginate(i + 1)}
//               >
//                 {i + 1}
//               </Pagination.Item>
//             ))}
//           </Pagination>
//         </div>
//       )}
//     </>
//   );
// };

// // ====================
// // MAIN COMPONENT
// // ====================
// const AdminApproval = () => {
//   const [mainTabKey, setMainTabKey] = useState("quote");
  
//   // Quote states
//   const [allQuotes, setAllQuotes] = useState([]);
//   const [quoteSearchTerm, setQuoteSearchTerm] = useState("");
//   const [quoteDebouncedSearch, setQuoteDebouncedSearch] = useState("");
//   const [quoteCurrentPage, setQuoteCurrentPage] = useState(1);
//   const [quoteStatusFilter, setQuoteStatusFilter] = useState("all");
//   const [showPDFPreview, setShowPDFPreview] = useState(false);
//   const [selectedQuoteItem, setSelectedQuoteItem] = useState(null);
  
//   // PO states
//   const [allPOs, setAllPOs] = useState([]);
//   const [poSearchTerm, setPOSearchTerm] = useState("");
//   const [poDebouncedSearch, setPODebouncedSearch] = useState("");
//   const [poCurrentPage, setPOCurrentPage] = useState(1);
//   const [poStatusFilter, setPOStatusFilter] = useState("all");
//   const [poLoading, setPoLoading] = useState(true);
//   const [showPOModal, setShowPOModal] = useState(false);
//   const [selectedPOForModal, setSelectedPOForModal] = useState(null);
//   const [poModalMode, setPOModalMode] = useState("view"); // "view" or "approve"

//   const navigate = useNavigate();
//   const itemsPerPage = 10;

//   // Debounce search terms
//   useEffect(() => {
//     const t = setTimeout(() => setQuoteDebouncedSearch(quoteSearchTerm), 300);
//     return () => clearTimeout(t);
//   }, [quoteSearchTerm]);
  
//   useEffect(() => {
//     const t = setTimeout(() => setPODebouncedSearch(poSearchTerm), 300);
//     return () => clearTimeout(t);
//   }, [poSearchTerm]);

//   // Initial data fetch
//   useEffect(() => {
//     fetchQuotationList();
//   }, []);
  
//   useEffect(() => {
//     fetchPOList();
//   }, []);

//   // ===============
//   // QUOTE FUNCTIONS
//   // ===============
//   const fetchQuotationList = async () => {
//     try {
//       const res = await fetch("https://nlfs.in/erp/index.php/Nlf_Erp/list_quotation");
//       const data = await res.json();

//       if (data.status === true || data.status === "true") {
//         const cleanedData = (data.data || []).filter((q) => q.quote_id && q.name);

//         const allQuotationRounds = cleanedData.map((quote) => {
//           const formattedQuoteNo = formatQuoteNumber(quote.quote_no);
//           const roundIdentifier =
//             quote.revise && quote.revise !== "Original" ? quote.revise : "Initial";

//           return {
//             key: `${quote.quote_id}-${roundIdentifier}`,
//             quote_id: quote.quote_id,
//             formattedQuoteNo,
//             name: quote.name,
//             email: quote.email || "",
//             mobile: quote.mobile || "",
//             total: quote.total || "0",
//             city: quote.city || "",
//             branch: quote.branch || "",
//             product: quote.product || "",
//             description: quote.desc || "",
//             roundIdentifier,
//             date: quote.date || "",
//             revise: quote.revise || "Original",
//             rate_approval: quote.rate_approval || "",
//             admin_approval: quote.admin_approval || "",
//             role: quote.role || "",
//           };
//         });

//         allQuotationRounds.sort((a, b) => {
//           const dateA = a.date ? new Date(a.date).getTime() : 0;
//           const dateB = b.date ? new Date(b.date).getTime() : 0;
//           if (dateB !== dateA) return dateB - dateA;
//           if (String(a.quote_id) === String(b.quote_id)) {
//             return getRoundSortValue(b.roundIdentifier) - getRoundSortValue(a.roundIdentifier);
//           }
//           return (parseInt(b.quote_id, 10) || 0) - (parseInt(a.quote_id, 10) || 0);
//         });

//         setAllQuotes([...allQuotationRounds]);
//       } else {
//         setAllQuotes([]);
//       }
//     } catch (error) {
//       console.error("FETCH ERROR:", error);
//       setAllQuotes([]);
//     }
//   };
  
//   const eligibleForAdminApproval = useMemo(() => {
//     return allQuotes.filter((q) => {
//       const isRateApproved = isApprovedValue(q.rate_approval);
//       const isCreatedByAdmin = q.role === "admin";
//       return isRateApproved || isCreatedByAdmin;
//     });
//   }, [allQuotes]);

//   const filteredQuotes = useMemo(() => {
//     let candidates = [...eligibleForAdminApproval];
//     if (quoteStatusFilter === "pending") {
//       candidates = candidates.filter((q) => !isApprovedValue(q.admin_approval));
//     } else if (quoteStatusFilter === "approved") {
//       candidates = candidates.filter((q) => isApprovedValue(q.admin_approval));
//     }
//     if (quoteDebouncedSearch.trim()) {
//       const s = quoteDebouncedSearch.toLowerCase();
//       candidates = candidates.filter((q) =>
//         (q.quote_id || "").toLowerCase().includes(s) ||
//         (q.name || "").toLowerCase().includes(s) ||
//         (q.date || "").toLowerCase().includes(s) ||
//         (q.formattedQuoteNo || "").toLowerCase().includes(s) ||
//         (q.roundIdentifier || "").toLowerCase().includes(s)
//       );
//     }
//     return candidates.sort((a, b) => {
//       const qA = parseInt(a.quote_id, 10) || 0;
//       const qB = parseInt(b.quote_id, 10) || 0;
//       if (qB !== qA) return qB - qA;
//       return getRoundSortValue(b.roundIdentifier) - getRoundSortValue(a.roundIdentifier);
//     });
//   }, [eligibleForAdminApproval, quoteStatusFilter, quoteDebouncedSearch]);
  
//   const quoteTotalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
//   const quoteIndexOfLast = quoteCurrentPage * itemsPerPage;
//   const quoteIndexOfFirst = quoteIndexOfLast - itemsPerPage;
//   const currentQuotes = useMemo(() => {
//     return filteredQuotes.slice(quoteIndexOfFirst, quoteIndexOfLast);
//   }, [filteredQuotes, quoteIndexOfFirst, quoteIndexOfLast]);

//   const handleQuoteSearchChange = (e) => {
//     setQuoteSearchTerm(e.target.value);
//     setQuoteCurrentPage(1);
//   };

//   const handleQuoteTabSelect = (key) => {
//     setQuoteStatusFilter(key);
//     setQuoteCurrentPage(1);
//   };

//   const quotePaginate = (num) => setQuoteCurrentPage(num);

//   const handleShowPDFPreview = (item) => {
//     setSelectedQuoteItem(item);
//     setShowPDFPreview(true);
//   };

//   const handleClosePDFPreview = () => {
//     setShowPDFPreview(false);
//     setSelectedQuoteItem(null);
//   };

//   const handleAdminApprovedFromModal = (approvedQuoteId) => {
//     setAllQuotes((prev) => {
//       const updatedQuotes = prev.map((q) =>
//         String(q.quote_id) === String(approvedQuoteId)
//           ? { ...q, admin_approval: "Yes" }
//           : q
//       );
//       return updatedQuotes;
//     });
    
//     if (selectedQuoteItem && String(selectedQuoteItem.quote_id) === String(approvedQuoteId)) {
//       setSelectedQuoteItem(prev => ({ ...prev, admin_approval: "Yes" }));
//     }
//   };
  
//   // ===============
//   // PO FUNCTIONS
//   // ===============
//   const fetchPOList = async () => {
//     setPoLoading(true);
//     try {
//       const res = await fetch("https://nlfs.in/erp/index.php/Api/list_po");
//       const apiResponse = await res.json();
//       const data = apiResponse.data || [];
//       setAllPOs(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("FETCH ERROR:", error);
//       setAllPOs([]);
//     } finally {
//       setPoLoading(false);
//     }
//   };
  
//   const filteredPOs = useMemo(() => {
//     let result = allPOs.filter((po) => {
//       const term = poDebouncedSearch.toLowerCase();
//       return (
//         (po.quotation_name && po.quotation_name.toLowerCase().includes(term)) ||
//         (po.po_no && po.po_no.toLowerCase().includes(term)) ||
//         (po.total_amt && String(po.total_amt).toLowerCase().includes(term)) ||
//         (po.company && po.company.toLowerCase().includes(term))
//       );
//     });
//     if (poStatusFilter === "pending") {
//       result = result.filter((po) => !isApprovedValue(po.po_approval));
//     } else if (poStatusFilter === "approved") {
//       result = result.filter((po) => isApprovedValue(po.po_approval));
//     }
//     return result;
//   }, [allPOs, poStatusFilter, poDebouncedSearch]);
  
//   const poTotalPages = Math.ceil(filteredPOs.length / itemsPerPage);
//   const poIndexOfLast = poCurrentPage * itemsPerPage;
//   const poIndexOfFirst = poIndexOfLast - itemsPerPage;
//   const currentPOs = useMemo(() => {
//     return filteredPOs.slice(poIndexOfFirst, poIndexOfLast);
//   }, [filteredPOs, poIndexOfFirst, poIndexOfLast]);
  
//   const handlePOSearchChange = (e) => {
//     setPOSearchTerm(e.target.value);
//     setPOCurrentPage(1);
//   };

//   const handlePOTabSelect = (key) => {
//     setPOStatusFilter(key);
//     setPOCurrentPage(1);
//   };

//   const poPaginate = (num) => setPOCurrentPage(num);

//   const handleShowPOPreview = (item) => {
//     setSelectedPOForModal(item);
//     setPOModalMode("approve");
//     setShowPOModal(true);
//   };

//   const handlePOApprovedFromModal = async (approvedPOId) => {
//     // Refresh the entire PO list from the server for instant update
//     await fetchPOList();
    
//     // Close the modal
//     setShowPOModal(false);
//     setSelectedPOForModal(null);
//   };

//   const handleViewVendorPO = (po) => {
//     setSelectedPOForModal(po);
//     setPOModalMode("view");
//     setShowPOModal(true);
//   };

//   const handleClosePOModal = () => {
//     setShowPOModal(false);
//     setSelectedPOForModal(null);
//   };

//   // ===============
//   // RENDER
//   // ===============
//   return (
//     <Container fluid>
//       <Row>
//         <Col md="12">
//           <Card className="strpied-tabled-with-hover">
//             <Card.Header
//               style={{
//                 backgroundColor: "#fff",
//                 marginBottom: "2rem",
//                 borderBottom: "none",
//               }}
//             >
//               <Row className="align-items-center">
//                 <Col>
//                   <Card.Title style={{ marginTop: "1rem", fontWeight: "700" }}>
//                     Admin Approval
//                   </Card.Title>
//                 </Col>
//               </Row>
//             </Card.Header>

//             <Card.Body>
//               <Tabs
//                 id="main-approval-tabs"
//                 activeKey={mainTabKey}
//                 onSelect={(k) => setMainTabKey(k)}
//                 className="mb-4"
//               >
//                 {/* ============ QUOTE TAB ============ */}
//                 <Tab eventKey="quote" title="Quote Approval">
//                   <Row className="mb-3">
//                     <Col className="d-flex justify-content-end align-items-center">
//                       <Form.Control
//                         type="text"
//                         placeholder="Search by Name, Quote No, Round..."
//                         value={quoteSearchTerm}
//                         onChange={handleQuoteSearchChange}
//                         className="custom-searchbar-input nav-search"
//                         style={{ width: "20vw" }}
//                       />
//                     </Col>
//                   </Row>

//                   <Tabs
//                     id="quote-status-tabs"
//                     activeKey={quoteStatusFilter}
//                     onSelect={handleQuoteTabSelect}
//                     className="mb-4"
//                   >
//                     <Tab eventKey="all" title="All" />
//                     <Tab eventKey="pending" title="Pending Admin" />
//                     <Tab eventKey="approved" title="Approved by Admin" />
//                   </Tabs>

//                   <AdminApprovalTable
//                     quotes={currentQuotes}
//                     currentPage={quoteCurrentPage}
//                     totalPages={quoteTotalPages}
//                     paginate={quotePaginate}
//                     onShowPDFPreview={handleShowPDFPreview}
//                   />
//                 </Tab>

//                 {/* ============ PO TAB ============ */}
//                 <Tab eventKey="po" title="PO Approval">
//                   <Row className="mb-3">
//                     <Col className="d-flex justify-content-end align-items-center">
//                       <Form.Control
//                         type="text"
//                         placeholder="Search by Vendor Name, PO No, Amount, Company..."
//                         value={poSearchTerm}
//                         onChange={handlePOSearchChange}
//                         className="custom-searchbar-input nav-search"
//                         style={{ width: "20vw" }}
//                       />
//                     </Col>
//                   </Row>

//                   <Tabs
//                     id="po-status-tabs"
//                     activeKey={poStatusFilter}
//                     onSelect={handlePOTabSelect}
//                     className="mb-4"
//                   >
//                     <Tab eventKey="all" title="All" />
//                     <Tab eventKey="pending" title="Pending" />
//                     <Tab eventKey="approved" title="Approved" />
//                   </Tabs>

//                   <POApprovalTable
//                     poList={currentPOs}
//                     currentPage={poCurrentPage}
//                     totalPages={poTotalPages}
//                     paginate={poPaginate}
//                     onShowPOPreview={handleShowPOPreview}
//                     loading={poLoading}
//                     onViewVendorPO={handleViewVendorPO}
//                   />
//                 </Tab>
//               </Tabs>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* ============ MODALS ============ */}
      
//       {/* Quote PDF Preview Modal */}
//       <Suspense fallback={null}>
//         {showPDFPreview && (
//           <PDFPreview
//             show={showPDFPreview}
//             onHide={handleClosePDFPreview}
//             quoteId={selectedQuoteItem?.quote_id}
//             quotationData={selectedQuoteItem}
//             enableRateApproval={false}
//             enableAdminApproval={true}
//             onAdminApproved={handleAdminApprovedFromModal}
//           />
//         )}
//       </Suspense>
      
//       {/* PO Preview Modal - Used for both viewing and approving */}
//       <Suspense fallback={null}>
//         {showPOModal && (
//           <POPreviewModal
//             show={showPOModal}
//             onHide={handleClosePOModal}
//             poData={selectedPOForModal}
//             enableApproval={poModalMode === "approve"}
//             onPOApproved={handlePOApprovedFromModal}
//           />
//         )}
//       </Suspense>
//     </Container>
//   );
// };

// export default AdminApproval;

import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Form,
  Pagination,
  Tabs,
  Tab,
  Badge,
  Spinner,
  Modal,
} from "react-bootstrap";
import { FaDownload, FaEye, FaReceipt, FaFileDownload } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

// ✅ LAZY-LOAD PDFPreview and POPreviewModal
const PDFPreview = lazy(() => import("../components/PDFpreview.jsx"));
const POPreviewModal = lazy(() => import("../components/POPreviewModal"));

// ===============
// UTILS
// ===============
const formatQuoteNumber = (quoteNo) => {
  return quoteNo && quoteNo.trim() !== "" ? quoteNo : "-";
};

const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

const getRoundSortValue = (roundId) => {
  if (!roundId || roundId === "Initial") return 0;
  const match = roundId.match(/^R(\d+)$/);
  return match ? parseInt(match[1]) : 0;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}-${mm}-${yy}`;
  }
  return dateStr;
};

// ====================
// QUOTE TABLE COMPONENT
// ====================
const AdminApprovalTable = ({
  quotes,
  currentPage,
  totalPages,
  paginate,
  onShowPDFPreview,
}) => {
  return (
    <>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Quotation No</th>
              <th>Client Name</th>
              <th>Date</th>
              <th>Amount (₹)</th>
              <th>Admin Approval</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
           {quotes.length > 0 ? (
  quotes.map((item, index) => {
    const isAdminApproved = isApprovedValue(item.admin_approval);
    const isRateApproved = isApprovedValue(item.rate_approval);
    const isCreatedByAdmin = item.role === "admin";

    return (
      <tr key={item.key}>
        <td>{(currentPage - 1) * 10 + index + 1}</td>
        <td>
          <div>
            {item.formattedQuoteNo}
            {/* Show a badge if this is an admin-created quote */}
            {isCreatedByAdmin && (
              <Badge className="ms-2" bg="info">Admin Created</Badge>
            )}
            {/* Show a badge if this is a rate-approved quote */}
            {!isCreatedByAdmin && isRateApproved && (
              <Badge className="ms-2" bg="success">Rate Approved</Badge>
            )}
          </div>
        </td>
        <td>{item.name}</td>
        <td>{formatDisplayDate(item.date)}</td>
        <td>₹ {parseFloat(item.total || 0).toLocaleString("en-IN")}</td>

        {/* Checkbox */}
        <td className="text-center">
          <Form.Check
            type="checkbox"
            checked={isAdminApproved}
            disabled={isAdminApproved}
            onChange={() => {
              if (!isAdminApproved) onShowPDFPreview(item);
            }}
          />
        </td>

        {/* Status + Download */}
        <td>
          <div className="d-flex align-items-center gap-2">
            <Badge
              className={`px-3 py-2 ${
                isAdminApproved
                  ? "bg-success text-light"
                  : "bg-warning text-dark"
              }`}
            >
              {isAdminApproved ? "Approved" : "Pending"}
            </Badge>

            {isAdminApproved && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onShowPDFPreview(item)}
              >
                <FaFileDownload />
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
  })
) : (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  finding quotations
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center p-3">
          <Pagination>
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      )}
    </>
  );
};

// ====================
// PO TABLE COMPONENT
// ====================
const POApprovalTable = ({
  poList,
  currentPage,
  totalPages,
  paginate,
  onShowPOPreview,
  loading,
  onViewVendorPO,
}) => {
  const isAssigned = (po) => {
    return po.po_id != null && po.po_no != null;
  };

  return (
    <>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Vendor Name</th>
              <th>PO Number</th>
              <th>Total Amount</th>
              <th>Company</th>
              <th>PO Approval</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </td>
              </tr>
            ) : poList.length > 0 ? (
              poList.map((po, index) => {
                const isApproved = isApprovedValue(po.po_approval);

                return (
                  <tr key={po.po_id || `api-po-${index}`}>
                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                    <td>{po.quotation_name || "Unknown"}</td>
                    <td>{po.po_no || "TBA"}</td>
                    <td>{po.total_amt ? `₹${Number(po.total_amt).toLocaleString('en-IN')}` : "N/A"}</td>
                    <td>{po.company || "N/A"}</td>
                    
                    <td className="text-center">
                      <Form.Check
                        type="checkbox"
                        checked={isApproved}
                        disabled={isApproved}
                        onChange={() => {
                          if (!isApproved) onShowPOPreview(po);
                        }}
                      />
                    </td>
                    
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Badge
                          className={`px-3 py-2 ${
                            isApproved
                              ? "bg-success text-light"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {isApproved ? "Approved" : "Pending"}
                        </Badge>

                        {isApproved && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => onShowPOPreview(po)}
                          >
                            <FaDownload />
                          </Button>
                        )}
                      </div>
                    </td>
                    
                    <td>
                      {isAssigned(po) ? (
                        <>
                          <Button
                            className="buttonEye me-3"
                            title="View Vendor PO"
                            onClick={() => onViewVendorPO(po)}
                          >
                            <FaEye />
                          </Button>

                        </>
                      ) : (
                        <Button
                          as={Link}
                          to="/annextureform/"
                          variant="danger ms-1"
                          size="sm"
                          title="Create Vendor PO"
                        >
                          <FaDownload /> create
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  No Vendor PO records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center p-3">
          <Pagination>
            {Array.from({ length: totalPages }, (_, i) => (
              <Pagination.Item
                key={i + 1}
                active={i + 1 === currentPage}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      )}
    </>
  );
};

// ====================
// MAIN COMPONENT
// ====================
const AdminApproval = () => {
  const [mainTabKey, setMainTabKey] = useState("quote");
  
  // Quote states
  const [allQuotes, setAllQuotes] = useState([]);
  const [quoteSearchTerm, setQuoteSearchTerm] = useState("");
  const [quoteDebouncedSearch, setQuoteDebouncedSearch] = useState("");
  const [quoteCurrentPage, setQuoteCurrentPage] = useState(1);
  const [quoteStatusFilter, setQuoteStatusFilter] = useState("all");
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [selectedQuoteItem, setSelectedQuoteItem] = useState(null);
  
  // PO states
  const [allPOs, setAllPOs] = useState([]);
  const [poSearchTerm, setPOSearchTerm] = useState("");
  const [poDebouncedSearch, setPODebouncedSearch] = useState("");
  const [poCurrentPage, setPOCurrentPage] = useState(1);
  const [poStatusFilter, setPOStatusFilter] = useState("all");
  const [poLoading, setPoLoading] = useState(true);
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedPOForModal, setSelectedPOForModal] = useState(null);
  const [poModalMode, setPOModalMode] = useState("view"); // "view" or "approve"

  const navigate = useNavigate();
  const itemsPerPage = 10;

  // Debounce search terms
  useEffect(() => {
    const t = setTimeout(() => setQuoteDebouncedSearch(quoteSearchTerm), 300);
    return () => clearTimeout(t);
  }, [quoteSearchTerm]);
  
  useEffect(() => {
    const t = setTimeout(() => setPODebouncedSearch(poSearchTerm), 300);
    return () => clearTimeout(t);
  }, [poSearchTerm]);

  // Initial data fetch
  useEffect(() => {
    fetchQuotationList();
  }, []);
  
  useEffect(() => {
    fetchPOList();
  }, []);

  // ===============
  // QUOTE FUNCTIONS
  // ===============
  const fetchQuotationList = async () => {
    try {
      const res = await fetch("https://nlfs.in/erp/index.php/Nlf_Erp/list_quotation");
      const data = await res.json();

      if (data.status === true || data.status === "true") {
        const cleanedData = (data.data || []).filter((q) => q.quote_id && q.name);

        const allQuotationRounds = cleanedData.map((quote) => {
          const formattedQuoteNo = formatQuoteNumber(quote.quote_no);
          const roundIdentifier =
            quote.revise && quote.revise !== "Original" ? quote.revise : "Initial";

          return {
            key: `${quote.quote_id}-${roundIdentifier}`,
            quote_id: quote.quote_id,
            formattedQuoteNo,
            name: quote.name,
            email: quote.email || "",
            mobile: quote.mobile || "",
            total: quote.total || "0",
            city: quote.city || "",
            branch: quote.branch || "",
            product: quote.product || "",
            description: quote.desc || "",
            roundIdentifier,
            date: quote.date || "",
            revise: quote.revise || "Original",
            rate_approval: quote.rate_approval || "",
            admin_approval: quote.admin_approval || "",
            role: quote.role || "",
          };
        });

        allQuotationRounds.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          if (dateB !== dateA) return dateB - dateA;
          if (String(a.quote_id) === String(b.quote_id)) {
            return getRoundSortValue(b.roundIdentifier) - getRoundSortValue(a.roundIdentifier);
          }
          return (parseInt(b.quote_id, 10) || 0) - (parseInt(a.quote_id, 10) || 0);
        });

        setAllQuotes([...allQuotationRounds]);
      } else {
        setAllQuotes([]);
      }
    } catch (error) {
      console.error("FETCH ERROR:", error);
      setAllQuotes([]);
    }
  };
  
  const eligibleForAdminApproval = useMemo(() => {
    return allQuotes.filter((q) => {
      const isRateApproved = isApprovedValue(q.rate_approval);
      const isCreatedByAdmin = q.role === "admin";
      return isRateApproved || isCreatedByAdmin;
    });
  }, [allQuotes]);

  const filteredQuotes = useMemo(() => {
    let candidates = [...eligibleForAdminApproval];
    if (quoteStatusFilter === "pending") {
      candidates = candidates.filter((q) => !isApprovedValue(q.admin_approval));
    } else if (quoteStatusFilter === "approved") {
      candidates = candidates.filter((q) => isApprovedValue(q.admin_approval));
    }
    if (quoteDebouncedSearch.trim()) {
      const s = quoteDebouncedSearch.toLowerCase();
      candidates = candidates.filter((q) =>
        (q.quote_id || "").toLowerCase().includes(s) ||
        (q.name || "").toLowerCase().includes(s) ||
        (q.date || "").toLowerCase().includes(s) ||
        (q.formattedQuoteNo || "").toLowerCase().includes(s) ||
        (q.roundIdentifier || "").toLowerCase().includes(s)
      );
    }
    return candidates.sort((a, b) => {
      const qA = parseInt(a.quote_id, 10) || 0;
      const qB = parseInt(b.quote_id, 10) || 0;
      if (qB !== qA) return qB - qA;
      return getRoundSortValue(b.roundIdentifier) - getRoundSortValue(a.roundIdentifier);
    });
  }, [eligibleForAdminApproval, quoteStatusFilter, quoteDebouncedSearch]);
  
  const quoteTotalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
  const quoteIndexOfLast = quoteCurrentPage * itemsPerPage;
  const quoteIndexOfFirst = quoteIndexOfLast - itemsPerPage;
  const currentQuotes = useMemo(() => {
    return filteredQuotes.slice(quoteIndexOfFirst, quoteIndexOfLast);
  }, [filteredQuotes, quoteIndexOfFirst, quoteIndexOfLast]);

  const handleQuoteSearchChange = (e) => {
    setQuoteSearchTerm(e.target.value);
    setQuoteCurrentPage(1);
  };

  const handleQuoteTabSelect = (key) => {
    setQuoteStatusFilter(key);
    setQuoteCurrentPage(1);
  };

  const quotePaginate = (num) => setQuoteCurrentPage(num);

  const handleShowPDFPreview = (item) => {
    setSelectedQuoteItem(item);
    setShowPDFPreview(true);
  };

  const handleClosePDFPreview = () => {
    setShowPDFPreview(false);
    setSelectedQuoteItem(null);
  };

  const handleAdminApprovedFromModal = (approvedQuoteId) => {
    setAllQuotes((prev) => {
      const updatedQuotes = prev.map((q) =>
        String(q.quote_id) === String(approvedQuoteId)
          ? { ...q, admin_approval: "Yes" }
          : q
      );
      return updatedQuotes;
    });
    
    if (selectedQuoteItem && String(selectedQuoteItem.quote_id) === String(approvedQuoteId)) {
      setSelectedQuoteItem(prev => ({ ...prev, admin_approval: "Yes" }));
    }
  };
  
  // ===============
  // PO FUNCTIONS
  // ===============
  const fetchPOList = async () => {
    setPoLoading(true);
    try {
      const res = await fetch("https://nlfs.in/erp/index.php/Api/list_po");
      const apiResponse = await res.json();
      const data = apiResponse.data || [];
      setAllPOs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("FETCH ERROR:", error);
      setAllPOs([]);
    } finally {
      setPoLoading(false);
    }
  };
  
  const filteredPOs = useMemo(() => {
    let result = allPOs.filter((po) => {
      const term = poDebouncedSearch.toLowerCase();
      return (
        (po.quotation_name && po.quotation_name.toLowerCase().includes(term)) ||
        (po.po_no && po.po_no.toLowerCase().includes(term)) ||
        (po.total_amt && String(po.total_amt).toLowerCase().includes(term)) ||
        (po.company && po.company.toLowerCase().includes(term))
      );
    });
    if (poStatusFilter === "pending") {
      result = result.filter((po) => !isApprovedValue(po.po_approval));
    } else if (poStatusFilter === "approved") {
      result = result.filter((po) => isApprovedValue(po.po_approval));
    }
    return result;
  }, [allPOs, poStatusFilter, poDebouncedSearch]);
  
  const poTotalPages = Math.ceil(filteredPOs.length / itemsPerPage);
  const poIndexOfLast = poCurrentPage * itemsPerPage;
  const poIndexOfFirst = poIndexOfLast - itemsPerPage;
  const currentPOs = useMemo(() => {
    return filteredPOs.slice(poIndexOfFirst, poIndexOfLast);
  }, [filteredPOs, poIndexOfFirst, poIndexOfLast]);
  
  const handlePOSearchChange = (e) => {
    setPOSearchTerm(e.target.value);
    setPOCurrentPage(1);
  };

  const handlePOTabSelect = (key) => {
    setPOStatusFilter(key);
    setPOCurrentPage(1);
  };

  const poPaginate = (num) => setPOCurrentPage(num);

  const handleShowPOPreview = (item) => {
    setSelectedPOForModal(item);
    setPOModalMode("approve");
    setShowPOModal(true);
  };

  const handlePOApprovedFromModal = async (approvedPOId) => {
    // Refresh the entire PO list from the server for instant update
    await fetchPOList();
    
    // Close the modal
    setShowPOModal(false);
    setSelectedPOForModal(null);
  };

  const handleViewVendorPO = (po) => {
    setSelectedPOForModal(po);
    setPOModalMode("view");
    setShowPOModal(true);
  };

  const handleClosePOModal = () => {
    setShowPOModal(false);
    setSelectedPOForModal(null);
  };

  // ===============
  // RENDER
  // ===============
  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header
              style={{
                backgroundColor: "#fff",
                marginBottom: "2rem",
                borderBottom: "none",
              }}
            >
              <Row className="align-items-center">
                <Col>
                  <Card.Title style={{ marginTop: "1rem", fontWeight: "700" }}>
                    Admin Approval
                  </Card.Title>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              <Tabs
                id="main-approval-tabs"
                activeKey={mainTabKey}
                onSelect={(k) => setMainTabKey(k)}
                className="mb-4"
              >
                {/* ============ QUOTE TAB ============ */}
                <Tab eventKey="quote" title="Quote Approval">
                  <Row className="mb-3">
                    <Col className="d-flex justify-content-end align-items-center">
                      <Form.Control
                        type="text"
                        placeholder="Search by Name, Quote No, Round..."
                        value={quoteSearchTerm}
                        onChange={handleQuoteSearchChange}
                        className="custom-searchbar-input nav-search"
                        style={{ width: "20vw" }}
                      />
                    </Col>
                  </Row>

                  <Tabs
                    id="quote-status-tabs"
                    activeKey={quoteStatusFilter}
                    onSelect={handleQuoteTabSelect}
                    className="mb-4"
                  >
                    <Tab eventKey="all" title="All" />
                    <Tab eventKey="pending" title="Pending Admin" />
                    <Tab eventKey="approved" title="Approved by Admin" />
                  </Tabs>

                  <AdminApprovalTable
                    quotes={currentQuotes}
                    currentPage={quoteCurrentPage}
                    totalPages={quoteTotalPages}
                    paginate={quotePaginate}
                    onShowPDFPreview={handleShowPDFPreview}
                  />
                </Tab>

                {/* ============ PO TAB ============ */}
                <Tab eventKey="po" title="PO Approval">
                  <Row className="mb-3">
                    <Col className="d-flex justify-content-end align-items-center">
                      <Form.Control
                        type="text"
                        placeholder="Search by Vendor Name, PO No, Amount, Company..."
                        value={poSearchTerm}
                        onChange={handlePOSearchChange}
                        className="custom-searchbar-input nav-search"
                        style={{ width: "20vw" }}
                      />
                    </Col>
                  </Row>

                  <Tabs
                    id="po-status-tabs"
                    activeKey={poStatusFilter}
                    onSelect={handlePOTabSelect}
                    className="mb-4"
                  >
                    <Tab eventKey="all" title="All" />
                    <Tab eventKey="pending" title="Pending" />
                    <Tab eventKey="approved" title="Approved" />
                  </Tabs>

                  <POApprovalTable
                    poList={currentPOs}
                    currentPage={poCurrentPage}
                    totalPages={poTotalPages}
                    paginate={poPaginate}
                    onShowPOPreview={handleShowPOPreview}
                    loading={poLoading}
                    onViewVendorPO={handleViewVendorPO}
                  />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ============ MODALS ============ */}
      
      {/* Quote PDF Preview Modal */}
      <Suspense fallback={null}>
        {showPDFPreview && (
          <PDFPreview
            show={showPDFPreview}
            onHide={handleClosePDFPreview}
            quoteId={selectedQuoteItem?.quote_id}
            quotationData={selectedQuoteItem}
            enableRateApproval={false}
            enableAdminApproval={true}
            onAdminApproved={handleAdminApprovedFromModal}
          />
        )}
      </Suspense>
      
      {/* PO Preview Modal - Used for both viewing and approving */}
      <Suspense fallback={null}>
        {showPOModal && (
          <POPreviewModal
            show={showPOModal}
            onHide={handleClosePOModal}
            poData={selectedPOForModal}
            enableApproval={poModalMode === "approve"}
            onPOApproved={handlePOApprovedFromModal}
          />
        )}
      </Suspense>
    </Container>
  );
};

export default AdminApproval;