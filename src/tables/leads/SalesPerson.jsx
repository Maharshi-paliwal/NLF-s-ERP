// // src/pages/SalesPerson.jsx
// import React, { useState, useEffect, useMemo } from "react";
// import toast from "react-hot-toast";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import {
//   Card,
//   Container,
//   Row,
//   Col,
//   Button,
//   Pagination,
//   Form,
//   Modal,
//   Tabs,
//   Tab,
//   Badge,
// } from "react-bootstrap";
// import { FaEye, FaPlus } from "react-icons/fa";

// const API_BASE = "https://nlfs.in/erp/index.php/Erp";
// const SALES_API_BASE = "https://nlfs.in/erp/index.php/Api";
// const QUOTATION_API_BASE = "https://nlfs.in/erp/index.php/Nlf_Erp";
// const LEADS_PER_PAGE = 10;

// const normalizeApiDate = (value) => {
//   if (!value) return "";
//   const parts = value.split("-");
//   if (parts.length !== 3) return "";
//   if (parts[0].length === 4) return value;
//   const [dd, mm, yyyy] = parts;
//   return `${yyyy}-${mm}-${dd}`;
// };

// const calculateReminderDate = (interactionDate) => {
//   if (!interactionDate) return "N/A";
//   const lastInteraction = new Date(interactionDate + "T00:00:00");
//   if (isNaN(lastInteraction.getTime())) return "N/A";
//   lastInteraction.setDate(lastInteraction.getDate() + 15);
//   const year = lastInteraction.getFullYear();
//   const month = String(lastInteraction.getMonth() + 1).padStart(2, "0");
//   const day = String(lastInteraction.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const getCountdownStatus = (targetDateString) => {
//   if (!targetDateString || targetDateString === "N/A") {
//     return { text: "N/A", style: "secondary" };
//   }
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const targetDate = new Date(targetDateString + "T00:00:00");
//   if (isNaN(targetDate.getTime())) return { text: "N/A", style: "secondary" };
//   targetDate.setHours(0, 0, 0, 0);
//   const diffTime = targetDate.getTime() - today.getTime();
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//   if (diffDays < 0) {
//     return { text: `${Math.abs(diffDays)} days overdue!`, style: "danger" };
//   } else if (diffDays === 0) {
//     return { text: "Due Today!", style: "warning" };
//   } else if (diffDays <= 3) {
//     return { text: `${diffDays} days left`, style: "warning" };
//   } else {
//     return { text: `${diffDays} days left`, style: "success" };
//   }
// };

// const formatDate = (dateString) => {
//   if (!dateString) return "";
//   const [year, month, day] = dateString.split("-");
//   return `${day}-${month}-${year}`;
// };

// const formatDisplayDate = (dateString) => {
//   if (!dateString) return "N/A";
//   const parts = dateString.split("-");
//   if (parts.length === 3) {
//     if (parts[0].length === 4) {
//       return `${parts[2]}-${parts[1]}-${parts[0]}`;
//     }
//   }
//   return dateString;
// };

// export default function SalesPerson() {
//   const { salespersonId: routeSalespersonId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const stateSalespersonId = location.state?.salespersonId;
//   const stateSalespersonName = location.state?.salespersonName;

//   const activeSalespersonId = routeSalespersonId || stateSalespersonId || null;
//   const activeSalespersonName = stateSalespersonName || "";

//   // Tab state
//   const [activeTab, setActiveTab] = useState("clients");

//   // Clients/Leads data
//   const [allLeadsWithSalesperson, setAllLeadsWithSalesperson] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   // Quotations data
//   const [quotations, setQuotations] = useState([]);
//   const [loadingQuotations, setLoadingQuotations] = useState(false);
//   const [quotationSearchTerm, setQuotationSearchTerm] = useState("");
//   const [quotationCurrentPage, setQuotationCurrentPage] = useState(1);

//   // Modal states
//   const [showModal, setShowModal] = useState(false);
//   const [selectedLead, setSelectedLead] = useState(null);

//   const [newInteraction, setNewInteraction] = useState({
//     date: new Date().toISOString().substring(0, 10),
//     mode: "",
//     location: "",
//     status: "",
//     moms: "",
//   });

//   const handleViewLeadDetails = (lead) => {
//     navigate(`/sales-details/${lead.leadListId}`, {
//       state: {
//         leadId: lead.leadListId,
//         salespersonId: lead.salespersonId,
//         clientName: lead.clientName,
//         salespersonName: lead.salespersonName,
//         stage: lead.stage,
//         remark: lead.remark,
//       },
//     });
//     toast.success(`Fetching details for ${lead.clientName}...`);
//   };

