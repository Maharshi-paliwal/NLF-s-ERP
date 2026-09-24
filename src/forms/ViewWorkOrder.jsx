// export default ViewWorkOrder;

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
  Modal,
} from "react-bootstrap";
import { FaArrowLeft, FaDownload, FaFilePdf, FaFileImage, FaEye } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const ROOT = "https://nlfs.in/erp/index.php";
const API_BASE_URL = `${ROOT}/Api/`;

// Helper to get the base URL for assets (removing index.php)
const ASSET_BASE_URL = ROOT.split('/index.php')[0];

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
    file_upload: "",
    file_upload2: "",
  });

  const [loading, setLoading] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [previewFile, setPreviewFile] = useState("");


  // --- State for Calculated Totals ---
  const [calculatedTotals, setCalculatedTotals] = useState({
    basicAmount: 0,
    gst: 0,
    grandTotal: 0,
  });

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
          payment_details: w.payment_details || w.payment_term || "",
          terms_conditions: w.terms_and_condition || w.terms_conditions || "",
          warranty: w.warranty || "",
          quote_terms: w.quote_terms || w.terms_and_condition || "",
          acc_approval: w.acc_approval || "",
          header_img: w.header_img || "",
          file_upload: w.file_upload || "",
          file_upload2: w.file_upload2 || "",

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

  // --- Logic to Calculate Totals based on items ---
  useEffect(() => {
    const totalItemAmount = formData.items.reduce((acc, item) => {
      const amount = parseFloat(item.amount) || 0;
      return acc + amount;
    }, 0);

    // Calculating 18% GST
    const gst = totalItemAmount * 0.18;
    const grandTotal = totalItemAmount + gst;

    setCalculatedTotals({
      basicAmount: totalItemAmount,
      gst: gst,
      grandTotal: grandTotal,
    });
  }, [formData.items]);

  useEffect(() => {
    fetchWorkOrder();
  }, [workOrderId]);

  // Determine file type for preview
  const getFileExtension = (filename) => {
    if (!filename) return "";
    return filename.split('.').pop().toLowerCase();
  };

  const fileExtension = getFileExtension(formData.file_upload);
  const isPdf = fileExtension === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
  
  // Construct full file URL
  // const fileUrl = formData.file_upload ? `${ASSET_BASE_URL}/${formData.file_upload}` : "";

  const fileUrl = previewFile ? `${ASSET_BASE_URL}/${previewFile}` : "";

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
        <FaArrowLeft />
      </Button>

      {/* Header Card - MATCHES WorkOrderForm */}
      <Card className="mb-4">
        <Card.Header>
          <Card.Title as="h4">View Work Order</Card.Title>
        </Card.Header>
        <Card.Body>
          {/* Row 1: WO No, Quote No, Branch */}
          <Row>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>WO No</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.wo_no}
                  readOnly
                />
              </Form.Group>
            </Col>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>Quote No</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.quto_id}
                  readOnly
                />
              </Form.Group>
            </Col>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>Branch</Form.Label>
                <Form.Control
                  type="text"
                  name="branch"
                  value={formData.branch}
                  readOnly
                  placeholder="Branch"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Row 2: Client Name, Expected Delivery Date */}
          <Row>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>Client Name</Form.Label>
                <Form.Control
                  type="text"
                  name="client_preparation"
                  value={formData.client_preparation}
                  readOnly
                  placeholder="Client Name"
                />
              </Form.Group>
            </Col>
            <Col md="4">
              <Form.Group className="mb-3">
                <Form.Label>Expected Delivery Date</Form.Label>
                <Form.Control
                  type="text"
                  name="exp_delivery_date"
                  value={formData.exp_delivery_date}
                  readOnly
                />
              </Form.Group>
            </Col>
            
          {(formData.file_upload || formData.file_upload2) && (
  <Col md="4">
    <Form.Group>
      <Form.Label>Uploaded Documents</Form.Label>

      <div className="d-flex flex-column gap-2">

        {formData.file_upload && (
          <div className="d-flex align-items-center gap-2">
            <Form.Control
              type="text"
              value={formData.file_upload.split('/').pop()}
              readOnly
            />
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                setPreviewFile(formData.file_upload);
                setShowFileModal(true);
              }}
            >
              <FaEye />
            </Button>
          </div>
        )}

        {formData.file_upload2 && (
          <div className="d-flex align-items-center gap-2">
            <Form.Control
              type="text"
              value={formData.file_upload2.split('/').pop()}
              readOnly
            />
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                setPreviewFile(formData.file_upload2);
                setShowFileModal(true);
              }}
            >
              <FaEye />
            </Button>
          </div>
        )}

      </div>
    </Form.Group>
  </Col>
)}

          </Row>
        </Card.Body>
      </Card>

      {/* Items Card - MATCHES WorkOrderForm Layout */}
      <Row>
        <Col md="12">
          <Card className="mb-4">
            <Card.Header>
              <Card.Title as="h5">Work Order Items</Card.Title>
            </Card.Header>
            <Card.Body>
              {formData.items.map((item, idx) => (
                <div key={item.id} className="border rounded p-3 mb-3">
                  <Row className="mb-3">
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Brand</Form.Label>
                        <Form.Control
                          type="text"
                          value={item.brand}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Product</Form.Label>
                        <Form.Control
                          type="text"
                          value={item.product}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Sub Product</Form.Label>
                        <Form.Control
                          type="text"
                          value={item.sub_product}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={item.description}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="align-items-end">
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Unit</Form.Label>
                        <Form.Control value={item.unit} readOnly />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Qty</Form.Label>
                        <Form.Control
                          type="number"
                          value={item.quantity}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Rate</Form.Label>
                        <Form.Control
                          type="number"
                          value={item.rate}
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Amount</Form.Label>
                        <Form.Control value={item.amount} readOnly />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Colour Scheme</Form.Label>
                        <Form.Control value={item.amount} readOnly />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              ))}
              {formData.items.length === 0 && (
                <div className="text-center text-muted py-3">
                  No items found for this work order
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Totals Card - MATCHES WorkOrderForm Position */}
      <Row className="d-flex justify-content-end">
        <Col md="3" className="d-flex justify-content-end">
          <Card className="d-flex justify-content-end mb-4">
            <Card.Body>
              <div className="mb-2">
                <strong className="me-2">Basic Amount:</strong>
                <span>
                  ₹
                  {calculatedTotals.basicAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="mb-2">
                <strong className="me-2">GST (18%):</strong>
                <span>
                  ₹
                  {calculatedTotals.gst.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="d-flex justify-content-start">
                <h4 className="me-2">Total:</h4>
                <h6 className="mt-1">
                  ₹
                  {calculatedTotals.grandTotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </h6>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row: Terms & Conditions - MATCHES WorkOrderForm */}
      <Card className="mb-4">
        <Tabs defaultActiveKey="payment" id="workorder-extra-tabs">
          <Tab eventKey="payment" title="Terms and conditions">
            <Card.Body>
              {formData.terms_conditions ? (
                <div dangerouslySetInnerHTML={{ __html: formData.terms_conditions }} />
              ) : (
                <div className="text-muted">No terms and conditions available.</div>
              )}
            </Card.Body>
          </Tab>

          <Tab eventKey="terms" title="Remark">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Remark</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  name="payment_details"
                  value={formData.payment_details}
                  readOnly
                  placeholder="Payment terms, milestones, schedules, etc."
                />
              </Form.Group>
            </Card.Body>
          </Tab>
        </Tabs>
      </Card>

      {/* File Preview Modal */}
      <Modal 
        show={showFileModal} 
        onHide={() => setShowFileModal(false)} 
        size="xl" 
        centered 
        className="file-preview-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>File Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 bg-light" style={{ height: '75vh', overflow: 'hidden' }}>
          <div className="w-100 h-100 d-flex justify-content-center align-items-center">
            {isPdf ? (
              <iframe 
                src={fileUrl} 
                title="File Preview" 
                width="100%" 
                height="100%" 
                style={{ border: 'none' }}
              />
            ) : isImage ? (
              <img 
                src={fileUrl} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              />
            ) : (
              <div className="text-center p-5">
                <h4>Preview not available for this file type.</h4>
                <Button 
                  variant="success" 
                  href={fileUrl} 
                  target="_blank" 
                  className="mt-3"
                >
                  Download File
                </Button>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default ViewWorkOrder;