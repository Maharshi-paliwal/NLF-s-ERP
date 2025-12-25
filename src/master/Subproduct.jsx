import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Pagination,
  Alert,
  Badge,
  Modal,
  Spinner,
  Tabs,
  Tab,
  Nav,
} from "react-bootstrap";
import { FaPlus, FaTrash, FaSave, FaEye, FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE = "https://nlfs.in/erp/index.php/Api";

// Helper for status
const isOk = (val) =>
  val === true || val === "true" || val === 1 || val === "1";

const ProductMaster = () => {
  // Master data
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [subProducts, setSubProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ADD / ALLOCATE wizard state
  const [viewMode, setViewMode] = useState("add"); // "add" | "view"
  const [addStep, setAddStep] = useState("brand"); // "brand" | "products" | "review"

  // Step 1 (Brand)
  const [brandName, setBrandName] = useState("");              // new brand name (optional)
  const [brandSearchAdd, setBrandSearchAdd] = useState("");    // search in existing brands list
  const [selectedBrandIdForAdd, setSelectedBrandIdForAdd] = useState(""); // existing brand we're attaching to

  // Step 2 (New products to create in this batch)
  const [productsList, setProductsList] = useState([]);  // new products+subs to be created in batch
  const [currentProduct, setCurrentProduct] = useState({ name: "", subProducts: [] });
  const [currentSubProduct, setCurrentSubProduct] = useState({ name: "", description: "" });

  // Existing product sub-product modal (for Step 2)
  const [showSubModal, setShowSubModal] = useState(false);
  const [activeProductForSub, setActiveProductForSub] = useState(null);
  const [modalSubProducts, setModalSubProducts] = useState([]);
  const [modalSubLoading, setModalSubLoading] = useState(false);
  const [modalSubName, setModalSubName] = useState("");
  const [modalSubDesc, setModalSubDesc] = useState("");
  const [modalSubSubmitting, setModalSubSubmitting] = useState(false);

  // VIEW mode (existing data browsing)
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [brandProducts, setBrandProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productSubProducts, setProductSubProducts] = useState([]);

  // Pagination (only for VIEW mode brand list)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Tab state for Step 2
  const [activeTab, setActiveTab] = useState("newProduct");

  // ======= Master Fetch =======
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // brands
      const brandRes = await fetch(`${API_BASE}/list_brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const brandData = await brandRes.json();
      if (isOk(brandData.status) && isOk(brandData.success)) {
        setBrands(brandData.data || []);
      }

      // products
      const productRes = await fetch(`${API_BASE}/list_mst_product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const productData = await productRes.json();
      if (isOk(productData.status) && isOk(productData.success)) {
        setProducts(productData.data || []);
      }

      // sub-products
      const subRes = await fetch(`${API_BASE}/list_mst_sub_product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const subData = await subRes.json();
      if (isOk(subData.status) && isOk(subData.success)) {
        setSubProducts(subData.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load master data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ======= ADD MODE helpers =======

  const filteredBrandsAdd = useMemo(() => {
    if (!brandSearchAdd.trim()) return brands;
    const s = brandSearchAdd.toLowerCase();
    return brands.filter((b) =>
      (b.brand_name || "").toLowerCase().includes(s)
    );
  }, [brands, brandSearchAdd]);

  const productsForSelectedBrandAdd = useMemo(() => {
    if (!selectedBrandIdForAdd) return [];
    return products.filter(
      (p) => String(p.brand_id) === String(selectedBrandIdForAdd)
    );
  }, [products, selectedBrandIdForAdd]);

  const goToStep = (step) => {
    if (step === "products") {
      if (!selectedBrandIdForAdd && !brandName.trim()) {
        toast.error("Select an existing brand or enter a new brand name");
        return;
      }
    }
    if (step === "review") {
      if (!selectedBrandIdForAdd && !brandName.trim()) {
        toast.error("Select/enter brand first");
        return;
      }
      if (productsList.length === 0) {
        toast.error("Add at least one product in Step 2");
        return;
      }
      const noSub = productsList.find(
        (p) => !p.subProducts || p.subProducts.length === 0
      );
      if (noSub) {
        toast.error(`Add at least one sub-product for "${noSub.name}"`);
        return;
      }
    }
    setAddStep(step);
  };

  const addSubProductToCurrent = () => {
    if (!currentSubProduct.name.trim()) {
      toast.error("Enter sub-product name");
      return;
    }
    setCurrentProduct((prev) => ({
      ...prev,
      subProducts: [
        ...(prev.subProducts || []),
        { ...currentSubProduct, id: Date.now() },
      ],
    }));
    setCurrentSubProduct({ name: "", description: "" });
  };

  const removeSubProductFromCurrent = (id) => {
    setCurrentProduct((prev) => ({
      ...prev,
      subProducts: prev.subProducts.filter((sp) => sp.id !== id),
    }));
  };

  const addProductToBatch = () => {
    if (!currentProduct.name.trim()) {
      toast.error("Enter product name");
      return;
    }
    setProductsList((prev) => [
      ...prev,
      { ...currentProduct, id: Date.now() },
    ]);
    setCurrentProduct({ name: "", subProducts: [] });
    setCurrentSubProduct({ name: "", description: "" });
  };

  const removeProductFromBatch = (id) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmitAll = async () => {
    if (!selectedBrandIdForAdd && !brandName.trim()) {
      toast.error("Select/enter brand first");
      return;
    }
    if (productsList.length === 0) {
      toast.error("Nothing to save – add some products");
      return;
    }

    try {
      let brandIdToUse = selectedBrandIdForAdd || null;

      // If user gave a new brand name and did NOT pick existing, create brand
      if (!brandIdToUse && brandName.trim()) {
        const res = await axios.post(`${API_BASE}/add_brand`, {
          brand_name: brandName.trim(),
        });
        if (!isOk(res.data.status) || !isOk(res.data.success)) {
          toast.error(res.data.message || "Failed to add brand");
          return;
        }
        brandIdToUse =
          res.data.data?.brand_id || res.data.brand_id;
      }

      if (!brandIdToUse) {
        toast.error("Brand ID missing");
        return;
      }

      // Create all products & their sub-products
      for (const p of productsList) {
        const prodRes = await axios.post(`${API_BASE}/add_mst_product`, {
          brand_id: Number(brandIdToUse),
          product_name: p.name,
          status: "true",
        });

        if (!isOk(prodRes.data.status) || !isOk(prodRes.data.success)) {
          toast.error(`Failed to add product: ${p.name}`);
          continue;
        }

        const prodId =
          prodRes.data.data?.prod_id || prodRes.data.prod_id;

        for (const sp of p.subProducts) {
          await axios.post(`${API_BASE}/add_mst_sub_product`, {
            prod_id: Number(prodId),
            sub_prod_name: sp.name,
            description: sp.description,
          });
        }
      }

      toast.success("Saved successfully");
      // reset
      setBrandName("");
      setSelectedBrandIdForAdd("");
      setProductsList([]);
      setCurrentProduct({ name: "", subProducts: [] });
      setCurrentSubProduct({ name: "", description: "" });
      setAddStep("brand");
      fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  };

  // ====== Existing sub-products modal (Step 2) ======
  const openSubModal = async (product) => {
    setActiveProductForSub(product);
    setShowSubModal(true);
    await loadSubProductsForModal(product.prod_id);
  };

  const closeSubModal = () => {
    setShowSubModal(false);
    setActiveProductForSub(null);
    setModalSubProducts([]);
    setModalSubName("");
    setModalSubDesc("");
  };

  const loadSubProductsForModal = async (prod_id) => {
    setModalSubLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/list_mst_sub_product`,
        { prod_id },
        { headers: { "Content-Type": "application/json" } }
      );
      if (isOk(res.data.status) && isOk(res.data.success)) {
        setModalSubProducts(res.data.data || []);
      } else {
        toast.error(res.data.message || "Failed to fetch sub-products");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading sub-products");
    } finally {
      setModalSubLoading(false);
    }
  };

  const handleAddSubInModal = async (e) => {
    e.preventDefault();
    if (!activeProductForSub) return;
    if (!modalSubName.trim()) {
      toast.error("Enter sub-product name");
      return;
    }
    setModalSubSubmitting(true);
    try {
      const res = await axios.post(
        `${API_BASE}/add_mst_sub_product`,
        {
          prod_id: Number(activeProductForSub.prod_id),
          sub_prod_name: modalSubName.trim(),
          description: modalSubDesc.trim(),
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (isOk(res.data.status) && isOk(res.data.success)) {
        toast.success("Sub-product added");
        setModalSubName("");
        setModalSubDesc("");
        loadSubProductsForModal(activeProductForSub.prod_id);
        fetchAllData();
      } else {
        toast.error(res.data.message || "Failed to add sub-product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding sub-product");
    } finally {
      setModalSubSubmitting(false);
    }
  };

  const handleDeleteSubInModal = async (id) => {
    if (!window.confirm("Delete this sub-product?")) return;
    try {
      const res = await axios.post(
        `${API_BASE}/delete_mst_sub_product`,
        { id },
        { headers: { "Content-Type": "application/json" } }
      );
      if (isOk(res.data.status) && isOk(res.data.success)) {
        toast.success("Deleted");
        setModalSubProducts((prev) =>
          prev.filter((s) => String(s.id) !== String(id))
        );
        fetchAllData();
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting sub-product");
    }
  };

  // ====== VIEW MODE helpers ======
  const fetchBrandProducts = (brandId) => {
    if (!brandId) {
      setBrandProducts([]);
      return;
    }
    setBrandProducts(
      products.filter((p) => String(p.brand_id) === String(brandId))
    );
  };

  const fetchProductSubProducts = (prodId) => {
    if (!prodId) {
      setProductSubProducts([]);
      return;
    }
    setProductSubProducts(
      subProducts.filter((sp) => String(sp.prod_id) === String(prodId))
    );
  };

  useEffect(() => {
    if (viewMode === "view") fetchBrandProducts(selectedBrandId);
  }, [viewMode, selectedBrandId, products]);

  useEffect(() => {
    if (viewMode === "view") fetchProductSubProducts(selectedProductId);
  }, [viewMode, selectedProductId, subProducts]);

  const deleteBrand = async (brandId) => {
    if (!window.confirm("Delete this brand and all its data?")) return;
    try {
      const res = await axios.post(`${API_BASE}/delete_brand`, {
        brand_id: brandId,
      });
      if (isOk(res.data.status) && isOk(res.data.success)) {
        toast.success("Brand deleted");
        fetchAllData();
        setSelectedBrandId("");
        setBrandProducts([]);
        setSelectedProductId("");
        setProductSubProducts([]);
      } else {
        toast.error(res.data.message || "Failed to delete brand");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting brand");
    }
  };

  const deleteProduct = async (prodId) => {
    if (!window.confirm("Delete this product and all its sub-products?")) return;
    try {
      const res = await axios.post(`${API_BASE}/delete_mst_product`, {
        prod_id: prodId,
      });
      if (isOk(res.data.status) && isOk(res.data.success)) {
        toast.success("Product deleted");
        fetchAllData();
        if (String(selectedProductId) === String(prodId)) {
          setSelectedProductId("");
          setProductSubProducts([]);
        }
        fetchBrandProducts(selectedBrandId);
      } else {
        toast.error(res.data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting product");
    }
  };

  const deleteSubProduct = async (id) => {
    if (!window.confirm("Delete this sub-product?")) return;
    try {
      const res = await axios.post(`${API_BASE}/delete_mst_sub_product`, {
        id,
      });
      if (isOk(res.data.status) && isOk(res.data.success)) {
        toast.success("Sub-product deleted");
        fetchAllData();
        fetchProductSubProducts(selectedProductId);
      } else {
        toast.error(res.data.message || "Failed to delete sub-product");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting sub-product");
    }
  };

  // VIEW pagination
  const totalPages = Math.ceil(brands.length / itemsPerPage) || 1;
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentBrands = brands.slice(indexFirst, indexLast);
  const paginate = (page) => setCurrentPage(page);

  // Step indicator
  const StepIndicator = () => {
    const steps = [
      { id: "brand", label: "1. Brand" },
      { id: "products", label: "2. Products & Sub-Products" },
      { id: "review", label: "3. Review & Save" },
    ];
    return (
      <div className="d-flex flex-wrap gap-2 mb-4">
        {steps.map((s) => (
          <div
            key={s.id}
            className={`px-3 py-2 rounded-pill border ${
              addStep === s.id ? "bg-primary text-white" : "bg-light"
            }`}
            style={{ fontSize: "0.85rem", cursor: "pointer" }}
            onClick={() => goToStep(s.id)}
          >
            {s.label}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
              <Row className="align-items-center">
                <Col>
                  <Card.Title style={{ marginTop: "2rem", fontWeight: "700" }}>
                    Brand / Product / Sub-Product Master
                  </Card.Title>
                  <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                    Add new brands / products / sub-products or attach to existing ones on a single page.
                  </div>
                </Col>
                <Col className="d-flex justify-content-end gap-2">
                  <Button
                    variant={viewMode === "add" ? "primary" : "outline-primary"}
                    onClick={() => {
                      setViewMode("add");
                      setAddStep("brand");
                    }}
                  >
                    <FaPlus className="me-1" /> Add / Allocate
                  </Button>
                  <Button
                    variant={viewMode === "view" ? "primary" : "outline-primary"}
                    onClick={() => setViewMode("view")}
                  >
                    <FaEye className="me-1" /> View Existing
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              {viewMode === "add" ? (
                <>
                  <StepIndicator />

                  {/* STEP 1: BRAND – list + add */}
                  {addStep === "brand" && (
                    <Card className="mb-4">
                      <Card.Header>Step 1: Brand Details</Card.Header>
                      <Card.Body>
                        {/* LIST (list_brand) */}
                        <h6>Existing Brands</h6>
                        <Row className="mb-2">
                          <Col md={4}>
                            <Form.Control
                              placeholder="Search brand..."
                              value={brandSearchAdd}
                              onChange={(e) =>
                                setBrandSearchAdd(e.target.value)
                              }
                            />
                          </Col>
                        </Row>
                        <div
                          className="table-responsive mb-3"
                          style={{ maxHeight: 250, overflowY: "auto" }}
                        >
                          <Table striped hover size="sm">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Brand</th>
                                <th>Products</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBrandsAdd.length > 0 ? (
                                filteredBrandsAdd.map((b, idx) => (
                                  <tr
                                    key={b.brand_id}
                                    style={{
                                      cursor: "pointer",
                                      backgroundColor:
                                        String(selectedBrandIdForAdd) ===
                                        String(b.brand_id)
                                          ? "#e7f1ff"
                                          : "transparent",
                                    }}
                                    onClick={() =>
                                      setSelectedBrandIdForAdd(b.brand_id)
                                    }
                                  >
                                    <td>{idx + 1}</td>
                                    <td>{b.brand_name}</td>
                                    <td>
                                      <Badge bg="info">
                                        {products.filter(
                                          (p) => String(p.brand_id) === String(b.brand_id)
                                        ).length}
                                      </Badge>
                                    </td>
                                    <td>
                                      <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedBrandIdForAdd(b.brand_id);
                                          goToStep("products");
                                        }}
                                      >
                                        <FaPlus className="me-1" />
                                        Add Product
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="text-center">
                                    No brands found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>

                        {/* ADD brand field */}
                        <hr />
                        <Form.Group className="mb-3">
                          <Form.Label>
                            New Brand Name{" "}
                            <span className="text-muted">(optional)</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter brand name"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                          />
                          <Form.Text muted>
                            Example: LG, Samsung, Bosch, etc.  
                            (If you selected a brand above, this can be left empty.)
                          </Form.Text>
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                          <Button variant="primary" onClick={() => goToStep("products")}>
                            Next: Products
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {/* STEP 2: PRODUCTS & SUB-PRODUCTS – list + add */}
                  {addStep === "products" && (
                    <>
                      <Card className="mb-4">
                        <Card.Header>
                          <div className="d-flex justify-content-between align-items-center">
                            <span>Step 2: Products & Sub-Products</span>
                            <Badge bg="secondary">
                              {selectedBrandIdForAdd
                                ? (brands.find(
                                    (b) =>
                                      String(b.brand_id) ===
                                      String(selectedBrandIdForAdd)
                                  ) || {}
                                  ).brand_name || "Selected Brand"
                                : brandName || "New Brand"}
                            </Badge>
                          </div>
                        </Card.Header>
                        <Card.Body>
                          <div className="d-flex justify-content-between mb-3">
                            <div>
                              <strong>Working with brand: </strong>
                              <Badge bg="secondary">
                                {selectedBrandIdForAdd
                                  ? (brands.find(
                                      (b) =>
                                        String(b.brand_id) ===
                                        String(selectedBrandIdForAdd)
                                    ) || {}
                                    ).brand_name || "Selected Brand"
                                  : brandName || "New Brand"}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => setAddStep("brand")}
                            >
                              Back to Brand
                            </Button>
                          </div>

                          {/* Tabs for adding products vs managing existing ones */}
                          <Tabs
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k)}
                            className="mb-3"
                          >
                            <Tab eventKey="newProduct" title="Add New Product">
                              {/* FORM for adding new product */}
                              <h6>Add New Product</h6>
                              <Form.Group className="mb-3">
                                <Form.Label>Product Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Enter product name"
                                  value={currentProduct.name}
                                  onChange={(e) =>
                                    setCurrentProduct({
                                      ...currentProduct,
                                      name: e.target.value,
                                    })
                                  }
                                />
                              </Form.Group>

                              <h6>Sub-Products for this Product</h6>
                              {currentProduct.subProducts.length > 0 ? (
                                <div className="mb-2">
                                  {currentProduct.subProducts.map((sp) => (
                                    <div
                                      key={sp.id}
                                      className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                                    >
                                      <div>
                                        <strong>{sp.name}</strong>
                                        {sp.description && (
                                          <div className="text-muted">
                                            {sp.description}
                                          </div>
                                        )}
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() =>
                                          removeSubProductFromCurrent(sp.id)
                                        }
                                      >
                                        <FaTrash />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted">
                                  No sub-products added yet for this product.
                                </p>
                              )}

                              <Row className="g-2 mb-3">
                                <Col md={4}>
                                  <Form.Control
                                    placeholder="Sub-product name"
                                    value={currentSubProduct.name}
                                    onChange={(e) =>
                                      setCurrentSubProduct({
                                        ...currentSubProduct,
                                        name: e.target.value,
                                      })
                                    }
                                  />
                                </Col>
                                <Col md={6}>
                                  <Form.Control
                                    placeholder="Description"
                                    value={currentSubProduct.description}
                                    onChange={(e) =>
                                      setCurrentSubProduct({
                                        ...currentSubProduct,
                                        description: e.target.value,
                                      })
                                    }
                                  />
                                </Col>
                                <Col md={2}>
                                  <Button
                                    className="w-100"
                                    variant="outline-dark"
                                    onClick={addSubProductToCurrent}
                                  >
                                    <FaPlus /> Sub
                                  </Button>
                                </Col>
                              </Row>

                              <div className="d-flex justify-content-between">
                                <Button
                                  variant="outline-primary"
                                  onClick={addProductToBatch}
                                >
                                  <FaPlus className="me-1" />
                                  Add Product to Batch
                                </Button>
                                <Button
                                  variant="primary"
                                  onClick={() => goToStep("review")}
                                >
                                  Next: Review & Save
                                </Button>
                              </div>
                            </Tab>

                            <Tab eventKey="existingProducts" title="Manage Existing Products">
                              {/* LIST of existing products for selected brand (list_mst_product) */}
                              <h6>Existing Products for this Brand</h6>
                              {selectedBrandIdForAdd ? (
                                productsForSelectedBrandAdd.length > 0 ? (
                                  <div
                                    className="table-responsive mb-3"
                                    style={{ maxHeight: 400, overflowY: "auto" }}
                                  >
                                    <Table striped hover size="sm">
                                      <thead>
                                        <tr>
                                          <th>#</th>
                                          <th>Product</th>
                                          <th>Sub-Products</th>
                                          <th>Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {productsForSelectedBrandAdd.map((p, i) => (
                                          <tr key={p.prod_id}>
                                            <td>{i + 1}</td>
                                            <td>{p.product_name}</td>
                                            <td>
                                              <Badge bg="info">
                                                {subProducts.filter(
                                                  (sp) => String(sp.prod_id) === String(p.prod_id)
                                                ).length}
                                              </Badge>
                                            </td>
                                            <td>
                                              <Button
                                                size="sm"
                                                variant="outline-primary"
                                                className="me-1"
                                                onClick={() => openSubModal(p)}
                                              >
                                                <FaEye className="me-1" />
                                                View Subs
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => deleteProduct(p.prod_id)}
                                              >
                                                <FaTrash />
                                              </Button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </Table>
                                  </div>
                                ) : (
                                  <p className="text-muted mb-3">
                                    No products found for this brand yet.
                                  </p>
                                )
                              ) : (
                                <p className="text-muted mb-3">
                                  Products list is available when you select an existing brand in Step 1.
                                </p>
                              )}
                            </Tab>
                          </Tabs>

                          <hr />

                          {/* BATCH: products to create in this save */}
                          <h6>Products to be Created in this Batch</h6>
                          {productsList.length > 0 ? (
                            productsList.map((p) => (
                              <Card key={p.id} className="mb-2">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                  <span>
                                    <strong>{p.name}</strong>{" "}
                                    <Badge bg="info" pill>
                                      {p.subProducts.length} sub
                                    </Badge>
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => removeProductFromBatch(p.id)}
                                  >
                                    <FaTrash className="me-1" />
                                    Remove
                                  </Button>
                                </Card.Header>
                                <Card.Body className="py-2">
                                  {p.subProducts.length > 0 ? (
                                    <Table striped size="sm" className="mb-0">
                                      <thead>
                                        <tr>
                                          <th>Sub-product</th>
                                          <th>Description</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {p.subProducts.map((sp) => (
                                          <tr key={sp.id}>
                                            <td>{sp.name}</td>
                                            <td>{sp.description || "-"}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </Table>
                                  ) : (
                                    <span className="text-muted">
                                      No sub-products yet
                                    </span>
                                  )}
                                </Card.Body>
                              </Card>
                            ))
                          ) : (
                            <p className="text-muted">
                              No products added to this batch yet.
                            </p>
                          )}
                        </Card.Body>
                      </Card>

                      {/* Modal: manage sub-products for an EXISTING product (list_mst_sub_product etc.) */}
                      <Modal show={showSubModal} onHide={closeSubModal} size="lg">
                        <Modal.Header closeButton>
                          <Modal.Title>
                            Sub-products for{" "}
                            <strong>
                              {activeProductForSub
                                ? activeProductForSub.product_name
                                : ""}
                            </strong>{" "}
                            (ID:{" "}
                            {activeProductForSub
                              ? activeProductForSub.prod_id
                              : ""}
                            )
                          </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <Form
                            onSubmit={handleAddSubInModal}
                            className="d-flex flex-wrap gap-2 mb-3"
                          >
                            <Form.Control
                              placeholder="Sub-product name"
                              value={modalSubName}
                              onChange={(e) =>
                                setModalSubName(e.target.value)
                              }
                            />
                            <Form.Control
                              placeholder="Description (optional)"
                              value={modalSubDesc}
                              onChange={(e) =>
                                setModalSubDesc(e.target.value)
                              }
                            />
                            <Button type="submit" disabled={modalSubSubmitting}>
                              {modalSubSubmitting ? (
                                <Spinner size="sm" />
                              ) : (
                                <>
                                  <FaPlus className="me-1" /> Add
                                </>
                              )}
                            </Button>
                          </Form>

                          {modalSubLoading ? (
                            <p>Loading sub-products...</p>
                          ) : modalSubProducts.length === 0 ? (
                            <p className="text-muted">
                              No sub-products found for this product.
                            </p>
                          ) : (
                            <Table striped hover>
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Sub-product</th>
                                  <th>Description</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {modalSubProducts.map((s, idx) => (
                                  <tr key={s.id || idx}>
                                    <td>{idx + 1}</td>
                                    <td>{s.sub_prod_name}</td>
                                    <td>{s.description || "-"}</td>
                                    <td>
                                      <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() =>
                                          handleDeleteSubInModal(s.id)
                                        }
                                      >
                                        <FaTrash />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          )}
                        </Modal.Body>
                        <Modal.Footer>
                          <Button variant="secondary" onClick={closeSubModal}>
                            Close
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    </>
                  )}

                  {/* STEP 3: REVIEW */}
                  {addStep === "review" && (
                    <Card>
                      <Card.Header>Step 3: Review & Save</Card.Header>
                      <Card.Body>
                        <Alert variant="light">
                          Review brand and products that will be created now.
                        </Alert>
                        <h5 className="mb-3">
                          Brand:&nbsp;
                          <Badge bg="primary">
                            {selectedBrandIdForAdd
                              ? (brands.find(
                                  (b) =>
                                    String(b.brand_id) ===
                                    String(selectedBrandIdForAdd)
                                ) || {}
                                ).brand_name || "Selected Brand"
                              : brandName}
                          </Badge>
                        </h5>

                        {productsList.length > 0 ? (
                          productsList.map((p) => (
                            <Card key={p.id} className="mb-3">
                              <Card.Header className="d-flex justify-content-between align-items-center">
                                <span>
                                  <strong>{p.name}</strong>{" "}
                                  <Badge bg="info" pill>
                                    {p.subProducts.length} sub
                                  </Badge>
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() =>
                                    removeProductFromBatch(p.id)
                                  }
                                >
                                  <FaTrash className="me-1" /> Remove
                                </Button>
                              </Card.Header>
                              <Card.Body>
                                <Table striped bordered size="sm">
                                  <thead>
                                    <tr>
                                      <th>Sub-product</th>
                                      <th>Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {p.subProducts.map((sp) => (
                                      <tr key={sp.id}>
                                        <td>{sp.name}</td>
                                        <td>{sp.description || "-"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              </Card.Body>
                            </Card>
                          ))
                        ) : (
                          <Alert variant="warning">
                            No products in this batch.
                          </Alert>
                        )}

                        <div className="d-flex justify-content-between mt-3">
                          <Button
                            variant="outline-secondary"
                            onClick={() => setAddStep("products")}
                          >
                            Back to Products
                          </Button>
                          <Button variant="success" onClick={handleSubmitAll}>
                            <FaSave className="me-1" /> Save All
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </>
              ) : (
                // ================= VIEW EXISTING MODE =================
                <div>
                  <Alert variant="info">
                    View and manage existing brands, products and sub-products.
                  </Alert>

                  <Row>
                    {/* Brand list */}
                    <Col md={4}>
                      <h5>Brands</h5>
                      {loading ? (
                        <p>Loading brands...</p>
                      ) : (
                        <>
                          <Form.Select
                            className="mb-3"
                            value={selectedBrandId}
                            onChange={(e) =>
                              setSelectedBrandId(e.target.value)
                            }
                          >
                            <option value="">Select a brand</option>
                            {currentBrands.map((b) => (
                              <option key={b.brand_id} value={b.brand_id}>
                                {b.brand_name}
                              </option>
                            ))}
                          </Form.Select>

                          {selectedBrandId && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => deleteBrand(selectedBrandId)}
                            >
                              <FaTrash className="me-1" />
                              Delete Brand
                            </Button>
                          )}

                          {totalPages > 1 && (
                            <Pagination className="mt-3">
                              <Pagination.First
                                onClick={() => paginate(1)}
                                disabled={currentPage === 1}
                              />
                              <Pagination.Prev
                                onClick={() =>
                                  paginate(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                              />
                              {Array.from({ length: totalPages }, (_, i) => (
                                <Pagination.Item
                                  key={i + 1}
                                  active={currentPage === i + 1}
                                  onClick={() => paginate(i + 1)}
                                >
                                  {i + 1}
                                </Pagination.Item>
                              ))}
                              <Pagination.Next
                                onClick={() =>
                                  paginate(currentPage + 1)
                                }
                                disabled={currentPage === totalPages}
                              />
                              <Pagination.Last
                                onClick={() => paginate(totalPages)}
                                disabled={currentPage === totalPages}
                              />
                            </Pagination>
                          )}
                        </>
                      )}
                    </Col>

                    {/* Products for selected brand */}
                    <Col md={4}>
                      <h5>Products</h5>
                      {selectedBrandId ? (
                        brandProducts.length > 0 ? (
                          <>
                            <Form.Select
                              className="mb-3"
                              value={selectedProductId}
                              onChange={(e) =>
                                setSelectedProductId(e.target.value)
                              }
                            >
                              <option value="">Select a product</option>
                              {brandProducts.map((p) => (
                                <option key={p.prod_id} value={p.prod_id}>
                                  {p.product_name}
                                </option>
                              ))}
                            </Form.Select>
                            {selectedProductId && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() =>
                                  deleteProduct(selectedProductId)
                                }
                              >
                                <FaTrash className="me-1" />
                                Delete Product
                              </Button>
                            )}
                          </>
                        ) : (
                          <p className="text-muted">
                            No products for this brand
                          </p>
                        )
                      ) : (
                        <p className="text-muted">Select a brand first</p>
                      )}
                    </Col>

                    {/* Sub-products for selected product */}
                    <Col md={4}>
                      <h5>Sub-Products</h5>
                      {selectedProductId ? (
                        productSubProducts.length > 0 ? (
                          productSubProducts.map((sp) => (
                            <Card key={sp.id} className="mb-2">
                              <Card.Header className="d-flex justify-content-between align-items-center">
                                <span>{sp.sub_prod_name}</span>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => deleteSubProduct(sp.id)}
                                >
                                  <FaTrash />
                                </Button>
                              </Card.Header>
                              <Card.Body>
                                <p>{sp.description || "No description"}</p>
                              </Card.Body>
                            </Card>
                          ))
                        ) : (
                          <p className="text-muted">
                            No sub-products for this product
                          </p>
                        )
                      ) : (
                        <p className="text-muted">Select a product first</p>
                      )}
                    </Col>
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductMaster;