// import React, { useState, useEffect, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Spinner,
//   Alert,
//   Modal,
//   InputGroup,
// } from "react-bootstrap";
// import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
// import { po as poData } from "../data/mockdata";
// import axios from "axios";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// // Helper: Ensure 2 decimal places (returns string)
// const formatTwoDecimal = (val) => {
//   if (val === "" || val === null || val === undefined) return "";
//   return parseFloat(val).toFixed(2);
// };

// // Helper: Recalculate item amounts (updated to 2 decimals)
// const recalculateItemAmount = (quantity, rate) => {
//   return (
//     (parseFloat(quantity) || 0) * (parseFloat(rate) || 0)
//   ).toFixed(2);
// };

// const materialOptions = [
//   "Select Material",
//   "Ply",
//   "Screws",
//   "Aluminium Foils",
//   "Laminates",
//   "Service",
// ];

// const sanitizeDecimalInput = (value) => {
//   if (value === "") return "";

//   // allow only digits + one dot
//   let sanitized = value.replace(/[^0-9.]/g, "");

//   const parts = sanitized.split(".");
//   if (parts.length > 2) {
//     sanitized = parts[0] + "." + parts.slice(1).join("");
//   }

//   if (parts[1]?.length > 2) {
//     sanitized = parts[0] + "." + parts[1].slice(0, 2);
//   }

//   return sanitized;
// };

// const initialFormState = {
//   // ===== PO HEADER =====
//   poId: "",
//   poNumber: "",
//   poDate: "",
//   project_name: "", // Changed from projectName
//   department: "",
//   leadId: "",
//   quotationId: "",
//   quotationRound: "",
//   leadType: "",
//   branch: "",
//   vendor: "", // Changed from vendorId
//   workOrderNumber: "", // Added field to store work order number
//   // ===== CLIENT DETAILS =====
//   client_name: "", // Changed from clientName
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
//   terms: "",
//   // ===== ITEMS =====
//   items: [
//     {
//       id: `item-${Date.now()}-1`,
//       itemId: "",
//       material: materialOptions[0],
//       sub_product: "",
//       description: "",
//       unit: "",
//       quantity: "",
//       rate: "",
//       amount: "",
//       inst_unit: "",
//       inst_qty: "",
//       inst_rate: "",
//       inst_amt: "",
//       total: "",
//       // New fields for brand/product/sub-product functionality
//       brand: "",
//       brandId: "",
//       product: "",
//       productId: "",
//       subProduct: "",
//       subProductId: "",
//       // extra internal fields
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
//   // ===== UI STATE =====
//   poType: "billing", // Moved from separate state to formData
// };

// // ===== API HELPERS =====
// const fetchNextPoNumber = async () => {
//   try {
//     const response = await axios.get(
//       "https://nlfs.in/erp/index.php/Erp/get_next_po_no"
//     );
//     if (response.data.status && response.data.next_quote_no) {
//       return response.data.next_quote_no;
//     }
//     throw new Error("Failed to get next PO number");
//   } catch (error) {
//     console.error("Error fetching next PO number:", error);
//     const year = new Date().getFullYear().toString().substring(2);
//     const randomId = Math.floor(Math.random() * 1000)
//       .toString()
//       .padStart(3, "0");
//     return `NLF-${year}-PO-${randomId}`;
//   }
// };

// const fetchBranchList = async () => {
//   try {
//     const response = await axios.get(
//       "https://nlfs.in/erp/index.php/Erp/branch_list"
//     );
//     if (
//       response.data.status === true ||
//       response.data.status === "true"
//     ) {
//       return response.data.data;
//     }
//     throw new Error("Failed to fetch branch list");
//   } catch (error) {
//     console.error("Error fetching branch list:", error);
//     return [];
//   }
// };

// const fetchDepartmentList = async () => {
//   try {
//     const response = await axios.get(
//       "https://nlfs.in/erp/index.php/Erp/department_list"
//     );
//     if (
//       response.data.status === true ||
//       response.data.status === "true"
//     ) {
//       return response.data.data;
//     }
//     throw new Error("Failed to fetch department list");
//   } catch (error) {
//     console.error("Error fetching department list:", error);
//     return [];
//   }
// };

// // NEW HELPER: Fetch Vendor List
// const fetchVendorList = async () => {
//   try {
//     const response = await axios.get(
//       "https://nlfs.in/erp/index.php/Api/list_mst_vender"
//     );
//     if (
//       response.data.status === true ||
//       response.data.status === "true"
//     ) {
//       return response.data.data;
//     }
//     throw new Error("Failed to fetch vendor list");
//   } catch (error) {
//     console.error("Error fetching vendor list:", error);
//     return [];
//   }
// };

// const formatQuoteNumber = (quoteNo, quoteId, revise) => {
//   if (quoteNo && quoteNo.includes("NLF-")) {
//     return quoteNo;
//   }
//   const currentYear = new Date().getFullYear();
//   const nextYear = currentYear + 1;
//   const yearSuffix = currentYear.toString().substring(2);
//   const nextYearSuffix = nextYear.toString().substring(2);
//   if (quoteId && !isNaN(quoteId)) {
//     let formattedQuoteId = `NLF-${yearSuffix}-${nextYearSuffix}-Q-${quoteId}`;
//     if (revise && revise !== "" && revise !== null) {
//       formattedQuoteId = `${formattedQuoteId}-R${revise}`;
//     }
//     return formattedQuoteId;
//   }
//   if (quoteId && quoteId.includes("NLF-")) {
//     return quoteId;
//   }
//   return quoteNo || quoteId || "N/A";
// };

// const fetchNextQuoteNumber = async () => {
//   try {
//     const response = await fetch(
//       "https://nlfs.in/erp/index.php/Erp/get_next_quote_no"
//     );
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const result = await response.json();
//     if (result.status && result.success === "1") {
//       return result.next_quote_no;
//     } else {
//       throw new Error(
//         result.message || "Failed to fetch next quote number"
//       );
//     }
//   } catch (error) {
//     console.error("CATCH BLOCK: Error in fetchNextQuoteNumber:", error);
//     const currentYear = new Date().getFullYear();
//     const nextYear = currentYear + 1;
//     const yearSuffix = currentYear.toString().substring(2);
//     const nextYearSuffix = nextYear.toString().substring(2);
//     const randomId = Math.floor(Math.random() * 1000)
//       .toString()
//       .padStart(3, "0");
//     const fallbackId = `NLF-${yearSuffix}-${nextYearSuffix}-Q-${randomId}`;
//     return fallbackId;
//   }
// };

// // UPDATED: Use get_work_order_by_id API
// const fetchQuotationDetails = async (quotationId, workOrderId) => {
//   try {
//     console.log("DEBUG: Sending work_id:", workOrderId);
    
//     const response = await axios.post(
//       "https://nlfs.in/erp/index.php/Api/get_work_order_by_id",
//       {
//         work_id: String(workOrderId),
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
    
//     if (response.data.status === "true" && response.data.success === "1" && response.data.data) {
//       return response.data.data;
//     } else {
//       throw new Error(response.data.message || "Failed to fetch work order details");
//     }
//   } catch (error) {
//     console.error("Error fetching work order details:", error);
//     throw error;
//   }
// };

// export default function PoForm() {
//   const { poId, quotationId: urlQuotationId, workOrderId } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState(initialFormState);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);

//   const [showSuccessModal, setShowSuccessModal] = useState(false);

//   // NEW STATE FOR ADD VENDOR MODAL
//   const [showAddVendorModal, setShowAddVendorModal] = useState(false);
//   const [newVendorName, setNewVendorName] = useState("");
//   const [isAddingVendor, setIsAddingVendor] = useState(false);

//   // NEW STATE FOR IMAGE UPLOAD
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);

//   const [branchList, setBranchList] = useState([]);
//   const [departmentList, setDepartmentList] = useState([]);
//   const [subProductList, setSubProductList] = useState([]);
//   const [vendorList, setVendorList] = useState([]);

//   // NEW STATE FOR MASTER ITEMS LOGIC
//   const [masterItems, setMasterItems] = useState([]);
//   const [isLoadingMasterItems, setIsLoadingMasterItems] = useState(true);

//   const [quotationData, setQuotationData] = useState(null);

//   // ===== MASTER DATA LOGIC =====
//   useEffect(() => {
//     const fetchMasterItems = async () => {
//       try {
//         setIsLoadingMasterItems(true);
//         const res = await fetch(
//           "https://nlfs.in/erp/index.php/Api/list_mst_sub_product",
//           { method: "GET" }
//         );
//         const data = await res.json();
//         const statusTrue = data.status === "true" || data.status === true;
//         const successTrue = data.success === "1" || data.success === 1;
//         if (statusTrue && successTrue && data.data) {
//           setMasterItems(data.data);
//           setSubProductList(data.data);
//         } else {
//           console.error("Failed to load master items:", data);
//           setError("Failed to load product master list.");
//         }
//       } catch (err) {
//         console.error("Error fetching master items:", err);
//         setError("Error fetching product master list.");
//       } finally {
//         setIsLoadingMasterItems(false);
//       }
//     };
//     fetchMasterItems();
//   }, []);

//   // Derived helpers for dropdowns
//   const brandOptions = useMemo(() => {
//     const set = new Set();
//     masterItems.forEach((item) => {
//       if (item.brand) set.add(item.brand);
//     });
//     return Array.from(set);
//   }, [masterItems]);

//   const getProductOptions = (brandName) => {
//     const set = new Set();
//     masterItems.forEach((item) => {
//       if (
//         (!brandName || item.brand === brandName) &&
//         item.g3_category &&
//         item.g3_category.trim() !== ""
//       ) {
//         set.add(item.g3_category);
//       }
//     });
//     return Array.from(set);
//   };

//   useEffect(() => {
//     if (!formData.branch || branchList.length === 0) return;

//     const selectedBranch = branchList.find(
//       (b) => b.branch_name === formData.branch
//     );

//     if (!selectedBranch) return;

//     setFormData((prev) => ({
//       ...prev,
//       gstNumber: prev.gstNumber || selectedBranch.gst_no || "",
//       siteAddress: prev.siteAddress || selectedBranch.address || "",
//     }));
//   }, [formData.branch, branchList]);

//   const getSubProductOptions = (brandName, productName) => {
//     const filtered = masterItems.filter((item) => {
//       const matchesBrand = !brandName || item.brand === brandName;
//       const matchesProduct = !productName || item.g3_category === productName;
//       return matchesBrand && matchesProduct;
//     });

//     // Deduplicate by id
//     const seen = new Set();
//     const result = [];
//     filtered.forEach((item) => {
//       const key = String(item.id);
//       if (!seen.has(key)) {
//         seen.add(key);
//         result.push(item);
//       }
//     });

//     return result;
//   };

//   // ===== EXISTING API EFFECTS =====

//   // Fetch branch list
//   useEffect(() => {
//     const getBranchList = async () => {
//       try {
//         const branches = await fetchBranchList();
//         setBranchList(branches);
//       } catch (error) {
//         console.error("Error fetching branch list:", error);
//       }
//     };
//     getBranchList();
//   }, []);

//   // Fetch department list
//   useEffect(() => {
//     const getDepartmentList = async () => {
//       try {
//         const departments = await fetchDepartmentList();
//         setDepartmentList(departments);
//       } catch (error) {
//         console.error("Error fetching department list:", error);
//       }
//     };
//     getDepartmentList();
//   }, []);

//   // Fetch vendor list
//   useEffect(() => {
//     const getVendorList = async () => {
//       try {
//         const vendors = await fetchVendorList();
//         setVendorList(vendors);
//       } catch (error) {
//         console.error("Error fetching vendor list:", error);
//       }
//     };
//     getVendorList();
//   }, []);

//   // Fetch next PO number
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
//         console.error("ACTION: Failed to fetch PO number.", error);
//         setError("Failed to fetch PO number");
//         const currentYear = new Date().getFullYear();
//         const nextYear = currentYear + 1;
//         const yearSuffix = currentYear.toString().substring(2);
//         const nextYearSuffix = nextYear.toString().substring(2);
//         const randomId = Math.floor(Math.random() * 1000)
//           .toString()
//           .padStart(3, "0");
//         const fallbackId = `NLF-${yearSuffix}-${nextYearSuffix}-PO-${randomId}`;
//         setFormData((prev) => ({
//           ...prev,
//           poNumber: fallbackId,
//           poDate: new Date().toISOString().split("T")[0],
//         }));
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchPoNumber();
//   }, []);

//   // const poType = poData?.po_type || "billing";
// const poType = formData.poType;


//   // Fetch next quote number
//   useEffect(() => {
//     if (urlQuotationId) {
//       return;
//     }
//     const fetchQuoteNumber = async () => {
//       try {
//         setIsLoading(true);
//         const nextQuoteNo = await fetchNextQuoteNumber();
//         const formattedQuoteId = formatQuoteNumber(
//           null,
//           nextQuoteNo,
//           null
//         );
//         setFormData((prev) => ({
//           ...prev,
//           quotationId: formattedQuoteId,
//         }));
//       } catch (error) {
//         console.error("ACTION: Failed to fetch quote number.", error);
//         setError("Failed to fetch quote number");
//         const currentYear = new Date().getFullYear();
//         const nextYear = currentYear + 1;
//         const yearSuffix = currentYear.toString().substring(2);
//         const nextYearSuffix = nextYear.toString().substring(2);
//         const randomId = Math.floor(Math.random() * 1000)
//           .toString()
//           .padStart(3, "0");
//         const fallbackId = `NLF-${yearSuffix}-${nextYearSuffix}-Q-${randomId}`;
//         setFormData((prev) => ({
//           ...prev,
//           quotationId: fallbackId,
//         }));
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchQuoteNumber();
//   }, [urlQuotationId]);

//   // Fetch quotation details - UPDATED with masterItems dependency and new API
//   useEffect(() => {
//     if (!urlQuotationId || !workOrderId || masterItems.length === 0) return;

//     const fetchQuotation = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
        
//         console.log("DEBUG: Fetching work order with ID:", workOrderId);
        
//         const quotationData = await fetchQuotationDetails(urlQuotationId, workOrderId);
//         console.log("Received work order data:", quotationData);
        
//         setQuotationData(quotationData);

//         // Parse items from JSON string with error handling
//         let items = [];
//         try {
//           items = JSON.parse(quotationData.items || "[]");
//           console.log("Parsed items:", items);
//         } catch (e) {
//           console.error("Error parsing items JSON:", e);
//           setError("Error parsing work order items");
//           setIsLoading(false);
//           return;
//         }

//         setFormData((prev) => ({
//           ...prev,
//           quotationId: quotationData.quto_id || quotationData.wo_no || "",
//           workOrderNumber: quotationData.wo_no || "", // Save the work order number
//           project_name: quotationData.general_design || quotationData.project || "", // Changed from projectName
//           client_name: quotationData.client_preparation || quotationData.name || "", // Changed from clientName
//           branch: quotationData.branch_name || "",
//           terms: quotationData.terms_and_condition || "",
//           items: items.map((item, idx) => {
//             // Find the sub-product ID based on the name
//             const subProductMatch = masterItems.find(
//               (m) => 
//                 m.item_name === item.sub_product || 
//                 m.g4_sub_category === item.sub_product
//             );
            
//             return {
//               id: `item-${Date.now()}-${idx}`,
//               brand: item.brand || "",
//               brandId: item.brand || "",
//               product: item.item_name || "",
//               productId: item.item_name || "",
//               sub_product: item.sub_product || "",
//               subProduct: item.sub_product || "",
//               subProductId: subProductMatch ? String(subProductMatch.id) : "",
//               description: item.description || "",
//               unit: item.unit || "",
//               quantity: String(item.quantity || ""),
//               // FORMAT RATE AND AMOUNT TO 2 DECIMALS
//               rate: formatTwoDecimal(item.unit_price || ""),
//               amount: formatTwoDecimal(
//                 (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)
//               ),
//               inst_unit: item.unit || "",
//               inst_qty: item.quantity || "",
//               inst_rate: formatTwoDecimal(item.unit_price || ""),
//               inst_amt: formatTwoDecimal(
//                 (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)
//               ),
//               total: formatTwoDecimal(
//                 (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)
//               ),
//               deliveryStatus: "pending",
//             };
//           }),
//           quotedAmount: quotationData.total || "",
//           totalAmount: quotationData.total || "",
//           balancePaymentAmount: quotationData.bal_amt || "",
//           termsAndConditions: {
//             ...prev.termsAndConditions,
//           },
//         }));

//       } catch (error) {
//         console.error("Error in fetchQuotation:", error);
//         setError("Failed to fetch work order details: " + (error.message || "Unknown error"));
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchQuotation();

//   }, [urlQuotationId, workOrderId, masterItems]);

//   // Load PO data (editing)
//   useEffect(() => {
//     if (!poId) return;
//     const poRecord = poData.find((p) => p.poId === poId);
//     if (!poRecord) {
//       console.warn("PO not found:", poId);
//       return;
//     }
//     const mappedItems = poRecord.items.map((item, idx) => ({
//       id: `item-${Date.now()}-${idx}`,
//       itemId: "",
//       material: item.material || materialOptions[0],
//       sub_product: item.sub_product || "",
//       description: item.description || "",
//       unit: item.unit || "",
//       quantity: String(item.quantity || ""),
//       // FORMAT RATE AND AMOUNT TO 2 DECIMALS
//       rate: formatTwoDecimal(item.rate || ""),
//       amount: formatTwoDecimal(item.total || ""),
//       inst_unit: item.inst_unit || item.unit || "",
//       inst_qty: item.inst_qty || item.quantity || "",
//       inst_rate: formatTwoDecimal(item.inst_rate || item.rate || ""),
//       inst_amt: formatTwoDecimal(item.inst_amt || item.total || ""),
//       total: formatTwoDecimal(item.total || ""),
//       brand: "",
//       brandId: "",
//       product: item.material || "",
//       productId: "",
//       subProduct: item.sub_product || "",
//       subProductId: "",
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
//       ...initialFormState,
//       poId: poRecord.poId || "",
//       poNumber: poRecord.poNumber || "",
//       poDate: poRecord.poDate || "",
//       project_name: poRecord.projectName || "", // Changed from projectName
//       department: poRecord.department || "",
//       leadId: poRecord.leadId || "",
//       quotationId: poRecord.quotationId || "",
//       quotationRound: poRecord.quotationRound || "",
//       leadType: poRecord.leadType || "",
//       branch: poRecord.branch || "",
//       vendor: poRecord.vendorId || "", // Changed from vendorId
//       workOrderNumber: poRecord.workOrderNumber || "", // Include work order number for editing
//       client_name: poRecord.clientName || "", // Changed from clientName
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
//       advancePaymentPercentage: String(
//         poRecord.advancePaymentPercentage || ""
//       ),
//       advancePaymentAmount: String(
//         poRecord.advancePaymentAmount || ""
//       ),
//       balancePaymentPercentage: String(
//         poRecord.balancePaymentPercentage || ""
//       ),
//       balancePaymentAmount: String(
//         poRecord.balancePaymentAmount || ""
//       ),
//       advancePaymentReceived: poRecord.advancePaymentReceived || false,
//       advancePaymentReceivedDate:
//         poRecord.advancePaymentReceivedDate || "",
//       advancePaymentMode: poRecord.advancePaymentMode || "",
//       advanceTransactionRef: poRecord.advanceTransactionRef || "",
//       balancePaymentReceived:
//         poRecord.balancePaymentReceived || false,
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
//       poType: poRecord.poType || "billing",
//     });
//   }, [poId]);

//   // Calculate balance amount
//   useEffect(() => {
//     const totalAmount = parseFloat(formData.totalAmount) || 0;
//     const advanceAmount = parseFloat(formData.advancePaymentAmount) || 0;
//     const balanceAmount = totalAmount - advanceAmount;
//     setFormData(prev => ({
//       ...prev,
//       balancePaymentAmount: balanceAmount >= 0 ? balanceAmount.toFixed(2) : "0.00"
//     }));
//   }, [formData.totalAmount, formData.advancePaymentAmount]);

