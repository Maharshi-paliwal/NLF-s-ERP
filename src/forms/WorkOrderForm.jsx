import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
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
import { FaArrowLeft, FaMinus } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// 1️⃣ Lazy Load CKEditor
const LazyCKEditor = lazy(() =>
  import("@ckeditor/ckeditor5-react").then(module => ({
    default: module.CKEditor
  }))
);

const ROOT = "https://nlfs.in/erp/index.php";
const API_BASE_URL = `${ROOT}/Api`;

const getInitialState = () => ({
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
  po_metadata: {},
  full_amount: "",
  items: [],
  payment_details: "",
  terms_and_condition: "",
  warranty: "",
  quote_terms: "",
  design_approval: "no",
  header_img: "", 
  file_upload: null,
  file_upload2: null,// Added this field which is expected by the backend
});

// 2️⃣ Memoized Item Component
const WorkOrderItem = React.memo(function WorkOrderItem({
  item,
  index,
  subProductMaster,
  onUpdate,
  onRemove
}) {
  
  const brandOptions = useMemo(() => {
    if (!subProductMaster?.length) return [];
    const set = new Set();
    subProductMaster.forEach((sp) => {
      if (sp.brand && sp.brand.trim() !== "") set.add(sp.brand.trim());
    });
    return Array.from(set);
  }, [subProductMaster]);

  const productOptions = useMemo(() => {
    if (!subProductMaster?.length) return [];
    const set = new Set();
    subProductMaster.forEach((sp) => {
      if (sp.brand === item.brand && sp.g3_category && sp.g3_category.trim() !== "") {
        set.add(sp.g3_category.trim());
      }
    });
    return Array.from(set);
  }, [subProductMaster, item.brand]);

  const subProductOptions = useMemo(() => {
    if (!subProductMaster?.length) return [];
    return subProductMaster.filter(
      (sp) => sp.brand === item.brand && sp.g3_category === item.product
    );
  }, [subProductMaster, item.brand, item.product]);

  const handleFieldChange = (field, value) => {
    let updates = { [field]: value };

    if (field === "brand") {
      updates.product = "";
      updates.sub_product = "";
      updates.description = "";
      updates.unit = "";
    } else if (field === "product") {
      updates.sub_product = "";
      updates.description = "";
      updates.unit = "";
    } else if (field === "sub_product") {
      const selectedSub = subProductOptions.find(sp => sp.item_name === value);
      if (selectedSub) {
        updates.description = selectedSub.specification || "";
        updates.unit = selectedSub.uom || "";
      }
    } else if (field === "quantity" || field === "rate") {
      const qty = parseFloat(field === "quantity" ? value : item.quantity) || 0;
      const rate = parseFloat(field === "rate" ? value : item.rate) || 0;
      updates.amount = (qty * rate).toFixed(2);
    } else if (field === "installation_quantity" || field === "installation_rate") {
      const qty = parseFloat(field === "installation_quantity" ? value : item.installation_quantity) || 0;
      const rate = parseFloat(field === "installation_rate" ? value : item.installation_rate) || 0;
      updates.installation_amount = (qty * rate).toFixed(2);
    }

    onUpdate(index, updates);
  };

  return (
    <div className="border rounded p-3 mb-3">
      <Row className="mb-3">
        <Col md={2}>
          <Form.Group>
            <Form.Label>Brand</Form.Label>
            <Form.Select
              value={item.brand || ""}
              onChange={(e) => handleFieldChange("brand", e.target.value)}
            >
              <option value="">Select Brand</option>
              {brandOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Product</Form.Label>
            <Form.Select
              value={item.product || ""}
              onChange={(e) => handleFieldChange("product", e.target.value)}
              disabled={!item.brand}
            >
              <option value="">Select Product</option>
              {productOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Sub Product</Form.Label>
            <Form.Select
              value={item.sub_product || ""}
              onChange={(e) => handleFieldChange("sub_product", e.target.value)}
              disabled={!item.product}
            >
              <option value="">Select Sub Product</option>
              {subProductOptions.map((sp) => (
                <option key={sp.id} value={sp.item_name}>{sp.item_name}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={item.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={2}>
          <Form.Group>
            <Form.Label>Unit</Form.Label>
            <Form.Control
              value={item.unit}
              onChange={(e) => handleFieldChange("unit", e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Qty</Form.Label>
            <Form.Control
              type="number"
              value={item.quantity}
              onChange={(e) => handleFieldChange("quantity", e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Rate</Form.Label>
            <Form.Control
              type="number"
              value={item.rate}
              onChange={(e) => handleFieldChange("rate", e.target.value)}
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
            <Form.Control 
              value={item.color_scheme || ""} 
              onChange={(e) => handleFieldChange("color_scheme", e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
      
      {/* Installation Section */}
      <Row className="mt-3 pt-3 border-top">
        <Col md="12">
          <Card.Title className="mb-4">Installation</Card.Title>
        </Col>
        <Col md="3">
          <Form.Group>
            <Form.Label>Unit</Form.Label>
            <Form.Control
              value={item.installation_unit || item.unit || ""}
              onChange={(e) => handleFieldChange("installation_unit", e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md="3">
          <Form.Group>
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              value={item.installation_quantity || ""}
              onChange={(e) => handleFieldChange("installation_quantity", e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md="3">
          <Form.Group>
            <Form.Label>Rate</Form.Label>
            <Form.Control
              type="number"
              value={item.installation_rate || ""}
              onChange={(e) => handleFieldChange("installation_rate", e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md="3">
          <Form.Group>
            <Form.Label>Amount</Form.Label>
            <Form.Control
              type="number"
              value={item.installation_amount || "0"}
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>
      
      {index > 0 && (
        <div className="mt-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemove(index)}
            style={{ padding: "4px 10px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <FaMinus size={12} />
          </Button>
        </div>
      )}
    </div>
  );
});

const WorkOrderForm = () => {
  const navigate = useNavigate();
  const { quoteId } = useParams();
  const [formData, setFormData] = useState(getInitialState);
  const [submitting, setSubmitting] = useState(false);
  const [poList, setPoList] = useState([]);
  const [nextWoNumber, setNextWoNumber] = useState("");
  const [quotationData, setQuotationData] = useState(null);
  const [subProductMaster, setSubProductMaster] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [branchMaster, setBranchMaster] = useState([]);

  // 7️⃣ Memoized Totals
  const calculatedTotals = useMemo(() => {
    const totalItemAmount = formData.items.reduce((acc, item) => {
      const itemAmount = parseFloat(item.amount) || 0;
      const installationAmount = parseFloat(item.installation_amount) || 0;
      return acc + itemAmount + installationAmount;
    }, 0);
    const gst = totalItemAmount * 0.18;
    const grandTotal = totalItemAmount + gst;
    return { basicAmount: totalItemAmount, gst, grandTotal };
  }, [formData.items]);

  const balanceAmount = useMemo(() => {
    const advRaw = formData.advance_amt;
    const fullRaw = formData.full_amount || (quotationData?.total ?? quotationData?.total_amount) || "";
    
    if (!advRaw && advRaw !== 0) return "";

    const advNum = Number(String(advRaw).replace(/,/g, ""));
    const fullNum = Number(String(fullRaw).replace(/,/g, ""));
    
    if (isNaN(advNum) || isNaN(fullNum)) return "";
    let bal = fullNum - advNum;
    if (!isFinite(bal) || bal < 0) bal = 0;
    return String(bal);
  }, [formData.advance_amt, formData.full_amount, quotationData]);

  // 4️⃣ Consolidated Data Fetching
  useEffect(() => {
    let isMounted = true;
    const initializeData = async () => {
      try {
        const [poRes, subRes, woRes, branchRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/list_po`),
          axios.get(`${API_BASE_URL}/list_mst_sub_product`),
          axios.get(`${ROOT}/Erp/get_next_wo_no`),
          axios.get(`${ROOT}/Erp/branch_list`)
        ]);

        if (isMounted) {
          if (poRes.data.status === "true" || poRes.data.status === true) {
            setPoList(poRes.data.data || []);
          }
          if (subRes.data.status === "true") {
            setSubProductMaster(subRes.data.data || []);
          }
          if (branchRes.data?.data) {
            setBranchMaster(branchRes.data.data);
          }
          const nextWo = woRes.data.next_wo_no || woRes.data.next_work_no || woRes.data.next_wo || "";
          if (nextWo) {
            setNextWoNumber(nextWo);
            setFormData(prev => ({ ...prev, wo_no: nextWo }));
          }

          setIsInitialLoading(false);
        }
      } catch (err) {
        console.error("Initialization error:", err);
        if (isMounted) setIsInitialLoading(false);
      }
    };

    initializeData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!quoteId || isInitialLoading) return;
    
    const fetchQuotation = async () => {
      try {
        const res = await axios.post(`${ROOT}/Nlf_Erp/get_quotation_by_id`, {
          quote_id: String(quoteId),
        });
        const d = res.data;
        if (d.status && d.data) {
          const q = d.data;
          setQuotationData(q);

          // Resolve header image from branch master
          let resolvedHeaderImg = "";

          if (q.branch && branchMaster.length) {
            const matchedBranch = branchMaster.find(
              (b) =>
                b.branch_name?.trim().toLowerCase() ===
                q.branch.trim().toLowerCase()
            );

            resolvedHeaderImg = matchedBranch?.header_image || "";
          }

          const mappedItems = q.items.map((item, idx) => {
            const matchedSub = subProductMaster.find(
              (sp) =>
                sp.brand === item.brand &&
                sp.g3_category === item.product &&
                sp.item_name === item.sub_product
            );

            return {
              id: `wo-item-${Date.now()}-${idx}`,
              brand: (item.brand || "").trim(),
              product: item.product || "",
              sub_product: item.sub_product || "",
              description: item.desc || "",
              unit: item.unit || "",
              quantity: String(item.qty || ""),
              rate: String(item.rate || ""),
              amount: String(item.amt || ""),
              color_scheme: item.color_scheme || "",
              installation_unit: item.inst_unit || item.unit || "",
              installation_quantity: String(item.inst_qty || ""),
              installation_rate: String(item.inst_rate || ""),
              installation_amount: String(item.inst_amt || "0"),
              selectedSubProductObj: matchedSub || null,
            };
          });

          setFormData((prev) => ({
            ...prev,
            quto_id: q.quote_no || quoteId,
            branch: q.branch || "",
            header_img: resolvedHeaderImg,
            full_amount: String(q.total ?? q.total_amount ?? ""),
            items: mappedItems,
            quote_terms: q.terms || "",
            general_design: q.project || "",
            terms_and_condition: q.terms || "",
            client_preparation: q.name || "",
            notes:
              prev.notes ||
              [
                q.company ? `Company: ${q.company}` : "",
                q.site_address ? `Site: ${q.site_address}` : "",
              ]
                .filter(Boolean)
                .join(" | "),
          }));
        }
      } catch (err) {
        console.error("Error fetching quotation for WO:", err);
      }
    };

    fetchQuotation();
  }, [quoteId, isInitialLoading, subProductMaster, branchMaster]);

  const handleMainChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleItemUpdate = useCallback((index, updates) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], ...updates };
      return { ...prev, items };
    });
  }, []);

  const addItem = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `wo-item-${Date.now()}`,
          product: "",
          sub_product: "",
          description: "",
          unit: "",
          quantity: "",
          rate: "",
          amount: "",
          color_scheme: "",
          installation_unit: "",
          installation_quantity: "",
          installation_rate: "",
          installation_amount: "0",
        },
      ],
    }));
  }, []);

  const removeItem = useCallback((idx) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  }, []);

  const handlePoSelect = useCallback((po_no_or_id) => {
    const selected = poList.find(
      (p) => p.po_no === po_no_or_id || String(p.po_id) === String(po_no_or_id)
    );
    if (!selected) {
      setFormData((prev) => ({
        ...prev,
        po_id: "",
        po_no: "",
        po_metadata: {},
      }));
      return;
    }
    const updates = {
      po_id: selected.po_id || "",
      po_no: selected.po_no || "",
      quto_id:
        formData.quto_id ||
        selected.quote_id ||
        selected.quote_no ||
        selected.quto_id ||
        selected.po_no ||
        "",
      po_metadata: selected,
    };
    setFormData((prev) => ({ ...prev, ...updates }));
  }, [poList, formData.quto_id]);

  // IMPROVED DATE FORMATTING FUNCTION
  const formatDateToDDMMYYYY = (isoDate) => {
    if (!isoDate) return "";
    
    try {
      // Handle both YYYY-MM-DD and DD-MM-YYYY formats
      if (isoDate.includes('-')) {
        const parts = isoDate.split("-");
        if (parts.length === 3) {
          // Check if it's YYYY-MM-DD format (year has 4 digits and is first)
          if (parts[0].length === 4) {
            const [year, month, day] = parts;
            return `${day}-${month}-${year}`;
          } else {
            // Already in DD-MM-YYYY format
            return isoDate;
          }
        }
      }
      return "";
    } catch (error) {
      console.error("Date formatting error:", error);
      return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const endpoint = `${API_BASE_URL}/add_work_order`;
      
      // Create a clean FormData instance
      const formDataPayload = new FormData();

      const clientName = formData.client_preparation || quotationData?.name || "";
      const totalGrand = calculatedTotals.grandTotal;

      // Log what we're about to send for debugging
      console.log("=== FORM DATA DEBUG ===");
      console.log("Client Name:", clientName);
      console.log("Total Grand:", totalGrand);

      // Add all required fields
      formDataPayload.append("wo_no", formData.wo_no || nextWoNumber || "");
      formDataPayload.append("po_id", formData.po_id || "");
      formDataPayload.append("po_no", formData.po_no || "");
      formDataPayload.append("quto_id", formData.quto_id || quoteId || "");
      formDataPayload.append("branch", formData.branch || "");
      formDataPayload.append("notes", formData.notes || "");
      formDataPayload.append("design_approval", "no");
      formDataPayload.append("exp_delivery_date", formData.exp_delivery_date || "");
      formDataPayload.append("general_design", formData.general_design || "");
      formDataPayload.append("client_preparation", clientName);
      formDataPayload.append("bal_amt", String(totalGrand.toFixed(2)));
      formDataPayload.append("terms_and_condition", formData.terms_and_condition || "");
formDataPayload.append(
  "payment_details",
  formData.payment_details || ""
);      formDataPayload.append("warranty", "");
      formDataPayload.append("header_img", formData.header_img || "");

      // Items array
      const itemsForApi = formData.items.map((item) => ({
        brand: item.brand || "",
        item_name: item.product || "",
        sub_product: item.sub_product || "",
        description: item.description || "",
        unit: item.unit || "",
        quantity: String(item.quantity || "0"),
        unit_price: String(item.rate || "0"),
        color_scheme: item.color_scheme || "",
        installation_unit: item.installation_unit || "",
        installation_quantity: String(item.installation_quantity || "0"),
        installation_rate: String(item.installation_rate || "0"),
        installation_amount: String(item.installation_amount || "0"),
      }));

      formDataPayload.append("items", JSON.stringify(itemsForApi));

      // Attach files if present
if (formData.file_upload) {
  formDataPayload.append("file_upload", formData.file_upload);
}

if (formData.file_upload2) {
  formDataPayload.append("file_upload2", formData.file_upload2);
}


      console.log("=== ITEMS BEING SENT ===", itemsForApi);

      // Use fetch instead of axios to avoid any interceptors
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formDataPayload,
        // Don't set Content-Type - let browser handle it for FormData
      });

      console.log("=== RESPONSE STATUS ===", response.status);
      
      // Try to get response as text first to see if it's valid JSON
      const responseText = await response.text();
      console.log("=== RAW RESPONSE ===", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        console.error("Response was:", responseText);
        throw new Error("Server returned invalid JSON: " + responseText.substring(0, 100));
      }

      console.log("=== PARSED RESPONSE ===", result);
      console.log("Submitting header_img:", formData.header_img);

    if (result.status === true || result.status === "true" || result.success === "1") {
  toast.success(result.message || "Work Order created successfully!");
  // Add the window alert here
  window.alert("Work order created successfully");
  setTimeout(() => navigate("/clients"), 500);
} else {
  toast.error(result.message || "Failed to create work order");
}
    } catch (error) {
      console.error("=== ERROR SUBMITTING WORK ORDER ===");
      console.error("Full error:", error);
      toast.error(error.message || "Failed to submit work order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  if (isInitialLoading) {
    return (
      <Container fluid className="my-4 text-center">
        <Spinner animation="border" role="status" style={{ color: "#ed3131" }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Initializing Work Order Form...</p>
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
        <Card className="mb-4">
          <Card.Header>
            <Card.Title as="h4">Create New Work Order</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>WO No</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={formData.wo_no || nextWoNumber || ""} 
                    readOnly 
                  />
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>Quote No</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={formData.quto_id || quotationData?.quote_no || quoteId || ""} 
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
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>Client Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="client_preparation" 
                    value={formData.client_preparation} 
                    readOnly 
                  />
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.general_design}
                    readOnly
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
                    onChange={handleMainChange}
                    placeholder="DD-MM-YYYY"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
  <Col md="6">
    <Form.Group className="mb-3">
      <Form.Label>File upload 1</Form.Label>
      <Form.Control
        type="file"
        onChange={(e) =>
          setFormData(prev => ({
            ...prev,
            file_upload: e.target.files[0]
          }))
        }
      />
    </Form.Group>
  </Col>

  <Col md="6">
    <Form.Group className="mb-3">
      <Form.Label>File upload 2</Form.Label>
      <Form.Control
        type="file"
        onChange={(e) =>
          setFormData(prev => ({
            ...prev,
            file_upload2: e.target.files[0]
          }))
        }
      />
    </Form.Group>
  </Col>
</Row>

          </Card.Body>
        </Card>

      

        <Row>
          <Col md="12">
            <Card className="mb-4">
              <Card.Header>
                <Card.Title as="h5">Work Order Items</Card.Title>
              </Card.Header>
              <Card.Body>
                {formData.items.map((item, idx) => (
                  <WorkOrderItem
                    key={item.id}
                    item={item}
                    index={idx}
                    subProductMaster={subProductMaster}
                    onUpdate={handleItemUpdate}
                    onRemove={removeItem}
                  />
                ))}
                <Button variant="secondary" onClick={addItem}>+ Add Item</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
  <Row className="d-flex justify-content-end">
          <Col md="3">
            <Card className="mb-4">
              <Card.Body>
                <div className="mb-2">
                  <strong className="me-2">Basic Amount:</strong>
                  <span>₹{calculatedTotals.basicAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="mb-2">
                  <strong className="me-2">GST (18%):</strong>
                  <span>₹{calculatedTotals.gst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="d-flex justify-content-start">
                  <h4 className="me-2">Total:</h4>
                  <h6 className="mt-1">₹{calculatedTotals.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h6>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="mb-4">
          <Card className="mb-4">
  <Tabs defaultActiveKey="remarks" id="workorder-extra-tabs">

    {/* Remarks Tab */}
    <Tab eventKey="remarks" title="Remarks">
      <Card.Body>
        <Form.Group>
          <Form.Label>Edit Terms & Conditions</Form.Label>
          <Suspense fallback={<Spinner animation="border" size="sm" />}>
            <LazyCKEditor
              editor={ClassicEditor}
              data={formData.terms_and_condition}
              onChange={(event, editor) => {
                setFormData(prev => ({
                  ...prev,
                  terms_and_condition: editor.getData()
                }));
              }}
              config={{ placeholder: "Enter or modify terms and conditions..." }}
            />
          </Suspense>
        </Form.Group>
      </Card.Body>
    </Tab>

    {/* Payment Terms Tab */}
    <Tab eventKey="paymentTerms" title="Payment Terms">
      <Card.Body>
        <Form.Group>
          <Form.Label>Edit Payment Terms</Form.Label>
          <Suspense fallback={<Spinner animation="border" size="sm" />}>
            <LazyCKEditor
              editor={ClassicEditor}
              data={formData.payment_details}
              onChange={(event, editor) => {
                setFormData(prev => ({
                  ...prev,
                   payment_details: editor.getData()
                }));
              }}
              config={{ placeholder: "Enter or modify payment terms..." }}
            />
          </Suspense>
        </Form.Group>
      </Card.Body>
    </Tab>

  </Tabs>
</Card>

        </Card>

        <div className="d-flex justify-content-end gap-3">
          <Button 
            variant="secondary" 
            onClick={handleCancel} 
            style={{ height: "40px" }} 
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={submitting} 
            style={{ backgroundColor: "#ed3131", border: "none", height: "40px" }}
          >
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              "Create Work Order"
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default WorkOrderForm;