//   const handleShowModal = (lead) => {
//     setSelectedLead(lead);
//     setNewInteraction({
//       date: new Date().toISOString().substring(0, 10),
//       mode: "",
//       location: "",
//       status: "",
//       moms: "",
//     });
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedLead(null);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setNewInteraction((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedLead) {
//       toast.error("No client selected");
//       return;
//     }

//     const leadId =
//       selectedLead.leadListId ?? selectedLead.leadId ?? selectedLead.id;
//     const empId = selectedLead.salespersonId;

//     if (!leadId || !empId) {
//       toast.error("Lead ID or Salesperson ID is missing.");
//       return;
//     }

//     const payload = {
//       lead_id: String(leadId),
//       emp_id: String(empId),
//       last_interaction: newInteraction.date,
//       status: newInteraction.status,
//       nxt_visit_date: "",
//       project_name: selectedLead.project_name || selectedLead.ProjectName || "",
//       FirstDate: "",
//       clients: selectedLead.client_name || selectedLead.clientName || "N/A",
//       follow_up: "",
//       date_of_interaction: newInteraction.date,
//       details: newInteraction.location,
//       modee: newInteraction.mode,
//       statuss: "Active",
//       notes: newInteraction.moms,
//       nxt_date: "",
//     };

//     console.log("add_sales_log payload (SalesPerson):", payload);

//     try {
//       const res = await fetch(`${SALES_API_BASE}/add_sales_log`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json();
//       console.log("add_sales_log response (SalesPerson):", data);

//       if (data.status && data.success === "1") {
//         toast.success("Interaction log added successfully!");
//         handleCloseModal();
//       } else {
//         toast.error(data.message || "Failed to add sales log.");
//       }
//     } catch (err) {
//       console.error("Error adding sales log:", err);
//       toast.error("Something went wrong while adding sales log.");
//     }
//   };

//   // Fetch clients data
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!activeSalespersonId) {
//         toast.error("No salesperson selected.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         toast.loading("Fetching clients for salesperson...", {
//           id: "fetch-clients",
//         });

//         const res = await fetch(`${API_BASE}/fetch_client_data`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ emp_id: String(activeSalespersonId) }),
//         });

//         const data = await res.json();
//         console.log("fetch_client_data response:", data);

//         if (
//           (data.status === true || data.status === "true") &&
//           (data.success === "1" || data.success === 1) &&
//           Array.isArray(data.data)
//         ) {
//           const mapped = data.data.map((item) => {
//             const lastInteraction = normalizeApiDate(item.last_interaction);
//             const reminderDate = calculateReminderDate(lastInteraction);
//             const countdown = getCountdownStatus(reminderDate);

//             return {
//               leadId: item.lead_id || item.id,
//               leadListId: item.lead_id || item.id,
//               clientId: item.client_id || null,
//               salespersonId: activeSalespersonId,
//               salespersonName: activeSalespersonName,
//               clientName: item.client_name || "N/A",
//               ProjectName: item.project_name || "N/A",
//               Firstdate: item.visiting_date || "N/A",
//               visitDate: lastInteraction,
//               reminderDate,
//               countdown,
//               followUp: item.follow_up || "",
//               stage: item.stage,
//               remark: item.remark,
//             };
//           });

//           const sorted = mapped.sort(
//             (a, b) =>
//               new Date(b.visitDate || "1970-01-01") -
//               new Date(a.visitDate || "1970-01-01")
//           );

//           setAllLeadsWithSalesperson(sorted);
//           toast.success("Client data loaded successfully!", {
//             id: "fetch-clients",
//           });
//         } else {
//           console.error(data.message || "Failed to fetch clients.");
//           toast.error(data.message || "Failed to fetch clients", {
//             id: "fetch-clients",
//           });
//           setAllLeadsWithSalesperson([]);
//         }
//       } catch (error) {
//         console.error(error);
//         toast.error("Failed to load client data", { id: "fetch-clients" });
//         setAllLeadsWithSalesperson([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [activeSalespersonId, activeSalespersonName]);

//   // Fetch quotations data
//   useEffect(() => {
//     const fetchQuotations = async () => {
//       if (!activeSalespersonId) {
//         return;
//       }

//       try {
//         setLoadingQuotations(true);
//         toast.loading("Fetching quotations...", { id: "fetch-quotations" });

//         const res = await fetch(`${QUOTATION_API_BASE}/get_quotation_by_id`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ emp: String(activeSalespersonId) }),
//         });

//         const data = await res.json();
//         console.log("get_quotation_by_id response:", data);

//         if (
//           (data.status === "true" || data.status === true) &&
//           data.success === "1" &&
//           Array.isArray(data.data)
//         ) {
//           setQuotations(data.data);
//           toast.success("Quotations loaded successfully!", {
//             id: "fetch-quotations",
//           });
//         } else {
//           console.error(data.message || "Failed to fetch quotations.");
//           toast.error(data.message || "No quotations found", {
//             id: "fetch-quotations",
//           });
//           setQuotations([]);
//         }
//       } catch (error) {
//         console.error(error);
//         toast.error("Failed to load quotations", { id: "fetch-quotations" });
//         setQuotations([]);
//       } finally {
//         setLoadingQuotations(false);
//       }
//     };

//     if (activeTab === "quotations") {
//       fetchQuotations();
//     }
//   }, [activeSalespersonId, activeTab]);

//   // Handle quotation approval
//   const handleApproveQuotation = async (quoteId, currentApprovalStatus) => {
//     if (currentApprovalStatus === "approved") {
//       toast.info("This quotation is already approved");
//       return;
//     }

//     try {
//       toast.loading("Approving quotation...", { id: "approve-quotation" });

//       // Mock API call - replace with actual endpoint when available
//       const res = await fetch(`${QUOTATION_API_BASE}/approve_sales_quotation`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           quote_id: String(quoteId),
//           sales_approval: "approved",
//           emp_id: String(activeSalespersonId),
//         }),
//       });

//       const data = await res.json();
//       console.log("approve_sales_quotation response:", data);

//       if (data.status === "true" && data.success === "1") {
//         toast.success("Quotation approved successfully!", {
//           id: "approve-quotation",
//         });

//         // Update local state
//         setQuotations((prev) =>
//           prev.map((q) =>
//             q.quote_id === quoteId ? { ...q, sales_approval: "approved" } : q
//           )
//         );
//       } else {
//         toast.error(data.message || "Failed to approve quotation", {
//           id: "approve-quotation",
//         });
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Error approving quotation", { id: "approve-quotation" });
//     }
//   };

//   // Filter + pagination for clients
//   const filteredLeads = useMemo(() => {
//     let baseLeads = allLeadsWithSalesperson;

//     if (activeSalespersonId) {
//       baseLeads = baseLeads.filter(
//         (lead) => String(lead.salespersonId) === String(activeSalespersonId)
//       );
//     }

//     if (!searchTerm) return baseLeads;

//     const lower = searchTerm.toLowerCase();
//     return baseLeads.filter((lead) => {
//       const searchable = [
//         lead.salespersonName,
//         lead.salespersonId,
//         lead.clientName,
//         lead.ProjectName,
//         lead.leadId,
//         lead.Firstdate,
//       ]
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase();
//       return searchable.includes(lower);
//     });
//   }, [allLeadsWithSalesperson, searchTerm, activeSalespersonId]);

//   const totalPages = Math.ceil(filteredLeads.length / LEADS_PER_PAGE);

//   const currentLeads = useMemo(() => {
//     const start = (currentPage - 1) * LEADS_PER_PAGE;
//     return filteredLeads.slice(start, start + LEADS_PER_PAGE);
//   }, [filteredLeads, currentPage]);

//   // Filter + pagination for quotations
//   const filteredQuotations = useMemo(() => {
//     if (!quotationSearchTerm) return quotations;

//     const lower = quotationSearchTerm.toLowerCase();
//     return quotations.filter((quote) => {
//       const searchable = [
//         quote.quote_no,
//         quote.name,
//         quote.project,
//         quote.quote_id,
//       ]
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase();
//       return searchable.includes(lower);
//     });
//   }, [quotations, quotationSearchTerm]);

//   const totalQuotationPages = Math.ceil(
//     filteredQuotations.length / LEADS_PER_PAGE
//   );

//   const currentQuotations = useMemo(() => {
//     const start = (quotationCurrentPage - 1) * LEADS_PER_PAGE;
//     return filteredQuotations.slice(start, start + LEADS_PER_PAGE);
//   }, [filteredQuotations, quotationCurrentPage]);

//   useEffect(() => {
//     if (currentPage > totalPages && totalPages > 0) {
//       setCurrentPage(totalPages);
//     }
//   }, [totalPages, currentPage]);

//   useEffect(() => {
//     if (quotationCurrentPage > totalQuotationPages && totalQuotationPages > 0) {
//       setQuotationCurrentPage(totalQuotationPages);
//     }
//   }, [totalQuotationPages, quotationCurrentPage]);

//   const paginate = (page) => setCurrentPage(page);
//   const paginateQuotations = (page) => setQuotationCurrentPage(page);

//   const renderPagination = (current, total, onPageChange) => {
//     if (total <= 1) return null;
//     let items = [];
//     items.push(
//       <Pagination.First
//         key="first"
//         onClick={() => onPageChange(1)}
//         disabled={current === 1}
//       />
//     );
//     items.push(
//       <Pagination.Prev
//         key="prev"
//         onClick={() => onPageChange(current - 1)}
//         disabled={current === 1}
//       />
//     );

//     let startPage = Math.max(1, current - 2);
//     let endPage = Math.min(total, current + 2);
//     if (endPage - startPage < 4) {
//       if (current <= 3) endPage = Math.min(total, 5);
//       else if (current > total - 2) startPage = Math.max(1, total - 4);
//     }

//     if (startPage > 1)
//       items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
//     for (let i = startPage; i <= endPage; i++) {
//       items.push(
//         <Pagination.Item
//           key={i}
//           active={i === current}
//           onClick={() => onPageChange(i)}
//         >
//           {i}
//         </Pagination.Item>
//       );
//     }
//     if (endPage < total)
//       items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);

//     items.push(
//       <Pagination.Next
//         key="next"
//         onClick={() => onPageChange(current + 1)}
//         disabled={current === total}
//       />
//     );
//     items.push(
//       <Pagination.Last
//         key="last"
//         onClick={() => onPageChange(total)}
//         disabled={current === total}
//       />
//     );
//     return items;
//   };

//   return (
//     <Container fluid>
//       <Row>
//         <Col md="12">
//           <Card className="strpied-tabled-with-hover">
//             <Tabs
//               id="salesperson-tabs"
//               activeKey={activeTab}
//               onSelect={(k) => {
//                 setActiveTab(k);
//                 setSearchTerm("");
//                 setQuotationSearchTerm("");
//                 setCurrentPage(1);
//                 setQuotationCurrentPage(1);
//               }}
//               className="mb-0 card-top-tabs"
//             >
//               <Tab eventKey="clients" title="Clients" />
//               <Tab eventKey="quotations" title="Quotations" />
//             </Tabs>

//             <Card.Body className="p-4">
//               <Row className="align-items-center mb-3">
//                 <Col md={6}>
//                   <Card.Title
//                     style={{
//                       fontWeight: "700",
//                       fontSize: "1.5rem",
//                       marginBottom: "0",
//                     }}
//                   >
//                     {activeTab === "clients" ? "Sales" : "Quotations"}
//                     {activeSalespersonId && (
//                       <span
//                         style={{
//                           fontSize: "0.9rem",
//                           marginLeft: "10px",
//                           fontWeight: 400,
//                         }}
//                       >
//                         — {activeTab === "clients" ? "Clients" : "Quotations"}{" "}
//                         of{" "}
//                         <strong>
//                           {activeSalespersonName ||
//                             `ID ${activeSalespersonId}`}
//                         </strong>
//                       </span>
//                     )}
//                   </Card.Title>
//                 </Col>
//                 <Col md={6} className="d-flex justify-content-end">
//                   {activeTab === "clients" ? (
//                     <Form.Control
//                       type="text"
//                       placeholder="Search by Client, Company, Lead ID..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       style={{ width: "300px" }}
//                     />
//                   ) : (
//                     <Form.Control
//                       type="text"
//                       placeholder="Search by Quote No, Client, Project..."
//                       value={quotationSearchTerm}
//                       onChange={(e) => setQuotationSearchTerm(e.target.value)}
//                       style={{ width: "300px" }}
//                     />
//                   )}
//                 </Col>
//               </Row>

//               {/* Clients Tab Content */}
//               {activeTab === "clients" && (
//                 <>
//                   {loading ? (
//                     <div className="text-center p-5">Loading clients...</div>
//                   ) : currentLeads.length > 0 ? (
//                     <>
//                       <div className="table-responsive">
//                         <table className="table table-striped table-hover mb-0">
//                           <thead className="table-light">
//                             <tr>
//                               <th>Sr. No</th>
//                               <th>Client</th>
//                               <th>Project</th>
//                               <th>Date</th>
//                               <th>Actions</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {currentLeads.map((lead, index) => (
//                               <tr key={lead.leadId || lead.clientName}>
//                                 <td>
//                                   {(currentPage - 1) * LEADS_PER_PAGE +
//                                     index +
//                                     1}
//                                 </td>
//                                 <td>
//                                   {lead.clientName} <br />
//                                   <small className="text-muted"></small>
//                                 </td>
//                                 <td>{lead.ProjectName}</td>
//                                 <td>{lead.Firstdate}</td>
//                                 <td>
//                                   <Button
//                                     size="sm"
//                                     variant="primary"
//                                     onClick={() => handleViewLeadDetails(lead)}
//                                     title="View Lead Details"
//                                     className="me-2"
//                                   >
//                                     <FaEye />
//                                   </Button>
//                                   <Button
//                                     className="add-customer-btn"
//                                     size="sm"
//                                     onClick={() => handleShowModal(lead)}
//                                     title="Add Interaction Log"
//                                   >
//                                     <FaPlus />
//                                   </Button>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>

//                       {totalPages > 1 && (
//                         <div className="d-flex justify-content-center mt-3">
//                           <Pagination size="sm">
//                             {renderPagination(currentPage, totalPages, paginate)}
//                           </Pagination>
//                         </div>
//                       )}
//                     </>
//                   ) : (
//                     <div className="text-center py-4">
//                       {activeSalespersonId
//                         ? "No clients found for this salesperson (or matching your search)."
//                         : "No clients found matching your search."}
//                     </div>
//                   )}
//                 </>
//               )}

//               {/* Quotations Tab Content */}
//               {activeTab === "quotations" && (
//                 <>
//                   {loadingQuotations ? (
//                     <div className="text-center p-5">Loading quotations...</div>
//                   ) : currentQuotations.length > 0 ? (
//                     <>
//                       <div className="table-responsive">
//                         <table className="table table-striped table-hover mb-0">
//                           <thead className="table-light">
//                             <tr>
//                               <th>Sr. No</th>
//                               <th>Quotation No</th>
//                               <th>Client Name</th>
//                               <th>Project</th>
//                               <th>Date</th>
//                               <th>Amount (₹)</th>
//                               <th>Sales Approve</th>
//                               <th>Status</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {currentQuotations.map((quote, index) => {
//                               const isApproved =
//                                 quote.sales_approval === "approved" ||
//                                 quote.sales_approval === "1";

//                               return (
//                                 <tr key={quote.quote_id}>
//                                   <td>
//                                     {(quotationCurrentPage - 1) *
//                                       LEADS_PER_PAGE +
//                                       index +
//                                       1}
//                                   </td>
//                                   <td>{quote.quote_no || "N/A"}</td>
//                                   <td>{quote.name || "N/A"}</td>
//                                   <td>{quote.project || "N/A"}</td>
//                                   <td>{formatDisplayDate(quote.date)}</td>
//                                   <td>
//                                     ₹{" "}
//                                     {parseFloat(
//                                       quote.total || 0
//                                     ).toLocaleString("en-IN")}
//                                   </td>
//                                   <td className="text-center">
//                                     <Form.Check
//                                       type="checkbox"
//                                       checked={isApproved}
//                                       disabled={isApproved}
//                                       onChange={() =>
//                                         handleApproveQuotation(
//                                           quote.quote_id,
//                                           quote.sales_approval
//                                         )
//                                       }
//                                     />
//                                   </td>
//                                   <td>
//                                     <Badge
//                                       bg={
//                                         isApproved
//                                           ? "success"
//                                           : quote.status === "draft"
//                                           ? "secondary"
//                                           : "warning"
//                                       }
//                                       className="px-3 py-2"
//                                     >
//                                       {isApproved
//                                         ? "Approved"
//                                         : quote.status === "draft"
//                                         ? "Draft"
//                                         : "Pending"}
//                                     </Badge>
//                                   </td>
//                                 </tr>
//                               );
//                             })}
//                           </tbody>
//                         </table>
//                       </div>

//                       {totalQuotationPages > 1 && (
//                         <div className="d-flex justify-content-center mt-3">
//                           <Pagination size="sm">
//                             {renderPagination(
//                               quotationCurrentPage,
//                               totalQuotationPages,
//                               paginateQuotations
//                             )}
//                           </Pagination>
//                         </div>
//                       )}
//                     </>
//                   ) : (
//                     <div className="text-center py-4">
//                       No quotations found for this salesperson (or matching your
//                       search).
//                     </div>
//                   )}
//                 </>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Add Interaction Modal */}
//       <Modal show={showModal} onHide={handleCloseModal} size="lg">
//         <Modal.Header closeButton className="bg-success text-white">
//           <Modal.Title>
//             <FaPlus className="me-2" /> Add Client Interaction
//           </Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleSubmit}>
//           <Modal.Body>
//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3" controlId="formInteractionDate">
//                   <Form.Label>
//                     Date of Interaction <span className="text-danger">*</span>
//                   </Form.Label>
//                   <Form.Control
//                     type="date"
//                     name="date"
//                     value={newInteraction.date}
//                     onChange={handleChange}
//                     required
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3" controlId="formInteractionMode">
//                   <Form.Label>Mode</Form.Label>
//                   <Form.Select
//                     name="mode"
//                     value={newInteraction.mode}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">Select Interaction Mode</option>
//                     <option value="Initial Meeting">Initial Meeting</option>
//                     <option value="Virtual Meeting">Virtual Meeting</option>
//                     <option value="Client Site Visit">Client Site Visit</option>
//                     <option value="Phone Call">Phone Call</option>
//                     <option value="Email/Text">Email/Text</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Form.Group className="mb-3" controlId="formInteractionLocation">
//               <Form.Label>Location / Details</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="location"
//                 value={newInteraction.location}
//                 onChange={handleChange}
//                 placeholder="Enter location or specific details"
//               />
//             </Form.Group>
//             <Form.Group className="mb-3" controlId="formInteractionStatus">
//               <Form.Label>Status</Form.Label>
//               <Form.Select
//                 name="status"
//                 value={newInteraction.status}
//                 onChange={handleChange}
//               >
//                 <option value="">Select Status</option>
//                 <option value="Requirement Gathering">
//                   Requirement Gathering
//                 </option>
//                 <option value="Technical Discussion">
//                   Technical Discussion
//                 </option>
//                 <option value="Quotation Sent">Quotation Sent</option>
//                 <option value="Revised">Revised</option>
//                 <option value="Accepted">Accepted</option>
//                 <option value="Rejected">Rejected</option>
//               </Form.Select>
//             </Form.Group>
//             <Form.Group className="mb-3" controlId="formInteractionMOMs">
//               <Form.Label>
//                 Minutes of Meeting (MOMs) / Notes{" "}
//                 <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 as="textarea"
//                 rows={5}
//                 name="moms"
//                 value={newInteraction.moms}
//                 onChange={handleChange}
//                 placeholder="Summarize the discussion, next steps, and key decisions..."
//                 required
//               />
//             </Form.Group>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="success">
//               Save Interaction Log
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </Container>
//   );
// }

// src/pages/SalesPerson.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Card, Container, Row, Col, Button, Pagination, Form, Modal, Tabs, Tab, Badge } from "react-bootstrap";
import { FaEye, FaPlus } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const API_BASE = "https://nlfs.in/erp/index.php/Erp";
const SALES_API_BASE = "https://nlfs.in/erp/index.php/Api";
const QUOTATION_API_BASE = "https://nlfs.in/erp/index.php/Nlf_Erp";
const LEADS_PER_PAGE = 10;

// Helper function to check if value represents approval
const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

const normalizeApiDate = (value) => {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length !== 3) return "";
  if (parts[0].length === 4) return value;
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd}`;
};

const calculateReminderDate = (interactionDate) => {
  if (!interactionDate) return "N/A";
  const lastInteraction = new Date(interactionDate + "T00:00:00");
  if (isNaN(lastInteraction.getTime())) return "N/A";
  lastInteraction.setDate(lastInteraction.getDate() + 15);
  const year = lastInteraction.getFullYear();
  const month = String(lastInteraction.getMonth() + 1).padStart(2, "0");
  const day = String(lastInteraction.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCountdownStatus = (targetDateString) => {
  if (!targetDateString || targetDateString === "N/A") {
    return { text: "N/A", style: "secondary" };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(targetDateString + "T00:00:00");
  if (isNaN(targetDate.getTime())) return { text: "N/A", style: "secondary" };
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)} days overdue!`, style: "danger" };
  } else if (diffDays === 0) {
    return { text: "Due Today!", style: "warning" };
  } else if (diffDays <= 3) {
    return { text: `${diffDays} days left`, style: "warning" };
  } else {
    return { text: `${diffDays} days left`, style: "success" };
  }
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return "N/A";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  return dateString;
};

