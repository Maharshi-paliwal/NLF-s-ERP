import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, Row, Col, Form, Container, Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";

// --- API BASES ---
const API_BASE = "https://nlfs.in/erp/index.php/Erp";
const API_MASTER = "https://nlfs.in/erp/index.php/Api";

// convert "dd-mm-yyyy" or "yyyy-mm-dd" -> "yyyy-mm-dd" (for <input type="date">)
const toInputDate = (value) => {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length !== 3) return "";

  // already yyyy-mm-dd
  if (parts[0].length === 4) return value;

  // dd-mm-yyyy -> yyyy-mm-dd
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd}`;
};

const ViewLeads = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = !id || id === "new";

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // 🔹 Stage list from ERP
  const [stageOptions, setStageOptions] = useState([]);
  const [stageLoading, setStageLoading] = useState(false);

  // 🔹 Product list from master (Api/list_mst_product)
  const [productOptions, setProductOptions] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  // 🔹 Branch list from ERP (branch_list)
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);

  // 🔹 Salesperson list from ERP (sale_person_list)
  const [salespersonOptions, setSalespersonOptions] = useState([]);
  const [salespersonLoading, setSalespersonLoading] = useState(false);

  // 🔹 Store the RAW product value from backend temporarily
  const [rawProductValue, setRawProductValue] = useState("");

  // 🔹 Original stage to enforce transition rules
  const [originalStage, setOriginalStage] = useState("");

  // form state - product stores prod_id
  const [formData, setFormData] = useState({
    projectName: "",
    architectName: "",
    clientName: "",
    email: "",
    contractor: "",
    department: "",
    salespersonName: "",
    stage: "",
    remarks: "",
    visitDate: "",
    nextVisitDate: "",
    additionalNotes: "",
    officeBranch: "",
    product: "", // Changed from material to product
  });

  // ---------- FETCH STAGE MASTER LIST ----------
  const fetchStages = async () => {
    setStageLoading(true);
    try {
      const fd = new FormData();
      const res = await fetch(`${API_BASE}/stage_list`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      console.log("stage_list response (ViewLeads):", data);

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        setStageOptions(data.data || []);
      } else {
        console.error(data.message || "Failed to fetch stages.");
      }
    } catch (err) {
      console.error("Error fetching stages:", err);
    } finally {
      setStageLoading(false);
    }
  };

  // ---------- FETCH PRODUCT MASTER LIST ----------
  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const res = await fetch(`${API_MASTER}/list_mst_product`, {
        method: "POST",
      });

      const data = await res.json();
      console.log("list_mst_product response (ViewLeads):", data);

      if (
        (data.status === true || data.status === "true") &&
        (data.success === "1" || data.success === 1)
      ) {
        setProductOptions(data.data || []);
        return data.data || [];
      } else {
        console.error(data.message || "Failed to fetch products.");
        return [];
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      return [];
    } finally {
      setProductLoading(false);
    }
  };

  // ---------- FETCH BRANCH MASTER LIST ----------
  const fetchBranches = async () => {
    setBranchLoading(true);
    try {
      const res = await fetch(`${API_BASE}/branch_list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      console.log("branch_list response (ViewLeads):", data);

      if (
        (data.status === true || data.status === "true") &&
        (data.success === "1" || data.success === 1)
      ) {
        setBranchOptions(data.data || []);
      } else {
        console.error(data.message || "Failed to fetch branches.");
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
    } finally {
      setBranchLoading(false);
    }
  };

  // ---------- FETCH SALESPERSON MASTER LIST ----------
  const fetchSalespersons = async () => {
    setSalespersonLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sale_person_list`, {
        method: "GET",
      });

      const data = await res.json();
      console.log("sale_person_list response (ViewLeads):", data);

      if (
        (data.status === true || data.status === "true") &&
        (data.success === "1" || data.success === 1)
      ) {
        const list = Array.isArray(data.data) ? data.data : [];
        const onlySalespersons = list.filter(
          (sp) => (sp.role || "").toLowerCase() === "salesperson"
        );
        setSalespersonOptions(onlySalespersons);
      } else {
        console.error(data.message || "Failed to fetch salespersons.");
      }
    } catch (err) {
      console.error("Error fetching salespersons:", err);
    } finally {
      setSalespersonLoading(false);
    }
  };

  // ---------- FETCH EXISTING LEAD DATA BY ID ----------
  useEffect(() => {
    const controller = new AbortController();

    const fetchLead = async () => {
      if (isNew) {
        // new: just load dropdown masters
        fetchStages();
        fetchProducts();
        fetchBranches();
        fetchSalespersons();
        return;
      }

      try {
        setLoading(true);
        setApiError("");

        // First, load products synchronously and wait for them
        console.log("📦 Step 1: Fetching products first...");
        const products = await fetchProducts();
        console.log("✅ Products loaded:", products);

        // Then load other masters
        fetchStages();
        fetchBranches();
        fetchSalespersons();

        // Then fetch the lead data
        console.log("📋 Step 2: Fetching lead data...");
        const res = await fetch(`${API_BASE}/fetch_lead_data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Network error");

        const data = await res.json();
        console.log("✅ fetch_lead_data response:", data);

        if (
          !(data.status === true || data.status === "true") ||
          data.success !== "1" ||
          !data.data
        ) {
          setApiError(data.message || "Lead not found.");
          return;
        }

        const lead = Array.isArray(data.data) ? data.data[0] : data.data;

        // Simplified product matching
        let productValue = lead.prod_id || "";

        // If no prod_id, try to match by product name
        if (!productValue && (lead.producttype || lead.material)) {
          const productName = lead.producttype || lead.material;
          const matchingProduct = products.find(
            (p) => String(p.product_name).toLowerCase().trim() === 
                   String(productName).toLowerCase().trim()
          );
          productValue = matchingProduct ? String(matchingProduct.prod_id) : "";
        }

        console.log("🎯 Final product value to set:", productValue);
        setRawProductValue(productValue);

        setFormData({
          projectName: lead.project_name || "",
          architectName: lead.architech_name || "",
          clientName: lead.client_name || "",
          email: lead.email || "",
          contractor: lead.contractor || "",
          department: lead.department || "",
          salespersonName: lead.sales_person || "",
          stage: lead.stage || "",
          remarks: lead.remark || "",
          visitDate: lead.visiting_date || "",
          nextVisitDate: lead.nxt_visit_date || "",
          additionalNotes: lead.additional_notes || "",
          officeBranch: lead.branch || "",
          product: lead.product || "", // Changed from material to product
        });

        // store original stage for transition rules
        setOriginalStage(lead.stage || "");
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setApiError("Something went wrong while fetching lead data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
    return () => controller.abort();
  }, [id, isNew]);

  // ---------- FORM HANDLERS ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("📝 Field changed:", name, "→", value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------- UPDATE LEAD ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setApiError("");

      if (!isNew) {
        // Stage transition rules (server-side guard)
        const newStage = (formData.stage || "").toLowerCase();
        const prevStage = (originalStage || "").toLowerCase();

        if (prevStage === "civil") {
          const allowedFromCivil = ["civil", "finalised", "lost"];
          if (!allowedFromCivil.includes(newStage)) {
            alert("From 'Civil' you can only move to 'Finalised' or 'Lost' (or stay on 'Civil').");
            return;
          }
        }
        if (prevStage === "finalised") {
          const allowedFromFinalised = ["finalised", "submit"];
          if (!allowedFromFinalised.includes(newStage)) {
            alert("From 'Finalised' you can only move to 'Submit' (or stay on 'Finalised').");
            return;
          }
        }
        if (prevStage === "lost" && newStage !== "lost") {
          alert("Once a lead is marked 'Lost', its status cannot be changed.");
          return;
        }
        if (prevStage === "submit" && newStage !== "submit") {
          alert("Once a lead is marked 'Submit', its status cannot be changed.");
          return;
        }

        // Find the product to get both ID and name
        const selectedProduct = productOptions.find(
          (p) => p.prod_id === formData.product
        );

        const payload = {
          id: String(id),
          project_name: formData.projectName,
          architech_name: formData.architectName,
          client_name: formData.clientName,
          email: formData.email || "",
          branch: formData.officeBranch,
          contractor: formData.contractor,
          department: formData.department,
          sales_person: formData.salespersonName,
          stage: formData.stage,
          remark: formData.remarks,
          visiting_date: formData.visitDate,
          nxt_visit_date: formData.nextVisitDate,
          additional_notes: formData.additionalNotes || "",
          // Send product information consistently
          product: formData.product,  // Send the prod_id
        };

        console.log("📤 update_lead_data payload:", payload);

        const res = await fetch(`${API_BASE}/update_lead_data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("📥 update_lead_data response:", data);

        if (
          (data.status === true || data.status === "true") &&
          (data.success === "1" || data.success === 1)
        ) {
          alert(data.message || "Lead updated successfully");
          navigate("/leadgeneration");
        } else {
          setApiError(data.message || "Failed to update lead.");
        }
      } else {
        console.log("New lead submit (not wired):", formData);
        alert("Add-lead API not wired yet (only view/update).");
      }
    } catch (err) {
      console.error(err);
      setApiError("Something went wrong while saving lead.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- RENDER ----------
  if (!isNew && apiError && !loading) {
    return (
      <Container className="py-5 text-center">
        <h4>{apiError}</h4>
        <Button as={Link} to="/leadgeneration" className="mt-3">
          <FaArrowLeft className="me-2" /> Back to Leads
        </Button>
      </Container>
    );
  }

  if (loading && !formData.projectName && !isNew) {
    return (
      <Container className="py-5 text-center">
        <h5>Loading lead data...</h5>
      </Container>
    );
  }

  const originalStageLower = (originalStage || "").toLowerCase();
  const stageSelectLocked =
    originalStageLower === "lost" || originalStageLower === "submit";

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">
            {isNew ? "Add New Lead" : "Edit Lead"}
          </h5>
          <Button
            as={Link}
            to="/leadgeneration"
            variant="outline-primary"
            size="sm"
          >
            <FaArrowLeft className="me-2" />
            Back
          </Button>
        </Card.Header>

        <Card.Body>
          {apiError && (
            <p className="text-danger mb-3" style={{ fontSize: "0.9rem" }}>
              {apiError}
            </p>
          )}

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Project Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Architect Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="architectName"
                    value={formData.architectName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Client Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Email */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Branch & Product */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    name="officeBranch"
                    value={formData.officeBranch}
                    onChange={handleChange}
                  >
                    <option value="">Select Branch</option>
                    {branchLoading && <option>Loading branches...</option>}
                    {!branchLoading &&
                      branchOptions.map((b) => (
                        <option
                          key={b.id || b.branch_id || b.branch_name}
                          value={b.branch_name}
                        >
                          {b.branch_name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Product</Form.Label>
                  <Form.Select
                    name="product"  // Changed from "material" to "product"
                    value={formData.product}
                    onChange={handleChange}
                  >
                    <option value="">Select Product</option>
                    {productLoading && <option>Loading products...</option>}
                    {!productLoading &&
                      productOptions.map((p) => (
                        <option key={p.prod_id || p.product_name} >
                          {p.product_name}
                        </option>
                      ))}
                  </Form.Select>
                  {/* Debug info */}
                 
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Contractor</Form.Label>
                  <Form.Control
                    type="text"
                    name="contractor"
                    value={formData.contractor}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Salesperson</Form.Label>
                  <Form.Select
                    name="salespersonName"
                    value={formData.salespersonName}
                    onChange={handleChange}
                  >
                    <option value="">Select Salesperson</option>
                    {salespersonLoading && <option>Loading...</option>}
                    {!salespersonLoading &&
                      salespersonOptions.map((sp) => (
                        <option
                          key={sp.emp_id || sp.id || sp.name}
                          value={sp.name}
                        >
                          {sp.name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Stage</Form.Label>
                  <Form.Select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    disabled={stageSelectLocked}
                  >
                    <option value="">Select...</option>
                    {stageLoading && <option>Loading...</option>}
                    {!stageLoading &&
                      stageOptions.map((stg) => {
                        const label = stg.stage || stg.name || "";
                        const lower = label.toLowerCase();
                        const current = originalStageLower;

                        let disabled = false;

                        // civil → civil / finalised / lost
                        if (current === "civil") {
                          const allowedFromCivil = [
                            "civil",
                            "finalised",
                            "lost",
                          ];
                          disabled = !allowedFromCivil.includes(lower);
                        }
                        // finalised → finalised / submit
                        else if (current === "finalised") {
                          const allowedFromFinalised = [
                            "finalised",
                            "submit",
                          ];
                          disabled = !allowedFromFinalised.includes(lower);
                        }
                        // lost → only lost (but select already disabled by stageSelectLocked)
                        else if (current === "lost") {
                          disabled = lower !== "lost";
                        }
                        // submit → only submit (but select already disabled by stageSelectLocked)
                        else if (current === "submit") {
                          disabled = lower !== "submit";
                        }

                        return (
                          <option
                            key={stg.stage_id || stg.id || label}
                            value={label}
                            disabled={disabled}
                          >
                            {label}
                          </option>
                        );
                      })}
                  </Form.Select>
                  <Form.Text className="text-muted d-block mt-1">
                    Original stage: {originalStage || "-"}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Additional Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Visit Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="visitDate"
                    value={toInputDate(formData.visitDate)}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Next Visit</Form.Label>
                  <Form.Control
                    type="date"
                    name="nextVisitDate"
                    value={toInputDate(formData.nextVisitDate)}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" type="submit" disabled={loading}>
                {isNew ? "Save Lead" : "Update Lead"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ViewLeads;