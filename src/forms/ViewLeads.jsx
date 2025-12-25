// ViewLeads.jsx
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
  if (parts[0].length === 4) return value; // already yyyy-mm-dd
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd}`;
};

// Helper: normalize a stage just for comparison
const normalizeStage = (s) => (s || "").toLowerCase().trim();

// --- STATIC PRODUCT LIST (same as NewLead) ---
const STATIC_PRODUCTS = [
  { value: "ceiling_facade", label: "Ceiling / Facade" },
  { value: "roofing", label: "Roofing" },
  { value: "furnishing", label: "Furnishing" },
  { value: "acoustics", label: "Acoustics" },
  { value: "modular_furniture", label: "Modular Furniture" },
];

const ViewLeads = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // masters
  const [stageOptions, setStageOptions] = useState([]);
  const [stageLoading, setStageLoading] = useState(false);

  const [productOptions, setProductOptions] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  const [branchOptions, setBranchOptions] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);

  const [salespersonOptions, setSalespersonOptions] = useState([]);
  const [salespersonLoading, setSalespersonLoading] = useState(false);

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);

  const [originalStage, setOriginalStage] = useState("");

  // Create a map of stage names to their order in the progression
  const [stageOrderMap, setStageOrderMap] = useState({});
  // Track if we have a "lost" stage in our options
  const [lostStageValue, setLostStageValue] = useState("");

  // form state - product standardized to store either static value (eg "modular_furniture")
  // or fallback prod_id/raw value when it doesn't match static list.
  const [formData, setFormData] = useState({
    projectName: "",
    architectName: "",
    clientName: "",
    email: "",
    contractor: "",
    department: "",
    salespersonId: "",
    stage: "",
    remarks: "",
    visitDate: "",
    nextVisitDate: "",
    additionalNotes: "",
    officeBranch: "",
    product: "", // static product value OR prod_id/raw fallback
  });

  // ---------- FETCH FUNCTIONS (masters) ----------
  const fetchStages = async () => {
    setStageLoading(true);
    try {
      const fd = new FormData();
      const res = await fetch(`${API_BASE}/stage_list`, { method: "POST", body: fd });
      const data = await res.json();
      if ((data.status === true || data.status === "true") && data.success === "1") {
        // Sort stages by their ID to maintain order
        const sortedStages = (data.data || []).sort((a, b) => {
          const idA = parseInt(a.stage_id || a.id || 0);
          const idB = parseInt(b.stage_id || b.id || 0);
          return idA - idB;
        });
        setStageOptions(sortedStages);
      } else console.error("Failed to fetch stages.", data);
    } catch (err) {
      console.error("Error fetching stages:", err);
    } finally {
      setStageLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const res = await fetch(`${API_MASTER}/list_mst_product`, { method: "POST" });
      const data = await res.json();
      if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
        setProductOptions(data.data || []);
        return data.data || [];
      } else {
        console.error("Failed to fetch products.", data);
        return [];
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      return [];
    } finally {
      setProductLoading(false);
    }
  };

  const fetchBranches = async () => {
    setBranchLoading(true);
    try {
      const res = await fetch(`${API_BASE}/branch_list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
        setBranchOptions(data.data || []);
      } else console.error("Failed to fetch branches.", data);
    } catch (err) {
      console.error("Error fetching branches:", err);
    } finally {
      setBranchLoading(false);
    }
  };

  const fetchSalespersons = async () => {
    setSalespersonLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sale_person_list`, { method: "GET" });
      const data = await res.json();
      if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
        const list = Array.isArray(data.data) ? data.data : [];
        setSalespersonOptions(list);
        return list;
      } else {
        console.error("Failed to fetch salespersons.", data);
        return [];
      }
    } catch (err) {
      console.error("Error fetching salespersons:", err);
      return [];
    } finally {
      setSalespersonLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setDepartmentLoading(true);
    try {
      const fd = new FormData();
      const res = await fetch(`${API_BASE}/department_list`, { method: "POST", body: fd });
      const data = await res.json();
      if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
        setDepartmentOptions(Array.isArray(data.data) ? data.data : []);
        return Array.isArray(data.data) ? data.data : [];
      } else {
        console.error("Failed to fetch departments.", data);
        return [];
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      return [];
    } finally {
      setDepartmentLoading(false);
    }
  };

  // Update stageOrderMap and lostStageValue whenever stageOptions changes
  useEffect(() => {
    if (stageOptions.length > 0) {
      // Create a map of stage names to their order
      const orderMap = {};
      let lostStage = "";
      
      stageOptions.forEach((stage, index) => {
        const stageName = normalizeStage(stage.stage || stage.name || "");
        if (stageName) {
          orderMap[stageName] = index;
          
          // Check if this is the "lost" stage
          if (stageName === "lost") {
            lostStage = stage.stage || stage.name;
          }
        }
      });
      
      setStageOrderMap(orderMap);
      setLostStageValue(lostStage);
    }
  }, [stageOptions]);

  // ---------- FETCH EXISTING LEAD DATA BY ID ----------
  useEffect(() => {
    const controller = new AbortController();

    const fetchLead = async () => {
      if (isNew) {
        // load masters and return
        fetchStages();
        fetchProducts();
        fetchBranches();
        fetchSalespersons();
        fetchDepartments();
        return;
      }

      try {
        setLoading(true);
        setApiError("");

        // 1) fetch product master first (used to map prod_id -> product_name if needed)
        const products = await fetchProducts();

        // 2) fetch other masters in parallel and wait
        await Promise.all([fetchStages(), fetchBranches(), fetchSalespersons(), fetchDepartments()]);

        // 3) fetch the lead
        const res = await fetch(`${API_BASE}/fetch_lead_data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Network response not ok");

        const data = await res.json();
        if (!(data.status === true || data.status === "true") || data.success !== "1" || !data.data) {
          setApiError(data.message || "Lead not found.");
          return;
        }

        const lead = Array.isArray(data.data) ? data.data[0] : data.data;

        // ---- Resolve product to static value if possible ----
        let productValue = "";
        // Attempt direct match against static list (look at lead.product / producttype / material)
        const candidates = [lead.product, lead.producttype, lead.material].filter(Boolean).map(String);
        if (candidates.length) {
          const joined = candidates.join(" ").toLowerCase();
          // match by static value (value or label)
          const matchedStatic = STATIC_PRODUCTS.find((p) => {
            const val = String(p.value).toLowerCase();
            const lab = String(p.label).toLowerCase();
            return joined.includes(val) || joined.includes(lab);
          });
          if (matchedStatic) productValue = matchedStatic.value;
        }

        // If still empty, try prod_id -> set to prod_id (fallback); or match product master by name -> prod_id
        if (!productValue) {
          if (lead.prod_id) {
            // backend used master prod_id; we store prod_id raw as fallback
            productValue = String(lead.prod_id);
          } else if (lead.product) {
            // try to match by product master name
            const match = (products || []).find(
              (p) => String(p.product_name).toLowerCase().trim() === String(lead.product).toLowerCase().trim()
            );
            if (match) productValue = String(match.prod_id);
            else productValue = String(lead.product); // raw fallback
          }
        }

        // ---- Resolve salespersonId (emp_id) ----
        const salespersonId = lead.sales_person ? String(lead.sales_person) : "";

        // ---- Resolve department to dpt_id if possible ----
        let departmentValue = "";
        if (lead.department) {
          const d = String(lead.department);
          const byId = departmentOptions.find((dept) => String(dept.dpt_id) === d);
          const byName = departmentOptions.find(
            (dept) => String(dept.department).toLowerCase().trim() === d.toLowerCase().trim()
          );
          if (byId) departmentValue = String(byId.dpt_id);
          else if (byName) departmentValue = String(byName.dpt_id);
          else departmentValue = d;
        }

        setFormData({
          projectName: lead.project_name || "",
          architectName: lead.architech_name || "",
          clientName: lead.client_name || "",
          email: lead.email || "",
          contractor: lead.contractor || "",
          department: departmentValue,
          salespersonId,
          stage: lead.stage || "",
          remarks: lead.remark || "",
          visitDate: lead.visiting_date || "",
          nextVisitDate: lead.nxt_visit_date || "",
          additionalNotes: lead.additional_notes || "",
          officeBranch: lead.branch || "",
          product: productValue || "",
        });

        setOriginalStage(lead.stage || "");
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error in fetchLead:", err);
          setApiError("Something went wrong while fetching lead data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  // ---------- FORM HANDLERS ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Get the allowed next stages for a lead based on current stage
  const getAllowedStagesForLead = (currentStageNorm) => {
    const currentOrder = stageOrderMap[currentStageNorm];
    
    // If current stage is not in our map, return empty
    if (currentOrder === undefined) return [];
    
    // Start with the current stage
    const allowedStages = [currentStageNorm];
    
    // If current stage is the last one, return only itself
    if (currentOrder === stageOptions.length - 1) {
      return allowedStages;
    }
    
    // Add the next stage in the progression
    const nextStageNorm = normalizeStage(stageOptions[currentOrder + 1]?.stage || stageOptions[currentOrder + 1]?.name || "");
    if (nextStageNorm) {
      allowedStages.push(nextStageNorm);
    }
    
    // Add the "lost" stage if it exists and the current stage is not already "lost"
    if (lostStageValue && currentStageNorm !== "lost") {
      allowedStages.push("lost");
    }
    
    return allowedStages;
  };

  // ---------- UPDATE LEAD ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setApiError("");

      if (!isNew) {
        // Dynamic stage rules based on the stage order map
        const newStage = normalizeStage(formData.stage);
        const prevStage = normalizeStage(originalStage);

        // Get the allowed stages for the current stage
        const allowedNorm = getAllowedStagesForLead(prevStage);
        
        // Check if the new stage is allowed
        if (!allowedNorm.includes(newStage)) {
          if (newStage === "lost") {
            alert("Cannot move to 'lost' stage from this stage.");
          } else {
            alert("Invalid stage transition. You can only move to the next stage in sequence or to 'lost'.");
          }
          return;
        }

        // Build payload: send product exactly as stored in formData.product
        const payload = {
          id: String(id),
          project_name: formData.projectName || "",
          architech_name: formData.architectName || "",
          client_name: formData.clientName || "",
          email: formData.email || "",
          branch: formData.officeBranch || "",
          contractor: formData.contractor || "",
          department: formData.department || "",
          sales_person: formData.salespersonId || "",
          stage: formData.stage || "",
          remark: formData.remarks || "",
          visiting_date: formData.visitDate || "",
          nxt_visit_date: formData.nextVisitDate || "",
          additional_notes: formData.additionalNotes || "",
          product: formData.product || "",
        };

        const res = await fetch(`${API_BASE}/update_lead_data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
          alert(data.message || "Lead updated successfully");
          navigate("/leadgeneration");
        } else {
          setApiError(data.message || "Failed to update lead.");
        }
      } else {
        alert("Add-lead not implemented here.");
      }
    } catch (err) {
      console.error("Error saving lead:", err);
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

  const originalStageLower = normalizeStage(originalStage);
  const currentStageLower = normalizeStage(formData.stage);
  const stageSelectLocked = originalStageLower === "lost" || 
                           (stageOrderMap[originalStageLower] !== undefined && 
                            stageOrderMap[originalStageLower] === stageOptions.length - 1);

  // Get allowed stages for the current stage
  const allowedNorm = getAllowedStagesForLead(originalStageLower);

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">{isNew ? "Add New Lead" : "Edit Lead"}</h5>
          <Button as={Link} to="/leadgeneration" variant="outline-primary" size="sm">
            <FaArrowLeft className="me-2" />
            Back
          </Button>
        </Card.Header>

        <Card.Body>
          {apiError && <p className="text-danger mb-3" style={{ fontSize: "0.9rem" }}>{apiError}</p>}

          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Project Name *</Form.Label>
                  <Form.Control type="text" name="projectName" value={formData.projectName} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Architect Name</Form.Label>
                  <Form.Control type="text" name="architectName" value={formData.architectName} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Client Name</Form.Label>
                  <Form.Control type="text" name="clientName" value={formData.clientName} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Branch</Form.Label>
                  <Form.Select name="officeBranch" value={formData.officeBranch} onChange={handleChange}>
                    <option value="">Select Branch</option>
                    {branchLoading && <option>Loading branches...</option>}
                    {!branchLoading &&
                      branchOptions.map((b) => (
                        <option key={b.id || b.branch_id || b.branch_name} value={b.branch_name}>
                          {b.branch_name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Product</Form.Label>
                  <Form.Select name="product" value={formData.product} onChange={handleChange}>
                    <option value="">Select Product</option>
                    {/* static options first */}
                    {STATIC_PRODUCTS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                    {/* Also include product master as options so fallback prod_id/name can be selected */}
                    {!productLoading &&
                      productOptions.map((p) => (
                        <option key={`master_${p.prod_id}`} value={String(p.prod_id)}>
                          {p.product_name}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Contractor</Form.Label>
                  <Form.Control type="text" name="contractor" value={formData.contractor} onChange={handleChange} />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Department</Form.Label>
                  <Form.Select name="department" value={formData.department} onChange={handleChange}>
                    <option value="">Select Department</option>
                    {departmentLoading && <option>Loading departments...</option>}
                    {!departmentLoading &&
                      departmentOptions.map((dept) => (
                        <option key={dept.dpt_id || dept.id || dept.department} value={String(dept.dpt_id)}>
                          {dept.department}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Salesperson</Form.Label>
                  <Form.Select name="salespersonId" value={formData.salespersonId} onChange={handleChange}>
                    <option value="">Select Salesperson</option>
                    {salespersonLoading && <option>Loading...</option>}
                    {!salespersonLoading &&
                      salespersonOptions.map((sp) => (
                        <option key={sp.emp_id || sp.id || sp.name} value={String(sp.emp_id)}>
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
                    style={{
                      backgroundColor: currentStageLower === "lost" ? "#dc3545" : 
                                      (stageSelectLocked ? "#6c757d" : "#ffffff"),
                      color: currentStageLower === "lost" || stageSelectLocked ? "#ffffff" : "#000000"
                    }}
                  >
                    <option value="">Select...</option>
                    {stageLoading && <option>Loading...</option>}
                    {!stageLoading &&
                      stageOptions.map((stg) => {
                        const label = stg.stage || stg.name || "";
                        const labelNorm = normalizeStage(label);

                        // Disable options that aren't allowed according to workflow
                        const disabled = !allowedNorm.includes(labelNorm);

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
                  <Form.Text className="text-muted d-block mt-1"></Form.Text>
                  {stageSelectLocked && (
                    <Form.Text className="text-muted d-block">
                      {currentStageLower === "lost" 
                        ? "This lead is marked as lost and its stage cannot be changed."
                        : "This lead is in the final stage and cannot be changed."}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control as="textarea" rows={2} name="remarks" value={formData.remarks} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Additional Notes</Form.Label>
                  <Form.Control as="textarea" rows={3} name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Visit Date</Form.Label>
                  <Form.Control type="date" name="visitDate" value={toInputDate(formData.visitDate)} onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Next Visit</Form.Label>
                  <Form.Control type="date" name="nextVisitDate" value={toInputDate(formData.nextVisitDate)} onChange={handleChange} />
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