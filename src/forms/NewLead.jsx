

//newlead.jsx
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Container, Button } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useParams, useNavigate } from "react-router-dom";

// --- API BASES ---
const API_BASE = "https://nlfs.in/erp/index.php/Erp";
const API_MASTER = "https://nlfs.in/erp/index.php/Api";

// Helper: convert yyyy-mm-dd (HTML) -> dd-mm-yyyy (API)
const toApiDate = (dateStr) => {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}-${mm}-${yyyy}`;
};

// Helper: convert dd-mm-yyyy (API) -> yyyy-mm-dd (HTML)
const fromApiDate = (apiDate) => {
  if (!apiDate) return "";
  const [dd, mm, yyyy] = apiDate.split("-");
  return `${yyyy}-${mm}-${dd}`;
};

const NewLead = () => {
  const { id } = useParams(); // if present => edit mode
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    projectName: "",
    architectName: "",
    clientName: "",
    email: "",
    contact: "",
    contractor: "",
    department: "",
    salespersonId: "",   // 🔹 will store emp_id
    stage: "", // will default to "civil" for new lead
    remarks: "",
    visitDate: "",
    nextVisitDate: "",
    officeBranch: "",
    product: "", // Changed from material to product
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Stage list
  const [stageOptions, setStageOptions] = useState([]);
  const [stageLoading, setStageLoading] = useState(false);
  // original stage (for flow rule civil -> finalised -> submit)
  const [originalStage, setOriginalStage] = useState("civil"); // default for new lead

  // 🔹 Branch list (from /Erp/branch_list)
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);

  // 🔹 Product list (from /Api/list_mst_product)
  const [productOptions, setProductOptions] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  // 🔹 Salesperson list (from /Erp/sale_person_list)
  const [salespersonOptions, setSalespersonOptions] = useState([]);
  const [salespersonLoading, setSalespersonLoading] = useState(false);

  // ---- FETCH STAGE LIST ----
  const fetchStages = async () => {
    setStageLoading(true);
    try {
      const fd = new FormData();
      const res = await fetch(`${API_BASE}/stage_list`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      console.log("stage_list response (NewLead):", data);

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

  // ---- FETCH BRANCH LIST ----
  const fetchBranches = async () => {
    setBranchLoading(true);
    try {
      const fd = new FormData(); // no keyword → all branches
      const res = await fetch(`${API_BASE}/branch_list`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      console.log("branch_list response (NewLead):", data);

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

  // ---- FETCH PRODUCT LIST ----
  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const res = await fetch(`${API_MASTER}/list_mst_product`, {
        method: "POST",
      });

      const data = await res.json();
      console.log("list_mst_product response (NewLead):", data);

      if (
        (data.status === true || data.status === "true") &&
        (data.success === "1" || data.success === 1)
      ) {
        setProductOptions(data.data || []);
      } else {
        console.error(data.message || "Failed to fetch products.");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setProductLoading(false);
    }
  };

  // ---- FETCH SALESPERSON LIST ----
  const fetchSalespersons = async () => {
    setSalespersonLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sale_person_list`, {
        method: "GET",
      });

      const data = await res.json();
      console.log("sale_person_list response (NewLead):", data);

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

  // ---- GET LEAD BY ID (EDIT MODE) ----
  useEffect(() => {
    const fetchLead = async () => {
      if (!id) {
        // add mode: original stage is "civil"
        setOriginalStage("civil");
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/get_new_lead_by_id`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();
        console.log("get_new_lead_by_id response:", data);

        if (data.status && data.success === "1" && data.data) {
          const lead = data.data;
          const currentStage = lead.stage || "civil";

          // Find the product by ID
          let productValue = "";
          if (lead.prod_id) {
            productValue = lead.prod_id;
          } else if (lead.producttype || lead.material) {
            // Try to find by name
            const productName = lead.producttype || lead.material;
            const matchingProduct = productOptions.find(
              (p) =>
                String(p.product_name).toLowerCase().trim() ===
                String(productName).toLowerCase().trim()
            );
            productValue = matchingProduct ? matchingProduct.prod_id : "";
          }

          setFormData((prev) => ({
            ...prev,
            projectName: lead.project_name || "",
            architectName: lead.architech_name || "",
            clientName: lead.client_name || "",
            email: lead.email || "",
            contact: lead.contact || "",
            contractor: lead.contractor || "",
            department: lead.department || "",
            salespersonId: lead.sales_person || "", // 🔹 treat as emp_id now
            stage: currentStage,
            remarks: lead.remark || "",
            visitDate: fromApiDate(lead.visiting_date),
            nextVisitDate: fromApiDate(lead.nxt_visit_date),
            officeBranch: lead.branch || "",
            product: lead.product || "", // Changed from material to product
          }));

          // store original stage for flow rule
          setOriginalStage(currentStage);
        } else {
          alert(data.message || "Failed to load lead details.");
        }
      } catch (err) {
        console.error("Error fetching lead:", err);
        alert("Something went wrong while fetching the lead.");
      } finally {
        setLoading(false);
      }
    };

    // fetch lead (if editing) + always fetch dropdown lists
    fetchLead();
    fetchStages();
    fetchBranches();
    fetchProducts();
    fetchSalespersons();
  }, [id]);

  // After we have stageOptions, if this is a NEW lead and stage is empty,
  // default stage to "civil" (or the first stage if civil not found)
  useEffect(() => {
    if (id) return; // edit mode, don't override existing
    if (!stageOptions.length) return;
    if (formData.stage) return; // already set

    const civilOption = stageOptions.find((stg) => {
      const label = (stg.stage || stg.name || "").toLowerCase();
      return label === "civil";
    });

    const defaultLabel =
      (civilOption && (civilOption.stage || civilOption.name)) ||
      stageOptions[0].stage ||
      stageOptions[0].name ||
      "";

    if (defaultLabel) {
      setFormData((prev) => ({ ...prev, stage: defaultLabel }));
      setOriginalStage(defaultLabel); // for completeness
    }
  }, [id, stageOptions, formData.stage]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Build payload for Add/Update API
  const buildPayload = () => {
    // Find the product to get both ID and name
    const selectedProduct = productOptions.find(
      (p) => p.prod_id === formData.product
    );

    return {
      project_name: formData.projectName,
      architech_name: formData.architectName,
      client_name: formData.clientName,
      email: formData.email,
      branch: formData.officeBranch,
      contractor: formData.contractor,
      department: formData.department,
      sales_person: formData.salespersonId, // 🔹 send emp_id here
      stage: formData.stage,
      remark: formData.remarks,
      visiting_date: toApiDate(formData.visitDate),
      nxt_visit_date: toApiDate(formData.nextVisitDate),
      contact: formData.contact,
      // Send product information consistently
      product: formData.product,
    };
  };

  // ---- ADD NEW LEAD ----
  const addNewLead = async () => {
    const payload = buildPayload();
    console.log("add_lead payload:", payload);

    const res = await fetch(`${API_BASE}/add_lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("add_lead response:", data);
    return data;
  };

  // ---- UPDATE EXISTING LEAD ----
  const updateNewLead = async () => {
    const payload = {
      id,
      ...buildPayload(),
    };
    console.log("update_new_lead payload:", payload);

    const res = await fetch(`${API_BASE}/update_new_lead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("update_new_lead response:", data);
    return data;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔒 Stage flow rule: cannot go directly from civil -> submit
    const newStage = (formData.stage || "").toLowerCase();
    const prevStage = (originalStage || "").toLowerCase();
    if (newStage === "submit" && prevStage === "civil") {
      alert("You must move the lead to 'Finalised' before it can be 'Submit'.");
      return;
    }

    setSubmitting(true);
    try {
      const data = id ? await updateNewLead() : await addNewLead();

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        alert(
          data.message ||
            (id ? "Lead updated successfully." : "Lead added successfully.")
        );
        navigate("/leadgeneration");
      } else {
        alert(data.message || "Operation failed.");
      }
    } catch (err) {
      console.error("Error submitting lead:", err);
      alert("Something went wrong while saving the lead.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="mb-4">
      <Button
        as={Link}
        to="/leadgeneration"
        className="add-customer-btn mb-4"
        size="sm"
      >
        <FaArrowLeft />
      </Button>
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">{id ? "Edit Lead" : "Add New Lead"}</h5>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <p>Loading lead details...</p>
          ) : (
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
                      required
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
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
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
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="number"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Branch + Product (from master APIs) */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Branch *</Form.Label>
                    <Form.Select
                      name="officeBranch"
                      value={formData.officeBranch}
                      onChange={handleChange}
                      required
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
                    <Form.Label>Product *</Form.Label>
                    <Form.Select
                      name="product" // Changed from "material" to "product"
                      value={formData.product}
                      onChange={handleChange}
                      required
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
                      required
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
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Salesperson *</Form.Label>
                    <Form.Select
                      name="salespersonId"          // 🔹 store emp_id
                      value={formData.salespersonId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Salesperson</option>
                      {salespersonLoading && <option>Loading...</option>}
                      {!salespersonLoading &&
                        salespersonOptions.map((sp) => (
                          <option
                            key={sp.emp_id || sp.id || sp.name}
                            value={sp.emp_id}    // 🔹 value is emp_id
                          >
                            {sp.name}            {/* label is name */}
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
                      required
                    
                    >
                      <option value="">Select Stage</option>
                      {stageLoading && <option>Loading...</option>}
                      {!stageLoading &&
                        stageOptions.map((stg) => {
                          const label = stg.stage || stg.name || "";
                          const lower = label.toLowerCase();
                          // Optional UX: disable "submit" if we've never left "civil"
                          const disableSubmit =
                            lower === "submit" &&
                            (originalStage || "").toLowerCase() === "civil";

                          return (
                            <option
                              key={stg.stage_id || stg.id || label}
                              value={label}
                              disabled={disableSubmit}
                            >
                              {label}
                            </option>
                          );
                        })}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
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
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Visit Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="visitDate"
                      value={formData.visitDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Next Visit *</Form.Label>
                    <Form.Control
                      type="date"
                      name="nextVisitDate"
                      value={formData.nextVisitDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-4">
                <Button
                  className="add-customer-btn"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : id ? "Update Lead" : "Save Lead"}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NewLead;
