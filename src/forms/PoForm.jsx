// src/pages/PoForm.jsx
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
} from "react-bootstrap";
import { po as poData } from "../data/mockdata";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Helper: Recalculate item amounts
const recalculateItemAmount = (quantity, rate) => {
  return (
    (parseFloat(quantity) || 0) * (parseFloat(rate) || 0)
  ).toString();
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
  branch: "",
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
)  {
      return response.data.data;
    }
    throw new Error("Failed to fetch branch list");
  } catch (error) {
    console.error("Error fetching branch list:", error);
    return [];
  }
};

// NEW HELPER: Fetch Department List
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
  const { poId, quotationId: urlQuotationId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [branchList, setBranchList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [subProductList, setSubProductList] = useState([]);
  
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
          setSubProductList(data.data); // Keep compatibility with existing code if any
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

  // Fetch department list when component mounts
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

  // Fetch next quote number when component mounts and no quotationId is provided
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

  // Fetch quotation details if quotationId is provided (from URL)
  useEffect(() => {
    if (!urlQuotationId) return;

    const fetchQuotation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const quotationData = await fetchQuotationDetails(urlQuotationId);
        setQuotationData(quotationData);

        setFormData((prev) => ({
          ...prev,
          quotationId: quotationData.quote_no,
          projectName: quotationData.project || "",
          clientName: quotationData.name || "",
          branch: quotationData.branch || "",
          terms: quotationData.terms || "",
          items: quotationData.items.map((item, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            brand: item.brand || "",
            brandId: item.brand || "", // Sync for select value
            product: item.product || "",
            productId: item.product || "", // Sync for select value
            sub_product: item.sub_product || "",
            subProduct: item.sub_product || "",
            subProductId: item.sub_prod_id || "",
            description: item.desc || "",
            unit: item.unit || "",
            quantity: String(item.qty || ""),
            rate: String(item.rate || ""),
            amount: String(item.amt || ""),
            inst_unit: item.inst_unit || item.unit || "",
            inst_qty: item.inst_qty || item.qty || "",
            inst_rate: item.inst_rate || item.rate || "",
            inst_amt: item.inst_amt || item.amt || "",
            total: item.total || item.amt || "",
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

  }, [urlQuotationId]);

  // Load PO data if poId is provided (for editing existing PO using mockdata)
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
      rate: String(item.rate || ""),
      amount: String(item.total || ""),
      inst_unit: item.inst_unit || item.unit || "",
      inst_qty: item.inst_qty || item.quantity || "",
      inst_rate: item.inst_rate || item.rate || "",
      inst_amt: item.inst_amt || item.total || "",
      total: item.total || "",
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
      poId: poRecord.poId || "",
      poNumber: poRecord.poNumber || "",
      poDate: poRecord.poDate || "",
      projectName: poRecord.projectName || "",
      department: poRecord.department || "",
      leadId: poRecord.leadId || "",
      quotationId: poRecord.quotationId || "",
      quotationRound: poRecord.quotationRound || "",
      leadType: poRecord.leadType || "",
      branch: poRecord.branch || "",
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
    });
  }, [poId]);

  // Calculate balance amount whenever total or advance changes
  useEffect(() => {
    const totalAmount = parseFloat(formData.totalAmount) || 0;
    const advanceAmount = parseFloat(formData.advancePaymentAmount) || 0;
    const balanceAmount = totalAmount - advanceAmount;
    setFormData(prev => ({
      ...prev,
      balancePaymentAmount: balanceAmount >= 0 ? balanceAmount.toString() : "0"
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
            item.rate = String(selectedRow.rate);
            // Trigger recalculation if quantity exists
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.rate) || 0;
            const amount = qty * rate;
            item.amount = amount.toString();
            item.inst_amt = item.amount; // Sync installation amount
            item.total = item.amount;
          }
        }
      }

      // Quantity Change logic (exists in original, kept)
      if (field === "quantity") {
        const qty = parseFloat(item.quantity) || 0;
        const rate = parseFloat(item.rate) || 0;
        const amount = qty * rate;
        item.amount = amount.toString();
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
         item.amount = amount.toString();
         item.inst_amt = item.inst_amt || item.amount;
         item.total = item.total || item.amount;
      }

      newItems[index] = item;
      return { ...prev, items: newItems };
    });
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
      const poPayload = {
        po_no: formData.poNumber,
        quote_id: formData.quotationId,
        date: formData.poDate,
        terms: formData.terms,
        company: formData.companyName,
        site_address: formData.siteAddress?.trim() || "N/A",
        billing_address: formData.billingAddress?.trim() || "N/A",
        gst_number: formData.gstNumber,
        pan_number: formData.panNumber,
        contact_person: formData.contactPerson,
        branch: formData.branch,
        department: formData.department,
        total_amt: formData.totalAmount,
        total_advance: formData.advancePaymentAmount,
        total_bal: formData.balancePaymentAmount,
        gst: `${formData.gstPercentage}%`,
        items: formData.items.map((item) => ({
          product: item.product,
          sub_product: item.sub_product,
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
        Back
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
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
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
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Control
                      as="select"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Department</option>
                      {departmentList.map((dept) => (
                        <option
                          key={dept.dpt_id}
                          value={dept.department}
                        >
                          {dept.department}
                        </option>
                      ))}
                    </Form.Control>
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
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quotation No</Form.Label>
                    <Form.Control
                      name="quotationId"
                      value={formData.quotationId}
                      onChange={handleInputChange}
                      readOnly
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
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
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Site Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="siteAddress"
                      value={formData.siteAddress || "N/A"}
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
                      value={formData.billingAddress || "N/A"}
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

                      {/* SUB-PRODUCT DROPDOWN */}
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
                                {sp.item_name}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      </Col>

                      {/* UNIT (Read-only or selectable) - Kept as text for now based on requirements, or could be select */}
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
                            value={item.rate || ""}
                            onChange={(e) =>
                              handleItemChange(idx, "rate", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>Amount</Form.Label>
                          <Form.Control
                            type="text"
                            value={item.amount || ""}
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
                          X
                        </Button>
                      </Col>
                    </Row>
                  </div>
                );
              })}
              <Button variant="secondary" onClick={handleAddItem}>
                + Add Item
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
          <div className="d-flex gap-2 mt-3">
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
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
          localhost says PO Successfully Saved
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSuccessModalClose}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}