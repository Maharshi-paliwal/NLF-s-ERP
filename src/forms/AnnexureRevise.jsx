// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Button,
//   Spinner,
//   Table,
//   Badge,
//   Alert,
//   Form,
//   Tabs,
//   Tab,
// } from "react-bootstrap";
// import { useParams, useNavigate } from "react-router-dom";
// import { FaArrowLeft, FaPrint } from "react-icons/fa";
// import axios from "axios";

// const API_BASE = "https://nlfs.in/erp/index.php/Api";

// // Custom CSS for dropdown arrows
// const dropdownStyles = `
//   .custom-dropdown {
//     position: relative;
//   }
//   .custom-dropdown::after {
//     content: "";
//     position: absolute;
//     top: 50%;
//     right: 10px;
//     transform: translateY(-50%);
//     width: 0;
//     height: 0;
//     border-left: 6px solid transparent;
//     border-right: 6px solid transparent;
//     border-top: 6px solid #6c757d;
//     pointer-events: none;
//   }
//   .custom-dropdown select {
//     appearance: none;
//     -webkit-appearance: none;
//     -moz-appearance: none;
//     padding-right: 30px !important;
//   }
// `;

// const AnnexureRevise = () => {
//   const { annexureId } = useParams();
//   const navigate = useNavigate();
//   const [annexureData, setAnnexureData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState(0);
//   const [annexureItems, setAnnexureItems] = useState([
//   {
//     srNo: 1,
//     description: "",
//     length: "",
//     quantity: "",
//     area: "",
//     amount: ""
//   }
// ]);

// const [annexureTotals, setAnnexureTotals] = useState({
//   subTotal: "0.00",
//   gst: "0.00",
//   grandTotal: "0.00"
// });


//   // Fetch annexure data by ID
//   useEffect(() => {
//     const fetchAnnexureData = async () => {
//       if (!annexureId) {
//         setError("No Annexure ID provided");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
        
//         const res = await axios.post(
//           "https://nlfs.in/erp/index.php/Nlf_Erp/get_annexure_by_id",
//           { annexure_id: annexureId }
//         );

//         if (res.data?.status === true && res.data?.data) {
//           setAnnexureData(res.data.data);
//           setError(null);
//         } else {
//           const errorMsg = res.data?.message || "Failed to fetch Annexure details";
//           setError(errorMsg);
//         }
//       } catch (error) {
//         console.error("Error fetching annexure data:", error);
//         const errorMsg = error.response?.data?.message || "Error loading Annexure details";
//         setError(errorMsg);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnnexureData();
//   }, [annexureId]);

//   useEffect(() => {
//   if (annexureData?.annexure?.length) {
//     setAnnexureItems(
//       annexureData.annexure.map((a, i) => ({
//         srNo: i + 1,
//         description: a.description || "",
//         length: a.length || "",
//         quantity: a.quantity || "",
//         area: a.area || "",
//         amount: a.amount || ""
//       }))
//     );
//   }
// }, [annexureData]);

// useEffect(() => {
//   const subTotal = annexureItems.reduce(
//     (sum, item) => sum + (parseFloat(item.amount) || 0),
//     0
//   );

//   const gst = subTotal * 0.18;

//   setAnnexureTotals({
//     subTotal: subTotal.toFixed(2),
//     gst: gst.toFixed(2),
//     grandTotal: (subTotal + gst).toFixed(2)
//   });
// }, [annexureItems]);


//   const handlePrint = () => {
//     window.print();
//   };

//   const handleGoBack = () => {
//     navigate(-1);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return "₹0";
//     return `₹${Number(amount).toLocaleString('en-IN', { 
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2 
//     })}`;
//   };

//   if (loading) {
//     return (
//       <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
//         <Spinner animation="border" />
//         <span className="ms-3">Loading Annexure...</span>
//       </Container>
//     );
//   }