//   // === Handlers ===
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // NEW HANDLER: Add Vendor
//   const handleSaveVendor = async (e) => {
//     e.preventDefault();
//     if (!newVendorName.trim()) {
//       alert("Please enter a vendor name.");
//       return;
//     }

//     try {
//       setIsAddingVendor(true);
//       const response = await axios.post(
//         "https://nlfs.in/erp/index.php/Api/add_mst_vender",
//         {
//           vender_name: newVendorName,
//         }
//       );

//       if (response.data.status === true || response.data.status === "true") {
//         // Refresh the vendor list
//         const updatedVendors = await fetchVendorList();
//         setVendorList(updatedVendors);

//         // Find and select the newly added vendor
//         const newVendor = updatedVendors.find(
//           (v) => v.vender_name === newVendorName
//         );
//         if (newVendor) {
//           setFormData((prev) => ({
//             ...prev,
//             vendor: newVendor.id, // Changed from vendorId
//             companyName: newVendor.vender_name,
//           }));
//         }

//         setNewVendorName("");
//         setShowAddVendorModal(false);
//       } else {
//         throw new Error(response.data.message || "Failed to add vendor");
//       }
//     } catch (error) {
//       console.error("Error adding vendor:", error);
//       alert("Error adding vendor. Please try again.");
//     } finally {
//       setIsAddingVendor(false);
//     }
//   };

//   // UPDATED HANDLER to implement Brand>Product>SubProduct pipeline
//   const handleItemChange = (index, field, value) => {
//     setFormData((prev) => {
//       const newItems = [...prev.items];
//       const item = { ...newItems[index], [field]: value };

//       // BRAND SELECTION
//       if (field === "brandId") {
//         item.brandId = value;
//         item.brand = value;

//         // Reset dependent fields
//         item.product = "";
//         item.productId = "";
//         item.subProduct = "";
//         item.subProductId = "";
//         item.description = "";
//         item.unit = "";
//         item.inst_unit = "";
//         item.rate = "";
//         item.amount = "";
//         item.inst_amt = "";
//         item.total = "";
//       }

//       // PRODUCT SELECTION
//       if (field === "productId") {
//         item.productId = value;
//         item.product = value;

//         // Reset dependent sub-product fields
//         item.subProduct = "";
//         item.subProductId = "";
//         item.description = "";
//         item.unit = "";
//         item.inst_unit = "";
//         item.rate = "";
//         item.amount = "";
//         item.inst_amt = "";
//         item.total = "";
//       }

//       // SUB PRODUCT SELECTION
//       if (field === "subProductId") {
//         const selectedRow = masterItems.find(
//           (m) => String(m.id) === String(value)
//         );
//         if (selectedRow) {
//           item.subProduct =
//             selectedRow.item_name ||
//             selectedRow.g4_sub_category ||
//             item.subProduct;
//           item.description =
//             selectedRow.specification || item.description;
//           if (!item.unit) {
//             item.unit = selectedRow.uom || "";
//           }
//           if (!item.inst_unit) {
//             item.inst_unit = selectedRow.uom || "";
//           }
//           if (
//             selectedRow.rate !== undefined &&
//             selectedRow.rate !== null &&
//             selectedRow.rate !== ""
//           ) {
//             // FORMAT RATE ON SELECTION
//             item.rate = formatTwoDecimal(selectedRow.rate);
//             // Trigger recalculation if quantity exists
//             const qty = parseFloat(item.quantity) || 0;
//             const rate = parseFloat(item.rate) || 0;
//             const amount = qty * rate;
//             item.amount = amount.toFixed(2);
//             item.inst_amt = item.amount; // Sync installation amount
//             item.total = item.amount;
//           }
//         }
//       }

//       // Quantity Change logic
//       if (field === "quantity") {
//         const qty = parseFloat(item.quantity) || 0;
//         const rate = parseFloat(item.rate) || 0;
//         const amount = qty * rate;
//         item.amount = amount.toFixed(2);
//         // default installation == same as supply if not explicitly set
//         item.inst_unit = item.inst_unit || item.unit;
//         item.inst_qty = item.inst_qty || item.quantity;
//         item.inst_rate = item.inst_rate || item.rate;
//         item.inst_amt = item.inst_amt || item.amount;
//         item.total = item.total || item.amount;
//       }

//       // Rate Change logic
//       if (field === "rate") {
//         const qty = parseFloat(item.quantity) || 0;
//         const rate = parseFloat(item.rate) || 0;
//         const amount = qty * rate;
//         item.amount = amount.toFixed(2);
//         item.inst_amt = item.inst_amt || item.amount;
//         item.total = item.total || item.amount;
//       }

//       // Installation Quantity Change logic
//       if (field === "inst_qty") {
//         const qty = parseFloat(item.inst_qty) || 0;
//         const rate = parseFloat(item.inst_rate) || 0;
//         const amount = qty * rate;
//         item.inst_amt = amount.toFixed(2);
//         // Update total amount
//         const supplyAmount = parseFloat(item.amount) || 0;
//         item.total = (supplyAmount + amount).toFixed(2);
//       }

//       // Installation Rate Change logic
//       if (field === "inst_rate") {
//         const qty = parseFloat(item.inst_qty) || 0;
//         const rate = parseFloat(item.inst_rate) || 0;
//         const amount = qty * rate;
//         item.inst_amt = amount.toFixed(2);
//         // Update total amount
//         const supplyAmount = parseFloat(item.amount) || 0;
//         item.total = (supplyAmount + amount).toFixed(2);
//       }

//       newItems[index] = item;
//       return { ...prev, items: newItems };
//     });
//   };

//   // Helper to format on blur
//   const handleRateBlur = (index) => {
//     setFormData((prev) => {
//       const newItems = [...prev.items];
//       const item = { ...newItems[index] };
//       const formattedVal = formatTwoDecimal(item.rate);

//       // Recalculate amount
//       const q = parseFloat(item.quantity) || 0;
//       const r = parseFloat(formattedVal) || 0;

//       item.rate = formattedVal;
//       item.amount = (q * r).toFixed(2);
//       item.inst_amt = item.amount || (q * r).toFixed(2);
//       item.total = item.amount;

//       newItems[index] = item;
//       return { ...prev, items: newItems };
//     });
//   };

//   // Helper to format installation rate on blur
//   const handleInstRateBlur = (index) => {
//     setFormData((prev) => {
//       const newItems = [...prev.items];
//       const item = { ...newItems[index] };
//       const formattedVal = formatTwoDecimal(item.inst_rate);

//       // Recalculate installation amount
//       const q = parseFloat(item.inst_qty) || 0;
//       const r = parseFloat(formattedVal) || 0;

//       item.inst_rate = formattedVal;
//       item.inst_amt = (q * r).toFixed(2);
      
//       // Update total amount
//       const supplyAmount = parseFloat(item.amount) || 0;
//       item.total = (supplyAmount + (q * r)).toFixed(2);

//       newItems[index] = item;
//       return { ...prev, items: newItems };
//     });
//   };

//   // Image upload handler
//   const handleImageChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       const imageFile = e.target.files[0];
//       setSelectedImage(imageFile);
      
//       // Create preview
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         setImagePreview(event.target.result);
//       };
//       reader.readAsDataURL(imageFile);
//     }
//   };

//   const handleAddItem = () => {
//     const newItem = {
//       id: `item-${Date.now()}-${formData.items.length}`,
//       itemId: "",
//       material: materialOptions[0],
//       sub_product: "",
//       description: "",
//       unit: "",
//       quantity: "",
//       rate: "",
//       amount: "",
//       inst_unit: "",
//       inst_qty: "",
//       inst_rate: "",
//       inst_amt: "",
//       total: "",
//       brand: "",
//       brandId: "",
//       product: "",
//       productId: "",
//       subProduct: "",
//       subProductId: "",
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

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError(null);
//     setSuccess(null);

//     if (!formData.poNumber || !formData.quotationId) {
//       setError("PO Number and Quotation ID are required fields. Please ensure both are filled before saving.");
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       // Create FormData object to match what PHP expects
//       const formDataToSend = new FormData();
      
//       // Add all the form fields that match the PHP API
//       formDataToSend.append('po_no', formData.poNumber);
//       formDataToSend.append('quote_id', formData.quotationId);
//       formDataToSend.append('date', formData.poDate);
//       formDataToSend.append('terms', formData.terms);
//       formDataToSend.append('company', formData.companyName);
//       formDataToSend.append('site_address', formData.siteAddress?.trim() || "N/A");
//       formDataToSend.append('billing_address', formData.billingAddress?.trim() || "N/A");
//       formDataToSend.append('gst_number', formData.gstNumber);
//       formDataToSend.append('pan_number', formData.panNumber);
//       formDataToSend.append("po_type", formData.poType);
      
//       // UPDATED: Use client_name parameter instead of contact_person
//       formDataToSend.append('client_name', formData.client_name);
      
//       // ADDED: Send project_name parameter
//       formDataToSend.append('project_name', formData.project_name);
      
//       formDataToSend.append('branch', formData.branch);
//       formDataToSend.append('department', formData.department);
      
//       // UPDATED: Use vendor parameter instead of vendor_id
//       formDataToSend.append('vendor', formData.vendor);
      
//       formDataToSend.append('total_amt', formData.totalAmount);
//       formDataToSend.append('total_advance', formData.advancePaymentAmount);
//       formDataToSend.append('total_bal', formData.balancePaymentAmount);
//       formDataToSend.append('gst', `${formData.gstPercentage}%`);
      
//       // Add terms and conditions fields
//       // Use work order number directly for delivery_schedule if available
//       const deliveryScheduleValue = formData.workOrderNumber 
//         ? formData.workOrderNumber
//         : formData.termsAndConditions.deliverySchedule.expectedDeliveryDate || "";
//       formDataToSend.append('delivery_schedule', deliveryScheduleValue);
      
