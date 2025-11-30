


// // PoForm.jsx
// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
// import POPreviewModal from "../components/POPreviewModal";

// import { FaArrowLeft, FaDownload } from "react-icons/fa";
// import { po as poData } from "../data/mockdata";
// import axios from "axios";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// // Helper: Recalculate item amounts
// const recalculateItemAmount = (quantity, rate) => {
//   return ((parseFloat(quantity) || 0) * (parseFloat(rate) || 0)).toString();
// };

// const materialOptions = [
//   "Select Material",
//   "Ply",
//   "Screws",
//   "Aluminium Foils",
//   "Laminates",
//   "Service",
// ];

// const initialFormState = {
//   // ===== PO HEADER =====
//   poId: "",
//   poNumber: "",
//   poDate: "",
//   projectName: "",
//   department: "",
//   leadId: "",
//   quotationId: "",
//   quotationRound: "",
//   leadType: "",

//   // ===== CLIENT DETAILS =====
//   clientName: "",
//   contactPerson: "",
//   contactPersonMobile: "",
//   contactPersonEmail: "",
//   companyName: "",
//   siteAddress: "",
//   billingAddress: "",
//   gstNumber: "",
//   panNumber: "",
//   customerId: "",

//   // ===== TIMELINE =====
//   expectedDeliveryDate: "",
//   actualDeliveryDate: "",
//   completionDate: "",

//   // ===== FINANCIALS =====
//   quotedAmount: "",
//   totalAmount: "",
//   advancePaymentPercentage: "",
//   advancePaymentAmount: "",
//   balancePaymentPercentage: "",
//   balancePaymentAmount: "",
//   advancePaymentReceived: false,
//   advancePaymentReceivedDate: "",
//   advancePaymentMode: "",
//   advanceTransactionRef: "",
//   balancePaymentReceived: false,
//   balancePaymentDate: "",
//   balancePaymentMode: "",
//   gstApplicable: true,
//   gstPercentage: 18,
//   gstAmount: "",
//   tdsApplicable: false,
//   tdsAmount: "",
//   totalInvoiceAmount: "",
//   currency: "INR",

//   // ===== ITEMS =====
//   items: [
//     {
//       id: `item - ${Date.now()} -1`,
//       itemId: "",
//       material: materialOptions[0],
//       description: "",
//       unit: "",
//       quantity: "",
//       rate: "",
//       amount: "",
//       specifications: {
//         dimensions: "",
//         material: "",
//         finish: "",
//         features: "",
//         model: "",
//         adjustments: "",
//         loadCapacity: "",
//         warranty: "",
//         configuration: "",
//         upholstery: "",
//         deliveryScope: "",
//       },
//       deliveryStatus: "pending",
//     },
//   ],

//   // ===== TERMS & CONDITIONS =====
//   termsAndConditions: {
//     paymentTerms: {
//       description: "",
//       advancePercentage: "",
//       balancePercentage: "",
//       paymentDueDate: "",
//       balanceDueDate: "",
//       paymentMethods: "",
//       bankDetails: {
//         bankName: "",
//         accountNumber: "",
//         ifscCode: "",
//         accountHolderName: "",
//       },
//       delayPenalty: "",
//     },
//     deliverySchedule: {
//       expectedDeliveryDate: "",
//       deliveryLocation: "",
//       deliveryTimeSlot: "",
//       deliveryTerms: "",
//       freightCharges: "",
//       packingCharges: "",
//       deliveryNotes: "",
//       advanceNotification: "",
//       receivingInstructions: "",
//     },
//     liquidatedDamages: {
//       applicable: false,
//       description: "",
//       ratePerWeek: "",
//       calculationBasis: "",
//       maxCapPercentage: "",
//       maxCapAmount: "",
//       example: "",
//       applicableFrom: "",
//       claimProcess: "",
//       deductionMethod: "",
//       exemptions: "",
//     },
//     defectLiabilityPeriod: {
//       duration: "",
//       startDate: "",
//       endDate: "",
//       description: "",
//       coverageScope: "",
//       claimProcess: {
//         notificationPeriod: "",
//         notificationMethod: "",
//         inspectionPeriod: "",
//         approvalPeriod: "",
//         totalResolutionTime: "",
//       },
//       remedyType: "",
//       exclusions: "",
//       maintenanceObligation: "",
//       warrantyItems: {
//         chairs: { structural: "", upholstery: "", mechanisms: "" },
//         desks: { structural: "", finish: "", joints: "" },
//         lounge: { frame: "", upholstery: "", springs: "" },
//       },
//     },
//     warranty: {
//       period: "",
//       coverageScope: "",
//       limitations: "",
//     },
//     qualityAndInspection: {
//       factoryInspection: "",
//       onSiteInspection: "",
//       inspectionAuthority: "",
//       acceptanceCriteria: "",
//       rejectionRights: "",
//       defectiveItemReplacement: "",
//     },
//     installationAndCommissioning: {
//       installationIncluded: false,
//       installationScope: "",
//       installationSchedule: "",
//       installationDuration: "",
//       clientResponsibilities: "",
//       postInstallationSupport: "",
//     },
//     generalTerms: {
//       orderAcceptance: "",
//       modifications: "",
//       cancellation: "",
//       forceMajeure: "",
//       disputes: "",
//       jurisdiction: "",
//       governingLaw: "",
//       paymentOnCompletion: "",
//       escalationClause: "",
//     },
//   },

//   // ===== SPECIFICATIONS =====
//   specifications: {
//     general: "",
//     deskFinish: "",
//     chairSpecs: "",
//     loungeSpecs: "",
//     colorScheme: "",
//     customRequirements: "",
//     drawingsReference: "",
//   },

//   // ===== SITE CONDITIONS =====
//   siteConditions: {
//     siteReadiness: "",
//     accessConditions: "",
//     installationSpace: "",
//     specialRequirements: "",
//     clientPreparation: "",
//     safetyRequirements: "",
//   },

//   // ===== SALESPERSON & APPROVAL =====
//   salespersonId: "",
//   salespersonName: "",
//   salespersonEmail: "",
//   salespersonMobile: "",
//   approvalStatus: "",
//   approvedBy: "",
//   approvedDate: "",
//   approvalRemarks: "",

//   // ===== STATUS & METADATA =====
//   poStatus: "",
//   priority: "",
//   notes: "",
// };

// // Function to fetch next PO number from API
// const fetchNextPoNumber = async () => {
//   try {
//     const response = await axios.get("https://nlfs.in/erp/index.php/Erp/get_next_po_no");
//     if (response.data.status && response.data.next_quote_no) {
//       return response.data.next_quote_no;
//     }
//     throw new Error("Failed to get next PO number");
//   } catch (error) {
//     console.error("Error fetching next PO number:", error);
//     const year = new Date().getFullYear().toString().substring(2);
//     const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
//     return `NLF - ${year} -PO - ${randomId} `;
//   }
// };

// // Function to format quote number in the required format
// const formatQuoteNumber = (quoteNo, quoteId, revise) => {
//   if (quoteNo && quoteNo.includes("NLF-")) {
//     return quoteNo;
//   }

