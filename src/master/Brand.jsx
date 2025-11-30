// src/pages/Brand.jsx

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
} from "react-bootstrap";
import { FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

// ✅ Correct API base
const API_BASE = "https://nlfs.in/erp/index.php/Api";

const Brand = () => {
  const [brandSearch, setBrandSearch] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brands, setBrands] = useState([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandSubmitting, setBrandSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ========== FETCH BRANDS ==========
  const fetchBrands = async () => {
    setBrandLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list_brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        // ✅ API returns array of { brand_id, brand_name }
        setBrands(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch brands.");
      }
    } catch (err) {
      console.error("Fetch brands error:", err);
      toast.error("Something went wrong while loading brands.");
    } finally {
      setBrandLoading(false);
    }
  };

  // ========== DELETE BRAND ==========
  const handleDeleteBrand = async (brand_id) => {
    if (!window.confirm("Are you sure you want to delete this Brand?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete_brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand_id: brand_id.toString() }), // ✅ brand_id
      });

      const data = await res.json();

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        toast.success("Brand deleted successfully");
        fetchBrands();
      } else {
        toast.error(data.message || "Failed to delete brand");
      }
    } catch (err) {
      toast.error("Error deleting brand.");
    }
  };

  // ========== ADD BRAND ==========
  const handleAddBrand = async (e) => {
    e.preventDefault();

    if (!brandName.trim()) {
      toast.error("Please enter a brand name.");
      return;
    }

    setBrandSubmitting(true);

    try {
      // ✅ Parameter must be brand_name (as per API spec)
      const payload = { brand_name: brandName.trim() };

      const res = await fetch(`${API_BASE}/add_brand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        toast.success("Brand added successfully.");
        setBrandName("");
        fetchBrands();
      } else {
        toast.error(data.message || "Failed to add brand.");
      }
    } catch (err) {
      toast.error("Something went wrong while adding the brand.");
    } finally {
      setBrandSubmitting(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // ✅ Filter using brand_name (not name)
  const filteredBrands = useMemo(() => {
    if (!brandSearch) return brands;
    const s = brandSearch.toLowerCase();
    return brands.filter((brand) =>
      (brand.brand_name || "").toLowerCase().includes(s)
    );
  }, [brandSearch, brands]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredBrands.slice(indexFirst, indexLast);

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
                    Brand Master
                  </Card.Title>
                </Col>

                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search brand..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
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
              <Form onSubmit={handleAddBrand} className="mb-3 d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Enter new brand"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />

                <Button
                  type="submit"
                  className="btn btn-primary add-customer-btn"
                  disabled={brandSubmitting}
                >
                  {brandSubmitting ? (
                    "Adding..."
                  ) : (
                    <>
                      <FaPlus size={14} className="me-1" /> Add Brand
                    </>
                  )}
                </Button>
              </Form>

              <div className="table-full-width table-responsive">
                {brandLoading ? (
                  <p className="text-center">Loading brands...</p>
                ) : (
                  <Table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Brand</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentItems.length > 0 ? (
                        currentItems.map((brand, index) => (
                          <tr key={brand.brand_id}> {/* ✅ Use brand_id as key */}
                            <td>{indexFirst + index + 1}</td>
                            <td>{brand.brand_name}</td> {/* ✅ brand_name */}
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteBrand(brand.brand_id)} // ✅ brand_id
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center">
                            No brands found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                )}
              </div>

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

export default Brand;