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

export default function Rate() {
  const [brandLoading, setBrandLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [subProdLoading, setSubProdLoading] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [addingRate, setAddingRate] = useState(false);

  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [subProducts, setSubProducts] = useState([]);
  const [rates, setRates] = useState([]);

  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedProdId, setSelectedProdId] = useState("");
  const [selectedSubProdId, setSelectedSubProdId] = useState("");
  const [rateValue, setRateValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // tabs + pagination
  const [activeTab, setActiveTab] = useState("rate");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch Brands
  const fetchBrands = async () => {
    setBrandLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list_brand`, {
        method: "POST",
      });
      const data = await res.json();

      if (
        (data.status === "true" || data.status === true) &&
        (data.success === "1" || data.success === 1)
      ) {
        setBrands(data.data || []);
      } else {
        toast.error(data.message || "Failed to load brands.");
      }
    } catch (err) {
      toast.error("Error fetching brands.");
    } finally {
      setBrandLoading(false);
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list_mst_product`, {
        method: "POST",
      });
      const data = await res.json();

      if (
        (data.status === "true" || data.status === true) &&
        (data.success === "1" || data.success === 1)
      ) {
        setProducts(data.data || []);
      } else {
        toast.error(data.message || "Failed to load products.");
      }
    } catch (err) {
      toast.error("Error fetching products.");
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch Sub-Products
  const fetchSubProducts = async () => {
    setSubProdLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list_mst_sub_product`, {
        method: "POST",
      });
      const data = await res.json();

      if (
        (data.status === "true" || data.status === true) &&
        (data.success === "1" || data.success === 1)
      ) {
        setSubProducts(data.data || []);
      } else {
        toast.error(data.message || "Failed to load sub-products.");
      }
    } catch (err) {
      toast.error("Error fetching sub-products.");
    } finally {
      setSubProdLoading(false);
    }
  };

  // Fetch Rates
  const fetchRates = async () => {
    setRatesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/list_mst_rate`, {
        method: "POST",
      });
      const data = await res.json();

      if (
        (data.status === "true" || data.status === true) &&
        (data.success === "1" || data.success === 1)
      ) {
        setRates(data.data || []);
      } else {
        toast.error(data.message || "Failed to load rates.");
      }
    } catch (err) {
      toast.error("Error fetching rates.");
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchProducts();
    fetchSubProducts();
    fetchRates();
  }, []);

  // reset product when brand changes, reset subproduct when product changes
  useEffect(() => setSelectedProdId(""), [selectedBrandId]);
  useEffect(() => setSelectedSubProdId(""), [selectedProdId]);

  // maps for display
  const brandMap = useMemo(() => {
    const map = {};
    brands.forEach((b) => {
      map[String(b.brand_id)] = b.brand_name;
    });
    return map;
  }, [brands]);

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      map[String(p.prod_id)] = p;
    });
    return map;
  }, [products]);

  const subProductMap = useMemo(() => {
    const map = {};
    subProducts.forEach((sp) => {
      map[String(sp.id || sp.sub_prod_id)] = sp;
    });
    // note: sub-product id field in your API is id for entries in list_mst_sub_product
    return map;
  }, [subProducts]);

  // filtered products by brand
  const filteredProducts = useMemo(() => {
    if (!selectedBrandId) return products;
    return products.filter(
      (p) => String(p.brand_id) === String(selectedBrandId)
    );
  }, [products, selectedBrandId]);

  // filtered sub-products by product
  const filteredSubProducts = useMemo(() => {
    if (!selectedProdId) return subProducts;
    return subProducts.filter(
      (sp) => String(sp.prod_id) === String(selectedProdId)
    );
  }, [subProducts, selectedProdId]);

  // combined filtered rates according to filters & search
  const filteredRates = useMemo(() => {
    let list = rates;

    // filter by brand -> product -> subproduct
    if (selectedBrandId) {
      list = list.filter((r) => {
        const sp = subProductMap[String(r.sub_prod_id)];
        const prod = sp ? productMap[String(sp.prod_id)] : undefined;
        return prod && String(prod.brand_id) === String(selectedBrandId);
      });
    }

    if (selectedProdId) {
      list = list.filter((r) => {
        const sp = subProductMap[String(r.sub_prod_id)];
        return sp && String(sp.prod_id) === String(selectedProdId);
      });
    }

    if (selectedSubProdId) {
      list = list.filter(
        (r) => String(r.sub_prod_id) === String(selectedSubProdId)
      );
    }

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();

      list = list.filter((r) => {
        const sp = subProductMap[String(r.sub_prod_id)] || {};
        const prod = productMap[String(sp.prod_id)] || {};
        const brand = brandMap[prod.brand_id] || "";

        return (
          String(r.rate || "").toLowerCase().includes(s) ||
          (sp.sub_prod_name || "").toLowerCase().includes(s) ||
          (prod.product_name || "").toLowerCase().includes(s) ||
          (brand || "").toLowerCase().includes(s)
        );
      });
    }

    return list;
  }, [
    rates,
    selectedBrandId,
    selectedProdId,
    selectedSubProdId,
    searchTerm,
    subProductMap,
    productMap,
    brandMap,
  ]);

  // pagination data
  const totalPages = Math.ceil(filteredRates.length / itemsPerPage) || 1;
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredRates.slice(indexFirst, indexLast);

  const paginate = (p) => setCurrentPage(p);

  // Add Rate
  const handleAddRate = async (e) => {
    e.preventDefault();

    if (!selectedBrandId) return toast.error("Please select a brand.");
    if (!selectedProdId) return toast.error("Please select a product.");
    if (!selectedSubProdId) return toast.error("Please select a sub-product.");
    if (!rateValue || isNaN(Number(rateValue)))
      return toast.error("Please enter a valid numeric rate.");

    setAddingRate(true);

    try {
      const payload = {
        rate: String(parseFloat(Number(rateValue)).toFixed(2)),
        sub_prod_id: String(selectedSubProdId),
      };

      const res = await fetch(`${API_BASE}/add_mst_rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (
        (data.status === "true" || data.status === true) &&
        (data.success === "1" || data.success === 1)
      ) {
        toast.success("Rate added successfully");
        setRateValue("");
        fetchRates();
      } else {
        toast.error(data.message || "Failed to add rate.");
      }
    } catch (err) {
      toast.error("Error adding rate.");
    } finally {
      setAddingRate(false);
    }
  };

  // Delete rate
  const deleteRate = async (id) => {
    try {
      const res = await axios.post(
        `${API_BASE}/delete_mst_rate`,
        { id },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (
        res.data &&
        (res.data.status === "true" || res.data.success === "1")
      ) {
        toast.success("Deleted successfully");
        setRates((prev) => prev.filter((r) => String(r.id) !== String(id)));
      } else {
        toast.error(res.data.message || "Failed to delete rate.");
      }
    } catch (err) {
      toast.error("Error deleting rate.");
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Tabs
              id="rate-tabs"
              activeKey={activeTab}
              onSelect={(k) => {
                setActiveTab(k);
                setCurrentPage(1);
              }}
              className="mb-0 card-top-tabs"
            >
              <Tab eventKey="rate" title="Rates" />
              <Tab eventKey="all" title="All Rates" />
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
                  <Card.Title style={{ marginTop: "2rem", fontWeight: 700 }}>
                    {activeTab === "rate" ? "Rate Master" : "All Rates"}
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center">
                  <Form.Control
                    type="text"
                    placeholder="Search rate / sub-product / product / brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "20vw" }}
                  />
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              <Form
                onSubmit={handleAddRate}
                className="d-flex flex-wrap gap-3 mb-4"
              >
                {/* Brand */}
                <Form.Select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  style={{ width: "15vw" }}
                  disabled={brandLoading}
                >
                  <option value="">
                    {brandLoading ? "Loading brands..." : "Select Brand"}
                  </option>
                  {brands.map((b) => (
                    <option key={b.brand_id} value={b.brand_id}>
                      {b.brand_name}
                    </option>
                  ))}
                </Form.Select>

                {/* Product */}
                <Form.Select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  style={{ width: "20vw" }}
                  disabled={productsLoading || !selectedBrandId}
                >
                  <option value="">
                    {productsLoading
                      ? "Loading products..."
                      : !selectedBrandId
                      ? "Select Brand First"
                      : "Select Product"}
                  </option>
                  {filteredProducts.map((p) => (
                    <option key={p.prod_id} value={p.prod_id}>
                      {p.product_name}
                    </option>
                  ))}
                </Form.Select>

                {/* Sub-Product */}
                <Form.Select
                  value={selectedSubProdId}
                  onChange={(e) => setSelectedSubProdId(e.target.value)}
                  style={{ width: "20vw" }}
                  disabled={subProdLoading || !selectedProdId}
                >
                  <option value="">
                    {subProdLoading
                      ? "Loading sub-products..."
                      : !selectedProdId
                      ? "Select Product First"
                      : "Select Sub-Product"}
                  </option>
                  {filteredSubProducts.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.sub_prod_name}
                    </option>
                  ))}
                </Form.Select>

                {/* Rate input */}
                <Form.Control
                  type="text"
                  placeholder="Enter Rate (e.g. 120.50)"
                  value={rateValue}
                  onChange={(e) => setRateValue(e.target.value)}
                  style={{ width: "15vw" }}
                />

                {/* Add button */}
                <Button
                  type="submit"
                  className="add-customer-btn"
                  disabled={addingRate}
                >
                  {addingRate ? (
                    "Adding..."
                  ) : (
                    <>
                      <FaPlus /> Add
                    </>
                  )}
                </Button>
              </Form>

              {ratesLoading ? (
                <p>Loading...</p>
              ) : (
                <>
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Sr. no</th>
                        <th>Rate</th>
                        <th>Sub-Product</th>
                        <th>Product</th>
                        <th>Brand</th>
                        <th>Created At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length > 0 ? (
                        currentItems.map((r, i) => {
                          const sp =
                            subProductMap[String(r.sub_prod_id)] || {};
                          const prod = productMap[String(sp.prod_id)] || {};
                          const brandName =
                            brandMap[prod.brand_id] || "-";

                          return (
                            <tr key={r.id}>
                              <td>{indexFirst + i + 1}</td>
                              <td>{r.rate}</td>
                              <td>{sp.sub_prod_name || "-"}</td>
                              <td>{prod.product_name || "-"}</td>
                              <td>{brandName}</td>
                              <td>{r.created_at || "-"}</td>
                              <td>
                                <span
                                  onClick={() => deleteRate(r.id)}
                                  className="text-light bg-danger p-2 rounded ms-2"
                                  style={{ cursor: "pointer" }}
                                >
                                  <FaTrash />
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center p-4">
                            No rates found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

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
                        {Array.from(
                          { length: totalPages },
                          (_, idx) => (
                            <Pagination.Item
                              key={idx + 1}
                              active={currentPage === idx + 1}
                              onClick={() => paginate(idx + 1)}
                            >
                              {idx + 1}
                            </Pagination.Item>
                          )
                        )}
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
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