//       formDataToSend.append('liquidated_damages', formData.termsAndConditions.liquidatedDamages.applicable ? "yes" : "no");
//       formDataToSend.append('defect_liability_period', formData.termsAndConditions.defectLiabilityPeriod.duration || "");
//       formDataToSend.append('installation_scope', formData.termsAndConditions.installationAndCommissioning.installationScope || "");
//       formDataToSend.append('po_approval', formData.approvalStatus || "no");
//       formDataToSend.append('po_qty', formData.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0));
      
//       // Convert items array to JSON string as expected by PHP
//       const itemsArray = formData.items.map((item) => ({
//         brand: item.brand,
//         product: item.product,
//         sub_product: item.subProduct,
//         desc: item.description,
//         unit: item.unit,
//         qty: item.quantity,
//         rate: item.rate,
//         amt: item.amount,
//         inst_unit: item.inst_unit,
//         inst_qty: item.inst_qty,
//         inst_rate: item.inst_rate,
//         inst_amt: item.inst_amt,
//         total: item.total,
//       }));
      
//       formDataToSend.append('items', JSON.stringify(itemsArray));
      
//       // Add image if selected
//       if (selectedImage) {
//         formDataToSend.append('image', selectedImage);
//       }

//       const response = await axios.post(
//         "https://nlfs.in/erp/index.php/Api/add_po",
//         formDataToSend,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       const isSuccess =
//         response.data?.success == 1 ||
//         response.data?.status === true ||
//         response.data?.status === "true";

//       if (isSuccess) {
//         setShowSuccessModal(true);
//       } else {
//         throw new Error(response.data?.message || "Failed to create Purchase Order");
//       }

//     } catch (error) {
//       console.error("Error creating PO:", error);
//       setError(error.message || "Failed to create Purchase Order");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleSuccessModalClose = () => {
//     setShowSuccessModal(false);
//     navigate("/clients");
//   };

//   return (
//     <Container fluid className="my-4">
//       <Button
//         className="mb-3"
//         style={{ backgroundColor: "rgb(237, 49, 49)", border: "none" }}
//         onClick={() => navigate(-1)}
//       >
//         <FaArrowLeft />
//       </Button>

//       {error && (
//         <Alert
//           variant="danger"
//           dismissible
//           onClose={() => setError(null)}
//         >
//           {error}
//         </Alert>
//       )}

//       {isLoading || isLoadingMasterItems ? (
//         <div className="text-center my-5">
//           <Spinner animation="border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </Spinner>
//           <p className="mt-3">
//             {isLoading ? "Loading PO data..." :
//               isLoadingMasterItems ? "Loading product master list..." : "Loading..."}
//           </p>
//         </div>
//       ) : (
//         <Form onSubmit={handleSubmit}>
//           {/* PO DETAILS */}
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
//                       style={{ backgroundColor: "#f8f9fa" }}
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
//                       name="project_name" // Changed from projectName
//                       value={formData.project_name} // Changed from projectName
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Client Name</Form.Label>
//                     <Form.Control
//                       name="client_name" // Changed from clientName
//                       value={formData.client_name} // Changed from clientName
//                       onChange={handleInputChange}
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//               <Row>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Branch</Form.Label>
//                     <Form.Control
//                       as="select"
//                       name="branch"
//                       value={formData.branch}
//                       onChange={handleInputChange}
//                     >
//                       <option value="">Select Branch</option>
//                       {branchList.map((branch) => (
//                         <option
//                           key={branch.id}
//                           value={branch.branch_name}
//                         >
//                           {branch.branch_name}
//                         </option>
//                       ))}
//                     </Form.Control>
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Vendor</Form.Label>
//                     <InputGroup>
//                       <Form.Control
//                         as="select"
//                         name="vendor" // Changed from vendorId
//                         value={formData.vendor} // Changed from vendorId
//                         required
//                         onChange={(e) => {
//                           const selectedVendorId = e.target.value;
//                           const selectedVendor = vendorList.find(
//                             (v) => String(v.id) === String(selectedVendorId)
//                           );
//                           setFormData((prev) => ({
//                             ...prev,
//                             vendor: selectedVendorId, // Changed from vendorId
//                             companyName: selectedVendor
//                               ? selectedVendor.vender_name
//                               : "",
//                           }));
//                         }}
//                       >
//                         <option value="">Select Vendor</option>
//                         {vendorList.map((vendor) => (
//                           <option
//                             key={vendor.id}
//                             value={vendor.id}
//                           >
//                             {vendor.vender_name}
//                           </option>
//                         ))}
//                       </Form.Control>
//                       <Button
//                         className="add-customer-btn ms-2 rounded-1"
//                         onClick={() => setShowAddVendorModal(true)}
//                         title="Add New Vendor"
//                       >
//                         <FaPlus />
//                       </Button>
//                     </InputGroup>
//                   </Form.Group>
//                 </Col>
//               </Row>
//               <Row className="mt-2">
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>PO Type</Form.Label>
//                     <div className="d-flex gap-4">
//                       <Form.Check
//                         type="radio"
//                         label="Ex Factory"
//                         name="poType"
//                         value="ex_factory"
//                         checked={formData.poType === "ex_factory"}
//                         onChange={handleInputChange}
//                       />
//                       <Form.Check
//                         type="radio"
//                         label="Billing"
//                         name="poType"
//                         value="billing"
//                         checked={formData.poType === "billing"}
//                         onChange={handleInputChange}
//                       />
//                     </div>
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           {/* CLIENT INFO - BILLING */}
//           {formData.poType === "billing" && (
//           <Card className="mb-4">
//             <Card.Header>
//               <h5>Client Information</h5>
//             </Card.Header>
//             <Card.Body>
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
//                     <Form.Label>Site Address</Form.Label>
//                    <Form.Control
//   as="textarea"
//   rows={4}
//   name="siteAddress"
//   value={formData.siteAddress}
//   onChange={handleInputChange}
//   placeholder="N/A"
// />
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>{formData.poType === "ex_factory" ? "X-Factory Address:" : "Dispatch Address:"}</Form.Label>
//                    <Form.Control
//   as="textarea"
//   rows={4}
//   name="billingAddress"
//   value={formData.billingAddress}
//   onChange={handleInputChange}
//   placeholder="N/A"
// />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//           )}

//           {/* CLIENT INFO - EX FACTORY */}
//           {formData.poType === "ex_factory" && (
//           <Card className="mb-4">
//             <Card.Header>
//               <h5>Client Information</h5>
//             </Card.Header>
//             <Card.Body>
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
//                     <Form.Label>Site Address</Form.Label>
//                    <Form.Control
//   as="textarea"
//   rows={4}
//   name="siteAddress"
//   value={formData.siteAddress}
//   onChange={handleInputChange}
//   placeholder="N/A"
// />
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>X-Factory Address</Form.Label>
//                    <Form.Control
//   as="textarea"
//   rows={4}
//   name="billingAddress"
//   value={formData.billingAddress}
//   onChange={handleInputChange}
//   placeholder="N/A"
// />
//                   </Form.Group>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>
//           )}

//           {/* IMAGE UPLOAD */}
//           <Card className="mb-4">
//             <Card.Header>
//               <h5>PO Document/Image</h5>
//             </Card.Header>
//             <Card.Body>
//               <Row>
//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Upload PO Document/Image</Form.Label>
//                     <Form.Control
//                       type="file"
//                       accept="image/*,.pdf"
//                       onChange={handleImageChange}
//                     />
//                   </Form.Group>
//                   {imagePreview && (
//                     <div className="mt-3">
//                       <img 
//                         src={imagePreview} 
//                         alt="PO Preview" 
//                         style={{ maxWidth: "100%", height: "200px", objectFit: "contain" }}
//                       />
//                     </div>
//                   )}
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           {/* ITEMS */}
//           <Card className="mb-4">
//             <Card.Header>
//               <Card.Title as="h5">Items</Card.Title>
//             </Card.Header>
//             <Card.Body>
//               {formData.items.map((item, idx) => {
//                 const selectedBrand = item.brandId || item.brand || "";
//                 const selectedProduct = item.productId || item.product || "";
//                 const productOpts = getProductOptions(selectedBrand);
//                 const subProductOpts = getSubProductOptions(selectedBrand, selectedProduct);

//                 return (
//                   <div key={item.id} className="border rounded p-3 mb-3">
//                     <Row className="mb-3 align-items-start">
//                       {/* BRAND DROPDOWN */}
//                       <Col md={3}>
//                         <Form.Group>
//                           <Form.Label>Brand</Form.Label>
//                           <Form.Control
//                             as="select"
//                             value={item.brandId || ""}
//                             onChange={(e) => handleItemChange(idx, "brandId", e.target.value)}
//                           >
//                             <option value="">Select Brand</option>
//                             {brandOptions.map((b) => (
//                               <option key={b} value={b}>
//                                 {b}
//                               </option>
//                             ))}
//                           </Form.Control>
//                         </Form.Group>
//                       </Col>

//                       {/* PRODUCT DROPDOWN */}
//                       <Col md={3}>
//                         <Form.Group>
//                           <Form.Label>Product Category</Form.Label>
//                           <Form.Control
//                             as="select"
//                             value={item.productId || ""}
//                             onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
//                             disabled={!selectedBrand}
//                           >
//                             <option value="">Select Product</option>
//                             {productOpts.map((p) => (
//                               <option key={p} value={p}>
//                                 {p}
//                               </option>
//                             ))}
//                           </Form.Control>
//                         </Form.Group>
//                       </Col>

//                       {/* SUB-PRODUCT DROPDOWN - UPDATED */}
//                       <Col md={3}>
//                         <Form.Group>
//                           <Form.Label>Sub-Product</Form.Label>
//                           <Form.Control
//                             as="select"
//                             value={item.subProductId || ""}
//                             onChange={(e) => handleItemChange(idx, "subProductId", e.target.value)}
//                             disabled={!selectedProduct}
//                           >
//                             <option value="">Select Sub Product</option>
//                             {subProductOpts.map((sp) => (
//                               <option key={sp.id} value={sp.id}>
//                                 {sp.item_name || sp.g4_sub_category}
//                               </option>
//                             ))}
//                           </Form.Control>
//                           {/* Display the selected sub-product name if ID is set but dropdown doesn't show it */}
//                           {item.subProductId && !subProductOpts.find(sp => String(sp.id) === String(item.subProductId)) && (
//                             <div className="text-muted mt-1">
//                               Selected: {item.subProduct}
//                             </div>
//                           )}
//                         </Form.Group>
//                       </Col>

