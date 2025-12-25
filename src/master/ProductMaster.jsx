// // // src/forms/ProductMaster.jsx
// // import React, { useState, useEffect, useMemo } from "react";
// // import {
// //   Container,
// //   Row,
// //   Col,
// //   Card,
// //   Form,
// //   Button,
// //   Table,
// //   Alert,
// //   Badge,
// //   Spinner,
// //   Tabs,
// //   Tab,
// //   Pagination,
// // } from "react-bootstrap";
// // import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
// // import toast from "react-hot-toast";
// // import axios from "axios";

// // const API_BASE = "https://nlfs.in/erp/index.php/Api";   // list + delete
// // const ERP_BASE = "https://nlfs.in/erp/index.php/Erp";   // add_product_mst

// // const isOk = (val) =>
// //   val === true || val === "true" || val === 1 || val === "1";

// // /** Robust ID extractor (kept for future use) */
// // const extractId = (resData, possibleFields = ["id", "sub_prod_id"]) => {
// //   try {
// //     if (!resData) return null;
// //     for (const f of possibleFields) {
// //       if (resData[f] !== undefined && resData[f] !== null) return resData[f];
// //     }
// //     if (resData.data && typeof resData.data === "object" && !Array.isArray(resData.data)) {
// //       for (const f of possibleFields) {
// //         if (resData.data[f] !== undefined && resData.data[f] !== null)
// //           return resData.data[f];
// //       }
// //     }
// //     if (Array.isArray(resData.data) && resData.data.length > 0) {
// //       const first = resData.data[0];
// //       for (const f of possibleFields) {
// //         if (first && first[f] !== undefined && first[f] !== null) return first[f];
// //       }
// //     }
// //     const scanArrayForField = (arr) => {
// //       if (!Array.isArray(arr)) return null;
// //       for (const obj of arr) {
// //         for (const f of possibleFields) {
// //           if (obj && obj[f] !== undefined && obj[f] !== null) return obj[f];
// //         }
// //       }
// //       return null;
// //     };
// //     if (resData.data && Array.isArray(resData.data)) {
// //       const found = scanArrayForField(resData.data);
// //       if (found) return found;
// //     }
// //     return null;
// //   } catch (e) {
// //     console.warn("extractId error", e);
// //     return null;
// //   }
// // };

// // const ProductMaster = () => {
// //   // ---------- Data ----------
// //   const [brands, setBrands] = useState([]); // { id, brand_name }
// //   const [products, setProducts] = useState([]); // { id, product_name }
// //   const [subProducts, setSubProducts] = useState([]); // full cache from list_mst_sub_product
// //   const [rates, setRates] = useState([]);
// //   const [loading, setLoading] = useState(false);

// //   // ---------- Add-mode ----------
// //   const [brandName, setBrandName] = useState("");
// //   const [productsList, setProductsList] = useState([]);
// //   const [newProductForm, setNewProductForm] = useState({
// //     productName: "",
// //     subProductName: "",
// //     subProductDescription: "",
// //     subProductRate: "",
// //   });
// //   const [additionalSubForm, setAdditionalSubForm] = useState({
// //     productIndex: "",
// //     name: "",
// //     description: "",
// //     rate: "",
// //   });

// //   // ---------- Tabs ----------
// //   const [activeTab, setActiveTab] = useState("brand");

// //   // ---------- Brand/Product modes ----------
// //   const [useExistingBrand, setUseExistingBrand] = useState(false);
// //   const [existingBrandIdForAdd, setExistingBrandIdForAdd] = useState("");
// //   const [productMode, setProductMode] = useState("new");
// //   const [productSearchAdd, setProductSearchAdd] = useState("");
// //   const [existingProdIdForAdd, setExistingProdIdForAdd] = useState("");

// //   // ---------- View / misc ----------
// //   const [viewMode] = useState("add");
// //   const [brandSearch, setBrandSearch] = useState("");
// //   const [existingSubProducts, setExistingSubProducts] = useState([]);
// //   const [existingSubLoading, setExistingSubLoading] = useState(false);
// //   const [existingSubName, setExistingSubName] = useState("");
// //   const [existingSubDescription, setExistingSubDescription] = useState("");
// //   const [existingSubRate, setExistingSubRate] = useState("");
// //   const [existingSubSubmitting, setExistingSubSubmitting] = useState(false);

// //   // ---------- Pagination for existingSubProducts ----------
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const pageSize = 10;

// //   // ---------- Fetch all specs + derive brands/products ----------
// //   const fetchAllData = async () => {
// //     setLoading(true);
// //     try {
// //       const sR = await axios.post(
// //         `${API_BASE}/list_mst_sub_product`,
// //         {},
// //         { headers: { "Content-Type": "application/json" } }
// //       );
// //       const sD = sR.data;
// //       if (isOk(sD.status) && isOk(sD.success)) {
// //         const all = (sD.data || []).map((sp) => ({
// //           ...sp,
// //           id: sp.id || sp.sub_prod_id || sp.ID,
// //           brand: sp.brand || sp.brand_name || "",
// //           g3_category: sp.g3_category || sp.product_name || "",
// //           g4_sub_category: sp.g4_sub_category || "",
// //           item_name: sp.item_name || sp.sub_prod_name || "",
// //           uom: sp.uom || "",
// //           gst: sp.gst || "",
// //           hsn_code: sp.hsn_code || "",
// //           specification: sp.specification || sp.description || "",
// //           rate: sp.rate || "",
// //         }));
// //         setSubProducts(all);

// //         // derive brands
// //         const brandSet = new Set();
// //         const brandList = [];
// //         all.forEach((row) => {
// //           const b = (row.brand || "").toString();
// //           if (b && !brandSet.has(b)) {
// //             brandSet.add(b);
// //             brandList.push({ id: `b_${brandList.length + 1}`, brand_name: b });
// //           }
// //         });
// //         setBrands(brandList);

// //         // derive products (ALL products across brands; we'll brand-filter later)
// //         const prodSet = new Set();
// //         const prodList = [];
// //         all.forEach((row) => {
// //           const p = (row.g3_category || "").toString();
// //           if (p && !prodSet.has(p)) {
// //             prodSet.add(p);
// //             prodList.push({ id: `p_${prodList.length + 1}`, product_name: p });
// //           }
// //         });
// //         setProducts(prodList);

// //         setRates(
// //           all.map((r) => ({
// //             sub_prod_id: r.id,
// //             rate: r.rate,
// //             created_at: r.created_at,
// //           }))
// //         );
// //       } else {
// //         setSubProducts([]);
// //         setBrands([]);
// //         setProducts([]);
// //         setRates([]);
// //         toast.error(sD.message || "Failed to fetch specifications.");
// //       }
// //     } catch (err) {
// //       console.error("fetchAllData error", err);
// //       toast.error("Failed to load data");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchAllData();
// //   }, []);

// //   // ---------- Selected brand name (string) ----------
// //   const selectedBrandName = useMemo(() => {
// //     if (useExistingBrand) {
// //       return (
// //         brands.find((b) => String(b.id) === String(existingBrandIdForAdd))
// //           ?.brand_name || ""
// //       );
// //     }
// //     return brandName || "";
// //   }, [useExistingBrand, existingBrandIdForAdd, brands, brandName]);

// //   // ---------- Product/Sub-product Helpers for NEW mode ----------
// //   const handleAddNewProductWithSubProduct = () => {
// //     if (!newProductForm.productName.trim())
// //       return toast.error("Please enter a product name");
// //     if (!newProductForm.subProductName.trim())
// //       return toast.error("Please enter a sub-product name");

// //     const newProduct = {
// //       id: Date.now(),
// //       name: newProductForm.productName,
// //       subProducts: [
// //         {
// //           id: Date.now() + 1,
// //           name: newProductForm.subProductName,
// //           description: newProductForm.subProductDescription,
// //           rate: newProductForm.subProductRate,
// //         },
// //       ],
// //     };
// //     setProductsList((prev) => [...prev, newProduct]);
// //     setNewProductForm({
// //       productName: "",
// //       subProductName: "",
// //       subProductDescription: "",
// //       subProductRate: "",
// //     });
// //     toast.success("Product and Sub-product added to list");
// //   };

// //   const handleAddAdditionalSubProduct = () => {
// //     const { productIndex, name, description, rate } = additionalSubForm;
// //     if (productIndex === "" || !name.trim())
// //       return toast.error("Please select a product and enter a sub-product name");
// //     const newSubProduct = { id: Date.now(), name, description, rate };
// //     setProductsList((prev) =>
// //       prev.map((product, index) =>
// //         index === parseInt(productIndex, 10)
// //           ? {
// //               ...product,
// //               subProducts: product.subProducts
// //                 ? [...product.subProducts, newSubProduct]
// //                 : [newSubProduct],
// //             }
// //           : product
// //       )
// //     );
// //     setAdditionalSubForm({
// //       productIndex: "",
// //       name: "",
// //       description: "",
// //       rate: "",
// //     });
// //     toast.success("Additional sub-product added");
// //   };

// //   const removeProduct = (id) =>
// //     setProductsList((prev) => prev.filter((p) => p.id !== id));

// //   const removeSubProduct = (productId, subId) => {
// //     setProductsList((prev) =>
// //       prev.map((p) =>
// //         p.id === productId
// //           ? {
// //               ...p,
// //               subProducts: p.subProducts.filter((sp) => sp.id !== subId),
// //             }
// //           : p
// //       )
// //     );
// //   };

// //   // ---------- Submit All (NEW brand/products -> add_product_mst) ----------
// //   const handleSubmitAll = async () => {
// //     if (!useExistingBrand && !brandName.trim()) {
// //       return toast.error(
// //         "Please enter a brand name (or choose existing brand)."
// //       );
// //     }
// //     if (productsList.length === 0)
// //       return toast.error(
// //         "Add at least one product with sub-product before saving."
// //       );

// //     setLoading(true);
// //     try {
// //       const brandValue = (useExistingBrand
// //         ? selectedBrandName
// //         : brandName
// //       ).toString();

// //       for (const product of productsList) {
// //         const g3 = product.name;
// //         for (const sp of product.subProducts || []) {
// //           const payload = {
// //             brand: brandValue,
// //             g3_category: g3,
// //             g4_sub_category: "",
// //             item_name: sp.name || "",
// //             uom: sp.uom || "NOS",
// //             gst: sp.rate ? "18" : "",
// //             hsn_code: sp.hsn_code || "",
// //             specification: sp.description || "",
// //             rate:
// //               sp.rate === undefined || sp.rate === null || sp.rate === ""
// //                 ? ""
// //                 : String(sp.rate),
// //           };

// //           const res = await axios.post(
// //             `${ERP_BASE}/add_product_mst`,
// //             payload,
// //             {
// //               headers: { "Content-Type": "application/json" },
// //             }
// //           );
// //           if (!isOk(res.data.status) || !isOk(res.data.success)) {
// //             toast.error(
// //               `Failed to add ${sp.name}: ${
// //                 res.data.message || "API error"
// //               }`
// //             );
// //           } else {
// //             console.log("added spec row ->", res.data);
// //           }
// //         }
// //       }

// //       toast.success("All items submitted. Refreshing...");
// //       await fetchAllData();
// //       setProductsList([]);
// //       setBrandName("");
// //       setUseExistingBrand(false);
// //       setExistingBrandIdForAdd("");
// //       setActiveTab("brand");
// //     } catch (err) {
// //       console.error("handleSubmitAll error", err);
// //       toast.error("Error submitting items.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ---------- Fetch existing sub-products for a product (brand-aware) ----------
// //   const fetchExistingSubProducts = async (prodName, brandFilter) => {
// //     setExistingSubLoading(true);
// //     setCurrentPage(1);
// //     try {
// //       const targetProd = (prodName || "").toString();
// //       const targetBrand = (brandFilter || "").toString();

// //       // filter from local cache first
// //       const filteredLocal = subProducts.filter((sp) => {
// //         const p = (sp.g3_category || sp.product_name || "").toString();
// //         const b = (sp.brand || "").toString();
// //         if (!targetProd) return false;
// //         if (p !== targetProd) return false;
// //         if (targetBrand && b !== targetBrand) return false;
// //         return true;
// //       });

// //       if (filteredLocal.length > 0) {
// //         setExistingSubProducts(filteredLocal);
// //         setExistingSubLoading(false);
// //         return;
// //       }

// //       // fallback to API
// //       const res = await axios.post(
// //         `${API_BASE}/list_mst_sub_product`,
// //         {},
// //         { headers: { "Content-Type": "application/json" } }
// //       );
// //       if (isOk(res.data.status) && isOk(res.data.success)) {
// //         const all = (res.data.data || []).map((sp) => ({
// //           ...sp,
// //           id: sp.id || sp.sub_prod_id,
// //           brand: sp.brand || "",
// //           g3_category: sp.g3_category || sp.product_name || "",
// //           item_name: sp.item_name || sp.sub_prod_name || "",
// //           specification: sp.specification || sp.description || "",
// //           rate: sp.rate || "",
// //         }));
// //         const filtered = all.filter((sp) => {
// //           const p = (sp.g3_category || "").toString();
// //           const b = (sp.brand || "").toString();
// //           if (!targetProd) return false;
// //           if (p !== targetProd) return false;
// //           if (targetBrand && b !== targetBrand) return false;
// //           return true;
// //         });
// //         setExistingSubProducts(filtered);
// //       } else {
// //         setExistingSubProducts([]);
// //         toast.error(res.data.message || "Failed to fetch sub-products.");
// //       }
// //     } catch (err) {
// //       console.error("fetchExistingSubProducts error", err);
// //       toast.error("Error loading sub-products.");
// //     } finally {
// //       setExistingSubLoading(false);
// //     }
// //   };

