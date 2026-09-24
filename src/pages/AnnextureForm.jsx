// AnnexureForm.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Table,
  Badge,
  Alert,
} from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaPrint, FaEdit, FaSave } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE = "https://nlfs.in/erp/index.php/Api";

const AnnexureForm = () => {
  const { poId } = useParams();
  const [poData, setPoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  // Fetch PO data by ID
  useEffect(() => {
    const fetchPoData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/get_po_id`, {
          params: { po_id: poId }
        });

        if (String(res.data?.success) === "1") {
          const data = res.data.data || {};
          setPoData(data);
          setFormData(data);
        } else {
          setError(res.data?.message || "Failed to fetch Purchase Order details");
          toast.error("Failed to fetch Purchase Order details");
        }
      } catch (error) {
        console.error("Error fetching PO data:", error);
        setError("Error loading Purchase Order details");
        toast.error("Error loading Purchase Order details");
      } finally {
        setLoading(false);
      }
    };

    if (poId) {
      fetchPoData();
    }
  }, [poId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/update_po`, {
        po_id: poId,
        ...formData
      });

      if (String(res.data?.success) === "1") {
        setPoData(formData);
        setEditMode(false);
        toast.success("Purchase Order updated successfully");
      } else {
        toast.error(res.data?.message || "Failed to update Purchase Order");
      }
    } catch (error) {
      console.error("Error updating PO:", error);
      toast.error("Error updating Purchase Order");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <Row>
          <Col md="12">
            <Alert variant="danger">{error}</Alert>
            <Button as={Link} to="/povendor" variant="primary">
              <FaArrowLeft className="me-2" />
              Back to PO List
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
              <Row className="align-items-center">
                <Col>
                  <Card.Title style={{ marginTop: "2rem", fontWeight: "700" }}>
                    Purchase Order Annexure
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <Button as={Link} to="/povendor" variant="secondary">
                    <FaArrowLeft className="me-1" /> Back
                  </Button>
                  {editMode ? (
                    <Button variant="success" onClick={handleSave}>
                      <FaSave className="me-1" /> Save
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={() => setEditMode(true)}>
                      <FaEdit className="me-1" /> Edit
                    </Button>
                  )}
                  <Button variant="info" onClick={handlePrint}>
                    <FaPrint className="me-1" /> Print
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="table-full-width">
              <div className="po-header mb-4">
                <Row>
                  <Col md={6}>
                    <h4>PO Number: {poData.po_no || "N/A"}</h4>
                    <p className="text-muted">PO Date: {formatDate(poData.po_date)}</p>
                  </Col>
                  <Col md={6} className="text-end">
                    <Badge 
                      className={`px-3 py-2 ${
                        poData.po_approval === "yes" || poData.po_approval === "1"
                          ? "bg-success text-light"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {poData.po_approval === "yes" || poData.po_approval === "1" 
                        ? "Approved" 
                        : "Pending"}
                    </Badge>
                  </Col>
                </Row>
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Header as="h5">Vendor Information</Card.Header>
                    <Card.Body>
                      <Table borderless>
                        <tbody>
                          <tr>
                            <td><strong>Vendor Name:</strong></td>
                            <td>
                              {editMode ? (
                                <input
                                  type="text"
                                  className="form-control"
                                  name="quotation_name"
                                  value={formData.quotation_name || ""}
                                  onChange={handleInputChange}
                                />
                              ) : (
                                poData.quotation_name || "N/A"
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Company:</strong></td>
                            <td>
                              {editMode ? (
                                <input
                                  type="text"
                                  className="form-control"
                                  name="company"
                                  value={formData.company || ""}
                                  onChange={handleInputChange}
                                />
                              ) : (
                                poData.company || "N/A"
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Address:</strong></td>
                            <td>
                              {editMode ? (
                                <textarea
                                  className="form-control"
                                  name="vendor_address"
                                  value={formData.vendor_address || ""}
                                  onChange={handleInputChange}
                                />
                              ) : (
                                poData.vendor_address || "N/A"
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Contact:</strong></td>
                            <td>
                              {editMode ? (
                                <input
                                  type="text"
                                  className="form-control"
                                  name="vendor_contact"
                                  value={formData.vendor_contact || ""}
                                  onChange={handleInputChange}
                                />
                              ) : (
                                poData.vendor_contact || "N/A"
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Header as="h5">Billing Information</Card.Header>
                    <Card.Body>
                      <Table borderless>
                        <tbody>
                          <tr>
                            <td><strong>Billing To:</strong></td>
                            <td>
                              {editMode ? (
                                <input
                                  type="text"
                                  className="form-control"
                                  name="billing_to"
                                  value={formData.billing_to || ""}
                                  onChange={handleInputChange}
                                />
                              ) : (
                                poData.billing_to || "N/A"
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Shipping To:</strong></td>
                            <td>
                              {editMode ? (
                                <textarea
                                  className="form-control"
                                  name="shipping_to"
                                  value={formData.shipping_to || ""}
                                  onChange={handleInputChange}
                                />
                              ) : (
                                poData.shipping_to || "N/A"
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Payment Terms:</strong></td>
                            <td>
                              {editMode ? (
                                <input
                                  type="text"
                                  className="form-control"
                                  name="payment_terms"
                                  value={formData.payment_terms || ""}
                                  onChange={handleInputChange}
                                />
                              ) : (
                                poData.payment_terms || "N/A"
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td><strong>Expected Delivery:</strong></td>
                            <td>
                              {editMode ? (
                                <input
                                  type="date"
                                  className="form-control"
                                  name="expected_delivery"
                                  value={formData.expected_delivery || ""}
                                  onChange={handleInputChange}
                                />
                              ) : (
                                formatDate(poData.expected_delivery)
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="mb-4">
                <Card.Header as="h5">Order Items</Card.Header>
                <Card.Body>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Discount</th>
                        <th>Tax</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poData.items && poData.items.length > 0 ? (
                        poData.items.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{item.description || "N/A"}</td>
                            <td>{item.quantity || "0"}</td>
                            <td>{formatCurrency(item.unit_price)}</td>
                            <td>{item.discount || "0"}%</td>
                            <td>{item.tax || "0"}%</td>
                            <td>{formatCurrency(item.total)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">No items found</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="6" className="text-end"><strong>Subtotal:</strong></td>
                        <td>{formatCurrency(poData.subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan="6" className="text-end"><strong>Tax Amount:</strong></td>
                        <td>{formatCurrency(poData.tax_amount)}</td>
                      </tr>
                      <tr>
                        <td colSpan="6" className="text-end"><strong>Total Amount:</strong></td>
                        <td><strong>{formatCurrency(poData.total_amt)}</strong></td>
                      </tr>
                    </tfoot>
                  </Table>
                </Card.Body>
              </Card>

              {poData.notes && (
                <Card className="mb-4">
                  <Card.Header as="h5">Notes</Card.Header>
                  <Card.Body>
                    {editMode ? (
                      <textarea
                        className="form-control"
                        name="notes"
                        value={formData.notes || ""}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    ) : (
                      <p>{poData.notes}</p>
                    )}
                  </Card.Body>
                </Card>
              )}

              {poData.terms_and_conditions && (
                <Card className="mb-4">
                  <Card.Header as="h5">Terms and Conditions</Card.Header>
                  <Card.Body>
                    {editMode ? (
                      <textarea
                        className="form-control"
                        name="terms_and_conditions"
                        value={formData.terms_and_conditions || ""}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    ) : (
                      <p>{poData.terms_and_conditions}</p>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AnnexureForm;