// // import React, { useState, useMemo, useEffect } from "react";
// // import {
// //   Container,
// //   Row,
// //   Col,
// //   Card,
// //   Form,
// //   Button,
// //   Table,
// //   Spinner,
// //   Badge,
// //   Pagination,
// //   Modal,
// // } from "react-bootstrap";
// // import {
// //   FaEye,
// //   FaSearch,
// //   FaPlus,
// //   FaReceipt,
// //   FaTruck,
// //   FaBox,
// //   FaEdit,
// //   FaTimes,
// //   FaChevronDown,
// //   FaChevronRight,
// //   FaCopy,
// // } from "react-icons/fa";
// // import { Link, useNavigate } from "react-router-dom"; // <-- Added useNavigate import
// // import toast from "react-hot-toast";
// // import axios from "axios";

// // // Components
// // import PoView from "../components/PoView";

// // // APIs
// // const COMBINED_API = "https://nlfs.in/erp/index.php/Nlf_Erp/list_annexure_and_po";
// // const ADD_DM_API = "https://nlfs.in/erp/index.php/Api/add_dm";

// // // Custom styles for left alignment
// // const leftAlignStyles = `
// //   .text-left-custom {
// //     text-align: left !important;
// //   }
// //   .table th, .table td {
// //     text-align: left !important;
// //   }
// //   .modal-title {
// //     text-align: left !important;
// //   }
// //   .card-title {
// //     text-align: left !important;
// //   }
// //   .pagination {
// //     justify-content: flex-start !important;
// //   }
// //   .d-flex.justify-content-end {
// //     justify-content: flex-start !important;
// //   }
// //   .position-relative {
// //     text-align: left !important;
// //   }
// // `;

// // const isRevisionRow = (annexureNo = "") => {
// //   return /-R\d+$/i.test(annexureNo);
// // };


// // // Delivery Memo Form Component
// // const DeliveryMemoForm = ({ show, onHide, poData, annexureData }) => {
// //   const [formData, setFormData] = useState({
// //     delivery_challan_no: '',
// //     date: new Date().toISOString().split('T')[0],
// //     mode_dispatch: '',
// //     vehicle_no: '',
// //     destination: '',
// //     lr_no: '',
// //     terms_of_delivery: '',
// //     items: []
// //   });
// //   const [packingListFile, setPackingListFile] = useState(null);
// //   const [loading, setLoading] = useState(false);

// //   useEffect(() => {
// //     // Pre-populate form with data from PO or Annexure
// //     if (poData) {
// //       setFormData(prev => ({
// //         ...prev,
// //         destination: poData.client_name || poData.company || '',
// //         items: poData.items || []
// //       }));
// //     } else if (annexureData) {
// //       setFormData(prev => ({
// //         ...prev,
// //         destination: annexureData.annexure_vendor || annexureData.vendor || '',
// //         items: annexureData.items || []
// //       }));
// //     }
// //   }, [poData, annexureData]);

// //   const handleInputChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({
// //       ...prev,
// //       [name]: value
// //     }));
// //   };

// //   const handleFileChange = (e) => {
// //     setPackingListFile(e.target.files[0]);
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
    
// //     if (!formData.delivery_challan_no || !formData.date) {
// //       toast.error("Delivery Challan No and Date are required");
// //       return;
// //     }

// //     setLoading(true);
    
// //     try {
// //       const formDataToSend = new FormData();
// //       formDataToSend.append('delivery_challan_no', formData.delivery_challan_no);
// //       formDataToSend.append('date', formData.date);
// //       formDataToSend.append('mode_dispatch', formData.mode_dispatch);
// //       formDataToSend.append('vehicle_no', formData.vehicle_no);
// //       formDataToSend.append('destination', formData.destination);
// //       formDataToSend.append('lr_no', formData.lr_no);
// //       formDataToSend.append('terms_of_delivery', formData.terms_of_delivery);
// //       formDataToSend.append('items', JSON.stringify(formData.items));
      
// //       if (packingListFile) {
// //         formDataToSend.append('packing_list', packingListFile);
// //       }

// //       const response = await axios.post(ADD_DM_API, formDataToSend, {
// //         headers: {
// //           'Content-Type': 'multipart/form-data'
// //         }
// //       });

// //       if (response.data.status) {
// //         toast.success("Delivery Memo created successfully");
// //         onHide();
// //         // Reset form
// //         setFormData({
// //           delivery_challan_no: '',
// //           date: new Date().toISOString().split('T')[0],
// //           mode_dispatch: '',
// //           vehicle_no: '',
// //           destination: '',
// //           lr_no: '',
// //           terms_of_delivery: '',
// //           items: []
// //         });
// //         setPackingListFile(null);
// //       } else {
// //         toast.error(response.data.message || "Failed to create Delivery Memo");
// //       }
// //     } catch (error) {
// //       console.error("Error creating Delivery Memo:", error);
// //       toast.error("Error creating Delivery Memo");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Modal show={show} onHide={onHide} size="lg">
// //       <Modal.Header closeButton>
// //         <Modal.Title className="text-left-custom">Create Delivery Memo</Modal.Title>
// //       </Modal.Header>
// //       <Modal.Body>
// //         <Form onSubmit={handleSubmit}>
// //           <Row>
// //             <Col md={6}>
// //               <Form.Group className="mb-3">
// //                 <Form.Label className="text-left-custom">Delivery Challan No *</Form.Label>
// //                 <Form.Control
// //                   type="text"
// //                   name="delivery_challan_no"
// //                   value={formData.delivery_challan_no}
// //                   onChange={handleInputChange}
// //                   required
// //                 />
// //               </Form.Group>
// //             </Col>
// //             <Col md={6}>
// //               <Form.Group className="mb-3">
// //                 <Form.Label className="text-left-custom">Date *</Form.Label>
// //                 <Form.Control
// //                   type="date"
// //                   name="date"
// //                   value={formData.date}
// //                   onChange={handleInputChange}
// //                   required
// //                 />
// //               </Form.Group>
// //             </Col>
// //           </Row>
          
// //           <Row>
// //             <Col md={6}>
// //               <Form.Group className="mb-3">
// //                 <Form.Label className="text-left-custom">Mode of Dispatch</Form.Label>
// //                 <Form.Control
// //                   type="text"
// //                   name="mode_dispatch"
// //                   value={formData.mode_dispatch}
// //                   onChange={handleInputChange}
// //                 />
// //               </Form.Group>
// //             </Col>
// //             <Col md={6}>
// //               <Form.Group className="mb-3">
// //                 <Form.Label className="text-left-custom">Vehicle No</Form.Label>
// //                 <Form.Control
// //                   type="text"
// //                   name="vehicle_no"
// //                   value={formData.vehicle_no}
// //                   onChange={handleInputChange}
// //                 />
// //               </Form.Group>
// //             </Col>
// //           </Row>
          
// //           <Row>
// //             <Col md={6}>
// //               <Form.Group className="mb-3">
// //                 <Form.Label className="text-left-custom">Destination</Form.Label>
// //                 <Form.Control
// //                   type="text"
// //                   name="destination"
// //                   value={formData.destination}
// //                   onChange={handleInputChange}
// //                 />
// //               </Form.Group>
// //             </Col>
// //             <Col md={6}>
// //               <Form.Group className="mb-3">
// //                 <Form.Label className="text-left-custom">LR No</Form.Label>
// //                 <Form.Control
// //                   type="text"
// //                   name="lr_no"
// //                   value={formData.lr_no}
// //                   onChange={handleInputChange}
// //                 />
// //               </Form.Group>
// //             </Col>
// //           </Row>
          
// //           <Form.Group className="mb-3">
// //             <Form.Label className="text-left-custom">Terms of Delivery</Form.Label>
// //             <Form.Control
// //               as="textarea"
// //               rows={3}
// //               name="terms_of_delivery"
// //               value={formData.terms_of_delivery}
// //               onChange={handleInputChange}
// //             />
// //           </Form.Group>
          
// //           <Form.Group className="mb-3">
// //             <Form.Label className="text-left-custom">Packing List (PDF only)</Form.Label>
// //             <Form.Control
// //               type="file"
// //               accept=".pdf"
// //               onChange={handleFileChange}
// //             />
// //           </Form.Group>
          
// //           <div className="d-flex justify-content-start gap-2">
// //             <Button variant="secondary" onClick={onHide}>
// //               Cancel
// //             </Button>
// //             <Button type="submit" variant="primary" disabled={loading}>
// //               {loading ? <Spinner animation="border" size="sm" /> : "Create Delivery Memo"}
// //             </Button>
// //           </div>
// //         </Form>
// //       </Modal.Body>
// //     </Modal>
// //   );
// // };

// // const Annexure = () => {
// //   // === HOOKS ===
// //   const navigate = useNavigate(); // <-- Added useNavigate hook

// //   // === DATA STATES ===
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [tableData, setTableData] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [expandedPOs, setExpandedPOs] = useState(new Set());
// //   const itemsPerPage = 10;