// //   // ---------- React to selected product change in EXISTING mode ----------
// //   useEffect(() => {
// //     if (productMode === "existing" && existingProdIdForAdd) {
// //       fetchExistingSubProducts(existingProdIdForAdd, selectedBrandName);
// //     } else {
// //       setExistingSubProducts([]);
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [
// //     productMode,
// //     existingProdIdForAdd,
// //     subProducts,
// //     selectedBrandName,
// //   ]);

// //   // ---------- Add sub to existing product ----------
// //   const handleAddSubToExistingProduct = async (e) => {
// //     e.preventDefault();
// //     if (!existingProdIdForAdd)
// //       return toast.error("Please select a product.");
// //     if (!existingSubName.trim())
// //       return toast.error("Please enter sub-product name.");
// //     setExistingSubSubmitting(true);
// //     try {
// //       const brandValue = selectedBrandName.toString();

// //       const payload = {
// //         brand: brandValue,
// //         g3_category: existingProdIdForAdd, // product_name
// //         g4_sub_category: "",
// //         item_name: existingSubName.trim(),
// //         uom: "NOS",
// //         gst: existingSubRate ? "18" : "",
// //         hsn_code: "",
// //         specification: existingSubDescription || "",
// //         rate: existingSubRate ? String(existingSubRate) : "",
// //       };

// //       const res = await axios.post(
// //         `${ERP_BASE}/add_product_mst`,
// //         payload,
// //         {
// //           headers: { "Content-Type": "application/json" },
// //         }
// //       );

// //       console.log("add_product_mst (existing product) response:", res.data);
// //       if (!isOk(res.data.status) || !isOk(res.data.success)) {
// //         throw new Error(res.data.message || "Unknown API error");
// //       }

// //       toast.success("Sub-product added successfully.");
// //       setExistingSubName("");
// //       setExistingSubDescription("");
// //       setExistingSubRate("");
// //       await fetchAllData();
// //       fetchExistingSubProducts(existingProdIdForAdd, selectedBrandName);
// //     } catch (err) {
// //       console.error("Add sub-product error:", err);
// //       toast.error(`Error: ${err.message || err}`);
// //     } finally {
// //       setExistingSubSubmitting(false);
// //     }
// //   };

// //   // ---------- Delete helpers ----------
// //   const deleteExistingSubProduct = async (subProdId) => {
// //     if (!window.confirm("Delete this sub-product?")) return;
// //     try {
// //       const res = await axios.delete(
// //         `${API_BASE}/delete_mst_sub_product`,
// //         {
// //           headers: { "Content-Type": "application/json" },
// //           data: { id: subProdId },
// //         }
// //       );
// //       if (isOk(res.data.status) && isOk(res.data.success)) {
// //         toast.success("Sub-product deleted");
// //         setExistingSubProducts((prev) =>
// //           prev.filter((s) => String(s.id) !== String(subProdId))
// //         );
// //         fetchAllData();
// //       } else {
// //         toast.error(res.data.message || "Delete failed.");
// //       }
// //     } catch (err) {
// //       console.error("deleteExistingSubProduct error", err);
// //       toast.error("Error deleting sub-product.");
// //     }
// //   };

// //   const deleteBrand = async (brandNameVal) => {
// //     if (!window.confirm("Delete this brand and all its products?")) return;
// //     try {
// //       const toDelete = subProducts.filter(
// //         (sp) => String(sp.brand) === String(brandNameVal)
// //       );
// //       for (const r of toDelete) {
// //         try {
// //           await axios.delete(`${API_BASE}/delete_mst_sub_product`, {
// //             headers: { "Content-Type": "application/json" },
// //             data: { id: r.id },
// //           });
// //         } catch (e) {
// //           console.warn("failed deleting row", r.id, e);
// //         }
// //       }
// //       toast.success("Brand rows deleted (attempted). Refreshing.");
// //       fetchAllData();
// //     } catch (err) {
// //       console.error("deleteBrand error", err);
// //       toast.error("Failed to delete brand");
// //     }
// //   };

// //   const deleteProduct = async (productName) => {
// //     if (!window.confirm("Delete this product and all its sub-products?"))
// //       return;
// //     try {
// //       const toDelete = subProducts.filter(
// //         (sp) => String(sp.g3_category) === String(productName)
// //       );
// //       for (const r of toDelete) {
// //         try {
// //           await axios.delete(`${API_BASE}/delete_mst_sub_product`, {
// //             headers: { "Content-Type": "application/json" },
// //             data: { id: r.id },
// //           });
// //         } catch (e) {
// //           console.warn("failed deleting row", r.id, e);
// //         }
// //       }
// //       toast.success("Product rows deleted (attempted). Refreshing.");
// //       fetchAllData();
// //     } catch (err) {
// //       console.error("deleteProduct error", err);
// //       toast.error("Failed to delete product");
// //     }
// //   };

// //   // ---------- Brand-filtered products for EXISTING mode ----------
// //   const brandFilteredProducts = useMemo(() => {
// //     if (!selectedBrandName) return [];
// //     const set = new Set();
// //     const result = [];
// //     subProducts.forEach((sp) => {
// //       if (String(sp.brand) !== String(selectedBrandName)) return;
// //       const p = (sp.g3_category || "").toString();
// //       if (!p) return;
// //       if (!set.has(p)) {
// //         set.add(p);
// //         result.push({ id: `bp_${result.length + 1}`, product_name: p });
// //       }
// //     });
// //     return result;
// //   }, [subProducts, selectedBrandName]);

// //   // ---------- Pagination helpers ----------
// //   const totalExisting = existingSubProducts.length;
// //   const totalPages = Math.max(1, Math.ceil(totalExisting / pageSize));
// //   const paginatedExistingSubProducts = existingSubProducts.slice(
// //     (currentPage - 1) * pageSize,
// //     currentPage * pageSize
// //   );

// //   const handlePageChange = (page) => {
// //     if (page < 1 || page > totalPages) return;
// //     setCurrentPage(page);
// //     const el = document.querySelector(".card-body");
// //     if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
// //   };

// //   // ---------- Render ----------
// //   return (
// //     <Container fluid>
// //       <Row>
// //         <Col md="12">
// //           <Card className="strpied-tabled-with-hover">
// //             <Card.Header
// //               style={{ backgroundColor: "#fff", borderBottom: "none" }}
// //             >
// //               <Row className="align-items-center">
// //                 <Col>
// //                   <Card.Title
// //                     style={{ marginTop: "2rem", fontWeight: "700" }}
// //                   >
// //                     Products Master
// //                   </Card.Title>
// //                 </Col>
// //                 <Col className="d-flex justify-content-end align-items-center gap-2">
// //                   <Button
// //                     variant="outline-secondary"
// //                     onClick={() => setActiveTab("brand")}
// //                   >
// //                     <FaArrowLeft /> Back to Brand
// //                   </Button>
// //                 </Col>
// //               </Row>
// //             </Card.Header>
// //             <Card.Body>
// //               {viewMode === "add" ? (
// //                 <Tabs
// //                   activeKey={activeTab}
// //                   onSelect={(k) => setActiveTab(k)}
// //                   className="mb-4"
// //                 >
// //                   {/* Tab 1 - Brand */}
// //                   <Tab eventKey="brand" title="1. Brand">
// //                     <Card className="mb-4 border-0 shadow-none">
// //                       <Card.Body>
// //                         <div className="d-flex gap-4 mb-3">
// //                           <Form.Check
// //                             type="radio"
// //                             id="brand-new"
// //                             name="brand-mode"
// //                             label="Create New Brand"
// //                             checked={!useExistingBrand}
// //                             onChange={() => {
// //                               setUseExistingBrand(false);
// //                               setExistingBrandIdForAdd("");
// //                             }}
// //                           />
// //                           <Form.Check
// //                             type="radio"
// //                             id="brand-existing"
// //                             name="brand-mode"
// //                             label="Use Existing Brand"
// //                             checked={useExistingBrand}
// //                             onChange={() => {
// //                               setUseExistingBrand(true);
// //                               setBrandName("");
// //                             }}
// //                           />
// //                         </div>
// //                         {!useExistingBrand && (
// //                           <Form.Group className="mb-3">
// //                             <Form.Label>Brand Name</Form.Label>
// //                             <Form.Control
// //                               value={brandName}
// //                               onChange={(e) => setBrandName(e.target.value)}
// //                               placeholder="Enter brand name"
// //                             />
// //                             <Form.Text muted>
// //                               Example: LG, Samsung, Bosch, etc.
// //                             </Form.Text>
// //                           </Form.Group>
// //                         )}
// //                         {useExistingBrand && (
// //                           <>
// //                             <Form.Group className="mb-3">
// //                               <Form.Label>Search Brand</Form.Label>
// //                               <Form.Control
// //                                 type="text"
// //                                 placeholder="Type to filter brands..."
// //                                 value={brandSearch}
// //                                 onChange={(e) =>
// //                                   setBrandSearch(e.target.value)
// //                                 }
// //                               />
// //                             </Form.Group>
// //                             <Table striped hover size="sm">
// //                               <thead>
// //                                 <tr>
// //                                   <th>Sr No</th>
// //                                   <th>Brand Name</th>
// //                                   <th>Action</th>
// //                                 </tr>
// //                               </thead>
// //                               <tbody>
// //                                 {(brands || [])
// //                                   .filter(
// //                                     (b) =>
// //                                       !brandSearch.trim() ||
// //                                       String(b.brand_name || "")
// //                                         .toLowerCase()
// //                                         .includes(
// //                                           brandSearch.toLowerCase()
// //                                         )
// //                                   )
// //                                   .map((brand, idx) => (
// //                                     <tr
// //                                       key={brand.id}
// //                                       style={{ cursor: "pointer" }}
// //                                       onClick={() =>
// //                                         setExistingBrandIdForAdd(brand.id)
// //                                       }
// //                                     >
// //                                       <td>{idx + 1}</td>
// //                                       <td>{brand.brand_name}</td>
// //                                       <td className="text-end">
// //                                         <Button
// //                                           size="sm"
// //                                           variant="danger"
// //                                           onClick={(e) => {
// //                                             e.stopPropagation();
// //                                             deleteBrand(brand.brand_name);
// //                                           }}
// //                                         >
// //                                           <FaTrash />
// //                                         </Button>
// //                                       </td>
// //                                     </tr>
// //                                   ))}
// //                               </tbody>
// //                             </Table>
// //                           </>
// //                         )}
// //                         <div className="d-flex justify-content-end mt-3">
// //                           <Button
// //                             variant="primary"
// //                             onClick={() => {
// //                               if (!useExistingBrand && !brandName.trim()) {
// //                                 toast.error("Please enter a brand name");
// //                                 return;
// //                               }
// //                               if (useExistingBrand && !existingBrandIdForAdd) {
// //                                 toast.error("Please select a brand");
// //                                 return;
// //                               }
// //                               setActiveTab("products");
// //                             }}
// //                           >
// //                             Save and Proceed
// //                           </Button>
// //                         </div>
// //                       </Card.Body>
// //                     </Card>
// //                   </Tab>

// //                   {/* Tab 2 - Products & Sub-Products */}
// //                   <Tab eventKey="products" title="2. Products & Sub-Products">
// //                     <Card className="mb-4">
// //                       <Card.Header>Step 2: Products & Sub-Products</Card.Header>
// //                       <Card.Body>
// //                         <div className="d-flex justify-content-between mb-3">
// //                           <div>
// //                             <strong>Brand: </strong>
// //                             <Badge bg="secondary">
// //                               {selectedBrandName || "New Brand"}
// //                             </Badge>
// //                           </div>
// //                           <Button
// //                             size="sm"
// //                             variant="outline-secondary"
// //                             onClick={() => setActiveTab("brand")}
// //                           >
// //                             <FaArrowLeft />
// //                           </Button>
// //                         </div>

// //                         <div className="d-flex gap-4 mb-3">
// //                           <Form.Check
// //                             type="radio"
// //                             id="prod-mode-new"
// //                             name="prod-mode"
// //                             label="Create New Products"
// //                             checked={productMode === "new"}
// //                             onChange={() => setProductMode("new")}
// //                           />
// //                           <Form.Check
// //                             type="radio"
// //                             id="prod-mode-existing"
// //                             name="prod-mode"
// //                             label="Use Existing Product"
// //                             checked={productMode === "existing"}
// //                             onChange={() => setProductMode("existing")}
// //                           />
// //                         </div>

// //                         {/* NEW product mode */}
// //                         {productMode === "new" && (
// //                           <>
// //                             <Card className="mb-4">
// //                               <Card.Header>
// //                                 Add New Product & Sub-Product
// //                               </Card.Header>
// //                               <Card.Body>
// //                                 <Row className="g-2 mb-3">
// //                                   <Col md={12}>
// //                                     <Form.Label>Product Name</Form.Label>
// //                                     <Form.Control
// //                                       placeholder="Enter product name"
// //                                       value={newProductForm.productName}
// //                                       onChange={(e) =>
// //                                         setNewProductForm({
// //                                           ...newProductForm,
// //                                           productName: e.target.value,
// //                                         })
// //                                       }
// //                                     />
// //                                   </Col>
// //                                 </Row>
// //                                 <Row className="g-2 mb-3">
// //                                   <Col md={12}>
// //                                     <Form.Label>Sub-Product Name</Form.Label>
// //                                     <Form.Control
// //                                       placeholder="Enter sub-product name"
// //                                       value={newProductForm.subProductName}
// //                                       onChange={(e) =>
// //                                         setNewProductForm({
// //                                           ...newProductForm,
// //                                           subProductName: e.target.value,
// //                                         })
// //                                       }
// //                                     />
// //                                   </Col>
// //                                 </Row>
// //                                 <Row className="g-2 mb-3">
// //                                   <Col md={6}>
// //                                     <Form.Label>Rate</Form.Label>
// //                                     <Form.Control
// //                                       type="number"
// //                                       step="0.01"
// //                                       placeholder="Rate"
// //                                       value={newProductForm.subProductRate}
// //                                       onChange={(e) =>
// //                                         setNewProductForm({
// //                                           ...newProductForm,
// //                                           subProductRate: e.target.value,
// //                                         })
// //                                       }
// //                                     />
// //                                   </Col>
// //                                   <Col md={6}>
// //                                     <Form.Label>Description</Form.Label>
// //                                     <Form.Control
// //                                       as="textarea"
// //                                       rows={1}
// //                                       placeholder="Description"
// //                                       value={
// //                                         newProductForm.subProductDescription
// //                                       }
// //                                       onChange={(e) =>
// //                                         setNewProductForm({
// //                                           ...newProductForm,
// //                                           subProductDescription:
// //                                             e.target.value,
// //                                         })
// //                                       }
// //                                     />
// //                                   </Col>
// //                                 </Row>
// //                                 <Button
// //                                   variant="primary"
// //                                   onClick={handleAddNewProductWithSubProduct}
// //                                 >
// //                                   <FaPlus className="me-2" /> Add Product &
// //                                   Sub-Product
// //                                 </Button>
// //                               </Card.Body>
// //                             </Card>

// //                             {productsList.map((product) => (
// //                               <Card key={product.id} className="mb-2">
// //                                 <Card.Header className="d-flex justify-content-between align-items-center">
// //                                   <strong>{product.name}</strong>
// //                                   <Button
// //                                     variant="outline-danger"
// //                                     size="sm"
// //                                     onClick={() => removeProduct(product.id)}
// //                                   >
// //                                     <FaTrash />
// //                                   </Button>
// //                                 </Card.Header>
// //                                 <Card.Body>
// //                                   <Table striped bordered size="sm">
// //                                     <thead>
// //                                       <tr>
// //                                         <th>Name</th>
// //                                         <th>Description</th>
// //                                         <th>Rate</th>
// //                                         <th>Action</th>
// //                                       </tr>
// //                                     </thead>
// //                                     <tbody>
// //                                       {(product.subProducts || []).map((sp) => (
// //                                         <tr key={sp.id}>
// //                                           <td>{sp.name}</td>
// //                                           <td>{sp.description || "-"}</td>
// //                                           <td>{sp.rate || "-"}</td>
// //                                           <td>
// //                                             <Button
// //                                               size="sm"
// //                                               variant="outline-danger"
// //                                               onClick={() =>
// //                                                 removeSubProduct(
// //                                                   product.id,
// //                                                   sp.id
// //                                                 )
// //                                               }
// //                                             >
// //                                               <FaTrash />
// //                                             </Button>
// //                                           </td>
// //                                         </tr>
// //                                       ))}
// //                                     </tbody>
// //                                   </Table>
// //                                 </Card.Body>
// //                               </Card>
// //                             ))}

// //                             {productsList.length > 0 && (
// //                               <Card className="mt-4">
// //                                 <Card.Header>
// //                                   Add Additional Sub-Product
// //                                 </Card.Header>
// //                                 <Card.Body>
// //                                   <Row className="g-2 mb-3">
// //                                     <Col md={4}>
// //                                       <Form.Label>Select Product</Form.Label>
// //                                       <Form.Select
// //                                         value={additionalSubForm.productIndex}
// //                                         onChange={(e) =>
// //                                           setAdditionalSubForm({
// //                                             ...additionalSubForm,
// //                                             productIndex: e.target.value,
// //                                           })
// //                                         }
// //                                       >
// //                                         <option value="">
// //                                           -- Select Product --
// //                                         </option>
// //                                         {productsList.map((p, index) => (
// //                                           <option key={p.id} value={index}>
// //                                             {p.name}
// //                                           </option>
// //                                         ))}
// //                                       </Form.Select>
// //                                     </Col>
// //                                     <Col md={8}>
// //                                       <Form.Label>Sub-Product Name</Form.Label>
// //                                       <Form.Control
// //                                         placeholder="Enter sub-product name"
// //                                         value={additionalSubForm.name}
// //                                         onChange={(e) =>
// //                                           setAdditionalSubForm({
// //                                             ...additionalSubForm,
// //                                             name: e.target.value,
// //                                           })
// //                                         }
// //                                       />
// //                                     </Col>
// //                                   </Row>
// //                                   <Row className="g-2 mb-3">
// //                                     <Col md={6}>
// //                                       <Form.Label>Rate</Form.Label>
// //                                       <Form.Control
// //                                         type="number"
// //                                         step="0.01"
// //                                         placeholder="Rate"
// //                                         value={additionalSubForm.rate}
// //                                         onChange={(e) =>
// //                                           setAdditionalSubForm({
// //                                             ...additionalSubForm,
// //                                             rate: e.target.value,
// //                                           })
// //                                         }
// //                                       />
// //                                     </Col>
// //                                     <Col md={6}>
// //                                       <Form.Label>Description</Form.Label>
// //                                       <Form.Control
// //                                         as="textarea"
// //                                         rows={1}
// //                                         placeholder="Description"
// //                                         value={additionalSubForm.description}
// //                                         onChange={(e) =>
// //                                           setAdditionalSubForm({
// //                                             ...additionalSubForm,
// //                                             description: e.target.value,
// //                                           })
// //                                         }
// //                                       />
// //                                     </Col>
// //                                   </Row>
// //                                   <Button
// //                                     variant="secondary"
// //                                     onClick={handleAddAdditionalSubProduct}
// //                                   >
// //                                     <FaPlus className="me-2" /> Add Sub-Product
// //                                   </Button>
// //                                 </Card.Body>
// //                               </Card>
// //                             )}

// //                             <div className="d-flex justify-content-end mt-4">
// //                               <Button
// //                                 variant="success"
// //                                 onClick={handleSubmitAll}
// //                                 disabled={loading}
// //                               >
// //                                 {loading ? (
// //                                   <Spinner size="sm" animation="border" />
// //                                 ) : (
// //                                   "Save All"
// //                                 )}
// //                               </Button>
// //                             </div>
// //                           </>
// //                         )}

// //                         {/* EXISTING product mode */}
// //                         {productMode === "existing" && (
// //                           <>
// //                             {!useExistingBrand && (
// //                               <Alert variant="warning">
// //                                 To use an existing product, please choose{" "}
// //                                 <strong>Use Existing Brand</strong> in the Brand
// //                                 tab.
// //                               </Alert>
// //                             )}
// //                             {useExistingBrand && (
// //                               <>
// //                                 <Form.Group className="mb-3">
// //                                   <Form.Label>Search Product</Form.Label>
// //                                   <Form.Control
// //                                     type="text"
// //                                     placeholder="Filter products by name..."
// //                                     value={productSearchAdd}
// //                                     onChange={(e) =>
// //                                       setProductSearchAdd(e.target.value)
// //                                     }
// //                                   />
// //                                 </Form.Group>
// //                                 <Table striped hover size="sm">
// //                                   <thead>
// //                                     <tr>
// //                                       <th>Sr. No</th>
// //                                       <th>Product Name</th>
// //                                       <th>Action</th>
// //                                     </tr>
// //                                   </thead>
// //                                   <tbody>
// //                                     {brandFilteredProducts
// //                                       .filter(
// //                                         (p) =>
// //                                           !productSearchAdd.trim() ||
// //                                           String(
// //                                             p.product_name || ""
// //                                           )
// //                                             .toLowerCase()
// //                                             .includes(
// //                                               productSearchAdd.toLowerCase()
// //                                             )
// //                                       )
// //                                       .map((product, idx) => (
// //                                         <tr
// //                                           key={product.id || product.product_name}
// //                                           onClick={() => {
// //                                             const canonicalName = String(
// //                                               product.product_name ||
// //                                                 product.g3_category ||
// //                                                 ""
// //                                             );
// //                                             console.log(
// //                                               "product clicked ->",
// //                                               product,
// //                                               "canonicalName:",
// //                                               canonicalName
// //                                             );
// //                                             setExistingProdIdForAdd(
// //                                               canonicalName
// //                                             );
// //                                           }}
// //                                           style={{ cursor: "pointer" }}
// //                                         >
// //                                           <td>{idx + 1}</td>
// //                                           <td>{product.product_name}</td>
// //                                           <td className="text-end">
// //                                             <Button
// //                                               size="sm"
// //                                               variant="danger"
// //                                               onClick={(e) => {
// //                                                 e.stopPropagation();
// //                                                 deleteProduct(
// //                                                   product.product_name
// //                                                 );
// //                                               }}
// //                                             >
// //                                               <FaTrash />
// //                                             </Button>
// //                                           </td>
// //                                         </tr>
// //                                       ))}
// //                                   </tbody>
// //                                 </Table>

// //                                 {existingProdIdForAdd && (
// //                                   <Card className="mt-3">
// //                                     <Card.Header>
// //                                       Managing Sub-Products for:{" "}
// //                                       <Badge bg="info">
// //                                         {existingProdIdForAdd || "Unknown"}
// //                                       </Badge>
// //                                     </Card.Header>
// //                                     <Card.Body>
// //                                       <Form
// //                                         onSubmit={handleAddSubToExistingProduct}
// //                                         className="mb-3"
// //                                       >
// //                                         <Row className="g-2 mb-3">
// //                                           <Col md={6}>
// //                                             <Form.Control
// //                                               placeholder="Enter sub-product name"
// //                                               value={existingSubName}
// //                                               onChange={(e) =>
// //                                                 setExistingSubName(
// //                                                   e.target.value
// //                                                 )
// //                                               }
// //                                               required
// //                                             />
// //                                           </Col>
// //                                           <Col md={3}>
// //                                             <Form.Control
// //                                               placeholder="Rate"
// //                                               type="number"
// //                                               step="0.01"
// //                                               value={existingSubRate}
// //                                               onChange={(e) =>
// //                                                 setExistingSubRate(
// //                                                   e.target.value
// //                                                 )
// //                                               }
// //                                             />
// //                                           </Col>
// //                                           <Col md={3}>
// //                                             <Button
// //                                               type="submit"
// //                                               variant="primary"
// //                                               className="w-100"
// //                                               disabled={existingSubSubmitting}
// //                                             >
// //                                               {existingSubSubmitting ? (
// //                                                 <Spinner
// //                                                   size="sm"
// //                                                   animation="border"
// //                                                 />
// //                                               ) : (
// //                                                 <>
// //                                                   <FaPlus className="me-1" /> Add
// //                                                   Sub
// //                                                 </>
// //                                               )}
// //                                             </Button>
// //                                           </Col>
// //                                         </Row>
// //                                         <Row className="g-2 mb-3">
// //                                           <Col md={12}>
// //                                             <Form.Control
// //                                               as="textarea"
// //                                               rows={2}
// //                                               placeholder="Description (optional)"
// //                                               value={existingSubDescription}
// //                                               onChange={(e) =>
// //                                                 setExistingSubDescription(
// //                                                   e.target.value
// //                                                 )
// //                                               }
// //                                             />
// //                                           </Col>
// //                                         </Row>
// //                                       </Form>

// //                                       {existingSubLoading ? (
// //                                         <div className="text-center p-3">
// //                                           <Spinner
// //                                             animation="border"
// //                                             size="sm"
// //                                           />
// //                                           <p className="mt-2">
// //                                             Loading sub-products...
// //                                           </p>
// //                                         </div>
// //                                       ) : (
// //                                         <>
// //                                           <Table striped hover size="sm">
// //                                             <thead>
// //                                               <tr>
// //                                                 <th>Sr No</th>
// //                                                 <th>Sub-product</th>
// //                                                 <th>Description</th>
// //                                                 <th>Rate</th>
// //                                                 <th>Action</th>
// //                                               </tr>
// //                                             </thead>
// //                                             <tbody>
// //                                               {paginatedExistingSubProducts.map(
// //                                                 (s, idx) => {
// //                                                   const indexInFull =
// //                                                     (currentPage - 1) *
// //                                                       pageSize +
// //                                                     idx;
// //                                                   const latestRate =
// //                                                     s.rate || "";
// //                                                   return (
// //                                                     <tr key={s.id}>
// //                                                       <td>
// //                                                         {indexInFull + 1}
// //                                                       </td>
// //                                                       <td>
// //                                                         {s.item_name ||
// //                                                           s.sub_prod_name ||
// //                                                           "-"}
// //                                                       </td>
// //                                                       <td>
// //                                                         {s.specification ||
// //                                                           "-"}
// //                                                       </td>
// //                                                       <td>
// //                                                         {latestRate || "-"}
// //                                                       </td>
// //                                                       <td>
// //                                                         <Button
// //                                                           size="sm"
// //                                                           variant="danger"
// //                                                           onClick={() =>
// //                                                             deleteExistingSubProduct(
// //                                                               s.id
// //                                                             )
// //                                                           }
// //                                                         >
// //                                                           <FaTrash />
// //                                                         </Button>
// //                                                       </td>
// //                                                     </tr>
// //                                                   );
// //                                                 }
// //                                               )}
// //                                             </tbody>
// //                                           </Table>

// //                                           {totalExisting > pageSize && (
// //                                             <div className="d-flex justify-content-center mt-3">
// //                                               <Pagination>
// //                                                 <Pagination.Prev
// //                                                   onClick={() =>
// //                                                     handlePageChange(
// //                                                       currentPage - 1
// //                                                     )
// //                                                   }
// //                                                   disabled={
// //                                                     currentPage === 1
// //                                                   }
// //                                                 />
// //                                                 {Array.from(
// //                                                   { length: totalPages },
// //                                                   (_, i) => {
// //                                                     const page = i + 1;
// //                                                     if (totalPages > 7) {
// //                                                       if (
// //                                                         page === 1 ||
// //                                                         page === totalPages ||
// //                                                         (page >=
// //                                                           currentPage - 2 &&
// //                                                           page <=
// //                                                             currentPage + 2)
// //                                                       ) {
// //                                                         return (
// //                                                           <Pagination.Item
// //                                                             key={page}
// //                                                             active={
// //                                                               page ===
// //                                                               currentPage
// //                                                             }
// //                                                             onClick={() =>
// //                                                               handlePageChange(
// //                                                                 page
// //                                                               )
// //                                                             }
// //                                                           >
// //                                                             {page}
// //                                                           </Pagination.Item>
// //                                                         );
// //                                                       }
// //                                                       if (
// //                                                         page === 2 &&
// //                                                         currentPage > 4
// //                                                       ) {
// //                                                         return (
// //                                                           <Pagination.Ellipsis
// //                                                             key="e1"
// //                                                             disabled
// //                                                           />
// //                                                         );
// //                                                       }
// //                                                       if (
// //                                                         page ===
// //                                                           totalPages - 1 &&
// //                                                         currentPage <
// //                                                           totalPages - 3
// //                                                       ) {
// //                                                         return (
// //                                                           <Pagination.Ellipsis
// //                                                             key="e2"
// //                                                             disabled
// //                                                           />
// //                                                         );
// //                                                       }
// //                                                       return null;
// //                                                     }
// //                                                     return (
// //                                                       <Pagination.Item
// //                                                         key={page}
// //                                                         active={
// //                                                           page === currentPage
// //                                                         }
// //                                                         onClick={() =>
// //                                                           handlePageChange(
// //                                                             page
// //                                                           )
// //                                                         }
// //                                                       >
// //                                                         {page}
// //                                                       </Pagination.Item>
// //                                                     );
// //                                                   }
// //                                                 )}
// //                                                 <Pagination.Next
// //                                                   onClick={() =>
// //                                                     handlePageChange(
// //                                                       currentPage + 1
// //                                                     )
// //                                                   }
// //                                                   disabled={
// //                                                     currentPage === totalPages
// //                                                   }
// //                                                 />
// //                                               </Pagination>
// //                                             </div>
// //                                           )}
// //                                         </>
// //                                       )}
// //                                     </Card.Body>
// //                                   </Card>
// //                                 )}
// //                               </>
// //                             )}
// //                           </>
// //                         )}
// //                       </Card.Body>
// //                     </Card>
// //                   </Tab>
// //                 </Tabs>
// //               ) : (
// //                 <Alert variant="info">
// //                   View mode (existing data management).
// //                 </Alert>
// //               )}
// //             </Card.Body>
// //           </Card>
// //         </Col>
// //       </Row>
// //     </Container>
// //   );
// // };

// // export default ProductMaster;

// // src/forms/ProductMaster.jsx
// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Table,
//   Alert,
//   Badge,
//   Spinner,
//   Tabs,
//   Tab,
//   Pagination,
// } from "react-bootstrap";
// import {
//   FaPlus,
//   FaTrash,
//   FaArrowLeft,
//   FaEdit,
//   FaSave,
//   FaTimes,
// } from "react-icons/fa";
// import toast from "react-hot-toast";
// import axios from "axios";

// const API_BASE = "https://nlfs.in/erp/index.php/Api"; // list + delete
// const ERP_BASE = "https://nlfs.in/erp/index.php/Erp"; // add_product_mst + update_specification

// const isOk = (val) =>
//   val === true || val === "true" || val === 1 || val === "1";

// /** Robust ID extractor (kept for future use) */
// const extractId = (resData, possibleFields = ["id", "sub_prod_id"]) => {
//   try {
//     if (!resData) return null;
//     for (const f of possibleFields) {
//       if (resData[f] !== undefined && resData[f] !== null) return resData[f];
//     }
//     if (resData.data && typeof resData.data === "object" && !Array.isArray(resData.data)) {
//       for (const f of possibleFields) {
//         if (resData.data[f] !== undefined && resData.data[f] !== null)
//           return resData.data[f];
//       }
//     }
//     if (Array.isArray(resData.data) && resData.data.length > 0) {
//       const first = resData.data[0];
//       for (const f of possibleFields) {
//         if (first && first[f] !== undefined && first[f] !== null) return first[f];
//       }
//     }
//     const scanArrayForField = (arr) => {
//       if (!Array.isArray(arr)) return null;
//       for (const obj of arr) {
//         for (const f of possibleFields) {
//           if (obj && obj[f] !== undefined && obj[f] !== null) return obj[f];
//         }
//       }
//       return null;
//     };
//     if (resData.data && Array.isArray(resData.data)) {
//       const found = scanArrayForField(resData.data);
//       if (found) return found;
//     }
//     return null;
//   } catch (e) {
//     console.warn("extractId error", e);
//     return null;
//   }
// };

// const ProductMaster = () => {
//   // ---------- Data ----------
//   const [brands, setBrands] = useState([]); // { id, brand_name }
//   const [products, setProducts] = useState([]); // { id, product_name }
//   const [subProducts, setSubProducts] = useState([]); // full cache from list_mst_sub_product
//   const [rates, setRates] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // ---------- Add-mode ----------
//   const [brandName, setBrandName] = useState("");
//   const [productsList, setProductsList] = useState([]);
//   const [newProductForm, setNewProductForm] = useState({
//     productName: "",
//     subProductName: "",
//     subProductDescription: "",
//     subProductRate: "",
//   });
//   const [additionalSubForm, setAdditionalSubForm] = useState({
//     productIndex: "",
//     name: "",
//     description: "",
//     rate: "",
//   });

//   // ---------- Tabs ----------
//   const [activeTab, setActiveTab] = useState("brand");

//   // ---------- Brand/Product modes ----------
//   const [useExistingBrand, setUseExistingBrand] = useState(false);
//   const [existingBrandIdForAdd, setExistingBrandIdForAdd] = useState("");
//   const [productMode, setProductMode] = useState("new");
//   const [productSearchAdd, setProductSearchAdd] = useState("");
//   const [existingProdIdForAdd, setExistingProdIdForAdd] = useState("");

//   // ---------- View / misc ----------
//   const [viewMode] = useState("add");
//   const [brandSearch, setBrandSearch] = useState("");
//   const [existingSubProducts, setExistingSubProducts] = useState([]);
//   const [existingSubLoading, setExistingSubLoading] = useState(false);
//   const [existingSubName, setExistingSubName] = useState("");
//   const [existingSubDescription, setExistingSubDescription] = useState("");
//   const [existingSubRate, setExistingSubRate] = useState("");
//   const [existingSubSubmitting, setExistingSubSubmitting] = useState(false);

//   // ---------- Pagination for existingSubProducts ----------
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 10;

//   // ---------- Edit existing sub-product (inline) ----------
//   const [editingSubId, setEditingSubId] = useState(null);
//   const [editDescription, setEditDescription] = useState("");
//   const [editRate, setEditRate] = useState("");
//   const [editSubmitting, setEditSubmitting] = useState(false);

//   // ---------- Fetch all specs + derive brands/products ----------
//   const fetchAllData = async () => {
//     setLoading(true);
//     try {
//       const sR = await axios.post(
//         `${API_BASE}/list_mst_sub_product`,
//         {},
//         { headers: { "Content-Type": "application/json" } }
//       );
//       const sD = sR.data;
//       if (isOk(sD.status) && isOk(sD.success)) {
//         const all = (sD.data || []).map((sp) => ({
//           ...sp,
//           id: sp.id || sp.sub_prod_id || sp.ID,
//           brand: sp.brand || sp.brand_name || "",
//           g3_category: sp.g3_category || sp.product_name || "",
//           g4_sub_category: sp.g4_sub_category || "",
//           item_name: sp.item_name || sp.sub_prod_name || "",
//           uom: sp.uom || "",
//           gst: sp.gst || "",
//           hsn_code: sp.hsn_code || "",
//           specification: sp.specification || sp.description || "",
//           rate: sp.rate || "",
//         }));
//         setSubProducts(all);

//         // derive brands
//         const brandSet = new Set();
//         const brandList = [];
//         all.forEach((row) => {
//           const b = (row.brand || "").toString();
//           if (b && !brandSet.has(b)) {
//             brandSet.add(b);
//             brandList.push({ id: `b_${brandList.length + 1}`, brand_name: b });
//           }
//         });
//         setBrands(brandList);

//         // derive products (ALL products across brands; we'll brand-filter later)
//         const prodSet = new Set();
//         const prodList = [];
//         all.forEach((row) => {
//           const p = (row.g3_category || "").toString();
//           if (p && !prodSet.has(p)) {
//             prodSet.add(p);
//             prodList.push({ id: `p_${prodList.length + 1}`, product_name: p });
//           }
//         });
//         setProducts(prodList);

//         setRates(
//           all.map((r) => ({
//             sub_prod_id: r.id,
//             rate: r.rate,
//             created_at: r.created_at,
//           }))
//         );
//       } else {
//         setSubProducts([]);
//         setBrands([]);
//         setProducts([]);
//         setRates([]);
//         toast.error(sD.message || "Failed to fetch specifications.");
//       }
//     } catch (err) {
//       console.error("fetchAllData error", err);
//       toast.error("Failed to load data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   // ---------- Selected brand name (string) ----------
//   const selectedBrandName = useMemo(() => {
//     if (useExistingBrand) {
//       return (
//         brands.find((b) => String(b.id) === String(existingBrandIdForAdd))
//           ?.brand_name || ""
//       );
//     }
//     return brandName || "";
//   }, [useExistingBrand, existingBrandIdForAdd, brands, brandName]);

//   // ---------- Product/Sub-product Helpers for NEW mode ----------
//   const handleAddNewProductWithSubProduct = () => {
//     if (!newProductForm.productName.trim())
//       return toast.error("Please enter a product name");
//     if (!newProductForm.subProductName.trim())
//       return toast.error("Please enter a sub-product name");

//     const newProduct = {
//       id: Date.now(),
//       name: newProductForm.productName,
//       subProducts: [
//         {
//           id: Date.now() + 1,
//           name: newProductForm.subProductName,
//           description: newProductForm.subProductDescription,
//           rate: newProductForm.subProductRate,
//         },
//       ],
//     };
//     setProductsList((prev) => [...prev, newProduct]);
//     setNewProductForm({
//       productName: "",
//       subProductName: "",
//       subProductDescription: "",
//       subProductRate: "",
//     });
//     toast.success("Product and Sub-product added to list");
//   };

//   const handleAddAdditionalSubProduct = () => {
//     const { productIndex, name, description, rate } = additionalSubForm;
//     if (productIndex === "" || !name.trim())
//       return toast.error("Please select a product and enter a sub-product name");
//     const newSubProduct = { id: Date.now(), name, description, rate };
//     setProductsList((prev) =>
//       prev.map((product, index) =>
//         index === parseInt(productIndex, 10)
//           ? {
//               ...product,
//               subProducts: product.subProducts
//                 ? [...product.subProducts, newSubProduct]
//                 : [newSubProduct],
//             }
//           : product
//       )
//     );
//     setAdditionalSubForm({
//       productIndex: "",
//       name: "",
//       description: "",
//       rate: "",
//     });
//     toast.success("Additional sub-product added");
//   };

//   const removeProduct = (id) =>
//     setProductsList((prev) => prev.filter((p) => p.id !== id));

//   const removeSubProduct = (productId, subId) => {
//     setProductsList((prev) =>
//       prev.map((p) =>
//         p.id === productId
//           ? {
//               ...p,
//               subProducts: p.subProducts.filter((sp) => sp.id !== subId),
//             }
//           : p
//       )
//     );
//   };

//   // ---------- Submit All (NEW brand/products -> add_product_mst) ----------
//   const handleSubmitAll = async () => {
//     if (!useExistingBrand && !brandName.trim()) {
//       return toast.error(
//         "Please enter a brand name (or choose existing brand)."
//       );
//     }
//     if (productsList.length === 0)
//       return toast.error(
//         "Add at least one product with sub-product before saving."
//       );

//     setLoading(true);
//     try {
//       const brandValue = (useExistingBrand
//         ? selectedBrandName
//         : brandName
//       ).toString();

//       for (const product of productsList) {
//         const g3 = product.name;
//         for (const sp of product.subProducts || []) {
//           const payload = {
//             brand: brandValue,
//             g3_category: g3,
//             g4_sub_category: "",
//             item_name: sp.name || "",
//             uom: sp.uom || "NOS",
//             gst: sp.rate ? "18" : "",
//             hsn_code: sp.hsn_code || "",
//             specification: sp.description || "",
//             rate:
//               sp.rate === undefined || sp.rate === null || sp.rate === ""
//                 ? ""
//                 : String(sp.rate),
//           };

//           const res = await axios.post(
//             `${ERP_BASE}/add_product_mst`,
//             payload,
//             {
//               headers: { "Content-Type": "application/json" },
//             }
//           );
//           if (!isOk(res.data.status) || !isOk(res.data.success)) {
//             toast.error(
//               `Failed to add ${sp.name}: ${
//                 res.data.message || "API error"
//               }`
//             );
//           } else {
//             console.log("added spec row ->", res.data);
//           }
//         }
//       }

//       toast.success("All items submitted. Refreshing...");
//       await fetchAllData();
//       setProductsList([]);
//       setBrandName("");
//       setUseExistingBrand(false);
//       setExistingBrandIdForAdd("");
//       setActiveTab("brand");
//     } catch (err) {
//       console.error("handleSubmitAll error", err);
//       toast.error("Error submitting items.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Fetch existing sub-products for a product (brand-aware) ----------
//   const fetchExistingSubProducts = async (prodName, brandFilter) => {
//     setExistingSubLoading(true);
//     setCurrentPage(1);
//     try {
//       const targetProd = (prodName || "").toString();
//       const targetBrand = (brandFilter || "").toString();

//       // filter from local cache first
//       const filteredLocal = subProducts.filter((sp) => {
//         const p = (sp.g3_category || sp.product_name || "").toString();
//         const b = (sp.brand || "").toString();
//         if (!targetProd) return false;
//         if (p !== targetProd) return false;
//         if (targetBrand && b !== targetBrand) return false;
//         return true;
//       });

//       if (filteredLocal.length > 0) {
//         setExistingSubProducts(filteredLocal);
//         setExistingSubLoading(false);
//         return;
//       }

//       // fallback to API
//       const res = await axios.post(
//         `${API_BASE}/list_mst_sub_product`,
//         {},
//         { headers: { "Content-Type": "application/json" } }
//       );
//       if (isOk(res.data.status) && isOk(res.data.success)) {
//         const all = (res.data.data || []).map((sp) => ({
//           ...sp,
//           id: sp.id || sp.sub_prod_id,
//           brand: sp.brand || "",
//           g3_category: sp.g3_category || sp.product_name || "",
//           g4_sub_category: sp.g4_sub_category || "",
//           item_name: sp.item_name || sp.sub_prod_name || "",
//           uom: sp.uom || "",
//           gst: sp.gst || "",
//           hsn_code: sp.hsn_code || "",
//           specification: sp.specification || sp.description || "",
//           rate: sp.rate || "",
//         }));
//         const filtered = all.filter((sp) => {
//           const p = (sp.g3_category || "").toString();
//           const b = (sp.brand || "").toString();
//           if (!targetProd) return false;
//           if (p !== targetProd) return false;
//           if (targetBrand && b !== targetBrand) return false;
//           return true;
//         });
//         setExistingSubProducts(filtered);
//       } else {
//         setExistingSubProducts([]);
//         toast.error(res.data.message || "Failed to fetch sub-products.");
//       }
//     } catch (err) {
//       console.error("fetchExistingSubProducts error", err);
//       toast.error("Error loading sub-products.");
//     } finally {
//       setExistingSubLoading(false);
//     }
//   };

//   // ---------- React to selected product change in EXISTING mode ----------
//   useEffect(() => {
//     if (productMode === "existing" && existingProdIdForAdd) {
//       fetchExistingSubProducts(existingProdIdForAdd, selectedBrandName);
//     } else {
//       setExistingSubProducts([]);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [productMode, existingProdIdForAdd, subProducts, selectedBrandName]);

//   // ---------- Add sub to existing product ----------
//   const handleAddSubToExistingProduct = async (e) => {
//     e.preventDefault();
//     if (!existingProdIdForAdd)
//       return toast.error("Please select a product.");
//     if (!existingSubName.trim())
//       return toast.error("Please enter sub-product name.");
//     setExistingSubSubmitting(true);
//     try {
//       const brandValue = selectedBrandName.toString();

//       const payload = {
//         brand: brandValue,
//         g3_category: existingProdIdForAdd, // product_name
//         g4_sub_category: "",
//         item_name: existingSubName.trim(),
//         uom: "NOS",
//         gst: existingSubRate ? "18" : "",
//         hsn_code: "",
//         specification: existingSubDescription || "",
//         rate: existingSubRate ? String(existingSubRate) : "",
//       };

//       const res = await axios.post(
//         `${ERP_BASE}/add_product_mst`,
//         payload,
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       console.log("add_product_mst (existing product) response:", res.data);
//       if (!isOk(res.data.status) || !isOk(res.data.success)) {
//         throw new Error(res.data.message || "Unknown API error");
//       }

//       toast.success("Sub-product added successfully.");
//       setExistingSubName("");
//       setExistingSubDescription("");
//       setExistingSubRate("");
//       await fetchAllData();
//       fetchExistingSubProducts(existingProdIdForAdd, selectedBrandName);
//     } catch (err) {
//       console.error("Add sub-product error:", err);
//       toast.error(`Error: ${err.message || err}`);
//     } finally {
//       setExistingSubSubmitting(false);
//     }
//   };

//   // ---------- Update existing sub-product (description + rate) ----------
//   const handleUpdateSubProduct = async (row) => {
//     if (!editingSubId) return;

//     setEditSubmitting(true);
//     try {
//       const payload = {
//         id: row.id,
//         brand: row.brand || "",
//         g3_category: row.g3_category || "",
//         g4_sub_category: row.g4_sub_category || "",
//         item_name: row.item_name || row.sub_prod_name || "",
//         uom: row.uom || "NOS",
//         gst: row.gst || "",
//         hsn_code: row.hsn_code || "",
//         specification: editDescription || "",
//         rate: editRate === "" ? "" : String(editRate),
//       };

//       const res = await axios.post(
//         `${ERP_BASE}/update_specification`,
//         payload,
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       console.log("update_specification response:", res.data);

//       if (!isOk(res.data.status) || !isOk(res.data.success)) {
//         throw new Error(res.data.message || "Unknown API error");
//       }

//       toast.success("Sub-product updated successfully.");

//       setEditingSubId(null);
//       setEditDescription("");
//       setEditRate("");

//       // refresh global + local data
//       await fetchAllData();
//       if (productMode === "existing" && existingProdIdForAdd) {
//         fetchExistingSubProducts(existingProdIdForAdd, selectedBrandName);
//       }
//     } catch (err) {
//       console.error("Update sub-product error:", err);
//       toast.error(`Error: ${err.message || err}`);
//     } finally {
//       setEditSubmitting(false);
//     }
//   };

//   const cancelEditSubProduct = () => {
//     setEditingSubId(null);
//     setEditDescription("");
//     setEditRate("");
//   };

//   // ---------- Delete helpers ----------
//   const deleteExistingSubProduct = async (subProdId) => {
//     if (!window.confirm("Delete this sub-product?")) return;
//     try {
//       const res = await axios.delete(
//         `${API_BASE}/delete_mst_sub_product`,
//         {
//           headers: { "Content-Type": "application/json" },
//           data: { id: subProdId },
//         }
//       );
//       if (isOk(res.data.status) && isOk(res.data.success)) {
//         toast.success("Sub-product deleted");
//         setExistingSubProducts((prev) =>
//           prev.filter((s) => String(s.id) !== String(subProdId))
//         );
//         fetchAllData();
//       } else {
//         toast.error(res.data.message || "Delete failed.");
//       }
//     } catch (err) {
//       console.error("deleteExistingSubProduct error", err);
//       toast.error("Error deleting sub-product.");
//     }
//   };

//   const deleteBrand = async (brandNameVal) => {
//     if (!window.confirm("Delete this brand and all its products?")) return;
//     try {
//       const toDelete = subProducts.filter(
//         (sp) => String(sp.brand) === String(brandNameVal)
//       );
//       for (const r of toDelete) {
//         try {
//           await axios.delete(`${API_BASE}/delete_mst_sub_product`, {
//             headers: { "Content-Type": "application/json" },
//             data: { id: r.id },
//           });
//         } catch (e) {
//           console.warn("failed deleting row", r.id, e);
//         }
//       }
//       toast.success("Brand rows deleted (attempted). Refreshing.");
//       fetchAllData();
//     } catch (err) {
//       console.error("deleteBrand error", err);
//       toast.error("Failed to delete brand");
//     }
//   };

//   const deleteProduct = async (productName) => {
//     if (!window.confirm("Delete this product and all its sub-products?"))
//       return;
//     try {
//       const toDelete = subProducts.filter(
//         (sp) => String(sp.g3_category) === String(productName)
//       );
//       for (const r of toDelete) {
//         try {
//           await axios.delete(`${API_BASE}/delete_mst_sub_product`, {
//             headers: { "Content-Type": "application/json" },
//             data: { id: r.id },
//           });
//         } catch (e) {
//           console.warn("failed deleting row", r.id, e);
//         }
//       }
//       toast.success("Product rows deleted (attempted). Refreshing.");
//       fetchAllData();
//     } catch (err) {
//       console.error("deleteProduct error", err);
//       toast.error("Failed to delete product");
//     }
//   };

//   // ---------- Brand-filtered products for EXISTING mode ----------
//   const brandFilteredProducts = useMemo(() => {
//     if (!selectedBrandName) return [];
//     const set = new Set();
//     const result = [];
//     subProducts.forEach((sp) => {
//       if (String(sp.brand) !== String(selectedBrandName)) return;
//       const p = (sp.g3_category || "").toString();
//       if (!p) return;
//       if (!set.has(p)) {
//         set.add(p);
//         result.push({ id: `bp_${result.length + 1}`, product_name: p });
//       }
//     });
//     return result;
//   }, [subProducts, selectedBrandName]);

//   // ---------- Pagination helpers ----------
//   const totalExisting = existingSubProducts.length;
//   const totalPages = Math.max(1, Math.ceil(totalExisting / pageSize));
//   const paginatedExistingSubProducts = existingSubProducts.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const handlePageChange = (page) => {
//     if (page < 1 || page > totalPages) return;
//     setCurrentPage(page);
//     const el = document.querySelector(".card-body");
//     if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
//   };

//   // ---------- Render ----------
//   return (
//     <Container fluid>
//       <Row>
//         <Col md="12">
//           <Card className="strpied-tabled-with-hover">
//             <Card.Header
//               style={{ backgroundColor: "#fff", borderBottom: "none" }}
//             >
//               <Row className="align-items-center">
//                 <Col>
//                   <Card.Title
//                     style={{ marginTop: "2rem", fontWeight: "700" }}
//                   >
//                     Products Master
//                   </Card.Title>
//                 </Col>
//                 <Col className="d-flex justify-content-end align-items-center gap-2">
//                   <Button
//                     variant="outline-secondary"
//                     onClick={() => setActiveTab("brand")}
//                   >
//                     <FaArrowLeft /> Back to Brand
//                   </Button>
//                 </Col>
//               </Row>
//             </Card.Header>
//             <Card.Body>
//               {viewMode === "add" ? (
//                 <Tabs
//                   activeKey={activeTab}
//                   onSelect={(k) => setActiveTab(k)}
//                   className="mb-4"
//                 >
//                   {/* Tab 1 - Brand */}
//                   <Tab eventKey="brand" title="1. Brand">
//                     <Card className="mb-4 border-0 shadow-none">
//                       <Card.Body>
//                         <div className="d-flex gap-4 mb-3">
//                           <Form.Check
//                             type="radio"
//                             id="brand-new"
//                             name="brand-mode"
//                             label="Create New Brand"
//                             checked={!useExistingBrand}
//                             onChange={() => {
//                               setUseExistingBrand(false);
//                               setExistingBrandIdForAdd("");
//                             }}
//                           />
//                           <Form.Check
//                             type="radio"
//                             id="brand-existing"
//                             name="brand-mode"
//                             label="Use Existing Brand"
//                             checked={useExistingBrand}
//                             onChange={() => {
//                               setUseExistingBrand(true);
//                               setBrandName("");
//                             }}
//                           />
//                         </div>
//                         {!useExistingBrand && (
//                           <Form.Group className="mb-3">
//                             <Form.Label>Brand Name</Form.Label>
//                             <Form.Control
//                               value={brandName}
//                               onChange={(e) => setBrandName(e.target.value)}
//                               placeholder="Enter brand name"
//                             />
//                             <Form.Text muted>
//                               Example: LG, Samsung, Bosch, etc.
//                             </Form.Text>
//                           </Form.Group>
//                         )}
//                         {useExistingBrand && (
//                           <>
//                             <Form.Group className="mb-3">
//                               <Form.Label>Search Brand</Form.Label>
//                               <Form.Control
//                                 type="text"
//                                 placeholder="Type to filter brands..."
//                                 value={brandSearch}
//                                 onChange={(e) =>
//                                   setBrandSearch(e.target.value)
//                                 }
//                               />
//                             </Form.Group>
//                             <Table striped hover size="sm">
//                               <thead>
//                                 <tr>
//                                   <th>Sr No</th>
//                                   <th>Brand Name</th>
//                                   <th>Action</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {(brands || [])
//                                   .filter(
//                                     (b) =>
//                                       !brandSearch.trim() ||
//                                       String(b.brand_name || "")
//                                         .toLowerCase()
//                                         .includes(
//                                           brandSearch.toLowerCase()
//                                         )
//                                   )
//                                   .map((brand, idx) => (
//                                     <tr
//   key={brand.id}
//   onClick={() => setExistingBrandIdForAdd(brand.id)}
//   style={{ cursor: "pointer" }}
//   className={
//     String(existingBrandIdForAdd) === String(brand.id)
//       ? "table-active brand-active"
//       : ""
//   }
// >

//                                       <td>{idx + 1}</td>
//                                       <td>
//   {brand.brand_name}
//   {String(existingBrandIdForAdd) === String(brand.id) && (
//     <Badge bg="primary" className="ms-2">
//       Selected
//     </Badge>
//   )}
// </td>
//                                       <td className="text-end">
//                                         <Button
//                                           size="sm"
//                                           variant="danger"
//                                           onClick={(e) => {
//                                             e.stopPropagation();
//                                             deleteBrand(brand.brand_name);
//                                           }}
//                                         >
//                                           <FaTrash />
//                                         </Button>
//                                       </td>
//                                     </tr>
//                                   ))}
//                               </tbody>
//                             </Table>
//                           </>
//                         )}
//                         <div className="d-flex justify-content-end mt-3">
//                           <Button
//                             variant="primary"
//                             onClick={() => {
//                               if (!useExistingBrand && !brandName.trim()) {
//                                 toast.error("Please enter a brand name");
//                                 return;
//                               }
//                               if (useExistingBrand && !existingBrandIdForAdd) {
//                                 toast.error("Please select a brand");
//                                 return;
//                               }
//                               setActiveTab("products");
//                             }}
//                           >
//                             Save and Proceed
//                           </Button>
//                         </div>
//                       </Card.Body>
//                     </Card>
//                   </Tab>

//                   {/* Tab 2 - Products & Sub-Products */}
//                   <Tab eventKey="products" title="2. Products & Sub-Products">
//                     <Card className="mb-4">
//                       <Card.Header>Step 2: Products & Sub-Products</Card.Header>
//                       <Card.Body>
//                         <div className="d-flex justify-content-between mb-3">
//                           <div>
//                             <strong>Brand: </strong>
//                             <Badge bg="secondary">
//                               {selectedBrandName || "New Brand"}
//                             </Badge>
//                           </div>
//                           <Button
//                             size="sm"
//                             variant="outline-secondary"
//                             onClick={() => setActiveTab("brand")}
//                           >
//                             <FaArrowLeft />
//                           </Button>
//                         </div>

//                         <div className="d-flex gap-4 mb-3">
//                           <Form.Check
//                             type="radio"
//                             id="prod-mode-new"
//                             name="prod-mode"
//                             label="Create New Products"
//                             checked={productMode === "new"}
//                             onChange={() => setProductMode("new")}
//                           />
//                           <Form.Check
//                             type="radio"
//                             id="prod-mode-existing"
//                             name="prod-mode"
//                             label="Use Existing Product"
//                             checked={productMode === "existing"}
//                             onChange={() => setProductMode("existing")}
//                           />
//                         </div>

//                         {/* NEW product mode */}
//                         {productMode === "new" && (
//                           <>
//                             <Card className="mb-4">
//                               <Card.Header>
//                                 Add New Product & Sub-Product
//                               </Card.Header>
//                               <Card.Body>
//                                 <Row className="g-2 mb-3">
//                                   <Col md={12}>
//                                     <Form.Label>Product Name</Form.Label>
//                                     <Form.Control
//                                       placeholder="Enter product name"
//                                       value={newProductForm.productName}
//                                       onChange={(e) =>
//                                         setNewProductForm({
//                                           ...newProductForm,
//                                           productName: e.target.value,
//                                         })
//                                       }
//                                     />
//                                   </Col>
//                                 </Row>
//                                 <Row className="g-2 mb-3">
//                                   <Col md={12}>
//                                     <Form.Label>Sub-Product Name</Form.Label>
//                                     <Form.Control
//                                       placeholder="Enter sub-product name"
//                                       value={newProductForm.subProductName}
//                                       onChange={(e) =>
//                                         setNewProductForm({
//                                           ...newProductForm,
//                                           subProductName: e.target.value,
//                                         })
//                                       }
//                                     />
//                                   </Col>
//                                 </Row>
//                                 <Row className="g-2 mb-3">
//                                   <Col md={6}>
//                                     <Form.Label>Rate</Form.Label>
//                                     <Form.Control
//                                       type="number"
//                                       step="0.01"
//                                       placeholder="Rate"
//                                       value={newProductForm.subProductRate}
//                                       onChange={(e) =>
//                                         setNewProductForm({
//                                           ...newProductForm,
//                                           subProductRate: e.target.value,
//                                         })
//                                       }
//                                     />
//                                   </Col>
//                                   <Col md={6}>
//                                     <Form.Label>Description</Form.Label>
//                                     <Form.Control
//                                       as="textarea"
//                                       rows={1}
//                                       placeholder="Description"
//                                       value={
//                                         newProductForm.subProductDescription
//                                       }
//                                       onChange={(e) =>
//                                         setNewProductForm({
//                                           ...newProductForm,
//                                           subProductDescription:
//                                             e.target.value,
//                                         })
//                                       }
//                                     />
//                                   </Col>
//                                 </Row>
//                                 <Button
//                                   variant="primary"
//                                   onClick={handleAddNewProductWithSubProduct}
//                                 >
//                                   <FaPlus className="me-2" /> Add Product &
//                                   Sub-Product
//                                 </Button>
//                               </Card.Body>
//                             </Card>

//                             {productsList.map((product) => (
//                               <Card key={product.id} className="mb-2">
//                                 <Card.Header className="d-flex justify-content-between align-items-center">
//                                   <strong>{product.name}</strong>
//                                   <Button
//                                     variant="outline-danger"
//                                     size="sm"
//                                     onClick={() => removeProduct(product.id)}
//                                   >
//                                     <FaTrash />
//                                   </Button>
//                                 </Card.Header>
//                                 <Card.Body>
//                                   <Table striped bordered size="sm">
//                                     <thead>
//                                       <tr>
//                                         <th>Name</th>
//                                         <th>Description</th>
//                                         <th>Rate</th>
//                                         <th>Action</th>
//                                       </tr>
//                                     </thead>
//                                     <tbody>
//                                       {(product.subProducts || []).map((sp) => (
//                                         <tr key={sp.id}>
//                                           <td>{sp.name}</td>
//                                           <td>{sp.description || "-"}</td>
//                                           <td>{sp.rate || "-"}</td>
//                                           <td>
//                                             <Button
//                                               size="sm"
//                                               variant="outline-danger"
//                                               onClick={() =>
//                                                 removeSubProduct(
//                                                   product.id,
//                                                   sp.id
//                                                 )
//                                               }
//                                             >
//                                               <FaTrash />
//                                             </Button>
//                                           </td>
//                                         </tr>
//                                       ))}
//                                     </tbody>
//                                   </Table>
//                                 </Card.Body>
//                               </Card>
//                             ))}

//                             {productsList.length > 0 && (
//                               <Card className="mt-4">
//                                 <Card.Header>
//                                   Add Additional Sub-Product
//                                 </Card.Header>
//                                 <Card.Body>
//                                   <Row className="g-2 mb-3">
//                                     <Col md={4}>
//                                       <Form.Label>Select Product</Form.Label>
//                                       <Form.Select
//                                         value={additionalSubForm.productIndex}
//                                         onChange={(e) =>
//                                           setAdditionalSubForm({
//                                             ...additionalSubForm,
//                                             productIndex: e.target.value,
//                                           })
//                                         }
//                                       >
//                                         <option value="">
//                                           -- Select Product --
//                                         </option>
//                                         {productsList.map((p, index) => (
//                                           <option key={p.id} value={index}>
//                                             {p.name}
//                                           </option>
//                                         ))}
//                                       </Form.Select>
//                                     </Col>
//                                     <Col md={8}>
//                                       <Form.Label>Sub-Product Name</Form.Label>
//                                       <Form.Control
//                                         placeholder="Enter sub-product name"
//                                         value={additionalSubForm.name}
//                                         onChange={(e) =>
//                                           setAdditionalSubForm({
//                                             ...additionalSubForm,
//                                             name: e.target.value,
//                                           })
//                                         }
//                                       />
//                                     </Col>
//                                   </Row>
//                                   <Row className="g-2 mb-3">
//                                     <Col md={6}>
//                                       <Form.Label>Rate</Form.Label>
//                                       <Form.Control
//                                         type="number"
//                                         step="0.01"
//                                         placeholder="Rate"
//                                         value={additionalSubForm.rate}
//                                         onChange={(e) =>
//                                           setAdditionalSubForm({
//                                             ...additionalSubForm,
//                                             rate: e.target.value,
//                                           })
//                                         }
//                                       />
//                                     </Col>
//                                     <Col md={6}>
//                                       <Form.Label>Description</Form.Label>
//                                       <Form.Control
//                                         as="textarea"
//                                         rows={1}
//                                         placeholder="Description"
//                                         value={additionalSubForm.description}
//                                         onChange={(e) =>
//                                           setAdditionalSubForm({
//                                             ...additionalSubForm,
//                                             description: e.target.value,
//                                           })
//                                         }
//                                       />
//                                     </Col>
//                                   </Row>
//                                   <Button
//                                     variant="secondary"
//                                     onClick={handleAddAdditionalSubProduct}
//                                   >
//                                     <FaPlus className="me-2" /> Add Sub-Product
//                                   </Button>
//                                 </Card.Body>
//                               </Card>
//                             )}

//                             <div className="d-flex justify-content-end mt-4">
//                               <Button
//                                 variant="success"
//                                 onClick={handleSubmitAll}
//                                 disabled={loading}
//                               >
//                                 {loading ? (
//                                   <Spinner size="sm" animation="border" />
//                                 ) : (
//                                   "Save All"
//                                 )}
//                               </Button>
//                             </div>
//                           </>
//                         )}

//                         {/* EXISTING product mode */}
//                         {productMode === "existing" && (
//                           <>
//                             {!useExistingBrand && (
//                               <Alert variant="warning">
//                                 To use an existing product, please choose{" "}
//                                 <strong>Use Existing Brand</strong> in the Brand
//                                 tab.
//                               </Alert>
//                             )}
//                             {useExistingBrand && (
//                               <>
//                                 <Form.Group className="mb-3">
//                                   <Form.Label>Search Product</Form.Label>
//                                   <Form.Control
//                                     type="text"
//                                     placeholder="Filter products by name..."
//                                     value={productSearchAdd}
//                                     onChange={(e) =>
//                                       setProductSearchAdd(e.target.value)
//                                     }
//                                   />
//                                 </Form.Group>
//                                 <Table striped hover size="sm">
//                                   <thead>
//                                     <tr>
//                                       <th>Sr. No</th>
//                                       <th>Product Name</th>
//                                       <th>Action</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {brandFilteredProducts
//                                       .filter(
//                                         (p) =>
//                                           !productSearchAdd.trim() ||
//                                           String(
//                                             p.product_name || ""
//                                           )
//                                             .toLowerCase()
//                                             .includes(
//                                               productSearchAdd.toLowerCase()
//                                             )
//                                       )
//                                       .map((product, idx) => (
//                                        <tr
//   key={product.id || product.product_name}
//   onClick={() =>
//     setExistingProdIdForAdd(
//       String(product.product_name || product.g3_category)
//     )
//   }
//   style={{ cursor: "pointer" }}
//   className={
//     String(existingProdIdForAdd) ===
//     String(product.product_name)
//       ? "table-active product-active"
//       : ""
//   }
// >

//                                           <td>{idx + 1}</td>
//                                           <td>{product.product_name}</td>
//                                           <td className="text-end">
//                                             <Button
//                                               size="sm"
//                                               variant="danger"
//                                               onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 deleteProduct(
//                                                   product.product_name
//                                                 );
//                                               }}
//                                             >
//                                               <FaTrash />
//                                             </Button>
//                                           </td>
//                                         </tr>
//                                       ))}
//                                   </tbody>
//                                 </Table>

//                                 {existingProdIdForAdd && (
//                                   <Card className="mt-3">
//                                     <Card.Header>
//                                       Managing Sub-Products for:{" "}
//                                       <Badge bg="info">
//                                         {existingProdIdForAdd || "Unknown"}
//                                       </Badge>
//                                     </Card.Header>
//                                     <Card.Body>
//                                       <Form
//                                         onSubmit={handleAddSubToExistingProduct}
//                                         className="mb-3"
//                                       >
//                                         <Row className="g-2 mb-3">
//                                           <Col md={6}>
//                                             <Form.Control
//                                               placeholder="Enter sub-product name"
//                                               value={existingSubName}
//                                               onChange={(e) =>
//                                                 setExistingSubName(
//                                                   e.target.value
//                                                 )
//                                               }
//                                               required
//                                             />
//                                           </Col>
//                                           <Col md={3}>
//                                             <Form.Control
//                                               placeholder="Rate"
//                                               type="number"
//                                               step="0.01"
//                                               value={existingSubRate}
//                                               onChange={(e) =>
//                                                 setExistingSubRate(
//                                                   e.target.value
//                                                 )
//                                               }
//                                             />
//                                           </Col>
//                                           <Col md={3}>
//                                             <Button
//                                               type="submit"
//                                               variant="primary"
//                                               className="w-100"
//                                               disabled={existingSubSubmitting}
//                                             >
//                                               {existingSubSubmitting ? (
//                                                 <Spinner
//                                                   size="sm"
//                                                   animation="border"
//                                                 />
//                                               ) : (
//                                                 <>
//                                                   <FaPlus className="me-1" /> Add
//                                                   Sub
//                                                 </>
//                                               )}
//                                             </Button>
//                                           </Col>
//                                         </Row>
//                                         <Row className="g-2 mb-3">
//                                           <Col md={12}>
//                                             <Form.Control
//                                               as="textarea"
//                                               rows={2}
//                                               placeholder="Description (optional)"
//                                               value={existingSubDescription}
//                                               onChange={(e) =>
//                                                 setExistingSubDescription(
//                                                   e.target.value
//                                                 )
//                                               }
//                                             />
//                                           </Col>
//                                         </Row>
//                                       </Form>

//                                       {existingSubLoading ? (
//                                         <div className="text-center p-3">
//                                           <Spinner
//                                             animation="border"
//                                             size="sm"
//                                           />
//                                           <p className="mt-2">
//                                             Loading sub-products...
//                                           </p>
//                                         </div>
//                                       ) : (
//                                         <>
//                                           <Table striped hover size="sm">
//                                             <thead>
//                                               <tr>
//                                                 <th>Sr No</th>
//                                                 <th>Sub-product</th>
//                                                 <th>Description</th>
//                                                 <th>Rate</th>
//                                                 <th>Action</th>
//                                               </tr>
//                                             </thead>
//                                             <tbody>
//                                               {paginatedExistingSubProducts.map(
//                                                 (s, idx) => {
//                                                   const indexInFull =
//                                                     (currentPage - 1) *
//                                                       pageSize +
//                                                     idx;
//                                                   const latestRate =
//                                                     s.rate || "";

//                                                   const isEditing =
//                                                     editingSubId === s.id;

//                                                   return (
//                                                     <tr key={s.id}>
//                                                       <td>
//                                                         {indexInFull + 1}
//                                                       </td>
//                                                       <td>
//                                                         {s.item_name ||
//                                                           s.sub_prod_name ||
//                                                           "-"}
//                                                       </td>
//                                                       <td style={{ minWidth: "300px" }}>
//                                                         {isEditing ? (
//                                                           <Form.Control
//                                                             as="textarea"
//                                                             rows={2}
//                                                             value={
//                                                               editDescription
//                                                             }
//                                                             onChange={(e) =>
//                                                               setEditDescription(
//                                                                 e.target.value
//                                                               )
//                                                             }
//                                                           />
//                                                         ) : (
//                                                           s.specification || "-"
//                                                         )}
//                                                       </td>
//                                                       <td style={{ minWidth: "120px" }}>
//                                                         {isEditing ? (
//                                                           <Form.Control
//                                                             type="number"
//                                                             step="0.01"
//                                                             value={editRate}
//                                                             onChange={(e) =>
//                                                               setEditRate(
//                                                                 e.target.value
//                                                               )
//                                                             }
//                                                           />
//                                                         ) : (
//                                                           latestRate || "-"
//                                                         )}
//                                                       </td>
//                                                       <td>
//                                                         {isEditing ? (
//                                                           <div className="d-flex gap-1">
//                                                             <Button
//                                                               size="sm"
//                                                               variant="success"
//                                                               disabled={
//                                                                 editSubmitting
//                                                               }
//                                                               onClick={() =>
//                                                                 handleUpdateSubProduct(
//                                                                   s
//                                                                 )
//                                                               }
//                                                             >
//                                                               {editSubmitting ? (
//                                                                 <Spinner
//                                                                   size="sm"
//                                                                   animation="border"
//                                                                 />
//                                                               ) : (
//                                                                 <>
//                                                                   <FaSave className="me-1" />
//                                                                   Save
//                                                                 </>
//                                                               )}
//                                                             </Button>
//                                                             <Button
//                                                               size="sm"
//                                                               variant="secondary"
//                                                               onClick={
//                                                                 cancelEditSubProduct
//                                                               }
//                                                             >
//                                                               <FaTimes className="me-1" />
//                                                               Cancel
//                                                             </Button>
//                                                           </div>
//                                                         ) : (
//                                                           <div className="d-flex gap-1">
//                                                             <Button
                                                             
//                                                               className="buttonEye"
//                                                               onClick={() => {
//                                                                 setEditingSubId(
//                                                                   s.id
//                                                                 );
//                                                                 setEditDescription(
//                                                                   s.specification ||
//                                                                     ""
//                                                                 );
//                                                                 setEditRate(
//                                                                   s.rate || ""
//                                                                 );
//                                                               }}
//                                                             >
//                                                               <FaEdit />
                                                              
//                                                             </Button>
//                                                             <Button
//                                                               size="sm"
//                                                               variant="danger"
//                                                               onClick={() =>
//                                                                 deleteExistingSubProduct(
//                                                                   s.id
//                                                                 )
//                                                               }
//                                                             >
//                                                               <FaTrash />
//                                                             </Button>
//                                                           </div>
//                                                         )}
//                                                       </td>
//                                                     </tr>
//                                                   );
//                                                 }
//                                               )}
//                                             </tbody>
//                                           </Table>

//                                           {totalExisting > pageSize && (
//                                             <div className="d-flex justify-content-center mt-3">
//                                               <Pagination>
//                                                 <Pagination.Prev
//                                                   onClick={() =>
//                                                     handlePageChange(
//                                                       currentPage - 1
//                                                     )
//                                                   }
//                                                   disabled={
//                                                     currentPage === 1
//                                                   }
//                                                 />
//                                                 {Array.from(
//                                                   { length: totalPages },
//                                                   (_, i) => {
//                                                     const page = i + 1;
//                                                     if (totalPages > 7) {
//                                                       if (
//                                                         page === 1 ||
//                                                         page === totalPages ||
//                                                         (page >=
//                                                           currentPage - 2 &&
//                                                           page <=
//                                                             currentPage + 2)
//                                                       ) {
//                                                         return (
//                                                           <Pagination.Item
//                                                             key={page}
//                                                             active={
//                                                               page ===
//                                                               currentPage
//                                                             }
//                                                             onClick={() =>
//                                                               handlePageChange(
//                                                                 page
//                                                               )
//                                                             }
//                                                           >
//                                                             {page}
//                                                           </Pagination.Item>
//                                                         );
//                                                       }
//                                                       if (
//                                                         page === 2 &&
//                                                         currentPage > 4
//                                                       ) {
//                                                         return (
//                                                           <Pagination.Ellipsis
//                                                             key="e1"
//                                                             disabled
//                                                           />
//                                                         );
//                                                       }
//                                                       if (
//                                                         page ===
//                                                           totalPages - 1 &&
//                                                         currentPage <
//                                                           totalPages - 3
//                                                       ) {
//                                                         return (
//                                                           <Pagination.Ellipsis
//                                                             key="e2"
//                                                             disabled
//                                                           />
//                                                         );
//                                                       }
//                                                       return null;
//                                                     }
//                                                     return (
//                                                       <Pagination.Item
//                                                         key={page}
//                                                         active={
//                                                           page === currentPage
//                                                         }
//                                                         onClick={() =>
//                                                           handlePageChange(
//                                                             page
//                                                           )
//                                                         }
//                                                       >
//                                                         {page}
//                                                       </Pagination.Item>
//                                                     );
//                                                   }
//                                                 )}
//                                                 <Pagination.Next
//                                                   onClick={() =>
//                                                     handlePageChange(
//                                                       currentPage + 1
//                                                     )
//                                                   }
//                                                   disabled={
//                                                     currentPage === totalPages
//                                                   }
//                                                 />
//                                               </Pagination>
//                                             </div>
//                                           )}
//                                         </>
//                                       )}
//                                     </Card.Body>
//                                   </Card>
//                                 )}
//                               </>
//                             )}
//                           </>
//                         )}
//                       </Card.Body>
//                     </Card>
//                   </Tab>
//                 </Tabs>
//               ) : (
//                 <Alert variant="info">
//                   View mode (existing data management).
//                 </Alert>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default ProductMaster;

// // src/forms/ProductMaster.jsx
// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Table,
//   Alert,
//   Badge,
//   Spinner,
//   Tabs,
//   Tab,
//   Pagination,
// } from "react-bootstrap";
// import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
// import toast from "react-hot-toast";
// import axios from "axios";

// const API_BASE = "https://nlfs.in/erp/index.php/Api";   // list + delete
// const ERP_BASE = "https://nlfs.in/erp/index.php/Erp";   // add_product_mst

// const isOk = (val) =>
//   val === true || val === "true" || val === 1 || val === "1";

// /** Robust ID extractor (kept for future use) */
// const extractId = (resData, possibleFields = ["id", "sub_prod_id"]) => {
//   try {
//     if (!resData) return null;
//     for (const f of possibleFields) {
//       if (resData[f] !== undefined && resData[f] !== null) return resData[f];
//     }
//     if (resData.data && typeof resData.data === "object" && !Array.isArray(resData.data)) {
//       for (const f of possibleFields) {
//         if (resData.data[f] !== undefined && resData.data[f] !== null)
//           return resData.data[f];
//       }
//     }
//     if (Array.isArray(resData.data) && resData.data.length > 0) {
//       const first = resData.data[0];
//       for (const f of possibleFields) {
//         if (first && first[f] !== undefined && first[f] !== null) return first[f];
//       }
//     }
//     const scanArrayForField = (arr) => {
//       if (!Array.isArray(arr)) return null;
//       for (const obj of arr) {
//         for (const f of possibleFields) {
//           if (obj && obj[f] !== undefined && obj[f] !== null) return obj[f];
//         }
//       }
//       return null;
//     };
//     if (resData.data && Array.isArray(resData.data)) {
//       const found = scanArrayForField(resData.data);
//       if (found) return found;
//     }
//     return null;
//   } catch (e) {
//     console.warn("extractId error", e);
//     return null;
//   }
// };

// const ProductMaster = () => {
//   // ---------- Data ----------
//   const [brands, setBrands] = useState([]); // { id, brand_name }
//   const [products, setProducts] = useState([]); // { id, product_name }
//   const [subProducts, setSubProducts] = useState([]); // full cache from list_mst_sub_product
//   const [rates, setRates] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // ---------- Add-mode ----------
//   const [brandName, setBrandName] = useState("");
//   const [productsList, setProductsList] = useState([]);
//   const [newProductForm, setNewProductForm] = useState({
//     productName: "",
//     subProductName: "",
//     subProductDescription: "",
//     subProductRate: "",
//   });
//   const [additionalSubForm, setAdditionalSubForm] = useState({
//     productIndex: "",
//     name: "",
//     description: "",
//     rate: "",
//   });

//   // ---------- Tabs ----------
//   const [activeTab, setActiveTab] = useState("brand");

//   // ---------- Brand/Product modes ----------
//   const [useExistingBrand, setUseExistingBrand] = useState(false);
//   const [existingBrandIdForAdd, setExistingBrandIdForAdd] = useState("");
//   const [productMode, setProductMode] = useState("new");
//   const [productSearchAdd, setProductSearchAdd] = useState("");
//   const [existingProdIdForAdd, setExistingProdIdForAdd] = useState("");

//   // ---------- View / misc ----------
//   const [viewMode] = useState("add");
//   const [brandSearch, setBrandSearch] = useState("");
//   const [existingSubProducts, setExistingSubProducts] = useState([]);
//   const [existingSubLoading, setExistingSubLoading] = useState(false);
//   const [existingSubName, setExistingSubName] = useState("");
//   const [existingSubDescription, setExistingSubDescription] = useState("");
//   const [existingSubRate, setExistingSubRate] = useState("");
//   const [existingSubSubmitting, setExistingSubSubmitting] = useState(false);

//   // ---------- Pagination for existingSubProducts ----------
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 10;

//   // ---------- Fetch all specs + derive brands/products ----------
//   const fetchAllData = async () => {
//     setLoading(true);
//     try {
//       const sR = await axios.post(
//         `${API_BASE}/list_mst_sub_product`,
//         {},
//         { headers: { "Content-Type": "application/json" } }
//       );
//       const sD = sR.data;
//       if (isOk(sD.status) && isOk(sD.success)) {
//         const all = (sD.data || []).map((sp) => ({
//           ...sp,
//           id: sp.id || sp.sub_prod_id || sp.ID,
//           brand: sp.brand || sp.brand_name || "",
//           g3_category: sp.g3_category || sp.product_name || "",
//           g4_sub_category: sp.g4_sub_category || "",
//           item_name: sp.item_name || sp.sub_prod_name || "",
//           uom: sp.uom || "",
//           gst: sp.gst || "",
//           hsn_code: sp.hsn_code || "",
//           specification: sp.specification || sp.description || "",
//           rate: sp.rate || "",
//         }));
//         setSubProducts(all);

//         // derive brands
//         const brandSet = new Set();
//         const brandList = [];
//         all.forEach((row) => {
//           const b = (row.brand || "").toString();
//           if (b && !brandSet.has(b)) {
//             brandSet.add(b);
//             brandList.push({ id: `b_${brandList.length + 1}`, brand_name: b });
//           }
//         });
//         setBrands(brandList);

//         // derive products (ALL products across brands; we'll brand-filter later)
//         const prodSet = new Set();
//         const prodList = [];
//         all.forEach((row) => {
//           const p = (row.g3_category || "").toString();
//           if (p && !prodSet.has(p)) {
//             prodSet.add(p);
//             prodList.push({ id: `p_${prodList.length + 1}`, product_name: p });
//           }
//         });
//         setProducts(prodList);

//         setRates(
//           all.map((r) => ({
//             sub_prod_id: r.id,
//             rate: r.rate,
//             created_at: r.created_at,
//           }))
//         );
//       } else {
//         setSubProducts([]);
//         setBrands([]);
//         setProducts([]);
//         setRates([]);
//         toast.error(sD.message || "Failed to fetch specifications.");
//       }
//     } catch (err) {
//       console.error("fetchAllData error", err);
//       toast.error("Failed to load data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   // ---------- Selected brand name (string) ----------
//   const selectedBrandName = useMemo(() => {
//     if (useExistingBrand) {
//       return (
//         brands.find((b) => String(b.id) === String(existingBrandIdForAdd))
//           ?.brand_name || ""
//       );
//     }
//     return brandName || "";
//   }, [useExistingBrand, existingBrandIdForAdd, brands, brandName]);

//   // ---------- Product/Sub-product Helpers for NEW mode ----------
//   const handleAddNewProductWithSubProduct = () => {
//     if (!newProductForm.productName.trim())
//       return toast.error("Please enter a product name");
//     if (!newProductForm.subProductName.trim())
//       return toast.error("Please enter a sub-product name");

//     const newProduct = {
//       id: Date.now(),
//       name: newProductForm.productName,
//       subProducts: [
//         {
//           id: Date.now() + 1,
//           name: newProductForm.subProductName,
//           description: newProductForm.subProductDescription,
//           rate: newProductForm.subProductRate,
//         },
//       ],
//     };
//     setProductsList((prev) => [...prev, newProduct]);
//     setNewProductForm({
//       productName: "",
//       subProductName: "",
//       subProductDescription: "",
//       subProductRate: "",
//     });
//     toast.success("Product and Sub-product added to list");
//   };

//   const handleAddAdditionalSubProduct = () => {
//     const { productIndex, name, description, rate } = additionalSubForm;
//     if (productIndex === "" || !name.trim())
//       return toast.error("Please select a product and enter a sub-product name");
//     const newSubProduct = { id: Date.now(), name, description, rate };
//     setProductsList((prev) =>
//       prev.map((product, index) =>
//         index === parseInt(productIndex, 10)
//           ? {
//               ...product,
//               subProducts: product.subProducts
//                 ? [...product.subProducts, newSubProduct]
//                 : [newSubProduct],
//             }
//           : product
//       )
//     );
//     setAdditionalSubForm({
//       productIndex: "",
//       name: "",
//       description: "",
//       rate: "",
//     });
//     toast.success("Additional sub-product added");
//   };

//   const removeProduct = (id) =>
//     setProductsList((prev) => prev.filter((p) => p.id !== id));

//   const removeSubProduct = (productId, subId) => {
//     setProductsList((prev) =>
//       prev.map((p) =>
//         p.id === productId
//           ? {
//               ...p,
//               subProducts: p.subProducts.filter((sp) => sp.id !== subId),
//             }
//           : p
//       )
//     );
//   };

//   // ---------- Submit All (NEW brand/products -> add_product_mst) ----------
//   const handleSubmitAll = async () => {
//     if (!useExistingBrand && !brandName.trim()) {
//       return toast.error(
//         "Please enter a brand name (or choose existing brand)."
//       );
//     }
//     if (productsList.length === 0)
//       return toast.error(
//         "Add at least one product with sub-product before saving."
//       );

//     setLoading(true);
//     try {
//       const brandValue = (useExistingBrand
//         ? selectedBrandName
//         : brandName
//       ).toString();

//       for (const product of productsList) {
//         const g3 = product.name;
//         for (const sp of product.subProducts || []) {
//           const payload = {
//             brand: brandValue,
//             g3_category: g3,
//             g4_sub_category: "",
//             item_name: sp.name || "",
//             uom: sp.uom || "NOS",
//             gst: sp.rate ? "18" : "",
//             hsn_code: sp.hsn_code || "",
//             specification: sp.description || "",
//             rate:
//               sp.rate === undefined || sp.rate === null || sp.rate === ""
//                 ? ""
//                 : String(sp.rate),
//           };

//           const res = await axios.post(
//             `${ERP_BASE}/add_product_mst`,
//             payload,
//             {
//               headers: { "Content-Type": "application/json" },
//             }
//           );
//           if (!isOk(res.data.status) || !isOk(res.data.success)) {
//             toast.error(
//               `Failed to add ${sp.name}: ${
//                 res.data.message || "API error"
//               }`
//             );
//           } else {
//             console.log("added spec row ->", res.data);
//           }
//         }
//       }

//       toast.success("All items submitted. Refreshing...");
//       await fetchAllData();
//       setProductsList([]);
//       setBrandName("");
//       setUseExistingBrand(false);
//       setExistingBrandIdForAdd("");
//       setActiveTab("brand");
//     } catch (err) {
//       console.error("handleSubmitAll error", err);
//       toast.error("Error submitting items.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------- Fetch existing sub-products for a product (brand-aware) ----------
//   const fetchExistingSubProducts = async (prodName, brandFilter) => {
//     setExistingSubLoading(true);
//     setCurrentPage(1);
//     try {
//       const targetProd = (prodName || "").toString();
//       const targetBrand = (brandFilter || "").toString();

//       // filter from local cache first
//       const filteredLocal = subProducts.filter((sp) => {
//         const p = (sp.g3_category || sp.product_name || "").toString();
//         const b = (sp.brand || "").toString();
//         if (!targetProd) return false;
//         if (p !== targetProd) return false;
//         if (targetBrand && b !== targetBrand) return false;
//         return true;
//       });

//       if (filteredLocal.length > 0) {
//         setExistingSubProducts(filteredLocal);
//         setExistingSubLoading(false);
//         return;
//       }

//       // fallback to API
//       const res = await axios.post(
//         `${API_BASE}/list_mst_sub_product`,
//         {},
//         { headers: { "Content-Type": "application/json" } }
//       );
//       if (isOk(res.data.status) && isOk(res.data.success)) {
//         const all = (res.data.data || []).map((sp) => ({
//           ...sp,
//           id: sp.id || sp.sub_prod_id,
//           brand: sp.brand || "",
//           g3_category: sp.g3_category || sp.product_name || "",
//           item_name: sp.item_name || sp.sub_prod_name || "",
//           specification: sp.specification || sp.description || "",
//           rate: sp.rate || "",
//         }));
//         const filtered = all.filter((sp) => {
//           const p = (sp.g3_category || "").toString();
//           const b = (sp.brand || "").toString();
//           if (!targetProd) return false;
//           if (p !== targetProd) return false;
//           if (targetBrand && b !== targetBrand) return false;
//           return true;
//         });
//         setExistingSubProducts(filtered);
//       } else {
//         setExistingSubProducts([]);
//         toast.error(res.data.message || "Failed to fetch sub-products.");
//       }
//     } catch (err) {
//       console.error("fetchExistingSubProducts error", err);
//       toast.error("Error loading sub-products.");
//     } finally {
//       setExistingSubLoading(false);
//     }
//   };

//   // ---------- React to selected product change in EXISTING mode ----------
//   useEffect(() => {
//     if (productMode === "existing" && existingProdIdForAdd) {
//       fetchExistingSubProducts(existingProdIdForAdd, selectedBrandName);
//     } else {
//       setExistingSubProducts([]);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     productMode,
//     existingProdIdForAdd,
//     subProducts,
//     selectedBrandName,
//   ]);

//   // ---------- Add sub to existing product ----------
//   const handleAddSubToExistingProduct = async (e) => {
//     e.preventDefault();
//     if (!existingProdIdForAdd)
//       return toast.error("Please select a product.");
//     if (!existingSubName.trim())
//       return toast.error("Please enter sub-product name.");
//     setExistingSubSubmitting(true);
//     try {
//       const brandValue = selectedBrandName.toString();

//       const payload = {
//         brand: brandValue,
//         g3_category: existingProdIdForAdd, // product_name
//         g4_sub_category: "",
//         item_name: existingSubName.trim(),
//         uom: "NOS",
//         gst: existingSubRate ? "18" : "",
//         hsn_code: "",
//         specification: existingSubDescription || "",
//         rate: existingSubRate ? String(existingSubRate) : "",
//       };

//       const res = await axios.post(
//         `${ERP_BASE}/add_product_mst`,
//         payload,
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );

//       console.log("add_product_mst (existing product) response:", res.data);
//       if (!isOk(res.data.status) || !isOk(res.data.success)) {
//         throw new Error(res.data.message || "Unknown API error");
//       }

//       toast.success("Sub-product added successfully.");
//       setExistingSubName("");
//       setExistingSubDescription("");
//       setExistingSubRate("");
//       await fetchAllData();
//       fetchExistingSubProducts(existingProdIdForAdd, selectedBrandName);
//     } catch (err) {
//       console.error("Add sub-product error:", err);
//       toast.error(`Error: ${err.message || err}`);
//     } finally {
//       setExistingSubSubmitting(false);
//     }
//   };

//   // ---------- Delete helpers ----------
//   const deleteExistingSubProduct = async (subProdId) => {
//     if (!window.confirm("Delete this sub-product?")) return;
//     try {
//       const res = await axios.delete(
//         `${API_BASE}/delete_mst_sub_product`,
//         {
//           headers: { "Content-Type": "application/json" },
//           data: { id: subProdId },
//         }
//       );
//       if (isOk(res.data.status) && isOk(res.data.success)) {
//         toast.success("Sub-product deleted");
//         setExistingSubProducts((prev) =>
//           prev.filter((s) => String(s.id) !== String(subProdId))
//         );
//         fetchAllData();
//       } else {
//         toast.error(res.data.message || "Delete failed.");
//       }
//     } catch (err) {
//       console.error("deleteExistingSubProduct error", err);
//       toast.error("Error deleting sub-product.");
//     }
//   };

