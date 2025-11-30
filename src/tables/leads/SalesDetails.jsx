// src/tables/leads/SalesDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Form,
  Badge,
  Container,
  Button,
  Modal,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserTie,
  FaPlus,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import toast from "react-hot-toast";

const ERP_BASE = "https://nlfs.in/erp/index.php/Erp";
const SALES_API_BASE = "https://nlfs.in/erp/index.php/Api";

/* -------------------- Quotation Reject Modal -------------------- */

const QuotationRejectModal = ({
  show,
  handleClose,
  quotationId,
  handleSubmit,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(quotationId, rejectionReason);
    setRejectionReason("");
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="md">
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>
          <FaTimesCircle className="me-2" /> Confirm Quotation Rejection
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <p>
            Are you sure the customer has rejected this quotation? This action
            will mark the quote <strong>{quotationId}</strong> as lost/rejected.
          </p>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontWeight: "700" }}>
              Quotation ID to Reject:
            </Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={quotationId || "N/A"}
              className="text-danger fw-bold"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formRejectionReason">
            <Form.Label>
              Reason for Rejection <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a detailed reason for rejection (e.g., pricing, features missing, timeline mismatch)."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger">
            Confirm Rejection
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

/* -------------------- Add Interaction Modal -------------------- */

const InteractionModal = ({ show, handleClose, handleSubmit }) => {
  const [newInteraction, setNewInteraction] = useState({
    date: new Date().toISOString().substring(0, 10),
     nextVisitDate: "",  
    project_name:"",
    mode: "",
    location: "",
    status: "",
    moms: "",
  });

  const handleChange = (e) => {
    setNewInteraction({ ...newInteraction, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(newInteraction);
    setNewInteraction({
      date: new Date().toISOString().substring(0, 10),
       nextVisitDate: "", 
      project_name:"",
      mode: "",
      location: "",
      status: "",
      moms: "",
    });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <FaPlus className="me-2" /> Add Client Interaction
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={onSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formInteractionDate">
                <Form.Label>
                  Date of Interaction <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={newInteraction.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="formInteractionMode">
                <Form.Label>Mode</Form.Label>
                <Form.Select
                  name="mode"
                  value={newInteraction.mode}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Interaction Mode</option>
                  <option value="Initial Meeting">Initial Meeting</option>
                  <option value="Virtual Meeting">Virtual Meeting</option>
                  <option value="Client Site Visit">Client Site Visit</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Email/Text">Email/Text</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
             <Form.Group className="mb-3" controlId="formInteractionDate">
                <Form.Label>
                  Next visit date<span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="nextVisitDate"
                  value={newInteraction.nextVisitDate}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
            <Form.Group className="mb-3" controlId="formInteractionLocation">
            <Form.Label>Location / Details </Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={newInteraction.location}
              onChange={handleChange}
              placeholder="Enter location or specific details"
            />
          </Form.Group>
            </Col>
           </Row>
          <Form.Group className="mb-3" controlId="formInteractionStatus">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={newInteraction.status}
              onChange={handleChange}
              required
            >
              <option value="">Select Status</option>
              <option value="Requirement Gathering">
                Requirement Gathering
              </option>
              <option value="Technical Discussion">
                Technical Discussion
              </option>
              <option value="Quotation Sent">Quotation Sent</option>
              <option value="Revised">Revised</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formInteractionMOMs">
            <Form.Label>
              Minutes of Meeting (MOMs) / Notes{" "}
              <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="moms"
              value={newInteraction.moms}
              onChange={handleChange}
              placeholder="Summarize the discussion, next steps, and key decisions..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="success">
            Save Interaction Log
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

/* -------------------- Interaction Card -------------------- */

const InteractionCard = ({ interaction, lead, onDelete }) => {
  const statusColor = (status) => {
    switch (status) {
      case "Quotation Sent":
        return "info";
      case "Revised":
        return "secondary";
      case "Accepted":
        return "success";
      case "Rejected":
        return "danger";
      case "Requirement Gathering":
        return "primary";
      case "Technical Discussion":
        return "secondary";
      case "Follow-up":
        return "warning";
      case "Negotiation":
        return "primary";
      case "Lost/Client Unresponsive":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center bg-light">
        <h5 className="mb-0 mt-0 card-title">
          Interaction on {interaction.date || ""}
        </h5>
        <div className="d-flex align-items-center gap-2">
          {/* NEW: show next visit on header if present */}
          {interaction.nextVisitDate && (
            <Badge bg="success" className="px-3 py-2">
              Next Visit: {interaction.nextVisitDate}
            </Badge>
          )}
          <Badge bg={statusColor(interaction.status)} className="px-3 py-2">
            {interaction.status}
          </Badge>
          <Button
            className="bg-danger text-light border-0 rounded-1"
            size="sm"
            onClick={() => onDelete && onDelete(interaction.id)}
          >
            <FaTrash />
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={4} className="d-flex align-items-center">
            <FaCalendarAlt className="me-2 text-primary" />
            <strong>Date:</strong> {interaction.date || ""}
          </Col>
          <Col md={4} className="d-flex align-items-center">
            <FaMapMarkerAlt className="me-2 text-primary" />
            <strong>Location/Mode:</strong>{" "}
            {interaction.location || ""} ({interaction.mode || ""})
          </Col>
          {/* <Col md={4} className="d-flex align-items-center">
            <FaUserTie className="me-2 text-primary" />
            <strong>Salesperson:</strong> {lead?.sales_person || "-"}
          </Col> */}
        </Row>

        {/* NEW: Explicit Next Visit field in body too (fallback) */}
        <Row className="mb-3">
          <Col md={4} className="d-flex align-items-center">
            <FaCalendarAlt className="me-2 text-success" />
            <strong>Next Visit Date:</strong>{" "}
            {interaction.nextVisitDate || "Not scheduled"}
          </Col>
        </Row>

        <hr />
        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: "600" }}>
            Minutes of Meeting (MOMs) / Notes
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            readOnly
            defaultValue={
              interaction.moms || "No minutes recorded for this meeting."
            }
            style={{ backgroundColor: "#f9f9f9" }}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

/* -------------------- Main SalesDetails Component -------------------- */

export default function SalesDetails() {
  const { id: routeParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // IDs from navigation
  const stateLeadId = location.state?.leadId;
  const stateEmpId = location.state?.salespersonId;

  const leadId = stateLeadId || routeParam || ""; // lead_list / fetch_lead_data "id"
  const [empId, setEmpId] = useState(stateEmpId || null); // sale_person_list "emp_id"

  // Optional display values
  const stateClientName = location.state?.clientName || "";
  const stateSalespersonName = location.state?.salespersonName || "";
  const stateStage = location.state?.stage || "";
  const stateRemark = location.state?.remark || "";

  const [leadHeader, setLeadHeader] = useState(null);
  const [headerLoading, setHeaderLoading] = useState(false);

  const [stageOptions, setStageOptions] = useState([]);
  const [stageLoading, setStageLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState(stateStage || "");

  const [salesLogs, setSalesLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleShowRejectModal = () => setShowRejectModal(true);
  const handleCloseRejectModal = () => setShowRejectModal(false);

  const quotationToRejectId = leadId ? `${leadId}-Q1` : null;

  /* --------- ERP: fetch lead header by id --------- */

  const fetchLeadHeader = async () => {
    if (!leadId) return;

    try {
      setHeaderLoading(true);

      const res = await fetch(`${ERP_BASE}/fetch_lead_data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: String(leadId) }),
      });

      const data = await res.json();
      console.log("fetch_lead_data (SalesDetails):", data);

      if (
        (data.status === true || data.status === "true") &&
        (data.success === "1" || data.success === 1) &&
        data.data
      ) {
        const lead = Array.isArray(data.data) ? data.data[0] : data.data;
        setLeadHeader(lead);
        setSelectedStage(lead.stage || "");

        // fallback emp_id from lead if not passed
        if (!stateEmpId && lead.emp_id) {
          console.log(
            "Using emp_id from lead header as fallback:",
            lead.emp_id
          );
          setEmpId(lead.emp_id);
        }
      } else {
        toast.error(data.message || "Lead not found for this ID.");
        setLeadHeader(null);
      }
    } catch (err) {
      console.error("Error fetching lead header:", err);
      toast.error("Something went wrong while loading lead details.");
      setLeadHeader(null);
    } finally {
      setHeaderLoading(false);
    }
  };

  /* --------- ERP: stage_list (for dropdown) --------- */

  const fetchStages = async () => {
    setStageLoading(true);
    try {
      const fd = new FormData();
      const res = await fetch(`${ERP_BASE}/stage_list`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      console.log("stage_list (SalesDetails):", data);

      if (
        (data.status === true || data.status === "true") &&
        (data.success === "1" || data.success === 1)
      ) {
        setStageOptions(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch stages.");
      }
    } catch (err) {
      console.error("Error fetching stage list:", err);
      toast.error("Something went wrong while loading stages.");
    } finally {
      setStageLoading(false);
    }
  };

  /* --------- ERP: update_lead_stage --------- */

  const handleStageChange = async (newStage) => {
    if (!leadId) return;

    const prevStage = selectedStage;
    setSelectedStage(newStage);

    try {
      const res = await fetch(`${ERP_BASE}/update_lead_stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: String(leadId), stage: newStage }),
      });

      const data = await res.json();
      console.log("update_lead_stage (SalesDetails):", data);

      if (
        !(
          (data.status === true || data.status === "true") &&
          (data.success === "1" || data.success === 1)
        )
      ) {
        toast.error(data.message || "Failed to update stage.");
        setSelectedStage(prevStage);
        return;
      }

      toast.success(`Stage updated to: ${newStage}`);
      setLeadHeader((prev) => (prev ? { ...prev, stage: newStage } : prev));
    } catch (err) {
      console.error("Error updating stage:", err);
      toast.error("Something went wrong while updating stage.");
      setSelectedStage(prevStage);
    }
  };

  /* --------- SALES LOG: list_sales_log --------- */

  const fetchSalesLogs = async () => {
    if (!leadId) return;
    setLoadingLogs(true);
    try {
      // API expects { lead_id }
      const res = await fetch(`${SALES_API_BASE}/list_sales_log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId }),
      });

      const data = await res.json();
      console.log("list_sales_log:", data);

      if (data.status && data.success === "1" && Array.isArray(data.data)) {
        const mapped = data.data.map((log) => ({
          id: log.id, // unique log row id (for delete)
          lead_id: log.lead_id,
          emp_id: log.emp_id,
          // main date field: use last_interaction, fall back to date_of_interaction
          date: log.last_interaction || log.date_of_interaction || "",
          // mode & location & notes stored in old API keys
          mode: log.modee || "",
          location: log.details || "",
          status: log.status || "",
          moms: log.notes || "",
          // NEW: map next visit date from API
          nextVisitDate: log.nxt_visit_date || log.nxt_date || "",
        }));
        setSalesLogs(mapped);
      } else {
        toast.error(data.message || "Failed to load sales logs.");
        setSalesLogs([]);
      }
    } catch (err) {
      console.error("Error fetching sales logs:", err);
      toast.error("Something went wrong while loading sales logs.");
      setSalesLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  /* --------- SALES LOG: add_sales_log --------- */

  const handleAddInteraction = async (newInteractionData) => {
    if (!leadId) {
      toast.error("Lead ID is missing. Cannot save log.");
      return;
    }

    if (!empId) {
      toast.error(
        "Salesperson ID (emp_id) is missing. Cannot save log. Please navigate from the previous page."
      );
      console.error("emp_id is null! Navigation state:", location.state);
      return;
    }

    // Map our UI fields to the API's expected field names
    const payload = {
    lead_id: leadId,
    emp_id: empId,
    last_interaction: newInteractionData.date,
    status: newInteractionData.status,
    nxt_visit_date: newInteractionData.nextVisitDate || "",   // <-- NEW
    project_name: leadHeader?.project_name || "",
    clients: leadHeader?.client_name || "",
    follow_up: "",
    date_of_interaction: newInteractionData.date,
    details: newInteractionData.location,
    modee: newInteractionData.mode,
    statuss: "Active",
    notes: newInteractionData.moms,
    nxt_date: newInteractionData.nextVisitDate || "",         // <-- optional mirror
  };

    console.log("📤 Adding sales log with payload:", payload);

    try {
      const res = await fetch(`${SALES_API_BASE}/add_sales_log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("add_sales_log response:", data);

     if (data.status && data.success === "1") {
  const inserted = {
    id: data.id || new Date().getTime(),
    lead_id: leadId,
    emp_id: empId,
    date: payload.last_interaction,
    mode: payload.modee,
    location: payload.details,
    status: payload.status,
    moms: payload.notes,
    nextVisitDate: newInteractionData.nextVisitDate || "",  // <-- NEW
  };
  setSalesLogs((prev) => [inserted, ...prev]);
  toast.success(data.message || "Sales log added successfully.");
} else {
        toast.error(data.message || "Failed to add sales log.");
      }
    } catch (err) {
      console.error("Error adding sales log:", err);
      toast.error("Something went wrong while adding sales log.");
    }
  };

  /* --------- REJECT QUOTATION (adds Rejected log) --------- */

  const handleRejectQuotation = async (qId, reason) => {
    if (!leadId) {
      toast.error("Lead ID is missing. Cannot reject quotation.");
      return;
    }

    if (!empId) {
      toast.error(
        "Salesperson ID (emp_id) is missing. Cannot reject quotation. Please navigate from the previous page."
      );
      console.error("emp_id is null! Navigation state:", location.state);
      return;
    }

    const today = new Date().toISOString().substring(0, 10);

    const payload = {
      lead_id: leadId,
      emp_id: empId,
      last_interaction: today,
      status: "Rejected",
      nxt_visit_date: "",
      project_name: leadHeader?.project_name || "",
      clients: leadHeader?.client_name || "",
      follow_up: "",
      date_of_interaction: today,
      details: `Quotation ID: ${qId}`,
      modee: "System/Official",
      statuss: "Active",
      notes: `QUOTATION ${qId} REJECTED: ${reason}. This action was initiated by the salesperson.`,
      nxt_date: "",
    };

    console.log("📤 Rejecting quotation with payload:", payload);

    try {
      const res = await fetch(`${SALES_API_BASE}/add_sales_log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("add_sales_log (reject quotation) response:", data);

      if (data.status && data.success === "1") {
        const newLog = {
          id: data.id || new Date().getTime(),
          lead_id: leadId,
          emp_id: empId,
          date: payload.last_interaction,
          mode: payload.modee,
          location: payload.details,
          status: payload.status,
          moms: payload.notes,
          nextVisitDate: "",
        };
        setSalesLogs((prev) => [newLog, ...prev]);
        toast.success(data.message || `Quotation ${qId} marked as rejected.`);
      } else {
        toast.error(data.message || "Failed to reject quotation.");
      }
    } catch (err) {
      console.error("Error rejecting quotation:", err);
      toast.error("Something went wrong while rejecting quotation.");
    }
  };

  /* --------- SALES LOG: delete_sales_log --------- */

  const handleDeleteLog = async (logId) => {
    if (!logId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this sales log?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${SALES_API_BASE}/delete_sales_log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: logId }), // API expects { "id": <log id> }
      });

      const data = await res.json();
      console.log("delete_sales_log:", data);

      if (data.status && data.success === "1") {
        setSalesLogs((prev) => prev.filter((log) => log.id !== logId));
        toast.success(data.message || "Sales log deleted successfully.");
      } else {
        toast.error(data.message || "Failed to delete sales log.");
      }
    } catch (err) {
      console.error("Error deleting sales log:", err);
      toast.error("Something went wrong while deleting sales log.");
    }
  };

  /* --------- INITIAL LOAD --------- */

  useEffect(() => {
    console.log("🔍 SalesDetails mounted with:", {
      leadId,
      empId: stateEmpId || empId,
      navigationState: location.state,
    });

    fetchLeadHeader();
    fetchStages();
    fetchSalesLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  /* --------- DERIVED HEADER FIELDS --------- */

 const clientName = leadHeader?.client_name || stateClientName || "-";
const projectName = leadHeader?.project_name || "-";            // ⬅️ NEW
const salespersonName =
  leadHeader?.sales_person || stateSalespersonName || "-";
const currentStage = selectedStage || leadHeader?.stage || "N/A";
const remarks =
  leadHeader?.remark ||
  leadHeader?.additional_notes ||
  stateRemark ||
  "N/A";

  // filter logs for active salesperson only
  const logsForActiveSalesperson = empId
    ? salesLogs.filter((log) => String(log.emp_id) === String(empId))
    : salesLogs;

  /* --------- RENDER --------- */

  return (
    <Container fluid className="p-4">
      {/* Header & Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <Button
            onClick={() => navigate(-1)}
            className="btn-sm me-3"
            style={{ backgroundColor: "rgb(237, 49, 49)", border: "none" }}
          >
            <FaArrowLeft />
          </Button>
          <h3 className="m-0" style={{ fontWeight: "700" }}>
            Lead Interaction History
          </h3>
        </div>
        <div>
          <Button
            variant="success"
            onClick={handleShowModal}
            className="add-customer-btn btn btn-primary"
            disabled={!empId}
          >
            <FaPlus className="me-2" /> Add Log
          </Button>
        </div>
      </div>

      {/* Warning if emp_id is missing */}
      {!empId && (
        <div className="alert alert-warning mb-3" role="alert">
          ⚠️ <strong>Warning:</strong> Salesperson ID is missing. Some features
          may not work correctly. Please navigate from the Salesperson page to
          ensure proper data flow.
        </div>
      )}

      {/* Client & Lead Summary */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0 mt-0 card-title">Client & Lead Summary</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Client Name </Form.Label>
                    <Form.Control readOnly value={clientName} />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                 <Form.Label>project Name </Form.Label>
                    <Form.Control readOnly value={projectName} /> 
                </Col>

               

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Remarks</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      readOnly
                      value={remarks}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sales Log / Interaction History */}
      <Row>
        <Col md={12}>
          <h4 className="mb-3 mt-4">Meeting & Interaction Log</h4>

          {loadingLogs ? (
            <Card>
              <Card.Body className="text-center p-4">
                Loading interactions...
              </Card.Body>
            </Card>
          ) : logsForActiveSalesperson.length > 0 ? (
            [...logsForActiveSalesperson]
              .sort((a, b) => {
                const aId = Number(a.id) || 0;
                const bId = Number(b.id) || 0;
                return bId - aId; // 🔝 newest log id first
              })
              .map((interaction) => (
                <InteractionCard
                  key={interaction.id}
                  interaction={interaction}
                  lead={leadHeader}
                  onDelete={handleDeleteLog}
                />
              ))
          ) : (
            <Card>
              <Card.Body className="text-center p-4">
                No detailed interaction history recorded for this lead.
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Add Interaction Modal */}
      <InteractionModal
        show={showModal}
        handleClose={handleCloseModal}
        handleSubmit={handleAddInteraction}
      />

      {/* Reject Quotation Modal */}
      <QuotationRejectModal
        show={showRejectModal}
        handleClose={handleCloseRejectModal}
        quotationId={quotationToRejectId}
        handleSubmit={handleRejectQuotation}
      />
    </Container>
  );
}
