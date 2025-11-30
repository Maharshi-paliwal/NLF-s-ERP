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
} from "react-bootstrap"; // ✅ added Pagination
import { FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://nlfs.in/erp/index.php/Api";

const Product = () => {
  const [productSearch, setProductSearch] = useState("");
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productSubmitting, setProductSubmitting] = useState(false);

  const navigate = useNavigate();

  // --------------------------
  // ✅ PAGINATION STATES
  // --------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ========== LIST MASTER PRODUCT API ==========
  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list_mst_product`, { method: "POST" });
      const data = await res.json();

      if (
        (data.status === true || data.status === "true") &&
        (data.success === "1" || data.success === 1)
      ) {
        setProducts(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch products.");
      }
    } catch (err) {
      toast.error("Something went wrong while loading products.");
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ========== DELETE PRODUCT ==========
  const deleteProduct = async (prodId) => {
    try {
      const res = await axios.post(
        `${API_BASE}/delete_mst_product`,
        { prod_id: prodId },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success === "1" || res.data.status === "true") {
        toast.success("Product deleted successfully");

        setProducts((prev) => prev.filter((p) => p.prod_id != prodId));
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  // ========== SEARCH FILTER ==========
  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    const s = productSearch.toLowerCase();
    return products.filter((p) =>
      (p.product_name || "").toLowerCase().includes(s)
    );
  }, [productSearch, products]);

  // ========== ADD PRODUCT ==========
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast.error("Please enter a product.");
      return;
    }

    setProductSubmitting(true);

    try {
      const payload = { product_name: productName.trim() };

      const res = await fetch(`${API_BASE}/add_mst_product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (
        (data.status === true || data.status === "true") &&
        (data.success === "1" || data.success === 1)
      ) {
        toast.success("Product added successfully.");
        setProductName("");
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to add product.");
      }
    } catch (err) {
      toast.error("Something went wrong while adding the product.");
    } finally {
      setProductSubmitting(false);
    }
  };

  // --------------------------
  // ✅ PAGINATION LOGIC
  // --------------------------
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredProducts.slice(indexFirst, indexLast);

  const paginate = (page) => setCurrentPage(page);

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
              <Row className="align-items-center">
                <Col>
                  <Card.Title
                    style={{
                      marginTop: "2rem",
                      fontWeight: "700",
                    }}
                  >
                    Product Master
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search product..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      style={{ width: "20vw", paddingRight: "35px" }}
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

            <Card.Body>
              {/* Add Product */}
              <Form onSubmit={handleAddProduct} className="mb-3 d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Enter new product"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />

                <Button
                  type="submit"
                  className="btn btn-primary add-customer-btn"
                  disabled={productSubmitting}
                >
                  {productSubmitting ? (
                    "Adding..."
                  ) : (
                    <>
                      <FaPlus size={14} className="me-1" /> Add Product
                    </>
                  )}
                </Button>
              </Form>

              {/* Table */}
              <div className="table-full-width table-responsive">
                {productLoading ? (
                  <p className="text-center">Loading products...</p>
                ) : (
                  <Table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Product</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentItems.map((p, index) => (
                        <tr key={p.prod_id}>
                          <td>{indexFirst + index + 1}</td>
                          <td>{p.product_name}</td>
                          <td>
                            <span
                              onClick={() => deleteProduct(p.prod_id)}
                              className="text-light bg-danger p-2 rounded ms-2"
                              style={{ cursor: "pointer" }}
                            >
                              <FaTrash />
                            </span>
                          </td>
                        </tr>
                      ))}

                      {filteredProducts.length === 0 && !productLoading && (
                        <tr>
                          <td colSpan="3" className="text-center">
                            No products found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                )}
              </div>

              {/* ------------------------ */}
              {/* ✅ PAGINATION UI (NO UI CHANGE) */}
              {/* ------------------------ */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center p-3">
                  <Pagination>
                    <Pagination.First
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => paginate(currentPage - 1)}
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
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Product;