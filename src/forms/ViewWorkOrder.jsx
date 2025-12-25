import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Tabs,
  Tab,
  Spinner,
} from "react-bootstrap";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const ROOT = "https://nlfs.in/erp/index.php";
const API_BASE_URL = `${ROOT}/Api/`;

const ViewWorkOrder = () => {
  const navigate = useNavigate();
  const { workOrderId } = useParams();

  const [formData, setFormData] = useState({
    wo_no: "",
    po_id: "",
    po_no: "",
    quto_id: "",
    branch: "",
    exp_delivery_date: "",
    general_design: "",
    color_scheme: "",
    custom_req: "",
    site_readiness: "",
    client_preparation: "",
    access_condition: "",
    special_req: "",
    payment_term: "",
    advance_amt: "",
    bal_amt: "",
    advance_paid: "",
    scrap_applicable: "",
    machinery_required: "",
    quality_check_lighting: "",
    est_power_cons: "",
    workshop_lighting_eq: "",
    heavy_machinery_power3: "",
    site_power_available: "",
    site_power_type: "",
    notes: "",
    full_amount: "",
    items: [],
    payment_details: "",
    terms_conditions: "",
    warranty: "",
    quote_terms: "",
    acc_approval: "",
    header_img: "",
  });
  const [loading, setLoading] = useState(false);

  // Function to convert date from DD-MM-YYYY to YYYY-MM-DD format
  const convertDateFormat = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const fetchWorkOrder = async () => {
    if (!workOrderId) return;
    try {
      setLoading(true);
      // Fixed: Using the correct API endpoint
      const res = await fetch(`${API_BASE_URL}get_work_order_by_id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ work_id: workOrderId }),
      });
      const d = await res.json();
      
      if ((d.status === "true" || d.status === true) && d.data) {
        const w = d.data;
        
        // Parse items from JSON string
        let items = [];
        try {
          if (w.items) {
            const parsedItems = typeof w.items === 'string' ? JSON.parse(w.items) : w.items;
            if (Array.isArray(parsedItems)) {
              items = parsedItems.map((item, idx) => ({
                id: `wo-item-${Date.now()}-${idx}`,
                brand: item.brand || "",
                product: item.item_name || item.product || "",
                sub_product: item.sub_product || "",
                description: item.description || item.desc || "",
                unit: item.unit || "",
                quantity: String(item.quantity || item.qty || ""),
                rate: String(item.unit_price || item.rate || ""),
                amount: String((parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0)).toFixed(2)),
              }));
            }
          }
        } catch (e) {
          console.error("Error parsing items:", e);
        }

        setFormData({
          wo_no: w.wo_no || "",
          po_id: w.po_id || "",
          po_no: w.po_no || "",
          quto_id: w.quto_id || "",
          branch: w.branch_name || w.branch || "",
          exp_delivery_date: convertDateFormat(w.exp_delivery_date || ""),
          general_design: w.general_design || "",
          color_scheme: w.color_scheme || "",
          custom_req: w.custom_req || "",
          site_readiness: w.site_readiness || "",
          client_preparation: w.client_preparation || "",
          access_condition: w.access_condition || "",
          special_req: w.special_req || "",
          payment_term: w.payment_term || "",
          advance_amt: w.advance_amt || "",
          bal_amt: w.bal_amt || "",
          advance_paid: w.advance_paid || "",
          scrap_applicable: w.scrap_applicable || "",
          machinery_required: w.machinery_required || "",
          quality_check_lighting: w.quality_check_lighting || "",
          est_power_cons: w.est_power_cons || "",
          workshop_lighting_eq: w.workshop_lighting_eq || "",
          heavy_machinery_power3: w.heavy_machinery_power3 || "",
          site_power_available: w.site_power_available || "",
          site_power_type: w.site_power_type || "",
          notes: w.notes || "",
          full_amount: w.full_amount || "",
          items: items,
          payment_details: w.payment_term || "",
          terms_conditions: w.terms_conditions || "",
          warranty: w.warranty || "",
          quote_terms: w.quote_terms || "",
          acc_approval: w.acc_approval || "",
          header_img: w.header_img || "",
        });
      } else {
        toast.error(d.message || "Failed to fetch work order");
      }
    } catch (err) {
      console.error("Error fetching work order:", err);
      toast.error("Error fetching work order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrder();
  }, [workOrderId]);

  // Removed handleDownloadFile function since there's no file API

  if (loading) {
    return (
      <Container fluid className="my-4 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid className="my-4">
      <Button
        className="mb-3"
        style={{ backgroundColor: "rgb(237, 49, 49)", border: "none" }}
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft /> Back
      </Button>

      {/* Header Card - Mirrors WorkOrderForm */}
      <Card className="mb-4">
        <Card.Header>
          <Card.Title as="h4">View Work Order - {formData.wo_no}</Card.Title>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>WO No</Form.Label>
                <Form.Control type="text" value={formData.wo_no} readOnly />
              </Form.Group>
            </Col>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>Quote No</Form.Label>
                <Form.Control type="text" value={formData.quto_id} readOnly />
              </Form.Group>
            </Col>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>Branch</Form.Label>
                <Form.Control type="text" value={formData.branch} readOnly />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>Expected Delivery Date</Form.Label>
                <Form.Control type="date" value={formData.exp_delivery_date} readOnly />
              </Form.Group>
            </Col>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>General Design</Form.Label>
                <Form.Control type="text" value={formData.general_design} readOnly />
              </Form.Group>
            </Col>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>Color Scheme</Form.Label>
                <Form.Control type="text" value={formData.color_scheme} readOnly />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>Account Approval</Form.Label>
                <Form.Control type="text" value={formData.acc_approval} readOnly />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Items Card - Mirrors WorkOrderForm */}
      <Card className="mb-4">
        <Card.Header>
          <Card.Title as="h5">Work Order Items</Card.Title>
        </Card.Header>
        <Card.Body>
          {formData.items.map((item, idx) => (
            <div key={item.id} className="border rounded p-3 mb-3">
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group><Form.Label>Brand</Form.Label><Form.Control type="text" value={item.brand} readOnly /></Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group><Form.Label>Product</Form.Label><Form.Control type="text" value={item.product} readOnly /></Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group><Form.Label>Sub Product</Form.Label><Form.Control type="text" value={item.sub_product} readOnly /></Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={2} value={item.description} readOnly /></Form.Group>
                </Col>
              </Row>
              <Row className="align-items-end">
                <Col md={2}><Form.Group><Form.Label>Unit</Form.Label><Form.Control value={item.unit} readOnly /></Form.Group></Col>
                <Col md={2}><Form.Group><Form.Label>Qty</Form.Label><Form.Control type="number" value={item.quantity} readOnly /></Form.Group></Col>
                <Col md={2}><Form.Group><Form.Label>Rate</Form.Label><Form.Control type="number" value={item.rate} readOnly /></Form.Group></Col>
                <Col md={2}><Form.Group><Form.Label>Amount</Form.Label><Form.Control value={item.amount} readOnly /></Form.Group></Col>
              </Row>
            </div>
          ))}
          {formData.items.length === 0 && <div className="text-center text-muted py-3">No items found for this work order</div>}
        </Card.Body>
      </Card>

      {/* Tab Layout - Mirrors WorkOrderForm */}
      <Card>
        <Tabs defaultActiveKey="payment" id="view-workorder-extra-tabs">
          <Tab eventKey="payment" title="Terms and conditions">
            <Card.Body>
              {formData.quote_terms ? (
                <div dangerouslySetInnerHTML={{ __html: formData.quote_terms }} />
              ) : (
                <div className="text-muted">No terms and conditions available.</div>
              )}
            </Card.Body>
          </Tab>
          <Tab eventKey="terms" title="Payment Details">
            <Card.Body>
              <Row>
                <Col md="6">
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Term</Form.Label>
                    <Form.Control as="textarea" rows={4} value={formData.payment_term} readOnly />
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="mb-3">
                    <Form.Label>Advance Amount</Form.Label>
                    <Form.Control type="text" value={formData.advance_amt} readOnly />
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="mb-3">
                    <Form.Label>Balance Amount</Form.Label>
                    <Form.Control type="text" value={formData.bal_amt} readOnly />
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="mb-3">
                    <Form.Label>Advance Paid</Form.Label>
                    <Form.Control type="text" value={formData.advance_paid} readOnly />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Tab>
          <Tab eventKey="warranty" title="Warranty">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Warranty</Form.Label>
                <Form.Control as="textarea" rows={4} value={formData.warranty} readOnly />
              </Form.Group>
            </Card.Body>
          </Tab>
          <Tab eventKey="site" title="Site Details">
             <Card.Body>
              <Row>
                <Col md="6"><Form.Group><Form.Label>Site Readiness</Form.Label><Form.Control type="text" value={formData.site_readiness} readOnly /></Form.Group></Col>
                <Col md="6"><Form.Group><Form.Label>Client Preparation</Form.Label><Form.Control type="text" value={formData.client_preparation} readOnly /></Form.Group></Col>
                <Col md="6"><Form.Group><Form.Label>Access Condition</Form.Label><Form.Control type="text" value={formData.access_condition} readOnly /></Form.Group></Col>
                <Col md="6"><Form.Group><Form.Label>Special Requirements</Form.Label><Form.Control as="textarea" rows={2} value={formData.special_req} readOnly /></Form.Group></Col>
                <Col md="12"><Form.Group><Form.Label>Custom Requirements</Form.Label><Form.Control as="textarea" rows={2} value={formData.custom_req} readOnly /></Form.Group></Col>
              </Row>
            </Card.Body>
          </Tab>
          <Tab eventKey="resources" title="Resources">
            <Card.Body>
              <Row>
                <Col md="6"><Form.Group><Form.Label>Scrap Applicable</Form.Label><Form.Control type="text" value={formData.scrap_applicable} readOnly /></Form.Group></Col>
                <Col md="6"><Form.Group><Form.Label>Machinery Required</Form.Label><Form.Control type="text" value={formData.machinery_required} readOnly /></Form.Group></Col>
                <Col md="4"><Form.Group><Form.Label>Quality Check Lighting</Form.Label><Form.Control type="text" value={formData.quality_check_lighting} readOnly /></Form.Group></Col>
                <Col md="4"><Form.Group><Form.Label>Estimated Power Consumption</Form.Label><Form.Control type="text" value={formData.est_power_cons} readOnly /></Form.Group></Col>
                <Col md="4"><Form.Group><Form.Label>Workshop Lighting Equipment</Form.Label><Form.Control type="text" value={formData.workshop_lighting_eq} readOnly /></Form.Group></Col>
                <Col md="4"><Form.Group><Form.Label>Heavy Machinery Power (3-Phase)</Form.Label><Form.Control type="text" value={formData.heavy_machinery_power3} readOnly /></Form.Group></Col>
                <Col md="4"><Form.Group><Form.Label>Site Power Available</Form.Label><Form.Control type="text" value={formData.site_power_available} readOnly /></Form.Group></Col>
                <Col md="4"><Form.Group><Form.Label>Site Power Type</Form.Label><Form.Control type="text" value={formData.site_power_type} readOnly /></Form.Group></Col>
              </Row>
            </Card.Body>
          </Tab>
           <Tab eventKey="notes" title="Notes">
            <Card.Body>
              <Form.Control as="textarea" rows={5} value={formData.notes} readOnly />
            </Card.Body>
          </Tab>
        </Tabs>
      </Card>
    </Container>
  );
};

export default ViewWorkOrder;