//                       {/* UNIT */}
//                       <Col md={3}>
//                         <Form.Group>
//                           <Form.Label>Unit</Form.Label>
//                           <Form.Control
//                             type="text"
//                             value={item.unit || ""}
//                             onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     <Row className="mb-3">
//                       <Col md={12}>
//                         <Form.Group>
//                           <Form.Label>Description</Form.Label>
//                           <Form.Control
//                             as="textarea"
//                             rows={3}
//                             value={item.description || ""}
//                             onChange={(e) =>
//                               handleItemChange(idx, "description", e.target.value)
//                             }
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     <Row className="align-items-end">
//                       <Col md={2}>
//                         <Form.Group>
//                           <Form.Label>Quantity</Form.Label>
//                           <Form.Control
//                             type="number"
//                             step="0.01"
//                             value={item.quantity || ""}
//                             onChange={(e) =>
//                               handleItemChange(idx, "quantity", e.target.value)
//                             }
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={2}>
//                         <Form.Group>
//                           <Form.Label>Rate</Form.Label>
//                           <Form.Control
//                             type="text"
//                             inputMode="decimal"
//                             value={item.rate || ""}
//                             onChange={(e) => {
//                               const cleanValue = sanitizeDecimalInput(e.target.value);
//                               handleItemChange(idx, "rate", cleanValue);
//                             }}
//                             onBlur={() => handleRateBlur(idx)}
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={2}>
//                         <Form.Group>
//                           <Form.Label>Amount</Form.Label>
//                           <Form.Control
//                             type="number"
//                             step="0.01"
//                             value={item.amount ? formatTwoDecimal(item.amount) : ""}
//                             readOnly
//                             style={{ backgroundColor: "#f8f9fa" }}
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={6} className="text-end">
//                         <Button
//                           variant="danger"
//                           size="sm"
//                           className="mt-4"
//                           onClick={() => handleRemoveItem(idx)}
//                           disabled={formData.items.length === 1}
//                         >
//                           <FaTrash />
//                         </Button>
//                       </Col>
//                     </Row>

                   
                  
//                   </div>
//                 );
//               })}
//               <Button variant="secondary" onClick={handleAddItem}>
//                 <FaPlus className="me-2" />Add Item
//               </Button>
//             </Card.Body>
//           </Card>

//           {/* TERMS & CONDITIONS */}
//           <Card className="mb-4">
//             <Card.Header>
//               <h5>Terms & Conditions</h5>
//             </Card.Header>
//             <Card.Body>
//               <CKEditor
//                 editor={ClassicEditor}
//                 data={formData.terms}
//                 config={{
//                   height: 400,
//                   toolbar: [
//                     "heading",
//                     "|",
//                     "bold",
//                     "italic",
//                     "underline",
//                     "bulletedList",
//                     "numberedList",
//                     "|",
//                     "link",
//                     "blockQuote",
//                     "insertTable",
//                     "|",
//                     "undo",
//                     "redo",
//                     "sourceEditing",
//                   ],
//                   versionCheck: false // Suppress version warning
//                 }}
//                 onChange={(event, editor) => {
//                   const data = editor.getData();
//                   setFormData((prev) => ({
//                     ...prev,
//                     terms: data,
//                   }));
//                 }}
//               />
//             </Card.Body>
//           </Card>

//           {/* ACTION BUTTONS */}
//           <div className="d-flex gap-2 mt-3 justify-content-end">
//             <Button
//               variant="primary"
//               type="submit"
//               disabled={isSubmitting}
//               style={{backgroundColor: "rgb(237, 49, 49)", border:"none"}}
//             >
//               {isSubmitting ? (
//                 <>
//                   <Spinner
//                     as="span"
//                     animation="border"
//                     size="sm"
//                   />
//                   <span className="ms-2">Saving...</span>
//                 </>
//               ) : (
//                 "Save Purchase Order"
//               )}
//             </Button>
//           </div>
//         </Form>
//       )}

//       {/* SUCCESS MODAL */}
//       <Modal show={showSuccessModal} centered onHide={handleSuccessModalClose}>
//         <Modal.Header closeButton>
//           <Modal.Title>Success</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           Purchase Order has been successfully created and saved!
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="primary" onClick={handleSuccessModalClose}>
//             OK
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* ADD VENDOR MODAL */}
//       <Modal
//         show={showAddVendorModal}
//         onHide={() => setShowAddVendorModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Add New Vendor</Modal.Title>
//         </Modal.Header>
//         <Form onSubmit={handleSaveVendor}>
//           <Modal.Body>
//             <Form.Group>
//               <Form.Label>Vendor Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Enter vendor name"
//                 value={newVendorName}
//                 onChange={(e) => setNewVendorName(e.target.value)}
//                 required
//                 autoFocus
//               />
//             </Form.Group>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button
//               variant="secondary"
//               onClick={() => setShowAddVendorModal(false)}
//               disabled={isAddingVendor}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="primary"
//               type="submit"
//               disabled={isAddingVendor}
//             >
//               {isAddingVendor ? (
//                 <>
//                   <Spinner as="span" animation="border" size="sm" />
//                   <span className="ms-2">Adding...</span>
//                 </>
//               ) : (
//                 "Add Vendor"
//               )}
//             </Button>
//           </Modal.Footer>
//         </Form>
//       </Modal>
//     </Container>
//   );
// }

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Modal,
  InputGroup,
} from "react-bootstrap";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { po as poData } from "../data/mockdata";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Helper: Ensure 2 decimal places (returns string)
const formatTwoDecimal = (val) => {
  if (val === "" || val === null || val === undefined) return "";
  return parseFloat(val).toFixed(2);
};

// Helper: Recalculate item amounts (updated to 2 decimals)
const recalculateItemAmount = (quantity, rate) => {
  return (
    (parseFloat(quantity) || 0) * (parseFloat(rate) || 0)
  ).toFixed(2);
};

const materialOptions = [
  "Select Material",
  "Ply",
  "Screws",
  "Aluminium Foils",
  "Laminates",
  "Service",
];

const sanitizeDecimalInput = (value) => {
  if (value === "") return "";

  // allow only digits + one dot
  let sanitized = value.replace(/[^0-9.]/g, "");

  const parts = sanitized.split(".");
  if (parts.length > 2) {
    sanitized = parts[0] + "." + parts.slice(1).join("");
  }

  if (parts[1]?.length > 2) {
    sanitized = parts[0] + "." + parts[1].slice(0, 2);
  }

  return sanitized;
};

