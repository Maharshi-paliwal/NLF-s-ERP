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
import axios from "axios";

// Add API base URL
const API_BASE = "https://nlfs.in/erp/index.php/Api";

// Add custom CSS for dropdown arrows
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
  .challan-header {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 20px;
  }
  .challan-title {
    font-weight: bold;
    font-size: 1.5rem;
    text-align: center;
    margin-bottom: 20px;
  }
  .footer-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #dee2e6;
  }
  .file-upload-container {
    position: relative;
    display: inline-block;
    cursor: pointer;
    width: 100%;
  }
  .file-upload-input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  .file-upload-label {
    display: block;
    padding: 0.375rem 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    background-color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .file-upload-label:hover {
    background-color: #f8f9fa;
  }
`;

// Mock data for dropdowns
const mockUnits = [
  { unit_id: 1, unit: "Nos" },
  { unit_id: 2, unit: "Sqft" },
  { unit_id: 3, unit: "Sqm" },
  { unit_id: 4, unit: "Kg" },
  { unit_id: 5, unit: "RMT" }
];

const Dmemo = () => {
  const { po_id } = useParams();
  const navigate = useNavigate();
  
  // State for PO data
  const [poData, setPoData] = useState(null);
  const [poLoading, setPoLoading] = useState(true);
  const [poError, setPoError] = useState(null);
  
  // State for next delivery challan ID
  const [nextDmId, setNextDmId] = useState(null);
  const [dmIdLoading, setDmIdLoading] = useState(true);
  
  // State for delivery challan header information
  const [headerInfo, setHeaderInfo] = useState({
    deliveryChallanNo: "",
    customerGstin: "",
    customerName: "",
    customerAddress: "",
    state: "",
    code: "",
    vehicleNo: "",
    date: new Date().toISOString().split('T')[0],
    modeOfDespatch: "",
    destination: "",
    lrNo: "",
    termsOfDelivery: ""
  });
  
  // State for delivery challan entries
  const [entries, setEntries] = useState([
    {
      srNo: 1,
      descriptionOfGoods: "",
      hsnSac: "",
      qty: "",
      unit: "",
      rate: "",
      amount: ""
    }
  ]);
  
  // State for footer information
  const [footerInfo, setFooterInfo] = useState({
    totalAmount: "0.00",
    remarks: ""
  });
  
  // State for loading and saving
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    file1: null,
    file2: null
  });

  // Fetch next delivery challan ID
  useEffect(() => {
    const fetchNextDmId = async () => {
      try {
        setDmIdLoading(true);
        const response = await fetch('https://nlfs.in/erp/index.php/Nlf_Erp/get_next_dm_id');
        const data = await response.json();
        
        if (data.status === "true" && data.success === "1") {
          setNextDmId(data.next_id);
          setHeaderInfo(prev => ({
            ...prev,
            deliveryChallanNo: data.next_id
          }));
        } else {
          const timestamp = Date.now().toString().slice(-6);
          setNextDmId(timestamp);
          setHeaderInfo(prev => ({
            ...prev,
            deliveryChallanNo: timestamp
          }));
        }
      } catch (error) {
        console.error("Error fetching next DM ID:", error);
        const timestamp = Date.now().toString().slice(-6);
        setNextDmId(timestamp);
        setHeaderInfo(prev => ({
          ...prev,
          deliveryChallanNo: timestamp
        }));
      } finally {
        setDmIdLoading(false);
      }
    };

    fetchNextDmId();
  }, []);

  // Fetch PO data based on po_id
  useEffect(() => {
    const fetchPoData = async () => {
      if (!po_id) {
        setPoError("No PO ID provided");
        setPoLoading(false);
        setLoading(false);
        return;
      }

      try {
        setPoLoading(true);
        console.log("Fetching PO data for ID:", po_id);
        
        let res;
        
        try {
          const formData = new FormData();
          formData.append('po_id', String(po_id));
          console.log("Method 1: POST with FormData");
          
          res = await axios.post(`${API_BASE}/get_po_id`, formData);
          console.log("Method 1 Response:", res.data);
          
          if (String(res.data?.success) === "0" || res.data?.message?.includes("required")) {
            throw new Error("Method 1 failed");
          }
        } catch (err) {
          console.log("Method 1 failed, trying Method 2...");
          
          try {
            console.log("Method 2: GET with query params");
            res = await axios.get(`${API_BASE}/get_po_id`, {
              params: { po_id: po_id }
            });
            console.log("Method 2 Response:", res.data);
            
            if (String(res.data?.success) === "0" || res.data?.message?.includes("required")) {
              throw new Error("Method 2 failed");
            }
          } catch (err2) {
            console.log("Method 2 failed, trying Method 3...");
            
            console.log("Method 3: POST with JSON");
            res = await axios.post(`${API_BASE}/get_po_id`, { po_id: po_id });
            console.log("Method 3 Response:", res.data);
          }
        }

        console.log("Full API Response:", res.data);

        const isSuccess = String(res.data?.success) === "1" || 
                         String(res.data?.status) === "true" || 
                         res.data?.success === 1;
        
        console.log("Is Success?", isSuccess);

        if (isSuccess && res.data?.data) {
          const data = res.data.data || {};
          console.log("PO Data received:", data);
          setPoData(data);
          setPoError(null);
        } else {
          const errorMsg = res.data?.message || "Failed to fetch Purchase Order details";
          console.log("Error:", errorMsg);
          setPoError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        console.error("Error fetching PO data:", error);
        const errorMsg = error.response?.data?.message || "Error loading Purchase Order details";
        setPoError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setPoLoading(false);
        setLoading(false);
      }
    };

    fetchPoData();
  }, [po_id]);

  // Calculate total amount whenever entries change
  useEffect(() => {
    const calculateTotal = () => {
      const total = entries.reduce((sum, entry) => {
        const amount = parseFloat(entry.amount) || 0;
        return sum + amount;
      }, 0);
      
      setFooterInfo(prev => ({
        ...prev,
        totalAmount: total.toFixed(2)
      }));
    };
    
    calculateTotal();
  }, [entries]);

  const handleFileChange = (e, fileKey) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [fileKey]: file
      }));
    }
  };

  // Handle input change for header info
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeaderInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input change for footer info
  const handleFooterChange = (e) => {
    const { name, value } = e.target;
    setFooterInfo(prev => ({
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
    
    // Calculate amount if qty and rate are available
    if (name === "qty" || name === "rate") {
      const qty = parseFloat(updatedEntries[index].qty) || 0;
      const rate = parseFloat(updatedEntries[index].rate) || 0;
      updatedEntries[index].amount = (qty * rate).toFixed(2);
    }
    
    setEntries(updatedEntries);
  };

  // Clear first entry fields
  const clearFirstEntry = () => {
    const updatedEntries = [...entries];
    updatedEntries[0] = {
      ...updatedEntries[0],
      descriptionOfGoods: "",
      hsnSac: "",
      qty: "",
      unit: "",
      rate: "",
      amount: ""
    };
    setEntries(updatedEntries);
  };

  // Add a new entry
  const addEntry = () => {
    setEntries([
      ...entries,
      {
        srNo: entries.length + 1,
        descriptionOfGoods: "",
        hsnSac: "",
        qty: "",
        unit: "",
        rate: "",
        amount: ""
      }
    ]);
  };

  // Remove an entry
  const removeEntry = (index) => {
    if (entries.length > 1) {
      const updatedEntries = [...entries];
      updatedEntries.splice(index, 1);
      // Update serial numbers
      updatedEntries.forEach((entry, i) => {
        entry.srNo = i + 1;
      });
      setEntries(updatedEntries);
    }
  };

  // Save the delivery challan with improved error handling
  const saveDeliveryChallan = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Create FormData object for the API request
      const formData = new FormData();
      
      // Add header information to FormData
      formData.append('delivery_challan_no', headerInfo.deliveryChallanNo);
      formData.append('date', headerInfo.date);
      formData.append('mode_dispatch', headerInfo.modeOfDespatch);
      formData.append('vehicle_no', headerInfo.vehicleNo);
      formData.append('destination', headerInfo.destination);
      formData.append('lr_no', headerInfo.lrNo);
      formData.append('terms_of_delivery', headerInfo.termsOfDelivery);
      
      // Add items as JSON string
      const itemsData = entries.map(entry => ({
        sr_no: entry.srNo,
        description_of_goods: entry.descriptionOfGoods,
        hsn_sac: entry.hsnSac,
        qty: entry.qty,
        unit: entry.unit,
        rate: entry.rate,
        amount: entry.amount
      }));
      formData.append('items', JSON.stringify(itemsData));
      
      // Add file if uploaded
      if (uploadedFiles.file1) {
        formData.append('packing_list', uploadedFiles.file1);
      }
      
      console.log("Sending FormData with:", {
        delivery_challan_no: headerInfo.deliveryChallanNo,
        date: headerInfo.date,
        items_count: itemsData.length,
        has_file: !!uploadedFiles.file1
      });
      
      // Make the API call
      const response = await fetch('https://nlfs.in/erp/index.php/Nlf_Erp/add_dm', {
        method: 'POST',
        body: formData
      });
      
      // Get the raw response text first
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      // Check if response is empty
      if (!responseText) {
        throw new Error('Server returned empty response');
      }
      
      // Try to parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Response text:", responseText);
        throw new Error('Invalid JSON response from server. Check console for details.');
      }
      
      console.log("Parsed data:", data);
      
      if (data.status === "true" && data.success === "1") {
        // Show success modal
        setShowSuccessModal(true);
        toast.success("Delivery Challan saved successfully!");
      } else {
        throw new Error(data.message || 'Failed to save delivery challan');
      }
    } catch (error) {
      console.error("Error saving delivery challan:", error);
      toast.error(error.message || "Failed to save delivery challan");
    } finally {
      setSaving(false);
    }
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate("/povendor");
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || poLoading || dmIdLoading) {
    return (
      <Container fluid className="my-4">
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading data...</p>
        </div>
      </Container>
    );
  }

  if (poError) {
    return (
      <Container fluid className="my-4">
        <Row>
          <Col md="12">
            <Alert variant="danger">
              {poError}
            </Alert>
            <Button onClick={() => navigate(-1)} variant="primary">
              <FaArrowLeft className="me-2" />
              Back to PO List
            </Button>
          </Col>
        </Row>
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
        
        {/* Delivery Challan Form */}
        <Card>
          <Card.Body>
            <Form onSubmit={saveDeliveryChallan}>
              {/* Header Section */}
              <div>
                <div className="challan-title">DELIVERY MEMO</div>
                <Row>
                  <Col md="4">
                    <Form.Group className="mb-3">
                      <Form.Label>PO Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={poData?.po_no || "N/A"}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="4">
                    <Form.Group className="mb-3">
                      <Form.Label>Delivery Challan No</Form.Label>
                      <Form.Control
                        type="text"
                        name="deliveryChallanNo"
                        value={headerInfo.deliveryChallanNo}
                        onChange={handleHeaderChange}
                        required
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="4">
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={headerInfo.date}
                        onChange={handleHeaderChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Company</Form.Label>
                      <Form.Control
                        type="text"
                        value={poData?.company || "N/A"}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>PO Date</Form.Label>
                      <Form.Control
                        type="text"
                        value={formatDate(poData?.date)}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="4">
                    <Form.Group className="mb-3">
                      <Form.Label>Mode/Despatch</Form.Label>
                      <Form.Control
                        type="text"
                        name="modeOfDespatch"
                        value={headerInfo.modeOfDespatch}
                        onChange={handleHeaderChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="4">
                    <Form.Group className="mb-3">
                      <Form.Label>Vehicle No</Form.Label>
                      <Form.Control
                        type="text"
                        name="vehicleNo"
                        value={headerInfo.vehicleNo}
                        onChange={handleHeaderChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="4">
                    <Form.Group className="mb-3">
                      <Form.Label>Destination</Form.Label>
                      <Form.Control
                        type="text"
                        name="destination"
                        value={headerInfo.destination}
                        onChange={handleHeaderChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>L.R. No.</Form.Label>
                      <Form.Control
                        type="text"
                        name="lrNo"
                        value={headerInfo.lrNo}
                        onChange={handleHeaderChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Terms of Delivery</Form.Label>
                      <Form.Control
                        type="text"
                        name="termsOfDelivery"
                        value={headerInfo.termsOfDelivery}
                        onChange={handleHeaderChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Upload Packing List</Form.Label>
                      <div className="file-upload-container">
                        <input
                          type="file"
                          className="file-upload-input"
                          onChange={(e) => handleFileChange(e, 'file1')}
                          accept=".pdf"
                        />
                        <label className="file-upload-label">
                          {uploadedFiles.file1 ? uploadedFiles.file1.name : "Choose file..."}
                        </label>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Delivery Challan Items Table */}
              <Row className="mb-4">
                <Col md="12" className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Items</h5>
                  <Button 
                    variant="dark" 
                    onClick={addEntry}
                    type="button"
                  >
                    <FaPlus /> Add Memo
                  </Button>
                </Col>
                <Col md="12">
                  <Table responsive striped hover className="mb-3">
                    <thead>
                      <tr>
                        <th style={{ width: "5%" }}>Sr No</th>
                        <th style={{ width: "25%" }}>Description of Goods</th>
                        <th style={{ width: "10%" }}>HSN/SAC</th>
                        <th style={{ width: "10%" }}>Qty</th>
                        <th style={{ width: "10%" }}>Unit</th>
                        <th style={{ width: "10%" }}>Rate</th>
                        <th style={{ width: "10%" }}>Amount</th>
                        <th style={{ width: "5%" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, index) => (
                        <tr key={index}>
                          <td>
                            <Form.Control
                              type="text"
                              name="srNo"
                              value={entry.srNo}
                              onChange={(e) => handleEntryChange(index, e)}
                              readOnly
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              name="descriptionOfGoods"
                              value={entry.descriptionOfGoods}
                              onChange={(e) => handleEntryChange(index, e)}
                              required
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              name="hsnSac"
                              value={entry.hsnSac}
                              onChange={(e) => handleEntryChange(index, e)}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              step="0.01"
                              name="qty"
                              value={entry.qty}
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
                              type="number"
                              step="0.01"
                              name="rate"
                              value={entry.rate}
                              onChange={(e) => handleEntryChange(index, e)}
                              required
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              name="amount"
                              value={entry.amount}
                              readOnly
                            />
                          </td>
                          <td>
                            {index === 0 ? (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={clearFirstEntry}
                                title="Clear fields"
                                type="button"
                              >
                                <FaEraser />
                              </Button>
                            ) : (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeEntry(index)}
                                type="button"
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
              
              {/* Footer Section */}
              <div className="footer-section">
                <Row className="justify-content-end">
                  <Col md="3">
                    <Form.Group as={Row} className="align-items-center mb-3">
                      <Form.Label column sm="5" className="text-end">
                        Total Amount
                      </Form.Label>
                      <Col sm="7">
                        <Form.Control
                          type="text"
                          name="totalAmount"
                          value={footerInfo.totalAmount}
                          readOnly
                          className="text-end"
                          style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}
                        />
                      </Col>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

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
                      <FaSave /> Save
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
            Delivery Challan has been successfully created!
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

export default Dmemo;