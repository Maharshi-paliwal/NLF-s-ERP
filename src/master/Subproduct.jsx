// src/master/SubProduct.jsx
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
} from "react-bootstrap";
import { FaPlus, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE = "https://nlfs.in/erp/index.php/Api";

export default function SubProduct() {
  const [subProductSearch, setSubProductSearch] = useState("");
  const [subProductName, setSubProductName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProdId, setSelectedProdId] = useState("");

  const [subProducts, setSubProducts] = useState([]);
  const [products, setProducts] = useState([]);

  const [subProductLoading, setSubProductLoading] = useState(false);
  const [subProductSubmitting, setSubProductSubmitting] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  // Pagination for Sub-Products tab
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination for Descriptions tab
  const [descCurrentPage, setDescCurrentPage] = useState(1);
  const descItemsPerPage = 10;

  // Tabs
  const [activeTab, setActiveTab] = useState("subproduct");

  // Fetch Master Products
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list_mst_product`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.status === "true" && data.success === "1") {
        setProducts(data.data);
      } else {
        toast.error("Failed to load products.");
      }
    } catch (err) {
      toast.error("Error fetching products.");
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch Sub-Products
  const fetchSubProducts = async () => {
    setSubProductLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list_mst_sub_product`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.status === "true" && data.success === "1") {
        setSubProducts(data.data);
      } else {
        toast.error("Failed to fetch sub-products.");
      }
    } catch (err) {
      toast.error("Error fetching sub-products.");
    } finally {
      setSubProductLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSubProducts();
  }, []);

  // Reset pagination when filters or tab change
  useEffect(() => {
    setCurrentPage(1);
    setDescCurrentPage(1);
  }, [selectedProdId, subProductSearch, activeTab]);

  // Delete Sub-Product
  const deleteSubProduct = async (id) => {
    try {
      const res = await axios.post(
        `${API_BASE}/delete_mst_sub_product`,
        { id },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.status === "true") {
        toast.success("Deleted successfully!");
        setSubProducts((prev) => prev.filter((sp) => sp.id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  // Add Sub Product
  const handleAddSubProduct = async (e) => {
    e.preventDefault();

    if (!selectedProdId) return toast.error("Please select a product.");
    if (!subProductName.trim())
      return toast.error("Please enter a sub-product name.");
    if (!description.trim())
      return toast.error("Please enter a description.");

    setSubProductSubmitting(true);

    try {
      const payload = {
        prod_id: Number(selectedProdId),
        sub_prod_name: subProductName.trim(),
        description: description.trim(),
      };

      const res = await fetch(`${API_BASE}/add_mst_sub_product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "true" && data.success === "1") {
        toast.success("Sub-product added!");
        setSubProductName("");
        setDescription("");
        fetchSubProducts();
      } else {
        toast.error(data.message || "Failed to add.");
      }
    } catch (err) {
      toast.error("Error adding sub-product.");
    } finally {
      setSubProductSubmitting(false);
    }
  };

  // General filtered list (for Sub-Products tab)
  const filteredSubProducts = useMemo(() => {
    let list = subProducts;

    if (selectedProdId) {
      list = list.filter((sp) => String(sp.prod_id) === String(selectedProdId));
    }

    if (subProductSearch.trim()) {
      const s = subProductSearch.toLowerCase();
      list = list.filter((sp) =>
        (sp.sub_prod_name || "").toLowerCase().includes(s)
      );
    }

    return list;
  }, [subProducts, selectedProdId, subProductSearch]);

  // Filtered list with non-empty descriptions (for Descriptions tab)
  const descriptionFiltered = useMemo(() => {
    let list = subProducts;

    if (selectedProdId) {
      list = list.filter((sp) => String(sp.prod_id) === String(selectedProdId));
    }

    if (subProductSearch.trim()) {
      const s = subProductSearch.toLowerCase();
      list = list.filter((sp) =>
        (sp.sub_prod_name || "").toLowerCase().includes(s)
      );
    }

    // Only keep items with non-empty description
    return list.filter((sp) => sp.description && sp.description.trim() !== "");
  }, [subProducts, selectedProdId, subProductSearch]);

  // Pagination for Sub-Products tab
  const totalPages = Math.ceil(filteredSubProducts.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredSubProducts.slice(indexFirst, indexLast);

  // Pagination for Descriptions tab
  const descTotalPages = Math.ceil(descriptionFiltered.length / descItemsPerPage);
  const descIndexLast = descCurrentPage * descItemsPerPage;
  const descIndexFirst = descIndexLast - descItemsPerPage;
  const currentDescItems = descriptionFiltered.slice(descIndexFirst, descIndexLast);

  // Pagination handlers
  const paginate = (page) => setCurrentPage(page);
  const paginateDesc = (page) => setDescCurrentPage(page);

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Tabs
              id="subproduct-tabs"
              activeKey={activeTab}
              onSelect={(k) => {
                setActiveTab(k);
                setCurrentPage(1);
                setDescCurrentPage(1);
              }}
              className="mb-0 card-top-tabs"
            >
              <Tab eventKey="subproduct" title="Sub-Products" />
              <Tab eventKey="description" title="Descriptions" />
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
                    {activeTab === "subproduct"
                      ? "Sub-Product Master"
                      : "Sub-Product Descriptions"}
                  </Card.Title>
                </Col>

                <Col className="d-flex justify-content-end align-items-center">
                  <Form.Control
                    type="text"
                    placeholder="Search sub-product..."
                    value={subProductSearch}
                    onChange={(e) => {
                      setSubProductSearch(e.target.value);
                      // Pagination reset handled in useEffect
                    }}
                    style={{ width: "20vw" }}
                  />
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              {/* Add Form (common for both tabs) */}
              <Form
                onSubmit={handleAddSubProduct}
                className="d-flex flex-wrap gap-3 mb-4"
              >
                <Form.Select
                  value={selectedProdId}
                  onChange={(e) => {
                    setSelectedProdId(e.target.value);
                  }}
                  style={{ width: "20vw" }}
                  disabled={productsLoading}
                >
                  <option value="">
                    {productsLoading ? "Loading products..." : "Select Product"}
                  </option>
                  {products.map((p) => (
                    <option key={p.prod_id} value={p.prod_id}>
                      {p.product_name}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control
                  type="text"
                  placeholder="Enter sub-product"
                  value={subProductName}
                  onChange={(e) => setSubProductName(e.target.value)}
                  style={{ width: "20vw" }}
                />

                <Form.Control
                  type="text"
                  placeholder="Enter Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "20vw" }}
                />

                <Button
                  type="submit"
                  className="add-customer-btn"
                  disabled={subProductSubmitting}
                >
                  {subProductSubmitting ? "Adding..." : (
                    <>
                      <FaPlus /> Add
                    </>
                  )}
                </Button>
              </Form>

              {subProductLoading ? (
                <p>Loading...</p>
              ) : (
                <>
                  {/* TAB: Sub-Products */}
                  {activeTab === "subproduct" && (
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Sr. no</th>
                          <th>Sub-Product</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length > 0 ? (
                          currentItems.map((sp, i) => (
                            <tr key={sp.id}>
                              <td>{indexFirst + i + 1}</td>
                              <td>{sp.sub_prod_name}</td>
                              <td>
                                <span
                                  onClick={() => deleteSubProduct(sp.id)}
                                  className="text-light bg-danger p-2 rounded ms-2"
                                  style={{ cursor: "pointer" }}
                                >
                                  <FaTrash />
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center p-4">
                              No sub-products found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  )}

                  {/* TAB: Descriptions */}
                  {activeTab === "description" && (
                    <Table striped hover>
                      <thead>
                        <tr>
                          <th>Sr. no</th>
                          <th>Sub-Product</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentDescItems.length > 0 ? (
                          currentDescItems.map((sp, i) => (
                            <tr key={sp.id}>
                              <td>{descIndexFirst + i + 1}</td>
                              <td>{sp.sub_prod_name}</td>
                              <td>{sp.description}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center p-4">
                              No descriptions found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  )}

                  {/* Pagination for Sub-Products Tab */}
                  {activeTab === "subproduct" && totalPages > 1 && (
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

                  {/* Pagination for Descriptions Tab */}
                  {activeTab === "description" && descTotalPages > 1 && (
                    <div className="d-flex justify-content-center p-3">
                      <Pagination>
                        <Pagination.First
                          onClick={() => paginateDesc(1)}
                          disabled={descCurrentPage === 1}
                        />
                        <Pagination.Prev
                          onClick={() => paginateDesc(descCurrentPage - 1)}
                          disabled={descCurrentPage === 1}
                        />
                        {Array.from({ length: descTotalPages }, (_, i) => (
                          <Pagination.Item
                            key={i + 1}
                            active={descCurrentPage === i + 1}
                            onClick={() => paginateDesc(i + 1)}
                          >
                            {i + 1}
                          </Pagination.Item>
                        ))}
                        <Pagination.Next
                          onClick={() => paginateDesc(descCurrentPage + 1)}
                          disabled={descCurrentPage === descTotalPages}
                        />
                        <Pagination.Last
                          onClick={() => paginateDesc(descTotalPages)}
                          disabled={descCurrentPage === descTotalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}