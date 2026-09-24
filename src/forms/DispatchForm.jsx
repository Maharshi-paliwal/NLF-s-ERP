import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Spinner,
  Badge,
  Alert,
  Modal,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaEraser } from "react-icons/fa";
import toast from "react-hot-toast";

// Add custom CSS for dropdown arrows (same as AnnextureForm)
const dropdownStyles = `
  .custom-dropdown {
    position: relative;
  }
  .custom-dropdown::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #6c757d;
    pointer-events: none;
  }
  .custom-dropdown select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    padding-right: 30px !important;
  }
`;

// Helper function to convert date from yyyy-mm-dd to dd-mm-yyyy
const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper function to convert date from dd-mm-yyyy to yyyy-mm-dd (for form submission)
const formatDateToYYYYMMDD = (dateString) => {
  if (!dateString) return "";
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// Mock data to simulate API response
const mockPoData = {
  po_id: "1",
  po_no: "NLF-23-PO-123",
  vendor_name: "ABC Furniture Ltd.",
  company: "Office Renovation Project",
  date: "2023-11-15",
  project_name: "Office Renovation Project",
  total_amt: "250000",
  client_name: "John Doe",
  client_contact: "+91 9876543210",
  client_email: "john.doe@example.com"
};

// Mock data for dropdowns
const mockUnits = [
  { unit_id: 1, unit: "Nos" },
  { unit_id: 2, unit: "Sqft" },
  { unit_id: 3, unit: "Sqm" },
  { unit_id: 4, unit: "Kg" },
  { unit_id: 5, unit: "RMT" }
];

const DispatchForm = () => {
  const { po_id } = useParams();
  const navigate = useNavigate();
  
  // State for delivery memo header information
  const [headerInfo, setHeaderInfo] = useState({
    date: "",
    location: "MUMBAI",
    vehicleNo: "",
    companyName: "",
    lrNo: ""
  });
  
  // State for delivery memo entries
  const [entries, setEntries] = useState([
    {
      poAnnexure: "",
      dateOfOrder: "",
      party: "",
      plNo: "",
      material: "",
      receivedQty: "",
      unit: "",
      acceptanceRemark: ""
    }
  ]);
  
  // State for loading and PO data
  const [loading, setLoading] = useState(true);
  const [poData, setPoData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch PO data based on po_id
  useEffect(() => {
    const fetchPoData = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use mock data
        const po = mockPoData;
        setPoData(po);
        
        // Set default values for the header with dd-mm-yyyy format
        const today = new Date();
        const formattedDate = formatDateToDDMMYYYY(today.toISOString());
        
        setHeaderInfo({
          date: formattedDate,
          location: "MUMBAI",
          vehicleNo: "",
          companyName: "",
          lrNo: ""
        });
      } catch (error) {
        console.error("Error fetching PO data:", error);
        toast.error("Failed to load PO data");
      } finally {
        setLoading(false);
      }
    };

    if (po_id) {
      fetchPoData();
    }
  }, [po_id]);

  // Handle input change for header info
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeaderInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input change for entries
  const handleEntryChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEntries = [...entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [name]: value
    };
    setEntries(updatedEntries);
  };

  // Add a new entry
  const addEntry = () => {
    setEntries([
      ...entries,
      {
        poAnnexure: "",
        dateOfOrder: "",
        party: "",
        plNo: "",
        material: "",
        receivedQty: "",
        unit: "",
        acceptanceRemark: ""
      }
    ]);
  };

  // Remove an entry
  const removeEntry = (index) => {
    if (entries.length > 1) {
      const updatedEntries = [...entries];
      updatedEntries.splice(index, 1);
      setEntries(updatedEntries);
    }
  };

  // Clear an entry (for the first row)
  const clearEntry = (index) => {
    const updatedEntries = [...entries];
    updatedEntries[index] = {
      poAnnexure: "",
      dateOfOrder: "",
      party: "",
      plNo: "",
      material: "",
      receivedQty: "",
      unit: "",
      acceptanceRemark: ""
    };
    setEntries(updatedEntries);
  };

  // Save the delivery memo
  const saveDeliveryMemo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Convert dates to yyyy-mm-dd format for API submission
      const formattedHeaderInfo = {
        ...headerInfo,
        date: formatDateToYYYYMMDD(headerInfo.date)
      };
      
      const formattedEntries = entries.map(entry => ({
        ...entry,
        dateOfOrder: formatDateToYYYYMMDD(entry.dateOfOrder)
      }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success modal
      setShowSuccessModal(true);
      toast.success("Delivery Memo saved successfully!");
    } catch (error) {
      console.error("Error saving delivery memo:", error);
      toast.error("Failed to save delivery memo");
    } finally {
      setSaving(false);
    }
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate("/povendor");
  };

  if (loading) {
    return (
      <Container fluid className="my-4">
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading PO data...</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <style>{dropdownStyles}</style>
      <Container fluid className="my-4">
        <Button
          className="add-customer-btn mb-3"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </Button>
        
        {/* First Card: PO Details - Similar to AnnextureForm */}
        <Card className="mb-4">
          <Card.Header>
            <Card.Title as="h4">Create Dispatch Order for PO: {poData?.po_no}</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>PO Number</Form.Label>
                  <Form.Control type="text" value={poData?.po_no} readOnly />
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="text" value={formatDateToDDMMYYYY(poData?.date)} readOnly />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>Vendor</Form.Label>
                  <Form.Control type="text" value={poData?.vendor_name} readOnly />
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>Project</Form.Label>
                  <Form.Control type="text" value={poData?.project_name} readOnly />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>Client Name</Form.Label>
                  <Form.Control type="text" value={poData?.client_name} readOnly />
                </Form.Group>
              </Col>
              <Col md="6">
                <Form.Group className="mb-3">
                  <Form.Label>Total Amount</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={`₹${Number(poData?.total_amt).toLocaleString('en-IN')}`} 
                    readOnly 
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        {/* Second Card: Delivery Memo Form */}
        <Card>
          <Card.Header>
            <Card.Title as="h4">Dispatch Details</Card.Title>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={saveDeliveryMemo}>
              {/* Header Information */}
              <Row className="mb-4">
                <Col md="12">
                  <h5 className="mb-3">Delivery Information</h5>
                </Col>
                <Col md="3">
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="text"
                      name="date"
                      value={headerInfo.date}
                      onChange={handleHeaderChange}
                      placeholder="DD-MM-YYYY"
                      pattern="^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$"
                      required
                    />
                  
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={headerInfo.location}
                      onChange={handleHeaderChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="mb-3">
                    <Form.Label>Vehicle No.</Form.Label>
                    <Form.Control
                      type="text"
                      name="vehicleNo"
                      value={headerInfo.vehicleNo}
                      onChange={handleHeaderChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      value={headerInfo.companyName}
                      onChange={handleHeaderChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md="3">
                  <Form.Group className="mb-3">
                    <Form.Label>LR No.</Form.Label>
                    <Form.Control
                      type="text"
                      name="lrNo"
                      value={headerInfo.lrNo}
                      onChange={handleHeaderChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Delivery Memo Entries */}
              <Row className="mb-4">
                <Col md="12" className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Delivery Items</h5>
                  <Button 
                    variant="dark" 
                    onClick={addEntry}
                  >
                    <FaPlus /> Add Delivery Items
                  </Button>
                </Col>
                <Col md="12">
                  <Table responsive striped hover className="mb-3">
                    <thead>
                      <tr>
                        <th style={{ width: "10%" }}>PO/Annexure</th>
                        <th style={{ width: "15%" }}>Date of Order</th>
                        <th style={{ width: "15%" }}>Party</th>
                        <th style={{ width: "10%" }}>PL NO</th>
                        <th style={{ width: "25%" }}>Material</th>
                        <th style={{ width: "10%" }}>Received Qty</th>
                        <th style={{ width: "5%" }}>Unit</th>
                        <th style={{ width: "10%" }}>Acce/Remark</th>
                        <th style={{ width: "5%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, index) => (
                        <tr key={index}>
                          <td>
                            <Form.Control
                              type="text"
                              name="poAnnexure"
                              value={entry.poAnnexure}
                              onChange={(e) => handleEntryChange(index, e)}
                              required
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              name="dateOfOrder"
                              value={entry.dateOfOrder}
                              onChange={(e) => handleEntryChange(index, e)}
                              placeholder="DD-MM-YYYY"
                              pattern="^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$"
                              required
                            />
                           
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              name="party"
                              value={entry.party}
                              onChange={(e) => handleEntryChange(index, e)}
                              required
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              name="plNo"
                              value={entry.plNo}
                              onChange={(e) => handleEntryChange(index, e)}
                              required
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              name="material"
                              value={entry.material}
                              onChange={(e) => handleEntryChange(index, e)}
                              required
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="receivedQty"
                              value={entry.receivedQty}
                              onChange={(e) => handleEntryChange(index, e)}
                              required
                            />
                          </td>
                          <td>
                            <div className="custom-dropdown">
                              <Form.Control
                                as="select"
                                name="unit"
                                value={entry.unit}
                                onChange={(e) => handleEntryChange(index, e)}
                                required
                              >
                                <option value="">Select Unit</option>
                                {mockUnits.map((unit) => (
                                  <option key={unit.unit_id} value={unit.unit}>
                                    {unit.unit}
                                  </option>
                                ))}
                              </Form.Control>
                            </div>
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              name="acceptanceRemark"
                              value={entry.acceptanceRemark}
                              onChange={(e) => handleEntryChange(index, e)}
                            />
                          </td>
                          <td>
                            {index === 0 ? (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => clearEntry(index)}
                                title="Clear fields"
                              >
                                <FaEraser />
                              </Button>
                            ) : (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeEntry(index)}
                                disabled={entries.length === 1}
                              >
                                <FaTrash />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end mt-4">
                <Button
                  variant="success"
                  type="submit"
                  disabled={saving}
                  style={{ backgroundColor: "#ed3131", border: "none" }}
                >
                  {saving ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" />
                      <span className="ms-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" />Save Dispatch
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
        
        {/* Success Modal */}
        <Modal show={showSuccessModal} centered onHide={handleSuccessModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Success</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Delivery Memo has been successfully created!
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleSuccessModalClose}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default DispatchForm;