//   const deleteBrand = async (brandNameVal) => {
//     if (!window.confirm("Delete this brand and all its products?")) return;
//     try {
//       const toDelete = subProducts.filter(
//         (sp) => String(sp.brand) === String(brandNameVal)
//       );
//       for (const r of toDelete) {
//         try {
//           await axios.delete(`${API_BASE}/delete_mst_sub_product`, {
//             headers: { "Content-Type": "application/json" },
//             data: { id: r.id },
//           });
//         } catch (e) {
//           console.warn("failed deleting row", r.id, e);
//         }
//       }
//       toast.success("Brand rows deleted (attempted). Refreshing.");
//       fetchAllData();
//     } catch (err) {
//       console.error("deleteBrand error", err);
//       toast.error("Failed to delete brand");
//     }
//   };

//   const deleteProduct = async (productName) => {
//     if (!window.confirm("Delete this product and all its sub-products?"))
//       return;
//     try {
//       const toDelete = subProducts.filter(
//         (sp) => String(sp.g3_category) === String(productName)
//       );
//       for (const r of toDelete) {
//         try {
//           await axios.delete(`${API_BASE}/delete_mst_sub_product`, {
//             headers: { "Content-Type": "application/json" },
//             data: { id: r.id },
//           });
//         } catch (e) {
//           console.warn("failed deleting row", r.id, e);
//         }
//       }
//       toast.success("Product rows deleted (attempted). Refreshing.");
//       fetchAllData();
//     } catch (err) {
//       console.error("deleteProduct error", err);
//       toast.error("Failed to delete product");
//     }
//   };

