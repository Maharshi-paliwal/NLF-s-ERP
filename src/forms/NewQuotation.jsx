// src/forms/NewQuotation.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FaPlus, FaMinus, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Standard Terms & Conditions
// Standard Terms & Conditions (HTML markup to match client quote)
const standardTerms = `
<div class="nlf-terms-wrapper" style="font-family: Arial,Helvetica,sans-serif; font-size:12px; line-height:1.45; color:#111;">
  <div style="border:2px solid #000; padding:10px 12px; margin-bottom:8px;">
    <div style="font-weight:700; font-size:13px; margin-bottom:6px;">Commercial Terms:</div>
    <div style="margin-left:6px;">
      <div style="margin-bottom:6px;">• GST @18% extra</div>
      <div style="margin-bottom:6px;">• <strong>Payment Terms:</strong></div>
      <div style="margin-left:16px; margin-bottom:6px;">
        Supply Terms: 10% advance payment against readiness of material before dispatch.
      </div>
      <div style="margin-left:16px; margin-bottom:6px;">
        Installation Terms: 80% on installation of material, 10% after handover on a pro-rata basis, 5% as retention to be released after 12 months against submission of a Bank Guarantee.
      </div>
      <div style="margin-bottom:6px;">• Transportation charges are included in the above rate.</div>
      <div style="margin-bottom:6px; color:#d32f2f; font-weight:700;">
  • The above rates does not include any MS/Aluminium substructure required.
</div>
      <div style="margin-bottom:6px;">• Safe storage for the material to be provided by you at site with a locked room.</div>
      <div style="margin-bottom:6px;">• Providing & fixing of scaffolding shall be in your scope. In case scaffolding material is provided, labour charges will be applicable at ₹100/- per sqm.</div>
      <div style="margin-bottom:6px;">• All specifications of each product shall be approved by AAI before execution of the works.</div>
      <div style="margin-bottom:6px;">• Mode of Measurement: Measurements will be considered based on the surface area.</div>
      <div style="margin-bottom:6px;">• Suitable accommodation for site Engineer & hutment for labour to be provided by the client along with lodging & boarding.</div>
      <div style="margin-bottom:6px;">• Validity of Quotation: 30 days.</div>
    </div>
    <div style="margin-top:8px; font-size:12px;">Hope you will find our offer most competitive and in order.</div>

    <div style="margin-top:12px; display:flex; align-items:flex-end; justify-content:space-between;">
      <div style="height:48px; width:140px; border:1px dashed #999; display:flex; align-items:center; justify-content:center; font-size:11px; color:#777;">
        <img src="/extra/stamp.png" alt="stamp" style="max-height:42px; max-width:120px;" />
      </div>
      <div style="text-align:right; font-size:12px; font-weight:700;">For NLF Solutions Pvt Ltd</div>
    </div>
  </div>
</div>
`;