const initialFormState = {
  // ===== PO HEADER =====
  poId: "",
  poNumber: "",
  poDate: "",
  project_name: "", // Changed from projectName
  department: "",
  leadId: "",
  quotationId: "",
  quotationRound: "",
  leadType: "",
  branch: "",
  vendor: "", // Changed from vendorId
  workOrderNumber: "", // Added field to store work order number
  // ===== CLIENT DETAILS =====
  client_name: "", // Changed from clientName
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
  terms: "",
  // ===== ITEMS =====
  items: [
    {
      id: `item-${Date.now()}-1`,
      itemId: "",
      material: materialOptions[0],
      sub_product: "",
      description: "",
      unit: "",
      quantity: "",
      rate: "",
      amount: "",
      inst_unit: "",
      inst_qty: "",
      inst_rate: "",
      inst_amt: "",
      total: "",
      // New fields for brand/product/sub-product functionality
      brand: "",
      brandId: "",
      product: "",
      productId: "",
      subProduct: "",
      subProductId: "",
      // extra internal fields
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
  // ===== UI STATE =====
  poType: "billing", // Default to billing type
};

// ===== API HELPERS =====
const fetchNextPoNumber = async () => {
  try {
    const response = await axios.get(
      "https://nlfs.in/erp/index.php/Erp/get_next_po_no"
    );
    if (response.data.status && response.data.next_quote_no) {
      return response.data.next_quote_no;
    }
    throw new Error("Failed to get next PO number");
  } catch (error) {
    console.error("Error fetching next PO number:", error);
    const year = new Date().getFullYear().toString().substring(2);
    const randomId = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `NLF-${year}-PO-${randomId}`;
  }
};

const fetchBranchList = async () => {
  try {
    const response = await axios.get(
      "https://nlfs.in/erp/index.php/Erp/branch_list"
    );
    if (
      response.data.status === true ||
      response.data.status === "true"
    ) {
      return response.data.data;
    }
    throw new Error("Failed to fetch branch list");
  } catch (error) {
    console.error("Error fetching branch list:", error);
    return [];
  }
};

const fetchDepartmentList = async () => {
  try {
    const response = await axios.get(
      "https://nlfs.in/erp/index.php/Erp/department_list"
    );
    if (
      response.data.status === true ||
      response.data.status === "true"
    ) {
      return response.data.data;
    }
    throw new Error("Failed to fetch department list");
  } catch (error) {
    console.error("Error fetching department list:", error);
    return [];
  }
};

// NEW HELPER: Fetch Vendor List
const fetchVendorList = async () => {
  try {
    const response = await axios.get(
      "https://nlfs.in/erp/index.php/Api/list_mst_vender"
    );
    if (
      response.data.status === true ||
      response.data.status === "true"
    ) {
      return response.data.data;
    }
    throw new Error("Failed to fetch vendor list");
  } catch (error) {
    console.error("Error fetching vendor list:", error);
    return [];
  }
};

const formatQuoteNumber = (quoteNo, quoteId, revise) => {
  if (quoteNo && quoteNo.includes("NLF-")) {
    return quoteNo;
  }
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const yearSuffix = currentYear.toString().substring(2);
  const nextYearSuffix = nextYear.toString().substring(2);
  if (quoteId && !isNaN(quoteId)) {
    let formattedQuoteId = `NLF-${yearSuffix}-${nextYearSuffix}-Q-${quoteId}`;
    if (revise && revise !== "" && revise !== null) {
      formattedQuoteId = `${formattedQuoteId}-R${revise}`;
    }
    return formattedQuoteId;
  }
  if (quoteId && quoteId.includes("NLF-")) {
    return quoteId;
  }
  return quoteNo || quoteId || "N/A";
};

const fetchNextQuoteNumber = async () => {
  try {
    const response = await fetch(
      "https://nlfs.in/erp/index.php/Erp/get_next_quote_no"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    if (result.status && result.success === "1") {
      return result.next_quote_no;
    } else {
      throw new Error(
        result.message || "Failed to fetch next quote number"
      );
    }
  } catch (error) {
    console.error("CATCH BLOCK: Error in fetchNextQuoteNumber:", error);
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const yearSuffix = currentYear.toString().substring(2);
    const nextYearSuffix = nextYear.toString().substring(2);
    const randomId = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const fallbackId = `NLF-${yearSuffix}-${nextYearSuffix}-Q-${randomId}`;
    return fallbackId;
  }
};

// UPDATED: Use get_work_order_by_id API
const fetchQuotationDetails = async (quotationId, workOrderId) => {
  try {
    console.log("DEBUG: Sending work_id:", workOrderId);
    
    const response = await axios.post(
      "https://nlfs.in/erp/index.php/Api/get_work_order_by_id",
      {
        work_id: String(workOrderId),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (response.data.status === "true" && response.data.success === "1" && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch work order details");
    }
  } catch (error) {
    console.error("Error fetching work order details:", error);
    throw error;
  }
};

export default function PoForm() {
  const { poId, quotationId: urlQuotationId, workOrderId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // NEW STATE FOR ADD VENDOR MODAL
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [isAddingVendor, setIsAddingVendor] = useState(false);

  // NEW STATE FOR IMAGE UPLOAD
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [subProductList, setSubProductList] = useState([]);
  const [vendorList, setVendorList] = useState([]);

  // NEW STATE FOR MASTER ITEMS LOGIC
  const [masterItems, setMasterItems] = useState([]);
  const [isLoadingMasterItems, setIsLoadingMasterItems] = useState(true);

  const [quotationData, setQuotationData] = useState(null);

  // ===== MASTER DATA LOGIC =====
  useEffect(() => {
    const fetchMasterItems = async () => {
      try {
        setIsLoadingMasterItems(true);
        const res = await fetch(
          "https://nlfs.in/erp/index.php/Api/list_mst_sub_product",
          { method: "GET" }
        );
        const data = await res.json();
        const statusTrue = data.status === "true" || data.status === true;
        const successTrue = data.success === "1" || data.success === 1;
        if (statusTrue && successTrue && data.data) {
          setMasterItems(data.data);
          setSubProductList(data.data);
        } else {
          console.error("Failed to load master items:", data);
          setError("Failed to load product master list.");
        }
      } catch (err) {
        console.error("Error fetching master items:", err);
        setError("Error fetching product master list.");
      } finally {
        setIsLoadingMasterItems(false);
      }
    };
    fetchMasterItems();
  }, []);

  // Derived helpers for dropdowns
  const brandOptions = useMemo(() => {
    const set = new Set();
    masterItems.forEach((item) => {
      if (item.brand) set.add(item.brand);
    });
    return Array.from(set);
  }, [masterItems]);

  const getProductOptions = (brandName) => {
    const set = new Set();
    masterItems.forEach((item) => {
      if (
        (!brandName || item.brand === brandName) &&
        item.g3_category &&
        item.g3_category.trim() !== ""
      ) {
        set.add(item.g3_category);
      }
    });
    return Array.from(set);
  };

  useEffect(() => {
    if (!formData.branch || branchList.length === 0) return;

    const selectedBranch = branchList.find(
      (b) => b.branch_name === formData.branch
    );

    if (!selectedBranch) return;

    setFormData((prev) => ({
      ...prev,
      gstNumber: prev.gstNumber || selectedBranch.gst_no || "",
      siteAddress: prev.siteAddress || selectedBranch.address || "",
    }));
  }, [formData.branch, branchList]);

  const getSubProductOptions = (brandName, productName) => {
    const filtered = masterItems.filter((item) => {
      const matchesBrand = !brandName || item.brand === brandName;
      const matchesProduct = !productName || item.g3_category === productName;
      return matchesBrand && matchesProduct;
    });

    // Deduplicate by id
    const seen = new Set();
    const result = [];
    filtered.forEach((item) => {
      const key = String(item.id);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    });

    return result;
  };

  // ===== EXISTING API EFFECTS =====

  // Fetch branch list
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

  // Fetch department list
  useEffect(() => {
    const getDepartmentList = async () => {
      try {
        const departments = await fetchDepartmentList();
        setDepartmentList(departments);
      } catch (error) {
        console.error("Error fetching department list:", error);
      }
    };
    getDepartmentList();
  }, []);

  // Fetch vendor list
  useEffect(() => {
    const getVendorList = async () => {
      try {
        const vendors = await fetchVendorList();
        setVendorList(vendors);
      } catch (error) {
        console.error("Error fetching vendor list:", error);
      }
    };
    getVendorList();
  }, []);

  // Fetch next PO number
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
        console.error("ACTION: Failed to fetch PO number.", error);
        setError("Failed to fetch PO number");
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const yearSuffix = currentYear.toString().substring(2);
        const nextYearSuffix = nextYear.toString().substring(2);
        const randomId = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        const fallbackId = `NLF-${yearSuffix}-${nextYearSuffix}-PO-${randomId}`;
        setFormData((prev) => ({
          ...prev,
          poNumber: fallbackId,
          poDate: new Date().toISOString().split("T")[0],
        }));
      } finally {
        setIsLoading(false);
      }
    };
    fetchPoNumber();
  }, []);

  // Fetch next quote number
  useEffect(() => {
    if (urlQuotationId) {
      return;
    }
    const fetchQuoteNumber = async () => {
      try {
        setIsLoading(true);
        const nextQuoteNo = await fetchNextQuoteNumber();
        const formattedQuoteId = formatQuoteNumber(
          null,
          nextQuoteNo,
          null
        );
        setFormData((prev) => ({
          ...prev,
          quotationId: formattedQuoteId,
        }));
      } catch (error) {
        console.error("ACTION: Failed to fetch quote number.", error);
        setError("Failed to fetch quote number");
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        const yearSuffix = currentYear.toString().substring(2);
        const nextYearSuffix = nextYear.toString().substring(2);
        const randomId = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        const fallbackId = `NLF-${yearSuffix}-${nextYearSuffix}-Q-${randomId}`;
        setFormData((prev) => ({
          ...prev,
          quotationId: fallbackId,
        }));
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuoteNumber();
  }, [urlQuotationId]);

  // Fetch quotation details - UPDATED with masterItems dependency and new API
  useEffect(() => {
    if (!urlQuotationId || !workOrderId || masterItems.length === 0) return;

    const fetchQuotation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("DEBUG: Fetching work order with ID:", workOrderId);
        
        const quotationData = await fetchQuotationDetails(urlQuotationId, workOrderId);
        console.log("Received work order data:", quotationData);
        
        setQuotationData(quotationData);

        // Parse items from JSON string with error handling
        let items = [];
        try {
          items = JSON.parse(quotationData.items || "[]");
          console.log("Parsed items:", items);
        } catch (e) {
          console.error("Error parsing items JSON:", e);
          setError("Error parsing work order items");
          setIsLoading(false);
          return;
        }

        setFormData((prev) => ({
          ...prev,
          quotationId: quotationData.quto_id || quotationData.wo_no || "",
          workOrderNumber: quotationData.wo_no || "", // Save the work order number
          project_name: quotationData.general_design || quotationData.project || "", // Changed from projectName
          client_name: quotationData.client_preparation || quotationData.name || "", // Changed from clientName
          branch: quotationData.branch_name || "",
          terms: quotationData.terms_and_condition || "",
          items: items.map((item, idx) => {
            // Find the sub-product ID based on the name
            const subProductMatch = masterItems.find(
              (m) => 
                m.item_name === item.sub_product || 
                m.g4_sub_category === item.sub_product
            );
            
            return {
              id: `item-${Date.now()}-${idx}`,
              brand: item.brand || "",
              brandId: item.brand || "",
              product: item.item_name || "",
              productId: item.item_name || "",
              sub_product: item.sub_product || "",
              subProduct: item.sub_product || "",
              subProductId: subProductMatch ? String(subProductMatch.id) : "",
              description: item.description || "",
              unit: item.unit || "",
              quantity: String(item.quantity || ""),
              // FORMAT RATE AND AMOUNT TO 2 DECIMALS
              rate: formatTwoDecimal(item.unit_price || ""),
              amount: formatTwoDecimal(
                (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)
              ),
              inst_unit: item.unit || "",
              inst_qty: item.quantity || "",
              inst_rate: formatTwoDecimal(item.unit_price || ""),
              inst_amt: formatTwoDecimal(
                (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)
              ),
              total: formatTwoDecimal(
                (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)
              ),
              deliveryStatus: "pending",
            };
          }),
          quotedAmount: quotationData.total || "",
          totalAmount: quotationData.total || "",
          balancePaymentAmount: quotationData.bal_amt || "",
          termsAndConditions: {
            ...prev.termsAndConditions,
          },
        }));

      } catch (error) {
        console.error("Error in fetchQuotation:", error);
        setError("Failed to fetch work order details: " + (error.message || "Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotation();

  }, [urlQuotationId, workOrderId, masterItems]);

  // Load PO data (editing)
  useEffect(() => {
    if (!poId) return;
    const poRecord = poData.find((p) => p.poId === poId);
    if (!poRecord) {
      console.warn("PO not found:", poId);
      return;
    }
    const mappedItems = poRecord.items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      itemId: "",
      material: item.material || materialOptions[0],
      sub_product: item.sub_product || "",
      description: item.description || "",
      unit: item.unit || "",
      quantity: String(item.quantity || ""),
      // FORMAT RATE AND AMOUNT TO 2 DECIMALS
      rate: formatTwoDecimal(item.rate || ""),
      amount: formatTwoDecimal(item.total || ""),
      inst_unit: item.inst_unit || item.unit || "",
      inst_qty: item.inst_qty || item.quantity || "",
      inst_rate: formatTwoDecimal(item.inst_rate || item.rate || ""),
      inst_amt: formatTwoDecimal(item.inst_amt || item.total || ""),
      total: formatTwoDecimal(item.total || ""),
      brand: "",
      brandId: "",
      product: item.material || "",
      productId: "",
      subProduct: item.sub_product || "",
      subProductId: "",
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
      ...initialFormState,
      poId: poRecord.poId || "",
      poNumber: poRecord.poNumber || "",
      poDate: poRecord.poDate || "",
      project_name: poRecord.projectName || "", // Changed from projectName
      department: poRecord.department || "",
      leadId: poRecord.leadId || "",
      quotationId: poRecord.quotationId || "",
      quotationRound: poRecord.quotationRound || "",
      leadType: poRecord.leadType || "",
      branch: poRecord.branch || "",
      vendor: poRecord.vendorId || "", // Changed from vendorId
      workOrderNumber: poRecord.workOrderNumber || "", // Include work order number for editing
      client_name: poRecord.clientName || "", // Changed from clientName
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
      advancePaymentPercentage: String(
        poRecord.advancePaymentPercentage || ""
      ),
      advancePaymentAmount: String(
        poRecord.advancePaymentAmount || ""
      ),
      balancePaymentPercentage: String(
        poRecord.balancePaymentPercentage || ""
      ),
      balancePaymentAmount: String(
        poRecord.balancePaymentAmount || ""
      ),
      advancePaymentReceived: poRecord.advancePaymentReceived || false,
      advancePaymentReceivedDate:
        poRecord.advancePaymentReceivedDate || "",
      advancePaymentMode: poRecord.advancePaymentMode || "",
      advanceTransactionRef: poRecord.advanceTransactionRef || "",
      balancePaymentReceived:
        poRecord.balancePaymentReceived || false,
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
      poType: poRecord.poType || "billing",
    });
  }, [poId]);

  // Calculate balance amount
  useEffect(() => {
    const totalAmount = parseFloat(formData.totalAmount) || 0;
    const advanceAmount = parseFloat(formData.advancePaymentAmount) || 0;
    const balanceAmount = totalAmount - advanceAmount;
    setFormData(prev => ({
      ...prev,
      balancePaymentAmount: balanceAmount >= 0 ? balanceAmount.toFixed(2) : "0.00"
    }));
  }, [formData.totalAmount, formData.advancePaymentAmount]);

  // === Handlers ===
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // NEW HANDLER: Add Vendor
  const handleSaveVendor = async (e) => {
    e.preventDefault();
    if (!newVendorName.trim()) {
      alert("Please enter a vendor name.");
      return;
    }

    try {
      setIsAddingVendor(true);
      const response = await axios.post(
        "https://nlfs.in/erp/index.php/Api/add_mst_vender",
        {
          vender_name: newVendorName,
        }
      );

      if (response.data.status === true || response.data.status === "true") {
        // Refresh the vendor list
        const updatedVendors = await fetchVendorList();
        setVendorList(updatedVendors);

        // Find and select the newly added vendor
        const newVendor = updatedVendors.find(
          (v) => v.vender_name === newVendorName
        );
        if (newVendor) {
          setFormData((prev) => ({
            ...prev,
            vendor: newVendor.id, // Changed from vendorId
            companyName: newVendor.vender_name,
          }));
        }

        setNewVendorName("");
        setShowAddVendorModal(false);
      } else {
        throw new Error(response.data.message || "Failed to add vendor");
      }
    } catch (error) {
      console.error("Error adding vendor:", error);
      alert("Error adding vendor. Please try again.");
    } finally {
      setIsAddingVendor(false);
    }
  };

  // UPDATED HANDLER to implement Brand>Product>SubProduct pipeline
  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      const item = { ...newItems[index], [field]: value };

      // BRAND SELECTION
      if (field === "brandId") {
        item.brandId = value;
        item.brand = value;

        // Reset dependent fields
        item.product = "";
        item.productId = "";
        item.subProduct = "";
        item.subProductId = "";
        item.description = "";
        item.unit = "";
        item.inst_unit = "";
        item.rate = "";
        item.amount = "";
        item.inst_amt = "";
        item.total = "";
      }

      // PRODUCT SELECTION
      if (field === "productId") {
        item.productId = value;
        item.product = value;

        // Reset dependent sub-product fields
        item.subProduct = "";
        item.subProductId = "";
        item.description = "";
        item.unit = "";
        item.inst_unit = "";
        item.rate = "";
        item.amount = "";
        item.inst_amt = "";
        item.total = "";
      }

      // SUB PRODUCT SELECTION
      if (field === "subProductId") {
        const selectedRow = masterItems.find(
          (m) => String(m.id) === String(value)
        );
        if (selectedRow) {
          item.subProduct =
            selectedRow.item_name ||
            selectedRow.g4_sub_category ||
            item.subProduct;
          item.description =
            selectedRow.specification || item.description;
          if (!item.unit) {
            item.unit = selectedRow.uom || "";
          }
          if (!item.inst_unit) {
            item.inst_unit = selectedRow.uom || "";
          }
          if (
            selectedRow.rate !== undefined &&
            selectedRow.rate !== null &&
            selectedRow.rate !== ""
          ) {
            // FORMAT RATE ON SELECTION
            item.rate = formatTwoDecimal(selectedRow.rate);
            // Trigger recalculation if quantity exists
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            const amount = qty * rate;
            item.amount = amount.toFixed(2);
            item.inst_amt = item.amount; // Sync installation amount
            item.total = item.amount;
          }
        }
      }

      // Quantity Change logic
      if (field === "quantity") {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const amount = qty * rate;
        item.amount = amount.toFixed(2);
        // default installation == same as supply if not explicitly set
        item.inst_unit = item.inst_unit || item.unit;
        item.inst_qty = item.inst_qty || item.quantity;
        item.inst_rate = item.inst_rate || item.rate;
        item.inst_amt = item.inst_amt || item.amount;
        item.total = item.total || item.amount;
      }

      // Rate Change logic
      if (field === "rate") {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const amount = qty * rate;
        item.amount = amount.toFixed(2);
        item.inst_amt = item.inst_amt || item.amount;
        item.total = item.total || item.amount;
      }

      // Installation Quantity Change logic
      if (field === "inst_qty") {
        const qty = parseFloat(item.inst_qty) || 0;
        const rate = parseFloat(item.inst_rate) || 0;
        const amount = qty * rate;
        item.inst_amt = amount.toFixed(2);
        // Update total amount
        const supplyAmount = parseFloat(item.amount) || 0;
        item.total = (supplyAmount + amount).toFixed(2);
      }

      // Installation Rate Change logic
      if (field === "inst_rate") {
        const qty = parseFloat(item.inst_qty) || 0;
        const rate = parseFloat(item.inst_rate) || 0;
        const amount = qty * rate;
        item.inst_amt = amount.toFixed(2);
        // Update total amount
        const supplyAmount = parseFloat(item.amount) || 0;
        item.total = (supplyAmount + amount).toFixed(2);
      }

      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  // Helper to format on blur
  const handleRateBlur = (index) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };
      const formattedVal = formatTwoDecimal(item.rate);

      // Recalculate amount
      const q = parseFloat(item.quantity) || 0;
      const r = parseFloat(formattedVal) || 0;

      item.rate = formattedVal;
      item.amount = (q * r).toFixed(2);
      item.inst_amt = item.amount || (q * r).toFixed(2);
      item.total = item.amount;

      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  // Helper to format installation rate on blur
  const handleInstRateBlur = (index) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };
      const formattedVal = formatTwoDecimal(item.inst_rate);

      // Recalculate installation amount
      const q = parseFloat(item.inst_qty) || 0;
      const r = parseFloat(formattedVal) || 0;

      item.inst_rate = formattedVal;
      item.inst_amt = (q * r).toFixed(2);
      
      // Update total amount
      const supplyAmount = parseFloat(item.amount) || 0;
      item.total = (supplyAmount + (q * r)).toFixed(2);

      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  // Image upload handler
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imageFile = e.target.files[0];
      setSelectedImage(imageFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(imageFile);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}-${formData.items.length}`,
      itemId: "",
      material: materialOptions[0],
      sub_product: "",
      description: "",
      unit: "",
      quantity: "",
      rate: "",
      amount: "",
      inst_unit: "",
      inst_qty: "",
      inst_rate: "",
      inst_amt: "",
      total: "",
      brand: "",
      brandId: "",
      product: "",
      productId: "",
      subProduct: "",
      subProductId: "",
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

    if (!formData.poNumber || !formData.quotationId) {
      setError("PO Number and Quotation ID are required fields. Please ensure both are filled before saving.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData object to match what PHP expects
      const formDataToSend = new FormData();
      
      // Add all the form fields that match the PHP API
      formDataToSend.append('po_no', formData.poNumber);
      formDataToSend.append('quote_id', formData.quotationId);
      formDataToSend.append('date', formData.poDate);
      formDataToSend.append('terms', formData.terms);
      formDataToSend.append('company', formData.companyName);
      formDataToSend.append('site_address', formData.siteAddress?.trim() || "N/A");
      formDataToSend.append('billing_address', formData.billingAddress?.trim() || "N/A");
      formDataToSend.append('gst_number', formData.gstNumber);
      formDataToSend.append('pan_number', formData.panNumber);
      formDataToSend.append("po_type", formData.poType);
      
      // UPDATED: Use client_name parameter instead of contact_person
      formDataToSend.append('client_name', formData.client_name);
      
      // ADDED: Send project_name parameter
      formDataToSend.append('project_name', formData.project_name);
      
      formDataToSend.append('branch', formData.branch);
      formDataToSend.append('department', formData.department);
      
      // UPDATED: Use vendor parameter instead of vendor_id
      formDataToSend.append('vendor', formData.vendor);
      
      formDataToSend.append('total_amt', formData.totalAmount);
      formDataToSend.append('total_advance', formData.advancePaymentAmount);
      formDataToSend.append('total_bal', formData.balancePaymentAmount);
      formDataToSend.append('gst', `${formData.gstPercentage}%`);
      
      // Add terms and conditions fields
      // Use work order number directly for delivery_schedule if available
      const deliveryScheduleValue = formData.workOrderNumber 
        ? formData.workOrderNumber
        : formData.termsAndConditions.deliverySchedule.expectedDeliveryDate || "";
      formDataToSend.append('delivery_schedule', deliveryScheduleValue);
      
      formDataToSend.append('liquidated_damages', formData.termsAndConditions.liquidatedDamages.applicable ? "yes" : "no");
      formDataToSend.append('defect_liability_period', formData.termsAndConditions.defectLiabilityPeriod.duration || "");
      formDataToSend.append('installation_scope', formData.termsAndConditions.installationAndCommissioning.installationScope || "");
      formDataToSend.append('po_approval', formData.approvalStatus || "no");
      formDataToSend.append('po_qty', formData.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0));
      
      // Convert items array to JSON string as expected by PHP
      const itemsArray = formData.items.map((item) => ({
        brand: item.brand,
        product: item.product,
        sub_product: item.subProduct,
        desc: item.description,
        unit: item.unit,
        qty: item.quantity,
        rate: item.rate,
        amt: item.amount,
        inst_unit: item.inst_unit,
        inst_qty: item.inst_qty,
        inst_rate: item.inst_rate,
        inst_amt: item.inst_amt,
        total: item.total,
      }));
      
      formDataToSend.append('items', JSON.stringify(itemsArray));
      
      // Add image if selected
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }

      const response = await axios.post(
        "https://nlfs.in/erp/index.php/Api/add_po",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const isSuccess =
        response.data?.success == 1 ||
        response.data?.status === true ||
        response.data?.status === "true";

      if (isSuccess) {
        setShowSuccessModal(true);
      } else {
        throw new Error(response.data?.message || "Failed to create Purchase Order");
      }

    } catch (error) {
      console.error("Error creating PO:", error);
      setError(error.message || "Failed to create Purchase Order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate("/clients");
  };

  return (
    <Container fluid className="my-4">
      <Button
        className="mb-3"
        style={{ backgroundColor: "rgb(237, 49, 49)", border: "none" }}
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft />
      </Button>

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {isLoading || isLoadingMasterItems ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">
            {isLoading ? "Loading PO data..." :
              isLoadingMasterItems ? "Loading product master list..." : "Loading..."}
          </p>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          {/* PO DETAILS */}
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
                      style={{ backgroundColor: "#f8f9fa" }}
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
                      name="project_name" // Changed from projectName
                      value={formData.project_name} // Changed from projectName
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Client Name</Form.Label>
                    <Form.Control
                      name="client_name" // Changed from clientName
                      value={formData.client_name} // Changed from clientName
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
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
                        <option
                          key={branch.id}
                          value={branch.branch_name}
                        >
                          {branch.branch_name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vendor</Form.Label>
                    <InputGroup>
                      <Form.Control
                        as="select"
                        name="vendor" // Changed from vendorId
                        value={formData.vendor} // Changed from vendorId
                        required
                        onChange={(e) => {
                          const selectedVendorId = e.target.value;
                          const selectedVendor = vendorList.find(
                            (v) => String(v.id) === String(selectedVendorId)
                          );
                          setFormData((prev) => ({
                            ...prev,
                            vendor: selectedVendorId, // Changed from vendorId
                            companyName: selectedVendor
                              ? selectedVendor.vender_name
                              : "",
                          }));
                        }}
                      >
                        <option value="">Select Vendor</option>
                        {vendorList.map((vendor) => (
                          <option
                            key={vendor.id}
                            value={vendor.id}
                          >
                            {vendor.vender_name}
                          </option>
                        ))}
                      </Form.Control>
                      <Button
                        className="add-customer-btn ms-2 rounded-1"
                        onClick={() => setShowAddVendorModal(true)}
                        title="Add New Vendor"
                      >
                        <FaPlus />
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* CLIENT INFO */}
          <Card className="mb-4">
            <Card.Header>
              <h5>Client Information</h5>
            </Card.Header>
            <Card.Body>
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
                    <Form.Label>Billing Address</Form.Label>
                   <Form.Control
  as="textarea"
  rows={4}
  name="siteAddress"
  value={formData.siteAddress}
  onChange={handleInputChange}
  placeholder="N/A"
/>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dispatch Address:</Form.Label>
                   <Form.Control
  as="textarea"
  rows={4}
  name="billingAddress"
  value={formData.billingAddress}
  onChange={handleInputChange}
  placeholder="N/A"
/>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* IMAGE UPLOAD */}
          <Card className="mb-4">
            <Card.Header>
              <h5>PO Document/Image</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Upload PO Document/Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleImageChange}
                    />
                  </Form.Group>
                  {imagePreview && (
                    <div className="mt-3">
                      <img 
                        src={imagePreview} 
                        alt="PO Preview" 
                        style={{ maxWidth: "100%", height: "200px", objectFit: "contain" }}
                      />
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ITEMS */}
          <Card className="mb-4">
            <Card.Header>
              <Card.Title as="h5">Items</Card.Title>
            </Card.Header>
            <Card.Body>
              {formData.items.map((item, idx) => {
                const selectedBrand = item.brandId || item.brand || "";
                const selectedProduct = item.productId || item.product || "";
                const productOpts = getProductOptions(selectedBrand);
                const subProductOpts = getSubProductOptions(selectedBrand, selectedProduct);

                return (
                  <div key={item.id} className="border rounded p-3 mb-3">
                    <Row className="mb-3 align-items-start">
                      {/* BRAND DROPDOWN */}
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Brand</Form.Label>
                          <Form.Control
                            as="select"
                            value={item.brandId || ""}
                            onChange={(e) => handleItemChange(idx, "brandId", e.target.value)}
                          >
                            <option value="">Select Brand</option>
                            {brandOptions.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      </Col>

                      {/* PRODUCT DROPDOWN */}
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Product Category</Form.Label>
                          <Form.Control
                            as="select"
                            value={item.productId || ""}
                            onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                            disabled={!selectedBrand}
                          >
                            <option value="">Select Product</option>
                            {productOpts.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      </Col>

                      {/* SUB-PRODUCT DROPDOWN - UPDATED */}
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Sub-Product</Form.Label>
                          <Form.Control
                            as="select"
                            value={item.subProductId || ""}
                            onChange={(e) => handleItemChange(idx, "subProductId", e.target.value)}
                            disabled={!selectedProduct}
                          >
                            <option value="">Select Sub Product</option>
                            {subProductOpts.map((sp) => (
                              <option key={sp.id} value={sp.id}>
                                {sp.item_name || sp.g4_sub_category}
                              </option>
                            ))}
                          </Form.Control>
                          {/* Display the selected sub-product name if ID is set but dropdown doesn't show it */}
                          {item.subProductId && !subProductOpts.find(sp => String(sp.id) === String(item.subProductId)) && (
                            <div className="text-muted mt-1">
                              Selected: {item.subProduct}
                            </div>
                          )}
                        </Form.Group>
                      </Col>

                      {/* UNIT */}
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>Unit</Form.Label>
                          <Form.Control
                            type="text"
                            value={item.unit || ""}
                            onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={item.description || ""}
                            onChange={(e) =>
                              handleItemChange(idx, "description", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="align-items-end">
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>Quantity</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              handleItemChange(idx, "quantity", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>Rate</Form.Label>
                          <Form.Control
                            type="text"
                            inputMode="decimal"
                            value={item.rate || ""}
                            onChange={(e) => {
                              const cleanValue = sanitizeDecimalInput(e.target.value);
                              handleItemChange(idx, "rate", cleanValue);
                            }}
                            onBlur={() => handleRateBlur(idx)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>Amount</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={item.amount ? formatTwoDecimal(item.amount) : ""}
                            readOnly
                            style={{ backgroundColor: "#f8f9fa" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="text-end">
                        <Button
                          variant="danger"
                          size="sm"
                          className="mt-4"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={formData.items.length === 1}
                        >
                          <FaTrash />
                        </Button>
                      </Col>
                    </Row>
                  </div>
                );
              })}
              <Button variant="secondary" onClick={handleAddItem}>
                <FaPlus className="me-2" />Add Item
              </Button>
            </Card.Body>
          </Card>

          {/* TERMS & CONDITIONS */}
          <Card className="mb-4">
            <Card.Header>
              <h5>Terms & Conditions</h5>
            </Card.Header>
            <Card.Body>
              <CKEditor
                editor={ClassicEditor}
                data={formData.terms}
                config={{
                  height: 400,
                  toolbar: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "underline",
                    "bulletedList",
                    "numberedList",
                    "|",
                    "link",
                    "blockQuote",
                    "insertTable",
                    "|",
                    "undo",
                    "redo",
                    "sourceEditing",
                  ],
                  versionCheck: false // Suppress version warning
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setFormData((prev) => ({
                    ...prev,
                    terms: data,
                  }));
                }}
              />
            </Card.Body>
          </Card>

          {/* ACTION BUTTONS */}
          <div className="d-flex gap-2 mt-3 justify-content-end">
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              style={{backgroundColor: "rgb(237, 49, 49)", border:"none"}}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                  />
                  <span className="ms-2">Saving...</span>
                </>
              ) : (
                "Save Purchase Order"
              )}
            </Button>
          </div>
        </Form>
      )}

      {/* SUCCESS MODAL */}
      <Modal show={showSuccessModal} centered onHide={handleSuccessModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Purchase Order has been successfully created and saved!
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSuccessModalClose}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ADD VENDOR MODAL */}
      <Modal
        show={showAddVendorModal}
        onHide={() => setShowAddVendorModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Vendor</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveVendor}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Vendor Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter vendor name"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowAddVendorModal(false)}
              disabled={isAddingVendor}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isAddingVendor}
            >
              {isAddingVendor ? (
                <>
                  <Spinner as="span" animation="border" size="sm" />
                  <span className="ms-2">Adding...</span>
                </>
              ) : (
                "Add Vendor"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}