//   // ---------- Brand-filtered products for EXISTING mode ----------
//   const brandFilteredProducts = useMemo(() => {
//     if (!selectedBrandName) return [];
//     const set = new Set();
//     const result = [];
//     subProducts.forEach((sp) => {
//       if (String(sp.brand) !== String(selectedBrandName)) return;
//       const p = (sp.g3_category || "").toString();
//       if (!p) return;
//       if (!set.has(p)) {
//         set.add(p);
//         result.push({ id: `bp_${result.length + 1}`, product_name: p });
//       }
//     });
//     return result;
//   }, [subProducts, selectedBrandName]);

//   // ---------- Pagination helpers ----------
//   const totalExisting = existingSubProducts.length;
//   const totalPages = Math.max(1, Math.ceil(totalExisting / pageSize));
//   const paginatedExistingSubProducts = existingSubProducts.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const handlePageChange = (page) => {
//     if (page < 1 || page > totalPages) return;
//     setCurrentPage(page);
//     const el = document.querySelector(".card-body");
//     if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
//   };

//   // ---------- Render ----------
//   return (
//     <Container fluid>
//       <Row>
//         <Col md="12">
//           <Card className="strpied-tabled-with-hover">
//             <Card.Header
//               style={{ backgroundColor: "#fff", borderBottom: "none" }}
//             >
//               <Row className="align-items-center">
//                 <Col>
//                   <Card.Title
//                     style={{ marginTop: "2rem", fontWeight: "700" }}
//                   >
//                     Products Master
//                   </Card.Title>
//                 </Col>
//                 <Col className="d-flex justify-content-end align-items-center gap-2">
//                   <Button
//                     variant="outline-secondary"
//                     onClick={() => setActiveTab("brand")}
//                   >
//                     <FaArrowLeft /> Back to Brand
//                   </Button>
//                 </Col>
//               </Row>
//             </Card.Header>
//             <Card.Body>
//               {viewMode === "add" ? (
//                 <Tabs
//                   activeKey={activeTab}
//                   onSelect={(k) => setActiveTab(k)}
//                   className="mb-4"
//                 >
//                   {/* Tab 1 - Brand */}
//                   <Tab eventKey="brand" title="1. Brand">
//                     <Card className="mb-4 border-0 shadow-none">
//                       <Card.Body>
//                         <div className="d-flex gap-4 mb-3">
//                           <Form.Check
//                             type="radio"
//                             id="brand-new"
//                             name="brand-mode"
//                             label="Create New Brand"
//                             checked={!useExistingBrand}
//                             onChange={() => {
//                               setUseExistingBrand(false);
//                               setExistingBrandIdForAdd("");
//                             }}
//                           />
//                           <Form.Check
//                             type="radio"
//                             id="brand-existing"
//                             name="brand-mode"
//                             label="Use Existing Brand"
//                             checked={useExistingBrand}
//                             onChange={() => {
//                               setUseExistingBrand(true);
//                               setBrandName("");
//                             }}
//                           />
//                         </div>
//                         {!useExistingBrand && (
//                           <Form.Group className="mb-3">
//                             <Form.Label>Brand Name</Form.Label>
//                             <Form.Control
//                               value={brandName}
//                               onChange={(e) => setBrandName(e.target.value)}
//                               placeholder="Enter brand name"
//                             />
//                             <Form.Text muted>
//                               Example: LG, Samsung, Bosch, etc.
//                             </Form.Text>
//                           </Form.Group>
//                         )}
//                         {useExistingBrand && (
//                           <>
//                             <Form.Group className="mb-3">
//                               <Form.Label>Search Brand</Form.Label>
//                               <Form.Control
//                                 type="text"
//                                 placeholder="Type to filter brands..."
//                                 value={brandSearch}
//                                 onChange={(e) =>
//                                   setBrandSearch(e.target.value)
//                                 }
//                               />
//                             </Form.Group>
//                             <Table striped hover size="sm">
//                               <thead>
//                                 <tr>
//                                   <th>Sr No</th>
//                                   <th>Brand Name</th>
//                                   <th>Action</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {(brands || [])
//                                   .filter(
//                                     (b) =>
//                                       !brandSearch.trim() ||
//                                       String(b.brand_name || "")
//                                         .toLowerCase()
//                                         .includes(
//                                           brandSearch.toLowerCase()
//                                         )
//                                   )
//                                   .map((brand, idx) => (
//                                     <tr
//                                       key={brand.id}
//                                       style={{ cursor: "pointer" }}
//                                       onClick={() =>
//                                         setExistingBrandIdForAdd(brand.id)
//                                       }
//                                     >
//                                       <td>{idx + 1}</td>
//                                       <td>{brand.brand_name}</td>
//                                       <td className="text-end">
//                                         <Button
//                                           size="sm"
//                                           variant="danger"
//                                           onClick={(e) => {
//                                             e.stopPropagation();
//                                             deleteBrand(brand.brand_name);
//                                           }}
//                                         >
//                                           <FaTrash />
//                                         </Button>
//                                       </td>
//                                     </tr>
//                                   ))}
//                               </tbody>
//                             </Table>
//                           </>
//                         )}
//                         <div className="d-flex justify-content-end mt-3">
//                           <Button
//                             variant="primary"
//                             onClick={() => {
//                               if (!useExistingBrand && !brandName.trim()) {
//                                 toast.error("Please enter a brand name");
//                                 return;
//                               }
//                               if (useExistingBrand && !existingBrandIdForAdd) {
//                                 toast.error("Please select a brand");
//                                 return;
//                               }
//                               setActiveTab("products");
//                             }}
//                           >
//                             Save and Proceed
//                           </Button>
//                         </div>
//                       </Card.Body>
//                     </Card>
//                   </Tab>