// //   // === MODAL STATES ===
// //   const [showPOModal, setShowPOModal] = useState(false);
// //   const [selectedPO, setSelectedPO] = useState(null);
// //   const [showDeliveryMemoModal, setShowDeliveryMemoModal] = useState(false);
// //   const [deliveryMemoSource, setDeliveryMemoSource] = useState({ type: null, data: null });
// //   const [enableApproval, setEnableApproval] = useState(true);

// //   // === UTILITY FUNCTIONS ===
// //   const isApprovedValue = (val) => {
// //     if (!val) return false;
// //     const s = String(val).trim().toLowerCase();
// //     return ["yes", "approved", "true", "1"].includes(s);
// //   };

// //   // === FETCH DATA ===
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         setLoading(true);
        
// //         // Fetch data from the combined API
// //         const response = await axios.get(COMBINED_API);
        
// //         if (String(response.data?.status) === "true") {

// //         let tableStructure = [];
// // const poMap = new Map(); // to avoid duplicate parent POs

// // (response.data.data || []).forEach(item => {
// //   const hasPO = Boolean(item.po_id);
// //   const hasAnnexure = Boolean(item.annexure_id);

// //   // -------------------
// //   // HANDLE PARENT PO
// //   // -------------------
// //   if (hasPO && !poMap.has(item.po_id)) {
// //   const parentPO = {
// //     po_id: item.po_id,
// //     po_no: item.po_no,
// //     quote_id: item.quote_id,
// //     delivery_schedule: item.delivery_schedule,
// //     liquidated_damages: item.liquidated_damages,
// //     defect_liability_period: item.defect_liability_period,
// //     installation_scope: item.installation_scope,
// //     total_amt: item.total_amt,
// //     po_qty: item.po_qty,
// //     total_advance: item.total_advance,
// //     total_bal: item.total_bal,
// //     gst: item.gst,
// //     date: item.date,
// //     company: item.company,
// //     site_address: item.site_address,
// //     billing_address: item.billing_address,
// //     gst_number: item.gst_number,
// //     pan_number: item.pan_number,
// //     contact_person: item.contact_person,
// //     image: item.image,
// //     project_name: item.project_name,
// //     client_name: item.client_name,
// //     vendor: item.vendor,

// //     // ✅ keep approval info but DON'T filter by it
// //     po_approval: item.po_approval,
// //     po_status: item.po_status,

// //     items: item.items,

// //     isParent: true,
// //     isChild: false,
// //     type: "po",
// //   };

// //   poMap.set(item.po_id, parentPO);
// //   tableStructure.push(parentPO);
// // }


// //   // -------------------
// //   // HANDLE ANNEXURE
// //   // -------------------
// //   // if (hasAnnexure) {
// //   //   tableStructure.push({
// //   //     annexure_id: item.annexure_id,
// //   //     annexure_no: item.annexure_no,
// //   //     annexure_po_id: item.annexure_po_id,
// //   //     revise: item.revise,
// //   //     status: item.status,
// //   //     design_approval: item.design_approval,
// //   //     annexure_approval: item.annexure_approval,
// //   //     annexure_vendor: item.annexure_vendor,
// //   //     project: item.project,
// //   //     annexure_client_name: item.annexure_client_name,
// //   //     annexure_date: item.annexure_date,
// //   //     annexure_total_amount: item.annexure_total_amount,
// //   //     annexure: item.annexure,

// //   //     po_id: item.po_id,
// //   //     po_no: item.po_no,

// //   //     isParent: false,
// //   //     isChild: true,
// //   //     type: "annexure",
// //   //     parentPO: item.po_no,
// //   //     parentPOId: item.po_id
// //   //   });
// //   // }
// //   if (hasAnnexure) {
// //   tableStructure.push({
// //     annexure_id: item.annexure_id,
// //     annexure_no: item.annexure_no,
// //     annexure_po_id: item.annexure_po_id,
// //     revise: item.revise,
// //     status: item.status,
// //     design_approval: item.design_approval,
// //     annexure_approval: item.annexure_approval,

// //     // 🔥 inherit vendor from PO
// //     annexure_vendor: item.company || item.client_name || item.annexure_vendor || "N/A",

// //     project: item.project,
// //     annexure_client_name: item.annexure_client_name,
// //     annexure_date: item.annexure_date,
// //     annexure_total_amount: item.annexure_total_amount,
// //     annexure: item.annexure,

// //     po_id: item.po_id,
// //     po_no: item.po_no,

// //     isParent: false,
// //     isChild: true,
// //     type: "annexure",
// //     parentPO: item.po_no,
// //     parentPOId: item.po_id
// //   });
// // }

// // });

// //           // Group items by PO
// //           const poGroups = new Map();
          
// //           tableStructure.forEach(item => {
// //             if (item.type === 'po') {
// //               if (!poGroups.has(item.po_id)) {
// //                 poGroups.set(item.po_id, {
// //                   po: item,
// //                   annexures: []
// //                 });
// //               }
// //             } else if (item.type === 'annexure') {
// //               const poId = item.parentPOId || item.po_id;
// //               if (!poGroups.has(poId)) {
// //                 poGroups.set(poId, {
// //                   po: null,
// //                   annexures: []
// //                 });
// //               }
// //               poGroups.get(poId).annexures.push(item);
// //             }
// //           });
          
// //           // Sort each group's annexures in descending order by revision number
// //          poGroups.forEach(group => {
// //   group.annexures.sort((a, b) => {
// //     const getRevisionScore = (val = "") => {
// //       const str = String(val);

// //       const aMatch = str.match(/A(\d+)/);
// //       const aNum = aMatch ? parseInt(aMatch[1]) : 0;

// //       const rMatch = str.match(/R(\d+)/);
// //       const rNum = rMatch ? parseInt(rMatch[1]) : 0;

// //       return aNum * 1000 + rNum;
// //     };

// //     const scoreA = getRevisionScore(a.annexure_no);
// //     const scoreB = getRevisionScore(b.annexure_no);

// //     return scoreB - scoreA; // DESC
// //   });
// // });

          
// //           // Sort PO groups by date and PO number (descending)
// //           const sortedGroups = Array.from(poGroups.entries()).sort((a, b) => {
// //             const groupA = a[1];
// //             const groupB = b[1];
            
// //             const dateA = groupA.po ? groupA.po.date : (groupA.annexures[0]?.annexure_date || '');
// //             const dateB = groupB.po ? groupB.po.date : (groupB.annexures[0]?.annexure_date || '');
            
// //             const timeA = dateA ? new Date(dateA).getTime() : 0;
// //             const timeB = dateB ? new Date(dateB).getTime() : 0;
            
// //             // Sort by date (descending - newest first)
// //             if (timeB !== timeA) {
// //               return timeB - timeA;
// //             }
            
// //             // If dates are equal, sort by PO number (descending)
// //             const poNoA = groupA.po?.po_no || '';
// //             const poNoB = groupB.po?.po_no || '';
            
// //             const numA = parseInt((poNoA.match(/PO-(\d+)/) || ['', '0'])[1]);
// //             const numB = parseInt((poNoB.match(/PO-(\d+)/) || ['', '0'])[1]);
            
// //             return numB - numA; // Descending order
// //           });
          
// //           // Flatten the sorted groups into final table structure
// //           // Order: Latest PO -> its annexures (A2, A1) -> Next PO -> its annexures
// //           const finalStructure = [];
// //           sortedGroups.forEach(([poId, group]) => {
// //             // Add annexures first (in descending order A2, A1)
// //             finalStructure.push(...group.annexures);
// //             // Then add the PO
// //             if (group.po) {
// //   finalStructure.push({
// //     ...group.po,
// //     annexures: group.annexures || []   // 👈 attach children
// //   });
// // }

// //           });
          
// //           tableStructure = finalStructure;
          
// //           setTableData(tableStructure);
// //         }

// //       } catch (error) {
// //         console.error("Error fetching data:", error);
// //         toast.error("Error loading data");
// //         setTableData([]);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchData();
// //   }, []);

// //   // === FILTER & PAGINATION ===
// //   const filteredData = useMemo(() => {
// //     let result = tableData;

// //     // Search Filter
// //     if (searchTerm) {
// //       const term = searchTerm.toLowerCase();
// //       result = result.filter((item) => {
// //         return (
// //           (item.po_no && item.po_no.toLowerCase().includes(term)) ||
// //           (item.annexure_no && item.annexure_no.toLowerCase().includes(term)) ||
// //           (item.company && item.company.toLowerCase().includes(term)) ||
// //           (item.annexure_client_name && item.annexure_client_name.toLowerCase().includes(term)) ||
// //           (item.annexure_vendor && item.annexure_vendor.toLowerCase().includes(term)) ||
// //           (item.po_id && item.po_id.toLowerCase().includes(term)) ||
// //           (item.delivery_schedule && item.delivery_schedule.toLowerCase().includes(term)) ||
// //           (item.total_amt && String(item.total_amt).includes(term)) ||
// //           (item.annexure_total_amount && String(item.annexure_total_amount).includes(term))
// //         );
// //       });
// //     }

// //     return result;
// //   }, [searchTerm, tableData]);

// //   useEffect(() => setCurrentPage(1), [searchTerm]);

// //   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
// //   const indexLast = currentPage * itemsPerPage;
// //   const currentData = filteredData.slice(indexLast - itemsPerPage, indexLast);

// //   // === MODAL HELPERS ===
// //   const handleViewPO = (po) => {
// //     setSelectedPO(po);
// //     setShowPOModal(true);
// //   };

// //   const handleClosePOModal = () => {
// //     setShowPOModal(false);
// //     setSelectedPO(null);
// //   };
  
// //   // === NEW HANDLER FOR VIEWING ANNEXURE ===
// //   const handleViewAnnexure = (annexureId) => {
// //     navigate(`/annexure/view/${annexureId}`);
// //   };

// //   // === NEW HANDLER FOR ADDING REVISION ===
// //   // In Annexure.jsx, update the handleAddRevision function
// // const handleAddRevision = (annexureId) => {
// //   navigate(`/annexure/revise/${annexureId}`);
// // };

// //   const handlePOApproved = (poId) => {
// //     setTableData((prev) =>
// //       prev.map((item) => 
// //         item.type === 'po' && item.po_id === poId 
// //           ? { ...item, po_approval: "yes", isApproved: true } 
// //           : item
// //       )
// //     );
// //   };

// //   const handleOpenDeliveryMemoModal = (item) => {
// //     if (item.type === 'po') {
// //       setDeliveryMemoSource({ type: 'po', data: item });
// //     } else {
// //       setDeliveryMemoSource({ type: 'annexure', data: item });
// //     }
// //     setShowDeliveryMemoModal(true);
// //   };

// //   const handleCloseDeliveryMemoModal = () => {
// //     setShowDeliveryMemoModal(false);
// //     setDeliveryMemoSource({ type: null, data: null });
// //   };

// //   return (
// //     <>
// //       <style>{leftAlignStyles}</style>
// //       <Container fluid>
// //         <Row>
// //           <Col md="12">
// //             <Card className="strpied-tabled-with-hover">
// //               <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
// //                 <Row className="align-items-center">
// //                   <Col>
// //                     <Card.Title className="text-left-custom" style={{ marginTop: "2rem", fontWeight: "700" }}>
// //                       Purchase Orders & Annexures
// //                     </Card.Title>
// //                   </Col>
// //                   <Col className="d-flex justify-content-start align-items-center gap-2">
// //                     {/* <Button as={Link} to="/directpo" className="btn btn-primary add-customer-btn">
// //                       <FaPlus size={14} className="me-1" /> Add Direct PO
// //                     </Button> */}
// //                   </Col>
// //                     <Col md={4}>
// //                     <div className="position-relative">
// //                       <Form.Control
// //                         type="text"
// //                         placeholder="Search by Number, Name, WO No, Total..."
// //                         value={searchTerm}
// //                         onChange={(e) => setSearchTerm(e.target.value)}
// //                         style={{ paddingRight: "35px" }}
// //                       />
// //                       <FaSearch
// //                         className="position-absolute"
// //                         style={{
// //                           right: "10px",
// //                           top: "50%",
// //                           transform: "translateY(-50%)",
// //                           color: "#999",
// //                         }}
// //                       />
// //                     </div>
// //                   </Col>
// //                 </Row>
// //               </Card.Header>

// //               <Card.Body className="table-full-width table-responsive">
// //                 {/* Stats Summary */}
                

// //                 {/* Main Table */}
// //                 <Table className="table table-striped table-hover text-left-custom">
// //                   <thead>
// //                     <tr>
                      
// //                       <th>Sr. No.</th>
// //                       <th>PO Number</th>
// //                       <th>Vendor Name</th>
// //                       <th>WO Number</th>
// //                       <th>Date</th>
// //                       <th>Total</th>
// //                       <th>Actions</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody>
// //                     {loading ? (
// //                       <tr>
// //                         <td colSpan="8" className="text-center py-4">
// //                           <Spinner animation="border" />
// //                         </td>
// //                       </tr>
// //                     ) : currentData.length > 0 ? (
// //                       currentData.map((item, index) => {
// //                         const isPO = item.isParent;
// //                         const isAnnexure = item.isChild;
                        
// //                         return (
// //                           <tr 
// //                             key={`${isPO ? 'po' : 'annexure'}-${isPO ? item.po_id : item.annexure_id}`}
// //                             className={isAnnexure ? "table-light" : ""}
// //                             style={isAnnexure ? { backgroundColor: "#f8f9fa" } : {}}
// //                           >
                           
// //                             <td>
// //                               {(currentPage - 1) * itemsPerPage + index + 1}
                             
// //                             </td>
// //                             <td>
// //                               {isPO ? (item.po_no || "TBA") : (item.annexure_no || "TBA")}
                             
// //                             </td>
// //                             <td>
                            
// //                                 {isPO ? 
// //                                   (item.company || item.client_name || "N/A") : 
// //                                   (item.annexure_vendor || "N/A")
// //                                 }
                          
// //                             </td>
// //                             {/* <td>
// //                               {isPO ? 
// //                                 (item.delivery_schedule || "Direct PO") : 
// //                                 (item.parentPO || "N/A")
// //                               }
// //                             </td> */}

// //                             <td>
// //   {item.delivery_schedule && item.delivery_schedule.trim() !== ""
// //     ? item.delivery_schedule
// //     : "Direct PO"}
// // </td>

// //                             <td>
// //                               {isPO ? 
// //                                 (item.date || "N/A") : 
// //                                 (item.annexure_date || "N/A")
// //                               }
// //                             </td>
// //                             <td>
// //                               {isPO ? 
// //                                 (item.total_amt ? `₹${Number(item.total_amt).toLocaleString('en-IN')}` : "N/A") : 
// //                                 (item.annexure_total_amount ? `₹${Number(item.annexure_total_amount).toLocaleString('en-IN')}` : "N/A")
// //                               }
// //                             </td>
// //                             <td>
// //                               <div className="d-flex gap-2 flex-wrap justify-content-start">
// //                                 {/* PO Specific Actions */}
// //                                 {isPO && (
// //                                   <>
                                   
                                      
// //                                       <Button
// //                                         as={Link}
// //                                         to={`/annexureform/${item.po_id}`}
// //                                         className="add-customer-btn"
// //                                         size="sm"
// //                                         title="Add Annexure"
// //                                       >
// //                                         <FaPlus className="me-1" /> Add Annexure
// //                                       </Button>
                                    

// //                                     <Button
// //                                       onClick={() => handleOpenDeliveryMemoModal(item)}
// //                                       variant="success"
// //                                       size="sm"
// //                                       title="Add Delivery Memo"
// //                                     >
// //                                       <FaTruck className="me-1" /> D. Memo
// //                                     </Button>

// //                                     {/* View Button - Moved to the rightmost side */}
// //                                     <Button
// //                                       onClick={() => handleViewPO(item)}
// //                                       className="buttonEye"
// //                                       title="View PO"
// //                                     >
// //                                       <FaEye />
// //                                     </Button>
// //                                   </>
// //                                 )}

// //                                 {/* Annexure Specific Actions */}
// //                                 {isAnnexure && (
// //                                   <>
// //                                     {item.status === "draft" && (
// //                                       <Button
// //                                         as={Link}
// //                                         to={`/annexureform/${item.annexure_id}`}
// //                                         variant="primary"
// //                                         size="sm"
// //                                         title="Add Annexure"
// //                                       >
// //                                         <FaPlus className="me-1" /> Add Annexure
// //                                       </Button>
// //                                     )}

// //                                     {isApprovedValue(item.design_approval) && (
// //                                       <>
// //                                         <Button
// //                                           as={Link}
// //                                           to={`/annexureform/${item.annexure_id}`}
// //                                           variant="primary"
// //                                           size="sm"
// //                                           title="Edit Annexure"
// //                                         >
// //                                           <FaReceipt className="me-1" /> Edit
// //                                         </Button>
// //                                         <Button
// //                                           onClick={() => handleOpenDeliveryMemoModal(item)}
// //                                           variant="success"
// //                                           size="sm"
// //                                           title="Create Delivery Memo"
// //                                         >
// //                                           <FaTruck className="me-1" /> D. Memo
// //                                         </Button>
// //                                         <Button
// //                                           as={Link}
// //                                           to={`/dispatchform/${item.annexure_id}`}
// //                                           className="add-customer-btn"
// //                                           size="sm"
// //                                           title="Dispatch"
// //                                         >
// //                                           <FaBox className="me-1" /> Dispatch
// //                                         </Button>
// //                                       </>
// //                                     )}

// //                                     {/* Add Revision Button - NEW */}
// //                                    {!isRevisionRow(item.annexure_no) && (
// //   <Button
// //     onClick={() => handleAddRevision(item.annexure_id)}
// //     variant="warning"
// //     size="sm"
// //     title="Add Revision"
// //   >
// //     <FaCopy className="me-1" /> Revision
// //   </Button>
// // )}


