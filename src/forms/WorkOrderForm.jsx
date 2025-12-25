// src/pages/WorkOrderForm.jsx
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
import { FaArrowLeft, FaUpload , FaMinus} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const ROOT = "https://nlfs.in/erp/index.php"; // base root used by some endpoints (Erp/*)
const API_BASE_URL = `${ROOT}/Api`; // Api endpoints (Api/*)

const getInitialState = () => ({
  wo_no: "",
  po_id: "",
  po_no: "",
  quto_id: "",
  branch: "",          // ✅ ADD THIS
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
  po_metadata: {},
  full_amount: "",
  items: [],
  payment_details: "",
  terms_conditions: "",
  warranty: "",
  quote_terms: "", // 👈 ADD THIS to store terms from quote
});

const WorkOrderForm = () => {
  const navigate = useNavigate();
  const { quoteId } = useParams(); // quotation id from route
  const [formData, setFormData] = useState(getInitialState);
  const [submitting, setSubmitting] = useState(false);
  const [poList, setPoList] = useState([]);
  const [isLoadingPOs, setIsLoadingPOs] = useState(true);
  const [nextWoNumber, setNextWoNumber] = useState("");
  const [isFetchingWoNo, setIsFetchingWoNo] = useState(false);
  const [quotationData, setQuotationData] = useState(null);
  const [isLoadingQuotation, setIsLoadingQuotation] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [subProductMaster, setSubProductMaster] = useState([]);

  // --- API helpers ---

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles.length) {
      toast.error("Please select at least one file");
      return;
    }

    try {
      setUploadingFiles(true);

      const formDataPayload = new FormData();
      selectedFiles.forEach((file) => {
        formDataPayload.append("files[]", file);
      });

      // Optional: attach WO / Quote reference
      formDataPayload.append("quote_id", formData.quto_id || quoteId);
      formDataPayload.append("wo_no", formData.wo_no || nextWoNumber);

      const res = await axios.post(
        `${API_BASE_URL}/upload_workorder_files`,
        formDataPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.status === "true" || res.data.status === true) {
        toast.success("Files uploaded successfully");
        setSelectedFiles([]);
        setShowUploadModal(false);
      } else {
        toast.error(res.data.message || "Upload failed");
      }
    } catch (err) {
      console.error("File upload error:", err);
      toast.error("Failed to upload files");
    } finally {
      setUploadingFiles(false);
    }
  };

  const fetchSubProductMaster = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/list_mst_sub_product`);
      if (res.data.status === "true") {
        setSubProductMaster(res.data.data || []);
      }
    } catch (e) {
      console.error("Failed to load sub product master", e);
    }
  };

  const fetchPOList = async () => {
    try {
      setIsLoadingPOs(true);
      const res = await axios.get(`${API_BASE_URL}/list_po`);
      const data = res.data;
      if ((data.status === "true" || data.status === true) && data.data) {
        setPoList(data.data);
      } else {
        setPoList([]);
      }
    } catch (err) {
      console.error("Failed to fetch PO list:", err);
      setPoList([]);
    } finally {
      setIsLoadingPOs(false);
    }
  };

  const fetchNextWoNumber = async () => {
    try {
      setIsFetchingWoNo(true);
      const res = await axios.get(`${ROOT}/Erp/get_next_wo_no`);
      const d = res.data;
      const nextWo =
        d.next_wo_no ||
        d.next_work_no ||
        d.next_wo ||
        d.next_quote_no ||
        "";
      if (nextWo) {
        setNextWoNumber(nextWo);
        setFormData((prev) => ({ ...prev, wo_no: nextWo }));
      }
    } catch (err) {
      console.error("Error fetching next WO number:", err);
    } finally {
      setIsFetchingWoNo(false);
    }
  };

  const fetchQuotation = async () => {
    if (!quoteId) return;
    try {
      setIsLoadingQuotation(true);
      const res = await axios.post(`${ROOT}/Nlf_Erp/get_quotation_by_id`, {
        quote_id: String(quoteId),
      });
      const d = res.data;
      if (d.status && d.data) {
        const q = d.data;
        setQuotationData(q);

        // Map quotation items to form items.
        // Since we don't have brand/product/subproduct IDs, we'll just use the strings from the API.
        const mappedItems = q.items.map((item, idx) => {
          const matchedSub = subProductMaster.find(
            (sp) =>
              sp.brand === item.brand &&
              sp.g3_category === item.product &&
              sp.item_name === item.sub_product
          );

          return {
            id: `wo-item-${Date.now()}-${idx}`,
            // quotation values
            brand: (item.brand || "").trim(),
            product: item.product || "",
            sub_product: item.sub_product || "",
            description: item.desc || "",
            unit: item.unit || "",
            quantity: String(item.qty || ""),
            rate: String(item.rate || ""),
            amount: String(item.amt || ""),
            // dropdown helpers
            selectedSubProductObj: matchedSub || null,
          };
        });

        setFormData((prev) => ({
          ...prev,
          quto_id: q.quote_no || quoteId,
          branch: q.branch || "",
          full_amount: String(q.total ?? q.total_amount ?? ""),
          items: mappedItems, // ✅ KEY LINE
        quote_terms: q.terms || "",
terms_conditions: q.terms || "", // 👈 make it editable copy

          notes:
            prev.notes ||
            [
              q.company ? `Company: ${q.company}` : "",
              q.site_address ? `Site: ${q.site_address}` : "",
            ]
              .filter(Boolean)
              .join(" | "),
        }));
      } else {
        console.warn("Quotation fetch returned no data:", d);
      }
    } catch (err) {
      console.error("Error fetching quotation for WO:", err);
    } finally {
      setIsLoadingQuotation(false);
    }
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const items = [...prev.items];
      items[index][field] = value;

      // Recalculate amount if quantity or rate changes
      if (field === "quantity" || field === "rate") {
        const q = Number(items[index].quantity || 0);
        const r = Number(items[index].rate || 0);
        items[index].amount = String(q * r);
      }

      return { ...prev, items };
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: `wo-item-${Date.now()}`,
        // Initialize with empty strings for new items
        product: "",
        sub_product: "",
        description: "",
        unit: "",
        quantity: "",
        rate: "",
        amount: "",
      }]
    }));
  };

  const removeItem = (idx) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handlePoSelect = (po_no_or_id) => {
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
        // keep existing quto_id (from quotation) if set,
        // otherwise fall back to whatever PO carries
        formData.quto_id ||
        selected.quote_id ||
        selected.quote_no ||
        selected.quto_id ||
        selected.po_no ||
        "",
      po_metadata: selected,
    };
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleMainChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDateToDDMMYYYY = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  };

  // --- New: auto-calc balance when advance_amt and full_amount change ---
  useEffect(() => {
    const advRaw = formData.advance_amt;
    const fullRaw = formData.full_amount || (quotationData && (quotationData.total ?? quotationData.total_amount)) || "";
    // only calculate when advance has a value (user requested behavior)
    if (advRaw === "" || advRaw === null || advRaw === undefined) {
      return; // do not overwrite bal_amt if advance is empty
    }
    // sanitize numbers (remove commas etc.)
    const advNum = Number(String(advRaw).replace(/,/g, ""));
    const fullNum = Number(String(fullRaw).replace(/,/g, ""));
    if (Number.isNaN(advNum) || Number.isNaN(fullNum)) {
      console.warn("Skipping balance calc: non-numeric full or advance:", { advRaw, fullRaw });
      return;
    }
    let bal = fullNum - advNum;
    if (!isFinite(bal)) return;
    if (bal < 0) {
      console.warn("Advance exceeds full amount; setting balance to 0");
      bal = 0;
    }
    // keep same type as other form fields (strings)
    setFormData((prev) => ({ ...prev, bal_amt: String(bal) }));
  }, [formData.advance_amt, formData.full_amount, quotationData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const endpoint = `${API_BASE_URL}/add_work_order`;
      const base = {
        ...formData,
        po_id: formData.po_id || formData.po_metadata?.po_id || "",
        po_no: formData.po_no || formData.po_metadata?.po_no || "",
        quto_id: formData.quto_id || quotationData?.quote_no || quoteId || "",
        exp_delivery_date: formatDateToDDMMYYYY(formData.exp_delivery_date), // <-- Date fixed
      };

      // Prepare payload for submission
     const payload = {
  ...base,
  wo_no: formData.wo_no || nextWoNumber || "",
  full_amount: base.full_amount,
  terms_conditions: formData.terms_conditions, // ✅ ADD THIS
  items: formData.items.map((i) => ({
    brand: i.brand || "",
    item_name: i.product,
    sub_product: i.sub_product,
    description: i.description,
    unit: i.unit,
    quantity: i.quantity,
    unit_price: i.rate,
  })),
};


      console.log("Submitting work order payload:", payload);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log("API response:", result);
      if (result.status === "true" || result.status === true) {
        toast.success(result.message || "Work Order created successfully!");
        setTimeout(() => {
          navigate("/clients");
        }, 500);
      } else {
        toast.error(result.message || "Failed to create work order");
      }
    } catch (error) {
      console.error("Error submitting work order:", error);
      toast.error("Failed to submit work order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  // On mount: fetch PO list (optional) + next WO number + quotation
  useEffect(() => {
    fetchPOList();
    fetchNextWoNumber();
    fetchQuotation();
    fetchSubProductMaster();
  }, [quoteId]);

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
            <Card.Title as="h4">Create New Work Order</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row>
              {/* WO No */}
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
              {/* Quote No */}
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>Quote No</Form.Label>
                  <Form.Control
                    type="text"
                    value={
                      formData.quto_id ||
                      quotationData?.quote_no ||
                      quoteId ||
                      ""
                    }
                    readOnly
                  />
                </Form.Group>
              </Col>
              {/* Branch */}
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>Branch</Form.Label>
                  <Form.Control
                    type="text"
                    name="branch"
                    value={formData.branch}
                    readOnly
                    placeholder={isLoadingQuotation ? "Fetching..." : "Branch"}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>Expected Delivery Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="exp_delivery_date"
                    value={formData.exp_delivery_date}
                    onChange={handleMainChange}
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
                  />
                </Form.Group>
              </Col>
              <Col md="4">
                <Form.Group className="mb-3">
                  <Form.Label>Color Scheme</Form.Label>
                  <Form.Control
                    type="text"
                    name="color_scheme"
                    value={formData.color_scheme}
                    onChange={handleMainChange}
                    placeholder="e.g. Black & White"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>
            <Card.Title as="h5">Work Order Items</Card.Title>
          </Card.Header>
          <Card.Body>
            {formData.items.map((item, idx) => (
              <div key={item.id} className="border rounded p-3 mb-3">
                {/* Brand / Product / Sub Product */}
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Brand</Form.Label>
                      <Form.Select
                        value={item.brand || ""}
                        onChange={(e) => {
                          updateItem(idx, "brand", e.target.value);
                          updateItem(idx, "product", "");
                          updateItem(idx, "sub_product", "");
                        }}
                      >
                        <option value="">Select Brand</option>
                        {[...new Set(subProductMaster
                          .filter(sp => sp.brand && sp.brand.trim() !== "")
                          .map(sp => sp.brand.trim())
                        )].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Product</Form.Label>
                      <Form.Select
                        value={item.product}
                        onChange={(e) => {
                          updateItem(idx, "product", e.target.value);
                          updateItem(idx, "sub_product", "");
                        }}
                      >
                        <option value="">Select Product</option>
                        {[...new Set(
                          subProductMaster
                            .filter(sp => sp.brand === item.brand && sp.g3_category && sp.g3_category.trim() !== "")
                            .map(sp => sp.g3_category.trim())
                        )].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Sub Product</Form.Label>
                      <Form.Select
                        value={item.sub_product}
                        onChange={(e) => {
                          const sp = subProductMaster.find(
                            s =>
                              s.brand === item.brand &&
                              s.g3_category === item.product &&
                              s.item_name === e.target.value
                          );

                          setFormData(prev => {
                            const items = [...prev.items];
                            items[idx] = {
                              ...items[idx],
                              sub_product: e.target.value,
                              description: sp?.specification || "",
                              unit: sp?.uom || "",
                            };
                            return { ...prev, items };
                          });
                        }}
                      >
                        <option value="">Select Sub Product</option>
                        {subProductMaster
                          .filter(sp =>
                            sp.brand === item.brand &&
                            sp.g3_category === item.product
                          )
                          .map(sp => (
                            <option key={sp.id} value={sp.item_name}>
                              {sp.item_name}
                            </option>
                          ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={item.description}
                        onChange={(e) =>
                          updateItem(idx, "description", e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {/* Qty / Rate / Amount */}
                <Row className="align-items-end">
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Unit</Form.Label>
                      <Form.Control
                        value={item.unit}
                        onChange={(e) =>
                          updateItem(idx, "unit", e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Qty</Form.Label>
                      <Form.Control
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(idx, "quantity", e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Rate</Form.Label>
                      <Form.Control
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(idx, "rate", e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Amount</Form.Label>
                      <Form.Control value={item.amount} readOnly />
                    </Form.Group>
                  </Col>
                </Row>
                {/* Remove button – quotation style */}
                {idx > 0 && (
                  <div className="mt-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeItem(idx)}
                      style={{
                        padding: "4px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FaMinus size={12} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <Button variant="secondary" onClick={addItem}>
              + Add Item
            </Button>
          </Card.Body>
        </Card>

        {/* Tab Layout */}
        <Card className="mb-4">
          <Tabs defaultActiveKey="payment" id="workorder-extra-tabs">
            {/* Terms and Conditions Tab - Updated to display quote terms */}
            <Tab eventKey="payment" title="Terms and conditions">
              <Card.Body>
               {isLoadingQuotation ? (
  <div className="text-center py-3">
    <Spinner animation="border" size="sm" className="me-2" />
    Loading terms and conditions...
  </div>
) : (
  <Form.Group>
    <Form.Label>Edit Terms & Conditions</Form.Label>

    <Form.Control
      as="textarea"
      rows={10}
      value={formData.terms_conditions}
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          terms_conditions: e.target.value,
        }))
      }
      placeholder="Enter or modify terms and conditions"
    />
  </Form.Group>
)}

        </Card.Body>
            </Tab>

            {/* Payment Details Tab */}
            <Tab eventKey="terms" title="Payment Details">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Details</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="payment_details"
                    value={formData.payment_details}
                    onChange={handleMainChange}
                    placeholder="Enter payment terms, milestones, schedules, etc."
                  />
                </Form.Group>
              </Card.Body>
            </Tab>

            {/* Warranty Tab */}
            <Tab eventKey="warranty" title="Warranty">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Warranty</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleMainChange}
                    placeholder="Enter warranty details..."
                  />
                </Form.Group>
              </Card.Body>
            </Tab>
          </Tabs>
        </Card>

        {/* Submit Buttons */}
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
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Creating...
              </>
            ) : (
              "Create Work Order"
            )}
          </Button>
          <Button
            variant="outline-primary"
            style={{ height: "40px" }}
            onClick={() => setShowUploadModal(true)}
          >
            <FaUpload/>
          </Button>
        </div>
      </Form>

      <Modal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        centered
      >
        <Modal.Header closeButton className="text-light bg-danger">
          <Modal.Title >Upload Documents</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Files</Form.Label>
            <Form.Control
              type="file"
              multiple
              onChange={handleFileChange}
            />
            
          </Form.Group>

          {selectedFiles.length > 0 && (
            <ul className="mt-3">
              {selectedFiles.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowUploadModal(false)}
            disabled={uploadingFiles}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleFileUpload}
            disabled={uploadingFiles}
          >
            {uploadingFiles ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default WorkOrderForm;