//                   {/* Tab 2 - Products & Sub-Products */}
//                   <Tab eventKey="products" title="2. Products & Sub-Products">
//                     <Card className="mb-4">
//                       <Card.Header>Step 2: Products & Sub-Products</Card.Header>
//                       <Card.Body>
//                         <div className="d-flex justify-content-between mb-3">
//                           <div>
//                             <strong>Brand: </strong>
//                             <Badge bg="secondary">
//                               {selectedBrandName || "New Brand"}
//                             </Badge>
//                           </div>
//                           <Button
//                             size="sm"
//                             variant="outline-secondary"
//                             onClick={() => setActiveTab("brand")}
//                           >
//                             <FaArrowLeft />
//                           </Button>
//                         </div>

//                         <div className="d-flex gap-4 mb-3">
//                           <Form.Check
//                             type="radio"
//                             id="prod-mode-new"
//                             name="prod-mode"
//                             label="Create New Products"
//                             checked={productMode === "new"}
//                             onChange={() => setProductMode("new")}
//                           />
//                           <Form.Check
//                             type="radio"
//                             id="prod-mode-existing"
//                             name="prod-mode"
//                             label="Use Existing Product"
//                             checked={productMode === "existing"}
//                             onChange={() => setProductMode("existing")}
//                           />
//                         </div>

//                         {/* NEW product mode */}
//                         {productMode === "new" && (
//                           <>
//                             <Card className="mb-4">
//                               <Card.Header>
//                                 Add New Product & Sub-Product
//                               </Card.Header>
//                               <Card.Body>
//                                 <Row className="g-2 mb-3">
//                                   <Col md={12}>
//                                     <Form.Label>Product Name</Form.Label>
//                                     <Form.Control
//                                       placeholder="Enter product name"
//                                       value={newProductForm.productName}
//                                       onChange={(e) =>
//                                         setNewProductForm({
//                                           ...newProductForm,
//                                           productName: e.target.value,
//                                         })
//                                       }
//                                     />
//                                   </Col>
//                                 </Row>
//                                 <Row className="g-2 mb-3">
//                                   <Col md={12}>
//                                     <Form.Label>Sub-Product Name</Form.Label>
//                                     <Form.Control
//                                       placeholder="Enter sub-product name"
//                                       value={newProductForm.subProductName}
//                                       onChange={(e) =>
//                                         setNewProductForm({
//                                           ...newProductForm,
//                                           subProductName: e.target.value,
//                                         })
//                                       }
//                                     />
//                                   </Col>
//                                 </Row>
//                                 <Row className="g-2 mb-3">
//                                   <Col md={6}>
//                                     <Form.Label>Rate</Form.Label>
//                                     <Form.Control
//                                       type="number"
//                                       step="0.01"
//                                       placeholder="Rate"
//                                       value={newProductForm.subProductRate}
//                                       onChange={(e) =>
//                                         setNewProductForm({
//                                           ...newProductForm,
//                                           subProductRate: e.target.value,
//                                         })
//                                       }
//                                     />
//                                   </Col>
//                                   <Col md={6}>
//                                     <Form.Label>Description</Form.Label>
//                                     <Form.Control
//                                       as="textarea"
//                                       rows={1}
//                                       placeholder="Description"
//                                       value={
//                                         newProductForm.subProductDescription
//                                       }
//                                       onChange={(e) =>
//                                         setNewProductForm({
//                                           ...newProductForm,
//                                           subProductDescription:
//                                             e.target.value,
//                                         })
//                                       }
//                                     />
//                                   </Col>
//                                 </Row>
//                                 <Button
//                                   variant="primary"
//                                   onClick={handleAddNewProductWithSubProduct}
//                                 >
//                                   <FaPlus className="me-2" /> Add Product &
//                                   Sub-Product
//                                 </Button>
//                               </Card.Body>
//                             </Card>

//                             {productsList.map((product) => (
//                               <Card key={product.id} className="mb-2">
//                                 <Card.Header className="d-flex justify-content-between align-items-center">
//                                   <strong>{product.name}</strong>
//                                   <Button
//                                     variant="outline-danger"
//                                     size="sm"
//                                     onClick={() => removeProduct(product.id)}
//                                   >
//                                     <FaTrash />
//                                   </Button>
//                                 </Card.Header>
//                                 <Card.Body>
//                                   <Table striped bordered size="sm">
//                                     <thead>
//                                       <tr>
//                                         <th>Name</th>
//                                         <th>Description</th>
//                                         <th>Rate</th>
//                                         <th>Action</th>
//                                       </tr>
//                                     </thead>
//                                     <tbody>
//                                       {(product.subProducts || []).map((sp) => (
//                                         <tr key={sp.id}>
//                                           <td>{sp.name}</td>
//                                           <td>{sp.description || "-"}</td>
//                                           <td>{sp.rate || "-"}</td>
//                                           <td>
//                                             <Button
//                                               size="sm"
//                                               variant="outline-danger"
//                                               onClick={() =>
//                                                 removeSubProduct(
//                                                   product.id,
//                                                   sp.id
//                                                 )
//                                               }
//                                             >
//                                               <FaTrash />
//                                             </Button>
//                                           </td>
//                                         </tr>
//                                       ))}
//                                     </tbody>
//                                   </Table>
//                                 </Card.Body>
//                               </Card>
//                             ))}

//                             {productsList.length > 0 && (
//                               <Card className="mt-4">
//                                 <Card.Header>
//                                   Add Additional Sub-Product
//                                 </Card.Header>
//                                 <Card.Body>
//                                   <Row className="g-2 mb-3">
//                                     <Col md={4}>
//                                       <Form.Label>Select Product</Form.Label>
//                                       <Form.Select
//                                         value={additionalSubForm.productIndex}
//                                         onChange={(e) =>
//                                           setAdditionalSubForm({
//                                             ...additionalSubForm,
//                                             productIndex: e.target.value,
//                                           })
//                                         }
//                                       >
//                                         <option value="">
//                                           -- Select Product --
//                                         </option>
//                                         {productsList.map((p, index) => (
//                                           <option key={p.id} value={index}>
//                                             {p.name}
//                                           </option>
//                                         ))}
//                                       </Form.Select>
//                                     </Col>
//                                     <Col md={8}>
//                                       <Form.Label>Sub-Product Name</Form.Label>
//                                       <Form.Control
//                                         placeholder="Enter sub-product name"
//                                         value={additionalSubForm.name}
//                                         onChange={(e) =>
//                                           setAdditionalSubForm({
//                                             ...additionalSubForm,
//                                             name: e.target.value,
//                                           })
//                                         }
//                                       />
//                                     </Col>
//                                   </Row>
//                                   <Row className="g-2 mb-3">
//                                     <Col md={6}>
//                                       <Form.Label>Rate</Form.Label>
//                                       <Form.Control
//                                         type="number"
//                                         step="0.01"
//                                         placeholder="Rate"
//                                         value={additionalSubForm.rate}
//                                         onChange={(e) =>
//                                           setAdditionalSubForm({
//                                             ...additionalSubForm,
//                                             rate: e.target.value,
//                                           })
//                                         }
//                                       />
//                                     </Col>
//                                     <Col md={6}>
//                                       <Form.Label>Description</Form.Label>
//                                       <Form.Control
//                                         as="textarea"
//                                         rows={1}
//                                         placeholder="Description"
//                                         value={additionalSubForm.description}
//                                         onChange={(e) =>
//                                           setAdditionalSubForm({
//                                             ...additionalSubForm,
//                                             description: e.target.value,
//                                           })
//                                         }
//                                       />
//                                     </Col>
//                                   </Row>
//                                   <Button
//                                     variant="secondary"
//                                     onClick={handleAddAdditionalSubProduct}
//                                   >
//                                     <FaPlus className="me-2" /> Add Sub-Product
//                                   </Button>
//                                 </Card.Body>
//                               </Card>
//                             )}

//                             <div className="d-flex justify-content-end mt-4">
//                               <Button
//                                 variant="success"
//                                 onClick={handleSubmitAll}
//                                 disabled={loading}
//                               >
//                                 {loading ? (
//                                   <Spinner size="sm" animation="border" />
//                                 ) : (
//                                   "Save All"
//                                 )}
//                               </Button>
//                             </div>
//                           </>
//                         )}

//                         {/* EXISTING product mode */}
//                         {productMode === "existing" && (
//                           <>
//                             {!useExistingBrand && (
//                               <Alert variant="warning">
//                                 To use an existing product, please choose{" "}
//                                 <strong>Use Existing Brand</strong> in the Brand
//                                 tab.
//                               </Alert>
//                             )}
//                             {useExistingBrand && (
//                               <>
//                                 <Form.Group className="mb-3">
//                                   <Form.Label>Search Product</Form.Label>
//                                   <Form.Control
//                                     type="text"
//                                     placeholder="Filter products by name..."
//                                     value={productSearchAdd}
//                                     onChange={(e) =>
//                                       setProductSearchAdd(e.target.value)
//                                     }
//                                   />
//                                 </Form.Group>
//                                 <Table striped hover size="sm">
//                                   <thead>
//                                     <tr>
//                                       <th>Sr. No</th>
//                                       <th>Product Name</th>
//                                       <th>Action</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {brandFilteredProducts
//                                       .filter(
//                                         (p) =>
//                                           !productSearchAdd.trim() ||
//                                           String(
//                                             p.product_name || ""
//                                           )
//                                             .toLowerCase()
//                                             .includes(
//                                               productSearchAdd.toLowerCase()
//                                             )
//                                       )
//                                       .map((product, idx) => (
//                                         <tr
//                                           key={product.id || product.product_name}
//                                           onClick={() => {
//                                             const canonicalName = String(
//                                               product.product_name ||
//                                                 product.g3_category ||
//                                                 ""
//                                             );
//                                             console.log(
//                                               "product clicked ->",
//                                               product,
//                                               "canonicalName:",
//                                               canonicalName
//                                             );
//                                             setExistingProdIdForAdd(
//                                               canonicalName
//                                             );
//                                           }}
//                                           style={{ cursor: "pointer" }}
//                                         >
//                                           <td>{idx + 1}</td>
//                                           <td>{product.product_name}</td>
//                                           <td className="text-end">
//                                             <Button
//                                               size="sm"
//                                               variant="danger"
//                                               onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 deleteProduct(
//                                                   product.product_name
//                                                 );
//                                               }}
//                                             >
//                                               <FaTrash />
//                                             </Button>
//                                           </td>
//                                         </tr>
//                                       ))}
//                                   </tbody>
//                                 </Table>

