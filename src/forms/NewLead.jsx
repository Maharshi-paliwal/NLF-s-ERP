


// import React, { useState, useEffect } from "react";
// import { Card, Row, Col, Form, Container, Button } from "react-bootstrap";
// import { FaArrowLeft } from "react-icons/fa";
// import { Link, useParams, useNavigate } from "react-router-dom";

// // --- API BASES ---
// const API_BASE = "https://nlfs.in/erp/index.php/Erp";
// const API_MASTER = "https://nlfs.in/erp/index.php/Api";

// // Helper: convert yyyy-mm-dd (HTML) -> dd-mm-yyyy (API)
// const toApiDate = (dateStr) => {
//   if (!dateStr) return "";
//   const [yyyy, mm, dd] = dateStr.split("-");
//   return `${dd}-${mm}-${yyyy}`;
// };

// // Helper: convert dd-mm-yyyy (API) -> yyyy-mm-dd (HTML)
// const fromApiDate = (apiDate) => {
//   if (!apiDate) return "";
//   const [dd, mm, yyyy] = apiDate.split("-");
//   return `${yyyy}-${mm}-${dd}`;
// };

// // --- STATIC PRODUCT LIST (requested) ---
// const STATIC_PRODUCTS = [
//   { value: "ceiling_facade", label: "Ceiling / Facade" },
//   { value: "roofing", label: "Roofing" },
//   { value: "furnishing", label: "Furnishing" },
//   { value: "acoustics", label: "Acoustics" },
//   { value: "modular_furniture", label: "Modular Furniture" },
// ];

// const NewLead = () => {
//   const { id } = useParams(); // if present => edit mode
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     projectName: "",
//     architectName: "",
//     clientName: "",
//     email: "",
//     contact: "",
//     contractor: "",
//     department: "", // will store dpt_id (department id)
//     salespersonId: "", // will store emp_id
//     stage: "", // will default to "civil" for new lead
//     remarks: "",
//     visitDate: "",
//     nextVisitDate: "",
//     officeBranch: "",
//     product: "", // will store one of STATIC_PRODUCTS.value (or fallback raw)
//   });

//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   // Stage list
//   const [stageOptions, setStageOptions] = useState([]);
//   const [stageLoading, setStageLoading] = useState(false);
//   const [originalStage, setOriginalStage] = useState("civil"); // default for new lead

//   // Branch list
//   const [branchOptions, setBranchOptions] = useState([]);
//   const [branchLoading, setBranchLoading] = useState(false);

//   // Product list (kept in case you need the master; not used in the static select)
//   const [productOptions, setProductOptions] = useState([]);
//   const [productLoading, setProductLoading] = useState(false);

//   // Salesperson list
//   const [salespersonOptions, setSalespersonOptions] = useState([]);
//   const [salespersonLoading, setSalespersonLoading] = useState(false);

//   // Department list
//   const [departmentOptions, setDepartmentOptions] = useState([]);
//   const [departmentLoading, setDepartmentLoading] = useState(false);

//   // Lock stage for new leads (true when creating new lead; false when editing)
//   const [isStageLocked, setIsStageLocked] = useState(!id);

//   // ---- FETCH STAGE LIST ----
//   const fetchStages = async () => {
//     setStageLoading(true);
//     try {
//       const fd = new FormData();
//       const res = await fetch(`${API_BASE}/stage_list`, {
//         method: "POST",
//         body: fd,
//       });
//       const data = await res.json();
//       console.log("stage_list response (NewLead):", data);
//       if ((data.status === true || data.status === "true") && data.success === "1") {
//         setStageOptions(data.data || []);
//       } else {
//         console.error(data.message || "Failed to fetch stages.");
//       }
//     } catch (err) {
//       console.error("Error fetching stages:", err);
//     } finally {
//       setStageLoading(false);
//     }
//   };

//   // ---- FETCH BRANCH LIST ----
//   const fetchBranches = async () => {
//     setBranchLoading(true);
//     try {
//       const fd = new FormData();
//       const res = await fetch(`${API_BASE}/branch_list`, { method: "POST", body: fd });
//       const data = await res.json();
//       console.log("branch_list response (NewLead):", data);
//       if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
//         setBranchOptions(data.data || []);
//       } else {
//         console.error(data.message || "Failed to fetch branches.");
//       }
//     } catch (err) {
//       console.error("Error fetching branches:", err);
//     } finally {
//       setBranchLoading(false);
//     }
//   };

