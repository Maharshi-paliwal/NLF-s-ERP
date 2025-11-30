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
import { FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const API_BASE_URL = "https://nlfs.in/erp/index.php/Api";

// --- Initial State for a New Work Order ---
const getInitialState = () => ({
  quto_id: "",
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
});

const WorkOrderForm = () => {
  const { workOrderId: workIdFromUrl } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { viewContext = "operations", mode = "create" } = location.state || {};
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const [formData, setFormData] = useState(getInitialState);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (workIdFromUrl && (isViewMode || isEditMode)) {
      fetchWorkOrderDetails(workIdFromUrl);
    }
  }, [workIdFromUrl, isViewMode, isEditMode]);

  const fetchWorkOrderDetails = async (workId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/get_work_order_id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ work_id: workId }),
      });

      const result = await response.json();

      if (result.status && result.success === "1") {
        setFormData(result.data);
      } else {
        toast.error(result.message || "Failed to fetch work order details");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching work order:", error);
      toast.error("Failed to load work order. Please try again.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleMainChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isViewMode) {
      navigate(-1);
      return;
    }

    try {
      setSubmitting(true);

      const endpoint = isEditMode
        ? `${API_BASE_URL}/update_work_order`
        : `${API_BASE_URL}/add_work_order`;

      const payload = isEditMode
        ? { work_id: workIdFromUrl, ...formData }
        : formData;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status && result.success) {
        toast.success(result.message || `Work Order ${isEditMode ? "updated" : "created"} successfully!`);
        navigate(-1);
      } else {
        toast.error(result.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error submitting work order:", error);
      toast.error("Failed to submit work order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  const cardTitle = isViewMode
    ? `View Work Order: ${workIdFromUrl || formData.work_id}`
    : isEditMode
    ? `Edit Work Order: ${workIdFromUrl || formData.work_id}`
    : "Create New Work Order";

  const submitButtonText = isViewMode
    ? "Close"
    : isEditMode
    ? "Save Changes"
    : "Create Work Order";

  if (loading) {
    return (
      <Container fluid className="my-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
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

      <Form onSubmit={handleSubmit}>
        {/* Header Card */}
        <Card className="mb-4">
          <Card.Header>
            <Card.Title as="h4">{cardTitle}</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>Quote ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="quto_id"
                    value={formData.quto_id}
                    onChange={handleMainChange}
                    placeholder="e.g. 101"
                    required
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>Expected Delivery Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="exp_delivery_date"
                    value={formData.exp_delivery_date}
                    onChange={handleMainChange}
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>General Design</Form.Label>
                  <Form.Control
                    type="text"
                    name="general_design"
                    value={formData.general_design}
                    onChange={handleMainChange}
                    placeholder="e.g. Modern1"
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>Color Scheme</Form.Label>
                  <Form.Control
                    type="text"
                    name="color_scheme"
                    value={formData.color_scheme}
                    onChange={handleMainChange}
                    placeholder="e.g. Black & White"
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>Custom Requirements</Form.Label>
                  <Form.Control
                    type="text"
                    name="custom_req"
                    value={formData.custom_req}
                    onChange={handleMainChange}
                    placeholder="e.g. Custom cabinet"
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tab Layout */}
        <Card className="striped-tabled-with-hover">
          <Tabs defaultActiveKey="site" id="work-order-tabs">
            {/* Site Details Tab */}
            <Tab eventKey="site" title="Site Details">
              <Card className="mb-4">
                <Card.Header>
                  <Card.Title as="h5">Site Information</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md="6">
                      <Form.Group className="mb-3">
                        <Form.Label>Site Readiness</Form.Label>
                        <Form.Control
                          as="select"
                          name="site_readiness"
                          value={formData.site_readiness}
                          onChange={handleMainChange}
                          disabled={isViewMode}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="Partial">Partial</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md="6">
                      <Form.Group className="mb-3">
                        <Form.Label>Client Preparation</Form.Label>
                        <Form.Control
                          type="text"
                          name="client_preparation"
                          value={formData.client_preparation}
                          onChange={handleMainChange}
                          placeholder="e.g. Completed"
                          disabled={isViewMode}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <Form.Group className="mb-3">
                        <Form.Label>Access Condition</Form.Label>
                        <Form.Control
                          type="text"
                          name="access_condition"
                          value={formData.access_condition}
                          onChange={handleMainChange}
                          placeholder="e.g. Good"
                          disabled={isViewMode}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="6">
                      <Form.Group className="mb-3">
                        <Form.Label>Special Requirements</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="special_req"
                          value={formData.special_req}
                          onChange={handleMainChange}
                          placeholder="Any special requirements"
                          disabled={isViewMode}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            {/* Payment Tab */}
            <Tab eventKey="payment" title="Payment Details">
              <Card className="mb-4">
                <Card.Header>
                  <Card.Title as="h5">Payment Information</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md="4">
                      <Form.Group className="mb-3">
                        <Form.Label>Payment Term</Form.Label>
                        <Form.Control
                          type="text"
                          name="payment_term"
                          value={formData.payment_term}
                          onChange={handleMainChange}
                          placeholder="e.g. 50-50"
                          disabled={isViewMode}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="4">
                      <Form.Group className="mb-3">
                        <Form.Label>Advance Amount (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          name="advance_amt"
                          value={formData.advance_amt}
                          onChange={handleMainChange}
                          placeholder="10000"
                          disabled={isViewMode}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="4">
                      <Form.Group className="mb-3">
                        <Form.Label>Balance Amount (₹)</Form.Label>
                        <Form.Control
                          type="number"
                          name="bal_amt"
                          value={formData.bal_amt}
                          onChange={handleMainChange}
                          placeholder="15000"
                          disabled={isViewMode}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <Form.Group className="mb-3">
                        <Form.Label>Advance Paid</Form.Label>
                        <Form.Control
                          as="select"
                          name="advance_paid"
                          value={formData.advance_paid}
                          onChange={handleMainChange}
                          disabled={isViewMode}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            {/* Resources Tab */}
            <Tab eventKey="resources" title="Resources">
              <Card className="mb-4">
                <Card.Header>
                  <Card.Title as="h5">Resource Requirements</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md="6">
                      <Form.Group className="mb-3">
                        <Form.Label>Scrap Applicable</Form.Label>
                        <Form.Control
                          as="select"
                          name="scrap_applicable"
                          value={formData.scrap_applicable}
                          onChange={handleMainChange}
                          disabled={isViewMode}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md="6">
                      <Form.Group className="mb-3">
                        <Form.Label>Machinery Required</Form.Label>
                        <Form.Control
                          type="text"
                          name="machinery_required"
                          value={formData.machinery_required}
                          onChange={handleMainChange}
                          placeholder="e.g. Drilling machine"
                          disabled={isViewMode}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="4">
                      <Form.Group className="mb-3">
                        <Form.Label>Quality Check Lighting</Form.Label>
                        <Form.Control
                          type="text"
                          name="quality_check_lighting"
                          value={formData.quality_check_lighting}
                          onChange={handleMainChange}
                          placeholder="e.g. LED"
                          disabled={isViewMode}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="4">
                      <Form.Group className="mb-3">
                        <Form.Label>Estimated Power Consumption</Form.Label>
                        <Form.Control
                          type="text"
                          name="est_power_cons"
                          value={formData.est_power_cons}
                          onChange={handleMainChange}
                          placeholder="e.g. 1KW"
                          disabled={isViewMode}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="4">
                      <Form.Group className="mb-3">
                        <Form.Label>Workshop Lighting Equipment</Form.Label>
                        <Form.Control
                          type="text"
                          name="workshop_lighting_eq"
                          value={formData.workshop_lighting_eq}
                          onChange={handleMainChange}
                          placeholder="e.g. Tube light"
                          disabled={isViewMode}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="4">
                      <Form.Group className="mb-3">
                        <Form.Label>Heavy Machinery Power (3-Phase)</Form.Label>
                        <Form.Control
                          type="text"
                          name="heavy_machinery_power3"
                          value={formData.heavy_machinery_power3}
                          onChange={handleMainChange}
                          placeholder="e.g. 3 Phase"
                          disabled={isViewMode}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="4">
                      <Form.Group className="mb-3">
                        <Form.Label>Site Power Available</Form.Label>
                        <Form.Control
                          as="select"
                          name="site_power_available"
                          value={formData.site_power_available}
                          onChange={handleMainChange}
                          disabled={isViewMode}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md="4">
                      <Form.Group className="mb-3">
                        <Form.Label>Site Power Type</Form.Label>
                        <Form.Control
                          as="select"
                          name="site_power_type"
                          value={formData.site_power_type}
                          onChange={handleMainChange}
                          disabled={isViewMode}
                        >
                          <option value="">Select</option>
                          <option value="Single Phase">Single Phase</option>
                          <option value="3 Phase">3 Phase</option>
                          <option value="Generator">Generator</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            {/* Notes Tab */}
            <Tab eventKey="notes" title="Notes">
              <Card className="mb-4">
                <Card.Header>
                  <Card.Title as="h5">Additional Notes</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="notes"
                      value={formData.notes}
                      onChange={handleMainChange}
                      placeholder="Any additional notes or comments..."
                      disabled={isViewMode}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Card>

        {/* Submit Buttons */}
        <div className="d-flex justify-content-end gap-3">
          <Button variant="secondary" onClick={handleCancel} style={{ height: "40px" }}>
            {isViewMode ? "Close" : "Cancel"}
          </Button>
          {!isViewMode && (
            <Button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: "#ed3131", border: "none", height: "40px" }}
            >
              {submitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                submitButtonText
              )}
            </Button>
          )}
        </div>
      </Form>
    </Container>
  );
};

export default WorkOrderForm;