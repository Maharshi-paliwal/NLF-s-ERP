// src/pages/SalesPerson.jsx
import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Pagination,
  Form,
  Modal,
} from "react-bootstrap";
import { FaEye, FaPlus } from "react-icons/fa";

const API_BASE = "https://nlfs.in/erp/index.php/Erp";
const SALES_API_BASE = "https://nlfs.in/erp/index.php/Api";
const LEADS_PER_PAGE = 10;

const normalizeApiDate = (value) => {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length !== 3) return "";
  if (parts[0].length === 4) return value; // already yyyy-mm-dd
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd}`;
};

const calculateReminderDate = (interactionDate) => {
  if (!interactionDate) return "N/A";
  const lastInteraction = new Date(interactionDate + "T00:00:00");
  if (isNaN(lastInteraction.getTime())) return "N/A";
  lastInteraction.setDate(lastInteraction.getDate() + 15);
  const year = lastInteraction.getFullYear();
  const month = String(lastInteraction.getMonth() + 1).padStart(2, "0");
  const day = String(lastInteraction.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCountdownStatus = (targetDateString) => {
  if (!targetDateString || targetDateString === "N/A") {
    return { text: "N/A", style: "secondary" };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(targetDateString + "T00:00:00");
  if (isNaN(targetDate.getTime())) return { text: "N/A", style: "secondary" };
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)} days overdue!`, style: "danger" };
  } else if (diffDays === 0) {
    return { text: "Due Today!", style: "warning" };
  } else if (diffDays <= 3) {
    return { text: `${diffDays} days left`, style: "warning" };
  } else {
    return { text: `${diffDays} days left`, style: "success" };
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

export default function SalesPerson() {
  const { salespersonId: routeSalespersonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const stateSalespersonId = location.state?.salespersonId;
  const stateSalespersonName = location.state?.salespersonName;

  const activeSalespersonId = routeSalespersonId || stateSalespersonId || null;
  const activeSalespersonName = stateSalespersonName || "";

  const [allLeadsWithSalesperson, setAllLeadsWithSalesperson] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [newInteraction, setNewInteraction] = useState({
    date: new Date().toISOString().substring(0, 10),
    mode: "",
    location: "",
    status: "",
    moms: "",
  });

  // 👉 View details (still passes leadId + salespersonId)
  const handleViewLeadDetails = (lead) => {
    navigate(`/sales-details/${lead.leadListId}`, {
  state: {
    leadId: lead.leadListId,   // ✅ lead_list.id ONLY
    salespersonId: lead.salespersonId,
    clientName: lead.clientName,
    salespersonName: lead.salespersonName,
    stage: lead.stage,
    remark: lead.remark,
  },
});

    toast.success(`Fetching details for ${lead.clientName}...`);
  };

  const handleShowModal = (lead) => {
    setSelectedLead(lead);
    setNewInteraction({
      date: new Date().toISOString().substring(0, 10),
      mode: "",
      location: "",
      status: "",
      moms: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLead(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewInteraction((prev) => ({ ...prev, [name]: value }));
  };

  // 🔴 Add sales log
  // IMPORTANT: lead_id must be the same `id` that we get from /Erp/lead_list
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLead) {
      toast.error("No client selected");
      return;
    }

    // lead_list id (coming from lead_list / fetch_client_data)
    const leadId =
      selectedLead.leadListId ?? selectedLead.leadId ?? selectedLead.id;
    const empId = selectedLead.salespersonId;

    if (!leadId || !empId) {
      toast.error("Lead ID or Salesperson ID is missing.");
      return;
    }

    const payload = {
      // here we send the correct lead_list.id
      lead_id: String(leadId),
      emp_id: String(empId),
      last_interaction: newInteraction.date,
      status: newInteraction.status,
      nxt_visit_date: "",
      project_name: selectedLead.project_name || selectedLead.ProjectName || "",
      FirstDate: "",
      clients: selectedLead.client_name || selectedLead.clientName || "N/A",
      follow_up: "",
      date_of_interaction: newInteraction.date,
      details: newInteraction.location,
      modee: newInteraction.mode,
      statuss: "Active",
      notes: newInteraction.moms,
      nxt_date: "",
    };

    console.log("add_sales_log payload (SalesPerson):", payload);

    try {
      const res = await fetch(`${SALES_API_BASE}/add_sales_log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("add_sales_log response (SalesPerson):", data);

      if (data.status && data.success === "1") {
        toast.success("Interaction log added successfully!");
        handleCloseModal();
      } else {
        toast.error(data.message || "Failed to add sales log.");
      }
    } catch (err) {
      console.error("Error adding sales log:", err);
      toast.error("Something went wrong while adding sales log.");
    }
  };

  // 🔁 FETCH CLIENTS FOR THIS SALESPERSON USING fetch_client_data
  useEffect(() => {
    const fetchData = async () => {
      if (!activeSalespersonId) {
        toast.error("No salesperson selected.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        toast.loading("Fetching clients for salesperson...", {
          id: "fetch-clients",
        });

        const res = await fetch(`${API_BASE}/fetch_client_data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emp_id: String(activeSalespersonId) }),
        });

        const data = await res.json();
        console.log("fetch_client_data response:", data);

        if (
          (data.status === true || data.status === "true") &&
          (data.success === "1" || data.success === 1) &&
          Array.isArray(data.data)
        ) {
          const mapped = data.data.map((item) => {
            const lastInteraction = normalizeApiDate(item.last_interaction);
            const reminderDate = calculateReminderDate(lastInteraction);
            const countdown = getCountdownStatus(reminderDate);

            return {
              // ⬇️ This is the critical part:
              // item.id here should be the same as id from /Erp/lead_list (see screenshot 2)
              leadId: item.lead_id || item.id, // lead_list.id
              leadListId: item.lead_id || item.id, // keep explicit name too
              // If backend also has a separate client id, we can store it separately:
              clientId: item.client_id || null,

              salespersonId: activeSalespersonId,
              salespersonName: activeSalespersonName,
              clientName: item.client_name || "N/A",
              ProjectName: item.project_name || "N/A",
              Firstdate: item.visiting_date || "N/A",
              visitDate: lastInteraction,
              reminderDate,
              countdown,
              followUp: item.follow_up || "",
              stage: item.stage,
              remark: item.remark,
            };
          });

          const sorted = mapped.sort(
            (a, b) =>
              new Date(b.visitDate || "1970-01-01") -
              new Date(a.visitDate || "1970-01-01")
          );

          setAllLeadsWithSalesperson(sorted);
          toast.success("Client data loaded successfully!", {
            id: "fetch-clients",
          });
        } else {
          console.error(data.message || "Failed to fetch clients.");
          toast.error(data.message || "Failed to fetch clients", {
            id: "fetch-clients",
          });
          setAllLeadsWithSalesperson([]);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load client data", { id: "fetch-clients" });
        setAllLeadsWithSalesperson([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeSalespersonId, activeSalespersonName]);

  // Filter + pagination (unchanged)
  const filteredLeads = useMemo(() => {
    let baseLeads = allLeadsWithSalesperson;

    if (activeSalespersonId) {
      baseLeads = baseLeads.filter(
        (lead) => String(lead.salespersonId) === String(activeSalespersonId)
      );
    }

    if (!searchTerm) return baseLeads;

    const lower = searchTerm.toLowerCase();
    return baseLeads.filter((lead) => {
      const searchable = [
        lead.salespersonName,
        lead.salespersonId,
        lead.clientName,
        lead.ProjectName,
        lead.leadId,
        lead.Firstdate
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(lower);
    });
  }, [allLeadsWithSalesperson, searchTerm, activeSalespersonId]);

  const totalPages = Math.ceil(filteredLeads.length / LEADS_PER_PAGE);

  const currentLeads = useMemo(() => {
    const start = (currentPage - 1) * LEADS_PER_PAGE;
    return filteredLeads.slice(start, start + LEADS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginate = (page) => setCurrentPage(page);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let items = [];
    items.push(
      <Pagination.First
        key="first"
        onClick={() => paginate(1)}
        disabled={currentPage === 1}
      />
    );
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    if (endPage - startPage < 4) {
      if (currentPage <= 3) endPage = Math.min(totalPages, 5);
      else if (currentPage > totalPages - 2)
        startPage = Math.max(1, totalPages - 4);
    }

    if (startPage > 1)
      items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => paginate(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    if (endPage < totalPages)
      items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);

    items.push(
      <Pagination.Next
        key="next"
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );
    items.push(
      <Pagination.Last
        key="last"
        onClick={() => paginate(totalPages)}
        disabled={currentPage === totalPages}
      />
    );
    return items;
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover mb-4">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={6}>
                  <Card.Title
                    style={{
                      fontWeight: "700",
                      fontSize: "1.5rem",
                      marginBottom: "0",
                    }}
                  >
                    Sales
                    {activeSalespersonId && (
                      <span
                        style={{
                          fontSize: "0.9rem",
                          marginLeft: "10px",
                          fontWeight: 400,
                        }}
                      >
                        — Clients of{" "}
                        <strong>
                          {activeSalespersonName ||
                            `ID ${activeSalespersonId}`}
                        </strong>
                      </span>
                    )}
                  </Card.Title>
                </Col>
                <Col md={6} className="d-flex justify-content-end">
                  <Form.Control
                    type="text"
                    placeholder="Search by Client, Company, Lead ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "300px" }}
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {loading ? (
            <div className="text-center p-5">Loading...</div>
          ) : currentLeads.length > 0 ? (
            <Card className="strpied-tabled-with-hover">
              <Card.Body className="table-responsive p-0">
                <table className="table table-striped table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Sr. No</th>
                      <th>Client </th>
                      <th>Project</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLeads.map((lead, index) => (
                      <tr key={lead.leadId || lead.clientName}>
                        <td>
                          {(currentPage - 1) * LEADS_PER_PAGE + index + 1}
                        </td>
                        <td>
                          {lead.clientName} <br />
                          <small className="text-muted">
                            
                          </small>
                        </td>
                        <td>{lead.ProjectName}</td>
                        <td>
                        {lead.Firstdate}
                         
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleViewLeadDetails(lead)}
                            title="View Lead Details"
                            className="me-2"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            className="add-customer-btn"
                            size="sm"
                            onClick={() => handleShowModal(lead)}
                            title="Add Interaction Log"
                          >
                            <FaPlus />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card.Body>

              {totalPages > 1 && (
                <Card.Footer className="d-flex justify-content-center">
                  <Pagination size="sm">{renderPagination()}</Pagination>
                </Card.Footer>
              )}
            </Card>
          ) : (
            <Card>
              <Card.Body className="text-center py-4">
                {activeSalespersonId
                  ? "No clients found for this salesperson (or matching your search)."
                  : "No clients found matching your search."}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Add Interaction Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaPlus className="me-2" /> Add Client Interaction
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
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
            <Form.Group className="mb-3" controlId="formInteractionLocation">
              <Form.Label>Location / Details</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={newInteraction.location}
                onChange={handleChange}
                placeholder="Enter location or specific details"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formInteractionStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={newInteraction.status}
                onChange={handleChange}
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
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Save Interaction Log
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
