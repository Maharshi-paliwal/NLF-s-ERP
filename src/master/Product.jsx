// src/pages/Product.jsx
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
  Tabs,
  Tab,
  Modal,
  Spinner,
} from "react-bootstrap";
import { FaPlus, FaTrash, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE = "https://nlfs.in/erp/index.php/Api";

// Helper to tolerate string / boolean / number status values
const isOk = (val) =>
  val === true || val === "true" || val === 1 || val === "1";

const Product = () => {
  const [productSearch, setProductSearch] = useState("");
  const [productName, setProductName] = useState("");

  // Brand-related state
  const [brands, setBrands] = useState([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState("");

  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productSubmitting, setProductSubmitting] = useState(false);

  // Sub-products
  const [subProducts, setSubProducts] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [activeProductForSub, setActiveProductForSub] = useState(null);

  // Add sub-product form
  const [subProdName, setSubProdName] = useState("");
  const [subProdSubmitting, setSubProdSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [activeTab] = useState("product");

  // ========== Fetch Data ==========
  const fetchBrands = async () => {
    setBrandLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list_brand`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      console.log("list_brand response:", data);

      if (res.ok && isOk(data.status) && isOk(data.success)) {
        setBrands(data.data || []);
      } else {
        console.error("Brand fetch failed:", data);
        toast.error(data.message || "Failed to fetch brands.");
      }
    } catch (err) {
      console.error("Brand fetch error:", err);
      toast.error("Network error while loading brands. Check console.");
    } finally {
      setBrandLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list_mst_product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      console.log("list_mst_product response:", data);

      if (res.ok && isOk(data.status) && isOk(data.success)) {
        // API may or may not return brand_id inside product objects.
        // We'll keep the array and use brandMap fallback for display.
        setProducts(data.data || []);
      } else {
        console.error("Product fetch failed:", data);
        toast.error(data.message || "Failed to fetch products.");
      }
    } catch (err) {
      console.error("Product fetch error:", err);
      toast.error("Network error while loading products. Check console.");
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchProducts();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrandId, productSearch]);

  // ========== Delete Product ==========
  const deleteProduct = async (prodId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await axios.post(
        `${API_BASE}/delete_mst_product`,
        { prod_id: prodId },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("delete_mst_product response:", res.data);

      if (isOk(res.data.status) && isOk(res.data.success)) {
        toast.success("Product deleted successfully");
        setProducts((prev) => prev.filter((p) => String(p.prod_id) !== String(prodId)));
      } else {
        console.error("Delete failed:", res.data);
        toast.error(res.data.message || "Delete failed.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Network error while deleting product. Check console.");
    }
  };

  // ========== Brand map for display (brand_id -> brand_name) ==========
  const brandMap = useMemo(() => {
    const m = {};
    brands.forEach((b) => {
      m[String(b.brand_id)] = b.brand_name;
    });
    return m;
  }, [brands]);

  // ========== FILTER LOGIC ==========
  const filteredProducts = useMemo(() => {
    let list = products;

    // Filter by brand using dropdown
    if (selectedBrandId) {
      list = list.filter((p) => String(p.brand_id) === String(selectedBrandId));
    }

    // Search by product or brand
    if (productSearch.trim()) {
      const s = productSearch.toLowerCase();
      list = list.filter((p) => {
        const pname = (p.product_name || "").toLowerCase();
        const bname = (p.brand_name || brandMap[String(p.brand_id)] || "").toLowerCase();
        return pname.includes(s) || bname.includes(s);
      });
    }

    return list;
  }, [products, selectedBrandId, productSearch, brandMap]);

  // ========== Add Product ==========
 const handleAddProduct = async (e) => {
  e.preventDefault();

  // -- debug logs --
  console.log(">>> handleAddProduct called");
  console.log("selectedBrandId (raw):", selectedBrandId, " typeof:", typeof selectedBrandId);
  console.log("productName (raw):", productName);

  if (!selectedBrandId) {
    toast.error("Please select a brand.");
    console.warn("Blocked add: no brand selected");
    return;
  }
  if (!productName.trim()) {
    toast.error("Please enter a product name.");
    return;
  }

  setProductSubmitting(true);

  try {
    // Build payload both as Number and as String to test which backend prefers
    const payloadNumber = {
      brand_id: Number(selectedBrandId),
      product_name: productName.trim(),
      status: "true"
    };

    const payloadString = {
      brand_id: String(selectedBrandId),
      product_name: productName.trim(),
      status: "true"
    };

    console.log("payloadNumber:", payloadNumber);
    console.log("payloadString:", payloadString);

    // Use axios to POST (axios serializes JSON same as Insomnia)
    const res = await axios.post(`${API_BASE}/add_mst_product`, payloadNumber, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    console.log("add_mst_product response:", res.data);

    if (isOk(res.data.status) && isOk(res.data.success)) {
      toast.success("Product added successfully.");
      setProductName("");
      fetchProducts();
    } else {
      toast.error(res.data.message || "Failed to add product.");
    }
  } catch (err) {
    console.error("Add product error:", err);
    toast.error("Network error while adding product. Check console.");
  } finally {
    setProductSubmitting(false);
  }
};


  // ========== Pagination ==========
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredProducts.slice(indexFirst, indexLast);

  const paginate = (page) => setCurrentPage(page);

  // ========== SUB-PRODUCTS (view / add / delete) ==========
  const openSubProducts = async (product) => {
    // product is the product object selected
    setActiveProductForSub(product);
    setShowSubModal(true);
    await fetchSubProducts(product.prod_id);
  };

  const closeSubModal = () => {
    setShowSubModal(false);
    setActiveProductForSub(null);
    setSubProducts([]);
    setSubProdName("");
  };

  const fetchSubProducts = async (prod_id) => {
    setSubLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/list_mst_sub_product`,
        { prod_id },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("list_mst_sub_product response:", res.data);

      if (isOk(res.data.status) && isOk(res.data.success)) {
        // assuming res.data.data is array of objects with fields like id, prod_id, sub_prod_name, description
        setSubProducts(res.data.data || []);
      } else {
        console.error("Sub-products fetch failed:", res.data);
        toast.error(res.data.message || "Failed to fetch sub-products.");
      }
    } catch (err) {
      console.error("Sub-products fetch error:", err);
      toast.error("Network error while loading sub-products. Check console.");
    } finally {
      setSubLoading(false);
    }
  };

  const handleAddSubProduct = async (e) => {
    e.preventDefault();
    if (!activeProductForSub) return toast.error("No product selected.");
    if (!subProdName.trim()) return toast.error("Please enter sub-product name.");

    setSubProdSubmitting(true);
    try {
      // NOTE: I assumed an endpoint `add_mst_sub_product` with fields prod_id, sub_prod_name, description
      const payload = {
        prod_id: Number(activeProductForSub.prod_id),
        sub_prod_name: subProdName.trim(),
        description: "", // allow empty; you can add a field to the form if you want to set it
      };

      const res = await axios.post(`${API_BASE}/add_mst_sub_product`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("add_mst_sub_product response:", res.data);

      if (isOk(res.data.status) && isOk(res.data.success)) {
        toast.success("Sub-product added.");
        setSubProdName("");
        // refresh list
        fetchSubProducts(activeProductForSub.prod_id);
      } else {
        console.error("Add sub-product failed:", res.data);
        toast.error(res.data.message || "Failed to add sub-product.");
      }
    } catch (err) {
      console.error("Add sub-product error:", err);
      toast.error("Network error while adding sub-product. Check console.");
    } finally {
      setSubProdSubmitting(false);
    }
  };

  const deleteSubProduct = async (id) => {
    if (!window.confirm("Delete this sub-product?")) return;
    try {
      // NOTE: assumed endpoint name and payload; change if backend expects different
      const res = await axios.post(
        `${API_BASE}/delete_mst_sub_product`,
        { id },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("delete_mst_sub_product response:", res.data);

      if (isOk(res.data.status) && isOk(res.data.success)) {
        toast.success("Sub-product deleted");
        setSubProducts((prev) => prev.filter((s) => String(s.id) !== String(id)));
      } else {
        console.error("Delete sub-product failed:", res.data);
        toast.error(res.data.message || "Delete failed.");
      }
    } catch (err) {
      console.error("Delete sub-product error:", err);
      toast.error("Network error while deleting sub-product. Check console.");
    }
  };

  // Optional: fetch single product by id (get_mst_product_id) - useful if you want an edit form later
  const fetchProductById = async (prod_id) => {
    try {
      const res = await axios.post(
        `${API_BASE}/get_mst_product_id`,
        { prod_id },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("get_mst_product_id response:", res.data);
      if (isOk(res.data.status) && isOk(res.data.success)) {
        return res.data.data;
      } else {
        toast.error(res.data.message || "Failed to fetch product details.");
        return null;
      }
    } catch (err) {
      console.error("get_mst_product_id error:", err);
      toast.error("Network error while fetching product. Check console.");
      return null;
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Tabs id="product-tabs" activeKey={activeTab} className="mb-0 card-top-tabs">
              <Tab eventKey="product" title="Products" />
            </Tabs>

            <Card.Header
              style={{
                backgroundColor: "#fff",
                marginBottom: "2rem",
                borderBottom: "none",
              }}
            >
              <Row className="align-items-center">
                <Col>
                  <Card.Title style={{ marginTop: "2rem", fontWeight: "700" }}>
                    Product Master
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center">
                  <Form.Control
                    type="text"
                    placeholder="Search product / brand..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{ width: "20vw" }}
                  />
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              {/* Add Product Form */}
              <Form onSubmit={handleAddProduct} className="d-flex flex-wrap gap-3 mb-4">
                <Form.Select
  value={selectedBrandId}
  onChange={(e) => {
    console.log("select change ->", e.target.value, typeof e.target.value);
    setSelectedBrandId(e.target.value);
  }}
                  style={{ width: "20vw" }}
                  disabled={brandLoading}
                >
                  <option value="">{brandLoading ? "Loading brands..." : "Select Brand"}</option>
                  {brands.map((b) => (
                    <option key={b.brand_id} value={b.brand_id}>
                      {b.brand_name}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control
                  type="text"
                  placeholder="Enter new product"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  style={{ width: "20vw" }}
                />

                <Button type="submit" className="add-customer-btn" disabled={productSubmitting}>
                  {productSubmitting ? "Adding..." : <><FaPlus className="me-1" /> Add Product</>}
                </Button>
              </Form>

              {/* Table */}
              {productLoading ? (
                <p className="text-center">Loading products...</p>
              ) : (
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Brand</th>
                      <th>Product</th>
                      <th style={{ minWidth: 160 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((p, index) => {
                        // Prefer brand_name from API, fall back to map
                        const brandName = p.brand_name || brandMap[String(p.brand_id)] || "-";

                        return (
                          <tr key={p.prod_id}>
                            <td>{indexFirst + index + 1}</td>
                            <td>{brandName}</td>
                            <td>{p.product_name}</td>
                            <td>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                className="me-2"
                                onClick={() => openSubProducts(p)}
                              >
                                <FaEye className="me-1" /> Sub-products
                              </Button>

                              <span
                                onClick={() => deleteProduct(p.prod_id)}
                                className="text-light bg-danger p-2 rounded ms-2"
                                style={{ cursor: "pointer" }}
                                title="Delete product"
                              >
                                <FaTrash />
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center p-4">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-3">
                  <Pagination>
                    <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Pagination.Item key={i + 1} active={currentPage === i + 1} onClick={() => paginate(i + 1)}>
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
                  </Pagination>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sub-products Modal */}
      <Modal show={showSubModal} onHide={closeSubModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Sub-products for{" "}
            <strong>
              {activeProductForSub ? activeProductForSub.product_name : ""}
            </strong>{" "}
            (Prod ID: {activeProductForSub ? activeProductForSub.prod_id : ""})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSubProduct} className="mb-3 d-flex gap-2">
            <Form.Control
              placeholder="New sub-product name"
              value={subProdName}
              onChange={(e) => setSubProdName(e.target.value)}
            />
            <Button type="submit" disabled={subProdSubmitting}>
              {subProdSubmitting ? <Spinner size="sm" /> : <><FaPlus className="me-1" /> Add Sub</>}
            </Button>
          </Form>

          {subLoading ? (
            <p>Loading sub-products...</p>
          ) : subProducts.length === 0 ? (
            <p className="text-muted">No sub-products found for this product.</p>
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
                {subProducts.map((s, idx) => (
                  <tr key={s.id || s.sub_prod_id || idx}>
                    <td>{idx + 1}</td>
                    <td>{s.sub_prod_name || s.sub_product_name || "-"}</td>
                    <td style={{ maxWidth: "45vw", whiteSpace: "pre-wrap" }}>
                      {s.description || s.desc || "-"}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteSubProduct(s.id || s.sub_prod_id)}
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
    </Container>
  );
};

export default Product;