//                                 {existingProdIdForAdd && (
//                                   <Card className="mt-3">
//                                     <Card.Header>
//                                       Managing Sub-Products for:{" "}
//                                       <Badge bg="info">
//                                         {existingProdIdForAdd || "Unknown"}
//                                       </Badge>
//                                     </Card.Header>
//                                     <Card.Body>
//                                       <Form
//                                         onSubmit={handleAddSubToExistingProduct}
//                                         className="mb-3"
//                                       >
//                                         <Row className="g-2 mb-3">
//                                           <Col md={6}>
//                                             <Form.Control
//                                               placeholder="Enter sub-product name"
//                                               value={existingSubName}
//                                               onChange={(e) =>
//                                                 setExistingSubName(
//                                                   e.target.value
//                                                 )
//                                               }
//                                               required
//                                             />
//                                           </Col>
//                                           <Col md={3}>
//                                             <Form.Control
//                                               placeholder="Rate"
//                                               type="number"
//                                               step="0.01"
//                                               value={existingSubRate}
//                                               onChange={(e) =>
//                                                 setExistingSubRate(
//                                                   e.target.value
//                                                 )
//                                               }
//                                             />
//                                           </Col>
//                                           <Col md={3}>
//                                             <Button
//                                               type="submit"
//                                               variant="primary"
//                                               className="w-100"
//                                               disabled={existingSubSubmitting}
//                                             >
//                                               {existingSubSubmitting ? (
//                                                 <Spinner
//                                                   size="sm"
//                                                   animation="border"
//                                                 />
//                                               ) : (
//                                                 <>
//                                                   <FaPlus className="me-1" /> Add
//                                                   Sub
//                                                 </>
//                                               )}
//                                             </Button>
//                                           </Col>
//                                         </Row>
//                                         <Row className="g-2 mb-3">
//                                           <Col md={12}>
//                                             <Form.Control
//                                               as="textarea"
//                                               rows={2}
//                                               placeholder="Description (optional)"
//                                               value={existingSubDescription}
//                                               onChange={(e) =>
//                                                 setExistingSubDescription(
//                                                   e.target.value
//                                                 )
//                                               }
//                                             />
//                                           </Col>
//                                         </Row>
//                                       </Form>

//                                       {existingSubLoading ? (
//                                         <div className="text-center p-3">
//                                           <Spinner
//                                             animation="border"
//                                             size="sm"
//                                           />
//                                           <p className="mt-2">
//                                             Loading sub-products...
//                                           </p>
//                                         </div>
//                                       ) : (
//                                         <>
//                                           <Table striped hover size="sm">
//                                             <thead>
//                                               <tr>
//                                                 <th>Sr No</th>
//                                                 <th>Sub-product</th>
//                                                 <th>Description</th>
//                                                 <th>Rate</th>
//                                                 <th>Action</th>
//                                               </tr>
//                                             </thead>
//                                             <tbody>
//                                               {paginatedExistingSubProducts.map(
//                                                 (s, idx) => {
//                                                   const indexInFull =
//                                                     (currentPage - 1) *
//                                                       pageSize +
//                                                     idx;
//                                                   const latestRate =
//                                                     s.rate || "";
//                                                   return (
//                                                     <tr key={s.id}>
//                                                       <td>
//                                                         {indexInFull + 1}
//                                                       </td>
//                                                       <td>
//                                                         {s.item_name ||
//                                                           s.sub_prod_name ||
//                                                           "-"}
//                                                       </td>
//                                                       <td>
//                                                         {s.specification ||
//                                                           "-"}
//                                                       </td>
//                                                       <td>
//                                                         {latestRate || "-"}
//                                                       </td>
//                                                       <td>
//                                                         <Button
//                                                           size="sm"
//                                                           variant="danger"
//                                                           onClick={() =>
//                                                             deleteExistingSubProduct(
//                                                               s.id
//                                                             )
//                                                           }
//                                                         >
//                                                           <FaTrash />
//                                                         </Button>
//                                                       </td>
//                                                     </tr>
//                                                   );
//                                                 }
//                                               )}
//                                             </tbody>
//                                           </Table>

//                                           {totalExisting > pageSize && (
//                                             <div className="d-flex justify-content-center mt-3">
//                                               <Pagination>
//                                                 <Pagination.Prev
//                                                   onClick={() =>
//                                                     handlePageChange(
//                                                       currentPage - 1
//                                                     )
//                                                   }
//                                                   disabled={
//                                                     currentPage === 1
//                                                   }
//                                                 />
//                                                 {Array.from(
//                                                   { length: totalPages },
//                                                   (_, i) => {
//                                                     const page = i + 1;
//                                                     if (totalPages > 7) {
//                                                       if (
//                                                         page === 1 ||
//                                                         page === totalPages ||
//                                                         (page >=
//                                                           currentPage - 2 &&
//                                                           page <=
//                                                             currentPage + 2)
//                                                       ) {
//                                                         return (
//                                                           <Pagination.Item
//                                                             key={page}
//                                                             active={
//                                                               page ===
//                                                               currentPage
//                                                             }
//                                                             onClick={() =>
//                                                               handlePageChange(
//                                                                 page
//                                                               )
//                                                             }
//                                                           >
//                                                             {page}
//                                                           </Pagination.Item>
//                                                         );
//                                                       }
//                                                       if (
//                                                         page === 2 &&
//                                                         currentPage > 4
//                                                       ) {
//                                                         return (
//                                                           <Pagination.Ellipsis
//                                                             key="e1"
//                                                             disabled
//                                                           />
//                                                         );
//                                                       }
//                                                       if (
//                                                         page ===
//                                                           totalPages - 1 &&
//                                                         currentPage <
//                                                           totalPages - 3
//                                                       ) {
//                                                         return (
//                                                           <Pagination.Ellipsis
//                                                             key="e2"
//                                                             disabled
//                                                           />
//                                                         );
//                                                       }
//                                                       return null;
//                                                     }
//                                                     return (
//                                                       <Pagination.Item
//                                                         key={page}
//                                                         active={
//                                                           page === currentPage
//                                                         }
//                                                         onClick={() =>
//                                                           handlePageChange(
//                                                             page
//                                                           )
//                                                         }
//                                                       >
//                                                         {page}
//                                                       </Pagination.Item>
//                                                     );
//                                                   }
//                                                 )}
//                                                 <Pagination.Next
//                                                   onClick={() =>
//                                                     handlePageChange(
//                                                       currentPage + 1
//                                                     )
//                                                   }
//                                                   disabled={
//                                                     currentPage === totalPages
//                                                   }
//                                                 />
//                                               </Pagination>
//                                             </div>
//                                           )}
//                                         </>
//                                       )}
//                                     </Card.Body>
//                                   </Card>
//                                 )}
//                               </>
//                             )}
//                           </>
//                         )}
//                       </Card.Body>
//                     </Card>
//                   </Tab>
//                 </Tabs>
//               ) : (
//                 <Alert variant="info">
//                   View mode (existing data management).
//                 </Alert>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default ProductMaster;

// src/forms/ProductMaster.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Alert,
  Badge,
  Spinner,
  Tabs,
  Tab,
  Pagination,
} from "react-bootstrap";
import {
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE = "https://nlfs.in/erp/index.php/Api"; // list + delete
const ERP_BASE = "https://nlfs.in/erp/index.php/Erp"; // add_product_mst + update_specification

const isOk = (val) =>
  val === true || val === "true" || val === 1 || val === "1";

/** Robust ID extractor (kept for future use) */
const extractId = (resData, possibleFields = ["id", "sub_prod_id"]) => {
  try {
    if (!resData) return null;
    for (const f of possibleFields) {
      if (resData[f] !== undefined && resData[f] !== null) return resData[f];
    }
    if (resData.data && typeof resData.data === "object" && !Array.isArray(resData.data)) {
      for (const f of possibleFields) {
        if (resData.data[f] !== undefined && resData.data[f] !== null)
          return resData.data[f];
      }
    }
    if (Array.isArray(resData.data) && resData.data.length > 0) {
      const first = resData.data[0];
      for (const f of possibleFields) {
        if (first && first[f] !== undefined && first[f] !== null) return first[f];
      }
    }
    const scanArrayForField = (arr) => {
      if (!Array.isArray(arr)) return null;
      for (const obj of arr) {
        for (const f of possibleFields) {
          if (obj && obj[f] !== undefined && obj[f] !== null) return obj[f];
        }
      }
      return null;
    };
    if (resData.data && Array.isArray(resData.data)) {
      const found = scanArrayForField(resData.data);
      if (found) return found;
    }
    return null;
  } catch (e) {
    console.warn("extractId error", e);
    return null;
  }
};

const ProductMaster = () => {
  // ---------- Data ----------
  const [brands, setBrands] = useState([]); // { id, brand_name }
  const [products, setProducts] = useState([]); // { id, product_name }
  const [subProducts, setSubProducts] = useState([]); // full cache from list_mst_sub_product
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------- Add-mode ----------
  const [brandName, setBrandName] = useState("");
  const [productsList, setProductsList] = useState([]);
  const [newProductForm, setNewProductForm] = useState({
    productName: "",
    subProductName: "",
    subProductDescription: "",
    subProductRate: "",
    subProductImage: null,
  });
  const [additionalSubForm, setAdditionalSubForm] = useState({
    productIndex: "",
    name: "",
    description: "",
    rate: "",
    image: null,
  });

  const [existingSubImage, setExistingSubImage] = useState(null);

  // ---------- Tabs ----------
  const [activeTab, setActiveTab] = useState("brand");

  // ---------- Brand/Product modes ----------
  const [useExistingBrand, setUseExistingBrand] = useState(false);
  const [existingBrandIdForAdd, setExistingBrandIdForAdd] = useState("");
  const [productMode, setProductMode] = useState("new");
  const [productSearchAdd, setProductSearchAdd] = useState("");
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

  // ---------- Pagination for existingSubProducts ----------
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ---------- Edit existing sub-product (inline) ----------
  const [editingSubId, setEditingSubId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editRate, setEditRate] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // ---------- Fetch all specs + derive brands/products ----------
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const sR = await axios.post(
        `${API_BASE}/list_mst_sub_product`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );
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
        }));
        setSubProducts(all);

        // derive brands
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

        // derive products (ALL products across brands; we'll brand-filter later)
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

        setRates(
          all.map((r) => ({
            sub_prod_id: r.id,
            rate: r.rate,
            created_at: r.created_at,
          }))
        );
      } else {
        setSubProducts([]);
        setBrands([]);
        setProducts([]);
        setRates([]);
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

  // ---------- Selected brand name (string) ----------
  const selectedBrandName = useMemo(() => {
    if (useExistingBrand) {
      return (
        brands.find((b) => String(b.id) === String(existingBrandIdForAdd))
          ?.brand_name || ""
      );
    }
    return brandName || "";
  }, [useExistingBrand, existingBrandIdForAdd, brands, brandName]);

  // ---------- Product/Sub-product Helpers for NEW mode ----------
  const handleAddNewProductWithSubProduct = () => {
    if (!newProductForm.productName.trim())
      return toast.error("Please enter a product name");
    if (!newProductForm.subProductName.trim())
      return toast.error("Please enter a sub-product name");

    const newProduct = {
      id: Date.now(),
      name: newProductForm.productName,
      subProducts: [
        {
          id: Date.now() + 1,
          name: newProductForm.subProductName,
          description: newProductForm.subProductDescription,
          rate: newProductForm.subProductRate,
          image: newProductForm.subProductImage,
        },
      ],
    };
    setProductsList((prev) => [...prev, newProduct]);
    setNewProductForm({
      productName: "",
      subProductName: "",
      subProductDescription: "",
      subProductRate: "",
      subProductImage: null,
    });
    toast.success("Product and Sub-product added to list");
  };

  const handleAddAdditionalSubProduct = () => {
    const { productIndex, name, description, rate } = additionalSubForm;
    if (productIndex === "" || !name.trim())
      return toast.error("Please select a product and enter a sub-product name");
    const newSubProduct = { id: Date.now(), name, description, rate, image: additionalSubForm.image };
    setProductsList((prev) =>
      prev.map((product, index) =>
        index === parseInt(productIndex, 10)
          ? {
            ...product,
            subProducts: product.subProducts
              ? [...product.subProducts, newSubProduct]
              : [newSubProduct],
          }
          : product
      )
    );
    setAdditionalSubForm({
      productIndex: "",
      name: "",
      description: "",
      rate: "",
      image: null,
    });
    toast.success("Additional sub-product added");
  };

  const removeProduct = (id) =>
    setProductsList((prev) => prev.filter((p) => p.id !== id));

  const removeSubProduct = (productId, subId) => {
    setProductsList((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
            ...p,
            subProducts: p.subProducts.filter((sp) => sp.id !== subId),
          }
          : p
      )
    );
  };

  // ---------- Submit All (NEW brand/products -> add_product_mst) ----------
  const handleSubmitAll = async () => {
    if (!useExistingBrand && !brandName.trim()) {
      return toast.error(
        "Please enter a brand name (or choose existing brand)."
      );
    }

    let itemsToSave = [...productsList];
    // If no items in list but form is filled, auto-add it
    if (
      itemsToSave.length === 0 &&
      newProductForm.productName.trim() &&
      newProductForm.subProductName.trim()
    ) {
      itemsToSave.push({
        id: Date.now(),
        name: newProductForm.productName,
        subProducts: [
          {
            id: Date.now() + 1,
            name: newProductForm.subProductName,
            description: newProductForm.subProductDescription,
            rate: newProductForm.subProductRate,
            image: newProductForm.subProductImage,
          },
        ],
      });
    }

    if (itemsToSave.length === 0)
      return toast.error(
        "Add at least one product with sub-product before saving."
      );

    setLoading(true);
    try {
      const brandValue = (useExistingBrand
        ? selectedBrandName
        : brandName
      ).toString();

      for (const product of itemsToSave) {
        const g3 = product.name;
        for (const sp of product.subProducts || []) {
          const fd = new FormData();
          fd.append("brand", brandValue);
          fd.append("g3_category", g3);
          fd.append("g4_sub_category", "");
          fd.append("item_name", sp.name || "");
          fd.append("uom", sp.uom || "NOS");
          fd.append("gst", sp.rate ? "18" : "");
          fd.append("hsn_code", sp.hsn_code || "");
          fd.append("specification", sp.description || "");
          fd.append("rate", (sp.rate === undefined || sp.rate === null || sp.rate === "") ? "" : String(sp.rate));

          if (sp.image) {
            fd.append("image", sp.image);
          }

          const res = await axios.post(
            `${ERP_BASE}/add_product_mst`,
            fd
          );
          if (!isOk(res.data.status) || !isOk(res.data.success)) {
            toast.error(
              `Failed to add ${sp.name}: ${res.data.message || "API error"}`
            );
          } else {
            console.log("added spec row ->", res.data);
          }
        }
      }

      toast.success("All items submitted. Refreshing...");
      await fetchAllData();
      setProductsList([]);
      setNewProductForm({
        productName: "",
        subProductName: "",
        subProductDescription: "",
        subProductRate: "",
        subProductImage: null,
      });
      setBrandName("");
      setUseExistingBrand(false);
      setExistingBrandIdForAdd("");
      setActiveTab("brand");
    } catch (err) {
      console.error("handleSubmitAll error", err);
      toast.error("Error submitting items.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Fetch existing sub-products for a product (brand-aware) ----------
  const fetchExistingSubProducts = async (prodName, brandFilter) => {
    setExistingSubLoading(true);
    setCurrentPage(1);
    try {
      const targetProd = (prodName || "").toString();
      const targetBrand = (brandFilter || "").toString();

      // filter from local cache first
      const filteredLocal = subProducts.filter((sp) => {
        const p = (sp.g3_category || sp.product_name || "").toString();
        const b = (sp.brand || "").toString();
        if (!targetProd) return false;
        if (p !== targetProd) return false;
        if (targetBrand && b !== targetBrand) return false;
        return true;
      });

      if (filteredLocal.length > 0) {
        setExistingSubProducts(filteredLocal);
        setExistingSubLoading(false);
        return;
      }

      // fallback to API
      const res = await axios.post(
        `${API_BASE}/list_mst_sub_product`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );
      if (isOk(res.data.status) && isOk(res.data.success)) {
        const all = (res.data.data || []).map((sp) => ({
          ...sp,
          id: sp.id || sp.sub_prod_id,
          brand: sp.brand || "",
          g3_category: sp.g3_category || sp.product_name || "",
          g4_sub_category: sp.g4_sub_category || "",
          item_name: sp.item_name || sp.sub_prod_name || "",
          uom: sp.uom || "",
          gst: sp.gst || "",
          hsn_code: sp.hsn_code || "",
          specification: sp.specification || sp.description || "",
          rate: sp.rate || "",
        }));
        const filtered = all.filter((sp) => {
          const p = (sp.g3_category || "").toString();
          const b = (sp.brand || "").toString();
          if (!targetProd) return false;
          if (p !== targetProd) return false;
          if (targetBrand && b !== targetBrand) return false;
          return true;
        });
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

  // ---------- React to selected product change in EXISTING mode ----------
  useEffect(() => {
    if (productMode === "existing" && existingProdIdForAdd) {
      fetchExistingSubProducts(existingProdIdForAdd, selectedBrandName);
    } else {
      setExistingSubProducts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productMode, existingProdIdForAdd, subProducts, selectedBrandName]);

  // ---------- Add sub to existing product ----------
  const handleAddSubToExistingProduct = async (e) => {
    e.preventDefault();
    if (!existingProdIdForAdd)
      return toast.error("Please select a product.");
    if (!existingSubName.trim())
      return toast.error("Please enter sub-product name.");
    setExistingSubSubmitting(true);
    try {
      const brandValue = selectedBrandName.toString();

      const fd = new FormData();
      fd.append("brand", brandValue);
      fd.append("g3_category", existingProdIdForAdd);
      fd.append("g4_sub_category", "");
      fd.append("item_name", existingSubName.trim());
      fd.append("uom", "NOS");
      fd.append("gst", existingSubRate ? "18" : "");
      fd.append("hsn_code", "");
      fd.append("specification", existingSubDescription || "");
      fd.append("rate", existingSubRate ? String(existingSubRate) : "");

      if (existingSubImage) {
        fd.append("image", existingSubImage);
      }

      const res = await axios.post(
        `${ERP_BASE}/add_product_mst`,
        fd
      );

      console.log("add_product_mst (existing product) response:", res.data);
      if (!isOk(res.data.status) || !isOk(res.data.success)) {
        throw new Error(res.data.message || "Unknown API error");
      }

      toast.success("Sub-product added successfully.");
      setExistingSubName("");
      setExistingSubDescription("");
      setExistingSubRate("");
      setExistingSubImage(null);
      await fetchAllData();
      fetchExistingSubProducts(existingProdIdForAdd, selectedBrandName);
    } catch (err) {
      console.error("Add sub-product error:", err);
      toast.error(`Error: ${err.message || err}`);
    } finally {
      setExistingSubSubmitting(false);
    }
  };

  // ---------- Update existing sub-product (description + rate) ----------
  const handleUpdateSubProduct = async (row) => {
    if (!editingSubId) return;

    setEditSubmitting(true);
    try {
      const payload = {
        id: row.id,
        brand: row.brand || "",
        g3_category: row.g3_category || "",
        g4_sub_category: row.g4_sub_category || "",
        item_name: row.item_name || row.sub_prod_name || "",
        uom: row.uom || "NOS",
        gst: row.gst || "",
        hsn_code: row.hsn_code || "",
        specification: editDescription || "",
        rate: editRate === "" ? "" : String(editRate),
      };

      const res = await axios.post(
        `${ERP_BASE}/update_specification`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("update_specification response:", res.data);

      if (!isOk(res.data.status) || !isOk(res.data.success)) {
        throw new Error(res.data.message || "Unknown API error");
      }

      toast.success("Sub-product updated successfully.");

      setEditingSubId(null);
      setEditDescription("");
      setEditRate("");

      // refresh global + local data
      await fetchAllData();
      if (productMode === "existing" && existingProdIdForAdd) {
        fetchExistingSubProducts(existingProdIdForAdd, selectedBrandName);
      }
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
  };

  // ---------- Delete helpers ----------
  const deleteExistingSubProduct = async (subProdId) => {
    if (!window.confirm("Delete this sub-product?")) return;
    try {
      const res = await axios.delete(
        `${API_BASE}/delete_mst_sub_product`,
        {
          headers: { "Content-Type": "application/json" },
          data: { id: subProdId },
        }
      );
      if (isOk(res.data.status) && isOk(res.data.success)) {
        toast.success("Sub-product deleted");
        setExistingSubProducts((prev) =>
          prev.filter((s) => String(s.id) !== String(subProdId))
        );
        fetchAllData();
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
      const toDelete = subProducts.filter(
        (sp) => String(sp.brand) === String(brandNameVal)
      );
      for (const r of toDelete) {
        try {
          await axios.delete(`${API_BASE}/delete_mst_sub_product`, {
            headers: { "Content-Type": "application/json" },
            data: { id: r.id },
          });
        } catch (e) {
          console.warn("failed deleting row", r.id, e);
        }
      }
      toast.success("Brand rows deleted (attempted). Refreshing.");
      fetchAllData();
    } catch (err) {
      console.error("deleteBrand error", err);
      toast.error("Failed to delete brand");
    }
  };

  const deleteProduct = async (productName) => {
    if (!window.confirm("Delete this product and all its sub-products?"))
      return;
    try {
      const toDelete = subProducts.filter(
        (sp) => String(sp.g3_category) === String(productName)
      );
      for (const r of toDelete) {
        try {
          await axios.delete(`${API_BASE}/delete_mst_sub_product`, {
            headers: { "Content-Type": "application/json" },
            data: { id: r.id },
          });
        } catch (e) {
          console.warn("failed deleting row", r.id, e);
        }
      }
      toast.success("Product rows deleted (attempted). Refreshing.");
      fetchAllData();
    } catch (err) {
      console.error("deleteProduct error", err);
      toast.error("Failed to delete product");
    }
  };

  // ---------- Brand-filtered products for EXISTING mode ----------
  const brandFilteredProducts = useMemo(() => {
    if (!selectedBrandName) return [];
    const set = new Set();
    const result = [];
    subProducts.forEach((sp) => {
      if (String(sp.brand) !== String(selectedBrandName)) return;
      const p = (sp.g3_category || "").toString();
      if (!p) return;
      if (!set.has(p)) {
        set.add(p);
        result.push({ id: `bp_${result.length + 1}`, product_name: p });
      }
    });
    return result;
  }, [subProducts, selectedBrandName]);

  // ---------- Pagination helpers ----------
  const totalExisting = existingSubProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalExisting / pageSize));
  const paginatedExistingSubProducts = existingSubProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const el = document.querySelector(".card-body");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ---------- Render ----------
  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header
              style={{ backgroundColor: "#fff", borderBottom: "none" }}
            >
              <Row className="align-items-center">
                <Col>
                  <Card.Title
                    style={{ marginTop: "2rem", fontWeight: "700" }}
                  >
                    Products Master
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setActiveTab("brand")}
                  >
                    <FaArrowLeft /> Back to Brand
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              {viewMode === "add" ? (
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-4"
                >
                  {/* Tab 1 - Brand */}
                  <Tab eventKey="brand" title="1. Brand">
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
                            <Form.Text muted>
                              Example: LG, Samsung, Bosch, etc.
                            </Form.Text>
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
                                onChange={(e) =>
                                  setBrandSearch(e.target.value)
                                }
                              />
                            </Form.Group>
                            <Table striped hover size="sm">
                              <thead>
                                <tr>
                                  <th>Sr No</th>
                                  <th>Brand Name</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(brands || [])
                                  .filter(
                                    (b) =>
                                      !brandSearch.trim() ||
                                      String(b.brand_name || "")
                                        .toLowerCase()
                                        .includes(
                                          brandSearch.toLowerCase()
                                        )
                                  )
                                  .map((brand, idx) => (
                                    <tr
                                      key={brand.id}
                                      onClick={() => setExistingBrandIdForAdd(brand.id)}
                                      style={{ cursor: "pointer" }}
                                      className={
                                        String(existingBrandIdForAdd) === String(brand.id)
                                          ? "table-active brand-active"
                                          : ""
                                      }
                                    >

                                      <td>{idx + 1}</td>
                                      <td>
                                        {brand.brand_name}
                                        {String(existingBrandIdForAdd) === String(brand.id) && (
                                          <Badge bg="primary" className="ms-2">
                                            Selected
                                          </Badge>
                                        )}
                                      </td>
                                      <td className="text-end">
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
                          </>
                        )}
                        <div className="d-flex justify-content-end mt-3">
                          <Button
                            variant="primary"
                            onClick={() => {
                              if (!useExistingBrand && !brandName.trim()) {
                                toast.error("Please enter a brand name");
                                return;
                              }
                              if (useExistingBrand && !existingBrandIdForAdd) {
                                toast.error("Please select a brand");
                                return;
                              }
                              setActiveTab("products");
                            }}
                          >
                            Save and Proceed
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Tab>

                  {/* Tab 2 - Products & Sub-Products */}
                  <Tab eventKey="products" title="2. Products & Sub-Products">
                    <Card className="mb-4">
                      <Card.Header>Step 2: Products & Sub-Products</Card.Header>
                      <Card.Body>
                        <div className="d-flex justify-content-between mb-3">
                          <div>
                            <strong>Brand: </strong>
                            <Badge bg="secondary">
                              {selectedBrandName || "New Brand"}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            onClick={() => setActiveTab("brand")}
                          >
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
                              <Card.Header>
                                Add New Product & Sub-Product
                              </Card.Header>
                              <Card.Body>
                                <Row className="g-2 mb-3">
                                  <Col md={12}>
                                    <Form.Label>Product Name</Form.Label>
                                    <Form.Control
                                      placeholder="Enter product name"
                                      value={newProductForm.productName}
                                      onChange={(e) =>
                                        setNewProductForm({
                                          ...newProductForm,
                                          productName: e.target.value,
                                        })
                                      }
                                    />
                                  </Col>
                                </Row>
                                <Row className="g-2 mb-3">
                                  <Col md={12}>
                                    <Form.Label>Sub-Product Name</Form.Label>
                                    <Form.Control
                                      placeholder="Enter sub-product name"
                                      value={newProductForm.subProductName}
                                      onChange={(e) =>
                                        setNewProductForm({
                                          ...newProductForm,
                                          subProductName: e.target.value,
                                        })
                                      }
                                    />
                                  </Col>
                                  <Col md={12}>
                                    <Form.Label>Sub-Product Image</Form.Label>
                                    <Form.Control
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        setNewProductForm({
                                          ...newProductForm,
                                          subProductImage: e.target.files[0],
                                        })
                                      }
                                    />
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
                                      onChange={(e) =>
                                        setNewProductForm({
                                          ...newProductForm,
                                          subProductRate: e.target.value,
                                        })
                                      }
                                    />
                                  </Col>
                                  <Col md={6}>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                      as="textarea"
                                      rows={1}
                                      placeholder="Description"
                                      value={
                                        newProductForm.subProductDescription
                                      }
                                      onChange={(e) =>
                                        setNewProductForm({
                                          ...newProductForm,
                                          subProductDescription:
                                            e.target.value,
                                        })
                                      }
                                    />
                                  </Col>
                                </Row>
                                <Button
                                  variant="primary"
                                  onClick={handleAddNewProductWithSubProduct}
                                >
                                  <FaPlus className="me-2" /> Add Product &
                                  Sub-Product
                                </Button>
                              </Card.Body>
                            </Card>

                            {productsList.map((product) => (
                              <Card key={product.id} className="mb-2">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                  <strong>{product.name}</strong>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeProduct(product.id)}
                                  >
                                    <FaTrash />
                                  </Button>
                                </Card.Header>
                                <Card.Body>
                                  <Table striped bordered size="sm">
                                    <thead>
                                      <tr>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Rate</th>
                                        <th>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(product.subProducts || []).map((sp) => (
                                        <tr key={sp.id}>
                                          <td>{sp.name}</td>
                                          <td>{sp.description || "-"}</td>
                                          <td>{sp.rate || "-"}</td>
                                          <td>
                                            <Button
                                              size="sm"
                                              variant="outline-danger"
                                              onClick={() =>
                                                removeSubProduct(
                                                  product.id,
                                                  sp.id
                                                )
                                              }
                                            >
                                              <FaTrash />
                                            </Button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                </Card.Body>
                              </Card>
                            ))}

                            {productsList.length > 0 && (
                              <Card className="mt-4">
                                <Card.Header>
                                  Add Additional Sub-Product
                                </Card.Header>
                                <Card.Body>
                                  <Row className="g-2 mb-3">
                                    <Col md={4}>
                                      <Form.Label>Select Product</Form.Label>
                                      <Form.Select
                                        value={additionalSubForm.productIndex}
                                        onChange={(e) =>
                                          setAdditionalSubForm({
                                            ...additionalSubForm,
                                            productIndex: e.target.value,
                                          })
                                        }
                                      >
                                        <option value="">
                                          -- Select Product --
                                        </option>
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
                                        onChange={(e) =>
                                          setAdditionalSubForm({
                                            ...additionalSubForm,
                                            name: e.target.value,
                                          })
                                        }
                                      />
                                    </Col>
                                    <Col md={12}>
                                      <Form.Label>Sub-Product Image</Form.Label>
                                      <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                          setAdditionalSubForm({
                                            ...additionalSubForm,
                                            image: e.target.files[0],
                                          })
                                        }
                                      />
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
                                        onChange={(e) =>
                                          setAdditionalSubForm({
                                            ...additionalSubForm,
                                            rate: e.target.value,
                                          })
                                        }
                                      />
                                    </Col>
                                    <Col md={6}>
                                      <Form.Label>Description</Form.Label>
                                      <Form.Control
                                        as="textarea"
                                        rows={1}
                                        placeholder="Description"
                                        value={additionalSubForm.description}
                                        onChange={(e) =>
                                          setAdditionalSubForm({
                                            ...additionalSubForm,
                                            description: e.target.value,
                                          })
                                        }
                                      />
                                    </Col>
                                  </Row>
                                  <Button
                                    variant="secondary"
                                    onClick={handleAddAdditionalSubProduct}
                                  >
                                    <FaPlus className="me-2" /> Add Sub-Product
                                  </Button>
                                </Card.Body>
                              </Card>
                            )}

                            <div className="d-flex justify-content-end mt-4">
                              <Button
                                variant="success"
                                onClick={handleSubmitAll}
                                disabled={loading}
                              >
                                {loading ? (
                                  <Spinner size="sm" animation="border" />
                                ) : (
                                  "Save All"
                                )}
                              </Button>
                            </div>
                          </>
                        )}

                        {/* EXISTING product mode */}
                        {productMode === "existing" && (
                          <>
                            {!useExistingBrand && (
                              <Alert variant="warning">
                                To use an existing product, please choose{" "}
                                <strong>Use Existing Brand</strong> in the Brand
                                tab.
                              </Alert>
                            )}
                            {useExistingBrand && (
                              <>
                                <Form.Group className="mb-3">
                                  <Form.Label>Search Product</Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder="Filter products by name..."
                                    value={productSearchAdd}
                                    onChange={(e) =>
                                      setProductSearchAdd(e.target.value)
                                    }
                                  />
                                </Form.Group>
                                <Table striped hover size="sm">
                                  <thead>
                                    <tr>
                                      <th>Sr. No</th>
                                      <th>Product Name</th>
                                      <th>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {brandFilteredProducts
                                      .filter(
                                        (p) =>
                                          !productSearchAdd.trim() ||
                                          String(
                                            p.product_name || ""
                                          )
                                            .toLowerCase()
                                            .includes(
                                              productSearchAdd.toLowerCase()
                                            )
                                      )
                                      .map((product, idx) => (
                                        <tr
                                          key={product.id || product.product_name}
                                          onClick={() =>
                                            setExistingProdIdForAdd(
                                              String(product.product_name || product.g3_category)
                                            )
                                          }
                                          style={{ cursor: "pointer" }}
                                          className={
                                            String(existingProdIdForAdd) ===
                                              String(product.product_name)
                                              ? "table-active product-active"
                                              : ""
                                          }
                                        >

                                          <td>{idx + 1}</td>
                                          <td>{product.product_name}</td>
                                          <td className="text-end">
                                            <Button
                                              size="sm"
                                              variant="danger"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                deleteProduct(
                                                  product.product_name
                                                );
                                              }}
                                            >
                                              <FaTrash />
                                            </Button>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </Table>

                                {existingProdIdForAdd && (
                                  <Card className="mt-3">
                                    <Card.Header>
                                      Managing Sub-Products for:{" "}
                                      <Badge bg="info">
                                        {existingProdIdForAdd || "Unknown"}
                                      </Badge>
                                    </Card.Header>
                                    <Card.Body>
                                      <Form
                                        onSubmit={handleAddSubToExistingProduct}
                                        className="mb-3"
                                      >
                                        <Row className="g-2 mb-3">
                                          <Col md={6}>
                                            <Form.Control
                                              placeholder="Enter sub-product name"
                                              value={existingSubName}
                                              onChange={(e) =>
                                                setExistingSubName(
                                                  e.target.value
                                                )
                                              }
                                              required
                                            />
                                          </Col>
                                          <Col md={3}>
                                            <Form.Control
                                              placeholder="Rate"
                                              type="number"
                                              step="0.01"
                                              value={existingSubRate}
                                              onChange={(e) =>
                                                setExistingSubRate(
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </Col>
                                          <Col md={3}>
                                            <Button
                                              type="submit"
                                              variant="primary"
                                              className="w-100"
                                              disabled={existingSubSubmitting}
                                            >
                                              {existingSubSubmitting ? (
                                                <Spinner
                                                  size="sm"
                                                  animation="border"
                                                />
                                              ) : (
                                                <>
                                                  <FaPlus className="me-1" /> Add
                                                  Sub
                                                </>
                                              )}
                                            </Button>
                                          </Col>
                                        </Row>
                                        <Row className="g-2 mb-3">
                                          <Col md={12}>
                                            <Form.Control
                                              as="textarea"
                                              rows={2}
                                              placeholder="Description (optional)"
                                              value={existingSubDescription}
                                              onChange={(e) =>
                                                setExistingSubDescription(
                                                  e.target.value
                                                )
                                              }
                                            />
                                          </Col>
                                        </Row>
                                        <Row className="g-2 mb-3">
                                          <Col md={12}>
                                            <Form.Label>Sub-Product Image</Form.Label>
                                            <Form.Control
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) =>
                                                setExistingSubImage(e.target.files[0])
                                              }
                                            />
                                          </Col>
                                        </Row>
                                      </Form>

                                      {existingSubLoading ? (
                                        <div className="text-center p-3">
                                          <Spinner
                                            animation="border"
                                            size="sm"
                                          />
                                          <p className="mt-2">
                                            Loading sub-products...
                                          </p>
                                        </div>
                                      ) : (
                                        <>
                                          <Table striped hover size="sm">
                                            <thead>
                                              <tr>
                                                <th>Sr No</th>
                                                <th>Sub-product</th>
                                                <th>Description</th>
                                                <th>Rate</th>
                                                <th>Action</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {paginatedExistingSubProducts.map(
                                                (s, idx) => {
                                                  const indexInFull =
                                                    (currentPage - 1) *
                                                    pageSize +
                                                    idx;
                                                  const latestRate =
                                                    s.rate || "";

                                                  const isEditing =
                                                    editingSubId === s.id;

                                                  return (
                                                    <tr key={s.id}>
                                                      <td>
                                                        {indexInFull + 1}
                                                      </td>
                                                      <td>
                                                        {s.item_name ||
                                                          s.sub_prod_name ||
                                                          "-"}
                                                      </td>
                                                      <td style={{ minWidth: "300px" }}>
                                                        {isEditing ? (
                                                          <Form.Control
                                                            as="textarea"
                                                            rows={2}
                                                            value={
                                                              editDescription
                                                            }
                                                            onChange={(e) =>
                                                              setEditDescription(
                                                                e.target.value
                                                              )
                                                            }
                                                          />
                                                        ) : (
                                                          s.specification || "-"
                                                        )}
                                                      </td>
                                                      <td style={{ minWidth: "120px" }}>
                                                        {isEditing ? (
                                                          <Form.Control
                                                            type="number"
                                                            step="0.01"
                                                            value={editRate}
                                                            onChange={(e) =>
                                                              setEditRate(
                                                                e.target.value
                                                              )
                                                            }
                                                          />
                                                        ) : (
                                                          latestRate || "-"
                                                        )}
                                                      </td>
                                                      <td>
                                                        {isEditing ? (
                                                          <div className="d-flex gap-1">
                                                            <Button
                                                              size="sm"
                                                              variant="success"
                                                              disabled={
                                                                editSubmitting
                                                              }
                                                              onClick={() =>
                                                                handleUpdateSubProduct(
                                                                  s
                                                                )
                                                              }
                                                            >
                                                              {editSubmitting ? (
                                                                <Spinner
                                                                  size="sm"
                                                                  animation="border"
                                                                />
                                                              ) : (
                                                                <>
                                                                  <FaSave className="me-1" />
                                                                  Save
                                                                </>
                                                              )}
                                                            </Button>
                                                            <Button
                                                              size="sm"
                                                              variant="secondary"
                                                              onClick={
                                                                cancelEditSubProduct
                                                              }
                                                            >
                                                              <FaTimes className="me-1" />
                                                              Cancel
                                                            </Button>
                                                          </div>
                                                        ) : (
                                                          <div className="d-flex gap-1">
                                                            <Button

                                                              className="buttonEye"
                                                              onClick={() => {
                                                                setEditingSubId(
                                                                  s.id
                                                                );
                                                                setEditDescription(
                                                                  s.specification ||
                                                                  ""
                                                                );
                                                                setEditRate(
                                                                  s.rate || ""
                                                                );
                                                              }}
                                                            >
                                                              <FaEdit />

                                                            </Button>
                                                            <Button
                                                              size="sm"
                                                              variant="danger"
                                                              onClick={() =>
                                                                deleteExistingSubProduct(
                                                                  s.id
                                                                )
                                                              }
                                                            >
                                                              <FaTrash />
                                                            </Button>
                                                          </div>
                                                        )}
                                                      </td>
                                                    </tr>
                                                  );
                                                }
                                              )}
                                            </tbody>
                                          </Table>

                                          {totalExisting > pageSize && (
                                            <div className="d-flex justify-content-center mt-3">
                                              <Pagination>
                                                <Pagination.Prev
                                                  onClick={() =>
                                                    handlePageChange(
                                                      currentPage - 1
                                                    )
                                                  }
                                                  disabled={
                                                    currentPage === 1
                                                  }
                                                />
                                                {Array.from(
                                                  { length: totalPages },
                                                  (_, i) => {
                                                    const page = i + 1;
                                                    if (totalPages > 7) {
                                                      if (
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        (page >=
                                                          currentPage - 2 &&
                                                          page <=
                                                          currentPage + 2)
                                                      ) {
                                                        return (
                                                          <Pagination.Item
                                                            key={page}
                                                            active={
                                                              page ===
                                                              currentPage
                                                            }
                                                            onClick={() =>
                                                              handlePageChange(
                                                                page
                                                              )
                                                            }
                                                          >
                                                            {page}
                                                          </Pagination.Item>
                                                        );
                                                      }
                                                      if (
                                                        page === 2 &&
                                                        currentPage > 4
                                                      ) {
                                                        return (
                                                          <Pagination.Ellipsis
                                                            key="e1"
                                                            disabled
                                                          />
                                                        );
                                                      }
                                                      if (
                                                        page ===
                                                        totalPages - 1 &&
                                                        currentPage <
                                                        totalPages - 3
                                                      ) {
                                                        return (
                                                          <Pagination.Ellipsis
                                                            key="e2"
                                                            disabled
                                                          />
                                                        );
                                                      }
                                                      return null;
                                                    }
                                                    return (
                                                      <Pagination.Item
                                                        key={page}
                                                        active={
                                                          page === currentPage
                                                        }
                                                        onClick={() =>
                                                          handlePageChange(
                                                            page
                                                          )
                                                        }
                                                      >
                                                        {page}
                                                      </Pagination.Item>
                                                    );
                                                  }
                                                )}
                                                <Pagination.Next
                                                  onClick={() =>
                                                    handlePageChange(
                                                      currentPage + 1
                                                    )
                                                  }
                                                  disabled={
                                                    currentPage === totalPages
                                                  }
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
                      </Card.Body>
                    </Card>
                  </Tab>
                </Tabs>
              ) : (
                <Alert variant="info">
                  View mode (existing data management).
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductMaster;
