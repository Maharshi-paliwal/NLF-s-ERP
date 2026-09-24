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
  Tabs,
  Tab,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import axios from "axios";

const API_BASE = "https://nlfs.in/erp/index.php/Api";

const AnnexureView = () => {
  const { annexureId } = useParams();
  const navigate = useNavigate();
  const [annexureData, setAnnexureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch annexure data by ID
  useEffect(() => {
    const fetchAnnexureData = async () => {
      if (!annexureId) {
        setError("No Annexure ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const res = await axios.post(
          "https://nlfs.in/erp/index.php/Nlf_Erp/get_annexure_by_id",
          { annexure_id: annexureId }
        );

        if (res.data?.status === true && res.data?.data) {
          setAnnexureData(res.data.data);
          setError(null);
        } else {
          const errorMsg = res.data?.message || "Failed to fetch Annexure details";
          setError(errorMsg);
        }
      } catch (error) {
        console.error("Error fetching annexure data:", error);
        const errorMsg = error.response?.data?.message || "Error loading Annexure details";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnexureData();
  }, [annexureId]);

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    navigate(-1);
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
    return `₹${Number(amount).toLocaleString('en-IN', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" />
        <span className="ms-3">Loading Annexure...</span>
      </Container>
    );
  }

  if (error || !annexureData) {
    return (
      <Container fluid>
        <Row>
          <Col md="12">
            <Alert variant="danger">
              {error || "No data found for this Annexure"}
            </Alert>
            <Button onClick={handleGoBack} variant="primary">
              <FaArrowLeft className="me-2" />
              Back
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="my-4">
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={handleGoBack}>
          <FaArrowLeft className="me-2" />
          Back
        </Button>
        <Button variant="secondary" onClick={handlePrint}>
          <FaPrint className="me-2" />
          Print
        </Button>
      </div>

      <Row>
        {/* Header Card */}
        <Col md="12">
          <Card className="mb-4">
            <Card.Header style={{ backgroundColor: "#2c3e50" }}>
              <Card.Title as="h4" className="text-white">
                Annexure Details
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md="6">
                  <h6>Annexure Number</h6>
                  <p>{annexureData.annexure_no || "N/A"}</p>
                </Col>
                <Col md="6">
                  <h6>Revision</h6>
                  <p>{annexureData.revise || "N/A"}</p>
                </Col>
                <Col md="6">
                  <h6>Date</h6>
                  <p>{formatDate(annexureData.date)}</p>
                </Col>
                <Col md="6">
                  <h6>Status</h6>
                  <p>
                    <Badge bg={annexureData.design_approval === "Yes" ? "success" : "warning"}>
                      {annexureData.design_approval === "Yes" ? "Approved" : "Pending Approval"}
                    </Badge>
                  </p>
                </Col>
              </Row>
              <Row>
                <Col md="6">
                  <h6>Client Name</h6>
                  <p>{annexureData.client_name || "N/A"}</p>
                </Col>
                <Col md="6">
                  <h6>Vendor</h6>
                  <p>{annexureData.vendor || "N/A"}</p>
                </Col>
                <Col md="6">
                  <h6>Project</h6>
                  <p>{annexureData.project || "N/A"}</p>
                </Col>
                <Col md="6">
                  <h6>PO Number</h6>
                  <p>{annexureData.po_id || "N/A"}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Annexure Items Card */}
        <Col md="12">
          <Card className="mb-4">
            <Card.Header style={{ backgroundColor: "#34495e" }}>
              <Card.Title as="h5" className="text-white">
                Annexure Items
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Description</th>
                    <th>Length</th>
                    <th>Quantity</th>
                    <th>Area</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {annexureData.annexure && annexureData.annexure.length > 0 ? (
                    annexureData.annexure.map((item, index) => (
                      <tr key={index}>
                        <td>{item.sr_no || index + 1}</td>
                        <td>{item.description || "N/A"}</td>
                        <td>{item.length || "N/A"}</td>
                        <td>{item.quantity || "0"}</td>
                        <td>{item.area || "0"}</td>
                        <td>{formatCurrency(item.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">No items found</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" className="text-end fw-bold">Sub Total:</td>
                    <td className="fw-bold">{formatCurrency(annexureData.sub_total || 0)}</td>
                  </tr>
                  <tr>
                    <td colSpan="5" className="text-end fw-bold">GST 18%:</td>
                    <td className="fw-bold">{formatCurrency(annexureData.gst || 0)}</td>
                  </tr>
                  <tr>
                    <td colSpan="5" className="text-end fw-bold">Grand Total:</td>
                    <td className="fw-bold">{formatCurrency(annexureData.total_amount || 0)}</td>
                  </tr>
                </tfoot>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* PO Items Card */}
        {annexureData.items && annexureData.items.length > 0 && (
          <Col md="12">
            <Card className="mb-4">
              <Card.Header style={{ backgroundColor: "#34495e" }}>
                <Card.Title as="h5" className="text-white">
                  Purchase Order Items
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Tabs defaultActiveKey={0} className="mb-3">
                  {annexureData.items.map((item, index) => (
                    <Tab eventKey={index} title={item.brand || 'Item'} key={index}>
                      <Row>
                        <Col md={12}>
                          <Card className="mb-3">
                            <Card.Header as="h5">Product Details</Card.Header>
                            <Card.Body>
                              <Row>
                                <Col md={6}>
                                  <h6>Brand</h6>
                                  <p>{item.brand || "N/A"}</p>
                                </Col>
                                <Col md={6}>
                                  <h6>Product</h6>
                                  <p>{item.product || "N/A"}</p>
                                </Col>
                                <Col md={6}>
                                  <h6>Sub Product</h6>
                                  <p>{item.sub_product || "N/A"}</p>
                                </Col>
                                <Col md={6}>
                                  <h6>Unit</h6>
                                  <p>{item.unit || "N/A"}</p>
                                </Col>
                                <Col md={12}>
                                  <h6>Description</h6>
                                  <p>{item.desc || "N/A"}</p>
                                </Col>
                                <Col md={6}>
                                  <h6>Quantity</h6>
                                  <p>{item.qty || "0"}</p>
                                </Col>
                                <Col md={6}>
                                  <h6>Rate</h6>
                                  <p>{formatCurrency(item.rate)}</p>
                                </Col>
                                <Col md={6}>
                                  <h6>Amount</h6>
                                  <p>{formatCurrency(item.amt)}</p>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={12}>
                          <Card className="mb-3">
                            <Card.Header as="h5">Installation Details</Card.Header>
                            <Card.Body>
                              <Row>
                                <Col md={6}>
                                  <h6>Unit</h6>
                                  <p>{item.inst_unit || "N/A"}</p>
                                </Col>
                                <Col md={6}>
                                  <h6>Quantity</h6>
                                  <p>{item.inst_qty || "0"}</p>
                                </Col>
                                <Col md={6}>
                                  <h6>Rate</h6>
                                  <p>{formatCurrency(item.inst_rate)}</p>
                                </Col>
                                <Col md={6}>
                                  <h6>Amount</h6>
                                  <p>{formatCurrency(item.inst_amt)}</p>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </Tab>
                  ))}
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default AnnexureView;