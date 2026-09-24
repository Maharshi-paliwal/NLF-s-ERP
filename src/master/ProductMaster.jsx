import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Card, Form, Button, Table, Alert, Badge, Spinner, Pagination } from "react-bootstrap";
import { FaPlus, FaTrash, FaArrowLeft, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://nlfs.in/erp/index.php/Api";
const ERP_BASE = "https://nlfs.in/erp/index.php/Erp";

const isOk = (val) => val === true || val === "true" || val === 1 || val === "1";

const ProductMaster = () => {
  // ---------- Data ----------
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [subProducts, setSubProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ---------- Add-mode ----------
  const [brandName, setBrandName] = useState("");
  const [productsList, setProductsList] = useState([]);
  const [newProductForm, setNewProductForm] = useState({
    productName: "",
    subProductName: "",
    subProductDescription: "",
    subProductRate: "",
    subProductUnit: "",
    subProductImage: null,
  });
  const [additionalSubForm, setAdditionalSubForm] = useState({
    productIndex: "",
    name: "",
    description: "",
    rate: "",
    unit: "",
    image: null,
  });
  const [existingSubImage, setExistingSubImage] = useState(null);
  const [editImage, setEditImage] = useState(null);

  // ---------- Workflow Step ----------
  const [workflowStep, setWorkflowStep] = useState("brand");

  // ---------- Brand/Product modes ----------
  const [useExistingBrand, setUseExistingBrand] = useState(false);
  const [existingBrandIdForAdd, setExistingBrandIdForAdd] = useState("");
  const [productMode, setProductMode] = useState("new");
  const [existingProdIdForAdd, setExistingProdIdForAdd] = useState("");

  // ---------- View / misc ----------
  const [viewMode] = useState("add");
  const [brandSearch, setBrandSearch] = useState("");
  const [existingSubProducts, setExistingSubProducts] = useState([]);
  const [existingSubLoading, setExistingSubLoading] = useState(false);
  const [existingSubName, setExistingSubName] = useState("");
  const [existingSubDescription, setExistingSubDescription] = useState("");
  const [existingSubRate, setExistingSubRate] = useState("");
  const [existingSubSubmitting, setExistingSubSubmitting] = useState(false);
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);

  // ---------- Pagination ----------
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ---------- Edit existing sub-product ----------
  const [editingSubId, setEditingSubId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editRate, setEditRate] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [existingSubUnit, setExistingSubUnit] = useState("");
  const [editUnit, setEditUnit] = useState("");

  // Add a timestamp to force image refresh
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  
  // Add search filter for sub-products
  const [subProductSearch, setSubProductSearch] = useState("");

  // ---------- Helper Functions ----------
  const checkDuplicateSubProduct = (brand, product, subProductName) => {
    return subProducts.some(
      (sp) =>
        String(sp.brand).toLowerCase() === String(brand).toLowerCase() &&
        String(sp.g3_category).toLowerCase() === String(product).toLowerCase() &&
        String(sp.item_name).toLowerCase() === String(subProductName).toLowerCase()
    );
  };

  const debugFormData = (formData) => {
    console.log("=== FormData Contents ===");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": ", pair[1]);
    }
    console.log("=======================");
  };

  const getImageSource = (imageData) => {
    if (!imageData) return null;
    if (typeof imageData === "string") {
      if (imageData.startsWith("http") || imageData.startsWith("data:")) {
        return imageData;
      }
      return `https://nlfs.in/erp/img/${imageData}?t=${imageRefreshKey}`;
    }
    if (imageData instanceof File) {
      return URL.createObjectURL(imageData);
    }
    return null;
  };

  const fetchUnits = async () => {
    setUnitsLoading(true);
    try {
      const formData = new FormData();
      const res = await fetch(`${ERP_BASE}/unit_list`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if ((data.status === true || data.status === "true") && data.success === "1") {
        setUnits(data.data || []);
      } else {
        toast.error(data.message || "Failed to load units");
      }
    } catch (err) {
      console.error("fetchUnits error", err);
      toast.error("Error loading units");
    } finally {
      setUnitsLoading(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const sR = await axios.post(`${API_BASE}/list_mst_sub_product`, {}, { headers: { "Content-Type": "application/json" } });
      const sD = sR.data;
      if (isOk(sD.status) && isOk(sD.success)) {
        const all = (sD.data || []).map((sp) => ({
          ...sp,
          id: sp.id || sp.sub_prod_id || sp.ID,
          brand: sp.brand || sp.brand_name || "",
          g3_category: sp.g3_category || sp.product_name || "",
          g4_sub_category: sp.g4_sub_category || "",
          item_name: sp.item_name || sp.sub_prod_name || "",
          uom: sp.uom || "",
          gst: sp.gst || "",
          hsn_code: sp.hsn_code || "",
          specification: sp.specification || sp.description || "",
          rate: sp.rate || "",
          qty: sp.qty || "",
          image_url: sp.image || "",
        }));
        setSubProducts(all);

        const brandSet = new Set();
        const brandList = [];
        all.forEach((row) => {
          const b = (row.brand || "").toString();
          if (b && !brandSet.has(b)) {
            brandSet.add(b);
            brandList.push({ id: `b_${brandList.length + 1}`, brand_name: b });
          }
        });
        setBrands(brandList);

        const prodSet = new Set();
        const prodList = [];
        all.forEach((row) => {
          const p = (row.g3_category || "").toString();
          if (p && !prodSet.has(p)) {
            prodSet.add(p);
            prodList.push({ id: `p_${prodList.length + 1}`, product_name: p });
          }
        });
        setProducts(prodList);
      } else {
        setSubProducts([]);
        setBrands([]);
        setProducts([]);
        toast.error(sD.message || "Failed to fetch specifications.");
      }
    } catch (err) {
      console.error("fetchAllData error", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchUnits();
  }, []);

  const selectedBrandName = useMemo(() => {
    if (useExistingBrand) {
      return brands.find((b) => String(b.id) === String(existingBrandIdForAdd))?.brand_name || "";
    }
    return brandName || "";
  }, [useExistingBrand, existingBrandIdForAdd, brands, brandName]);

  // ---------- Handlers ----------
  const handleAddNewProductWithSubProduct = () => {
    if (!newProductForm.productName.trim()) {
      return toast.error("Please enter a product name");
    }
    if (!newProductForm.subProductName.trim()) {
      return toast.error("Please enter a sub-product name");
    }
    const brandValue = selectedBrandName;
    const productName = newProductForm.productName.trim();
    const subProductName = newProductForm.subProductName.trim();

    if (brandValue && checkDuplicateSubProduct(brandValue, productName, subProductName)) {
      toast.error(`"${subProductName}" already exists under "${productName}" in brand "${brandValue}"`);
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: productName,
      subProducts: [
        {
          id: Date.now() + 1,
          name: subProductName,
          description: newProductForm.subProductDescription,
          rate: newProductForm.subProductRate,
          uom: newProductForm.subProductUnit || "NOS",
          image: newProductForm.subProductImage,
        },
      ],
    };

    const existingProductIndex = productsList.findIndex((p) => p.name.toLowerCase() === productName.toLowerCase());
    if (existingProductIndex >= 0) {
      const updatedList = [...productsList];
      updatedList[existingProductIndex].subProducts.push(...newProduct.subProducts);
      setProductsList(updatedList);
    } else {
      setProductsList((prev) => [...prev, newProduct]);
    }

    setNewProductForm({
      productName: "",
      subProductName: "",
      subProductDescription: "",
      subProductRate: "",
      subProductUnit: "",
      subProductImage: null,
    });
    toast.success("Product and Sub-product added to list");
  };

  const handleAddAdditionalSubProduct = () => {
    const { productIndex, name, description, rate, unit, image } = additionalSubForm;
    if (productIndex === "" || !name.trim()) return toast.error("Please select a product and enter a sub-product name");

    const newSubProduct = {
      id: Date.now(),
      name,
      description,
      rate,
      uom: unit || "NOS",
      image,
    };

    setProductsList((prev) =>
      prev.map((product, index) =>
        index === parseInt(productIndex, 10)
          ? { ...product, subProducts: product.subProducts ? [...product.subProducts, newSubProduct] : [newSubProduct] }
          : product
      )
    );

    setAdditionalSubForm({ productIndex: "", name: "", description: "", rate: "", unit: "", image: null });
    toast.success("Additional sub-product added");
  };

  const removeProduct = (id) => setProductsList((prev) => prev.filter((p) => p.id !== id));
  const removeSubProduct = (productId, subId) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, subProducts: p.subProducts.filter((sp) => sp.id !== subId) } : p))
    );
  };

  // ---------- Submit All ----------
  const handleSubmitAll = async () => {
    if (!useExistingBrand && !brandName.trim()) {
      return toast.error("Please enter a brand name (or choose existing brand).");
    }

    let itemsToSave = [...productsList];

    if (newProductForm.productName.trim() && newProductForm.subProductName.trim()) {
      const newProduct = {
        id: Date.now(),
        name: newProductForm.productName.trim(),
        subProducts: [
          {
            id: Date.now() + 1,
            name: newProductForm.subProductName.trim(),
            description: newProductForm.subProductDescription,
            rate: newProductForm.subProductRate,
            uom: newProductForm.subProductUnit || "NOS",
            image: newProductForm.subProductImage,
          },
        ],
      };

      const existingProduct = itemsToSave.find((p) => p.name.toLowerCase() === newProduct.name.toLowerCase());
      if (existingProduct) {
        existingProduct.subProducts.push(...newProduct.subProducts);
      } else {
        itemsToSave.push(newProduct);
      }
    }

    if (itemsToSave.length === 0) {
      return toast.error("Add at least one product with sub-product before saving.");
    }

    setLoading(true);
    try {
      const brandValue = (useExistingBrand ? selectedBrandName : brandName.trim()).toString();
      if (!brandValue) {
        toast.error("Brand name is required.");
        setLoading(false);
        return;
      }

      const results = [];
      for (const product of itemsToSave) {
        const g3 = product.name.trim();
        for (const sp of product.subProducts || []) {
          const fd = new FormData();
          fd.append("brand", brandValue);
          fd.append("g3_category", g3);
          fd.append("g4_sub_category", "");
          fd.append("item_name", sp.name.trim() || "");
          // fd.append("uom", sp.uom || "NOS");
          fd.append("uom", sp.uom || "NOS");   // keep for DB column
fd.append("unit", sp.uom || "NOS"); // REQUIRED for validation

          // ✅ FIXED: Correct GST format
          fd.append("gst", sp.rate ? "GOODS 18%" : "GOODS 0%");
          fd.append("hsn_code", "");
          // ✅ FIXED: specification = description, NOT rate
          fd.append("specification", sp.description || "");
         fd.append(
  "rate",
  sp.rate == null || sp.rate === "" ? "0.00" : String(sp.rate)
);


          if (sp.image) {
            fd.append("image", sp.image);
          }

          debugFormData(fd);

         try {
            const res = await axios.post(`${ERP_BASE}/add_product_mst`, fd);
            console.log("API Response for", sp.name, ":", res.data);
            // API only returns 'status', not 'success'
            if (isOk(res.data.status)) {
              results.push({ success: true, name: sp.name });
              toast.success(`Successfully added ${sp.name}`);
            } else {
              results.push({
                success: false,
                name: sp.name,
                error: res.data.message || "API returned false status",
              });
              const errorMsg = res.data.message || "";
              if (errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate")) {
                toast.error(`${sp.name}: Already exists in the system.`);
              } else {
                toast.error(`Failed to add ${sp.name}: ${errorMsg}`);
              }
            }
          } catch (err) {
            console.error(`Error saving ${sp.name}:`, err);
            let errorMessage = err.message;
            if (err.response && err.response.status === 500) {
              errorMessage = "Server error: The request could not be processed. Please check all required fields.";
            }
            results.push({
              success: false,
              name: sp.name,
              error: errorMessage,
            });
            toast.error(`Error saving ${sp.name}: ${errorMessage}`);
          }
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;
      if (successCount > 0) toast.success(`Successfully saved ${successCount} item(s).`);
      if (failCount > 0) toast.error(`Failed to save ${failCount} item(s).`);

      setTimeout(async () => {
        await fetchAllData();
        setImageRefreshKey(Date.now());
        setNewProductForm({
          productName: "",
          subProductName: "",
          subProductDescription: "",
          subProductRate: "",
          subProductUnit: "",
          subProductImage: null,
        });
        setProductsList([]);
      }, 1500);
    } catch (err) {
      console.error("handleSubmitAll error", err);
      toast.error("Error submitting items: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingSubProducts = async (productName, brandFilter) => {
    setExistingSubLoading(true);
    setCurrentPage(1);
    try {
      const targetProdName = productName;
      const targetBrand = (brandFilter || "").toString();
      
      // Always fetch from API to get the latest data
      const res = await axios.post(`${API_BASE}/list_mst_sub_product`, {}, { headers: { "Content-Type": "application/json" } });
      if (isOk(res.data.status)) {
        const all = (res.data.data || []).map((sp) => ({
          ...sp,
          id: sp.id || sp.sub_prod_id,
          brand: sp.brand || "",
          g3_category: sp.g3_category || "",
          item_name: sp.item_name || "",
          specification: sp.specification || sp.description || "",
          rate: sp.rate || "",
          qty: sp.qty || "",
          image_url: sp.image || "",
        }));
        const filtered = all.filter(
          (sp) =>
            (sp.g3_category || "").toString() === targetProdName &&
            (!targetBrand || (sp.brand || "").toString() === targetBrand)
        );
        setExistingSubProducts(filtered);
      } else {
        setExistingSubProducts([]);
        toast.error(res.data.message || "Failed to fetch sub-products.");
      }
    } catch (err) {
      console.error("fetchExistingSubProducts error", err);
      toast.error("Error loading sub-products.");
    } finally {
      setExistingSubLoading(false);
    }
  };

 useEffect(() => {
  if (productMode === "existing" && existingProdIdForAdd) {
    fetchExistingSubProducts(existingProdIdForAdd, selectedBrandName);
  } else {
    setExistingSubProducts([]);
  }
}, [productMode, existingProdIdForAdd, selectedBrandName]);


  const handleAddSubToExistingProduct = async (e) => {
    e.preventDefault();
    if (!existingProdIdForAdd) {
      return toast.error("Please select an existing product.");
    }
    if (!existingSubName.trim()) {
      return toast.error("Please enter sub-product name.");
    }
    // const targetProduct = products.find((p) => String(p.id) === String(existingProdIdForAdd));
    // if (!targetProduct) {
    //   return toast.error("Invalid product selection.");
    // }

    const targetProductName = existingProdIdForAdd;


    if (checkDuplicateSubProduct(selectedBrandName, targetProductName, existingSubName.trim())) {
   toast.error(`"${existingSubName}" already exists under "${targetProductName}"`);

      return;
    }

    setExistingSubSubmitting(true);
    try {
      const brandValue = selectedBrandName.toString();
      const fd = new FormData();
      fd.append("brand", brandValue);
fd.append("g3_category", targetProductName);
      fd.append("g4_sub_category", "");
      fd.append("item_name", existingSubName.trim());
      // fd.append("uom", existingSubUnit || "NOS");
      fd.append("uom", existingSubUnit || "NOS");
fd.append("unit", existingSubUnit || "NOS");

      // ✅ FIXED: Correct GST format
      fd.append("gst", existingSubRate ? "GOODS 18%" : "GOODS 0%");
      fd.append("hsn_code", "");
      // ✅ FIXED: specification = description
      fd.append("specification", existingSubDescription || "");
  fd.append(
  "rate",
  existingSubRate == null || existingSubRate === ""
    ? "0.00"
    : String(existingSubRate)
);



      if (existingSubImage) {
        fd.append("image", existingSubImage);
      }

      debugFormData(fd);

      const res = await axios.post(`${ERP_BASE}/add_product_mst`, fd);
      console.log("API Response:", res.data);
    if (!isOk(res.data.status)) {
        const errorMsg = res.data.message || "API error";
        if (errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate")) {
          throw new Error(`"${existingSubName}" already exists in the system.`);
        }
        throw new Error(errorMsg);
      }

      toast.success(`"${existingSubName}" added successfully.`);
      setTimeout(async () => {
        await fetchAllData();
        setImageRefreshKey(Date.now());
await fetchExistingSubProducts(targetProductName, selectedBrandName);
      }, 1000);

      setExistingSubName("");
      setExistingSubDescription("");
      setExistingSubRate("");
      setExistingSubImage(null);
      setExistingSubUnit("");
    } catch (err) {
      console.error("Add sub-product error:", err);
      let errorMessage = err.message;
      if (err.response && err.response.status === 500) {
        errorMessage = "Server error: The request could not be processed. Please check all required fields.";
      }
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setExistingSubSubmitting(false);
    }
  };

  const handleUpdateSubProduct = async (row) => {
    if (!editingSubId) return;
    setEditSubmitting(true);
    try {
      const qtyPayload = { id: row.id, qty: editQty };
      await axios.post(`${API_BASE}/update_qty_specification`, qtyPayload, { headers: { "Content-Type": "application/json" } });

      const fd = new FormData();
      fd.append("id", String(row.id));
      fd.append("brand", row.brand || selectedBrandName || "");
      fd.append("g3_category", row.g3_category || "");
      fd.append("g4_sub_category", String(row.g4_sub_category || ""));
      fd.append("item_name", String(row.item_name || ""));
      fd.append("uom", editUnit || row.uom || "NOS");
      fd.append("gst", String(row.gst || ""));
      fd.append("hsn_code", String(row.hsn_code || ""));
      fd.append("specification", String(editDescription || ""));
      fd.append("rate", String(editRate === "" ? "" : editRate));
      if (editImage) fd.append("image", editImage);

      const res = await axios.post(`${API_BASE}/update_specification`, fd);
      if (!isOk(res.data.status)) {
        throw new Error(res.data.message || "Unknown API error");
      }

      toast.success("Sub-product updated successfully.");
      setTimeout(async () => {
        await fetchAllData();
        setImageRefreshKey(Date.now());

        const targetProduct = products.find((p) => String(p.id) === String(existingProdIdForAdd));
       if (existingProdIdForAdd) {
  fetchExistingSubProducts(existingProdIdForAdd, selectedBrandName);
}
      }, 1000);

      cancelEditSubProduct();
    } catch (err) {
      console.error("Update sub-product error:", err);
      toast.error(`Error: ${err.message || err}`);
    } finally {
      setEditSubmitting(false);
    }
  };

  const cancelEditSubProduct = () => {
    setEditingSubId(null);
    setEditDescription("");
    setEditRate("");
    setEditQty("");
    setEditImage(null);
    setEditUnit("");
  };

  const deleteExistingSubProduct = async (subProdId) => {
    if (!window.confirm("Delete this sub-product?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/delete_mst_sub_product`, {
        headers: { "Content-Type": "application/json" },
        data: { id: subProdId },
      });
      if (isOk(res.data.status) && isOk(res.data.success)) {
        toast.success("Sub-product deleted");
        setTimeout(async () => {
          await fetchAllData();
          setImageRefreshKey(Date.now());
          const targetProduct = products.find((p) => String(p.id) === String(existingProdIdForAdd));
          if (targetProduct) {
            fetchExistingSubProducts(targetProduct.product_name, selectedBrandName);
          }
        }, 1000);
      } else {
        toast.error(res.data.message || "Delete failed.");
      }
    } catch (err) {
      console.error("deleteExistingSubProduct error", err);
      toast.error("Error deleting sub-product.");
    }
  };

  const deleteBrand = async (brandNameVal) => {
    if (!window.confirm("Delete this brand and all its products?")) return;
    try {
      const toDelete = subProducts.filter((sp) => String(sp.brand) === String(brandNameVal));
      for (const r of toDelete) {
        await axios.delete(`${API_BASE}/delete_mst_sub_product`, {
          headers: { "Content-Type": "application/json" },
          data: { id: r.id },
        });
      }
      toast.success("Brand rows deleted (attempted). Refreshing.");
      setTimeout(async () => {
        await fetchAllData();
        setImageRefreshKey(Date.now());
      }, 1000);
    } catch (err) {
      console.error("deleteBrand error", err);
      toast.error("Failed to delete brand");
    }
  };

  const deleteProduct = async (productName) => {
    if (!window.confirm("Delete this product and all its sub-products?")) return;
    try {
      const toDelete = subProducts.filter((sp) => String(sp.g3_category) === String(productName));
      for (const r of toDelete) {
        await axios.delete(`${API_BASE}/delete_mst_sub_product`, {
          headers: { "Content-Type": "application/json" },
          data: { id: r.id },
        });
      }
      toast.success("Product rows deleted (attempted). Refreshing.");
      setTimeout(async () => {
        await fetchAllData();
        setImageRefreshKey(Date.now());
      }, 1000);
    } catch (err) {
      console.error("deleteProduct error", err);
      toast.error("Failed to delete product");
    }
  };

  const brandFilteredProducts = useMemo(() => {
    if (!selectedBrandName) return [];
    const set = new Set();
    const result = [];
    subProducts.forEach((sp) => {
      if (String(sp.brand) !== String(selectedBrandName)) return;
      const p = (sp.g3_category || "").toString();
      if (p && !set.has(p)) {
        set.add(p);
        result.push({ id: `bp_${result.length + 1}`, product_name: p });
      }
    });
    return result;
  }, [subProducts, selectedBrandName]);

  const totalExisting = existingSubProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalExisting / pageSize));
  const paginatedExistingSubProducts = existingSubProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const el = document.querySelector(".card-body");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetToBrandStep = () => {
    setWorkflowStep("brand");
    setUseExistingBrand(false);
    setExistingBrandIdForAdd("");
    setBrandName("");
    setProductMode("new");
    setExistingProdIdForAdd("");
    setProductsList([]);
    setNewProductForm({
      productName: "",
      subProductName: "",
      subProductDescription: "",
      subProductRate: "",
      subProductUnit: "",
      subProductImage: null,
    });
    setAdditionalSubForm({ productIndex: "", name: "", description: "", rate: "", unit: "", image: null });
    setExistingSubName("");
    setExistingSubDescription("");
    setExistingSubRate("");
    setEditingSubId(null);
    setEditDescription("");
    setEditRate("");
    setEditQty("");
    setEditImage(null);
    setExistingSubUnit("");
    setEditUnit("");
  };

  const tableStyle = { verticalAlign: "top" };
  const tableCellStyle = { verticalAlign: "top", paddingTop: "0.5rem" };

  // Filter sub-products based on search
  const filteredSubProducts = useMemo(() => {
    if (!subProductSearch.trim()) return existingSubProducts;
    
    const searchLower = subProductSearch.toLowerCase();
    return existingSubProducts.filter(sp => 
      (sp.item_name || "").toLowerCase().includes(searchLower) ||
      (sp.specification || "").toLowerCase().includes(searchLower) ||
      (sp.rate || "").toString().includes(searchLower) ||
      (sp.uom || "").toLowerCase().includes(searchLower)
    );
  }, [existingSubProducts, subProductSearch]);

  // Pagination for filtered sub-products
  const totalFiltered = filteredSubProducts.length;
  const totalFilteredPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedFilteredSubProducts = filteredSubProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
              <Row className="align-items-center">
                <Col>
                  <Card.Title style={{ marginTop: "2rem", fontWeight: "700" }}>Products Master</Card.Title>
                </Col>
                {workflowStep === "products" && (
                  <Col className="d-flex justify-content-end align-items-center gap-2">
                    <Button variant="outline-secondary" onClick={() => setWorkflowStep("brand")}>
                      <FaArrowLeft /> Back to Brand
                    </Button>
                  </Col>
                )}
              </Row>
            </Card.Header>
            <Card.Body>
              {viewMode === "add" ? (
                <>
                  {/* Step 1: Brand */}
                  {workflowStep === "brand" && (
                    <Card className="mb-4 border-0 shadow-none">
                      <Card.Body>
                        <div className="d-flex gap-4 mb-3">
                          <Form.Check
                            type="radio"
                            id="brand-new"
                            name="brand-mode"
                            label="Create New Brand"
                            checked={!useExistingBrand}
                            onChange={() => {
                              setUseExistingBrand(false);
                              setExistingBrandIdForAdd("");
                            }}
                          />
                          <Form.Check
                            type="radio"
                            id="brand-existing"
                            name="brand-mode"
                            label="Use Existing Brand"
                            checked={useExistingBrand}
                            onChange={() => {
                              setUseExistingBrand(true);
                              setBrandName("");
                            }}
                          />
                        </div>
                        {!useExistingBrand && (
                          <Form.Group className="mb-3">
                            <Form.Label>Brand Name</Form.Label>
                            <Form.Control
                              value={brandName}
                              onChange={(e) => setBrandName(e.target.value)}
                              placeholder="Enter brand name"
                            />
                            <Form.Text muted>Example: LG, Samsung, Bosch, etc.</Form.Text>
                          </Form.Group>
                        )}
                        {useExistingBrand && (
                          <>
                            <Form.Group className="mb-3">
                              <Form.Label>Search Brand</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Type to filter brands..."
                                value={brandSearch}
                                onChange={(e) => setBrandSearch(e.target.value)}
                              />
                            </Form.Group>
                            <div className="table-responsive">
                              <Table striped hover size="sm" style={tableStyle}>
                                <thead>
                                  <tr>
                                    <th style={tableCellStyle}>Sr No</th>
                                    <th style={tableCellStyle}>Brand Name</th>
                                    <th style={tableCellStyle}>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(brands || [])
                                    .filter(
                                      (b) =>
                                        !brandSearch.trim() ||
                                        String(b.brand_name || "").toLowerCase().includes(brandSearch.toLowerCase())
                                    )
                                    .map((brand, idx) => (
                                      <tr
                                        key={brand.id}
                                        onClick={() => setExistingBrandIdForAdd(brand.id)}
                                        style={{ cursor: "pointer" }}
                                        className={String(existingBrandIdForAdd) === String(brand.id) ? "table-active brand-active" : ""}
                                      >
                                        <td style={tableCellStyle}>{idx + 1}</td>
                                        <td style={tableCellStyle}>
                                          {brand.brand_name}
                                          {String(existingBrandIdForAdd) === String(brand.id) && (
                                            <Badge bg="primary" className="ms-2">
                                              Selected
                                            </Badge>
                                          )}
                                        </td>
                                        <td style={tableCellStyle} className="text-end">
                                          <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteBrand(brand.brand_name);
                                            }}
                                          >
                                            <FaTrash />
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </Table>
                            </div>
                          </>
                        )}
                        <div className="d-flex justify-content-end mt-3">
                          <Button
                            variant="primary"
                            onClick={() => {
                              if (!useExistingBrand && !brandName.trim())
                                return toast.error("Please enter a brand name");
                              if (useExistingBrand && !existingBrandIdForAdd)
                                return toast.error("Please select a brand");
                              setWorkflowStep("products");
                            }}
                          >
                            Save and Proceed
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Step 2: Products & Sub-Products */}
                  {workflowStep === "products" && (
                    <Card className="mb-4">
                      <Card.Header>Step 2: Products & Sub-Products</Card.Header>
                      <Card.Body>
                        <div className="d-flex justify-content-between mb-3">
                          <div>
                            <strong>Brand: </strong>
                            <Badge bg="secondary">{selectedBrandName || "New Brand"}</Badge>
                          </div>
                          <Button size="sm" variant="outline-secondary" onClick={() => setWorkflowStep("brand")}>
                            <FaArrowLeft />
                          </Button>
                        </div>
                        <div className="d-flex gap-4 mb-3">
                          <Form.Check
                            type="radio"
                            id="prod-mode-new"
                            name="prod-mode"
                            label="Create New Products"
                            checked={productMode === "new"}
                            onChange={() => setProductMode("new")}
                          />
                          <Form.Check
                            type="radio"
                            id="prod-mode-existing"
                            name="prod-mode"
                            label="Use Existing Product"
                            checked={productMode === "existing"}
                            onChange={() => setProductMode("existing")}
                          />
                        </div>

                        {/* NEW product mode */}
                        {productMode === "new" && (
                          <>
                            <Card className="mb-4">
                              <Card.Header>Add New Product & Sub-Product</Card.Header>
                              <Card.Body>
                                <Row className="g-2 mb-3">
                                  <Col md={12}>
                                    <Form.Label>Product Name</Form.Label>
                                    <Form.Control
                                      placeholder="Enter product name"
                                      value={newProductForm.productName}
                                      onChange={(e) => setNewProductForm({ ...newProductForm, productName: e.target.value })}
                                    />
                                  </Col>
                                </Row>
                                <Row className="g-2 mb-3">
                                  <Col md={12}>
                                    <Form.Label>Sub-Product Name</Form.Label>
                                    <Form.Control
                                      placeholder="Enter sub-product name"
                                      value={newProductForm.subProductName}
                                      onChange={(e) => setNewProductForm({ ...newProductForm, subProductName: e.target.value })}
                                    />
                                  </Col>
                                  <Col md={12}>
                                    <Form.Label>Sub-Product Image</Form.Label>
                                    <Form.Control
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => setNewProductForm({ ...newProductForm, subProductImage: e.target.files[0] })}
                                    />
                                    {newProductForm.subProductImage && (
                                      <div className="mt-2">
                                        <img
                                          src={URL.createObjectURL(newProductForm.subProductImage)}
                                          alt="Preview"
                                          style={{
                                            height: "100px",
                                            objectFit: "cover",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() => window.open(URL.createObjectURL(newProductForm.subProductImage), "_blank")}
                                        />
                                      </div>
                                    )}
                                  </Col>
                                </Row>
                                <Row className="g-2 mb-3">
                                  <Col md={6}>
                                    <Form.Label>Rate</Form.Label>
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      placeholder="Rate"
                                      value={newProductForm.subProductRate}
                                      onChange={(e) => setNewProductForm({ ...newProductForm, subProductRate: e.target.value })}
                                    />
                                  </Col>
                                  <Col md={6}>
                                    <Form.Label>Unit</Form.Label>
                                    <Form.Select
                                      value={newProductForm.subProductUnit}
                                      onChange={(e) => setNewProductForm({ ...newProductForm, subProductUnit: e.target.value })}
                                    >
                                      <option value="">-- Select Unit --</option>
                                      {units.map((u) => (
                                        <option key={u.unit_id} value={u.unit}>
                                          {u.unit}
                                        </option>
                                      ))}
                                    </Form.Select>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={1}
                                      placeholder="Description"
                                      value={newProductForm.subProductDescription}
                                      onChange={(e) => setNewProductForm({ ...newProductForm, subProductDescription: e.target.value })}
                                    />
                                  </Col>
                                </Row>
                                <Button variant="primary" onClick={handleAddNewProductWithSubProduct}>
                                  <FaPlus className="me-2" /> Add Product & Sub-Product
                                </Button>
                              </Card.Body>
                            </Card>

                            {productsList.map((product) => (
                              <Card key={product.id} className="mb-2">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                  <strong>{product.name}</strong>
                                  <Button variant="outline-danger" size="sm" onClick={() => removeProduct(product.id)}>
                                    <FaTrash />
                                  </Button>
                                </Card.Header>
                                <Card.Body>
                                  <div className="table-responsive">
                                    <Table striped bordered size="sm" style={tableStyle}>
                                      <thead>
                                        <tr>
                                          <th style={tableCellStyle}>Name</th>
                                          <th style={tableCellStyle}>Description</th>
                                          <th style={tableCellStyle}>Rate</th>
                                          <th style={tableCellStyle}>Image</th>
                                          <th style={tableCellStyle}>Action</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(product.subProducts || []).map((sp) => {
                                          const imgSrc = getImageSource(sp.image);
                                          return (
                                            <tr key={sp.id}>
                                              <td style={tableCellStyle}>{sp.name}</td>
                                              <td style={tableCellStyle}>{sp.description || "-"}</td>
                                              <td style={tableCellStyle}>{sp.rate || "-"}</td>
                                              <td style={{ ...tableCellStyle, minWidth: "80px", textAlign: "center" }}>
                                                {sp.image ? (
                                                  <img
                                                    src={getImageSource(sp.image)}
                                                    alt="Preview"
                                                    style={{
                                                      height: "50px",
                                                      width: "50px",
                                                      objectFit: "cover",
                                                      borderRadius: "4px",
                                                      cursor: "pointer",
                                                    }}
                                                    title="Click to view"
                                                    onClick={() => window.open(getImageSource(sp.image), "_blank")}
                                                  />
                                                ) : (
                                                  <span style={{ color: "#ccc" }}>No Image</span>
                                                )}
                                              </td>
                                              <td style={tableCellStyle}>
                                                <Button
                                                  size="sm"
                                                  variant="outline-danger"
                                                  onClick={() => removeSubProduct(product.id, sp.id)}
                                                >
                                                  <FaTrash />
                                                </Button>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </Table>
                                  </div>
                                </Card.Body>
                              </Card>
                            ))}

                            {productsList.length > 0 && (
                              <Card className="mt-4">
                                <Card.Header>Add Additional Sub-Product</Card.Header>
                                <Card.Body>
                                  <Row className="g-2 mb-3">
                                    <Col md={4}>
                                      <Form.Label>Select Product</Form.Label>
                                      <Form.Select
                                        value={additionalSubForm.productIndex}
                                        onChange={(e) => setAdditionalSubForm({ ...additionalSubForm, productIndex: e.target.value })}
                                      >
                                        <option value="">-- Select Product --</option>
                                        {productsList.map((p, index) => (
                                          <option key={p.id} value={index}>
                                            {p.name}
                                          </option>
                                        ))}
                                      </Form.Select>
                                    </Col>
                                    <Col md={8}>
                                      <Form.Label>Sub-Product Name</Form.Label>
                                      <Form.Control
                                        placeholder="Enter sub-product name"
                                        value={additionalSubForm.name}
                                        onChange={(e) => setAdditionalSubForm({ ...additionalSubForm, name: e.target.value })}
                                      />
                                    </Col>
                                    <Col md={12}>
                                      <Form.Label>Sub-Product Image</Form.Label>
                                      <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setAdditionalSubForm({ ...additionalSubForm, image: e.target.files[0] })}
                                      />
                                      {additionalSubForm.image && (
                                        <div className="mt-2">
                                          <img
                                            src={URL.createObjectURL(additionalSubForm.image)}
                                            alt="Preview"
                                            style={{
                                              height: "100px",
                                              objectFit: "cover",
                                              borderRadius: "4px",
                                              cursor: "pointer",
                                            }}
                                            onClick={() => window.open(URL.createObjectURL(additionalSubForm.image), "_blank")}
                                          />
                                        </div>
                                      )}
                                    </Col>
                                  </Row>
                                  <Row className="g-2 mb-3">
                                    <Col md={6}>
                                      <Form.Label>Rate</Form.Label>
                                      <Form.Control
                                        type="number"
                                        step="0.01"
                                        placeholder="Rate"
                                        value={additionalSubForm.rate}
                                        onChange={(e) => setAdditionalSubForm({ ...additionalSubForm, rate: e.target.value })}
                                      />
                                    </Col>
                                    <Col md={6}>
                                      <Form.Label>Unit</Form.Label>
                                      <Form.Select
                                        value={additionalSubForm.unit}
                                        onChange={(e) => setAdditionalSubForm({ ...additionalSubForm, unit: e.target.value })}
                                      >
                                        <option value="">-- Select Unit --</option>
                                        {units.map((u) => (
                                          <option key={u.unit_id} value={u.unit}>
                                            {u.unit}
                                          </option>
                                        ))}
                                      </Form.Select>
                                    </Col>
                                    <Col md={6}>
                                      <Form.Label>Description</Form.Label>
                                      <Form.Control
                                        as="textarea"
                                        rows={1}
                                        placeholder="Description"
                                        value={additionalSubForm.description}
                                        onChange={(e) => setAdditionalSubForm({ ...additionalSubForm, description: e.target.value })}
                                      />
                                    </Col>
                                  </Row>
                                  <Button variant="secondary" onClick={handleAddAdditionalSubProduct}>
                                    <FaPlus className="me-2" /> Add Sub-Product
                                  </Button>
                                </Card.Body>
                              </Card>
                            )}

                            <div className="d-flex justify-content-end mt-4">
                              <Button variant="success" onClick={handleSubmitAll} disabled={loading}>
                                {loading ? <Spinner size="sm" animation="border" /> : "Save All"}
                              </Button>
                            </div>
                          </>
                        )}

                        {/* EXISTING product mode */}
                        {productMode === "existing" && (
                          <>
                            {!useExistingBrand && (
                              <Alert variant="warning">
                                To use an existing product, please choose <strong>Use Existing Brand</strong> in the Brand tab.
                              </Alert>
                            )}
                            {useExistingBrand && (
                              <>
                                {brandFilteredProducts.length === 0 ? (
                                  <Alert variant="info">
                                    No existing products found under brand <strong>"{selectedBrandName}"</strong>. Please use "Create New
                                    Products" to add one first.
                                  </Alert>
                                ) : (
                                  <>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Select Existing Product</Form.Label>
                                      <Form.Select
  value={existingProdIdForAdd}
  onChange={(e) => setExistingProdIdForAdd(e.target.value)}
>
  <option value="">-- Choose a product --</option>
  {brandFilteredProducts.map((product) => (
    <option
      key={product.product_name}
      value={product.product_name}
    >
      {product.product_name}
    </option>
  ))}
</Form.Select>

                                    </Form.Group>
                                    {existingProdIdForAdd && (
                                      <Card className="mt-3">
                                        <Card.Header>
                                          Managing Sub-Products for:{" "}
                                          <Badge bg="info">
                                           {existingProdIdForAdd || "Unknown"}
                                          </Badge>
                                        </Card.Header>
                                        <Card.Body>
                                          <Form onSubmit={handleAddSubToExistingProduct} className="mb-3">
                                            <Row className="g-2 mb-3">
                                              <Col md={6}>
                                                <Form.Control
                                                  placeholder="Enter sub-product name"
                                                  value={existingSubName}
                                                  onChange={(e) => setExistingSubName(e.target.value)}
                                                  required
                                                />
                                              </Col>
                                              <Col md={3}>
                                                <Form.Control
                                                  placeholder="Rate"
                                                  type="number"
                                                  step="0.01"
                                                  value={existingSubRate}
                                                  onChange={(e) => setExistingSubRate(e.target.value)}
                                                />
                                              </Col>
                                              <Col md={3}>
                                                <Form.Select
                                                  value={existingSubUnit}
                                                  onChange={(e) => setExistingSubUnit(e.target.value)}
                                                >
                                                  <option value="">Unit</option>
                                                  {units.map((u) => (
                                                    <option key={u.unit_id} value={u.unit}>
                                                      {u.unit}
                                                    </option>
                                                  ))}
                                                </Form.Select>
                                              </Col>
                                            </Row>
                                            <Row className="g-2 mb-3">
                                              <Col md={12}>
                                                <Form.Control
                                                  as="textarea"
                                                  rows={2}
                                                  placeholder="Description (optional)"
                                                  value={existingSubDescription}
                                                  onChange={(e) => setExistingSubDescription(e.target.value)}
                                                />
                                              </Col>
                                            </Row>
                                            <Row className="g-2 mb-3">
                                              <Col md={12}>
                                                <Form.Label>Sub-Product Image</Form.Label>
                                                <Form.Control
                                                  type="file"
                                                  accept="image/*"
                                                  onChange={(e) => setExistingSubImage(e.target.files[0])}
                                                />
                                                {existingSubImage && (
                                                  <div className="mt-2">
                                                    <img
                                                      src={URL.createObjectURL(existingSubImage)}
                                                      alt="Preview"
                                                      style={{
                                                        height: "100px",
                                                        objectFit: "cover",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                      }}
                                                      onClick={() => window.open(URL.createObjectURL(existingSubImage), "_blank")}
                                                    />
                                                  </div>
                                                )}
                                              </Col>
                                            </Row>
                                            <div className="d-flex justify-content-end">
                                              <Button
                                                type="submit"
                                                variant="primary"
                                                className="w-100"
                                                disabled={existingSubSubmitting || !existingProdIdForAdd}
                                              >
                                                {existingSubSubmitting ? (
                                                  <Spinner size="sm" animation="border" />
                                                ) : (
                                                  <>
                                                    <FaPlus className="me-1" /> Add Sub-Product
                                                  </>
                                                )}
                                              </Button>
                                            </div>
                                          </Form>

                                          {/* SEARCH AND TABLE FOR EXISTING SUB-PRODUCTS - MOVED HERE */}
                                          <hr className="my-4" />
                                          <div className="mb-3">
                                            <h5 className="mb-3">Existing Sub-Products</h5>
                                            <Form.Control
                                              type="text"
                                              placeholder="Search sub-products..."
                                              value={subProductSearch}
                                              onChange={(e) => {
                                                setSubProductSearch(e.target.value);
                                                setCurrentPage(1);
                                              }}
                                              className="mb-3"
                                            />
                                          </div>

                                          {existingSubLoading ? (
                                            <div className="text-center p-3">
                                              <Spinner animation="border" size="sm" />
                                              <p className="mt-2">Loading sub-products...</p>
                                            </div>
                                          ) : (
                                            <>
                                              <div className="table-responsive">
                                                <Table striped hover size="sm" style={tableStyle}>
                                                  <thead>
                                                    <tr>
                                                      <th style={tableCellStyle}>Sr No</th>
                                                      <th style={tableCellStyle}>Sub-product</th>
                                                      <th style={tableCellStyle}>Description</th>
                                                      <th style={tableCellStyle}>Rate</th>
                                                      <th style={tableCellStyle}>Unit</th>
                                                      <th style={tableCellStyle}>Qty</th>
                                                      <th style={tableCellStyle}>Image</th>
                                                      <th style={tableCellStyle}>Action</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    {paginatedFilteredSubProducts.map((s, idx) => {
                                                      const indexInFull = (currentPage - 1) * pageSize + idx;
                                                      const isEditing = editingSubId === s.id;
                                                      const imgSrc = getImageSource(s.image_url);
                                                      return (
                                                        <tr key={s.id}>
                                                          <td style={tableCellStyle}>{indexInFull + 1}</td>
                                                          <td style={tableCellStyle}>{s.item_name || s.sub_prod_name || "-"}</td>
                                                          <td style={{ ...tableCellStyle, minWidth: "300px" }}>
                                                            {isEditing ? (
                                                              <Form.Control
                                                                as="textarea"
                                                                rows={2}
                                                                value={editDescription}
                                                                onChange={(e) => setEditDescription(e.target.value)}
                                                              />
                                                            ) : (
                                                              s.specification || "-"
                                                            )}
                                                          </td>
                                                          <td style={{ ...tableCellStyle, minWidth: "120px" }}>
                                                            {isEditing ? (
                                                              <Form.Control
                                                                type="number"
                                                                step="0.01"
                                                                value={editRate}
                                                                onChange={(e) => setEditRate(e.target.value)}
                                                              />
                                                            ) : (
                                                              s.rate || "-"
                                                            )}
                                                          </td>
                                                          <td style={{ ...tableCellStyle, minWidth: "120px" }}>
                                                            {isEditing ? (
                                                              <Form.Select
                                                                value={editUnit}
                                                                onChange={(e) => setEditUnit(e.target.value)}
                                                              >
                                                                <option value="">-- Select Unit --</option>
                                                                {units.map((u) => (
                                                                  <option key={u.unit_id} value={u.unit}>
                                                                    {u.unit}
                                                                  </option>
                                                                ))}
                                                              </Form.Select>
                                                            ) : (
                                                              s.uom || "-"
                                                            )}
                                                          </td>
                                                          <td style={{ ...tableCellStyle, minWidth: "100px" }}>
                                                            {isEditing ? (
                                                              <Form.Control
                                                                type="number"
                                                                value={editQty}
                                                                onChange={(e) => setEditQty(e.target.value)}
                                                                placeholder="Qty"
                                                              />
                                                            ) : (
                                                              s.qty || "-"
                                                            )}
                                                          </td>
                                                          <td style={{ ...tableCellStyle, minWidth: "120px" }}>
                                                            {isEditing ? (
                                                              <>
                                                                <Form.Control
                                                                  type="file"
                                                                  accept="image/*"
                                                                  onChange={(e) => setEditImage(e.target.files[0])}
                                                                />
                                                                {editImage ? (
                                                                  <div className="mt-1">
                                                                    <img
                                                                      src={URL.createObjectURL(editImage)}
                                                                      alt="New"
                                                                      style={{
                                                                        height: "40px",
                                                                        objectFit: "cover",
                                                                        borderRadius: "4px",
                                                                        cursor: "pointer",
                                                                      }}
                                                                      onClick={() => window.open(URL.createObjectURL(editImage), "_blank")}
                                                                    />
                                                                  </div>
                                                                ) : s.image_url ? (
                                                                  <div className="mt-1">
                                                                    <img
                                                                      src={getImageSource(s.image_url)}
                                                                      alt="Current"
                                                                      style={{
                                                                        height: "40px",
                                                                        objectFit: "cover",
                                                                        borderRadius: "4px",
                                                                        cursor: "pointer",
                                                                      }}
                                                                      onClick={() => window.open(getImageSource(s.image_url), "_blank")}
                                                                    />
                                                                  </div>
                                                                ) : null}
                                                              </>
                                                            ) : s.image_url ? (
                                                              <img
                                                                src={getImageSource(s.image_url)}
                                                                alt="Sub-product"
                                                                style={{
                                                                  height: "40px",
                                                                  objectFit: "cover",
                                                                  borderRadius: "4px",
                                                                  cursor: "pointer",
                                                                }}
                                                                onClick={() => window.open(getImageSource(s.image_url), "_blank")}
                                                              />
                                                            ) : (
                                                              <span style={{ color: "#ccc" }}>No Image</span>
                                                            )}
                                                          </td>
                                                          <td style={tableCellStyle}>
                                                            {isEditing ? (
                                                              <div className="d-flex gap-1">
                                                                <Button
                                                                  size="sm"
                                                                  variant="success"
                                                                  disabled={editSubmitting}
                                                                  onClick={() => handleUpdateSubProduct(s)}
                                                                >
                                                                  {editSubmitting ? (
                                                                    <Spinner size="sm" animation="border" />
                                                                  ) : (
                                                                    <>
                                                                      <FaSave className="me-1" /> Save
                                                                    </>
                                                                  )}
                                                                </Button>
                                                                <Button size="sm" variant="secondary" onClick={cancelEditSubProduct}>
                                                                  <FaTimes className="me-1" /> Cancel
                                                                </Button>
                                                              </div>
                                                            ) : (
                                                              <div className="d-flex gap-1">
                                                                <Button
                                                                  className="buttonEye"
                                                                  onClick={() => {
                                                                    setEditingSubId(s.id);
                                                                    setEditDescription(s.specification || "");
                                                                    setEditRate(s.rate || "");
                                                                    setEditQty(s.qty || "");
                                                                    setEditUnit(s.uom || "");
                                                                  }}
                                                                >
                                                                  <FaEdit />
                                                                </Button>
                                                                <Button
                                                                  size="sm"
                                                                  variant="danger"
                                                                  onClick={() => deleteExistingSubProduct(s.id)}
                                                                >
                                                                  <FaTrash />
                                                                </Button>
                                                              </div>
                                                            )}
                                                          </td>
                                                        </tr>
                                                      );
                                                    })}
                                                  </tbody>
                                                </Table>
                                              </div>
                                              {totalFiltered > pageSize && (
                                                <div className="d-flex justify-content-center mt-3">
                                                  <Pagination>
                                                    <Pagination.Prev
                                                      onClick={() => handlePageChange(currentPage - 1)}
                                                      disabled={currentPage === 1}
                                                    />
                                                    {Array.from({ length: totalFilteredPages }, (_, i) => {
                                                      const page = i + 1;
                                                      if (totalFilteredPages > 7) {
                                                        if (
                                                          page === 1 ||
                                                          page === totalFilteredPages ||
                                                          (page >= currentPage - 2 && page <= currentPage + 2)
                                                        ) {
                                                          return (
                                                            <Pagination.Item
                                                              key={page}
                                                              active={page === currentPage}
                                                              onClick={() => handlePageChange(page)}
                                                            >
                                                              {page}
                                                            </Pagination.Item>
                                                          );
                                                        }
                                                        if (page === 2 && currentPage > 4) return <Pagination.Ellipsis key="e1" disabled />;
                                                        if (page === totalFilteredPages - 1 && currentPage < totalFilteredPages - 3)
                                                          return <Pagination.Ellipsis key="e2" disabled />;
                                                        return null;
                                                      }
                                                      return (
                                                        <Pagination.Item
                                                          key={page}
                                                          active={page === currentPage}
                                                          onClick={() => handlePageChange(page)}
                                                        >
                                                          {page}
                                                        </Pagination.Item>
                                                      );
                                                    })}
                                                    <Pagination.Next
                                                      onClick={() => handlePageChange(currentPage + 1)}
                                                      disabled={currentPage === totalFilteredPages}
                                                    />
                                                  </Pagination>
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </Card.Body>
                                      </Card>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </Card.Body>
                    </Card>
                  )}
                </>
              ) : (
                <Alert variant="info">View mode (existing data management).</Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductMaster;