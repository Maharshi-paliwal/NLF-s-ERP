// src/LeadGeneration.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Pagination,
  Table,
  Modal,
} from "react-bootstrap";
import { FaPlus, FaEye, FaTrash } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "https://nlfs.in/erp/index.php/Erp";

// Helper: format date for display (dd-mm-yyyy)
const formatDisplayDate = (dateString) => {
  if (
    !dateString ||
    dateString === "visiting_date" ||
    dateString === "0000-00-00" ||
    dateString === "" ||
    String(dateString).toLowerCase() === "null"
  ) {
    return "";
  }

  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;

  // If yyyy-mm-dd → convert to dd-mm-yyyy
  if (parts[0].length === 4) {
    const [yyyy, mm, dd] = parts;
    return `${dd}-${mm}-${yyyy}`;
  }

  return dateString;
};

// normalize a stage just for comparison
const normalizeStage = (s) => (s || "").toLowerCase().trim();

// Map stage to color
const getStageColor = (stageRaw) => {
  const stage = normalizeStage(stageRaw);
  const stageMap = {
    submit: "#198754",
    finalised: "#0d6efd",
    civil: "#ffc107",
    lost: "#dc3545",
  };
  return stageMap[stage] || "#ffffff";
};

// Allowed transitions (normalized names only)
const getAllowedStagesForLead = (currentStageNorm) => {
  const stage = currentStageNorm || "civil";

  if (stage === "civil") {
    // default / civil → can move to finalised or lost
    return ["civil", "finalised", "lost"];
  }

  if (stage === "finalised") {
    // finalised → only submit
    return ["finalised", "submit"];
  }

  if (stage === "submit" || stage === "lost") {
    // locked
    return [stage];
  }

  return [stage];
};

export default function LeadGeneration() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSalesperson, setSelectedSalesperson] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [timeFilter, setTimeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [leadStages, setLeadStages] = useState({});

  const [leads, setLeads] = useState([]);
  const [leadLoading, setLeadLoading] = useState(false);
  const [stageOptions, setStageOptions] = useState([]);
  const [stageLoading, setStageLoading] = useState(false);
  const [salespersonOptions, setSalespersonOptions] = useState([]);
  const [salespersonLoading, setSalespersonLoading] = useState(false);

  // Next Visit modal state
  const [showNextVisitModal, setShowNextVisitModal] = useState(false);
  const [selectedLeadForNextVisit, setSelectedLeadForNextVisit] =
    useState(null);
  const [nextVisitDate, setNextVisitDate] = useState(null);

  const itemsPerPage = 10;
  const navigate = useNavigate();

  // ---------- Helpers for Next Visit ----------
  const formatDateToYMD = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleOpenNextVisitModal = (leadItem) => {
    setSelectedLeadForNextVisit(leadItem);
    setNextVisitDate(null);
    setShowNextVisitModal(true);
  };

  const handleSaveNextVisit = async () => {
    if (!selectedLeadForNextVisit || !nextVisitDate) {
      toast.error("Please select a next visit date");
      return;
    }

    try {
      const isoDate = formatDateToYMD(nextVisitDate);

      const body = {
        nxt_visit_date: isoDate,
        emp_id: selectedLeadForNextVisit.empId || "",
        project_name: selectedLeadForNextVisit.projectName,
        clients: selectedLeadForNextVisit.clientName,
      };

      const res = await fetch(
        "https://nlfs.in/erp/index.php/Erp/add_next_visit_date",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (data?.status === "true" || (data.status && data.success === "1")) {
        toast.success(data.message || "Next visit date saved");
        setShowNextVisitModal(false);

        setLeads((prev) =>
          prev.map((l) =>
            String(l.leadId) === String(selectedLeadForNextVisit.leadId)
              ? { ...l, nextVisitDate: isoDate }
              : l
          )
        );
      } else {
        toast.error(data.message || "Failed to save next visit date");
      }
    } catch (error) {
      console.error("Error saving next visit date:", error);
      toast.error("Error saving next visit date");
    }
  };

  // ---------- Fetch on mount ----------
  useEffect(() => {
    fetchLeads();
    fetchStages();
    fetchSalespersons();
  }, []);

  const fetchLeads = async () => {
    setLeadLoading(true);
    try {
      const res = await fetch(`${API_BASE}/lead_list`, { method: "POST" });
      const data = await res.json();

      if (data.status && data.success === "1") {
        const normalized = (data.data || []).map((row) => {
          // Default stage to "civil" if empty/null
          const rawStage = row.stage && String(row.stage).trim();
          const finalStage = rawStage && rawStage !== "" ? row.stage : "civil";

          return {
            key: row.id,
            leadId: row.id,
            projectName: row.project_name,
            architectName: row.architech_name,
            clientName: row.client_name,
            email: row.email,
            branch: row.branch,
            contractor: row.contractor,
            department: row.department,
            salespersonName: row.sales_person,
            empId: row.emp_id || row.sales_person_id || "",
            stage: finalStage, // keep API value
            remark: row.remark,
            visitDate: row.visiting_date,
            nextVisitDate: row.nxt_visit_date,
          };
        });

        const sortedLeads = normalized.sort(
          (a, b) => Number(b.leadId) - Number(a.leadId)
        );
        setLeads(sortedLeads);
      } else {
        toast.error(data.message || "Failed to fetch leads.");
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      toast.error("Something went wrong while loading leads.");
    } finally {
      setLeadLoading(false);
    }
  };

  const fetchStages = async () => {
    setStageLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stage_list`, { method: "POST" });
      const data = await res.json();

      if (data.status && data.success === "1") {
        setStageOptions(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch stages.");
      }
    } catch (err) {
      console.error("Error fetching stages:", err);
      toast.error("Something went wrong while loading stages.");
    } finally {
      setStageLoading(false);
    }
  };

  const fetchSalespersons = async () => {
    setSalespersonLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sale_person_list`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.status && data.success === "1") {
        setSalespersonOptions(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch salespersons.");
      }
    } catch (err) {
      console.error("Error fetching salespersons:", err);
      toast.error("Error loading sales team.");
    } finally {
      setSalespersonLoading(false);
    }
  };

  const getPeriodRange = (period) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (period) {
      case "monthly":
        return {
          start: new Date(year, month, 1),
          end: new Date(year, month + 1, 0, 23, 59, 59),
        };
      case "quarterly": {
        const quarter = Math.floor(month / 3);
        const qStartMonth = quarter * 3;
        const qEndMonth = qStartMonth + 2;
        return {
          start: new Date(year, qStartMonth, 1),
          end: new Date(year, qEndMonth + 1, 0, 23, 59, 59),
        };
      }
      case "yearly":
        return {
          start: new Date(year, 0, 1),
          end: new Date(year + 1, 0, 0, 23, 59, 59),
        };
      default:
        return null;
    }
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split("-");
    if (parts.length !== 3) return null;

    const [d, m, y] = parts.map(Number);
    const isYMD = String(d).length === 4;
    return isYMD ? new Date(d, m - 1, y) : new Date(y, m - 1, d);
  };

  const filteredData = useMemo(() => {
    const periodRange = timeFilter !== "all" ? getPeriodRange(timeFilter) : null;

    return leads.filter((item) => {
      if (
        selectedSalesperson &&
        item.salespersonName !== selectedSalesperson
      ) {
        return false;
      }

      if (startDate || endDate) {
        const itemDate = parseDate(item.visitDate);
        if (!itemDate) return false;

        const start = startDate
          ? new Date(startDate.setHours(0, 0, 0, 0))
          : null;
        const end = endDate
          ? new Date(endDate.setHours(23, 59, 59, 999))
          : null;

        if (start && itemDate < start) return false;
        if (end && itemDate > end) return false;
      }

      if (periodRange && item.visitDate) {
        const itemDate = parseDate(item.visitDate);
        if (
          !itemDate ||
          itemDate < periodRange.start ||
          itemDate > periodRange.end
        ) {
          return false;
        }
      }

      const term = searchTerm.toLowerCase();
      const searchStr = `${item.projectName} ${item.clientName} ${item.contractor} ${item.department} ${item.stage} ${item.salespersonName}`.toLowerCase();
      return searchStr.includes(term);
    });
  }, [
    leads,
    searchTerm,
    selectedSalesperson,
    startDate,
    endDate,
    timeFilter,
  ]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleViewLead = (leadId) => {
    navigate(`/view-leads/${leadId}`);
  };

  // Enforce workflow, but we still send the raw value from API
  const handleStageChange = async (leadId, newStageRaw) => {
    const newStageNorm = normalizeStage(newStageRaw);

    const lead = leads.find((l) => String(l.leadId) === String(leadId));
    const prevRaw = leadStages[leadId] ?? lead?.stage ?? "civil";
    const prevNorm = normalizeStage(prevRaw) || "civil";

    if (prevNorm === "submit" || prevNorm === "lost") {
      toast.error("This lead is locked and its stage cannot be changed.");
      return;
    }

    const allowedNorm = getAllowedStagesForLead(prevNorm);
    if (!allowedNorm.includes(newStageNorm)) {
      toast.error("Invalid stage transition based on workflow.");
      return;
    }

    setLeadStages((prev) => ({ ...prev, [leadId]: newStageRaw }));

    try {
      const res = await fetch(`${API_BASE}/update_lead_stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: String(leadId), stage: newStageRaw }),
      });

      const data = await res.json();

      if (data.status && data.success === "1") {
        toast.success(`Stage updated to: ${newStageRaw}`);
        setLeads((prev) =>
          prev.map((l) =>
            String(l.leadId) === String(leadId)
              ? { ...l, stage: newStageRaw }
              : l
          )
        );
      } else {
        toast.error(data.message || "Failed to update stage");
        setLeadStages((prev) => ({ ...prev, [leadId]: prevRaw }));
      }
    } catch (err) {
      console.error("Error updating stage:", err);
      toast.error("Something went wrong");
      setLeadStages((prev) => ({ ...prev, [leadId]: prevRaw }));
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(`${API_BASE}/delete_lead_data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: String(leadId) }),
      });

      const data = await res.json();

      if (data.status && data.success === "1") {
        toast.success("Lead deleted successfully");
        setLeads((prev) =>
          prev.filter((lead) => String(lead.leadId) !== String(leadId))
        );
      } else {
        toast.error(data.message || "Failed to delete lead");
      }
    } catch (err) {
      console.error("Error deleting lead:", err);
      toast.error("Something went wrong");
    }
  };

  // ---------- ROW RENDER WITH DISABLED OPTIONS ----------
  const renderRow = (item, index) => {
    const rawStage = leadStages[item.leadId] ?? item.stage ?? "civil";
    const normStage = normalizeStage(rawStage) || "civil";
    const stageColor = getStageColor(rawStage);

    const allowedNorm = getAllowedStagesForLead(normStage);
    const isLocked = normStage === "submit" || normStage === "lost";

    return (
      <tr key={item.key}>
        <td>{indexOfFirstItem + index + 1}</td>
        <td>{item.projectName}</td>
        <td>{item.architectName}</td>
        <td>{item.contractor}</td>
        <td>{item.department}</td>
        <td>
          <Form.Select
            size="sm"
            value={rawStage}
            onChange={(e) => handleStageChange(item.leadId, e.target.value)}
            className="lead-stage-select"
            disabled={isLocked}
            style={{
              width: "120px",
              textTransform: "capitalize",
              backgroundColor: stageColor,
              color: normStage ? "#ffffff" : "#000000",
              border: "1px solid #ced4da",
            }}
            title={
              isLocked
                ? "This lead is locked and cannot be changed."
                : "Change stage"
            }
          >
            <option value="">Stage</option>
            {!stageLoading &&
              stageOptions.map((stg, idx) => {
                const label = stg.stage || stg.name || `Stage ${idx + 1}`;
                const value = stg.stage || stg.name || label; // raw API value
                const labelNorm = normalizeStage(label);

                // 🔒 Disable options that aren't allowed according to workflow
                const disabled =
                  !allowedNorm.includes(labelNorm) || isLocked;

                return (
                  <option
                    key={stg.stage_id || stg.id || idx}
                    value={value}
                    disabled={disabled}
                  >
                    {label}
                  </option>
                );
              })}
          </Form.Select>
        </td>
        <td>{formatDisplayDate(item.visitDate)}</td>
        <td>
          <Button
            className="buttonEye"
            size="sm"
            onClick={() => handleViewLead(item.leadId)}
            title="View Lead"
          >
            <FaEye />
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="ms-1"
            onClick={() => handleDeleteLead(item.leadId)}
            title="Delete Lead"
          >
            <FaTrash />
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header
              style={{ backgroundColor: "#fff", borderBottom: "none" }}
            >
              <Row className="align-items-center">
                <Col>
                  <Card.Title
                    style={{ marginTop: "2rem", fontWeight: "700" }}
                  >
                    Lead Generation
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <Form.Select
                    value={selectedSalesperson}
                    onChange={(e) => {
                      setSelectedSalesperson(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ width: "200px" }}
                  >
                    <option value="">All Salesperson</option>
                    {salespersonLoading && <option>Loading...</option>}
                    {!salespersonLoading &&
                      salespersonOptions.map((sp) => (
                        <option key={sp.emp_id} value={sp.name}>
                          {sp.name}
                        </option>
                      ))}
                  </Form.Select>

                  <Form.Select
                    value={timeFilter}
                    onChange={(e) => {
                      setTimeFilter(e.target.value);
                      setStartDate(null);
                      setEndDate(null);
                      setCurrentPage(1);
                    }}
                    style={{ width: "100px" }}
                  >
                    <option value="all">Search by</option>
                    <option value="monthly">Month</option>
                    <option value="quarterly">Quarter</option>
                    <option value="yearly">Year</option>
                  </Form.Select>

                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ width: "240px" }}
                  >
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => {
                        setStartDate(date);
                        setTimeFilter("all");
                        setCurrentPage(1);
                      }}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="Start Date"
                      className="form-control"
                      dateFormat="dd-MM-yyyy"
                      isClearable
                    />
                    <span>to</span>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => {
                        setEndDate(date);
                        setTimeFilter("all");
                        setCurrentPage(1);
                      }}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="End Date"
                      className="form-control"
                      dateFormat="dd-MM-yyyy"
                      isClearable
                    />
                  </div>

                  <Form.Control
                    type="text"
                    placeholder="Search by Project, stage or Department..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ width: "20vw" }}
                  />

                  <Button
                    as={Link}
                    to="/newlead"
                    className="btn btn-primary add-customer-btn"
                    style={{ width: "10vw" }}
                  >
                    <FaPlus size={14} className="me-1" /> Add Lead
                  </Button>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="table-full-width table-responsive">
              {leadLoading ? (
                <p className="text-center p-4">Loading leads...</p>
              ) : (
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Project Name</th>
                      <th>Architect</th>
                      <th>Contractor</th>
                      <th>Department</th>
                      <th>Stage</th>
                      <th>Visit Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map(renderRow)
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center p-4">
                          No leads found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>

            {/* Next Visit Modal */}
            <Modal
              show={showNextVisitModal}
              onHide={() => setShowNextVisitModal(false)}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title>Schedule Next Visit</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p className="mb-2">
                  Project:{" "}
                  <strong>
                    {selectedLeadForNextVisit?.projectName || "-"}
                  </strong>
                  <br />
                  Client:{" "}
                  <strong>
                    {selectedLeadForNextVisit?.clientName || "-"}
                  </strong>
                </p>

                <Form.Group className="mb-3">
                  <Form.Label>Next Visit Date</Form.Label>
                  <DatePicker
                    selected={nextVisitDate}
                    onChange={(date) => setNextVisitDate(date)}
                    className="form-control"
                    dateFormat="yyyy-MM-dd"
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowNextVisitModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveNextVisit}>
                  Save
                </Button>
              </Modal.Footer>
            </Modal>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center p-3">
                <Pagination>
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