//   // ---- FETCH PRODUCT LIST (kept but no longer drives dropdown) ----
//   const fetchProducts = async () => {
//     setProductLoading(true);
//     try {
//       const res = await fetch(`${API_MASTER}/list_mst_product`, { method: "POST" });
//       const data = await res.json();
//       console.log("list_mst_product response (NewLead):", data);
//       if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
//         setProductOptions(data.data || []);
//       } else {
//         console.error(data.message || "Failed to fetch products.");
//       }
//     } catch (err) {
//       console.error("Error fetching products:", err);
//     } finally {
//       setProductLoading(false);
//     }
//   };

//   // ---- FETCH SALESPERSON LIST ----
//   const fetchSalespersons = async () => {
//     setSalespersonLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/sale_person_list`, { method: "GET" });
//       const data = await res.json();
//       console.log("sale_person_list response (NewLead):", data);
//       if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
//         const list = Array.isArray(data.data) ? data.data : [];
//         const onlySalespersons = list.filter((sp) => (sp.role || "").toLowerCase() === "salesperson");
//         setSalespersonOptions(onlySalespersons);
//       } else {
//         console.error(data.message || "Failed to fetch salespersons.");
//       }
//     } catch (err) {
//       console.error("Error fetching salespersons:", err);
//     } finally {
//       setSalespersonLoading(false);
//     }
//   };

//   // ---- FETCH DEPARTMENTS ----
//   const fetchDepartments = async () => {
//     setDepartmentLoading(true);
//     try {
//       const fd = new FormData();
//       const res = await fetch(`${API_BASE}/department_list`, { method: "POST", body: fd });
//       const data = await res.json();
//       console.log("department_list response (NewLead):", data);
//       if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
//         setDepartmentOptions(Array.isArray(data.data) ? data.data : []);
//       } else {
//         console.error(data.message || "Failed to fetch departments.");
//       }
//     } catch (err) {
//       console.error("Error fetching departments:", err);
//     } finally {
//       setDepartmentLoading(false);
//     }
//   };

//   // ---- GET LEAD BY ID (EDIT MODE) ----
//   useEffect(() => {
//     const fetchLead = async () => {
//       if (!id) {
//         // NEW LEAD: lock stage to civil by default and set canonical initial value
//         setOriginalStage("civil");
//         setFormData((prev) => ({ ...prev, stage: "civil" }));
//         setIsStageLocked(true);
//         return;
//       }

//       // Editing an existing lead -> unlock stage select
//       setIsStageLocked(false);
//       setLoading(true);
//       try {
//         const res = await fetch(`${API_BASE}/get_new_lead_by_id`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ id }),
//         });
//         const data = await res.json();
//         console.log("get_new_lead_by_id response:", data);

//         if (data.status && data.success === "1" && data.data) {
//           const lead = data.data;
//           const currentStage = lead.stage || "civil";

//           // Try to match lead's product/producttype/material to our STATIC_PRODUCTS (case-insensitive)
//           let productValue = "";
//           const lookups = [lead.product, lead.producttype, lead.material].filter(Boolean).map(String);
//           if (lookups.length) {
//             const joined = lookups.join(" ").toLowerCase();
//             const matched = STATIC_PRODUCTS.find((p) =>
//               joined.includes(p.value.replace(/_/g, " ")) || joined.includes(p.label.toLowerCase()) || joined.includes(p.value)
//             );
//             if (matched) productValue = matched.value;
//           }

//           // If still empty, and backend returned prod_id which maps to your product master, leave the raw prod_id as fallback
//           if (!productValue && lead.prod_id) {
//             productValue = lead.prod_id; // fallback: not one of static options
//           }

//           // Department: normalize to dpt_id when possible
//           let departmentValue = "";
//           if (lead.department) {
//             const foundById = departmentOptions.find((d) => String(d.dpt_id) === String(lead.department));
//             const foundByName = departmentOptions.find(
//               (d) => String(d.department).toLowerCase().trim() === String(lead.department).toLowerCase().trim()
//             );
//             if (foundById) departmentValue = foundById.dpt_id;
//             else if (foundByName) departmentValue = foundByName.dpt_id;
//             else departmentValue = lead.department; // fallback raw
//           }