export default function SalesPerson() {
  const { salespersonId: routeSalespersonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const stateSalespersonId = location.state?.salespersonId;
  const stateSalespersonName = location.state?.salespersonName;

  const activeSalespersonId = routeSalespersonId || stateSalespersonId || null;
  const activeSalespersonName = stateSalespersonName || "";

  const [activeTab, setActiveTab] = useState("clients");
  
  // Add debug logging
  useEffect(() => {
    console.log("🔍 SalesPerson Page Loaded");
    console.log("Route Salesperson ID:", routeSalespersonId);
    console.log("State Salesperson ID:", stateSalespersonId);
    console.log("Active Salesperson ID:", activeSalespersonId);
    console.log("Active Salesperson Name:", activeSalespersonName);
  }, [routeSalespersonId, stateSalespersonId, activeSalespersonId, activeSalespersonName]);
  const [allLeadsWithSalesperson, setAllLeadsWithSalesperson] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [quotations, setQuotations] = useState([]);
  const [loadingQuotations, setLoadingQuotations] = useState(false);
  const [quotationSearchTerm, setQuotationSearchTerm] = useState("");
  const [quotationCurrentPage, setQuotationCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [approvingQuoteId, setApprovingQuoteId] = useState(null);

  const [newInteraction, setNewInteraction] = useState({
    date: new Date().toISOString().substring(0, 10),
    mode: "",
    location: "",
    status: "",
    moms: "",
  });

  const handleViewLeadDetails = (lead) => {
    console.log("Viewing lead details:", lead);
  };

  const handleShowModal = (lead) => {
    setSelectedLead(lead);
    setNewInteraction({
      date: new Date().toISOString().substring(0, 10),
      mode: "",
      location: "",
      status: "",
      moms: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewInteraction((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLead) {
      alert("No client selected");
      return;
    }

    const leadId = selectedLead.leadListId ?? selectedLead.leadId ?? selectedLead.id;
    const empId = selectedLead.salespersonId;

    if (!leadId || !empId) {
      alert("Lead ID or Salesperson ID is missing.");
      return;
    }

    const payload = {
      lead_id: String(leadId),
      emp_id: String(empId),
      last_interaction: newInteraction.date,
      status: newInteraction.status,
      nxt_visit_date: "",
      project_name: selectedLead.project_name || selectedLead.ProjectName || "",
      FirstDate: "",
      clients: selectedLead.client_name || selectedLead.clientName || "N/A",
      follow_up: "",
      date_of_interaction: newInteraction.date,
      details: newInteraction.location,
      modee: newInteraction.mode,
      statuss: "Active",
      notes: newInteraction.moms,
      nxt_date: "",
    };

    console.log("add_sales_log payload:", payload);

    try {
      const res = await fetch(`${SALES_API_BASE}/add_sales_log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("add_sales_log response:", data);

      if (data.status && data.success === "1") {
        alert("Interaction log added successfully!");
        handleCloseModal();
      } else {
        alert(data.message || "Failed to add sales log.");
      }
    } catch (err) {
      console.error("Error adding sales log:", err);
      alert("Something went wrong while adding sales log.");
    }
  };

  // Fetch clients data
  useEffect(() => {
    const fetchData = async () => {
      if (!activeSalespersonId) {
        alert("No salesperson selected.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const res = await fetch(`${API_BASE}/fetch_client_data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emp_id: String(activeSalespersonId) }),
        });

        const data = await res.json();
        console.log("fetch_client_data response:", data);

        if (
          (data.status === true || data.status === "true") &&
          (data.success === "1" || data.success === 1) &&
          Array.isArray(data.data)
        ) {
          const mapped = data.data.map((item) => {
            const lastInteraction = normalizeApiDate(item.last_interaction);
            const reminderDate = calculateReminderDate(lastInteraction);
            const countdown = getCountdownStatus(reminderDate);

            return {
              leadId: item.lead_id || item.id,
              leadListId: item.lead_id || item.id,
              clientId: item.client_id || null,
              salespersonId: activeSalespersonId,
              salespersonName: activeSalespersonName,
              clientName: item.client_name || "N/A",
              ProjectName: item.project_name || "N/A",
              Firstdate: item.visiting_date || "N/A",
              visitDate: lastInteraction,
              reminderDate,
              countdown,
              followUp: item.follow_up || "",
              stage: item.stage,
              remark: item.remark,
            };
          });

          const sorted = mapped.sort(
            (a, b) =>
              new Date(b.visitDate || "1970-01-01") -
              new Date(a.visitDate || "1970-01-01")
          );

          setAllLeadsWithSalesperson(sorted);
        } else {
          console.error(data.message || "Failed to fetch clients.");
          setAllLeadsWithSalesperson([]);
        }
      } catch (error) {
        console.error(error);
        setAllLeadsWithSalesperson([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeSalespersonId, activeSalespersonName]);

  // Fetch quotations data
  useEffect(() => {
    const fetchQuotations = async () => {
      if (!activeSalespersonId) {
        console.warn("No salesperson selected for quotations.");
        return;
      }

      try {
        setLoadingQuotations(true);

        const res = await fetch(`${QUOTATION_API_BASE}/get_emp_by_id`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emp: String(activeSalespersonId) }),
        });

        const data = await res.json();
        console.log("get_emp_by_id response:", data);

        if (
          (data.status === true || data.status === "true") &&
          data.message &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          setQuotations(data.data);
        } else if (Array.isArray(data.data) && data.data.length === 0) {
          console.log("No quotations found for this salesperson.");
          setQuotations([]);
        } else {
          console.error(data.message || "Failed to fetch quotations.");
          setQuotations([]);
        }
      } catch (error) {
        console.error(error);
        setQuotations([]);
      } finally {
        setLoadingQuotations(false);
      }
    };

    if (activeTab === "quotations") {
      fetchQuotations();
    }
  }, [activeSalespersonId, activeTab]);

  // Handle quotation approval (same logic as rate approval in PDFPreview)
  const handleApproveQuotation = async (quote) => {
    const currentApprovalStatus = quote.emp_approval || quote.rate_approval;
    
    if (isApprovedValue(currentApprovalStatus)) {
      alert("This quotation is already approved by sales");
      return;
    }

    const confirmed = window.confirm(
      `Approve quotation ${quote.quote_no}?\n\nOnce approved, this action cannot be reverted.`
    );

    if (!confirmed) return;

    const quoteId = quote.quote_id;
    setApprovingQuoteId(quoteId);

    try {
      // Simulate API delay (same as PDFPreview)
      await new Promise(resolve => setTimeout(resolve, 900));

      const res = await fetch(`${QUOTATION_API_BASE}/update_rate_approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote_id: String(quoteId),
          rate_approval: "Yes",
        }),
      });

      const data = await res.json();
      console.log("update_rate_approval response:", data);

      const success = data.status === true || data.status === "true";

      if (success) {
        alert("Quotation approved successfully!");

        // Update local state
        setQuotations((prev) =>
          prev.map((q) =>
            q.quote_id === quoteId 
              ? { ...q, emp_approval: "Yes", rate_approval: "Yes" } 
              : q
          )
        );
      } else {
        alert(data.message || "Failed to approve quotation");
      }
    } catch (error) {
      console.error(error);
      alert("Error approving quotation: " + (error.message || "Unknown error"));
    } finally {
      setApprovingQuoteId(null);
    }
  };

  // Filter + pagination for clients
  const filteredLeads = useMemo(() => {
    let baseLeads = allLeadsWithSalesperson;

    if (activeSalespersonId) {
      baseLeads = baseLeads.filter(
        (lead) => String(lead.salespersonId) === String(activeSalespersonId)
      );
    }

    if (!searchTerm) return baseLeads;

    const lower = searchTerm.toLowerCase();
    return baseLeads.filter((lead) => {
      const searchable = [
        lead.salespersonName,
        lead.salespersonId,
        lead.clientName,
        lead.ProjectName,
        lead.leadId,
        lead.Firstdate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(lower);
    });
  }, [allLeadsWithSalesperson, searchTerm, activeSalespersonId]);

  const totalPages = Math.ceil(filteredLeads.length / LEADS_PER_PAGE);

  const currentLeads = useMemo(() => {
    const start = (currentPage - 1) * LEADS_PER_PAGE;
    return filteredLeads.slice(start, start + LEADS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  // Filter + pagination for quotations
  const filteredQuotations = useMemo(() => {
    if (!quotationSearchTerm) return quotations;

    const lower = quotationSearchTerm.toLowerCase();
    return quotations.filter((quote) => {
      const searchable = [
        quote.quote_no,
        quote.name,
        quote.project,
        quote.quote_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(lower);
    });
  }, [quotations, quotationSearchTerm]);

  const totalQuotationPages = Math.ceil(filteredQuotations.length / LEADS_PER_PAGE);

  const currentQuotations = useMemo(() => {
    const start = (quotationCurrentPage - 1) * LEADS_PER_PAGE;
    return filteredQuotations.slice(start, start + LEADS_PER_PAGE);
  }, [filteredQuotations, quotationCurrentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (quotationCurrentPage > totalQuotationPages && totalQuotationPages > 0) {
      setQuotationCurrentPage(totalQuotationPages);
    }
  }, [totalQuotationPages, quotationCurrentPage]);

  const paginate = (page) => setCurrentPage(page);
  const paginateQuotations = (page) => setQuotationCurrentPage(page);

  const renderPagination = (current, total, onPageChange) => {
    if (total <= 1) return null;
    let items = [];
    items.push(
      <Pagination.First
        key="first"
        onClick={() => onPageChange(1)}
        disabled={current === 1}
      />
    );
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
      />
    );

    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(total, current + 2);
    if (endPage - startPage < 4) {
      if (current <= 3) endPage = Math.min(total, 5);
      else if (current > total - 2) startPage = Math.max(1, total - 4);
    }

    if (startPage > 1)
      items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === current}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    if (endPage < total)
      items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
      />
    );
    items.push(
      <Pagination.Last
        key="last"
        onClick={() => onPageChange(total)}
        disabled={current === total}
      />
    );
    return items;
  };

  return (
    <Container fluid>
      <style>{`
        .custom-checkbox {
          position: relative;
          display: inline-block;
          width: 20px;
          height: 20px;
          border-radius: 4px;
          background-color: #ffffff;
          border: 2px solid #dcdcdc;
          cursor: pointer;
          transition: all 0.12s ease;
          box-sizing: border-box;
        }
        
        .custom-checkbox input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          left: 0;
          top: 0;
          cursor: pointer;
        }
        
        .custom-checkbox:hover {
          border-color: #c0c0c0;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.02);
        }
        
        .custom-checkbox input[type="checkbox"]:checked + span {
          background-color: #28a745;
          border-color: #28a745;
        }
        
        .custom-checkbox input[type="checkbox"]:checked + span::after {
          content: '✓';
          color: #ffffff;
          font-size: 14px;
          font-weight: bold;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .custom-checkbox input[type="checkbox"]:disabled + span {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .custom-checkbox input[type="checkbox"]:disabled {
          cursor: not-allowed;
        }
        
        .custom-checkbox span {
          position: absolute;
          inset: 0;
          display: block;
          border-radius: 4px;
          pointer-events: none;
          transition: background-color 120ms ease, border-color 120ms ease;
        }

        .approval-loading {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .approval-cell {
          text-align: center;
          vertical-align: middle;
        }

        .table-hover tbody tr:hover {
          background-color: rgba(0,0,0,.075);
        }
      `}</style>
      
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Tabs
              id="salesperson-tabs"
              activeKey={activeTab}
              onSelect={(k) => {
                setActiveTab(k);
                setSearchTerm("");
                setQuotationSearchTerm("");
                setCurrentPage(1);
                setQuotationCurrentPage(1);
              }}
              className="mb-0"
            >
              <Tab eventKey="clients" title="Clients" />
              <Tab eventKey="quotations" title="Quotations" />
            </Tabs>

            <Card.Body className="p-4">
              <Row className="align-items-center mb-3">
                <Col md={6}>
                  <Card.Title style={{ fontWeight: "700", fontSize: "1.5rem", marginBottom: "0" }}>
                    {activeTab === "clients" ? "Sales" : "Quotations"}
                    {activeSalespersonId && (
                      <span style={{ fontSize: "0.9rem", marginLeft: "10px", fontWeight: 400 }}>
                        — {activeTab === "clients" ? "Clients" : "Quotations"} of{" "}
                        <strong>{activeSalespersonName || `ID ${activeSalespersonId}`}</strong>
                      </span>
                    )}
                  </Card.Title>
                </Col>
                <Col md={6} className="d-flex justify-content-end">
                  {activeTab === "clients" ? (
                    <Form.Control
                      type="text"
                      placeholder="Search by Client, Company, Lead ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: "300px" }}
                    />
                  ) : (
                    <Form.Control
                      type="text"
                      placeholder="Search by Quote No, Client, Project..."
                      value={quotationSearchTerm}
                      onChange={(e) => setQuotationSearchTerm(e.target.value)}
                      style={{ width: "300px" }}
                    />
                  )}
                </Col>
              </Row>

              {activeTab === "clients" && (
                <>
                  {loading ? (
                    <div className="text-center p-5">Loading clients...</div>
                  ) : currentLeads.length > 0 ? (
                    <>
                      <div className="table-responsive">
                        <table className="table table-striped table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Sr. No</th>
                              <th>Client</th>
                              <th>Project</th>
                              <th>Date</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentLeads.map((lead, index) => (
                              <tr key={lead.leadId || lead.clientName}>
                                <td>{(currentPage - 1) * LEADS_PER_PAGE + index + 1}</td>
                                <td>
                                  {lead.clientName} <br />
                                  <small className="text-muted"></small>
                                </td>
                                <td>{lead.ProjectName}</td>
                                <td>{lead.Firstdate}</td>
                                <td>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleViewLeadDetails(lead)}
                                    title="View Lead Details"
                                    className="me-2"
                                  >
                                    <FaEye />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleShowModal(lead)}
                                    title="Add Interaction Log"
                                  >
                                    <FaPlus />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                          <Pagination size="sm">
                            {renderPagination(currentPage, totalPages, paginate)}
                          </Pagination>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      {activeSalespersonId
                        ? "No clients found for this salesperson (or matching your search)."
                        : "No clients found matching your search."}
                    </div>
                  )}
                </>
              )}

              {activeTab === "quotations" && (
                <>
                  {loadingQuotations ? (
                    <div className="text-center p-5">Loading quotations...</div>
                  ) : currentQuotations.length > 0 ? (
                    <>
                      <div className="table-responsive">
                        <table className="table table-striped table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Sr. No</th>
                              <th>Quotation No</th>
                              <th>Client Name</th>
                              <th>Project</th>
                              <th>Date</th>
                              <th>Amount (₹)</th>
                              <th className="text-center">Sales Approve</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentQuotations.map((quote, index) => {
                              const isApproved = isApprovedValue(
                                quote.emp_approval || quote.rate_approval
                              );
                              const isApproving = approvingQuoteId === quote.quote_id;

                              return (
                                <tr key={quote.quote_id}>
                                  <td>
                                    {(quotationCurrentPage - 1) * LEADS_PER_PAGE + index + 1}
                                  </td>
                                  <td>{quote.quote_no || "N/A"}</td>
                                  <td>{quote.name || "N/A"}</td>
                                  <td>{quote.project || "N/A"}</td>
                                  <td>{formatDisplayDate(quote.date)}</td>
                                  <td>
                                    ₹ {parseFloat(quote.total || 0).toLocaleString("en-IN")}
                                  </td>
                                  <td className="approval-cell">
                                    {isApproving ? (
                                      <div className="approval-loading"></div>
                                    ) : (
                                      <div className="custom-checkbox">
                                        <input
                                          type="checkbox"
                                          checked={isApproved}
                                          disabled={isApproved}
                                          onChange={() => handleApproveQuotation(quote)}
                                        />
                                        <span></span>
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <Badge
                                      bg={
                                        isApproved
                                          ? "success"
                                          : quote.status === "draft"
                                          ? "secondary"
                                          : "warning"
                                      }
                                      className="px-3 py-2"
                                    >
                                      {isApproved
                                        ? "Approved"
                                        : quote.status === "draft"
                                        ? "Draft"
                                        : "Pending"}
                                    </Badge>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {totalQuotationPages > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                          <Pagination size="sm">
                            {renderPagination(
                              quotationCurrentPage,
                              totalQuotationPages,
                              paginateQuotations
                            )}
                          </Pagination>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      No quotations found for this salesperson (or matching your search).
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Interaction Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaPlus className="me-2" /> Add Client Interaction
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Date of Interaction <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={newInteraction.date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mode</Form.Label>
                  <Form.Select 
                    name="mode" 
                    value={newInteraction.mode} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Select Interaction Mode</option>
                    <option value="Initial Meeting">Initial Meeting</option>
                    <option value="Virtual Meeting">Virtual Meeting</option>
                    <option value="Client Site Visit">Client Site Visit</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Email/Text">Email/Text</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Location / Details</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={newInteraction.location}
                onChange={handleChange}
                placeholder="Enter location or specific details"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={newInteraction.status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="Requirement Gathering">Requirement Gathering</option>
                <option value="Technical Discussion">Technical Discussion</option>
                <option value="Quotation Sent">Quotation Sent</option>
                <option value="Revised">Revised</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Minutes of Meeting (MOMs) / Notes <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="moms"
                value={newInteraction.moms}
                onChange={handleChange}
                placeholder="Summarize the discussion, next steps, and key decisions..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Save Interaction Log
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}