//   if (error || !annexureData) {
//     return (
//       <Container fluid>
//         <Row>
//           <Col md="12">
//             <Alert variant="danger">
//               {error || "No data found for this Annexure"}
//             </Alert>
//             <Button onClick={handleGoBack} variant="primary">
//               <FaArrowLeft className="me-2" />
//               Back
//             </Button>
//           </Col>
//         </Row>
//       </Container>
//     );
//   }

//   const handleAnnexureItemChange = (index, e) => {
//   const { name, value } = e.target;
//   const updated = [...annexureItems];

//   updated[index] = { ...updated[index], [name]: value };

//   if (name === "quantity" || name === "area") {
//     const qty = parseFloat(updated[index].quantity) || 0;
//     const area = parseFloat(updated[index].area) || 0;
//     const rate = 100;

//     updated[index].amount = (qty * area * rate).toFixed(2);
//   }

//   setAnnexureItems(updated);
// };

// const addAnnexureItem = () => {
//   setAnnexureItems([
//     ...annexureItems,
//     {
//       srNo: annexureItems.length + 1,
//       description: "",
//       length: "",
//       quantity: "",
//       area: "",
//       amount: ""
//     }
//   ]);
// };

// const removeAnnexureItem = (index) => {
//   if (annexureItems.length === 1) return;

//   const updated = annexureItems.filter((_, i) => i !== index);
//   updated.forEach((item, i) => (item.srNo = i + 1));

//   setAnnexureItems(updated);
// };

// const clearFirstAnnexureItem = () => {
//   const updated = [...annexureItems];
//   updated[0] = {
//     ...updated[0],
//     description: "",
//     length: "",
//     quantity: "",
//     area: "",
//     amount: ""
//   };
//   setAnnexureItems(updated);
// };


//   return (
//     <>
//       <style>{dropdownStyles}</style>
//       <Container fluid className="my-4">
//         <Button className="mb-3 btn btn-primary" style={{ backgroundColor: "rgb(237, 49, 49)", border: "none" }} onClick={handleGoBack}>
//           <FaArrowLeft />
//         </Button>

//         <Row>
//           {/* Header Card */}
//           <Col md="12">
//             <Card className="mb-4">
//               <Card.Header style={{ backgroundColor: "#2c3e50" }}>
//                 <Card.Title as="h4">
//                   Annexure Details
//                 </Card.Title>
//               </Card.Header>
//               <Card.Body>
//                 <Row>
//                   <Col md="6">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Annexure Number</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="annexure_no"
//                         value={annexureData.annexure_no || "N/A"}
//                         readOnly
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md="6">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Annexure Date</Form.Label>
//                       <Form.Control
//                         type="text"
//                         value={formatDate(annexureData.date)}
//                         readOnly
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//                 <Row>
//                   <Col md="6">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Vendor</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="vendor"
//                         value={annexureData.vendor || "N/A"}
//                         readOnly
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md="6">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Client Name</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="client_name"
//                         value={annexureData.client_name || "N/A"}
//                         readOnly
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//                 <Row>
//                   <Col md="6">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Project</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="project"
//                         value={annexureData.project || "N/A"}
//                         readOnly
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md="6">
//                     <Form.Group className="mb-3">
//                       <Form.Label>PO Number</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="po_id"
//                         value={annexureData.po_id || "N/A"}
//                         readOnly
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//                 <Row>
//                   <Col md="6">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Revision</Form.Label>
//                       <Form.Control
//                         type="text"
//                         name="revise"
//                         value={annexureData.revise || "N/A"}
//                         readOnly
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md="6">
//                     <Form.Group className="mb-3">
//                       <Form.Label>Status</Form.Label>
//                       <Form.Control
//                         type="text"
//                         value={
//                           <Badge bg={annexureData.design_approval === "Yes" ? "success" : "warning"}>
//                             {annexureData.design_approval === "Yes" ? "Approved" : "Pending Approval"}
//                           </Badge>
//                         }
//                         readOnly
//                       />
//                     </Form.Group>
//                   </Col>
//                 </Row>
//               </Card.Body>
//             </Card>
//           </Col>

