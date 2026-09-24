import React, { useState, useEffect, useMemo } from "react";
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
  Form,
  Tabs,
  Tab,
  Modal,
} from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint, FaEdit, FaSave, FaPlus, FaMinus, FaTrash, FaEraser } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE = "https://nlfs.in/erp/index.php/Api";

// Custom CSS for dropdown arrows
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
  
  /* Custom styles for radio buttons */
  .table-type-selector {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .radio-option {
    display: inline-flex;
    align-items: center;
    margin-right: 20px;
    margin-bottom: 10px;
  }
  
  .radio-option input[type="radio"] {
    margin-right: 8px;
  }
  
  .radio-option label {
    margin: 0;
    font-weight: 500;
    cursor: pointer;
  }
`;

const AnnexureForm = () => {
  const { poId } = useParams();
  const navigate = useNavigate();
  const [poData, setPoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [totals, setTotals] = useState({
    totalItems: 0,
    itemsTotal: 0,
    gst: 0,
    grandTotalWithGST: 0,
  });
  const [latestAnnexure, setLatestAnnexure] = useState(null);
  
  // State for table type selection
  const [selectedTableType, setSelectedTableType] = useState("rmt"); // Default to "rmt"

  const annexureMode = useMemo(() => {
    if (!latestAnnexure) {
      return {
        canCreate: true,
        isLocked: false,
        label: "Create Annexure (A1)"
      };
    }

    if (latestAnnexure.design_approval === "Yes") {
      return {
        canCreate: true,
        isLocked: false,
        label: "Create Revision"
      };
    }

    return {
      canCreate: false,
      isLocked: true,
      label: `Revision ${latestAnnexure.revise} (Pending Approval)`
    };
  }, [latestAnnexure]);

  const isAnnexureEditable =
    !latestAnnexure || latestAnnexure.design_approval === "Yes";

  const [annexureItems, setAnnexureItems] = useState([
    {
      srNo: 1,
      description: "",
      length: "", // Panel Length
      quantity: "",
      area: "",
      unit: "",
      module: "", // Module
      rmt: "",
      sqm: "",
      amount: ""
    }
  ]);

  // State for annexure items - updated to match the image structure
  const buildAnnexureArray = () => {
    return annexureItems
      .filter(item => item.description?.trim())
      .map(item => ({
        sr_no: String(item.srNo),
        description: String(item.description),
        length: String(item.length || ""), // Panel Length
        quantity: String(item.quantity || "0"),
        area: String(item.area || "0"),
        unit: String(item.unit || ""),
        module: String(item.module || ""), // Module
        rmt: String(item.rmt || ""),
        sqm: String(item.sqm || ""),
        amount: String(item.amount || "0")
      }));
  };

  // State for annexure totals
  const [annexureTotals, setAnnexureTotals] = useState({
    subTotal: "0.00",
    gst: "0.00",
    grandTotal: "0.00"
  });

  // Fetch PO data by ID
  useEffect(() => {
    const fetchPoData = async () => {
      if (!poId) {
        setError("No PO ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching PO data for ID:", poId);
        console.log("PO ID type:", typeof poId);
        
        let res;
        
        // Method 1: Try POST with FormData (most common for PHP)
        try {
          const formData = new FormData();
          formData.append('po_id', String(poId));
          console.log("Method 1: POST with FormData");
          
          res = await axios.post(`${API_BASE}/get_po_id`, formData);
          console.log("Method 1 Response:", res.data);
          
          if (String(res.data?.success) === "0" || res.data?.message?.includes("required")) {
            throw new Error("Method 1 failed");
          }
        } catch (err) {
          console.log("Method 1 failed, trying Method 2...");
          
          // Method 2: Try GET with query params
          try {
            console.log("Method 2: GET with query params");
            res = await axios.get(`${API_BASE}/get_po_id`, {
              params: { po_id: poId }
            });
            console.log("Method 2 Response:", res.data);
            
            if (String(res.data?.success) === "0" || res.data?.message?.includes("required")) {
              throw new Error("Method 2 failed");
            }
          } catch (err2) {
            console.log("Method 2 failed, trying Method 3...");
            
            // Method 3: Try POST with JSON
            console.log("Method 3: POST with JSON");
            res = await axios.post(`${API_BASE}/get_po_id`, { po_id: poId });
            console.log("Method 3 Response:", res.data);
          }
        }

        console.log("Full API Response:", res.data);
        console.log("Success value:", res.data?.success, "Type:", typeof res.data?.success);
        console.log("Status value:", res.data?.status, "Type:", typeof res.data?.status);

        // Check both success and status fields
        const isSuccess = String(res.data?.success) === "1" || 
                         String(res.data?.status) === "true" || 
                         res.data?.success === 1;
        
        console.log("Is Success?", isSuccess);

        if (isSuccess && res.data?.data) {
          const data = res.data.data || {};
          console.log("PO Data received:", data); // Debug log
          setPoData(data);
          setFormData(data);
          setError(null);
        } else {
          const errorMsg = res.data?.message || "Failed to fetch Purchase Order details";
          console.log("Error:", errorMsg);
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        console.error("Error fetching PO data:", error);
        const errorMsg = error.response?.data?.message || "Error loading Purchase Order details";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchPoData();
  }, [poId]);

  useEffect(() => {
    if (!poId) return;

    const fetchLatestAnnexure = async () => {
      try {
        const res = await axios.post(
          "https://nlfs.in/erp/index.php/Nlf_Erp/get_annexure_by_po",
          { po_id: poId }
        );

        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          // assume backend sends latest first
          setLatestAnnexure(res.data.data[0]);
        }
      } catch (err) {
        console.log("No annexure found yet for this PO");
      }
    };

    fetchLatestAnnexure();
  }, [poId]);

  useEffect(() => {
    if (latestAnnexure && latestAnnexure.design_approval === "Yes") {
      setAnnexureItems(
        latestAnnexure.annexure.map((a, i) => ({
          srNo: i + 1,
          description: a.description,
          length: a.length || "", // Panel Length
          quantity: a.quantity,
          area: a.area,
          unit: a.unit || "",
          module: a.module || "", // Module
          rmt: a.rmt || "",
          sqm: a.sqm || "",
          amount: a.amount
        }))
      );
      // Set the table type based on the existing annexure
      if (latestAnnexure.table_type) {
        setSelectedTableType(latestAnnexure.table_type);
      }
    }
  }, [latestAnnexure]);

  // Calculate totals
  useEffect(() => {
    if (poData && poData.items) {
      const itemsTotal = poData.items.reduce((sum, item) => {
        // Using "amt" instead of "total" as per API response
        const total = parseFloat(item.amt) || (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
        return sum + total;
      }, 0);

      const gst = itemsTotal * (parseFloat(poData.gst) || 0) / 100;

      setTotals({
        totalItems: poData.items.length,
        itemsTotal,
        gst,
        grandTotalWithGST: itemsTotal + gst,
      });
    }
  }, [poData]);

  // Calculate annexure totals
  useEffect(() => {
    const calculateTotals = () => {
      const subTotal = annexureItems.reduce((sum, item) => {
        const amount = parseFloat(item.amount) || 0;
        return sum + amount;
      }, 0);
      
      const gstRate = 0.18; // 18% GST as shown in the image
      const gstAmount = subTotal * gstRate;
      const grandTotal = subTotal + gstAmount;
      
      setAnnexureTotals({
        subTotal: subTotal.toFixed(2),
        gst: gstRate === 0 ? "0.00" : gstAmount.toFixed(2),
        grandTotal: grandTotal.toFixed(2)
      });
    };
    
    calculateTotals();
  }, [annexureItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleItemChange = (index, field, value) => {
    if (!editMode) return;
    
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Recalculate amt if quantity or rate changed
    if (field === "qty" || field === "rate") {
      const qty = parseFloat(updatedItems[index].qty) || 0;
      const rate = parseFloat(updatedItems[index].rate) || 0;
      updatedItems[index].amt = (qty * rate).toString();
      // Also update total field if it exists
      updatedItems[index].total = updatedItems[index].amt;
    }
    
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const handleInstallationChange = (index, field, value) => {
    if (!editMode) return;
    
    const updatedItems = [...formData.items];
    
    // Using flat structure with "inst_" prefix as per API response
    const instField = `inst_${field}`;
    updatedItems[index] = {
      ...updatedItems[index],
      [instField]: value
    };
    
    // Recalculate inst_amt if quantity or rate changed
    if (field === "qty" || field === "rate") {
      const qty = parseFloat(updatedItems[index].inst_qty) || 0;
      const rate = parseFloat(updatedItems[index].inst_rate) || 0;
      updatedItems[index].inst_amt = (qty * rate).toString();
    }
    
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  // Handle input change for annexure items with updated calculation logic
  const handleAnnexureItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...annexureItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: value
    };
    
    // Calculate based on table type
    if (selectedTableType === "rmt") {
      // For RMT table: 
      // 1. Panel Length × Quantity = RMT
      // 2. RMT × Module = SQM
      // 3. Amount = SQM × Rate (assuming rate is calculated elsewhere)
      
      if (name === "length" || name === "quantity") {
        // Calculate RMT = Panel Length × Quantity
        const length = parseFloat(updatedItems[index].length) || 0;
        const quantity = parseFloat(updatedItems[index].quantity) || 0;
        updatedItems[index].rmt = (length * quantity).toFixed(2);
        
        // Calculate SQM = RMT × Module
        const module = parseFloat(updatedItems[index].module) || 0;
        const rmt = parseFloat(updatedItems[index].rmt) || 0;
        updatedItems[index].sqm = (rmt * module).toFixed(2);
        
        // For now, let's assume Amount = SQM × 1000 (as a placeholder rate)
        // This should be adjusted based on your business logic
        const sqm = parseFloat(updatedItems[index].sqm) || 0;
        updatedItems[index].amount = (sqm * 1000).toFixed(2);
      } else if (name === "module") {
        // Recalculate SQM = RMT × Module
        const module = parseFloat(updatedItems[index].module) || 0;
        const rmt = parseFloat(updatedItems[index].rmt) || 0;
        updatedItems[index].sqm = (rmt * module).toFixed(2);
        
        // Recalculate Amount = SQM × 1000 (placeholder rate)
        const sqm = parseFloat(updatedItems[index].sqm) || 0;
        updatedItems[index].amount = (sqm * 1000).toFixed(2);
      } else if (name === "rmt") {
        // Recalculate SQM = RMT × Module
        const module = parseFloat(updatedItems[index].module) || 0;
        const rmt = parseFloat(updatedItems[index].rmt) || 0;
        updatedItems[index].sqm = (rmt * module).toFixed(2);
        
        // Recalculate Amount = SQM × 1000 (placeholder rate)
        const sqm = parseFloat(updatedItems[index].sqm) || 0;
        updatedItems[index].amount = (sqm * 1000).toFixed(2);
      }
    } else if (selectedTableType === "sqm_and_rmt") {
      // For RMT and SQM table: 
      // 1. Panel Length × Quantity = RMT
      // 2. RMT × Module = SQM
      // 3. Amount = SQM × Rate (assuming rate is calculated elsewhere)
      
      if (name === "length" || name === "quantity") {
        // Calculate RMT = Panel Length × Quantity
        const length = parseFloat(updatedItems[index].length) || 0;
        const quantity = parseFloat(updatedItems[index].quantity) || 0;
        updatedItems[index].rmt = (length * quantity).toFixed(2);
        
        // Calculate SQM = RMT × Module
        const module = parseFloat(updatedItems[index].module) || 0;
        const rmt = parseFloat(updatedItems[index].rmt) || 0;
        updatedItems[index].sqm = (rmt * module).toFixed(2);
        
        // For now, let's assume Amount = SQM × 1000 (as a placeholder rate)
        const sqm = parseFloat(updatedItems[index].sqm) || 0;
        updatedItems[index].amount = (sqm * 1000).toFixed(2);
      } else if (name === "module") {
        // Recalculate SQM = RMT × Module
        const module = parseFloat(updatedItems[index].module) || 0;
        const rmt = parseFloat(updatedItems[index].rmt) || 0;
        updatedItems[index].sqm = (rmt * module).toFixed(2);
        
        // Recalculate Amount = SQM × 1000 (placeholder rate)
        const sqm = parseFloat(updatedItems[index].sqm) || 0;
        updatedItems[index].amount = (sqm * 1000).toFixed(2);
      } else if (name === "rmt") {
        // Recalculate SQM = RMT × Module
        const module = parseFloat(updatedItems[index].module) || 0;
        const rmt = parseFloat(updatedItems[index].rmt) || 0;
        updatedItems[index].sqm = (rmt * module).toFixed(2);
        
        // Recalculate Amount = SQM × 1000 (placeholder rate)
        const sqm = parseFloat(updatedItems[index].sqm) || 0;
        updatedItems[index].amount = (sqm * 1000).toFixed(2);
      }
    } else if (selectedTableType === "common") {
      if (name === "quantity" || name === "area") {
        const quantity = parseFloat(updatedItems[index].quantity) || 0;
        const area = parseFloat(updatedItems[index].area) || 0;
        // Assuming rate calculation based on quantity and area
        const rate = 100; // Default rate, should be configurable
        updatedItems[index].amount = (quantity * area * rate).toFixed(2);
      }
    }
    
    setAnnexureItems(updatedItems);
  };

  // Clear first annexure item
  const clearFirstAnnexureItem = () => {
    const updatedItems = [...annexureItems];
    updatedItems[0] = {
      ...updatedItems[0],
      description: "",
      length: "", // Panel Length
      quantity: "",
      area: "",
      unit: "",
      module: "", // Module
      rmt: "",
      sqm: "",
      amount: ""
    };
    setAnnexureItems(updatedItems);
  };

  // Add a new annexure item
  const addAnnexureItem = () => {
    setAnnexureItems([
      ...annexureItems,
      {
        srNo: annexureItems.length + 1,
        description: "",
        length: "", // Panel Length
        quantity: "",
        area: "",
        unit: "",
        module: "", // Module
        rmt: "",
        sqm: "",
        amount: ""
      }
    ]);
  };

  // Remove an annexure item
  const removeAnnexureItem = (index) => {
    if (annexureItems.length > 1) {
      const updatedItems = [...annexureItems];
      updatedItems.splice(index, 1);
      // Update serial numbers
      updatedItems.forEach((item, i) => {
        item.srNo = i + 1;
      });
      setAnnexureItems(updatedItems);
    }
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

  const handleGoBack = () => {
    navigate(-1); // Navigates back one step in history
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

  // Handle table type selection
  const handleTableTypeChange = (type) => {
    setSelectedTableType(type);
  };

  const buildAnnexurePayload = () => {
    return {
      annexure_no: poData.po_no,
      status: "initial",
      po_id: poData.po_no,
      // Use client_name from the API response
      client_name: String(poData.client_name || poData.contact_person || ""),  
      revise: "A1",
      design_approval: "No",
      annexure_approval: "",
      vendor: String(poData.company || ""),  
      project: String(poData.project || ""),
      date: new Date().toISOString().split("T")[0],
      total_amount: String(annexureTotals.grandTotal),
      table_type: selectedTableType, // Add table type to payload
      
      items: poData.items.map(item => ({
        brand: String(item.brand),
        product: String(item.product),
        sub_product: String(item.sub_product),
        desc: String(item.desc),
        unit: String(item.unit),
        qty: String(item.qty),
        rate: String(item.rate),
        amt: String(item.amt),
        inst_unit: String(item.inst_unit),
        inst_qty: String(item.inst_qty || "0"),
        inst_rate: String(item.inst_rate || "0"),
        inst_amt: String(item.inst_amt || "0"),
        total: String(item.total || item.amt)
      })),

      annexure: buildAnnexureArray()
    };
  };

  const handleSaveAnnexure = async () => {
    if (!annexureItems.some(i => i.description.trim())) {
      toast.error("Please add at least one annexure item");
      return;
    }

    try {
      setLoading(true);

      const payload = buildAnnexurePayload();
      console.log("Annexure Payload:", payload);

      const res = await axios.post(
        "https://nlfs.in/erp/index.php/Nlf_Erp/add_annexure",
        payload
      );
      console.log("Add Annexure Response:", res.data);

      const isSuccess =
        res.data?.status === true ||
        res.data?.status === "true" ||
        res.data?.success === 1 ||
        res.data?.success === "1";

      if (isSuccess) {
        toast.success("Annexure added successfully");
        // Navigate back to the parent page after successful save
        setTimeout(() => {
          navigate(-1);
        }, 1000); // Wait 1 second to show the toast notification
      } else {
        toast.error(res.data?.message || "Failed to save annexure");
      }
    } catch (err) {
      console.error("Add Annexure Error:", err);
      toast.error("Server error while saving annexure");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" />
        <span className="ms-3">Loading Purchase Order...</span>
      </Container>
    );
  }

  if (error || !poData) {
    return (
      <Container fluid>
        <Row>
          <Col md="12">
            <Alert variant="danger">
              {error || "No data found for this Purchase Order"}
            </Alert>
            <Button onClick={handleGoBack} variant="primary">
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
        <Button className="mb-3 btn btn-primary" style={{ backgroundColor: "rgb(237, 49, 49)", border: "none" }} onClick={handleGoBack}>
          <FaArrowLeft />
        </Button>

        <Row>
          {/* Header Card */}
          <Col md="12">
            <Card className="mb-4">
              <Card.Header style={{ backgroundColor: "#2c3e50" }}>
                <Card.Title as="h4" >
                  Purchase Order Annexure
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>PO Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="po_no"
                        value={poData.po_no || "N/A"}
                        readOnly
                        disabled={!isAnnexureEditable}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>PO Date</Form.Label>
                      <Form.Control
                        type="text"
                        value={formatDate(poData.date)}
                        readOnly
                        disabled={!isAnnexureEditable}
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
                        name="company"
                        value={editMode ? (formData.company || "") : (poData.company || "N/A")}
                        onChange={handleInputChange}
                        readOnly={!editMode}
                        disabled={!isAnnexureEditable}
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Client Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="client_name"
                        // Use client_name from the API response, fallback to contact_person if not available
                        value={editMode ? (formData.client_name || "") : (poData.client_name || poData.contact_person || "N/A")}
                        onChange={handleInputChange}
                        readOnly={!editMode}
                        disabled={!isAnnexureEditable}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Order Items Card with Tabs */}
          <Col md="12">
            <Card className="mb-4">
              <Card.Header style={{ backgroundColor: "#34495e" }}>
                <Card.Title as="h5" style={{ color: "white", margin: 0 }}>
                  Order Items ({poData.items ? poData.items.length : 0})
                </Card.Title>
              </Card.Header>
              <Card.Body>
                {poData.items && poData.items.length > 0 ? (
                  <Tabs 
                    activeKey={activeTab} 
                    onSelect={(k) => setActiveTab(parseInt(k))}
                    className="mb-3"
                  >
                    {poData.items.map((item, index) => (
                      <Tab 
                        eventKey={index} 
                        title={item.brand || 'Item'} 
                        key={index}
                      >
                        <Row>
                          <Col md={12}>
                            <Card className="mb-3">
                              <Card.Header as="h5">Product</Card.Header>
                              <Card.Body>
                                <Row>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Brand</Form.Label>
                                      <Form.Select
                                        value={editMode ? (formData.items[index]?.brand || "") : (item.brand || "")}
                                        onChange={(e) => handleItemChange(index, "brand", e.target.value)}
                                        disabled={!editMode}
                                      >
                                        <option value="">{item.brand || "Select Brand"}</option>
                                        {/* Brand options would go here */}
                                      </Form.Select>
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Product</Form.Label>
                                      <Form.Select
                                        value={editMode ? (formData.items[index]?.product || "") : (item.product || "")}
                                        onChange={(e) => handleItemChange(index, "product", e.target.value)}
                                        disabled={!editMode}
                                      >
                                        <option value="">{item.product || "Select Product"}</option>
                                        {/* Product options would go here */}
                                      </Form.Select>
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Sub Product</Form.Label>
                                      <Form.Select
                                        value={editMode ? (formData.items[index]?.sub_product || "") : (item.sub_product || "")}
                                        onChange={(e) => handleItemChange(index, "sub_product", e.target.value)}
                                        disabled={!editMode}
                                      >
                                        <option value="">{item.sub_product || "Select Sub Product"}</option>
                                        {/* Sub Product options would go here */}
                                      </Form.Select>
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Unit</Form.Label>
                                      <Form.Select
                                        value={editMode ? (formData.items[index]?.unit || "") : (item.unit || "")}
                                        onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                                        disabled={!editMode}
                                      >
                                        <option value="">{item.unit || "Select Unit"}</option>
                                        {/* Unit options would go here */}
                                      </Form.Select>
                                    </Form.Group>
                                  </Col>
                                  <Col md={9}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Description</Form.Label>
                                      <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={editMode ? (formData.items[index]?.desc || "") : (item.desc || "")}
                                        onChange={(e) => handleItemChange(index, "desc", e.target.value)}
                                        readOnly={!editMode}
                                        disabled={!isAnnexureEditable}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={3}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Quantity</Form.Label>
                                      <Form.Control
                                        type="number"
                                        value={editMode ? (formData.items[index]?.qty || "") : (item.qty || "0")}
                                        onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                                        readOnly={!editMode}
                                        disabled={!isAnnexureEditable}
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={12}>
                            <Card className="mb-3">
                              <Card.Header as="h5">Installation</Card.Header>
                              <Card.Body>
                                <Row>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Unit</Form.Label>
                                      <Form.Select
                                        value={editMode ? (formData.items[index]?.inst_unit || "") : (item.inst_unit || "")}
                                        onChange={(e) => handleInstallationChange(index, "unit", e.target.value)}
                                        disabled={!editMode}
                                      >
                                        <option value="">{item.inst_unit || "Select Unit"}</option>
                                        {/* Unit options would go here */}
                                      </Form.Select>
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Quantity</Form.Label>
                                      <Form.Control
                                        type="number"
                                        value={editMode ? (formData.items[index]?.inst_qty || "") : (item.inst_qty || "0")}
                                        onChange={(e) => handleInstallationChange(index, "qty", e.target.value)}
                                        readOnly={!editMode}
                                        disabled={!isAnnexureEditable}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Rate</Form.Label>
                                      <Form.Control
                                        type="number"
                                        value={editMode ? (formData.items[index]?.inst_rate || "") : (item.inst_rate || "0")}
                                        onChange={(e) => handleInstallationChange(index, "rate", e.target.value)}
                                        readOnly={!editMode}
                                        disabled={!isAnnexureEditable}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Amount</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={formatCurrency(editMode ? (formData.items[index]?.inst_amt || 0) : (item.inst_amt || 0))}
                                        readOnly
                                        disabled={!isAnnexureEditable}
                                      />
                                    </Form.Group>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      </Tab>
                    ))}
                  </Tabs>
                ) : (
                  <div className="text-center">No items found</div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Annexure Creation Card */}
          <Col md="12">
            <Card className="mb-4">
              <Card.Header style={{ backgroundColor: "#34495e" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <Card.Title as="h5" style={{ color: "white", margin: 0 }}>
                    Create Annexure
                  </Card.Title>

                  {latestAnnexure && (
                    <Badge
                      bg={latestAnnexure.design_approval === "Yes" ? "success" : "warning"}
                    >
                      {latestAnnexure.revise} –{" "}
                      {latestAnnexure.design_approval === "Yes"
                        ? "Approved"
                        : "Pending Approval"}
                    </Badge>
                  )}
                </div>
              </Card.Header>

              <Card.Body>
                {/* Table Type Selection with Radio Buttons */}
                <div className="table-type-selector">
                  <h5 className="mb-3">Select Table Type</h5>
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="rmt"
                      name="tableType"
                      value="rmt"
                      checked={selectedTableType === "rmt"}
                      onChange={() => handleTableTypeChange("rmt")}
                    />
                    <label htmlFor="rmt">RMT</label>
                  </div>
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="sqm_and_rmt"
                      name="tableType"
                      value="sqm_and_rmt"
                      checked={selectedTableType === "sqm_and_rmt"}
                      onChange={() => handleTableTypeChange("sqm_and_rmt")}
                    />
                    <label htmlFor="sqm_and_rmt">SQM and RMT</label>
                  </div>
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="common"
                      name="tableType"
                      value="common"
                      checked={selectedTableType === "common"}
                      onChange={() => handleTableTypeChange("common")}
                    />
                    <label htmlFor="common">Common</label>
                  </div>
                </div>

                {/* Annexure Table - Always visible */}
                <Row className="mb-4">
                  <Col md="12" className="d-flex justify-content-between align-items-center mb-3">
                    <h5>
                      Annexure Items - {selectedTableType === "rmt" ? "RMT" : 
                                         selectedTableType === "sqm_and_rmt" ? "SQM and RMT" : 
                                         "Common"} Table
                    </h5>
                    <Button 
                      variant="dark" 
                      onClick={addAnnexureItem}
                      disabled={!isAnnexureEditable}
                      style={{ backgroundColor: "#ed3131", border: "none" }}
                    >
                      <FaPlus /> Add Annexure Item
                    </Button>
                  </Col>
                  <Col md="12">
                  <Table responsive striped hover className="mb-3">
  <thead>
    <tr>
      <th style={{ width: selectedTableType === "common" ? "6%" : "5%" }}>S.No</th>
      <th style={{ width: selectedTableType === "common" ? "35%" : "25%" }}>Description</th>
      <th style={{ width: selectedTableType === "common" ? "12%" : "10%" }}>Panel Length(mm)</th>
      <th style={{ width: selectedTableType === "common" ? "12%" : "10%" }}>Quantity (no.s)</th>
      {selectedTableType === "rmt" || selectedTableType === "sqm_and_rmt" ? (
        <th style={{ width: "10%" }}>RMT(m)</th>
      ) : null}
      {selectedTableType === "rmt" || selectedTableType === "sqm_and_rmt" ? (
        <th style={{ width: "10%" }}>Module(mm)</th>
      ) : null}
      {selectedTableType === "rmt" || selectedTableType === "sqm_and_rmt" ? (
        <th style={{ width: "10%" }}>Module</th> {/* Changed from SQM to Module */}
      ) : null}
      <th style={{ width: selectedTableType === "common" ? "12%" : "10%" }}>Area (Sqm)</th>
      <th style={{ width: selectedTableType === "common" ? "12%" : "10%" }}>Unit</th>
      <th style={{ width: selectedTableType === "common" ? "12%" : "10%" }}>Amount</th>
      <th style={{ width: selectedTableType === "common" ? "6%" : "5%" }}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {annexureItems.map((item, index) => (
      <tr key={index}>
        <td>
          <Form.Control
            type="text"
            name="srNo"
            value={item.srNo}
            onChange={(e) => handleAnnexureItemChange(index, e)}
            readOnly
            disabled={!isAnnexureEditable}
          />
        </td>
        <td>
          <Form.Control
            type="text"
            name="description"
            value={item.description}
            onChange={(e) => handleAnnexureItemChange(index, e)}
            placeholder="Enter description"
            disabled={!isAnnexureEditable}
          />
        </td>
        <td>
          <Form.Control
            type="number"
            step="0.01"
            name="length"
            value={item.length}
            onChange={(e) => handleAnnexureItemChange(index, e)}
            placeholder="Enter panel length"
            disabled={!isAnnexureEditable}
          />
        </td>
        <td>
          <Form.Control
            type="number"
            step="0.01"
            name="quantity"
            value={item.quantity}
            onChange={(e) => handleAnnexureItemChange(index, e)}
            placeholder="Enter quantity"
            disabled={!isAnnexureEditable}
          />
        </td>
        {selectedTableType === "rmt" || selectedTableType === "sqm_and_rmt" ? (
          <td>
            <Form.Control
              type="number"
              step="0.01"
              name="rmt"
              value={item.rmt}
              onChange={(e) => handleAnnexureItemChange(index, e)}
              placeholder="RMT (calculated)"
              disabled={!isAnnexureEditable}
              readOnly // RMT is calculated as Panel Length × Quantity
            />
          </td>
        ) : null}
        {selectedTableType === "rmt" || selectedTableType === "sqm_and_rmt" ? (
          <td>
            <Form.Control
              type="number"
              step="0.01"
              name="module"
              value={item.module}
              onChange={(e) => handleAnnexureItemChange(index, e)}
              placeholder="Enter module"
              disabled={!isAnnexureEditable}
            />
          </td>
        ) : null}
        {selectedTableType === "rmt" || selectedTableType === "sqm_and_rmt" ? (
          <td>
            <Form.Control
              type="number"
              step="0.01"
              name="sqm"
              value={item.sqm}
              onChange={(e) => handleAnnexureItemChange(index, e)}
              placeholder="Module (calculated)"
              disabled={!isAnnexureEditable}
              readOnly // Module is calculated as RMT × Module
            />
          </td>
        ) : null}
        <td>
          <Form.Control
            type="number"
            step="0.01"
            name="area"
            value={item.area}
            onChange={(e) => handleAnnexureItemChange(index, e)}
            placeholder="Enter area"
            disabled={!isAnnexureEditable}
          />
        </td>
        <td>
          <Form.Control
            type="text"
            name="unit"
            value={item.unit}
            onChange={(e) => handleAnnexureItemChange(index, e)}
            placeholder="Enter unit"
            disabled={!isAnnexureEditable}
          />
        </td>
        <td>
          <Form.Control
            type="text"
            name="amount"
            value={formatCurrency(item.amount)}
            readOnly
            disabled={!isAnnexureEditable}
          />
        </td>
        <td>
          {index === 0 ? (
            <Button
              variant="danger"
              size="sm"
              onClick={clearFirstAnnexureItem}
              title="Clear fields"
              disabled={!isAnnexureEditable}
            >
              <FaEraser />
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={() => removeAnnexureItem(index)}
              disabled={!isAnnexureEditable}
            >
              <FaTrash />
            </Button>
          )}
        </td>
      </tr>
    ))}
  </tbody>
  <tfoot>
    <tr>
      <td colSpan={
        selectedTableType === "sqm_and_rmt" ? "10" : 
        selectedTableType === "rmt" ? "10" : 
        "8"
      } className="text-end fw-bold">Sub Total:</td>
      <td colSpan="2" className="fw-bold">{formatCurrency(annexureTotals.subTotal)}</td>
    </tr>
    <tr>
      <td colSpan={
        selectedTableType === "sqm_and_rmt" ? "10" : 
        selectedTableType === "rmt" ? "10" : 
        "8"
      } className="text-end fw-bold">GST 18%:</td>
      <td colSpan="2" className="fw-bold">{formatCurrency(annexureTotals.gst)}</td>
    </tr>
    <tr>
      <td colSpan={
        selectedTableType === "sqm_and_rmt" ? "10" : 
        selectedTableType === "rmt" ? "10" : 
        "8"
      } className="text-end fw-bold">Grand Total:</td>
      <td colSpan="2" className="fw-bold">{formatCurrency(annexureTotals.grandTotal)}</td>
    </tr>
  </tfoot>
</Table>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-end mt-4">
                  <Button
                    variant="success"
                    onClick={handleSaveAnnexure}
                    disabled={!annexureMode.canCreate}
                    style={{ backgroundColor: "#ed3131", border: "none" }}
                  >
                    <FaSave className="me-1" /> Save Annexure
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AnnexureForm;