//           setFormData((prev) => ({
//             ...prev,
//             projectName: lead.project_name || "",
//             architectName: lead.architech_name || "",
//             clientName: lead.client_name || "",
//             email: lead.email || "",
//             contact: lead.contact || "",
//             contractor: lead.contractor || "",
//             department: departmentValue,
//             salespersonId: lead.sales_person || "", // emp_id
//             stage: currentStage,
//             remarks: lead.remark || "",
//             visitDate: fromApiDate(lead.visiting_date),
//             nextVisitDate: fromApiDate(lead.nxt_visit_date),
//             officeBranch: lead.branch || "",
//             product: productValue || "", // static value if matched or fallback raw/prod_id
//           }));

//           setOriginalStage(currentStage);
//         } else {
//           alert(data.message || "Failed to load lead details.");
//         }
//       } catch (err) {
//         console.error("Error fetching lead:", err);
//         alert("Something went wrong while fetching the lead.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     // fetch lead (if editing) + always fetch dropdown lists
//     fetchLead();
//     fetchStages();
//     fetchBranches();
//     fetchProducts(); // still fetch master in case you need it elsewhere
//     fetchSalespersons();
//     fetchDepartments();
//   }, [id]); // departmentOptions used inside fetchLead; if race occurs we preserved fallback behavior

//   // After we have stageOptions, set default stage for new leads
//   useEffect(() => {
//     if (id) return; // editing -> don't override
//     if (!stageOptions.length) return;
//     if (formData.stage) return; // already has a value (we set 'civil' earlier)

//     const civilOption = stageOptions.find((stg) => {
//       const label = (stg.stage || stg.name || "").toLowerCase();
//       return label === "civil";
//     });

//     const defaultLabel =
//       (civilOption && (civilOption.stage || civilOption.name)) ||
//       stageOptions[0].stage ||
//       stageOptions[0].name ||
//       "";

//     if (defaultLabel) {
//       setFormData((prev) => ({ ...prev, stage: defaultLabel }));
//       setOriginalStage(defaultLabel);
//       setIsStageLocked(true); // ensure it remains locked for new lead
//     }
//   }, [id, stageOptions, formData.stage]);

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Build payload for Add/Update API
//   const buildPayload = () => {
//     // If you want to also send the human-readable product name to the backend, we can map it here:
//     const selectedStatic = STATIC_PRODUCTS.find((p) => p.value === formData.product);
//     const productNameForApi = selectedStatic ? selectedStatic.label : formData.product; // fallback raw

//     return {
//       project_name: formData.projectName,
//       architech_name: formData.architectName,
//       client_name: formData.clientName,
//       email: formData.email,
//       branch: formData.officeBranch,
//       contractor: formData.contractor,
//       department: formData.department, // send dpt_id or raw if unmatched
//       sales_person: formData.salespersonId, // emp_id
//       stage: formData.stage,
//       remark: formData.remarks,
//       visiting_date: toApiDate(formData.visitDate),
//       nxt_visit_date: toApiDate(formData.nextVisitDate),
//       contact: formData.contact,
//       // product: we send the static value (or fallback raw/prod_id); also include friendly name if backend expects it
//       product: formData.product,
//       product_name: productNameForApi,
//     };
//   };

//   // ---- ADD NEW LEAD ----
//   const addNewLead = async () => {
//     const payload = buildPayload();
//     console.log("add_lead payload:", payload);

//     const res = await fetch(`${API_BASE}/add_lead`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     const data = await res.json();
//     console.log("add_lead response:", data);
//     return data;
//   };

//   // ---- UPDATE EXISTING LEAD ----
//   const updateNewLead = async () => {
//     const payload = { id, ...buildPayload() };
//     console.log("update_new_lead payload:", payload);

//     const res = await fetch(`${API_BASE}/update_new_lead`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     const data = await res.json();
//     console.log("update_new_lead response:", data);
//     return data;
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const newStage = (formData.stage || "").toLowerCase();
//     const prevStage = (originalStage || "").toLowerCase();
//     if (newStage === "submit" && prevStage === "civil") {
//       alert("You must move the lead to 'Finalised' before it can be 'Submit'.");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const data = id ? await updateNewLead() : await addNewLead();
//       if ((data.status === true || data.status === "true") && data.success === "1") {
//         alert(data.message || (id ? "Lead updated successfully." : "Lead added successfully."));
//         navigate("/leadgeneration");
//       } else {
//         alert(data.message || "Operation failed.");
//       }
//     } catch (err) {
//       console.error("Error submitting lead:", err);
//       alert("Something went wrong while saving the lead.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Container className="mb-4">
//       <Button as={Link} to="/leadgeneration" className="add-customer-btn mb-4" size="sm">
//         <FaArrowLeft />
//       </Button>
//       <Card className="shadow-sm border-0">
//         <Card.Header className="bg-white d-flex justify-content-between align-items-center">
//           <h5 className="mb-0 fw-bold">{id ? "Edit Lead" : "Add New Lead"}</h5>
//         </Card.Header>

