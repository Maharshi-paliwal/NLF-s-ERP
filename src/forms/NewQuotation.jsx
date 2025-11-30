// src/forms/NewQuotation.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import { FaPlus, FaMinus, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Standard Terms & Conditions
const standardTerms = `• GST 18% as actual
• Payment 50% advance with formal work order and 50% on readiness of material before dispatch.
• Transportation charges Extra.
• Unloading of material at clients end.
• The above rates does not include any MS/Aluminium substructure required.
• Safe storage for material to be provided by you at site with a locked room.
• Providing & Fixing of Scaffolding should be at your end.
• Mode of Measurement: Measurements shall be wall to wall.
• Local transportation, loading & unloading of material from one area to another area on site at your end.
• Suitable accommodation for site Engineer & hutment for labour to be provided by client along with lodging & boarding.
• Validity of Quotation: 30 days.
Hope you will find our offer most competitive and in order.`;

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
      productId: "", // Product ID (prod_id)
      brand: "", // Brand name
      brandId: "", // Brand ID
      subProduct: "", // Sub-product name
      subProductId: "", // Sub-product ID
      installationDescription: "",
      installationUnit: "",
      installationQuantity: "",
      installationRate: "",
      installationAmount: "",
    },
  ],
  commercialTerms: {
    gst: "As applicable",
    supplyTerms: "",
    installationTerms: "",
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
    { id: `sc-addl-${Date.now() + 2}`, description: "", unit: "", quantity: "", rate: "", amount: "" },
  ],
  revise: "", // No revision initially
  isApproved: false, // Track approval status
};