// //                                     {/* View Button - UPDATED to navigate to AnnexureView */}
// //                                     <Button
// //                                       onClick={() => handleViewAnnexure(item.annexure_id)}
// //                                       className="buttonEye"
// //                                       title="View Annexure"
// //                                     >
// //                                       <FaEye />
// //                                     </Button>
// //                                   </>
// //                                 )}
// //                               </div>
// //                             </td>
// //                           </tr>
// //                         );
// //                       })
// //                     ) : (
// //                       <tr>
// //                         <td colSpan="8" className="text-center">
// //                           No records found.
// //                         </td>
// //                       </tr>
// //                     )}
// //                   </tbody>
// //                 </Table>

// //                 {/* Pagination */}
// //                 {totalPages > 1 && (
// //                   <div className="d-flex justify-content-start p-3">
// //                     <Pagination>
// //                       <Pagination.First
// //                         onClick={() => setCurrentPage(1)}
// //                         disabled={currentPage === 1}
// //                       />
// //                       <Pagination.Prev
// //                         onClick={() => setCurrentPage(currentPage - 1)}
// //                         disabled={currentPage === 1}
// //                       />
// //                       {Array.from({ length: totalPages }, (_, i) => (
// //                         <Pagination.Item
// //                           key={i + 1}
// //                           active={currentPage === i + 1}
// //                           onClick={() => setCurrentPage(i + 1)}
// //                         >
// //                           {i + 1}
// //                         </Pagination.Item>
// //                       ))}
// //                       <Pagination.Next
// //                         onClick={() => setCurrentPage(currentPage + 1)}
// //                         disabled={currentPage === totalPages}
// //                       />
// //                       <Pagination.Last
// //                         onClick={() => setCurrentPage(totalPages)}
// //                         disabled={currentPage === totalPages}
// //                       />
// //                     </Pagination>
// //                   </div>
// //                 )}
// //               </Card.Body>
// //             </Card>
// //           </Col>
// //         </Row>

// //         {/* Modals */}
// //         {selectedPO && (
// //           <PoView
// //             show={showPOModal}
// //             onHide={handleClosePOModal}
// //             poData={selectedPO}
// //             enableApproval={enableApproval}
// //             onPOApproved={handlePOApproved}
// //           />
// //         )}

// //         <DeliveryMemoForm
// //           show={showDeliveryMemoModal}
// //           onHide={handleCloseDeliveryMemoModal}
// //           poData={deliveryMemoSource.type === 'po' ? deliveryMemoSource.data : null}
// //           annexureData={deliveryMemoSource.type === 'annexure' ? deliveryMemoSource.data : null}
// //         />
// //       </Container>
// //     </>
// //   );
// // };

// // export default Annexure;

// import React, { useState, useMemo, useEffect, lazy, Suspense } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Table,
//   Spinner,
//   Badge,
//   Pagination,
//   Modal,
// } from "react-bootstrap";
// import {
//   FaEye,
//   FaSearch,
//   FaPlus,
//   FaReceipt,
//   FaTruck,
//   FaBox,
//   FaEdit,
//   FaTimes,
//   FaChevronDown,
//   FaChevronRight,
//   FaCopy,
// } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import axios from "axios";

// // Components
// import PoView from "../components/PoView";
// const POPreviewModal = lazy(() => import("../components/POPreviewModal")); // Add this import

// // APIs
// const COMBINED_API = "https://nlfs.in/erp/index.php/Nlf_Erp/list_annexure_and_po ";
// const ADD_DM_API = "https://nlfs.in/erp/index.php/Api/add_dm ";

// // Custom styles for left alignment
// const leftAlignStyles = `
//   .text-left-custom {
//     text-align: left !important;
//   }
//   .table th, .table td {
//     text-align: left !important;
//   }
//   .modal-title {
//     text-align: left !important;
//   }
//   .card-title {
//     text-align: left !important;
//   }
//   .pagination {
//     justify-content: flex-start !important;
//   }
//   .d-flex.justify-content-end {
//     justify-content: flex-start !important;
//   }
//   .position-relative {
//     text-align: left !important;
//   }
// `;

// const isRevisionRow = (annexureNo = "") => {
//   return /-R\d+$/i.test(annexureNo);
// };

// // Utility function to check if a value is approved
// const isApprovedValue = (val) => {
//   if (!val) return false;
//   const s = String(val).trim().toLowerCase();
//   return ["yes", "approved", "true", "1"].includes(s);
// };

// // Delivery Memo Form Component (unchanged)
// const DeliveryMemoForm = ({ show, onHide, poData, annexureData }) => {
//   // ... existing code ...
// };

// const Annexure = () => {
//   // === HOOKS ===
//   const navigate = useNavigate();

//   // === DATA STATES ===
//   const [searchTerm, setSearchTerm] = useState("");
//   const [tableData, setTableData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [expandedPOs, setExpandedPOs] = useState(new Set());
//   const itemsPerPage = 10;

//   // === MODAL STATES ===
//   const [showPOModal, setShowPOModal] = useState(false);
//   const [selectedPO, setSelectedPO] = useState(null);
//   const [showDeliveryMemoModal, setShowDeliveryMemoModal] = useState(false);
//   const [deliveryMemoSource, setDeliveryMemoSource] = useState({ type: null, data: null });
//   const [enableApproval, setEnableApproval] = useState(true);
  
//   // NEW: PO Approval Modal States
//   const [showPOApprovalModal, setShowPOApprovalModal] = useState(false);
//   const [selectedPOForApproval, setSelectedPOForApproval] = useState(null);
//   const [poModalMode, setPOModalMode] = useState("view"); // "view" or "approve"

//   // === FETCH DATA === (unchanged)
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Fetch data from the combined API
//         const response = await axios.get(COMBINED_API);
        
//         if (String(response.data?.status) === "true") {
//           let tableStructure = [];
//           const poMap = new Map(); // to avoid duplicate parent POs

//           (response.data.data || []).forEach(item => {
//             const hasPO = Boolean(item.po_id);
//             const hasAnnexure = Boolean(item.annexure_id);

//             // HANDLE PARENT PO
//             if (hasPO && !poMap.has(item.po_id)) {
//               const parentPO = {
//                 po_id: item.po_id,
//                 po_no: item.po_no,
//                 quote_id: item.quote_id,
//                 delivery_schedule: item.delivery_schedule,
//                 liquidated_damages: item.liquidated_damages,
//                 defect_liability_period: item.defect_liability_period,
//                 installation_scope: item.installation_scope,
//                 total_amt: item.total_amt,
//                 po_qty: item.po_qty,
//                 total_advance: item.total_advance,
//                 total_bal: item.total_bal,
//                 gst: item.gst,
//                 date: item.date,
//                 company: item.company,
//                 site_address: item.site_address,
//                 billing_address: item.billing_address,
//                 gst_number: item.gst_number,
//                 pan_number: item.pan_number,
//                 contact_person: item.contact_person,
//                 image: item.image,
//                 project_name: item.project_name,
//                 client_name: item.client_name,
//                 vendor: item.vendor,

//                 // keep approval info
//                 po_approval: item.po_approval,
//                 po_status: item.po_status,

//                 items: item.items,

//                 isParent: true,
//                 isChild: false,
//                 type: "po",
//               };

//               poMap.set(item.po_id, parentPO);
//               tableStructure.push(parentPO);
//             }

//             // HANDLE ANNEXURE
//             if (hasAnnexure) {
//               tableStructure.push({
//                 annexure_id: item.annexure_id,
//                 annexure_no: item.annexure_no,
//                 annexure_po_id: item.annexure_po_id,
//                 revise: item.revise,
//                 status: item.status,
//                 design_approval: item.design_approval,
//                 annexure_approval: item.annexure_approval,

//                 // inherit vendor from PO
//                 annexure_vendor: item.company || item.client_name || item.annexure_vendor || "N/A",

//                 project: item.project,
//                 annexure_client_name: item.annexure_client_name,
//                 annexure_date: item.annexure_date,
//                 annexure_total_amount: item.annexure_total_amount,
//                 annexure: item.annexure,

//                 po_id: item.po_id,
//                 po_no: item.po_no,

//                 isParent: false,
//                 isChild: true,
//                 type: "annexure",
//                 parentPO: item.po_no,
//                 parentPOId: item.po_id
//               });
//             }
//           });

//           // Group items by PO
//           const poGroups = new Map();
          
//           tableStructure.forEach(item => {
//             if (item.type === 'po') {
//               if (!poGroups.has(item.po_id)) {
//                 poGroups.set(item.po_id, {
//                   po: item,
//                   annexures: []
//                 });
//               }
//             } else if (item.type === 'annexure') {
//               const poId = item.parentPOId || item.po_id;
//               if (!poGroups.has(poId)) {
//                 poGroups.set(poId, {
//                   po: null,
//                   annexures: []
//                 });
//               }
//               poGroups.get(poId).annexures.push(item);
//             }
//           });
          
//           // Sort each group's annexures in descending order by revision number
//           poGroups.forEach(group => {
//             group.annexures.sort((a, b) => {
//               const getRevisionScore = (val = "") => {
//                 const str = String(val);
//                 const aMatch = str.match(/A(\d+)/);
//                 const aNum = aMatch ? parseInt(aMatch[1]) : 0;
//                 const rMatch = str.match(/R(\d+)/);
//                 const rNum = rMatch ? parseInt(rMatch[1]) : 0;
//                 return aNum * 1000 + rNum;
//               };