//         <Card.Body>
//           {loading ? (
//             <p>Loading lead details...</p>
//           ) : (
//             <Form onSubmit={handleSubmit}>
//               <Row className="mb-3">
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Project Name *</Form.Label>
//                     <Form.Control type="text" name="projectName" value={formData.projectName} onChange={handleChange} required />
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Architect Name</Form.Label>
//                     <Form.Control type="text" name="architectName" value={formData.architectName} onChange={handleChange} required />
//                   </Form.Group>
//                 </Col>
//                 <Col md={4}>
//                   <Form.Group>
//                     <Form.Label>Client Name</Form.Label>
//                     <Form.Control type="text" name="clientName" value={formData.clientName} onChange={handleChange} required />
//                   </Form.Group>
//                 </Col>
//               </Row>

//               <Row className="mb-3">
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Email</Form.Label>
//                     <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Contact</Form.Label>
//                     <Form.Control type="number" name="contact" value={formData.contact} onChange={handleChange} />
//                   </Form.Group>
//                 </Col>
//               </Row>

//               {/* Branch + Product (product is now STATIC) */}
//               <Row className="mb-3">
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Branch *</Form.Label>
//                     <Form.Select name="officeBranch" value={formData.officeBranch} onChange={handleChange} required>
//                       <option value="">Select Branch</option>
//                       {branchLoading && <option>Loading branches...</option>}
//                       {!branchLoading &&
//                         branchOptions.map((b) => (
//                           <option key={b.id || b.branch_id || b.branch_name} value={b.branch_name}>
//                             {b.branch_name}
//                           </option>
//                         ))}
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>

//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Product Type *</Form.Label>
//                     <Form.Select name="product" value={formData.product} onChange={handleChange} required>
//                       <option value="">Select Product Type</option>
//                       {STATIC_PRODUCTS.map((p) => (
//                         <option key={p.value} value={p.value}>
//                           {p.label}
//                         </option>
//                       ))}
//                     </Form.Select>
                   
//                   </Form.Group>
//                 </Col>
//               </Row>

//               <Row className="mb-3">
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Contractor</Form.Label>
//                     <Form.Control type="text" name="contractor" value={formData.contractor} onChange={handleChange} required />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Department</Form.Label>
//                     <Form.Select name="department" value={formData.department} onChange={handleChange} required>
//                       <option value="">Select Department</option>
//                       {departmentLoading && <option>Loading departments...</option>}
//                       {!departmentLoading &&
//                         departmentOptions.map((d) => (
//                           <option key={d.dpt_id || d.department} value={d.dpt_id}>
//                             {d.department}
//                           </option>
//                         ))}
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//               </Row>

//               <Row className="mb-3">
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Salesperson *</Form.Label>
//                     <Form.Select name="salespersonId" value={formData.salespersonId} onChange={handleChange} required>
//                       <option value="">Select Salesperson</option>
//                       {salespersonLoading && <option>Loading...</option>}
//                       {!salespersonLoading &&
//                         salespersonOptions.map((sp) => (
//                           <option key={sp.emp_id || sp.id || sp.name} value={sp.emp_id}>
//                             {sp.name}
//                           </option>
//                         ))}
//                     </Form.Select>
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Stage</Form.Label>
//                     <Form.Select
//                       name="stage"
//                       value={formData.stage}
//                       onChange={handleChange}
//                       required
//                       disabled={isStageLocked} // <-- locked for new leads
//                     >
//                       <option value="">Select Stage</option>
//                       {stageLoading && <option>Loading...</option>}
//                       {!stageLoading &&
//                         stageOptions.map((stg) => {
//                           const label = stg.stage || stg.name || "";
//                           const lower = label.toLowerCase();
//                           const disableSubmit = lower === "submit" && (originalStage || "").toLowerCase() === "civil";
//                           return (
//                             <option key={stg.stage_id || stg.id || label} value={label} disabled={disableSubmit}>
//                               {label}
//                             </option>
//                           );
//                         })}
//                     </Form.Select>
//                     {isStageLocked && <small className="text-muted">Stage locked to "civil" for new leads — change it in View Leads.</small>}
//                   </Form.Group>
//                 </Col>
//               </Row>