export default function NewQuotation() {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editorRef = useRef(null);

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
  const [productList, setProductList] = useState([]); // Store products from API
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [subProductList, setSubProductList] = useState([]); // Store sub-products from API
  const [isLoadingSubProducts, setIsLoadingSubProducts] = useState(true);
  const [branchList, setBranchList] = useState([]); // Store branches from API
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [brandList, setBrandList] = useState([]); // Store brands from API
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);

  // Initialize editor data when formData changes
  useEffect(() => {
    if (formData.termsAndConditions !== editorData) {
      setEditorData(formData.termsAndConditions);
    }
  }, [formData.termsAndConditions]);

  // Update quotation number when revise changes (only in edit mode)
  useEffect(() => {
    if (isEditMode && baseQuoteId && formData.revise) {
      const quotationNo = `${baseQuoteId}-${formData.revise}`;
      setFormData((prev) => {
        // Only update if the value actually changed
        if (prev.quotationNo !== quotationNo) {
          return { ...prev, quotationNo };
        }
        return prev;
      });
    } else if (isNewQuotation && baseQuoteId) {
      // For new quotations, just use the base quote ID without revision
      setFormData((prev) => {
        if (prev.quotationNo !== baseQuoteId) {
          return { ...prev, quotationNo: baseQuoteId };
        }
        return prev;
      });
    }
  }, [baseQuoteId, formData.revise, isEditMode, isNewQuotation]);

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
          // Set the first branch as default if no branch is selected
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
  }, []);

  // Fetch brand list from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoadingBrands(true);
        const response = await axios.post(
          "https://nlfs.in/erp/index.php/Api/list_brand",
          {
            nxt_visit_date: "1-09-2030",
            emp_id: "3",
            lead_id: "35",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.status === "true" && response.data.data) {
          setBrandList(response.data.data);
        } else {
          setError("Failed to load brands.");
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
        setError("Failed to load brand list.");
      } finally {
        setIsLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // ✅ Fetch product list from API USING SAME PARAMS AS IN SCREENSHOT
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await axios.post(
          "https://nlfs.in/erp/index.php/Api/list_mst_product",
          {
            nxt_visit_date: "1-09-2030",
            emp_id: "3",
            lead_id: "35",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data;
        const statusTrue = data.status === true || data.status === "true";
        const successTrue = data.success === true || data.success === "1";

        if (statusTrue && successTrue && data.data) {
          setProductList(data.data);
        } else {
          setError("Failed to load products.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Error fetching products.");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
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

  // Fetch sub-product list from API (matching SubProduct.jsx implementation)
  useEffect(() => {
    const fetchSubProducts = async () => {
      setIsLoadingSubProducts(true);
      try {
        const res = await fetch(
          "https://nlfs.in/erp/index.php/Api/list_mst_sub_product",
          {
            method: "POST",
          }
        );
        const data = await res.json();

        if (data.status === "true" && data.success === "1") {
          setSubProductList(data.data);
        } else {
          setError("Failed to fetch sub-products.");
        }
      } catch (err) {
        setError("Error fetching sub-products.");
      } finally {
        setIsLoadingSubProducts(false);
      }
    };
    fetchSubProducts();
  }, []);

  // Load data based on mode
  useEffect(() => {
    let isMounted = true;
    // If EDIT MODE or VIEW MODE - fetch data from API
    if ((isEditMode || isViewMode || isViewOnly) && quotationId) {
      const fetchQuotationData = async () => {
        try {
          setIsLoadingData(true);
          setError(null);
          console.log("Fetching quotation with ID:", quotationId);
          // Send as JSON (matching Postman format)
          const response = await axios.post(
            "https://nlfs.in/erp/index.php/Nlf_Erp/get_quotation_by_id",
            {
              quote_id: String(quotationId), // Convert to string like Postman
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Fetched quotation data for edit/view:", response.data);
          // FIXED: Check for both boolean and string status values
          const isSuccess =
            response.data.status === true ||
            response.data.status === "true";
          if (isMounted && isSuccess && response.data.data) {
            const quotationData = response.data.data;
            // Handle the API response structure correctly
            // The API returns a single object with an items array
            const mainQuotationData = quotationData;
            const itemsArray = mainQuotationData.items || [];

            // Transform API data to form structure with proper product/sub-product IDs
            const itemGroups = itemsArray.map((item, index) => {
              // Find matching product by name
              const productMatch = productList.find(
                (p) => p.product_name === item.product
              );
              // Find matching sub-product by name and product ID
              const subProductMatch = subProductList.find(
                (sp) =>
                  sp.sub_prod_name === item.sub_product &&
                  String(sp.prod_id) === String(productMatch?.prod_id)
              );

              return {
                id: `group-${Date.now()}-${index}`,
                quote_id: mainQuotationData.quote_id,
                description: item.desc || "",
                unit: item.unit || "",
                quantity: item.qty || "",
                rate: item.rate || "",
                amount: item.amt || "",
                product: item.product || "",
                productId: productMatch ? String(productMatch.prod_id) : "",
                brand: productMatch?.brand || "",
                brandId: productMatch?.brand_id || "",
                subProduct: item.sub_product || "",
                subProductId: subProductMatch ? String(subProductMatch.id) : "",
                installationDescription: "",
                installationUnit: item.unit || "",
                installationQuantity: item.qty || "",
                installationRate: item.inst_rate || "",
                installationAmount: item.inst_amt || "",
              };
            });

            // If no items in the array, create at least one item group with the main data
            if (itemGroups.length === 0) {
              itemGroups.push({
                id: `group-${Date.now()}`,
                quote_id: mainQuotationData.quote_id,
                description: mainQuotationData.desc || "",
                unit: mainQuotationData.unit || "",
                quantity: mainQuotationData.qty || "",
                rate: mainQuotationData.rate || "",
                amount: mainQuotationData.amt || "",
                product: mainQuotationData.product || "",
                productId: "",
                brand: "",
                brandId: "",
                subProduct: mainQuotationData.sub_product || "",
                subProductId: "",
                installationDescription: "",
                installationUnit: mainQuotationData.inst_unit || "",
                installationQuantity: mainQuotationData.inst_qty || "",
                installationRate: mainQuotationData.inst_rate || "",
                installationAmount: mainQuotationData.inst_amt || "",
              });
            }

            // Extract base quote ID (without revise suffix)
            const quoteId = mainQuotationData.quote_id || "";
            // Split by the last occurrence of -R to get base ID
            const baseId = quoteId.includes("-R")
              ? quoteId.substring(0, quoteId.lastIndexOf("-R"))
              : quoteId;
            // Format the base ID to ensure it's in NLF-YY-YY-Q-XX format
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
              termsAndConditions: mainQuotationData.terms || standardTerms,
              itemGroups: itemGroups,
              commercialTerms: {
                gst: "As applicable",
                supplyTerms: "",
                installationTerms: "",
              },
              secondCarItems: initialFormState.secondCarItems,
              secondCarAdditionalDetails:
                initialFormState.secondCarAdditionalDetails,
              revise: mainQuotationData.revise || "R1",
              isApproved:
                mainQuotationData.status === "approved" ||
                mainQuotationData.admin_approval === "Yes",
            };
            setFormData(updatedFormData);
            setEditorData(updatedFormData.termsAndConditions); // Update editor data separately
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
      // Fetch next quote number for edit mode
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
    }
    // If NEW QUOTATION - fetch new ID from API
    else if (isNewQuotation) {
      const fetchNewQuoteNumber = async () => {
        try {
          setIsLoadingQuoteNumber(true);
          const nextQuoteNumber = await fetchNextQuoteNumber();
          if (isMounted) {
            setBaseQuoteId(nextQuoteNumber);
            setFormData((prev) => ({
              ...prev,
              quotationId: nextQuoteNumber,
              quotationNo: nextQuoteNumber, // Initial quote number WITHOUT revision
              date: new Date().toISOString().split("T")[0],
              officeBranch:
                branchList.length > 0 ? branchList[0].branch_name : "",
              revise: "", // No revision for new quotation
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
    productList,
    subProductList,
    branchList,
  ]);

  const handleMainFormChange = (e) => {
    if (!isFullyEditable) return;
    const { name, value } = e.target;
    console.log("handleMainFormChange:", name, value); // Debug log
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (groupId, field, value) => {
    if (!isFullyEditable) return;
    setFormData((prev) => {
      const updatedGroups = prev.itemGroups.map((group) => {
        if (group.id === groupId) {
          const newItem = { ...group, [field]: value };

          // Handle sub-product selection
          if (field === "subProductId" && value) {
            const selectedSubProduct = subProductList.find(
              (sp) => sp.id === value
            );
            if (selectedSubProduct) {
              newItem.subProduct = selectedSubProduct.sub_prod_name;
              if (selectedSubProduct.description) {
                newItem.description = selectedSubProduct.description;
              }
            }
          }

          // Handle product selection - reset sub-product when product changes
          if (field === "productId") {
            newItem.subProduct = "";
            newItem.subProductId = "";
            newItem.description = "";

            // If a product was selected, keep the name
            if (value) {
              const selectedProduct = productList.find(
                (p) => p.prod_id === value
              );
              if (selectedProduct) {
                newItem.product = selectedProduct.product_name;
                // Also set the brand if available
                if (selectedProduct.brand_id) {
                  newItem.brandId = selectedProduct.brand_id;
                  const brandMatch = brandList.find(
                    (b) => b.brand_id === selectedProduct.brand_id
                  );
                  if (brandMatch) {
                    newItem.brand = brandMatch.brand_name;
                  }
                }
              }
            } else {
              // If cleared, clear the product name too
              newItem.product = "";
            }
          }

          // Handle brand selection - reset product and sub-product when brand changes
          if (field === "brandId") {
            newItem.product = "";
            newItem.productId = "";
            newItem.subProduct = "";
            newItem.subProductId = "";
            newItem.description = "";

            // If a brand was selected, keep the name
            if (value) {
              const selectedBrand = brandList.find(
                (b) => b.brand_id === value
              );
              if (selectedBrand) {
                newItem.brand = selectedBrand.brand_name;
              }
            } else {
              // If cleared, clear the brand name too
              newItem.brand = "";
            }
          }

          // Amount calculations
          if (field === "quantity" || field === "rate") {
            const q = parseFloat(newItem.quantity) || 0;
            const r = parseFloat(newItem.rate) || 0;
            newItem.amount = (q * r).toString();
          }

          if (field === "unit") {
            newItem.installationUnit = value;
          }

          if (field === "quantity") {
            newItem.installationQuantity = value;
          }

          if (field === "installationQuantity" || field === "installationRate") {
            const q = parseFloat(newItem.installationQuantity) || 0;
            const r = parseFloat(newItem.installationRate) || 0;
            newItem.installationAmount = (q * r).toString();
          }

          return newItem;
        }
        return group;
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
      productId: "", // Add this field
      brand: "", // Add brand field
      brandId: "", // Add brand ID field
      subProduct: "",
      subProductId: "", // Add this field
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
        product: "", // Will be populated from API
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
      // ALWAYS use ADD API for both new quotations and revisions
      const apiUrl = "https://nlfs.in/erp/index.php/Nlf_Erp/add_quotation";

      // Prepare data for API
      if (isEditMode) {
        // Validate revision is selected
        if (!formData.revise || formData.revise === "") {
          alert("Please select a revision number before updating the quotation.");
          setIsSubmitting(false);
          return;
        }
        // Edit mode (Revision) - Create new quote_no by concatenating baseQuoteId with revise
        const quoteNo = `${baseQuoteId}-${formData.revise}`;

        const filledItemGroups = formData.itemGroups.filter((group) => {
          const hasProduct = group.product && group.product.trim() !== "";
          const hasQuantity =
            group.quantity && parseFloat(group.quantity) > 0;
          const hasRate = group.rate && parseFloat(group.rate) > 0;
          const hasUnit = group.unit && group.unit.trim() !== "";
          return hasProduct && hasQuantity && hasRate && hasUnit;
        });

        if (filledItemGroups.length === 0) {
          alert(
            "Please complete at least one item with:\n- Product selection\n- Unit\n- Quantity (greater than 0)\n- Rate (greater than 0)"
          );
          setIsSubmitting(false);
          return;
        }

        const calculateAmount = (qty, rate) => {
          const quantity = parseFloat(qty) || 0;
          const rateVal = parseFloat(rate) || 0;
          return (quantity * rateVal).toFixed(2);
        };

        const itemsArray = filledItemGroups.map((group) => {
          const itemAmount =
            group.amount || calculateAmount(group.quantity, group.rate);
          const instAmount =
            group.installationAmount ||
            calculateAmount(
              group.installationQuantity,
              group.installationRate
            );
          return {
            product: group.product,
            sub_product: group.subProduct || "",
            desc: group.description || "",
            unit: group.unit,
            qty: group.quantity,
            rate: group.rate,
            amt: itemAmount,
            inst_unit: group.installationUnit || group.unit,
            inst_qty: group.installationQuantity || "0",
            inst_rate: group.installationRate || "0",
            inst_amt: instAmount,
            total: (
              parseFloat(itemAmount) + parseFloat(instAmount)
            ).toFixed(2),
          };
        });

        const quotationData = {
          quote_id: baseQuoteId, // Keep the original quote_id (e.g., NLF-25-26-Q-0013)
          quote_no: quoteNo, // New quote_no with revision (e.g., NLF-25-26-Q-13-R2)
          name: formData.customerName,
          date: formData.date,
          city: formData.customerCity,
          project: formData.project,
          branch: formData.officeBranch,
          revise: formData.revise,
          status: formData.isApproved ? "approved" : "revise", // Set status to "revise" for revisions
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
          alert(`Quotation revision saved successfully! Quote No: ${quoteNo}`);
          // If approved, convert to PO
          if (formData.isApproved) {
            // TODO: Call PO conversion API here
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
      } else {
        // Add mode logic - Use quote_id as quote_no (no revision for first time)
        const quoteNo = formData.quotationId; // Just the base ID, no revision

        const filledItemGroups = formData.itemGroups.filter((group) => {
          const hasProduct = group.product && group.product.trim() !== "";
          const hasQuantity =
            group.quantity && parseFloat(group.quantity) > 0;
          const hasRate = group.rate && parseFloat(group.rate) > 0;
          const hasUnit = group.unit && group.unit.trim() !== "";
          return hasProduct && hasQuantity && hasRate && hasUnit;
        });

        if (filledItemGroups.length === 0) {
          alert(
            "Please complete at least one item with:\n- Product selection\n- Unit\n- Quantity (greater than 0)\n- Rate (greater than 0)"
          );
          setIsSubmitting(false);
          return;
        }

        const calculateAmount = (qty, rate) => {
          const quantity = parseFloat(qty) || 0;
          const rateVal = parseFloat(rate) || 0;
          return (quantity * rateVal).toFixed(2);
        };

        const itemsArray = filledItemGroups.map((group) => {
          const itemAmount =
            group.amount || calculateAmount(group.quantity, group.rate);
          const instAmount =
            group.installationAmount ||
            calculateAmount(
              group.installationQuantity,
              group.installationRate
            );
          return {
            product: group.product,
            sub_product: group.subProduct || "",
            desc: group.description || "",
            unit: group.unit,
            qty: group.quantity,
            rate: group.rate,
            amt: itemAmount,
            inst_unit: group.installationUnit || group.unit,
            inst_qty: group.installationQuantity || "0",
            inst_rate: group.installationRate || "0",
            inst_amt: instAmount,
            total: (
              parseFloat(itemAmount) + parseFloat(instAmount)
            ).toFixed(2),
          };
        });

        console.log(`Total items being sent: ${itemsArray.length}`, itemsArray);
        const quotationData = {
          quote_no: quoteNo,
          name: formData.customerName,
          date: formData.date,
          city: formData.customerCity,
          project: formData.project,
          branch: formData.officeBranch,
          revise: "", // No revision for first time creation
          status: "draft",
          admin_approval: "No",
          terms: editorData,
          total: totals.grandTotal.toFixed(2),
          items: itemsArray,
        };

        console.log(
          `Sending data to ADD API:`,
          JSON.stringify(quotationData, null, 2)
        );
        const response = await axios.post(apiUrl, quotationData, {
          headers: { "Content-Type": "application/json" },
        });

        console.log("API Response:", response.data);
        // FIXED: Check for both boolean and string status values
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
    isLoadingProducts ||
    isLoadingSubProducts ||
    isLoadingBranches ||
    isLoadingBrands
  ) {
    return (
      <Container fluid className="my-4 text-center">
        <Spinner animation="border" role="status" style={{ color: "#ed3131" }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">
          {isLoadingData
            ? "Loading quotation data..."
            : isLoadingQuoteNumber
            ? "Generating new quote number..."
            : isLoadingProducts || isLoadingSubProducts
            ? "Loading products and sub-products..."
            : isLoadingBranches
            ? "Loading branches..."
            : isLoadingBrands
            ? "Loading brands..."
            : "Loading..."}
        </p>
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
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleMainFormChange}
                        readOnly={!isFullyEditable}
                        required
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
                            <option
                              key={branch.id}
                              value={branch.branch_name}
                            >
                              {branch.branch_name}
                            </option>
                          ))}
                        </Form.Control>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                {/* Revision dropdown - COMPULSORY in edit mode */}
                {isEditMode && (
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
                          Select revision number (compulsory for updates)
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
                    <Col md="4">
                      <Form.Group className="mb-3">
                        <Form.Label>Approval Status</Form.Label>
                        <Form.Check
                          type="checkbox"
                          label="Approve & Convert to PO"
                          name="isApproved"
                          checked={formData.isApproved}
                          onChange={(e) => {
                            if (!isFullyEditable) return;
                            setFormData((prev) => ({
                              ...prev,
                              isApproved: e.target.checked,
                            }));
                          }}
                          disabled={!isFullyEditable}
                          style={{ marginTop: "8px" }}
                        />
                        <Form.Text className="text-muted">
                          Check to approve and convert to Purchase Order
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
                {formData.itemGroups.map((group) => (
                  <div key={group.id} className="border rounded p-3 mb-4">
                    <Row className="align-items-start mb-3">
                      <Col md="2">
                        <Form.Group>
                          <Form.Label>Brand</Form.Label>
                          {isLoadingBrands ? (
                            <Form.Control type="text" value="Loading..." readOnly />
                          ) : (
                            <Form.Control
                              as="select"
                              value={group.brandId || ""}
                              onChange={(e) =>
                                handleItemChange(group.id, "brandId", e.target.value)
                              }
                              disabled={!isFullyEditable}
                            >
                              <option value="">Select Brand</option>
                              {brandList.map((brand) => (
                                <option key={brand.brand_id} value={brand.brand_id}>
                                  {brand.brand_name}
                                </option>
                              ))}
                            </Form.Control>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md="2">
                        <Form.Group>
                          <Form.Label>Product</Form.Label>
                          {isLoadingProducts ? (
                            <Form.Control type="text" value="Loading..." readOnly />
                          ) : (
                            <Form.Control
                              as="select"
                              value={group.productId || ""}
                              onChange={(e) =>
                                handleItemChange(group.id, "productId", e.target.value)
                              }
                              disabled={!isFullyEditable /* || !group.brandId */}
                            >
                              <option value="">Select Product</option>
                              {productList
                                // if API also sends brand_id, you can re-enable this filter:
                                // .filter(
                                //   (p) =>
                                //     !group.brandId ||
                                //     String(p.brand_id) === String(group.brandId)
                                // )
                                .map((product) => (
                                  <option
                                    key={product.prod_id}
                                    value={product.prod_id}
                                  >
                                    {product.product_name}
                                  </option>
                                ))}
                            </Form.Control>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md="2">
                        <Form.Group>
                          <Form.Label>Sub Product</Form.Label>
                          {isLoadingSubProducts ? (
                            <Form.Control type="text" value="Loading..." readOnly />
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
                              disabled={!isFullyEditable || !group.productId}
                            >
                              <option value="">Select Sub Product</option>
                              {subProductList
                                .filter(
                                  (sp) =>
                                    String(sp.prod_id) === String(group.productId)
                                )
                                .map((subProd) => (
                                  <option key={subProd.id} value={subProd.id}>
                                    {subProd.sub_prod_name}
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
                              handleItemChange(group.id, "description", e.target.value)
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
                            <Form.Control type="text" value="Loading..." readOnly />
                          ) : (
                            <Form.Control
                              as="select"
                              value={group.unit}
                              onChange={(e) =>
                                handleItemChange(group.id, "unit", e.target.value)
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
                              handleItemChange(group.id, "quantity", e.target.value)
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
                              <span style={{ color: "green" }}>(Editable)</span>
                            )}
                          </Form.Label>
                          <Form.Control
                            type="number"
                            value={group.rate}
                            onChange={(e) =>
                              handleItemChange(group.id, "rate", e.target.value)
                            }
                            readOnly={!isFullyEditable}
                            style={
                              isEditMode
                                ? { borderColor: "#28a745", borderWidth: "2px" }
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
                              <span style={{ color: "green" }}>
                                (Auto-calculated)
                              </span>
                            )}
                          </Form.Label>
                          <Form.Control
                            type="number"
                            value={group.amount || 0}
                            readOnly
                            style={
                              isEditMode
                                ? { backgroundColor: "#d4edda" }
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
                            <Form.Control type="text" value="Loading..." readOnly />
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
                              <span style={{ color: "green" }}>(Editable)</span>
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
                                ? { borderColor: "#28a745", borderWidth: "2px" }
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
                              <span style={{ color: "green" }}>
                                (Auto-calculated)
                              </span>
                            )}
                          </Form.Label>
                          <Form.Control
                            type="number"
                            value={group.installationAmount || 0}
                            readOnly
                            style={
                              isEditMode
                                ? { backgroundColor: "#d4edda" }
                                : {}
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mt-3">
                      <Col>
                        {isFullyEditable && formData.itemGroups.length > 1 && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveItemGroup(group.id)}
                          >
                            <FaMinus /> Remove Item + Installation
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}
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
                <CKEditor
                  editor={ClassicEditor}
                  data={editorData}
                  onReady={(editor) => {
                    editorRef.current = editor;
                  }}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setEditorData(data);
                  }}
                  disabled={!isFullyEditable}
                />
                {editorError && (
                  <p className="text-danger mt-2">
                    Error loading editor. Please try again.
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
                          "Update Quotation"
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