//               const scoreA = getRevisionScore(a.annexure_no);
//               const scoreB = getRevisionScore(b.annexure_no);

//               return scoreB - scoreA; // DESC
//             });
//           });
          
//           // Sort PO groups by date and PO number (descending)
//           const sortedGroups = Array.from(poGroups.entries()).sort((a, b) => {
//             const groupA = a[1];
//             const groupB = b[1];
            
//             const dateA = groupA.po ? groupA.po.date : (groupA.annexures[0]?.annexure_date || '');
//             const dateB = groupB.po ? groupB.po.date : (groupB.annexures[0]?.annexure_date || '');
            
//             const timeA = dateA ? new Date(dateA).getTime() : 0;
//             const timeB = dateB ? new Date(dateB).getTime() : 0;
            
//             // Sort by date (descending - newest first)
//             if (timeB !== timeA) {
//               return timeB - timeA;
//             }
            
//             // If dates are equal, sort by PO number (descending)
//             const poNoA = groupA.po?.po_no || '';
//             const poNoB = groupB.po?.po_no || '';
            
//             const numA = parseInt((poNoA.match(/PO-(\d+)/) || ['', '0'])[1]);
//             const numB = parseInt((poNoB.match(/PO-(\d+)/) || ['', '0'])[1]);
            
//             return numB - numA; // Descending order
//           });
          
//           // Flatten the sorted groups into final table structure
//           const finalStructure = [];
//           sortedGroups.forEach(([poId, group]) => {
//             // Add annexures first (in descending order A2, A1)
//             finalStructure.push(...group.annexures);
//             // Then add the PO
//             if (group.po) {
//               finalStructure.push({
//                 ...group.po,
//                 annexures: group.annexures || []
//               });
//             }
//           });
          
//           tableStructure = finalStructure;
          
//           setTableData(tableStructure);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         toast.error("Error loading data");
//         setTableData([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // === FILTER & PAGINATION === (unchanged)
//   const filteredData = useMemo(() => {
//     let result = tableData;

//     // Search Filter
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       result = result.filter((item) => {
//         return (
//           (item.po_no && item.po_no.toLowerCase().includes(term)) ||
//           (item.annexure_no && item.annexure_no.toLowerCase().includes(term)) ||
//           (item.company && item.company.toLowerCase().includes(term)) ||
//           (item.annexure_client_name && item.annexure_client_name.toLowerCase().includes(term)) ||
//           (item.annexure_vendor && item.annexure_vendor.toLowerCase().includes(term)) ||
//           (item.po_id && item.po_id.toLowerCase().includes(term)) ||
//           (item.delivery_schedule && item.delivery_schedule.toLowerCase().includes(term)) ||
//           (item.total_amt && String(item.total_amt).includes(term)) ||
//           (item.annexure_total_amount && String(item.annexure_total_amount).includes(term))
//         );
//       });
//     }

//     return result;
//   }, [searchTerm, tableData]);

//   useEffect(() => setCurrentPage(1), [searchTerm]);

//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const indexLast = currentPage * itemsPerPage;
//   const currentData = filteredData.slice(indexLast - itemsPerPage, indexLast);

//   // === MODAL HELPERS ===
//   const handleViewPO = (po) => {
//     setSelectedPO(po);
//     setShowPOModal(true);
//   };

//   const handleClosePOModal = () => {
//     setShowPOModal(false);
//     setSelectedPO(null);
//   };
  
//   // === NEW HANDLER FOR VIEWING ANNEXURE ===
//   const handleViewAnnexure = (annexureId) => {
//     navigate(`/annexure/view/${annexureId}`);
//   };

//   // === NEW HANDLER FOR ADDING REVISION ===
//   const handleAddRevision = (annexureId) => {
//     navigate(`/annexure/revise/${annexureId}`);
//   };

//   // === NEW HANDLER FOR PO APPROVAL ===
//   const handleShowPOApprovalModal = (po) => {
//     setSelectedPOForApproval(po);
//     setPOModalMode("approve");
//     setShowPOApprovalModal(true);
//   };

//   const handleClosePOApprovalModal = () => {
//     setShowPOApprovalModal(false);
//     setSelectedPOForApproval(null);
//   };

//   const handlePOApprovedFromModal = async (approvedPOId) => {
//     // Update the PO in the local state
//     setTableData((prev) =>
//       prev.map((item) => 
//         item.type === 'po' && item.po_id === approvedPOId 
//           ? { ...item, po_approval: "yes" } 
//           : item
//       )
//     );
    
//     // Close the modal
//     handleClosePOApprovalModal();
    
//     // Show success message
//     toast.success("PO approved successfully");
//   };

//   const handleOpenDeliveryMemoModal = (item) => {
//     if (item.type === 'po') {
//       setDeliveryMemoSource({ type: 'po', data: item });
//     } else {
//       setDeliveryMemoSource({ type: 'annexure', data: item });
//     }
//     setShowDeliveryMemoModal(true);
//   };

//   const handleCloseDeliveryMemoModal = () => {
//     setShowDeliveryMemoModal(false);
//     setDeliveryMemoSource({ type: null, data: null });
//   };

//   return (
//     <>
//       <style>{leftAlignStyles}</style>
//       <Container fluid>
//         <Row>
//           <Col md="12">
//             <Card className="strpied-tabled-with-hover">
//               <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
//                 <Row className="align-items-center">
//                   <Col>
//                     <Card.Title className="text-left-custom" style={{ marginTop: "2rem", fontWeight: "700" }}>
//                       Purchase Orders & Annexures
//                     </Card.Title>
//                   </Col>
//                   <Col className="d-flex justify-content-start align-items-center gap-2">
//                     {/* <Button as={Link} to="/directpo" className="btn btn-primary add-customer-btn">
//                       <FaPlus size={14} className="me-1" /> Add Direct PO
//                     </Button> */}
//                   </Col>
//                     <Col md={4}>
//                     <div className="position-relative">
//                       <Form.Control
//                         type="text"
//                         placeholder="Search by Number, Name, WO No, Total..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         style={{ paddingRight: "35px" }}
//                       />
//                       <FaSearch
//                         className="position-absolute"
//                         style={{
//                           right: "10px",
//                           top: "50%",
//                           transform: "translateY(-50%)",
//                           color: "#999",
//                         }}
//                       />
//                     </div>
//                   </Col>
//                 </Row>
//               </Card.Header>

//               <Card.Body className="table-full-width table-responsive">
//                 {/* Stats Summary */}

//                 {/* Main Table */}
//                 <Table className="table table-striped table-hover text-left-custom">
//                   <thead>
//                     <tr>
//                       <th>Sr. No.</th>
//                       <th>PO Number</th>
//                       <th>Vendor Name</th>
//                       <th>WO Number</th>
//                       <th>Date</th>
//                       <th>Total</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {loading ? (
//                       <tr>
//                         <td colSpan="8" className="text-center py-4">
//                           <Spinner animation="border" />
//                         </td>
//                       </tr>
//                     ) : currentData.length > 0 ? (
//                       currentData.map((item, index) => {
//                         const isPO = item.isParent;
//                         const isAnnexure = item.isChild;
//                         const isPOApproved = isPO && isApprovedValue(item.po_approval);
                        
//                         return (
//                           <tr 
//                             key={`${isPO ? 'po' : 'annexure'}-${isPO ? item.po_id : item.annexure_id}`}
//                             className={isAnnexure ? "table-light" : ""}
//                             style={isAnnexure ? { backgroundColor: "#f8f9fa" } : {}}
//                           >
//                             <td>
//                               {(currentPage - 1) * itemsPerPage + index + 1}
//                             </td>
//                             <td>
//                               {isPO ? (item.po_no || "TBA") : (item.annexure_no || "TBA")}
//                             </td>
//                             <td>
//                                 {isPO ? 
//                                   (item.company || item.client_name || "N/A") : 
//                                   (item.annexure_vendor || "N/A")
//                                 }
//                             </td>
//                             <td>
//                               {item.delivery_schedule && item.delivery_schedule.trim() !== ""
//                                 ? item.delivery_schedule
//                                 : "Direct PO"}
//                             </td>
//                             <td>
//                               {isPO ? 
//                                 (item.date || "N/A") : 
//                                 (item.annexure_date || "N/A")
//                               }
//                             </td>
//                             <td>
//                               {isPO ? 
//                                 (item.total_amt ? `₹${Number(item.total_amt).toLocaleString('en-IN')}` : "N/A") : 
//                                 (item.annexure_total_amount ? `₹${Number(item.annexure_total_amount).toLocaleString('en-IN')}` : "N/A")
//                               }
//                             </td>
//                             <td>
//                               <div className="d-flex gap-2 flex-wrap justify-content-start">
//                                 {/* PO Specific Actions */}
//                                 {isPO && (
//                                   <>
//                                     {/* If PO is not approved, show checkbox */}
//                                     {!isPOApproved ? (
//                                       <div className="d-flex align-items-center gap-2">
//                                         <Form.Check
//                                           type="checkbox"
//                                           checked={false}
//                                           onChange={() => handleShowPOApprovalModal(item)}
//                                         />
//                                         <Badge bg="warning" text="dark">Pending Approval</Badge>
//                                       </div>
//                                     ) : (
//                                       <>
//                                         <Button
//                                           as={Link}
//                                           to={`/annexureform/${item.po_id}`}
//                                           className="add-customer-btn"
//                                           size="sm"
//                                           title="Add Annexure"
//                                         >
//                                           <FaPlus className="me-1" /> Add Annexure
//                                         </Button>

//                                         <Button
//                                           onClick={() => handleOpenDeliveryMemoModal(item)}
//                                           variant="success"
//                                           size="sm"
//                                           title="Add Delivery Memo"
//                                         >
//                                           <FaTruck className="me-1" /> D. Memo
//                                         </Button>

//                                         {/* View Button - Moved to the rightmost side */}
//                                         <Button
//                                           onClick={() => handleViewPO(item)}
//                                           className="buttonEye"
//                                           title="View PO"
//                                         >
//                                           <FaEye />
//                                         </Button>
//                                       </>
//                                     )}
//                                   </>
//                                 )}

//                                 {/* Annexure Specific Actions */}
//                                 {isAnnexure && (
//                                   <>
//                                     {item.status === "draft" && (
//                                       <Button
//                                         as={Link}
//                                         to={`/annexureform/${item.annexure_id}`}
//                                         variant="primary"
//                                         size="sm"
//                                         title="Add Annexure"
//                                       >
//                                         <FaPlus className="me-1" /> Add Annexure
//                                       </Button>
//                                     )}

//                                     {isApprovedValue(item.design_approval) && (
//                                       <>
//                                         <Button
//                                           as={Link}
//                                           to={`/annexureform/${item.annexure_id}`}
//                                           variant="primary"
//                                           size="sm"
//                                           title="Edit Annexure"
//                                         >
//                                           <FaReceipt className="me-1" /> Edit
//                                         </Button>
//                                         <Button
//                                           onClick={() => handleOpenDeliveryMemoModal(item)}
//                                           variant="success"
//                                           size="sm"
//                                           title="Create Delivery Memo"
//                                         >
//                                           <FaTruck className="me-1" /> D. Memo
//                                         </Button>
//                                         <Button
//                                           as={Link}
//                                           to={`/dispatchform/${item.annexure_id}`}
//                                           className="add-customer-btn"
//                                           size="sm"
//                                           title="Dispatch"
//                                         >
//                                           <FaBox className="me-1" /> Dispatch
//                                         </Button>
//                                       </>
//                                     )}

//                                     {/* Add Revision Button */}
//                                     {!isRevisionRow(item.annexure_no) && (
//                                       <Button
//                                         onClick={() => handleAddRevision(item.annexure_id)}
//                                         variant="warning"
//                                         size="sm"
//                                         title="Add Revision"
//                                       >
//                                         <FaCopy className="me-1" /> Revision
//                                       </Button>
//                                     )}

//                                     {/* View Button */}
//                                     <Button
//                                       onClick={() => handleViewAnnexure(item.annexure_id)}
//                                       className="buttonEye"
//                                       title="View Annexure"
//                                     >
//                                       <FaEye />
//                                     </Button>
//                                   </>
//                                 )}
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })
//                     ) : (
//                       <tr>
//                         <td colSpan="8" className="text-center">
//                           No records found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </Table>