//               <Row className="mb-3">
//                 <Col md={12}>
//                   <Form.Group>
//                     <Form.Label>Remarks</Form.Label>
//                     <Form.Control as="textarea" rows={2} name="remarks" value={formData.remarks} onChange={handleChange} />
//                   </Form.Group>
//                 </Col>
//               </Row>

//               <Row className="mb-3">
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Visit Date *</Form.Label>
//                     <Form.Control type="date" name="visitDate" value={formData.visitDate} onChange={handleChange} required />
//                   </Form.Group>
//                 </Col>
//                 <Col md={6}>
//                   <Form.Group>
//                     <Form.Label>Next Visit *</Form.Label>
//                     <Form.Control type="date" name="nextVisitDate" value={formData.nextVisitDate} onChange={handleChange} required />
//                   </Form.Group>
//                 </Col>
//               </Row>

//               <div className="d-flex justify-content-end mt-4">
//                 <Button className="add-customer-btn" type="submit" disabled={submitting}>
//                   {submitting ? "Saving..." : id ? "Update Lead" : "Save Lead"}
//                 </Button>
//               </div>
//             </Form>
//           )}
//         </Card.Body>
//       </Card>
//     </Container>
//   );
// };

// export default NewLead;

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

// --- STATIC PRODUCT LIST (requested) ---
const STATIC_PRODUCTS = [
  { value: "ceiling_facade", label: "Ceiling / Facade" },
  { value: "roofing", label: "Roofing" },
  { value: "furnishing", label: "Furnishing" },
  { value: "acoustics", label: "Acoustics" },
  { value: "modular_furniture", label: "Modular Furniture" },
];

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
    department: "", // will store dpt_id (department id)
    salespersonId: "", // will store emp_id
    stage: "", // will default to "upcoming" for new lead
    remarks: "",
    visitDate: "",
    nextVisitDate: "",
    officeBranch: "",
    product: "", // will store one of STATIC_PRODUCTS.value (or fallback raw)
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Stage list
  const [stageOptions, setStageOptions] = useState([]);
  const [stageLoading, setStageLoading] = useState(false);
  const [originalStage, setOriginalStage] = useState("upcoming"); // default for new lead

  // Branch list
  const [branchOptions, setBranchOptions] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);

  // Product list (kept in case you need the master; not used in the static select)
  const [productOptions, setProductOptions] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  // Salesperson list
  const [salespersonOptions, setSalespersonOptions] = useState([]);
  const [salespersonLoading, setSalespersonLoading] = useState(false);

  // Department list
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(false);

  // Lock stage for new leads (true when creating new lead; false when editing)
  const [isStageLocked, setIsStageLocked] = useState(!id);

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
      if ((data.status === true || data.status === "true") && data.success === "1") {
        // Sort stages by their ID to maintain order
        const sortedStages = (data.data || []).sort((a, b) => {
          const idA = parseInt(a.stage_id || a.id || 0);
          const idB = parseInt(b.stage_id || b.id || 0);
          return idA - idB;
        });
        setStageOptions(sortedStages);
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
      const fd = new FormData();
      const res = await fetch(`${API_BASE}/branch_list`, { method: "POST", body: fd });
      const data = await res.json();
      console.log("branch_list response (NewLead):", data);
      if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
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

  // ---- FETCH PRODUCT LIST (kept but no longer drives dropdown) ----
  const fetchProducts = async () => {
    setProductLoading(true);
    try {
      const res = await fetch(`${API_MASTER}/list_mst_product`, { method: "POST" });
      const data = await res.json();
      console.log("list_mst_product response (NewLead):", data);
      if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
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
      const res = await fetch(`${API_BASE}/sale_person_list`, { method: "GET" });
      const data = await res.json();
      console.log("sale_person_list response (NewLead):", data);
      if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
        const list = Array.isArray(data.data) ? data.data : [];
        const onlySalespersons = list.filter((sp) => (sp.role || "").toLowerCase() === "salesperson");
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

  // ---- FETCH DEPARTMENTS ----
  const fetchDepartments = async () => {
    setDepartmentLoading(true);
    try {
      const fd = new FormData();
      const res = await fetch(`${API_BASE}/department_list`, { method: "POST", body: fd });
      const data = await res.json();
      console.log("department_list response (NewLead):", data);
      if ((data.status === true || data.status === "true") && (data.success === "1" || data.success === 1)) {
        setDepartmentOptions(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error(data.message || "Failed to fetch departments.");
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
    } finally {
      setDepartmentLoading(false);
    }
  };

  // ---- GET LEAD BY ID (EDIT MODE) ----
  useEffect(() => {
    const fetchLead = async () => {
      if (!id) {
        // NEW LEAD: lock stage to upcoming by default and set canonical initial value
        setOriginalStage("upcoming");
        setFormData((prev) => ({ ...prev, stage: "upcoming" }));
        setIsStageLocked(true);
        return;
      }

      // Editing an existing lead -> unlock stage select
      setIsStageLocked(false);
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/get_new_lead_by_id`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        console.log("get_new_lead_by_id response:", data);

        if (data.status && data.success === "1" && data.data) {
          const lead = data.data;
          const currentStage = lead.stage || "upcoming";

          // Try to match lead's product/producttype/material to our STATIC_PRODUCTS (case-insensitive)
          let productValue = "";
          const lookups = [lead.product, lead.producttype, lead.material].filter(Boolean).map(String);
          if (lookups.length) {
            const joined = lookups.join(" ").toLowerCase();
            const matched = STATIC_PRODUCTS.find((p) =>
              joined.includes(p.value.replace(/_/g, " ")) || joined.includes(p.label.toLowerCase()) || joined.includes(p.value)
            );
            if (matched) productValue = matched.value;
          }

          // If still empty, and backend returned prod_id which maps to your product master, leave the raw prod_id as fallback
          if (!productValue && lead.prod_id) {
            productValue = lead.prod_id; // fallback: not one of static options
          }

          // Department: normalize to dpt_id when possible
          let departmentValue = "";
          if (lead.department) {
            const foundById = departmentOptions.find((d) => String(d.dpt_id) === String(lead.department));
            const foundByName = departmentOptions.find(
              (d) => String(d.department).toLowerCase().trim() === String(lead.department).toLowerCase().trim()
            );
            if (foundById) departmentValue = foundById.dpt_id;
            else if (foundByName) departmentValue = foundByName.dpt_id;
            else departmentValue = lead.department; // fallback raw
          }

          setFormData((prev) => ({
            ...prev,
            projectName: lead.project_name || "",
            architectName: lead.architech_name || "",
            clientName: lead.client_name || "",
            email: lead.email || "",
            contact: lead.contact || "",
            contractor: lead.contractor || "",
            department: departmentValue,
            salespersonId: lead.sales_person || "", // emp_id
            stage: currentStage,
            remarks: lead.remark || "",
            visitDate: fromApiDate(lead.visiting_date),
            nextVisitDate: fromApiDate(lead.nxt_visit_date),
            officeBranch: lead.branch || "",
            product: productValue || "", // static value if matched or fallback raw/prod_id
          }));

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
    fetchProducts(); // still fetch master in case you need it elsewhere
    fetchSalespersons();
    fetchDepartments();
  }, [id]); // departmentOptions used inside fetchLead; if race occurs we preserved fallback behavior

  // After we have stageOptions, set default stage for new leads
  useEffect(() => {
    if (id) return; // editing -> don't override
    if (!stageOptions.length) return;
    if (formData.stage) return; // already has a value (we set 'upcoming' earlier)

    const upcomingOption = stageOptions.find((stg) => {
      const label = (stg.stage || stg.name || "").toLowerCase();
      return label === "upcoming";
    });

    const defaultLabel =
      (upcomingOption && (upcomingOption.stage || upcomingOption.name)) ||
      stageOptions[0].stage ||
      stageOptions[0].name ||
      "";

    if (defaultLabel) {
      setFormData((prev) => ({ ...prev, stage: defaultLabel }));
      setOriginalStage(defaultLabel);
      setIsStageLocked(true); // ensure it remains locked for new lead
    }
  }, [id, stageOptions, formData.stage]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Build payload for Add/Update API
  const buildPayload = () => {
    // If you want to also send the human-readable product name to the backend, we can map it here:
    const selectedStatic = STATIC_PRODUCTS.find((p) => p.value === formData.product);
    const productNameForApi = selectedStatic ? selectedStatic.label : formData.product; // fallback raw

    return {
      project_name: formData.projectName,
      architech_name: formData.architectName,
      client_name: formData.clientName,
      email: formData.email,
      branch: formData.officeBranch,
      contractor: formData.contractor,
      department: formData.department, // send dpt_id or raw if unmatched
      sales_person: formData.salespersonId, // emp_id
      stage: formData.stage,
      remark: formData.remarks,
      visiting_date: toApiDate(formData.visitDate),
      nxt_visit_date: toApiDate(formData.nextVisitDate),
      contact: formData.contact,
      // product: we send the static value (or fallback raw/prod_id); also include friendly name if backend expects it
      product: formData.product,
      product_name: productNameForApi,
    };
  };

  // ---- ADD NEW LEAD ----
  const addNewLead = async () => {
    const payload = buildPayload();
    console.log("add_lead payload:", payload);

    const res = await fetch(`${API_BASE}/add_lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("add_lead response:", data);
    return data;
  };

  // ---- UPDATE EXISTING LEAD ----
  const updateNewLead = async () => {
    const payload = { id, ...buildPayload() };
    console.log("update_new_lead payload:", payload);

    const res = await fetch(`${API_BASE}/update_new_lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("update_new_lead response:", data);
    return data;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Remove the workflow validation for submit/civil as we're now using dynamic stages
    setSubmitting(true);
    try {
      const data = id ? await updateNewLead() : await addNewLead();
      if ((data.status === true || data.status === "true") && data.success === "1") {
        alert(data.message || (id ? "Lead updated successfully." : "Lead added successfully."));
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
      <Button as={Link} to="/leadgeneration" className="add-customer-btn mb-4" size="sm">
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
                    <Form.Control type="text" name="projectName" value={formData.projectName} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Architect Name</Form.Label>
                    <Form.Control type="text" name="architectName" value={formData.architectName} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Client Name</Form.Label>
                    <Form.Control type="text" name="clientName" value={formData.clientName} onChange={handleChange} required />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Contact</Form.Label>
                    <Form.Control type="number" name="contact" value={formData.contact} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>

              {/* Branch + Product (product is now STATIC) */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Branch *</Form.Label>
                    <Form.Select name="officeBranch" value={formData.officeBranch} onChange={handleChange} required>
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
                    <Form.Label>Product Type *</Form.Label>
                    <Form.Select name="product" value={formData.product} onChange={handleChange} required>
                      <option value="">Select Product Type</option>
                      {STATIC_PRODUCTS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
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
                    <Form.Control type="text" name="contractor" value={formData.contractor} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Department</Form.Label>
                    <Form.Select name="department" value={formData.department} onChange={handleChange} required>
                      <option value="">Select Department</option>
                      {departmentLoading && <option>Loading departments...</option>}
                      {!departmentLoading &&
                        departmentOptions.map((d) => (
                          <option key={d.dpt_id || d.department} value={d.dpt_id}>
                            {d.department}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Salesperson *</Form.Label>
                    <Form.Select name="salespersonId" value={formData.salespersonId} onChange={handleChange} required>
                      <option value="">Select Salesperson</option>
                      {salespersonLoading && <option>Loading...</option>}
                      {!salespersonLoading &&
                        salespersonOptions.map((sp) => (
                          <option key={sp.emp_id || sp.id || sp.name} value={sp.emp_id}>
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
                      required
                      disabled={isStageLocked} // <-- locked for new leads
                    >
                      <option value="">Select Stage</option>
                      {stageLoading && <option>Loading...</option>}
                      {!stageLoading &&
                        stageOptions.map((stg) => {
                          const label = stg.stage || stg.name || "";
                          return (
                            <option key={stg.stage_id || stg.id || label} value={label}>
                              {label}
                            </option>
                          );
                        })}
                    </Form.Select>
                    {isStageLocked && <small className="text-muted"></small>}
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Remarks</Form.Label>
                    <Form.Control as="textarea" rows={2} name="remarks" value={formData.remarks} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Visit Date *</Form.Label>
                    <Form.Control type="date" name="visitDate" value={formData.visitDate} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Next Visit *</Form.Label>
                    <Form.Control type="date" name="nextVisitDate" value={formData.nextVisitDate} onChange={handleChange} required />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-4">
                <Button className="add-customer-btn" type="submit" disabled={submitting}>
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