//           {/* Order Items Card with Tabs */}
//           <Col md="12">
//             <Card className="mb-4">
//               <Card.Header style={{ backgroundColor: "#34495e" }}>
//                 <Card.Title as="h5" style={{ color: "white", margin: 0 }}>
//                   Order Items ({annexureData.items ? annexureData.items.length : 0})
//                 </Card.Title>
//               </Card.Header>
//               <Card.Body>
//                 {annexureData.items && annexureData.items.length > 0 ? (
//                   <Tabs 
//                     activeKey={activeTab} 
//                     onSelect={(k) => setActiveTab(parseInt(k))}
//                     className="mb-3"
//                   >
//                     {annexureData.items.map((item, index) => (
//                       <Tab 
//                         eventKey={index} 
//                         title={item.brand || 'Item'} 
//                         key={index}
//                       >
//                         <Row>
//                           <Col md={12}>
//                             <Card className="mb-3">
//                               <Card.Header as="h5">Product</Card.Header>
//                               <Card.Body>
//                                 <Row>
//                                   <Col md={6}>
//                                     <Form.Group className="mb-3">
//                                       <Form.Label>Brand</Form.Label>
//                                       <Form.Control
//                                         type="text"
//                                         value={item.brand || "N/A"}
//                                         readOnly
//                                       />
//                                     </Form.Group>
//                                   </Col>
//                                   <Col md={6}>
//                                     <Form.Group className="mb-3">
//                                       <Form.Label>Product</Form.Label>
//                                       <Form.Control
//                                         type="text"
//                                         value={item.product || "N/A"}
//                                         readOnly
//                                       />
//                                     </Form.Group>
//                                   </Col>
//                                   <Col md={6}>
//                                     <Form.Group className="mb-3">
//                                       <Form.Label>Sub Product</Form.Label>
//                                       <Form.Control
//                                         type="text"
//                                         value={item.sub_product || "N/A"}
//                                         readOnly
//                                       />
//                                     </Form.Group>
//                                   </Col>
//                                   <Col md={6}>
//                                     <Form.Group className="mb-3">
//                                       <Form.Label>Unit</Form.Label>
//                                       <Form.Control
//                                         type="text"
//                                         value={item.unit || "N/A"}
//                                         readOnly
//                                       />
//                                     </Form.Group>
//                                   </Col>
//                                   <Col md={9}>
//                                     <Form.Group className="mb-3">
//                                       <Form.Label>Description</Form.Label>
//                                       <Form.Control
//                                         as="textarea"
//                                         rows={3}
//                                         value={item.desc || "N/A"}
//                                         readOnly
//                                       />
//                                     </Form.Group>
//                                   </Col>
//                                   <Col md={3}>
//                                     <Form.Group className="mb-3">
//                                       <Form.Label>Quantity</Form.Label>
//                                       <Form.Control
//                                         type="number"
//                                         value={item.qty || "0"}
//                                         readOnly
//                                       />
//                                     </Form.Group>
//                                   </Col>
//                                   <Col md={6}>
//                                     <Form.Group className="mb-3">
//                                       <Form.Label>Rate</Form.Label>
//                                       <Form.Control
//                                         type="text"
//                                         value={formatCurrency(item.rate)}
//                                         readOnly
//                                       />
//                                     </Form.Group>
//                                   </Col>
//                                   <Col md={6}>
//                                     <Form.Group className="mb-3">
//                                       <Form.Label>Amount</Form.Label>
//                                       <Form.Control
//                                         type="text"
//                                         value={formatCurrency(item.amt)}
//                                         readOnly
//                                       />
//                                     </Form.Group>
//                                   </Col>
//                                 </Row>
//                               </Card.Body>
//                             </Card>
//                           </Col>
//                           <Col md={12}>
//                             <Card className="mb-3">
//                               <Card.Header as="h5">Installation</Card.Header>
//                               <Card.Body>
//                                 <Row>
//                                   <Col md={6}>
//                                     <Form.Group className="mb-3">
//                                       <Form.Label>Unit</Form.Label>
//                                       <Form.Control
//                                         type="text"
//                                         value={item.inst_unit || "N/A"}
//                                         readOnly
//                                       />
//                                     </Form.Group>
//                                   </Col>
//                                   <Col md={6}>
//                                     <Form.Group className="mb-3">
//                                       <Form.Label>Quantity</Form.Label>
//                                       <Form.Control
//                                         type="number"
//                                         value={item.inst_qty || "0"}
//                                         readOnly
//                                       />
//                                     </Form.Group>
//                                   </Col>
//                                   <Col md={6}>
//                                     <Form.Group className="mb-3">
//                                       <Form.Label>Rate</Form.Label>
//                                       <Form.Control
//                                         type="text"
//                                         value={formatCurrency(item.inst_rate)}
//                                         readOnly
//                                       />
//                                     </Form.Group>
//                                   </Col>
//                                   <Col md={6}>
//                                     <Form.Group className="mb-3">
//                                       <Form.Label>Amount</Form.Label>
//                                       <Form.Control
//                                         type="text"
//                                         value={formatCurrency(item.inst_amt)}
//                                         readOnly
//                                       />
//                                     </Form.Group>
//                                   </Col>
//                                 </Row>
//                               </Card.Body>
//                             </Card>
//                           </Col>
//                         </Row>
//                       </Tab>
//                     ))}
//                   </Tabs>
//                 ) : (
//                   <div className="text-center">No items found</div>
//                 )}
//               </Card.Body>
//             </Card>
//           </Col>