//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                   <div className="d-flex justify-content-start p-3">
//                     <Pagination>
//                       <Pagination.First
//                         onClick={() => setCurrentPage(1)}
//                         disabled={currentPage === 1}
//                       />
//                       <Pagination.Prev
//                         onClick={() => setCurrentPage(currentPage - 1)}
//                         disabled={currentPage === 1}
//                       />
//                       {Array.from({ length: totalPages }, (_, i) => (
//                         <Pagination.Item
//                           key={i + 1}
//                           active={currentPage === i + 1}
//                           onClick={() => setCurrentPage(i + 1)}
//                         >
//                           {i + 1}
//                         </Pagination.Item>
//                       ))}
//                       <Pagination.Next
//                         onClick={() => setCurrentPage(currentPage + 1)}
//                         disabled={currentPage === totalPages}
//                       />
//                       <Pagination.Last
//                         onClick={() => setCurrentPage(totalPages)}
//                         disabled={currentPage === totalPages}
//                       />
//                     </Pagination>
//                   </div>
//                 )}
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>

//         {/* Modals */}
//         {selectedPO && (
//           <PoView
//             show={showPOModal}
//             onHide={handleClosePOModal}
//             poData={selectedPO}
//             enableApproval={enableApproval}
//             onPOApproved={handlePOApprovedFromModal}
//           />
//         )}

//         {/* NEW: PO Approval Modal */}
//         <Suspense fallback={<div>Loading...</div>}>
//           {showPOApprovalModal && (
//             <POPreviewModal
//               show={showPOApprovalModal}
//               onHide={handleClosePOApprovalModal}
//               poData={selectedPOForApproval}
//               enableApproval={poModalMode === "approve"}
//               onPOApproved={handlePOApprovedFromModal}
//             />
//           )}
//         </Suspense>

//         <DeliveryMemoForm
//           show={showDeliveryMemoModal}
//           onHide={handleCloseDeliveryMemoModal}
//           poData={deliveryMemoSource.type === 'po' ? deliveryMemoSource.data : null}
//           annexureData={deliveryMemoSource.type === 'annexure' ? deliveryMemoSource.data : null}
//         />
//       </Container>
//     </>
//   );
// };

// export default Annexure;