//   const currentYear = new Date().getFullYear();
//   const nextYear = currentYear + 1;
//   const yearSuffix = currentYear.toString().substring(2);
//   const nextYearSuffix = nextYear.toString().substring(2);

//   if (quoteId && !isNaN(quoteId)) {
//     let formattedQuoteId = `NLF - ${yearSuffix} -${nextYearSuffix} -Q - ${quoteId} `;
//     if (revise && revise !== "" && revise !== null) {
//       formattedQuoteId = `${formattedQuoteId} -R${revise} `;
//     }
//     return formattedQuoteId;
//   }

//   if (quoteId && quoteId.includes("NLF-")) {
//     return quoteId;
//   }

//   return quoteNo || quoteId || "N/A";
// };

// // Function to fetch next QUOTE number from API
// const fetchNextQuoteNumber = async () => {
//   try {
//     console.log("FETCHING next quote number from API...");
//     const response = await fetch("https://nlfs.in/erp/index.php/Erp/get_next_quote_no");

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status} `);
//     }

//     const result = await response.json();
//     console.log("--- API RESPONSE START ---");
//     console.log("Full Quote API Response Object:", result);
//     console.log("--- API RESPONSE END ---");

//     if (result.status && result.success === "1") {
//       return result.next_quote_no;
//     } else {
//       throw new Error(result.message || "Failed to fetch next quote number");
//     }
//   } catch (error) {
//     console.error("CATCH BLOCK: Error in fetchNextQuoteNumber:", error);
//     const currentYear = new Date().getFullYear();
//     const nextYear = currentYear + 1;
//     const yearSuffix = currentYear.toString().substring(2);
//     const nextYearSuffix = nextYear.toString().substring(2);
//     const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
//     const fallbackId = `NLF - ${yearSuffix} -${nextYearSuffix} -Q - ${randomId} `;
//     console.log("FALLBACK: Using locally generated ID:", fallbackId);
//     return fallbackId;
//   }
// };

// // Function to fetch quotation details by ID
// const fetchQuotationDetails = async (quotationId) => {
//   try {
//     const response = await axios.post(
//       "https://nlfs.in/erp/index.php/Nlf_Erp/get_quotation_by_id",
//       {
//         quote_id: String(quotationId),
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.data.status && response.data.data) {
//       return response.data.data;
//     }
//     throw new Error("Failed to fetch quotation details");
//   } catch (error) {
//     console.error("Error fetching quotation details:", error);
//     throw error;
//   }
// };

// export default function PoForm() {
//   const { poId, quotationId } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState(initialFormState);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [isSaved, setIsSaved] = useState(false);
//   const [savedPOData, setSavedPOData] = useState(null);
//  const [showPreview, setShowPreview] = useState(false);


//   // Fetch next PO number when component mounts
//   useEffect(() => {
//     const fetchPoNumber = async () => {
//       try {
//         setIsLoading(true);
//         const nextPoNumber = await fetchNextPoNumber();
//         setFormData((prev) => ({
//           ...prev,
//           poNumber: nextPoNumber,
//           poDate: new Date().toISOString().split("T")[0],
//         }));
//       } catch (error) {
//         setError("Failed to fetch PO number");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchPoNumber();
//   }, []);

//   // Fetch next quote number when component mounts and no quotationId is provided
//   useEffect(() => {
//     console.log(`--- USEEFFECT CHECK--- URL quotationId is: "${quotationId}"`);

//     if (quotationId) {
//       console.log("ACTION: Skipping fetchNextQuoteNumber because quotationId exists in URL.");
//       return;
//     }

//     const fetchQuoteNumber = async () => {
//       console.log("ACTION: No quotationId in URL. Proceeding to fetch a new one...");
//       try {
//         setIsLoading(true);
//         const nextQuoteNo = await fetchNextQuoteNumber();
//         console.log(`--- STATE UPDATE--- Received quote number: "${nextQuoteNo}"`);

//         const formattedQuoteId = formatQuoteNumber(null, nextQuoteNo, null);
//         console.log(`--- STATE UPDATE--- Formatted quote ID: "${formattedQuoteId}"`);

//         setFormData((prev) => {
//           console.log(`--- STATE UPDATE--- Setting new quotationId in state.`);
//           return { ...prev, quotationId: formattedQuoteId };
//         });
//       } catch (error) {
//         console.error("ACTION: Failed to fetch quote number.", error);
//         setError("Failed to fetch quote number");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchQuoteNumber();
//   }, [quotationId]);

//   // Fetch quotation details if quotationId is provided
//   useEffect(() => {
//     if (!quotationId) return;

//     const fetchQuotation = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
//         const quotationData = await fetchQuotationDetails(quotationId);

//         setFormData((prev) => ({
//           ...prev,
//           quotationId: quotationData.quote_no,
//           projectName: quotationData.project || "",
//           clientName: quotationData.name || "",
//           items: quotationData.items.map((item, idx) => ({
//             id: `item - ${Date.now()} -${idx} `,
//             itemId: "",
//             material: item.product || materialOptions[0],
//             description: item.desc || "",
//             unit: item.unit || "",
//             quantity: String(item.qty || ""),
//             rate: String(item.rate || ""),
//             amount: String(item.amt || ""),
//             specifications: {
//               dimensions: "",
//               material: "",
//               finish: "",
//               features: "",
//               model: "",
//               adjustments: "",
//               loadCapacity: "",
//               warranty: "",
//               configuration: "",
//               upholstery: "",
//               deliveryScope: "",
//             },
//             deliveryStatus: "pending",
//           })),
//           quotedAmount: quotationData.total || "",
//           totalAmount: quotationData.total || "",
//           termsAndConditions: {
//             ...prev.termsAndConditions,
//           },
//         }));
//       } catch (error) {
//         setError("Failed to fetch quotation details");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchQuotation();
//   }, [quotationId]);

//   // Load PO data if poId is provided (for editing existing PO)
//   useEffect(() => {
//     if (!poId) return;

//     const poRecord = poData.find((p) => p.poId === poId);
//     if (!poRecord) {
//       console.warn("PO not found:", poId);
//       return;
//     }

//     const mappedItems = poRecord.items.map((item, idx) => ({
//       id: `item - ${Date.now()} -${idx} `,
//       itemId: item.itemId || "",
//       material: item.material || materialOptions[0],
//       description: item.description || "",
//       unit: item.unit || "",
//       quantity: String(item.quantity || ""),
//       rate: String(item.rate || ""),
//       amount: String(item.total || ""),
//       specifications: {
//         dimensions: item.specifications?.dimensions || "",
//         material: item.specifications?.material || "",
//         finish: item.specifications?.finish || "",
//         features: item.specifications?.features || "",
//         model: item.specifications?.model || "",
//         adjustments: item.specifications?.adjustments || "",
//         loadCapacity: item.specifications?.loadCapacity || "",
//         warranty: item.specifications?.warranty || "",
//         configuration: item.specifications?.configuration || "",
//         upholstery: item.specifications?.upholstery || "",
//         deliveryScope: item.specifications?.deliveryScope || "",
//       },
//       deliveryStatus: item.deliveryStatus || "pending",
//     }));

//     setFormData({
//       poId: poRecord.poId || "",
//       poNumber: poRecord.poNumber || "",
//       poDate: poRecord.poDate || "",
//       projectName: poRecord.projectName || "",
//       department: poRecord.department || "",
//       leadId: poRecord.leadId || "",
//       quotationId: poRecord.quotationId || "",
//       quotationRound: poRecord.quotationRound || "",
//       leadType: poRecord.leadType || "",
//       clientName: poRecord.clientName || "",
//       contactPerson: poRecord.contactPerson || "",
//       contactPersonMobile: poRecord.contactPersonMobile || "",
//       contactPersonEmail: poRecord.contactPersonEmail || "",
//       companyName: poRecord.companyName || "",
//       siteAddress: poRecord.siteAddress || "",
//       billingAddress: poRecord.billingAddress || "",
//       gstNumber: poRecord.gstNumber || "",
//       panNumber: poRecord.panNumber || "",
//       customerId: poRecord.customerId || "",
//       expectedDeliveryDate: poRecord.expectedDeliveryDate || "",
//       actualDeliveryDate: poRecord.actualDeliveryDate || "",
//       completionDate: poRecord.completionDate || "",
//       quotedAmount: String(poRecord.quotedAmount || ""),
//       totalAmount: String(poRecord.totalAmount || ""),
//       advancePaymentPercentage: String(poRecord.advancePaymentPercentage || ""),
//       advancePaymentAmount: String(poRecord.advancePaymentAmount || ""),
//       balancePaymentPercentage: String(poRecord.balancePaymentPercentage || ""),
//       balancePaymentAmount: String(poRecord.balancePaymentAmount || ""),
//       advancePaymentReceived: poRecord.advancePaymentReceived || false,
//       advancePaymentReceivedDate: poRecord.advancePaymentReceivedDate || "",
//       advancePaymentMode: poRecord.advancePaymentMode || "",
//       advanceTransactionRef: poRecord.advanceTransactionRef || "",
//       balancePaymentReceived: poRecord.balancePaymentReceived || false,
//       balancePaymentDate: poRecord.balancePaymentDate || "",
//       balancePaymentMode: poRecord.balancePaymentMode || "",
//       gstApplicable: poRecord.gstApplicable || false,
//       gstPercentage: poRecord.gstPercentage || 18,
//       gstAmount: String(poRecord.gstAmount || ""),
//       tdsApplicable: poRecord.tdsApplicable || false,
//       tdsAmount: String(poRecord.tdsAmount || ""),
//       totalInvoiceAmount: String(poRecord.totalInvoiceAmount || ""),
//       currency: poRecord.currency || "INR",
//       items: mappedItems,
//       termsAndConditions: {
//         ...initialFormState.termsAndConditions,
//         ...poRecord.termsAndConditions,
//         liquidatedDamages: {
//           ...initialFormState.termsAndConditions.liquidatedDamages,
//           ...poRecord.termsAndConditions?.liquidatedDamages,
//           exemptions: Array.isArray(
//             poRecord.termsAndConditions?.liquidatedDamages?.exemptions
//           )
//             ? poRecord.termsAndConditions.liquidatedDamages.exemptions.join("; ")
//             : "",
//         },
//         defectLiabilityPeriod: {
//           ...initialFormState.termsAndConditions.defectLiabilityPeriod,
//           ...poRecord.termsAndConditions?.defectLiabilityPeriod,
//           coverageScope: Array.isArray(
//             poRecord.termsAndConditions?.defectLiabilityPeriod?.coverageScope
//           )
//             ? poRecord.termsAndConditions.defectLiabilityPeriod.coverageScope.join("; ")
//             : "",
//           exclusions: Array.isArray(
//             poRecord.termsAndConditions?.defectLiabilityPeriod?.exclusions
//           )
//             ? poRecord.termsAndConditions.defectLiabilityPeriod.exclusions.join("; ")
//             : "",
//         },
//       },
//       specifications: {
//         ...initialFormState.specifications,
//         ...poRecord.specifications,
//       },
//       siteConditions: {
//         ...initialFormState.siteConditions,
//         ...poRecord.siteConditions,
//       },
//       salespersonId: poRecord.salespersonId || "",
//       salespersonName: poRecord.salespersonName || "",
//       salespersonEmail: poRecord.salespersonEmail || "",
//       salespersonMobile: poRecord.salespersonMobile || "",
//       approvalStatus: poRecord.approvalStatus || "",
//       approvedBy: poRecord.approvedBy || "",
//       approvedDate: poRecord.approvedDate || "",
//       approvalRemarks: poRecord.approvalRemarks || "",
//       poStatus: poRecord.poStatus || "",
//       priority: poRecord.priority || "",
//       notes: poRecord.notes || "",
//     });
//   }, [poId]);

//   // === Handlers ===
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleItemChange = (index, field, value) => {
//     setFormData((prev) => {
//       const newItems = [...prev.items];
//       newItems[index] = { ...newItems[index], [field]: value };

//       if (field === "quantity" || field === "rate") {
//         newItems[index].amount = recalculateItemAmount(
//           newItems[index].quantity,
//           newItems[index].rate
//         );
//       }

//       return { ...prev, items: newItems };
//     });
//   };

//   const handleAddItem = () => {
//     const newItem = {
//       id: `item - ${Date.now()} -${formData.items.length} `,
//       itemId: "",
//       material: materialOptions[0],
//       description: "",
//       unit: "",
//       quantity: "",
//       rate: "",
//       amount: "",
//       specifications: {
//         dimensions: "",
//         material: "",
//         finish: "",
//         features: "",
//         model: "",
//         adjustments: "",
//         loadCapacity: "",
//         warranty: "",
//         configuration: "",
//         upholstery: "",
//         deliveryScope: "",
//       },
//       deliveryStatus: "pending",
//     };
//     setFormData((prev) => ({
//       ...prev,
//       items: [...prev.items, newItem],
//     }));
//   };

//   const handleRemoveItem = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       items: prev.items.filter((_, i) => i !== index),
//     }));
//   };

//  const handleSubmit = async (e) => {
//   e.preventDefault();
//   setIsSubmitting(true);
//   setError(null);
//   setSuccess(null);

//   try {
//     const poPayload = {
//       po_no: formData.poNumber,
//       quote_id: formData.quotationId,
//       date: formData.poDate,
//       company: formData.companyName,
//       site_address: formData.siteAddress,
//       billing_address: formData.billingAddress,
//       gst_number: formData.gstNumber,
//       pan_number: formData.panNumber,
//       contact_person: formData.contactPerson,
//       delivery_schedule: formData.termsAndConditions.deliverySchedule.deliveryNotes,
//       liquidated_damages: formData.termsAndConditions.liquidatedDamages.description,
//       defect_liability_period: formData.termsAndConditions.defectLiabilityPeriod.duration,
//       installation_scope:
//         formData.termsAndConditions.installationAndCommissioning.installationScope,
//       total_amt: formData.totalAmount,
//       total_advance: formData.advancePaymentAmount,
//       total_bal: formData.balancePaymentAmount,
//       gst: `${formData.gstPercentage}% `,
//       items: formData.items.map((item) => ({
//         material: item.material,
//         description: item.description,
//         unit: item.unit,
//         quantity: item.quantity,
//         rate: item.rate,
//         amount: item.amount,
//       })),
//     };

//     const response = await axios.post(
//       "https://nlfs.in/erp/index.php/Api/add_po",
//       poPayload,
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (response.data.status === "true" && response.data.success === "1") {
//       setSuccess("Purchase Order created successfully! Redirecting to quotations...");
      
//       // Redirect back to ClientLead after a short delay
//       setTimeout(() => {
//         navigate('/client-lead');
//       }, 2000); // 2 second delay to show the success message
//     } else {
//       throw new Error(response.data.message || "Failed to create Purchase Order");
//     }
//   } catch (error) {
//     console.error("Error creating PO:", error);
//     setError(error.message || "Failed to create Purchase Order");
//   } finally {
//     setIsSubmitting(false);
//   }
// };
//   return (
//     <Container fluid className="my-4">
//       <Button
//         className="mb-3"
//         style={{ backgroundColor: "rgb(237, 49, 49)", border: "none" }}
//         onClick={() => navigate(-1)}
//       >
//         <FaArrowLeft /> Back
//       </Button>

//       {error && (
//         <Alert variant="danger" dismissible onClose={() => setError(null)}>
//           {error}
//         </Alert>
//       )}

//       {success && (
//         <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
//           {success}
//         </Alert>
//       )}

//       {isLoading ? (
//         <div className="text-center my-5">
//           <Spinner animation="border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </Spinner>
//         </div>
//       ) : (
//         <Form onSubmit={handleSubmit}>
//           <Card className="mb-4">
//             <Card.Header>
//               <h5>PO Details</h5>
//             </Card.Header>
//             <Card.Body>
//               <Row>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>PO Number</Form.Label>
//                     <Form.Control
//                       name="poNumber"
//                       value={formData.poNumber}
//                       onChange={handleInputChange}
//                       readOnly
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Date</Form.Label>
//                     <Form.Control
//                       type="date"
//                       name="poDate"
//                       value={formData.poDate}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//               <Row>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Project Name</Form.Label>
//                     <Form.Control
//                       name="projectName"
//                       value={formData.projectName}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Quotation No</Form.Label>
//                     <Form.Control
//                       name="quotationId"
//                       value={formData.quotationId}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//               <Row>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Department</Form.Label>
//                     <Form.Control
//                       name="department"
//                       value={formData.department}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           <Card className="mb-4">
//             <Card.Header>
//               <h5>Client Information</h5>
//             </Card.Header>
//             <Card.Body>
//               <Row>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Client Name</Form.Label>
//                     <Form.Control
//                       name="clientName"
//                       value={formData.clientName}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Company</Form.Label>
//                     <Form.Control
//                       name="companyName"
//                       value={formData.companyName}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//               <Row>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Site Address</Form.Label>
//                     <Form.Control
//                       as="textarea"
//                       rows={2}
//                       name="siteAddress"
//                       value={formData.siteAddress}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Billing Address</Form.Label>
//                     <Form.Control
//                       as="textarea"
//                       rows={2}
//                       name="billingAddress"
//                       value={formData.billingAddress}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//               <Row>
//                 <Col md={4}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>GST Number</Form.Label>
//                     <Form.Control
//                       name="gstNumber"
//                       value={formData.gstNumber}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>PAN Number</Form.Label>
//                     <Form.Control
//                       name="panNumber"
//                       value={formData.panNumber}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Contact Person</Form.Label>
//                     <Form.Control
//                       name="contactPerson"
//                       value={formData.contactPerson}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           <Card className="mb-4">
//             <Card.Header>
//               <Card.Title as="h5">Items</Card.Title>
//             </Card.Header>
//             <Card.Body>
//               {formData.items.map((item, idx) => (
//                 <div key={item.id} className="border rounded p-3 mb-3">
//                   <Row className="align-items-end">
//                     <Col md="2">
//                       <Form.Group>
//                         <Form.Label>Material</Form.Label>
//                         <Form.Control
//                           as="select"
//                           value={item.material}
//                           onChange={(e) => handleItemChange(idx, "material", e.target.value)}
//                         >
//                           {materialOptions.map((opt) => (
//                             <option key={opt} value={opt}>
//                               {opt}
//                             </option>
//                           ))}
//                         </Form.Control>
//                       </Form.Group>
//                     </Col>
//                     <Col md="3">
//                       <Form.Group>
//                         <Form.Label>Description</Form.Label>
//                         <Form.Control
//                           type="text"
//                           value={item.description}
//                           onChange={(e) => handleItemChange(idx, "description", e.target.value)}
//                         />
//                       </Form.Group>
//                     </Col>
//                     <Col md="1">
//                       <Form.Group>
//                         <Form.Label>Unit</Form.Label>
//                         <Form.Control
//                           type="text"
//                           value={item.unit}
//                           onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
//                         />
//                       </Form.Group>
//                     </Col>
//                     <Col md="1">
//                       <Form.Group>
//                         <Form.Label>Qty</Form.Label>
//                         <Form.Control
//                           type="number"
//                           value={item.quantity}
//                           onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
//                         />
//                       </Form.Group>
//                     </Col>
//                     <Col md="2">
//                       <Form.Group>
//                         <Form.Label>Rate</Form.Label>
//                         <Form.Control
//                           type="number"
//                           value={item.rate}
//                           onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
//                         />
//                       </Form.Group>
//                     </Col>
//                     <Col md="2">
//                       <Form.Group>
//                         <Form.Label>Amount</Form.Label>
//                         <Form.Control type="number" value={item.amount || 0} readOnly />
//                       </Form.Group>
//                     </Col>
//                   </Row>
//                 </div>
//               ))}
//             </Card.Body>
//           </Card>

//           <Card className="mb-4">
//             <Card.Header>
//               <h5>Terms & Conditions</h5>
//             </Card.Header>
//             <Card.Body>
//               <Row>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Delivery Schedule</Form.Label>
//                     <CKEditor
//                       editor={ClassicEditor}
//                       data={formData.termsAndConditions.deliverySchedule.deliveryNotes}
//                       onChange={(event, editor) => {
//                         const data = editor.getData();
//                         setFormData((prev) => ({
//                           ...prev,
//                           termsAndConditions: {
//                             ...prev.termsAndConditions,
//                             deliverySchedule: {
//                               ...prev.termsAndConditions.deliverySchedule,
//                               deliveryNotes: data,
//                             },
//                           },
//                         }));
//                       }}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Liquidated Damages</Form.Label>
//                     <CKEditor
//                       editor={ClassicEditor}
//                       data={formData.termsAndConditions.liquidatedDamages.description}
//                       onChange={(event, editor) => {
//                         const data = editor.getData();
//                         setFormData((prev) => ({
//                           ...prev,
//                           termsAndConditions: {
//                             ...prev.termsAndConditions,
//                             liquidatedDamages: {
//                               ...prev.termsAndConditions.liquidatedDamages,
//                               description: data,
//                             },
//                           },
//                         }));
//                       }}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//               <Row>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Defect Liability Period</Form.Label>
//                     <CKEditor
//                       editor={ClassicEditor}
//                       data={formData.termsAndConditions.defectLiabilityPeriod.duration}
//                       onChange={(event, editor) => {
//                         const data = editor.getData();
//                         setFormData((prev) => ({
//                           ...prev,
//                           termsAndConditions: {
//                             ...prev.termsAndConditions,
//                             defectLiabilityPeriod: {
//                               ...prev.termsAndConditions.defectLiabilityPeriod,
//                               duration: data,
//                             },
//                           },
//                         }));
//                       }}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Installation Scope</Form.Label>
//                     <CKEditor
//                       editor={ClassicEditor}
//                       data={
//                         formData.termsAndConditions.installationAndCommissioning
//                           .installationScope
//                       }
//                       onChange={(event, editor) => {
//                         const data = editor.getData();
//                         setFormData((prev) => ({
//                           ...prev,
//                           termsAndConditions: {
//                             ...prev.termsAndConditions,
//                             installationAndCommissioning: {
//                               ...prev.termsAndConditions.installationAndCommissioning,
//                               installationScope: data,
//                             },
//                           },
//                         }));
//                       }}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           <Card className="mb-4">
//             <Card.Header>
//               <h5>Financial Details</h5>
//             </Card.Header>
//             <Card.Body>
//               <Row>
//                 <Col md={3}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Total Amount</Form.Label>
//                     <Form.Control
//                       name="totalAmount"
//                       value={formData.totalAmount}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Advance Amount</Form.Label>
//                     <Form.Control
//                       name="advancePaymentAmount"
//                       value={formData.advancePaymentAmount}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Balance Amount</Form.Label>
//                     <Form.Control
//                       name="balancePaymentAmount"
//                       value={formData.balancePaymentAmount}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={3}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>GST (%)</Form.Label>
//                     <Form.Control
//                       name="gstPercentage"
//                       value={formData.gstPercentage}
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           <div className="d-flex gap-2 mt-3">
//   {isSaved ? (
//     <Button
//       variant="success"
//       onClick={() => setShowPreview(true)}
//       className="d-flex align-items-center"
//     >
//       <FaDownload className="me-2" /> Download PO
//     </Button>
//   ) : (
//     <Button variant="primary" type="submit" disabled={isSubmitting}>
//       {isSubmitting ? (
//         <>
//           <Spinner as="span" animation="border" size="sm" />
//           <span className="ms-2">Saving...</span>
//         </>
//       ) : (
//         "Save Purchase Order"
//       )}
//     </Button>
//   )}
// </div>
//         </Form>

        
//       )}
//       <POPreviewModal
//   show={showPreview}
//   onHide={() => setShowPreview(false)}
//   poData={savedPOData || formData} // prefer saved, fallback to form
// />
//     </Container>
//   );
// }


// src/pages/PoForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import POPreviewModal from "../components/POPreviewModal";

import { FaArrowLeft, FaDownload } from "react-icons/fa";
import { po as poData } from "../data/mockdata";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Helper: Recalculate item amounts
const recalculateItemAmount = (quantity, rate) => {
  return ((parseFloat(quantity) || 0) * (parseFloat(rate) || 0)).toString();
};

const materialOptions = [
  "Select Material",
  "Ply",
  "Screws",
  "Aluminium Foils",
  "Laminates",
  "Service",
];

const initialFormState = {
  // ===== PO HEADER =====
  poId: "",
  poNumber: "",
  poDate: "",
  projectName: "",
  department: "",
  leadId: "",
  quotationId: "",
  quotationRound: "",
  leadType: "",
  branch: "", // Add branch field to initial state

  // ===== CLIENT DETAILS =====
  clientName: "",
  contactPerson: "",
  contactPersonMobile: "",
  contactPersonEmail: "",
  companyName: "",
  siteAddress: "",
  billingAddress: "",
  gstNumber: "",
  panNumber: "",
  customerId: "",

  // ===== TIMELINE =====
  expectedDeliveryDate: "",
  actualDeliveryDate: "",
  completionDate: "",

  // ===== FINANCIALS =====
  quotedAmount: "",
  totalAmount: "",
  advancePaymentPercentage: "",
  advancePaymentAmount: "",
  balancePaymentPercentage: "",
  balancePaymentAmount: "",
  advancePaymentReceived: false,
  advancePaymentReceivedDate: "",
  advancePaymentMode: "",
  advanceTransactionRef: "",
  balancePaymentReceived: false,
  balancePaymentDate: "",
  balancePaymentMode: "",
  gstApplicable: true,
  gstPercentage: 18,
  gstAmount: "",
  tdsApplicable: false,
  tdsAmount: "",
  totalInvoiceAmount: "",
  currency: "INR",

  // ===== ITEMS =====
  items: [
    {
      id: `item - ${Date.now()} -1`,
      itemId: "",
      material: materialOptions[0],
      description: "",
      unit: "",
      quantity: "",
      rate: "",
      amount: "",
      specifications: {
        dimensions: "",
        material: "",
        finish: "",
        features: "",
        model: "",
        adjustments: "",
        loadCapacity: "",
        warranty: "",
        configuration: "",
        upholstery: "",
        deliveryScope: "",
      },
      deliveryStatus: "pending",
    },
  ],

  // ===== TERMS & CONDITIONS =====
  termsAndConditions: {
    paymentTerms: {
      description: "",
      advancePercentage: "",
      balancePercentage: "",
      paymentDueDate: "",
      balanceDueDate: "",
      paymentMethods: "",
      bankDetails: {
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
      },
      delayPenalty: "",
    },
    deliverySchedule: {
      expectedDeliveryDate: "",
      deliveryLocation: "",
      deliveryTimeSlot: "",
      deliveryTerms: "",
      freightCharges: "",
      packingCharges: "",
      deliveryNotes: "",
      advanceNotification: "",
      receivingInstructions: "",
    },
    liquidatedDamages: {
      applicable: false,
      description: "",
      ratePerWeek: "",
      calculationBasis: "",
      maxCapPercentage: "",
      maxCapAmount: "",
      example: "",
      applicableFrom: "",
      claimProcess: "",
      deductionMethod: "",
      exemptions: "",
    },
    defectLiabilityPeriod: {
      duration: "",
      startDate: "",
      endDate: "",
      description: "",
      coverageScope: "",
      claimProcess: {
        notificationPeriod: "",
        notificationMethod: "",
        inspectionPeriod: "",
        approvalPeriod: "",
        totalResolutionTime: "",
      },
      remedyType: "",
      exclusions: "",
      maintenanceObligation: "",
      warrantyItems: {
        chairs: { structural: "", upholstery: "", mechanisms: "" },
        desks: { structural: "", finish: "", joints: "" },
        lounge: { frame: "", upholstery: "", springs: "" },
      },
    },
    warranty: {
      period: "",
      coverageScope: "",
      limitations: "",
    },
    qualityAndInspection: {
      factoryInspection: "",
      onSiteInspection: "",
      inspectionAuthority: "",
      acceptanceCriteria: "",
      rejectionRights: "",
      defectiveItemReplacement: "",
    },
    installationAndCommissioning: {
      installationIncluded: false,
      installationScope: "",
      installationSchedule: "",
      installationDuration: "",
      clientResponsibilities: "",
      postInstallationSupport: "",
    },
    generalTerms: {
      orderAcceptance: "",
      modifications: "",
      cancellation: "",
      forceMajeure: "",
      disputes: "",
      jurisdiction: "",
      governingLaw: "",
      paymentOnCompletion: "",
      escalationClause: "",
    },
  },

  // ===== SPECIFICATIONS =====
  specifications: {
    general: "",
    deskFinish: "",
    chairSpecs: "",
    loungeSpecs: "",
    colorScheme: "",
    customRequirements: "",
    drawingsReference: "",
  },

  // ===== SITE CONDITIONS =====
  siteConditions: {
    siteReadiness: "",
    accessConditions: "",
    installationSpace: "",
    specialRequirements: "",
    clientPreparation: "",
    safetyRequirements: "",
  },

  // ===== SALESPERSON & APPROVAL =====
  salespersonId: "",
  salespersonName: "",
  salespersonEmail: "",
  salespersonMobile: "",
  approvalStatus: "",
  approvedBy: "",
  approvedDate: "",
  approvalRemarks: "",

  // ===== STATUS & METADATA =====
  poStatus: "",
  priority: "",
  notes: "",
};

// Function to fetch next PO number from API
const fetchNextPoNumber = async () => {
  try {
    const response = await axios.get("https://nlfs.in/erp/index.php/Erp/get_next_po_no");
    if (response.data.status && response.data.next_quote_no) {
      return response.data.next_quote_no;
    }
    throw new Error("Failed to get next PO number");
  } catch (error) {
    console.error("Error fetching next PO number:", error);
    const year = new Date().getFullYear().toString().substring(2);
    const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `NLF - ${year} -PO - ${randomId} `;
  }
};

// Function to fetch branch list from API
const fetchBranchList = async () => {
  try {
    const response = await axios.get("https://nlfs.in/erp/index.php/Erp/branch_list");
    if (response.data.status === "true" && response.data.success === "1" && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    throw new Error("Failed to fetch branch list");
  } catch (error) {
    console.error("Error fetching branch list:", error);
    return [];
  }
};

// Function to format quote number in required format
const formatQuoteNumber = (quoteNo, quoteId, revise) => {
  if (quoteNo && quoteNo.includes("NLF-")) {
    return quoteNo;
  }

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const yearSuffix = currentYear.toString().substring(2);
  const nextYearSuffix = nextYear.toString().substring(2);

  if (quoteId && !isNaN(quoteId)) {
    let formattedQuoteId = `NLF - ${yearSuffix} -${nextYearSuffix} -Q - ${quoteId} `;
    if (revise && revise !== "" && revise !== null) {
      formattedQuoteId = `${formattedQuoteId} -R${revise} `;
    }
    return formattedQuoteId;
  }

  if (quoteId && quoteId.includes("NLF-")) {
    return quoteId;
  }

  return quoteNo || quoteId || "N/A";
};

// Function to fetch next QUOTE number from API
const fetchNextQuoteNumber = async () => {
  try {
    console.log("FETCHING next quote number from API...");
    const response = await fetch("https://nlfs.in/erp/index.php/Erp/get_next_quote_no");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} `);
    }

    const result = await response.json();
    console.log("--- API RESPONSE START ---");
    console.log("Full Quote API Response Object:", result);
    console.log("--- API RESPONSE END ---");

    if (result.status && result.success === "1") {
      return result.next_quote_no;
    } else {
      throw new Error(result.message || "Failed to fetch next quote number");
    }
  } catch (error) {
    console.error("CATCH BLOCK: Error in fetchNextQuoteNumber:", error);
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearSuffix = currentYear.toString().substring(2);
    const nextYearSuffix = nextYear.toString().substring(2);
    const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const fallbackId = `NLF - ${yearSuffix} -${nextYearSuffix} -Q - ${randomId} `;
    console.log("FALLBACK: Using locally generated ID:", fallbackId);
    return fallbackId;
  }
};

// Function to fetch quotation details by ID
const fetchQuotationDetails = async (quotationId) => {
  try {
    const response = await axios.post(
      "https://nlfs.in/erp/index.php/Nlf_Erp/get_quotation_by_id",
      {
        quote_id: String(quotationId),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status && response.data.data) {
      return response.data.data;
    }
    throw new Error("Failed to fetch quotation details");
  } catch (error) {
    console.error("Error fetching quotation details:", error);
    throw error;
  }
};

export default function PoForm() {
  const { poId, quotationId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedPOData, setSavedPOData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [branchList, setBranchList] = useState([]); // Add state for branch list

  // Fetch branch list when component mounts
  useEffect(() => {
    const getBranchList = async () => {
      try {
        const branches = await fetchBranchList();
        setBranchList(branches);
      } catch (error) {
        console.error("Error fetching branch list:", error);
      }
    };

    getBranchList();
  }, []);

  // Fetch next PO number when component mounts
  useEffect(() => {
    const fetchPoNumber = async () => {
      try {
        setIsLoading(true);
        const nextPoNumber = await fetchNextPoNumber();
        setFormData((prev) => ({
          ...prev,
          poNumber: nextPoNumber,
          poDate: new Date().toISOString().split("T")[0],
        }));
      } catch (error) {
        setError("Failed to fetch PO number");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoNumber();
  }, []);

  // Fetch next quote number when component mounts and no quotationId is provided
  useEffect(() => {
    console.log(`--- USEEFFECT CHECK--- URL quotationId is: "${quotationId}"`);

    if (quotationId) {
      console.log("ACTION: Skipping fetchNextQuoteNumber because quotationId exists in URL.");
      return;
    }

    const fetchQuoteNumber = async () => {
      console.log("ACTION: No quotationId in URL. Proceeding to fetch a new one...");
      try {
        setIsLoading(true);
        const nextQuoteNo = await fetchNextQuoteNumber();
        console.log(`--- STATE UPDATE--- Received quote number: "${nextQuoteNo}"`);

        const formattedQuoteId = formatQuoteNumber(null, nextQuoteNo, null);
        console.log(`--- STATE UPDATE--- Formatted quote ID: "${formattedQuoteId}"`);

        setFormData((prev) => {
          console.log(`--- STATE UPDATE--- Setting new quotationId in state.`);
          return { ...prev, quotationId: formattedQuoteId };
        });
      } catch (error) {
        console.error("ACTION: Failed to fetch quote number.", error);
        setError("Failed to fetch quote number");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuoteNumber();
  }, [quotationId]);

  // Fetch quotation details if quotationId is provided
  useEffect(() => {
    if (!quotationId) return;

    const fetchQuotation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const quotationData = await fetchQuotationDetails(quotationId);

        setFormData((prev) => ({
          ...prev,
          quotationId: quotationData.quote_no,
          projectName: quotationData.project || "",
          clientName: quotationData.name || "",
          branch: quotationData.branch || "", // Set branch from quotation data
          items: quotationData.items.map((item, idx) => ({
            id: `item - ${Date.now()} -${idx} `,
            itemId: "",
            material: item.product || materialOptions[0],
            description: item.desc || "",
            unit: item.unit || "",
            quantity: String(item.qty || ""),
            rate: String(item.rate || ""),
            amount: String(item.amt || ""),
            specifications: {
              dimensions: "",
              material: "",
              finish: "",
              features: "",
              model: "",
              adjustments: "",
              loadCapacity: "",
              warranty: "",
              configuration: "",
              upholstery: "",
              deliveryScope: "",
            },
            deliveryStatus: "pending",
          })),
          quotedAmount: quotationData.total || "",
          totalAmount: quotationData.total || "",
          termsAndConditions: {
            ...prev.termsAndConditions,
          },
        }));
      } catch (error) {
        setError("Failed to fetch quotation details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotation();
  }, [quotationId]);

  // Load PO data if poId is provided (for editing existing PO)
  useEffect(() => {
    if (!poId) return;

    const poRecord = poData.find((p) => p.poId === poId);
    if (!poRecord) {
      console.warn("PO not found:", poId);
      return;
    }

    const mappedItems = poRecord.items.map((item, idx) => ({
      id: `item - ${Date.now()} -${idx} `,
      itemId: "",
      material: item.material || materialOptions[0],
      description: item.description || "",
      unit: item.unit || "",
      quantity: String(item.quantity || ""),
      rate: String(item.rate || ""),
      amount: String(item.total || ""),
      specifications: {
        dimensions: item.specifications?.dimensions || "",
        material: item.specifications?.material || "",
        finish: item.specifications?.finish || "",
        features: item.specifications?.features || "",
        model: item.specifications?.model || "",
        adjustments: item.specifications?.adjustments || "",
        loadCapacity: item.specifications?.loadCapacity || "",
        warranty: item.specifications?.warranty || "",
        configuration: item.specifications?.configuration || "",
        upholstery: item.specifications?.upholstery || "",
        deliveryScope: item.specifications?.deliveryScope || "",
      },
      deliveryStatus: item.deliveryStatus || "pending",
    }));

    setFormData({
      poId: poRecord.poId || "",
      poNumber: poRecord.poNumber || "",
      poDate: poRecord.poDate || "",
      projectName: poRecord.projectName || "",
      department: poRecord.department || "",
      leadId: poRecord.leadId || "",
      quotationId: poRecord.quotationId || "",
      quotationRound: poRecord.quotationRound || "",
      leadType: poRecord.leadType || "",
      branch: poRecord.branch || "", // Set branch from PO record
      clientName: poRecord.clientName || "",
      contactPerson: poRecord.contactPerson || "",
      contactPersonMobile: poRecord.contactPersonMobile || "",
      contactPersonEmail: poRecord.contactPersonEmail || "",
      companyName: poRecord.companyName || "",
      siteAddress: poRecord.siteAddress || "",
      billingAddress: poRecord.billingAddress || "",
      gstNumber: poRecord.gstNumber || "",
      panNumber: poRecord.panNumber || "",
      customerId: poRecord.customerId || "",
      expectedDeliveryDate: poRecord.expectedDeliveryDate || "",
      actualDeliveryDate: poRecord.actualDeliveryDate || "",
      completionDate: poRecord.completionDate || "",
      quotedAmount: String(poRecord.quotedAmount || ""),
      totalAmount: String(poRecord.totalAmount || ""),
      advancePaymentPercentage: String(poRecord.advancePaymentPercentage || ""),
      advancePaymentAmount: String(poRecord.advancePaymentAmount || ""),
      balancePaymentPercentage: String(poRecord.balancePaymentPercentage || ""),
      balancePaymentAmount: String(poRecord.balancePaymentAmount || ""),
      advancePaymentReceived: poRecord.advancePaymentReceived || false,
      advancePaymentReceivedDate: poRecord.advancePaymentReceivedDate || "",
      advancePaymentMode: poRecord.advancePaymentMode || "",
      advanceTransactionRef: poRecord.advanceTransactionRef || "",
      balancePaymentReceived: poRecord.balancePaymentReceived || false,
      balancePaymentDate: poRecord.balancePaymentDate || "",
      balancePaymentMode: poRecord.balancePaymentMode || "",
      gstApplicable: poRecord.gstApplicable || false,
      gstPercentage: poRecord.gstPercentage || 18,
      gstAmount: String(poRecord.gstAmount || ""),
      tdsApplicable: poRecord.tdsApplicable || false,
      tdsAmount: String(poRecord.tdsAmount || ""),
      totalInvoiceAmount: String(poRecord.totalInvoiceAmount || ""),
      currency: poRecord.currency || "INR",
      items: mappedItems,
      termsAndConditions: {
        ...initialFormState.termsAndConditions,
        ...poRecord.termsAndConditions,
        liquidatedDamages: {
          ...initialFormState.termsAndConditions.liquidatedDamages,
          ...poRecord.termsAndConditions?.liquidatedDamages,
          exemptions: Array.isArray(
            poRecord.termsAndConditions?.liquidatedDamages?.exemptions
          )
            ? poRecord.termsAndConditions.liquidatedDamages.exemptions.join("; ")
            : "",
        },
        defectLiabilityPeriod: {
          ...initialFormState.termsAndConditions.defectLiabilityPeriod,
          ...poRecord.termsAndConditions?.defectLiabilityPeriod,
          coverageScope: Array.isArray(
            poRecord.termsAndConditions?.defectLiabilityPeriod?.coverageScope
          )
            ? poRecord.termsAndConditions.defectLiabilityPeriod.coverageScope.join("; ")
            : "",
          exclusions: Array.isArray(
            poRecord.termsAndConditions?.defectLiabilityPeriod?.exclusions
          )
            ? poRecord.termsAndConditions.defectLiabilityPeriod.exclusions.join("; ")
            : "",
        },
      },
      specifications: {
        ...initialFormState.specifications,
        ...poRecord.specifications,
      },
      siteConditions: {
        ...initialFormState.siteConditions,
        ...poRecord.siteConditions,
      },
      salespersonId: poRecord.salespersonId || "",
      salespersonName: poRecord.salespersonName || "",
      salespersonEmail: poRecord.salespersonEmail || "",
      salespersonMobile: poRecord.salespersonMobile || "",
      approvalStatus: poRecord.approvalStatus || "",
      approvedBy: poRecord.approvedBy || "",
      approvedDate: poRecord.approvedDate || "",
      approvalRemarks: poRecord.approvalRemarks || "",
      poStatus: poRecord.poStatus || "",
      priority: poRecord.priority || "",
      notes: poRecord.notes || "",
    });
  }, [poId]);

  // === Handlers ===
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      if (field === "quantity" || field === "rate") {
        newItems[index].amount = recalculateItemAmount(
          newItems[index].quantity,
          newItems[index].rate
        );
      }

      return { ...prev, items: newItems };
    });
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item - ${Date.now()} -${formData.items.length} `,
      itemId: "",
      material: materialOptions[0],
      description: "",
      unit: "",
      quantity: "",
      rate: "",
      amount: "",
      specifications: {
        dimensions: "",
        material: "",
        finish: "",
        features: "",
        model: "",
        adjustments: "",
        loadCapacity: "",
        warranty: "",
        configuration: "",
        upholstery: "",
        deliveryScope: "",
      },
      deliveryStatus: "pending",
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);
  setSuccess(null);

  try {
    const poPayload = {
      po_no: formData.poNumber,
      quote_id: formData.quotationId,
      date: formData.poDate,
      company: formData.companyName,
      site_address: formData.siteAddress,
      billing_address: formData.billingAddress,
      gst_number: formData.gstNumber,
      pan_number: formData.panNumber,
      contact_person: formData.contactPerson,
      branch: formData.branch, // Include branch in payload
      delivery_schedule: formData.termsAndConditions.deliverySchedule.deliveryNotes,
      liquidated_damages: formData.termsAndConditions.liquidatedDamages.description,
      defect_liability_period: formData.termsAndConditions.defectLiabilityPeriod.duration,
      installation_scope:
        formData.termsAndConditions.installationAndCommissioning.installationScope,
      total_amt: formData.totalAmount,
      total_advance: formData.advancePaymentAmount,
      total_bal: formData.balancePaymentAmount,
      gst: `${formData.gstPercentage}% `,
      items: formData.items.map((item) => ({
        material: item.material,
        description: item.description,
        unit: item.unit,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      })),
    };

    const response = await axios.post(
      "https://nlfs.in/erp/index.php/Api/add_po",
      poPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "true" && response.data.success === "1") {
      setSuccess("Purchase Order created successfully! Redirecting to quotations...");
      
      // Redirect back to ClientLead after a short delay
      setTimeout(() => {
        navigate('/client-lead');
      }, 2000); // 2 second delay to show success message
    } else {
      throw new Error(response.data.message || "Failed to create Purchase Order");
    }
  } catch (error) {
    console.error("Error creating PO:", error);
    setError(error.message || "Failed to create Purchase Order");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <Container fluid className="my-4">
      <Button
        className="mb-3"
        style={{ backgroundColor: "rgb(237, 49, 49)", border: "none" }}
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft /> Back
      </Button>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Card className="mb-4">
            <Card.Header>
              <h5>PO Details</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>PO Number</Form.Label>
                    <Form.Control
                      name="poNumber"
                      value={formData.poNumber}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="poDate"
                      value={formData.poDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Project Name</Form.Label>
                    <Form.Control
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quotation No</Form.Label>
                    <Form.Control
                      name="quotationId"
                      value={formData.quotationId}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Control
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Branch</Form.Label>
                    <Form.Control
                      as="select"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Branch</option>
                      {branchList.map((branch) => (
                        <option key={branch.id} value={branch.branch_name}>
                          {branch.branch_name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5>Client Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Client Name</Form.Label>
                    <Form.Control
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Company</Form.Label>
                    <Form.Control
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Site Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="siteAddress"
                      value={formData.siteAddress}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Billing Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>GST Number</Form.Label>
                    <Form.Control
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>PAN Number</Form.Label>
                    <Form.Control
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contact Person</Form.Label>
                    <Form.Control
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <Card.Title as="h5">Items</Card.Title>
            </Card.Header>
            <Card.Body>
              {formData.items.map((item, idx) => (
                <div key={item.id} className="border rounded p-3 mb-3">
                  <Row className="align-items-end">
                    <Col md="2">
                      <Form.Group>
                        <Form.Label>Material</Form.Label>
                        <Form.Control
                          as="select"
                          value={item.material}
                          onChange={(e) => handleItemChange(idx, "material", e.target.value)}
                        >
                          {materialOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md="3">
                      <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="1">
                      <Form.Group>
                        <Form.Label>Unit</Form.Label>
                        <Form.Control
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="1">
                      <Form.Group>
                        <Form.Label>Qty</Form.Label>
                        <Form.Control
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="2">
                      <Form.Group>
                        <Form.Label>Rate</Form.Label>
                        <Form.Control
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="2">
                      <Form.Group>
                        <Form.Label>Amount</Form.Label>
                        <Form.Control type="number" value={item.amount || 0} readOnly />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              ))}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5>Terms & Conditions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Delivery Schedule</Form.Label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.termsAndConditions.deliverySchedule.deliveryNotes}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData((prev) => ({
                          ...prev,
                          termsAndConditions: {
                            ...prev.termsAndConditions,
                            deliverySchedule: {
                              ...prev.termsAndConditions.deliverySchedule,
                              deliveryNotes: data,
                            },
                          },
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Liquidated Damages</Form.Label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.termsAndConditions.liquidatedDamages.description}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData((prev) => ({
                          ...prev,
                          termsAndConditions: {
                            ...prev.termsAndConditions,
                            liquidatedDamages: {
                              ...prev.termsAndConditions.liquidatedDamages,
                              description: data,
                            },
                          },
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Defect Liability Period</Form.Label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formData.termsAndConditions.defectLiabilityPeriod.duration}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData((prev) => ({
                          ...prev,
                          termsAndConditions: {
                            ...prev.termsAndConditions,
                            defectLiabilityPeriod: {
                              ...prev.termsAndConditions.defectLiabilityPeriod,
                              duration: data,
                            },
                          },
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Installation Scope</Form.Label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={
                        formData.termsAndConditions.installationAndCommissioning
                          .installationScope
                      }
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setFormData((prev) => ({
                          ...prev,
                          termsAndConditions: {
                            ...prev.termsAndConditions,
                            installationAndCommissioning: {
                              ...prev.termsAndConditions.installationAndCommissioning,
                              installationScope: data,
                            },
                          },
                        }));
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5>Financial Details</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Total Amount</Form.Label>
                    <Form.Control
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Advance Amount</Form.Label>
                    <Form.Control
                      name="advancePaymentAmount"
                      value={formData.advancePaymentAmount}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Balance Amount</Form.Label>
                    <Form.Control
                      name="balancePaymentAmount"
                      value={formData.balancePaymentAmount}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>GST (%)</Form.Label>
                    <Form.Control
                      name="gstPercentage"
                      value={formData.gstPercentage}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex gap-2 mt-3">
  {isSaved ? (
    <Button
      variant="success"
      onClick={() => setShowPreview(true)}
      className="d-flex align-items-center"
    >
      <FaDownload className="me-2" /> Download PO
    </Button>
  ) : (
    <Button variant="primary" type="submit" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <Spinner as="span" animation="border" size="sm" />
          <span className="ms-2">Saving...</span>
        </>
      ) : (
        "Save Purchase Order"
      )}
    </Button>
  )}
</div>
        </Form>

        
      )}
      <POPreviewModal
  show={showPreview}
  onHide={() => setShowPreview(false)}
  poData={savedPOData || formData} // prefer saved, fallback to form
/>
    </Container>
  );
}