// src/forms/DesignSubpage.jsx

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
} from "react-bootstrap";
import { FaArrowLeft, FaExclamationTriangle, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

/* ───────────────────────── APIs ───────────────────────── */
const WORK_ORDER_API = "https://nlfs.in/erp/index.php/Api/get_work_order_by_id";
const ADD_MRP_API = "https://nlfs.in/erp/index.php/Api/add_material_plan";

export default function DesignSubpage() {
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Products State
  const [products, setProducts] = useState([]);
  const [allocatedProducts, setAllocatedProducts] = useState({});
  const { workOrderId: urlWorkOrderId } = useParams();
  const [workOrderId] = useState(urlWorkOrderId || "2");

  /* ─────────────────────────
     1️⃣ FETCH WORK ORDER PRODUCTS
  ───────────────────────── */
  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        setLoading(true);

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
        setLoading(false);
      }
    };

    fetchWorkOrder();
  }, [workOrderId]);

  /* ─────────────────────────
     2️⃣ BUILD PRODUCT MRP ROWS
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

  const isProductsFullyAllocated =
    productRows.length > 0 && productRows.every((r) => r.isLocked);

  const handleProductAllocationChange = (id, value) => {
    const v = value === "" ? 0 : Number(value);
    if (!isNaN(v)) {
      setAllocatedProducts((prev) => ({ ...prev, [id]: v }));
    }
  };

  /* ─────────────────────────
     3️⃣ RELEASE MRP
  ───────────────────────── */
  const handleReleaseToPlanning = useCallback(async () => {
    try {
      setIsProcessing(true);

      const payload = {
        material: productRows.map((m) => ({
          raw_material: m.itemName,
          unit: m.unit,
          required: m.required,
          available: m.available,
          allocate: m.allocated,
          net_required: m.netRequired,
        })),
      };

      const res = await axios.post(ADD_MRP_API, payload);

      if (res.data?.success === "1") {
        toast.success("Products MRP released to Planning");
      } else {
        toast.error("Failed to submit MRP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting MRP");
    } finally {
      setIsProcessing(false);
    }
  }, [productRows]);

  /* ───────────────────────── UI STATES ───────────────────────── */
  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">Loading data...</p>
      </Container>
    );
  }

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
            <h2>Design Team</h2>
            
          </Col>
        </Row>
      </Card>

      <Card className="shadow-sm">
        <Card.Header className="bg-primary fw-bold text-white">
          Product Requirement Plan
        </Card.Header>

        <Card.Body>
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
        </Card.Body>

        <Card.Footer className="text-end">
          <Button
            variant="success"
            disabled={!isProductsFullyAllocated || isProcessing}
            onClick={handleReleaseToPlanning}
          >
            <FaSave/> Save
          </Button>
        </Card.Footer>
      </Card>
    </Container>
  );
}