// Helper function to capitalize the first letter of each word
const capitalizeWords = (str) => {
  if (!str) return str;
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

// Helper function to calculate totals
const calculateTotals = (itemGroups, secondCarItems, secondCarAdditionalDetails) => {
  const totalItemAmount = itemGroups.reduce((acc, group) => {
    const itemAmt =
      parseFloat(group.amount) ||
      (parseFloat(group.quantity) || 0) * (parseFloat(group.rate) || 0);
    const instAmt =
      parseFloat(group.installationAmount) ||
      (parseFloat(group.installationQuantity) || 0) *
        (parseFloat(group.installationRate) || 0);
    return acc + itemAmt + instAmt;
  }, 0);

  const totalSecondCar = [...secondCarItems, ...secondCarAdditionalDetails].reduce(
    (acc, item) =>
      acc +
      (parseFloat(item.amount) ||
        (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)),
    0
  );

  const subtotal = totalItemAmount + totalSecondCar;
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  return {
    basicAmount: totalItemAmount + totalSecondCar,
    gst,
    grandTotal,
  };
};

// Helper function to format quote number to NLF-YY-YY-Q-XX format
const formatQuoteNumber = (quoteNo) => {
  // If already in correct format, return as is
  if (quoteNo && quoteNo.includes("NLF-")) {
    return quoteNo;
  }
  // If it's just a number, format it without padding
  const currentYear = new Date().getFullYear().toString().substring(2);
  const nextYear = (parseInt(currentYear) + 1).toString().padStart(2, "0");
  return `NLF-${currentYear}-${nextYear}-Q-${quoteNo}`;
};

// Function to fetch next quote number from API
const fetchNextQuoteNumber = async () => {
  try {
    const response = await axios.get(
      "https://nlfs.in/erp/index.php/Erp/get_next_quote_no"
    );
    if (response.data.status && response.data.next_quote_no) {
      const quoteNo = response.data.next_quote_no;
      // Format the quote number to ensure it's in NLF-YY-YY-Q-XX format
      return formatQuoteNumber(quoteNo);
    }
    throw new Error("Failed to get next quote number");
  } catch (error) {
    console.error("Error fetching next quote number:", error);
    // Fallback to local generation if API fails
    const year = new Date().getFullYear().toString().substring(2);
    const nextYear = (parseInt(year) + 1).toString().padStart(2, "0");
    const randomId = Math.floor(Math.random() * 1000);
    return `NLF-${year}-${nextYear}-Q-${randomId}`;
  }
};

// revise options - for dropdown
const reviseOptions = [
  { value: "R1", label: "revise 1 (R1)" },
  { value: "R2", label: "revise 2 (R2)" },
  { value: "R3", label: "revise 3 (R3)" },
  { value: "R4", label: "revise 4 (R4)" },
  { value: "R5", label: "revise 5 (R5)" },
];

const initialFormState = {
  quotationId: "",
  quotationNo: "", // Separate field for quote number with revise
  date: "",
  customerName: "",
  customerCity: "",
  project: "",
  officeBranch: "",
    quoteType: "direct", // "lead" | "direct"
  termsAndConditions: standardTerms,
  itemGroups: [
    {
      id: `group-${Date.now()}`,
      quote_id: "",
      description: "",
      unit: "",
      quantity: "",
      rate: "",
      amount: "",
      product: "", // Product name
      productId: "", // Now we store product name also in productId for selects
      brand: "", // Brand name
      brandId: "", // Brand name used as value
      subProduct: "", // Sub-product (item_name)
      subProductId: "", // Master row id
      installationDescription: "",
      installationUnit: "",
      installationQuantity: "",
      installationRate: "",
      installationAmount: "",
    },
  ],
// Replace the existing commercialTerms object with this:
commercialTerms: {
  gst: "GST 18% as actual",
  paymentTerms: "Payment 50% advance with formal work order and 50% on readiness of material before dispatch.",
  transportationCharges: "Transportation charges Extra.",
  unloading: "Unloading of material at clients end.",
  msAluminiumExclusion: "The above rates does not include any MS/Aluminium substructure required.",
  safeStorage: "Safe storage for material to be provided by you at site with a locked room.",
  scaffolding: "Providing & Fixing of Scaffolding should be at your end.",
  modeOfMeasurement: "Mode of Measurement: Measurements shall be wall to wall.",
  localTransportation: "Local transportation, loading & unloading of material from one area to another area on site at your end.",
  accommodation: "Suitable accommodation for site Engineer & hutment for labour to be provided by client along with lodging & boarding.",
  validity: "Validity of Quotation: 30 days.",
  closing: "Hope you will find our offer most competitive and in order."
},
  secondCarItems: [
    {
      id: `sc-item-${Date.now() + 1}`,
      description: "",
      unit: "",
      quantity: "",
      rate: "",
      amount: "",
      product: "", // Will be populated from API
    },
  ],
  secondCarAdditionalDetails: [
    {
      id: `sc-addl-${Date.now() + 2}`,
      description: "",
      unit: "",
      quantity: "",
      rate: "",
      amount: "",
    },
  ],
  revise: "", // No revision initially
  isApproved: false, // Track approval status
};

// ✅ helpers used in submit for both add & edit
const getFilledItemGroups = (itemGroups) => {
  return itemGroups.filter((group) => {
    const hasProduct = group.product && group.product.trim() !== "";
    const hasQuantity = group.quantity && parseFloat(group.quantity) > 0;
    const hasRate = group.rate && parseFloat(group.rate) > 0;
    const hasUnit = group.unit && group.unit.trim() !== "";
    return hasProduct && hasQuantity && hasRate && hasUnit;
  });
};

const buildItemsArray = (groups) => {
  const calculateAmount = (qty, rate) => {
    const quantity = parseFloat(qty) || 0;
    const rateVal = parseFloat(rate) || 0;
    return (quantity * rateVal).toFixed(2);
  };

  return groups.map((group) => {
    const itemAmount =
      group.amount || calculateAmount(group.quantity, group.rate);
    const instAmount =
      group.installationAmount ||
      calculateAmount(group.installationQuantity, group.installationRate);

    return {
      brand: group.brand || "",                 // ✅ ADD THIS
      product: group.product,                   // g3_category
      sub_product: group.subProduct || "",      // item_name
      desc: group.description || "",
      unit: group.unit,
      qty: group.quantity,
      rate: group.rate,
      amt: itemAmount,
      inst_unit: group.installationUnit || group.unit,
      inst_qty: group.installationQuantity || "0",
      inst_rate: group.installationRate || "0",
      inst_amt: instAmount,
      total: (parseFloat(itemAmount) + parseFloat(instAmount)).toFixed(2),
    };
  });
};


export default function NewQuotation() {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editorRef = useRef(null);

  // MASTER LIST from single GET API
  const [masterItems, setMasterItems] = useState([]);
  const [isLoadingMasterItems, setIsLoadingMasterItems] = useState(true);

  const [characterCount, setCharacterCount] = useState(0);
  const MAX_CHARACTER_LIMIT = 2000;

  // === MODE DETECTION ===
  const modeDetection = useMemo(() => {
    const isEditMode = location.pathname.includes("/edit");
    const isViewMode = location.pathname.includes("/view");
    const isNewQuotation = !quotationId;
    const isViewOnly = searchParams.get("view") === "true";
    return {
      isEditMode,
      isViewMode,
      isNewQuotation,
      isViewOnly,
      isFullyEditable: (isNewQuotation || isEditMode) && !isViewOnly,
    };
  }, [location.pathname, location.search, quotationId]);

  const { isEditMode, isViewMode, isNewQuotation, isViewOnly, isFullyEditable } =
    modeDetection;

  const [formData, setFormData] = useState(initialFormState);
  const [nextQuoteNumber, setNextQuoteNumber] = useState("");
  const [totals, setTotals] = useState({
    basicAmount: 0,
    gst: 0,
    grandTotal: 0,
  });
  const [unitList, setUnitList] = useState([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingQuoteNumber, setIsLoadingQuoteNumber] = useState(false);
  const [editorData, setEditorData] = useState(standardTerms);
  const [editorError, setEditorError] = useState(false);
  const [baseQuoteId, setBaseQuoteId] = useState(""); // Store base quote ID without revise
  const [branchList, setBranchList] = useState([]); // Store branches from API
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);

  // ✅ NEW: track whether admin has approved the rate
  const [isRateApproved, setIsRateApproved] = useState(false);

  // ------- MASTER API (Brand + Product + SubProduct + Rate) ----------
  useEffect(() => {
    const fetchMasterItems = async () => {
      try {
        setIsLoadingMasterItems(true);
        const res = await fetch(
          "https://nlfs.in/erp/index.php/Api/list_mst_sub_product",
          {
            method: "GET",
          }
        );
        const data = await res.json();
        const statusTrue = data.status === "true" || data.status === true;
        const successTrue = data.success === "1" || data.success === 1;
        if (statusTrue && successTrue && data.data) {
          setMasterItems(data.data);
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

  // Derived helpers from masterItems
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

  // Initialize editor data when formData changes
  useEffect(() => {
    if (formData.termsAndConditions !== editorData) {
      setEditorData(formData.termsAndConditions);
    }
  }, [formData.termsAndConditions]);

  // Update quotation number when revise changes (only in edit mode AND when rate approved)
  useEffect(() => {
    if (isEditMode && isRateApproved && baseQuoteId && formData.revise) {
      const quotationNo = `${baseQuoteId}-${formData.revise}`;
      setFormData((prev) => {
        if (prev.quotationNo !== quotationNo) {
          return { ...prev, quotationNo };
        }
        return prev;
      });
    } else if (isNewQuotation && baseQuoteId) {
      setFormData((prev) => {
        if (prev.quotationNo !== baseQuoteId) {
          return { ...prev, quotationNo: baseQuoteId };
        }
        return prev;
      });
    }
  }, [baseQuoteId, formData.revise, isEditMode, isNewQuotation, isRateApproved]);

  // Recalculate totals
  useEffect(() => {
    const newTotals = calculateTotals(
      formData.itemGroups,
      formData.secondCarItems,
      formData.secondCarAdditionalDetails
    );
    setTotals(newTotals);
  }, [
    formData.itemGroups,
    formData.secondCarItems,
    formData.secondCarAdditionalDetails,
  ]);

  // Fetch branch list from API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoadingBranches(true);
        const response = await axios.get(
          "https://nlfs.in/erp/index.php/Erp/branch_list"
        );
        if (response.data.status === "true" && response.data.data) {
          setBranchList(response.data.data);
          if (response.data.data.length > 0 && !formData.officeBranch) {
            setFormData((prev) => ({
              ...prev,
              officeBranch: response.data.data[0].branch_name,
            }));
          }
        } else {
          setError("Failed to load branches.");
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        setError("Failed to load branch list.");
      } finally {
        setIsLoadingBranches(false);
      }
    };
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch unit list from API
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setIsLoadingUnits(true);
        const response = await axios.get(
          "https://nlfs.in/erp/index.php/Erp/unit_list"
        );
        if (response.data.status === "true" && response.data.data) {
          setUnitList(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching units:", error);
        setError("Failed to load unit list.");
      } finally {
        setIsLoadingUnits(false);
      }
    };
    fetchUnits();
  }, []);

  // Load data based on mode
  useEffect(() => {
    let isMounted = true;

    // Wait for masterItems to load before trying to map existing items
    if (isLoadingMasterItems) return;

    // If EDIT MODE or VIEW MODE - fetch data from API
    if ((isEditMode || isViewMode || isViewOnly) && quotationId) {
      const fetchQuotationData = async () => {
        try {
          setIsLoadingData(true);
          setError(null);
          console.log("Fetching quotation with ID:", quotationId);

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
          console.log("Fetched quotation data for edit/view:", response.data);

          const isSuccess =
            response.data.status === true ||
            response.data.status === "true";
          if (isMounted && isSuccess && response.data.data) {
            const quotationData = response.data.data;
            const mainQuotationData = quotationData;
            const itemsArray = mainQuotationData.items || [];

            // ✅ set rate approved flag from DB field
            const rateApproved =
              mainQuotationData.rate_approval === "yes" ||
              mainQuotationData.rate_approval === "Yes" ||
              mainQuotationData.rate_approval === 1 ||
              mainQuotationData.rate_approval === "1" ||
              mainQuotationData.rate_approval === true;

            setIsRateApproved(rateApproved);

            const itemGroups = itemsArray.map((item, index) => {
              // try to match master row by product + sub_product
              const masterMatch = masterItems.find((m) => {
                const prodMatch =
                  m.g3_category === item.product ||
                  m.item_name === item.product;
                const subMatch =
                  m.item_name === item.sub_product ||
                  m.g4_sub_category === item.sub_product;
                return prodMatch && subMatch;
              });

              const brandName = masterMatch?.brand || "";
              const productName =
                item.product || masterMatch?.g3_category || "";
              const subProductName =
                item.sub_product || masterMatch?.item_name || "";

              return {
                id: `group-${Date.now()}-${index}`,
                quote_id: mainQuotationData.quote_id,
                description:
                  item.desc || masterMatch?.specification || "",
                unit: item.unit || masterMatch?.uom || "",
                quantity: item.qty || "",
                rate: item.rate || masterMatch?.rate || "",
                amount: item.amt || "",
                product: productName,
                productId: productName,
                brand: brandName,
                brandId: brandName,
                subProduct: subProductName,
                subProductId: masterMatch ? String(masterMatch.id) : "",
                installationDescription: "",
                installationUnit:
                  item.inst_unit || item.unit || masterMatch?.uom || "",
                installationQuantity: item.inst_qty || item.qty || "",
                installationRate: item.inst_rate || "",
                installationAmount: item.inst_amt || "",
              };
            });

            if (itemGroups.length === 0) {
              // fallback: build one row from mainQuotationData
              const masterMatch = masterItems.find((m) => {
                const prodMatch =
                  m.g3_category === mainQuotationData.product ||
                  m.item_name === mainQuotationData.product;
                const subMatch =
                  m.item_name === mainQuotationData.sub_product ||
                  m.g4_sub_category === mainQuotationData.sub_product;
                return prodMatch && subMatch;
              });

              const brandName = masterMatch?.brand || "";
              const productName =
                mainQuotationData.product || masterMatch?.g3_category || "";
              const subProductName =
                mainQuotationData.sub_product || masterMatch?.item_name || "";

              itemGroups.push({
                id: `group-${Date.now()}`,
                quote_id: mainQuotationData.quote_id,
                description:
                  mainQuotationData.desc || masterMatch?.specification || "",
                unit: mainQuotationData.unit || masterMatch?.uom || "",
                quantity: mainQuotationData.qty || "",
                rate: mainQuotationData.rate || masterMatch?.rate || "",
                amount: mainQuotationData.amt || "",
                product: productName,
                productId: productName,
                brand: brandName,
                brandId: brandName,
                subProduct: subProductName,
                subProductId: masterMatch ? String(masterMatch.id) : "",
                installationDescription: "",
                installationUnit:
                  mainQuotationData.inst_unit ||
                  mainQuotationData.unit ||
                  masterMatch?.uom ||
                  "",
                installationQuantity:
                  mainQuotationData.inst_qty || mainQuotationData.qty || "",
                installationRate: mainQuotationData.inst_rate || "",
                installationAmount: mainQuotationData.inst_amt || "",
              });
            }

            const quoteId = mainQuotationData.quote_id || "";
            const baseId = quoteId.includes("-R")
              ? quoteId.substring(0, quoteId.lastIndexOf("-R"))
              : quoteId;
            const formattedBaseId = formatQuoteNumber(baseId);
            console.log(
              "Setting baseQuoteId:",
              formattedBaseId,
              "from quoteId:",
              quoteId
            );
            setBaseQuoteId(formattedBaseId);

            const updatedFormData = {
              quotationId: quoteId,
              quotationNo: mainQuotationData.quote_no || quoteId,
              date:
                mainQuotationData.date ||
                new Date().toISOString().split("T")[0],
              customerName: mainQuotationData.name || "",
              customerCity: mainQuotationData.city || "",
              project: mainQuotationData.project || "",
              officeBranch: mainQuotationData.branch || "",
                quoteType: mainQuotationData.quote_type || "direct",

              termsAndConditions:
                mainQuotationData.terms || standardTerms,
              itemGroups: itemGroups,
              commercialTerms: {
                gst: "As applicable",
                supplyTerms: "",
                installationTerms: "",
              },
              secondCarItems: initialFormState.secondCarItems,
              secondCarAdditionalDetails:
                initialFormState.secondCarAdditionalDetails,
              revise: mainQuotationData.revise || "",
              isApproved:
                mainQuotationData.status === "approved" ||
                mainQuotationData.admin_approval === "Yes",
            };
            setFormData(updatedFormData);
            setEditorData(updatedFormData.termsAndConditions);
          } else {
            if (isMounted) {
              console.error("API response check failed:", {
                status: response.data.status,
                statusType: typeof response.data.status,
                hasData: !!response.data.data,
                response: response.data,
              });
              setError("Quotation not found.");
              setTimeout(() => navigate("/clients"), 2000);
            }
          }
        } catch (error) {
          if (isMounted) {
            console.error("Error fetching quotation:", error);
            setError("Failed to load quotation data.");
            setTimeout(() => navigate("/clients"), 2000);
          }
        } finally {
          if (isMounted) {
            setIsLoadingData(false);
          }
        }
      };
      fetchQuotationData();

      // Fetch next quote number for edit mode (used when creating revisions)
      const fetchNextQuote = async () => {
        try {
          const nextQuote = await fetchNextQuoteNumber();
          if (isMounted) {
            setNextQuoteNumber(nextQuote);
          }
        } catch (error) {
          console.error("Error fetching next quote number:", error);
        }
      };
      fetchNextQuote();
    } else if (isNewQuotation) {
      const fetchNewQuoteNumber = async () => {
        try {
          setIsLoadingQuoteNumber(true);
          const nextQuoteNumber = await fetchNextQuoteNumber();
          if (isMounted) {
            setBaseQuoteId(nextQuoteNumber);
            setFormData((prev) => ({
              ...prev,
              quotationId: nextQuoteNumber,
              quotationNo: nextQuoteNumber,
              date: new Date().toISOString().split("T")[0],
              officeBranch:
                branchList.length > 0 ? branchList[0].branch_name : "",
              revise: "",
            }));
          }
        } catch (error) {
          if (isMounted) {
            console.error("Error fetching new quote number:", error);
            setError("Failed to generate new quote number.");
          }
        } finally {
          if (isMounted) {
            setIsLoadingQuoteNumber(false);
          }
        }
      };
      fetchNewQuoteNumber();
    }

    return () => {
      isMounted = false;
    };
  }, [
    quotationId,
    isEditMode,
    isViewMode,
    isViewOnly,
    isNewQuotation,
    navigate,
    masterItems,
    isLoadingMasterItems,
    branchList,
  ]);

  const handleMainFormChange = (e) => {
    if (!isFullyEditable) return;
    const { name, value } = e.target;
    let processedValue = value;
    if (
      name === "customerName" ||
      name === "customerCity" ||
      name === "project"
    ) {
      processedValue = capitalizeWords(value);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleItemChange = (groupId, field, value) => {
    if (!isFullyEditable) return;

    setFormData((prev) => {
      const updatedGroups = prev.itemGroups.map((group) => {
        if (group.id !== groupId) return group;

        const newItem = { ...group, [field]: value };

        // BRAND SELECTION (value is brand name)
        if (field === "brandId") {
          newItem.brandId = value;
          newItem.brand = value;

          // reset dependent fields
          newItem.product = "";
          newItem.productId = "";
          newItem.subProduct = "";
          newItem.subProductId = "";
          newItem.description = "";
          newItem.unit = "";
          newItem.installationUnit = "";
          newItem.rate = "";
          newItem.amount = "";
          newItem.installationAmount = "";
        }

        // PRODUCT SELECTION (value is g3_category)
        if (field === "productId") {
          newItem.productId = value;
          newItem.product = value;

          // reset dependent sub-product fields
          newItem.subProduct = "";
          newItem.subProductId = "";
          newItem.description = "";
          newItem.unit = "";
          newItem.installationUnit = "";
          newItem.rate = "";
          newItem.amount = "";
          newItem.installationAmount = "";
        }

        // SUB PRODUCT SELECTION (value is master row id)
        if (field === "subProductId") {
          const selectedRow = masterItems.find(
            (m) => String(m.id) === String(value)
          );
          if (selectedRow) {
            newItem.subProduct =
              selectedRow.item_name ||
              selectedRow.g4_sub_category ||
              newItem.subProduct;
            newItem.description =
              selectedRow.specification || newItem.description;
            if (!newItem.unit) {
              newItem.unit = selectedRow.uom || "";
            }
            if (!newItem.installationUnit) {
              newItem.installationUnit = selectedRow.uom || "";
            }
            if (
              selectedRow.rate !== undefined &&
              selectedRow.rate !== null &&
              selectedRow.rate !== ""
            ) {
              newItem.rate = String(selectedRow.rate);
            }
          }
        }

        // Amount calculations
        if (field === "quantity" || field === "rate") {
          const q = parseFloat(
            field === "quantity" ? value : newItem.quantity
          ) || 0;
          const r = parseFloat(
            field === "rate" ? value : newItem.rate
          ) || 0;
          newItem.amount = (q * r).toString();
        }

        if (field === "unit") {
          newItem.installationUnit = value || newItem.installationUnit;
        }

        // Product quantity change → sync installation quantity
if (field === "quantity") {
  newItem.installationQuantity = value;

  const instRate = parseFloat(newItem.installationRate) || 0;
  const instQty = parseFloat(value) || 0;
  newItem.installationAmount = (instQty * instRate).toString();
}


        if (field === "installationQuantity" || field === "installationRate") {
  const q = parseFloat(newItem.installationQuantity) || 0;
  const r = parseFloat(newItem.installationRate) || 0;
  newItem.installationAmount = (q * r).toString();
}


        return newItem;
      });
      return { ...prev, itemGroups: updatedGroups };
    });
  };

  const handleCommercialTermsChange = (e) => {
    if (!isFullyEditable) return;
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      commercialTerms: {
        ...prev.commercialTerms,
        [name]: value,
      },
    }));
  };

  const handleAddItemGroup = () => {
    if (!isFullyEditable) return;
    const newGroup = {
      id: `group-${Date.now()}`,
      quote_id: "",
      description: "",
      unit: "",
      quantity: "",
      rate: "",
      amount: "",
      product: "",
      productId: "",
      brand: "",
      brandId: "",
      subProduct: "",
      subProductId: "",
      installationDescription: "",
      installationUnit: "",
      installationQuantity: "",
      installationRate: "",
      installationAmount: "",
    };
    setFormData((prev) => ({
      ...prev,
      itemGroups: [...prev.itemGroups, newGroup],
    }));
  };

  const handleRemoveItemGroup = (groupId) => {
    if (!isFullyEditable || formData.itemGroups.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      itemGroups: prev.itemGroups.filter((g) => g.id !== groupId),
    }));
  };

  const handleSecondCarItemChange = (itemId, field, value, section) => {
    if (!isFullyEditable) return;
    setFormData((prev) => {
      const updatedSection = prev[section].map((item) => {
        if (item.id === itemId) {
          const newItem = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            const quantity = parseFloat(newItem.quantity) || 0;
            const rate = parseFloat(newItem.rate) || 0;
            newItem.amount = (quantity * rate).toString();
          }
          return newItem;
        }
        return item;
      });
      return { ...prev, [section]: updatedSection };
    });
  };

  const handleAddSecondCarItem = (section) => {
    if (!isFullyEditable) return;
    let newItem;
    if (section === "secondCarItems") {
      newItem = {
        id: `${section}-${Date.now()}`,
        description: "",
        unit: "",
        quantity: "",
        rate: "",
        amount: "",
        product: "",
      };
    } else {
      newItem = {
        id: `${section}-${Date.now()}`,
        description: "",
        unit: "",
        quantity: "",
        rate: "",
        amount: "",
      };
    }
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], newItem],
    }));
  };

  const handleRemoveSecondCarItem = (itemId, section) => {
    if (!isFullyEditable) return;
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== itemId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const apiUrl = "https://nlfs.in/erp/index.php/Nlf_Erp/add_quotation";

      const filledItemGroups = getFilledItemGroups(formData.itemGroups);

      if (filledItemGroups.length === 0) {
        alert(
          "Please complete at least one item with:\n- Brand & Product selection\n- Unit\n- Quantity (greater than 0)\n- Rate (greater than 0)"
        );
        setIsSubmitting(false);
        return;
      }

      const itemsArray = buildItemsArray(filledItemGroups);

      // === EDIT MODE ===
      if (isEditMode) {
        // 🔴 CASE 1: RATE NOT APPROVED YET → simple update of existing iteration
        if (!isRateApproved) {
          const quoteNo =
            formData.quotationNo ||
            baseQuoteId ||
            formData.quotationId ||
            "";

          const quotationData = {
            quote_no: quoteNo,
            name: formData.customerName,
            date: formData.date,
            city: formData.customerCity,
            project: formData.project,
            branch: formData.officeBranch,
              quote_type: formData.quoteType, // "lead" | "direct"
            revise: "",
            status: "draft",
            admin_approval: "No",
            terms: editorData,
            total: totals.grandTotal.toFixed(2),
            items: itemsArray,
          };

          console.log(
            "Updating existing DRAFT quotation (no revision yet):",
            quotationData
          );

          const response = await axios.post(apiUrl, quotationData, {
            headers: { "Content-Type": "application/json" },
          });

          const isSuccess =
            response.data.status === true ||
            response.data.status === "true" ||
            response.data.success === true ||
            response.data.success === "1";

          if (isSuccess) {
            alert(
              `Draft quotation updated successfully! Quote No: ${quoteNo}`
            );
            setTimeout(() => {
              navigate("/clients", { replace: true });
            }, 100);
          } else {
            alert(
              `Failed to update quotation: ${
                response.data.message || "Please try again."
              }`
            );
          }
        }
        // ✅ CASE 2: RATE APPROVED → create a NEW REVISION (R1 / R2 ...)
        else {
          if (!formData.revise || formData.revise === "") {
            alert(
              "Please select a revision number before saving the revised quotation."
            );
            setIsSubmitting(false);
            return;
          }

          const quoteNo = `${baseQuoteId}-${formData.revise}`;

          const quotationData = {
            quote_id: baseQuoteId,
            quote_no: quoteNo,
            name: formData.customerName,
            date: formData.date,
            city: formData.customerCity,
            project: formData.project,
            branch: formData.officeBranch,
            revise: formData.revise,
            status: formData.isApproved ? "approved" : "revise",
            admin_approval: formData.isApproved ? "Yes" : "No",
            terms: editorData,
            total: totals.grandTotal.toFixed(2),
            items: itemsArray,
          };

          console.log(`Sending REVISION data to ADD API:`, quotationData);
          const response = await axios.post(apiUrl, quotationData, {
            headers: { "Content-Type": "application/json" },
          });

          const isSuccess =
            response.data.status === true ||
            response.data.status === "true" ||
            response.data.success === true ||
            response.data.success === "1";

          if (isSuccess) {
            alert(
              `Quotation revision saved successfully! Quote No: ${quoteNo}`
            );
            if (formData.isApproved) {
              console.log("Converting to PO...");
            }
            setTimeout(() => {
              navigate("/clients", { replace: true });
            }, 100);
          } else {
            alert(
              `Failed to save quotation revision: ${
                response.data.message || "Please try again."
              }`
            );
          }
        }
      }
      // === ADD MODE (brand new quotation) ===
      else {
        const quoteNo = formData.quotationId;

        console.log(`Total items being sent: ${itemsArray.length}`, itemsArray);
        const quotationData = {
          quote_no: quoteNo,
          name: formData.customerName,
          date: formData.date,
          city: formData.customerCity,
          project: formData.project,
          branch: formData.officeBranch,
          revise: "",
          status: "draft",
          admin_approval: "No",
          terms: editorData,
          total: totals.grandTotal.toFixed(2),
          items: itemsArray,
            commercialTerms: formData.commercialTerms,

        };

        console.log(
          `Sending data to ADD API:`,
          JSON.stringify(quotationData, null, 2)
        );
        const response = await axios.post(apiUrl, quotationData, {
          headers: { "Content-Type": "application/json" },
        });

        console.log("API Response:", response.data);
        const isSuccess =
          response.data.status === true ||
          response.data.status === "true" ||
          response.data.success === true ||
          response.data.success === "1";

        if (isSuccess) {
          alert(`Quotation saved successfully! Quote No: ${quoteNo}`);
          setTimeout(() => {
            navigate("/clients", { replace: true });
          }, 100);
        } else {
          console.error("API returned error:", response.data);
          alert(
            `Failed to save quotation: ${
              response.data.message || "Please try again."
            }`
          );
        }
      }
    } catch (error) {
      console.error("Error submitting quotation:", error);
      alert(
        `An error occurred: ${
          error.response?.data?.message || error.message || "Please try again."
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/clients");
  };

  // === UI Title ===
  let pageTitle = "New Quotation";
  if (isEditMode) {
    pageTitle = isViewOnly ? "View Quotation" : "Edit Quotation";
  } else if (isViewOnly) {
    pageTitle = "View Quotation";
  }

  // Show loading state
  if (
    isLoadingData ||
    isLoadingQuoteNumber ||
    isLoadingBranches ||
    isLoadingUnits ||
    isLoadingMasterItems
  ) {
    let message = "Loading...";
    if (isLoadingData) message = "Loading quotation data...";
    else if (isLoadingQuoteNumber) message = "Generating new quote number...";
    else if (isLoadingMasterItems)
      message = "Loading product / rate master list...";
    else if (isLoadingBranches) message = "Loading branches...";
    else if (isLoadingUnits) message = "Loading units...";

    return (
      <Container fluid className="my-4 text-center">
        <Spinner animation="border" role="status" style={{ color: "#ed3131" }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">{message}</p>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container fluid className="my-4">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate("/clients")}>
            Back to Clients
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="my-4">
      <Link to="/clients">
        <Button
          className="mb-3 btn btn-primary"
          style={{ backgroundColor: "rgb(237, 49, 49)", border: "none" }}
        >
          <FaArrowLeft />
        </Button>
      </Link>
      <Form onSubmit={handleSubmit}>
        {/* Quote Type Selection */}
<Card className="mb-4">
  <Card.Body>
    <Form.Group>
      <Form.Label className="fw-bold">
        Quote Type
      </Form.Label>

      <div className="d-flex gap-4 mt-2">
        <Form.Check
          type="radio"
          label="Lead"
          name="quoteType"
          value="lead"
          checked={formData.quoteType === "lead"}
          onChange={handleMainFormChange}
          disabled={!isFullyEditable}
        />

        <Form.Check
          type="radio"
          label="New"
          name="quoteType"
          value="direct"
          checked={formData.quoteType === "direct"}
          onChange={handleMainFormChange}
          disabled={!isFullyEditable}
        />
      </div>

      
    </Form.Group>
  </Card.Body>
</Card>

        <Row>
          {/* Card 1: Quotation Details */}
          <Col md="12">
            <Card className="mb-4">
              <Card.Header>
                <Card.Title as="h4">{pageTitle}</Card.Title>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Quote No.</Form.Label>
                      <Form.Control
                        type="text"
                        name="quotationId"
                        value={baseQuoteId || formData.quotationId}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleMainFormChange}
                        readOnly={!isFullyEditable}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Client Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleMainFormChange}
                        readOnly={!isFullyEditable}
                        required
                        style={{ textTransform: "capitalize" }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="customerCity"
                        value={formData.customerCity}
                        onChange={handleMainFormChange}
                        readOnly={!isFullyEditable}
                        required
                        style={{ textTransform: "capitalize" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Project Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="project"
                        value={formData.project}
                        onChange={handleMainFormChange}
                        readOnly={!isFullyEditable}
                        required
                        style={{ textTransform: "capitalize" }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Branch</Form.Label>
                      {isLoadingBranches ? (
                        <Form.Control
                          type="text"
                          value="Loading branches..."
                          readOnly
                        />
                      ) : (
                        <Form.Control
                          as="select"
                          name="officeBranch"
                          value={formData.officeBranch}
                          onChange={handleMainFormChange}
                          disabled={!isFullyEditable}
                        >
                          {branchList.map((branch) => (
                            <option key={branch.id} value={branch.branch_name}>
                              {branch.branch_name}
                            </option>
                          ))}
                        </Form.Control>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Revision + Approval section */}
                {isEditMode && isRateApproved && (
                  <Row>
                    <Col md="4">
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Revision <span style={{ color: "red" }}>*</span>
                        </Form.Label>
                        <Form.Control
                          as="select"
                          name="revise"
                          value={formData.revise}
                          onChange={handleMainFormChange}
                          disabled={!isFullyEditable}
                          required
                        >
                          <option value="">Select Revision</option>
                          {reviseOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Control>
                        <Form.Text className="text-muted">
                          Select revision number (compulsory once rate is
                          approved)
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md="4">
                      <Form.Group className="mb-3">
                        <Form.Label>New Quote Number</Form.Label>
                        <Form.Control
                          type="text"
                          value={
                            baseQuoteId && formData.revise
                              ? `${baseQuoteId}-${formData.revise}`
                              : formData.quotationNo || ""
                          }
                          readOnly
                          style={{
                            backgroundColor: "#e9ecef",
                            fontWeight: "600",
                            color: "#495057",
                            fontSize: "1rem",
                          }}
                          placeholder="e.g., NLF-25-26-Q-13-R2"
                        />
                        <Form.Text className="text-muted">
                          Auto-generated from Quote ID + Revision
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Card 2: Grouped Items */}
          <Col md="12">
            <Card className="mb-4">
              <Card.Header>
                <Card.Title as="h4">Quotation Items</Card.Title>
              </Card.Header>
              <Card.Body>
                {formData.itemGroups.map((group) => {
                  const selectedBrand = group.brandId || group.brand || "";
                  const selectedProduct =
                    group.productId || group.product || "";

                  const productOptions = getProductOptions(selectedBrand);
                  const subProductOptions = getSubProductOptions(
                    selectedBrand,
                    selectedProduct
                  );

                  return (
                    <div key={group.id} className="border rounded p-3 mb-4">
                      <Row className="align-items-start mb-3">
                        <Col md="2">
                          <Form.Group>
                            <Form.Label>Brand</Form.Label>
                            {isLoadingMasterItems ? (
                              <Form.Control
                                type="text"
                                value="Loading..."
                                readOnly
                              />
                            ) : (
                              <Form.Control
                                as="select"
                                value={group.brandId || ""}
                                onChange={(e) =>
                                  handleItemChange(
                                    group.id,
                                    "brandId",
                                    e.target.value
                                  )
                                }
                                disabled={!isFullyEditable}
                              >
                                <option value="">Select Brand</option>
                                {brandOptions.map((b) => (
                                  <option key={b} value={b}>
                                    {b}
                                  </option>
                                ))}
                              </Form.Control>
                            )}
                          </Form.Group>
                        </Col>
                        <Col md="2">
                          <Form.Group>
                            <Form.Label>Product</Form.Label>
                            {isLoadingMasterItems ? (
                              <Form.Control
                                type="text"
                                value="Loading..."
                                readOnly
                              />
                            ) : (
                              <Form.Control
                                as="select"
                                value={group.productId || ""}
                                onChange={(e) =>
                                  handleItemChange(
                                    group.id,
                                    "productId",
                                    e.target.value
                                  )
                                }
                                disabled={!isFullyEditable || !selectedBrand}
                              >
                                <option value="">Select Product</option>
                                {productOptions.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </Form.Control>
                            )}
                          </Form.Group>
                        </Col>
                        <Col md="2">
                          <Form.Group>
                            <Form.Label>Sub Product</Form.Label>
                            {isLoadingMasterItems ? (
                              <Form.Control
                                type="text"
                                value="Loading..."
                                readOnly
                              />
                            ) : (
                              <Form.Control
                                as="select"
                                value={group.subProductId || ""}
                                onChange={(e) =>
                                  handleItemChange(
                                    group.id,
                                    "subProductId",
                                    e.target.value
                                  )
                                }
                                disabled={!isFullyEditable || !selectedProduct}
                              >
                                <option value="">Select Sub Product</option>
                                {subProductOptions.map((sp) => (
                                  <option key={sp.id} value={sp.id}>
                                    {sp.item_name}
                                  </option>
                                ))}
                              </Form.Control>
                            )}
                          </Form.Group>
                        </Col>
                        <Col md="6">
                          <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={group.description}
                              onChange={(e) =>
                                handleItemChange(
                                  group.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              readOnly={!isFullyEditable}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="mb-3">
                        <Col md="3">
                          <Form.Group>
                            <Form.Label>Unit</Form.Label>
                            {isLoadingUnits ? (
                              <Form.Control
                                type="text"
                                value="Loading..."
                                readOnly
                              />
                            ) : (
                              <Form.Control
                                as="select"
                                value={group.unit}
                                onChange={(e) =>
                                  handleItemChange(
                                    group.id,
                                    "unit",
                                    e.target.value
                                  )
                                }
                                disabled={!isFullyEditable}
                              >
                                <option value="">Select Unit</option>
                                {unitList.map((unit) => (
                                  <option key={unit.unit_id} value={unit.unit}>
                                    {unit.unit}
                                  </option>
                                ))}
                              </Form.Control>
                            )}
                          </Form.Group>
                        </Col>
                        <Col md="3">
                          <Form.Group>
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                              type="number"
                              value={group.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  group.id,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              readOnly={!isFullyEditable}
                            />
                          </Form.Group>
                        </Col>
                        <Col md="3">
                          <Form.Group>
                            <Form.Label>
                              Rate{" "}
                              {isEditMode && (
                                <span style={{ color: "green" }}></span>
                              )}
                            </Form.Label>
                            <Form.Control
                              type="number"
                              value={group.rate}
                              onChange={(e) =>
                                handleItemChange(
                                  group.id,
                                  "rate",
                                  e.target.value
                                )
                              }
                              readOnly={!isFullyEditable}
                              style={
                                isEditMode
                                  ? {
                                      borderColor: "#28a745",
                                      borderWidth: "2px",
                                    }
                                  : {}
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md="3">
                          <Form.Group>
                            <Form.Label>
                              Amount{" "}
                              {isEditMode && (
                                <span style={{ color: "green" }}></span>
                              )}
                            </Form.Label>
                            <Form.Control
                              type="number"
                              value={group.amount || 0}
                              readOnly
                              style={
                                isEditMode
                                  ? {
                                      borderColor: "#28a745",
                                      borderWidth: "2px",
                                    }
                                  : {}
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="mt-3 pt-3 border-top">
                        <Card.Title className="mb-4">Installation</Card.Title>
                        <Col md="3">
                          <Form.Group>
                            <Form.Label>Unit</Form.Label>
                            {isLoadingUnits ? (
                              <Form.Control
                                type="text"
                                value="Loading..."
                                readOnly
                              />
                            ) : (
                              <Form.Control
                                as="select"
                                value={group.installationUnit}
                                onChange={(e) =>
                                  handleItemChange(
                                    group.id,
                                    "installationUnit",
                                    e.target.value
                                  )
                                }
                                disabled={!isFullyEditable}
                              >
                                <option value="">Select Unit</option>
                                {unitList.map((unit) => (
                                  <option key={unit.unit_id} value={unit.unit}>
                                    {unit.unit}
                                  </option>
                                ))}
                              </Form.Control>
                            )}
                          </Form.Group>
                        </Col>
                        <Col md="3">
                          <Form.Group>
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                              type="number"
                              value={group.installationQuantity}
                              onChange={(e) =>
                                handleItemChange(
                                  group.id,
                                  "installationQuantity",
                                  e.target.value
                                )
                              }
                              readOnly={!isFullyEditable}
                            />
                          </Form.Group>
                        </Col>
                        <Col md="3">
                          <Form.Group>
                            <Form.Label>
                              Rate{" "}
                              {isEditMode && (
                                <span style={{ color: "green" }}>)</span>
                              )}
                            </Form.Label>
                            <Form.Control
                              type="number"
                              value={group.installationRate}
                              onChange={(e) =>
                                handleItemChange(
                                  group.id,
                                  "installationRate",
                                  e.target.value
                                )
                              }
                              readOnly={!isFullyEditable}
                              style={
                                isEditMode
                                  ? {
                                      borderColor: "#28a745",
                                      borderWidth: "2px",
                                    }
                                  : {}
                              }
                            />
                          </Form.Group>
                        </Col>
                        <Col md="3">
                          <Form.Group>
                            <Form.Label>
                              Amount{" "}
                              {isEditMode && (
                                <span style={{ color: "green" }}></span>
                              )}
                            </Form.Label>
                            <Form.Control
                              type="number"
                              value={group.installationAmount || 0}
                              readOnly
                              style={
                                isEditMode
                                  ? {
                                      borderColor: "#28a745",
                                      borderWidth: "2px",
                                    }
                                  : {}
                              }
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="mt-3">
                        <Col>
                          {isFullyEditable &&
                            formData.itemGroups.length > 1 && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleRemoveItemGroup(group.id)
                                }
                              >
                                <FaMinus />
                              </Button>
                            )}
                        </Col>
                      </Row>
                    </div>
                  );
                })}
                {isFullyEditable && (
                  <div className="d-flex justify-content-start">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddItemGroup}
                    >
                      <FaPlus /> Add Item
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Terms & Conditions */}
          <Col md="12">
            <Card className="mb-4">
              <Card.Header>
                <Card.Title as="h4">Terms & Conditions</Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <small
                    className={
                      characterCount > MAX_CHARACTER_LIMIT
                        ? "text-danger"
                        : "text-muted"
                    }
                  >
                    Characters: {characterCount} / {MAX_CHARACTER_LIMIT}
                  </small>
                </div>
                <CKEditor
                  editor={ClassicEditor}
                  data={editorData}
                  onReady={(editor) => {
                    editorRef.current = editor;
                    setCharacterCount(editor.getData().length);
                  }}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setEditorData(data);
                    setCharacterCount(data.length);
                    if (data.length > MAX_CHARACTER_LIMIT) {
                      setEditorError(true);
                    } else {
                      setEditorError(false);
                    }
                  }}
                  disabled={!isFullyEditable}
                />
                {editorError && (
                  <p className="text-danger mt-2">
                    Warning: Terms content exceeds the maximum character limit (
                    {MAX_CHARACTER_LIMIT}). This may result in truncation when
                    saving.
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Totals & Submit */}
          <Col>
            <div className="d-flex justify-content-end">
              <Card className="w-100">
                <Card.Body>
                  <div className="d-flex justify-content-end mb-2">
                    <strong className="me-2">Basic Amount:</strong>
                    <span>₹{totals.basicAmount.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-end mb-2">
                    <strong className="me-2">GST (18%):</strong>
                    <span>₹{totals.gst.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-end">
                    <h4 className="me-2">Total:</h4>
                    <h6>₹{totals.grandTotal.toLocaleString()}</h6>
                  </div>
                  <div className="d-flex justify-content-end mt-5 gap-3">
                    {!isViewOnly && (
                      <Button
                        className="btn"
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: "#ed3131",
                          border: "none",
                          height: "40px",
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            {isEditMode ? "Updating..." : "Saving..."}
                          </>
                        ) : isEditMode ? (
                          isRateApproved ? (
                            "Save Revision"
                          ) : (
                            "Update Quotation"
                          )
                        ) : (
                          "Save Quotation"
                        )}
                      </Button>
                    )}
                    <Button
                      className="btn me-2"
                      type="button"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      style={{
                        backgroundColor: "#adb5bd",
                        border: "none",
                        height: "40px",
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}