import React, { useState, useMemo, useEffect, lazy, Suspense } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Spinner,
  Badge,
  Pagination,
  Modal,
  Nav,
  Tab,
} from "react-bootstrap";
import {
  FaEye,
  FaSearch,
  FaPlus,
  FaReceipt,
  FaTruck,
  FaBox,
  FaEdit,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaCopy,
  FaDownload,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Components
import PoView from "../components/PoView";
const POPreviewModal = lazy(() => import("../components/POPreviewModal"));

// APIs
const COMBINED_API = "https://nlfs.in/erp/index.php/Nlf_Erp/list_annexure_and_po";
const ADD_DM_API = "https://nlfs.in/erp/index.php/Api/add_dm";

// Custom styles for left alignment
const leftAlignStyles = `
  .text-left-custom {
    text-align: left !important;
  }
  .table th, .table td {
    text-align: left !important;
  }
  .modal-title {
    text-align: left !important;
  }
  .card-title {
    text-align: left !important;
  }
  .pagination {
    justify-content: flex-start !important;
  }
  .d-flex.justify-content-end {
    justify-content: flex-start !important;
  }
  .position-relative {
    text-align: left !important;
  }
  .po-tabs .nav-link {
    color: #495057;
    font-weight: 500;
  }
  .po-tabs .nav-link.active {
    font-weight: 700;
  }
`;

const isRevisionRow = (annexureNo = "") => {
  return /-R\d+$/i.test(annexureNo);
};

// Utility function to check if a value is approved
const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

// Delivery Memo Form Component
const DeliveryMemoForm = ({ show, onHide, poData, annexureData }) => {
  const [formData, setFormData] = useState({
    delivery_challan_no: '',
    date: new Date().toISOString().split('T')[0],
    mode_dispatch: '',
    vehicle_no: '',
    destination: '',
    lr_no: '',
    terms_of_delivery: '',
    items: []
  });
  const [packingListFile, setPackingListFile] = useState(null);
  const [loading, setLoading] = useState(false);
// Replace handleViewPO with this:


  useEffect(() => {
    // Pre-populate form with data from PO or Annexure
    if (poData) {
      setFormData(prev => ({
        ...prev,
        destination: poData.client_name || poData.company || '',
        items: poData.items || []
      }));
    } else if (annexureData) {
      setFormData(prev => ({
        ...prev,
        destination: annexureData.annexure_vendor || annexureData.vendor || '',
        items: annexureData.items || []
      }));
    }
  }, [poData, annexureData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setPackingListFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.delivery_challan_no || !formData.date) {
      toast.error("Delivery Challan No and Date are required");
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('delivery_challan_no', formData.delivery_challan_no);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('mode_dispatch', formData.mode_dispatch);
      formDataToSend.append('vehicle_no', formData.vehicle_no);
      formDataToSend.append('destination', formData.destination);
      formDataToSend.append('lr_no', formData.lr_no);
      formDataToSend.append('terms_of_delivery', formData.terms_of_delivery);
      formDataToSend.append('items', JSON.stringify(formData.items));
      
      if (packingListFile) {
        formDataToSend.append('packing_list', packingListFile);
      }

      const response = await axios.post(ADD_DM_API, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status) {
        toast.success("Delivery Memo created successfully");
        onHide();
        // Reset form
        setFormData({
          delivery_challan_no: '',
          date: new Date().toISOString().split('T')[0],
          mode_dispatch: '',
          vehicle_no: '',
          destination: '',
          lr_no: '',
          terms_of_delivery: '',
          items: []
        });
        setPackingListFile(null);
      } else {
        toast.error(response.data.message || "Failed to create Delivery Memo");
      }
    } catch (error) {
      console.error("Error creating Delivery Memo:", error);
      toast.error("Error creating Delivery Memo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="text-left-custom">Create Delivery Memo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-left-custom">Delivery Challan No *</Form.Label>
                <Form.Control
                  type="text"
                  name="delivery_challan_no"
                  value={formData.delivery_challan_no}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-left-custom">Date *</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-left-custom">Mode of Dispatch</Form.Label>
                <Form.Control
                  type="text"
                  name="mode_dispatch"
                  value={formData.mode_dispatch}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-left-custom">Vehicle No</Form.Label>
                <Form.Control
                  type="text"
                  name="vehicle_no"
                  value={formData.vehicle_no}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-left-custom">Destination</Form.Label>
                <Form.Control
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-left-custom">LR No</Form.Label>
                <Form.Control
                  type="text"
                  name="lr_no"
                  value={formData.lr_no}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label className="text-left-custom">Terms of Delivery</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="terms_of_delivery"
              value={formData.terms_of_delivery}
              onChange={handleInputChange}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label className="text-left-custom">Packing List (PDF only)</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
            />
          </Form.Group>
          
          <div className="d-flex justify-content-start gap-2">
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Create Delivery Memo"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const Annexure = () => {
  // === HOOKS ===
  const navigate = useNavigate();

  // === DATA STATES ===
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPOs, setExpandedPOs] = useState(new Set());
  const itemsPerPage = 10;
  
  // NEW: Tab state for PO approval status
  const [activeTab, setActiveTab] = useState("all"); // "all", "approved", "pending"

  // === MODAL STATES ===
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [showDeliveryMemoModal, setShowDeliveryMemoModal] = useState(false);
  const [deliveryMemoSource, setDeliveryMemoSource] = useState({ type: null, data: null });
  const [enableApproval, setEnableApproval] = useState(true);
  
  // NEW: PO Approval Modal States
  const [showPOApprovalModal, setShowPOApprovalModal] = useState(false);
  const [selectedPOForApproval, setSelectedPOForApproval] = useState(null);
  const [poModalMode, setPOModalMode] = useState("view"); // "view" or "approve"

  // === FETCH DATA ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from the combined API
        const response = await axios.get(COMBINED_API);
        
        if (String(response.data?.status) === "true") {
          let tableStructure = [];
          const poMap = new Map(); // to avoid duplicate parent POs

          (response.data.data || []).forEach(item => {
            const hasPO = Boolean(item.po_id);
            const hasAnnexure = Boolean(item.annexure_id);

            // HANDLE PARENT PO
            if (hasPO && !poMap.has(item.po_id)) {
              const parentPO = {
                po_id: item.po_id,
                po_no: item.po_no,
                quote_id: item.quote_id,
                delivery_schedule: item.delivery_schedule,
                liquidated_damages: item.liquidated_damages,
                defect_liability_period: item.defect_liability_period,
                installation_scope: item.installation_scope,
                total_amt: item.total_amt,
                po_qty: item.po_qty,
                total_advance: item.total_advance,
                total_bal: item.total_bal,
                gst: item.gst,
                date: item.date,
                company: item.company,
                site_address: item.site_address,
                billing_address: item.billing_address,
                gst_number: item.gst_number,
                pan_number: item.pan_number,
                contact_person: item.contact_person,
                image: item.image,
                project_name: item.project_name,
                client_name: item.client_name,
                vendor: item.vendor,

                // keep approval info
                po_approval: item.po_approval,
                po_status: item.po_status,

                items: item.items,

                isParent: true,
                isChild: false,
                type: "po",
              };

              poMap.set(item.po_id, parentPO);
              tableStructure.push(parentPO);
            }

            // HANDLE ANNEXURE
            if (hasAnnexure) {
              tableStructure.push({
                annexure_id: item.annexure_id,
                annexure_no: item.annexure_no,
                annexure_po_id: item.annexure_po_id,
                revise: item.revise,
                status: item.status,
                design_approval: item.design_approval,
                annexure_approval: item.annexure_approval,

                // inherit vendor from PO
                annexure_vendor: item.company || item.client_name || item.annexure_vendor || "N/A",

                project: item.project,
                annexure_client_name: item.annexure_client_name,
                annexure_date: item.annexure_date,
                annexure_total_amount: item.annexure_total_amount,
                annexure: item.annexure,

                po_id: item.po_id,
                po_no: item.po_no,

                isParent: false,
                isChild: true,
                type: "annexure",
                parentPO: item.po_no,
                parentPOId: item.po_id
              });
            }
          });

          // Group items by PO
          const poGroups = new Map();
          
          tableStructure.forEach(item => {
            if (item.type === 'po') {
              if (!poGroups.has(item.po_id)) {
                poGroups.set(item.po_id, {
                  po: item,
                  annexures: []
                });
              }
            } else if (item.type === 'annexure') {
              const poId = item.parentPOId || item.po_id;
              if (!poGroups.has(poId)) {
                poGroups.set(poId, {
                  po: null,
                  annexures: []
                });
              }
              poGroups.get(poId).annexures.push(item);
            }
          });
          
          // Sort each group's annexures in descending order by revision number
          poGroups.forEach(group => {
            group.annexures.sort((a, b) => {
              const getRevisionScore = (val = "") => {
                const str = String(val);
                const aMatch = str.match(/A(\d+)/);
                const aNum = aMatch ? parseInt(aMatch[1]) : 0;
                const rMatch = str.match(/R(\d+)/);
                const rNum = rMatch ? parseInt(rMatch[1]) : 0;
                return aNum * 1000 + rNum;
              };

              const scoreA = getRevisionScore(a.annexure_no);
              const scoreB = getRevisionScore(b.annexure_no);

              return scoreB - scoreA; // DESC
            });
          });
          
          // Sort PO groups by date and PO number (descending)
          const sortedGroups = Array.from(poGroups.entries()).sort((a, b) => {
            const groupA = a[1];
            const groupB = b[1];
            
            const dateA = groupA.po ? groupA.po.date : (groupA.annexures[0]?.annexure_date || '');
            const dateB = groupB.po ? groupB.po.date : (groupB.annexures[0]?.annexure_date || '');
            
            const timeA = dateA ? new Date(dateA).getTime() : 0;
            const timeB = dateB ? new Date(dateB).getTime() : 0;
            
            // Sort by date (descending - newest first)
            if (timeB !== timeA) {
              return timeB - timeA;
            }
            
            // If dates are equal, sort by PO number (descending)
            const poNoA = groupA.po?.po_no || '';
            const poNoB = groupB.po?.po_no || '';
            
            const numA = parseInt((poNoA.match(/PO-(\d+)/) || ['', '0'])[1]);
            const numB = parseInt((poNoB.match(/PO-(\d+)/) || ['', '0'])[1]);
            
            return numB - numA; // Descending order
          });
          
          // Flatten the sorted groups into final table structure
          const finalStructure = [];
          sortedGroups.forEach(([poId, group]) => {
            // Add annexures first (in descending order A2, A1)
            finalStructure.push(...group.annexures);
            // Then add the PO
            if (group.po) {
              finalStructure.push({
                ...group.po,
                annexures: group.annexures || []
              });
            }
          });
          
          tableStructure = finalStructure;
          
          setTableData(tableStructure);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading data");
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // === FILTER & PAGINATION ===
  const filteredData = useMemo(() => {
    let result = tableData;

    // Tab Filter for PO approval status
    if (activeTab !== "all") {
      result = result.filter((item) => {
        if (item.type === 'po') {
          const isApproved = isApprovedValue(item.po_approval);
          return activeTab === "approved" ? isApproved : !isApproved;
        }
        // For annexures, we need to check the parent PO's approval status
        if (item.type === 'annexure' && item.parentPOId) {
          const parentPO = tableData.find(po => po.type === 'po' && po.po_id === item.parentPOId);
          if (parentPO) {
            const isApproved = isApprovedValue(parentPO.po_approval);
            return activeTab === "approved" ? isApproved : !isApproved;
          }
        }
        return true; // Keep annexures if we can't determine parent PO status
      });
    }

    // Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        return (
          (item.po_no && item.po_no.toLowerCase().includes(term)) ||
          (item.annexure_no && item.annexure_no.toLowerCase().includes(term)) ||
          (item.company && item.company.toLowerCase().includes(term)) ||
          (item.annexure_client_name && item.annexure_client_name.toLowerCase().includes(term)) ||
          (item.annexure_vendor && item.annexure_vendor.toLowerCase().includes(term)) ||
          (item.po_id && item.po_id.toLowerCase().includes(term)) ||
          (item.delivery_schedule && item.delivery_schedule.toLowerCase().includes(term)) ||
          (item.total_amt && String(item.total_amt).includes(term)) ||
          (item.annexure_total_amount && String(item.annexure_total_amount).includes(term))
        );
      });
    }

    return result;
  }, [searchTerm, tableData, activeTab]);

  useEffect(() => setCurrentPage(1), [searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const currentData = filteredData.slice(indexLast - itemsPerPage, indexLast);

  // === MODAL HELPERS ===
  const handleViewPO = (po) => {
    setSelectedPO(po);
    setShowPOModal(true);
  };

  const handleViewPOPreview = (po) => {
  setSelectedPOForApproval(po);
  setPOModalMode("view"); // "view" mode = preview without approval checkbox
  setShowPOApprovalModal(true);
};

  const handleClosePOModal = () => {
    setShowPOModal(false);
    setSelectedPO(null);
  };
  
  // === NEW HANDLER FOR VIEWING ANNEXURE ===
  const handleViewAnnexure = (annexureId) => {
    navigate(`/annexure/view/${annexureId}`);
  };

  // === NEW HANDLER FOR ADDING REVISION ===
  const handleAddRevision = (annexureId) => {
    navigate(`/annexure/revise/${annexureId}`);
  };

  // === NEW HANDLER FOR PO APPROVAL ===
  const handleShowPOApprovalModal = (po) => {
    setSelectedPOForApproval(po);
    setPOModalMode("approve");
    setShowPOApprovalModal(true);
  };

  const handleClosePOApprovalModal = () => {
    setShowPOApprovalModal(false);
    setSelectedPOForApproval(null);
  };

  const handlePOApprovedFromModal = async (approvedPOId) => {
    // Update the PO in the local state
    setTableData((prev) =>
      prev.map((item) => 
        item.type === 'po' && item.po_id === approvedPOId 
          ? { ...item, po_approval: "yes" } 
          : item
      )
    );
    
    // Close the modal
    handleClosePOApprovalModal();
    
    // Show success message
    toast.success("PO approved successfully");
  };

  const handleOpenDeliveryMemoModal = (item) => {
    if (item.type === 'po') {
      setDeliveryMemoSource({ type: 'po', data: item });
    } else {
      setDeliveryMemoSource({ type: 'annexure', data: item });
    }
    setShowDeliveryMemoModal(true);
  };

  const handleCloseDeliveryMemoModal = () => {
    setShowDeliveryMemoModal(false);
    setDeliveryMemoSource({ type: null, data: null });
  };

  return (
    <>
      <style>{leftAlignStyles}</style>
      <Container fluid>
        <Row>
          <Col md="12">
            <Card className="strpied-tabled-with-hover">
              <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
                <Row className="align-items-center">
                  <Col>
                    <Card.Title className="text-left-custom" style={{ marginTop: "2rem", fontWeight: "700" }}>
                      Purchase Orders & Annexures
                    </Card.Title>
                  </Col>
                  <Col className="d-flex justify-content-start align-items-center gap-2">
                    {/* <Button as={Link} to="/directpo" className="btn btn-primary add-customer-btn">
                      <FaPlus size={14} className="me-1" /> Add Direct PO
                    </Button> */}
                  </Col>
                    <Col md={4}>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        placeholder="Search by Number, Name, WO No, Total..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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

              <Card.Body className="table-full-width table-responsive">
                {/* NEW: PO Approval Tabs */}
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                  <Nav variant="tabs" className="po-tabs mb-3">
                    <Nav.Item>
                      <Nav.Link eventKey="all">All POs</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="approved">Approved POs</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="pending">Pending POs</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Tab.Container>

                {/* Main Table */}
                <Table className="table table-striped table-hover text-left-custom">
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>PO Number</th>
                      <th>Vendor Name</th>
                      <th>WO Number</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <Spinner animation="border" />
                        </td>
                      </tr>
                    ) : currentData.length > 0 ? (
                      currentData.map((item, index) => {
                        const isPO = item.isParent;
                        const isAnnexure = item.isChild;
                        const isPOApproved = isPO && isApprovedValue(item.po_approval);
                        
                        return (
                          <tr 
                            key={`${isPO ? 'po' : 'annexure'}-${isPO ? item.po_id : item.annexure_id}`}
                            className={isAnnexure ? "table-light" : ""}
                            style={isAnnexure ? { backgroundColor: "#f8f9fa" } : {}}
                          >
                            <td>
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td>
                              {isPO ? (item.po_no || "TBA") : (item.annexure_no || "TBA")}
                            </td>
                            <td>
                                {isPO ? 
                                  (item.company || item.client_name || "N/A") : 
                                  (item.annexure_vendor || "N/A")
                                }
                            </td>
                            <td>
                              {item.delivery_schedule && item.delivery_schedule.trim() !== ""
                                ? item.delivery_schedule
                                : "Direct PO"}
                            </td>
                            <td>
                              {isPO ? 
                                (item.date || "N/A") : 
                                (item.annexure_date || "N/A")
                              }
                            </td>
                            <td>
                              {isPO ? 
                                (item.total_amt ? `₹${Number(item.total_amt).toLocaleString('en-IN')}` : "N/A") : 
                                (item.annexure_total_amount ? `₹${Number(item.annexure_total_amount).toLocaleString('en-IN')}` : "N/A")
                              }
                            </td>
                            <td>
                              <div className="d-flex gap-2 flex-wrap justify-content-start">
                                {/* PO Specific Actions */}
                                {isPO && (
                                  <>
                                    {/* If PO is not approved, show checkbox */}
                                    {!isPOApproved ? (
                                      <div className="d-flex align-items-center gap-2">
                                        <Form.Check
                                          type="checkbox"
                                          checked={false}
                                          onChange={() => handleShowPOApprovalModal(item)}
                                        />
                                        <Badge bg="warning" text="dark">Pending Approval</Badge>
                                      </div>
                                    ) : (
                                      <>
                                        <Button
                                          as={Link}
                                          to={`/annexureform/${item.po_id}`}
                                          className="add-customer-btn"
                                          size="sm"
                                          title="Add Annexure"
                                        >
                                          <FaPlus className="me-1" /> Add Annexure
                                        </Button>

                                        <Button
                                          onClick={() => handleOpenDeliveryMemoModal(item)}
                                          variant="success"
                                          size="sm"
                                          title="Add Delivery Memo"
                                        >
                                          <FaTruck className="me-1" /> D. Memo
                                        </Button>

                                        {/* View Button - Moved to the rightmost side */}
                                       <Button
  onClick={() => handleViewPOPreview(item)}
  variant="outline-danger"
  title="View PO"
>
  <FaDownload />
</Button>
                                      </>
                                    )}
                                  </>
                                )}

                                {/* Annexure Specific Actions */}
                                {isAnnexure && (
                                  <>
                                    {item.status === "draft" && (
                                      <Button
                                        as={Link}
                                        to={`/annexureform/${item.annexure_id}`}
                                        variant="primary"
                                        size="sm"
                                        title="Add Annexure"
                                      >
                                        <FaPlus className="me-1" /> Add Annexure
                                      </Button>
                                    )}

                                    {isApprovedValue(item.design_approval) && (
                                      <>
                                        <Button
                                          as={Link}
                                          to={`/annexureform/${item.annexure_id}`}
                                          variant="primary"
                                          size="sm"
                                          title="Edit Annexure"
                                        >
                                          <FaReceipt className="me-1" /> Edit
                                        </Button>
                                        <Button
                                          onClick={() => handleOpenDeliveryMemoModal(item)}
                                          variant="success"
                                          size="sm"
                                          title="Create Delivery Memo"
                                        >
                                          <FaTruck className="me-1" /> D. Memo
                                        </Button>
                                        <Button
                                          as={Link}
                                          to={`/dispatchform/${item.annexure_id}`}
                                          className="add-customer-btn"
                                          size="sm"
                                          title="Dispatch"
                                        >
                                          <FaBox className="me-1" /> Dispatch
                                        </Button>
                                      </>
                                    )}

                                    {/* Add Revision Button */}
                                    {!isRevisionRow(item.annexure_no) && (
                                      <Button
                                        onClick={() => handleAddRevision(item.annexure_id)}
                                        variant="warning"
                                        size="sm"
                                        title="Add Revision"
                                      >
                                        <FaCopy className="me-1" /> Revision
                                      </Button>
                                    )}

                                    {/* View Button */}
                                    <Button
                                      onClick={() => handleViewAnnexure(item.annexure_id)}
                                      className="buttonEye"
                                      title="View Annexure"
                                    >
                                      <FaEye />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-start p-3">
                    <Pagination>
                      <Pagination.First
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modals */}
        {selectedPO && (
          <PoView
            show={showPOModal}
            onHide={handleClosePOModal}
            poData={selectedPO}
            enableApproval={enableApproval}
            onPOApproved={handlePOApprovedFromModal}
          />
        )}

        {/* NEW: PO Approval Modal */}
        <Suspense fallback={<div>Loading...</div>}>
          {showPOApprovalModal && (
            <POPreviewModal
              show={showPOApprovalModal}
              onHide={handleClosePOApprovalModal}
              poData={selectedPOForApproval}
              enableApproval={poModalMode === "approve"}
              onPOApproved={handlePOApprovedFromModal}
            />
          )}
        </Suspense>

        <DeliveryMemoForm
          show={showDeliveryMemoModal}
          onHide={handleCloseDeliveryMemoModal}
          poData={deliveryMemoSource.type === 'po' ? deliveryMemoSource.data : null}
          annexureData={deliveryMemoSource.type === 'annexure' ? deliveryMemoSource.data : null}
        />
      </Container>
    </>
  );
};

export default Annexure;