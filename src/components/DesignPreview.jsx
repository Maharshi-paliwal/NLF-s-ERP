import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Alert,
  Form,
  Spinner,
  Tabs,
  Tab,
  Modal,
} from "react-bootstrap";
import { FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

/* ───────────────────────── APIs ───────────────────────── */
const MATERIAL_LIST_API = "https://nlfs.in/erp/index.php/Erp/material_list";
const WORK_ORDER_API = "https://nlfs.in/erp/index.php/Api/get_work_order_by_id";
const ADD_MRP_API = "https://nlfs.in/erp/index.php/Api/add_material_plan";

export default function DesignPreview() {
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("materials");

  // Materials State
  const [materials, setMaterials] = useState([]);
  const [allocatedMaterials, setAllocatedMaterials] = useState({});

  // Products State
  const [products, setProducts] = useState([]);
  const [allocatedProducts, setAllocatedProducts] = useState({});
  
  // Modal & Approval State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isApproved, setIsApproved] = useState(false); // Checkbox state

  const { workOrderId: urlWorkOrderId } = useParams();
  const [workOrderId] = useState(urlWorkOrderId || "2");

  /* ─────────────────────────
     1️⃣ FETCH MATERIAL MASTER
  ───────────────────────── */
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const res = await axios.post(
          MATERIAL_LIST_API,
          {},
          { headers: { "Content-Type": "application/json" } }
        );

        if (!res.data?.status || res.data?.success !== "1") {
          toast.error("Failed to load materials");
          setMaterials([]);
          return;
        }

        setMaterials(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Error loading materials");
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  /* ─────────────────────────
     2️⃣ FETCH WORK ORDER PRODUCTS
  ───────────────────────── */
  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        setProductsLoading(true);
        const res = await axios.post(
          WORK_ORDER_API,
          { work_id: workOrderId },
          { headers: { "Content-Type": "application/json" } }
        );

        if (res.data?.success === "1" && res.data?.data) {
          let items = res.data.data.items;

          // If items is a string, parse it
          if (typeof items === "string") {
            try {
              items = JSON.parse(items);
            } catch (e) {
              console.error("Failed to parse work order items:", e);
              items = [];
            }
          }

          setProducts(Array.isArray(items) ? items : []);
        } else {
          toast.error("Failed to load work order products");
          setProducts([]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading work order");
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchWorkOrder();
  }, [workOrderId]);

  /* ─────────────────────────
     3️⃣ BUILD MATERIAL MRP ROWS
  ───────────────────────── */
  const materialRows = useMemo(() => {
    if (!Array.isArray(materials)) return [];

    return materials.map((mat, index) => {
      const required = Number(mat.qty || 0);
      const alloc = Number(allocatedMaterials[index] || 0);
      const finalAlloc = Math.min(required, alloc);

      return {
        id: index,
        rawMaterial: mat.name || "N/A",
        unit: mat.unit || "N/A",
        required,
        available: required,
        allocated: finalAlloc,
        netRequired: required - finalAlloc,
        isLocked: finalAlloc >= required,
      };
    });
  }, [materials, allocatedMaterials]);

  /* ─────────────────────────
     4️⃣ BUILD PRODUCT MRP ROWS
  ───────────────────────── */
  const productRows = useMemo(() => {
    if (!Array.isArray(products)) return [];

    return products.map((prod, index) => {
      const required = Number(prod.quantity || 0);
      const alloc = Number(allocatedProducts[index] || 0);
      const finalAlloc = Math.min(required, alloc);

      return {
        id: index,
        brand: prod.brand || "N/A",
        itemName: prod.item_name || "N/A",
        subProduct: prod.sub_product || "N/A",
        unit: prod.unit || "N/A",
        required,
        available: required,
        allocated: finalAlloc,
        netRequired: required - finalAlloc,
        isLocked: finalAlloc >= required,
      };
    });
  }, [products, allocatedProducts]);

  const isMaterialsFullyAllocated =
    materialRows.length > 0 && materialRows.every((r) => r.isLocked);

  const isProductsFullyAllocated =
    productRows.length > 0 && productRows.every((r) => r.isLocked);

  const handleMaterialAllocationChange = (id, value) => {
    const v = value === "" ? 0 : Number(value);
    if (!isNaN(v)) {
      setAllocatedMaterials((prev) => ({ ...prev, [id]: v }));
    }
  };

  const handleProductAllocationChange = (id, value) => {
    const v = value === "" ? 0 : Number(value);
    if (!isNaN(v)) {
      setAllocatedProducts((prev) => ({ ...prev, [id]: v }));
    }
  };

  /* ─────────────────────────
     5️⃣ RELEASE MRP (API CALL)
  ───────────────────────── */
  const handleReleaseToPlanning = useCallback(async () => {
    try {
      setIsProcessing(true);

      const currentRows = activeTab === "materials" ? materialRows : productRows;

      const payload = {
        material: currentRows.map((m) => ({
          raw_material: activeTab === "materials" ? m.rawMaterial : m.itemName,
          unit: m.unit,
          required: m.required,
          available: m.available,
          allocate: m.allocated,
          net_required: m.netRequired,
        })),
      };

      const res = await axios.post(ADD_MRP_API, payload);

      if (res.data?.success === "1") {
        toast.success(`${activeTab === "materials" ? "Materials" : "Products"} MRP released to Planning`);
        setShowPreviewModal(false); // Close modal on success
      } else {
        toast.error("Failed to submit MRP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting MRP");
    } finally {
      setIsProcessing(false);
    }
  }, [materialRows, productRows, activeTab]);

  /* ───────────────────────── UI STATES ───────────────────────── */
  if (loading || productsLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">Loading data...</p>
      </Container>
    );
  }

  /* ───────────────────────── STYLES (Matching PO Preview) ───────────────────────── */
  const th = {
    border: "1px solid #000",
    padding: "6px",
    fontWeight: "bold",
    backgroundColor: "#f0f0f0"
  };
  const td = { border: "1px solid #000", padding: "6px" };
  const blueLeft = {
    border: "1px solid #000",
    padding: "6px",
    background: "#007bff",
    color: "white",
    width: "70%",
  };
  const blueRight = {
    border: "1px solid #000",
    padding: "6px",
    background: "#007bff",
    color: "white",
    textAlign: "right",
  };

  const formatINR = (num) => Number(num || 0).toLocaleString("en-IN");

  // Helper to get header image (Using default Mumbai as in PO example)
  const getHeaderImagePath = () => "/extra/Mumbai.jpeg";

  /* ───────────────────────── RENDER ───────────────────────── */
  return (
    <Container fluid className="p-4">
      <Button as={Link} to="/design" className="add-customer-btn mb-4">
        <FaArrowLeft className="me-2" />
        Back
      </Button>

      <Card className="mb-4 shadow-sm">
        <Row className="p-4">
          <Col>
            <h2>Design Team – Material & Product Planning</h2>
            <p className="text-muted mb-0">
              Sources: <strong>Material Master & Work Order</strong>
            </p>
          </Col>
        </Row>
      </Card>

      <Card className="shadow-sm">
        <Card.Header className="bg-primary fw-bold text-white">
          Material Requirement Plan
        </Card.Header>

        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            {/* ─────────── MATERIALS TAB ─────────── */}
            <Tab eventKey="materials" title="Raw Materials">
              {!materialRows.length ? (
                <Alert variant="warning">
                  <FaExclamationTriangle className="me-2" />
                  No materials found
                </Alert>
              ) : (
                <Table bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>Raw Material</th>
                      <th>Unit</th>
                      <th>Required</th>
                      <th>Available</th>
                      <th>Allocate</th>
                      <th>Net Required</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialRows.map((row, index) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td>{row.rawMaterial}</td>
                        <td>{row.unit}</td>
                        <td>{row.required}</td>
                        <td>{row.available}</td>
                        <td className="text-center">
                          <Form.Control
                            type="number"
                            min="0"
                            value={row.allocated || ""}
                            onChange={(e) =>
                              handleMaterialAllocationChange(row.id, e.target.value)
                            }
                            disabled={row.isLocked || isProcessing}
                            style={{ maxWidth: 100, margin: "auto" }}
                          />
                        </td>
                        <td
                          className={
                            row.netRequired > 0
                              ? "text-danger fw-bold"
                              : "text-success fw-bold"
                          }
                        >
                          {row.netRequired}
                        </td>
                        <td>
                          {row.isLocked ? (
                            <Badge bg="success">Allotted</Badge>
                          ) : row.allocated > 0 ? (
                            <Badge bg="warning">Partial</Badge>
                          ) : (
                            <Badge bg="secondary">Pending</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>

            {/* ─────────── PRODUCTS TAB ─────────── */}
            <Tab eventKey="products" title="Products">
              {!productRows.length ? (
                <Alert variant="warning">
                  <FaExclamationTriangle className="me-2" />
                  No products found in work order
                </Alert>
              ) : (
                <Table bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>Brand</th>
                      <th>Item Name</th>
                      <th>Sub Product</th>
                      <th>Unit</th>
                      <th>Required</th>
                      <th>Available</th>
                      <th>Allocate</th>
                      <th>Net Required</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productRows.map((row, index) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td>{row.brand}</td>
                        <td>{row.itemName}</td>
                        <td>{row.subProduct}</td>
                        <td>{row.unit}</td>
                        <td>{row.required}</td>
                        <td>{row.available}</td>
                        <td className="text-center">
                          <Form.Control
                            type="number"
                            min="0"
                            value={row.allocated || ""}
                            onChange={(e) =>
                              handleProductAllocationChange(row.id, e.target.value)
                            }
                            disabled={row.isLocked || isProcessing}
                            style={{ maxWidth: 100, margin: "auto" }}
                          />
                        </td>
                        <td
                          className={
                            row.netRequired > 0
                              ? "text-danger fw-bold"
                              : "text-success fw-bold"
                          }
                        >
                          {row.netRequired}
                        </td>
                        <td>
                          {row.isLocked ? (
                            <Badge bg="success">Allotted</Badge>
                          ) : row.allocated > 0 ? (
                            <Badge bg="warning">Partial</Badge>
                          ) : (
                            <Badge bg="secondary">Pending</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
          </Tabs>
        </Card.Body>

        <Card.Footer className="text-end">
          <Button
            variant="success"
            disabled={
              (activeTab === "materials" && !isMaterialsFullyAllocated) ||
              (activeTab === "products" && !isProductsFullyAllocated) ||
              isProcessing
            }
            onClick={() => {
                // Open Preview Modal instead of direct release
                setIsApproved(false);
                setShowPreviewModal(true);
            }}
          >
            Preview & Release
          </Button>
        </Card.Footer>
      </Card>

      {/* ───────────────────────── PREVIEW & APPROVAL MODAL ───────────────────────── */}
      <Modal 
        show={showPreviewModal} 
        onHide={() => !isProcessing && setShowPreviewModal(false)} 
        size="lg" 
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>MRP Preview - Work Order #{workOrderId}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto", backgroundColor: "#555" }}>
          <div
            style={{
              padding: "15px",
              backgroundColor: "white",
              fontFamily: "Arial, sans-serif",
              fontSize: "10.5px",
              width: "210mm", // A4 width
              margin: "0 auto",
              border: "1px solid #ddd",
              minHeight: "297mm" // A4 height
            }}
          >
            {/* HEADER IMAGE */}
            <div style={{ width: "100%", border: "1px solid #000", overflow: "hidden" }}>
              <img
                src={getHeaderImagePath()}
                alt="Header"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>

            {/* TITLE */}
            <h3 style={{ textAlign: "center", margin: "15px 0", fontWeight: "bold" }}>
              MATERIAL REQUIREMENT PLAN
            </h3>

            {/* MRP INFO */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div><strong>Work Order ID:</strong> {workOrderId}</div>
              <div><strong>Date:</strong> {new Date().toLocaleDateString("en-IN")}</div>
            </div>

            {/* CLIENT / PROJECT INFO MOCKUP */}
            <div style={{ lineHeight: "1.4", marginBottom: "15px" }}>
              <p style={{ margin: 0 }}><strong>To,</strong></p>
              <p style={{ margin: 0 }}>Planning & Procurement Department</p>
              <p style={{ marginTop: "10px" }}><strong>Subject:</strong> Release of {activeTab === 'materials' ? 'Raw Materials' : 'Products'} for Production</p>
              <p style={{ marginTop: "5px" }}>Dear Sir/Madam, <br />Please find below the requirement plan approved by the Design Team:</p>
            </div>

            {/* ITEMS TABLE */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#007bff", color: "white", textAlign: "center" }}>
                  <th style={th}>S.No</th>
                  <th style={th}>Description</th>
                  <th style={th}>Unit</th>
                  <th style={th}>Required</th>
                  <th style={th}>Allocated</th>
                  <th style={th}>Net Req</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === "materials" ? materialRows : productRows).map((row, idx) => (
                  <tr key={row.id}>
                    <td style={td}>{idx + 1}</td>
                    <td style={td}>
                      <div style={{ fontWeight: "bold", textTransform: "uppercase", marginBottom: "2px" }}>
                        {activeTab === "materials" ? row.rawMaterial : row.itemName}
                      </div>
                      {activeTab === "products" && <div>{row.brand} | {row.subProduct}</div>}
                    </td>
                    <td style={td}>{row.unit}</td>
                    <td style={td}>{row.required}</td>
                    <td style={td} className="text-center fw-bold text-primary">{row.allocated}</td>
                    <td style={td}>{row.netRequired}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* SUMMARY BOX */}
            <div style={{ float: "right", width: "45%", marginTop: "12px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={blueLeft}>Total Items</td>
                    <td style={blueRight}>
                      {(activeTab === "materials" ? materialRows : productRows).length}
                    </td>
                  </tr>
                  <tr>
                    <td style={blueLeft}>Total Allocated Qty</td>
                    <td style={blueRight}>
                      {(activeTab === "materials" ? materialRows : productRows).reduce((acc, r) => acc + r.allocated, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ clear: "both", marginTop: "120px" }}>
               <h4>Approval & Terms:</h4>
               <p style={{ lineHeight: "1.4" }}>
                 This document serves as an official release for procurement/production.
                 <br />
                 <strong>Prepared By:</strong> Design Team
               </p>
            </div>

            {/* FOOTER IMAGE */}
            <div style={{ marginTop: "25px", width: "100%", borderTop: "2px solid #000" }}>
              <img src="/extra/Footer.jpeg" style={{ width: "100%", height: "auto" }} />
            </div>

            {/* CHECKBOX SECTION (Overlaying the footer slightly or inside the flow) */}
            <div 
                style={{
                    position: "absolute", 
                    bottom: "80px", 
                    left: "0", 
                    width: "100%", 
                    background: "rgba(255,255,255,0.95)",
                    borderTop: "1px solid #ccc",
                    padding: "10px 15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}
            >
                <Form.Check 
                    type="checkbox" 
                    label="I verify the above details and approve this MRP for release."
                    checked={isApproved}
                    onChange={(e) => setIsApproved(e.target.checked)}
                    disabled={isProcessing}
                />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleReleaseToPlanning}
            disabled={!isApproved || isProcessing}
          >
            {isProcessing ? "Releasing..." : "Approve & Release to Planning"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}