//           {/* Annexure Items Card */}
//           <Col md="12">
//             <Card className="mb-4">
//               <Card.Header style={{ backgroundColor: "#34495e" }}>
//                 <div className="d-flex justify-content-between align-items-center">
//                   <Card.Title as="h5" style={{ margin: 0 }}>
//                     Annexure Items
//                   </Card.Title>
                 
//                 </div>
//               </Card.Header>
//              <Card.Body>
//   <Row className="mb-3">
//     <Col md="12" className="d-flex justify-content-between align-items-center">
//       <h5>Annexure Items</h5>
//       <Button
//         onClick={addAnnexureItem}
//         style={{ backgroundColor: "#ed3131", border: "none" }}
//       >
//         + Add Annexure Item
//       </Button>
//     </Col>
//   </Row>

//   <Table responsive striped hover>
//     <thead>
//       <tr>
//         <th>S.No</th>
//         <th>Description</th>
//         <th>Length</th>
//         <th>Quantity</th>
//         <th>Area</th>
//         <th>Amount</th>
//         <th>Action</th>
//       </tr>
//     </thead>

//     <tbody>
//       {annexureItems.map((item, index) => (
//         <tr key={index}>
//           <td>
//             <Form.Control value={item.srNo} readOnly />
//           </td>

//           <td>
//             <Form.Control
//               name="description"
//               value={item.description}
//               onChange={(e) => handleAnnexureItemChange(index, e)}
//             />
//           </td>

//           <td>
//             <Form.Control
//               name="length"
//               value={item.length}
//               onChange={(e) => handleAnnexureItemChange(index, e)}
//             />
//           </td>

//           <td>
//             <Form.Control
//               type="number"
//               name="quantity"
//               value={item.quantity}
//               onChange={(e) => handleAnnexureItemChange(index, e)}
//             />
//           </td>

//           <td>
//             <Form.Control
//               type="number"
//               name="area"
//               value={item.area}
//               onChange={(e) => handleAnnexureItemChange(index, e)}
//             />
//           </td>

//           <td>
//             <Form.Control
//               value={formatCurrency(item.amount)}
//               readOnly
//             />
//           </td>

//           <td>
//             {index === 0 ? (
//               <Button variant="danger" size="sm" onClick={clearFirstAnnexureItem}>
//                 Clear
//               </Button>
//             ) : (
//               <Button
//                 variant="danger"
//                 size="sm"
//                 onClick={() => removeAnnexureItem(index)}
//               >
//                 Delete
//               </Button>
//             )}
//           </td>
//         </tr>
//       ))}
//     </tbody>

//     <tfoot>
//       <tr>
//         <td colSpan="5" className="text-end fw-bold">Sub Total:</td>
//         <td colSpan="2">{formatCurrency(annexureTotals.subTotal)}</td>
//       </tr>
//       <tr>
//         <td colSpan="5" className="text-end fw-bold">GST 18%:</td>
//         <td colSpan="2">{formatCurrency(annexureTotals.gst)}</td>
//       </tr>
//       <tr>
//         <td colSpan="5" className="text-end fw-bold">Grand Total:</td>
//         <td colSpan="2">{formatCurrency(annexureTotals.grandTotal)}</td>
//       </tr>
//     </tfoot>
//   </Table>
// </Card.Body>

//             </Card>
//           </Col>
//         </Row>
//       </Container>
//     </>
//   );
// };

// export default AnnexureRevise;

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
  Form,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint, FaPlus, FaTrash, FaEraser, FaSave } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

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
`;

const AnnexureRevise = () => {
  const { annexureId } = useParams();
  const navigate = useNavigate();
  const [annexureData, setAnnexureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State for annexure items
  const [annexureItems, setAnnexureItems] = useState([
    {
      srNo: 1,
      description: "",
      length: "",
      quantity: "",
      area: "",
      amount: ""
    }
  ]);

  // State for annexure totals
  const [annexureTotals, setAnnexureTotals] = useState({
    subTotal: "0.00",
    gst: "0.00",
    grandTotal: "0.00"
  });

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
          
          // Initialize annexure items from the fetched data
          if (res.data.data.annexure && res.data.data.annexure.length > 0) {
            setAnnexureItems(
              res.data.data.annexure.map((a, i) => ({
                srNo: i + 1,
                description: a.description || "",
                length: a.length || "",
                quantity: a.quantity || "",
                area: a.area || "",
                amount: a.amount || ""
              }))
            );
          }
          
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
        gst: gstAmount.toFixed(2),
        grandTotal: grandTotal.toFixed(2)
      });
    };
    
    calculateTotals();
  }, [annexureItems]);

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

  // Handle input change for annexure items
  const handleAnnexureItemChange = (index, e) => {
    if (!editMode) return;
    
    const { name, value } = e.target;
    const updatedItems = [...annexureItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: value
    };
    
    // Calculate amount if quantity and area are available
    if (name === "quantity" || name === "area") {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const area = parseFloat(updatedItems[index].area) || 0;
      // Assuming rate calculation based on quantity and area
      const rate = 100; // Default rate, should be configurable
      updatedItems[index].amount = (quantity * area * rate).toFixed(2);
    }
    
    setAnnexureItems(updatedItems);
  };

  // Clear first annexure item
  const clearFirstAnnexureItem = () => {
    if (!editMode) return;
    
    const updatedItems = [...annexureItems];
    updatedItems[0] = {
      ...updatedItems[0],
      description: "",
      length: "",
      quantity: "",
      area: "",
      amount: ""
    };
    setAnnexureItems(updatedItems);
  };

  // Add a new annexure item
  const addAnnexureItem = () => {
    if (!editMode) return;
    
    setAnnexureItems([
      ...annexureItems,
      {
        srNo: annexureItems.length + 1,
        description: "",
        length: "",
        quantity: "",
        area: "",
        amount: ""
      }
    ]);
  };

  // Remove an annexure item
  const removeAnnexureItem = (index) => {
    if (!editMode) return;
    
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

  // Build annexure array for API
  const buildAnnexureArray = () => {
    return annexureItems
      .filter(item => item.description?.trim())
      .map(item => ({
        sr_no: String(item.srNo),
        description: String(item.description),
        length: String(item.length),
        quantity: String(item.quantity || "0"),
        area: String(item.area || "0"),
        amount: String(item.amount || "0")
      }));
  };

  // Handle save annexure
  const handleSaveAnnexure = async () => {
    if (!annexureItems.some(i => i.description.trim())) {
      toast.error("Please add at least one annexure item");
      return;
    }

    try {
      setSaving(true);

      // Build the payload
//       const payload = {

//          status: "revise",            
// design_approval: "No",      
//   annexure_approval: "", 
//         annexure_id: annexureId,
//         annexure: buildAnnexureArray(),
//         sub_total: annexureTotals.subTotal,
//         gst: annexureTotals.gst,
//         total_amount: annexureTotals.grandTotal
//       };


const payload = {
  annexure_id: annexureId,
    po_id: annexureData.po_id,

  annexure_no: annexureData.annexure_no, // full number (optional if backend uses it)
            // THIS is the key part (A4)

  status: "revise",
  design_approval: "No",
  annexure_approval: "",

  annexure: buildAnnexureArray(),

  sub_total: annexureTotals.subTotal,
  gst: annexureTotals.gst,
  total_amount: annexureTotals.grandTotal
};


      const res = await axios.post(
        "https://nlfs.in/erp/index.php/Nlf_Erp/add_annexure",
        payload
      );

      const isSuccess =
        res.data?.status === true ||
        res.data?.status === "true" ||
        res.data?.success === 1 ||
        res.data?.success === "1";

      if (isSuccess) {
        toast.success("Annexure updated successfully");
        setEditMode(false);
        // Refresh the data
        const refreshRes = await axios.post(
          "https://nlfs.in/erp/index.php/Nlf_Erp/get_annexure_by_id",
          { annexure_id: annexureId }
        );
        if (refreshRes.data?.status === true && refreshRes.data?.data) {
          setAnnexureData(refreshRes.data.data);
        }
      } else {
        toast.error(res.data?.message || "Failed to update annexure");
      }
    } catch (err) {
      console.error("Update Annexure Error:", err);
      toast.error("Server error while updating annexure");
    } finally {
      setSaving(false);
    }
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
                <div className="d-flex justify-content-between align-items-center">
                  <Card.Title as="h4">
                    Annexure Details
                  </Card.Title>
                  <div>
                    {editMode ? (
                      <>
                        <Button 
                          variant="success" 
                          className="me-2"
                          onClick={handleSaveAnnexure}
                          disabled={saving}
                        >
                          <FaSave className="me-1" /> {saving ? "Saving..." : "Save"}
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => setEditMode(false)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="primary" 
                        onClick={() => setEditMode(true)}
                        disabled={annexureData.design_approval === "Yes"}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Annexure Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="annexure_no"
                        value={annexureData.annexure_no || "N/A"}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Annexure Date</Form.Label>
                      <Form.Control
                        type="text"
                        value={formatDate(annexureData.date)}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Vendor</Form.Label>
                      <Form.Control
                        type="text"
                        name="vendor"
                        value={annexureData.vendor || "N/A"}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group className="mb-3">
                      <Form.Label>Client Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="client_name"
                        value={annexureData.client_name || "N/A"}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="4">
                    <Form.Group className="mb-3">
                      <Form.Label>Project</Form.Label>
                      <Form.Control
                        type="text"
                        name="project"
                        value={annexureData.project || "N/A"}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md="4">
                    <Form.Group className="mb-3">
                      <Form.Label>PO Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="po_id"
                        value={annexureData.po_id || "N/A"}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                   <Col md="4">
                    <Form.Group className="mb-3">
                      <Form.Label>Annexure No:</Form.Label>
                      <Form.Control
                        type="text"
                        name="revise"
                        value={annexureData.revise || "N/A"}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                 
                  <Col md="6">
                   
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
                  Order Items ({annexureData.items ? annexureData.items.length : 0})
                </Card.Title>
              </Card.Header>
              <Card.Body>
                {annexureData.items && annexureData.items.length > 0 ? (
                  <Tabs 
                    activeKey={activeTab} 
                    onSelect={(k) => setActiveTab(parseInt(k))}
                    className="mb-3"
                  >
                    {annexureData.items.map((item, index) => (
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
                                      <Form.Control
                                        type="text"
                                        value={item.brand || "N/A"}
                                        readOnly
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Product</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={item.product || "N/A"}
                                        readOnly
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Sub Product</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={item.sub_product || "N/A"}
                                        readOnly
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Unit</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={item.unit || "N/A"}
                                        readOnly
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={9}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Description</Form.Label>
                                      <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={item.desc || "N/A"}
                                        readOnly
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={3}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Quantity</Form.Label>
                                      <Form.Control
                                        type="number"
                                        value={item.qty || "0"}
                                        readOnly
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Rate</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={formatCurrency(item.rate)}
                                        readOnly
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Amount</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={formatCurrency(item.amt)}
                                        readOnly
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
                                      <Form.Control
                                        type="text"
                                        value={item.inst_unit || "N/A"}
                                        readOnly
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Quantity</Form.Label>
                                      <Form.Control
                                        type="number"
                                        value={item.inst_qty || "0"}
                                        readOnly
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Rate</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={formatCurrency(item.inst_rate)}
                                        readOnly
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label>Amount</Form.Label>
                                      <Form.Control
                                        type="text"
                                        value={formatCurrency(item.inst_amt)}
                                        readOnly
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

          {/* Annexure Items Card */}
          <Col md="12">
            <Card className="mb-4">
              <Card.Header style={{ backgroundColor: "#34495e" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <Card.Title as="h5" style={{ margin: 0 }}>
                    Annexure Items
                  </Card.Title>
                  {editMode && (
                    <Button 
                      variant="dark" 
                      onClick={addAnnexureItem}
                      style={{ backgroundColor: "#ed3131", border: "none" }}
                    >
                      <FaPlus /> Add Annexure Item
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                <Row className="mb-4">
                  <Col md="12">
                    <Table responsive striped hover className="mb-3">
                      <thead>
                        <tr>
                          <th style={{ width: "5%" }}>S.No</th>
                          <th style={{ width: "45%" }}>Description</th>
                          <th style={{ width: "10%" }}>Length</th>
                          <th style={{ width: "10%" }}>Quantity</th>
                          <th style={{ width: "10%" }}>Area</th>
                          <th style={{ width: "10%" }}>Amount</th>
                          {editMode && <th style={{ width: "5%" }}>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {annexureItems.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <Form.Control
                                type="text"
                                value={item.srNo}
                                readOnly
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                name="description"
                                value={item.description}
                                onChange={(e) => handleAnnexureItemChange(index, e)}
                                placeholder="Enter description"
                                readOnly={!editMode}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                name="length"
                                value={item.length}
                                onChange={(e) => handleAnnexureItemChange(index, e)}
                                placeholder="Enter length"
                                readOnly={!editMode}
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
                                readOnly={!editMode}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                step="0.01"
                                name="area"
                                value={item.area}
                                onChange={(e) => handleAnnexureItemChange(index, e)}
                                placeholder="Enter area"
                                readOnly={!editMode}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="text"
                                name="amount"
                                value={formatCurrency(item.amount)}
                                readOnly
                              />
                            </td>
                            {editMode && (
                              <td>
                                {index === 0 ? (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={clearFirstAnnexureItem}
                                    title="Clear fields"
                                  >
                                    <FaEraser />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => removeAnnexureItem(index)}
                                  >
                                    <FaTrash />
                                  </Button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="5" className="text-end fw-bold">Sub Total:</td>
                          <td className="fw-bold">{formatCurrency(annexureTotals.subTotal)}</td>
                          {editMode && <td></td>}
                        </tr>
                        <tr>
                          <td colSpan="5" className="text-end fw-bold">GST 18%:</td>
                          <td className="fw-bold">{formatCurrency(annexureTotals.gst)}</td>
                          {editMode && <td></td>}
                        </tr>
                        <tr>
                          <td colSpan="5" className="text-end fw-bold">Grand Total:</td>
                          <td className="fw-bold">{formatCurrency(annexureTotals.grandTotal)}</td>
                          {editMode && <td></td>}
                        </tr>
                      </tfoot>
                    </Table>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-end mt-4">
                  <Button variant="secondary" onClick={handlePrint}>
                    <FaPrint className="me-2" />
                    Print
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

export default AnnexureRevise;