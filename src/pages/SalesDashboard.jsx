
// src/pages/SalesDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaEye, FaUsers, FaClock, FaCalendarAlt, FaUserTie } from "react-icons/fa";

const API_BASE = "https://nlfs.in/erp/index.php/Erp";
const ITEMS_PER_PAGE = 8;

// Normalize date to yyyy-mm-dd format
const normalizeApiDate = (value) => {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length !== 3) return "";
  if (parts[0].length === 4) return value; // Already yyyy-mm-dd
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd}`;
};

// Calculate reminder date (15 days after last interaction / visiting_date)
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

// Get countdown days until target date
const getCountdownDays = (targetDateString) => {
  if (!targetDateString || targetDateString === "N/A") return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(targetDateString + "T00:00:00");
  if (isNaN(targetDate.getTime())) return null;
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function SalesDashboard() {
  // All leads/clients enriched with salesperson info
  const [allLeadsWithSalesperson, setAllLeadsWithSalesperson] = useState([]);
  const [salespersons, setSalespersons] = useState([]);

  // NEW: map of emp_id -> total_sales from employee_list API
  const [salespersonTotalSales, setSalespersonTotalSales] = useState({});

  // still used as a fallback from fetch_client_data
  const [salespersonClientCounts, setSalespersonClientCounts] = useState({});

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const handleViewSalespersonClients = (salespersonId, salespersonName) => {
    navigate(`/sales-person/${salespersonId}`, {
      state: { salespersonId, salespersonName },
    });
    toast.success(`Showing all clients for ${salespersonName}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // -----------------------------
        // 1) Fetch salesperson master (with total_sales)
        // -----------------------------
        const spRes = await fetch(`${API_BASE}/employee_list`, {
          method: "GET",
        });
        const spData = await spRes.json();

        let onlySalespersons = [];
        const idToNameMap = {};
        const totalSalesMap = {}; // emp_id -> total_sales

        if (spData.status && spData.success === "1" && Array.isArray(spData.data)) {
          // Keep only role === "salesperson"
          onlySalespersons = spData.data.filter(
            (sp) => (sp.role || "").toLowerCase() === "salesperson"
          );

          onlySalespersons.forEach((sp) => {
            const id = String(sp.emp_id);
            const name = sp.name || "";
            idToNameMap[id] = name;

            // grab total_sales for each salesperson
            const ts = sp.total_sales != null ? Number(sp.total_sales) : 0;
            totalSalesMap[id] = isNaN(ts) ? 0 : ts;
          });

          setSalespersons(onlySalespersons);
          setSalespersonTotalSales(totalSalesMap);
        } else {
          toast.error(spData.message || "Failed to fetch salespersons");
        }

        // -----------------------------
        // 2) Fetch all leads via lead_list to get lead IDs
        // -----------------------------
        const fd = new FormData();
        fd.append("start_date", "");
        fd.append("end_date", "");
        fd.append("keyword", "");
        fd.append("stage", "");
        fd.append("sales_person", "");

        const leadRes = await fetch(`${API_BASE}/lead_list`, {
          method: "POST",
          body: fd,
        });
        const leadData = await leadRes.json();

        if (!(leadData?.status && leadData.success === "1" && Array.isArray(leadData.data))) {
          toast.error(leadData.message || "Failed to fetch leads");
          setAllLeadsWithSalesperson([]);
          setSalespersonClientCounts({});
          return;
        }

        // -----------------------------
        // 3) Fetch client data for each lead to get employee mapping
        // -----------------------------
        const enrichedLeads = [];
        const clientCountsTemp = {};

        for (const lead of leadData.data) {
          try {
            const clientFd = new FormData();
            clientFd.append("id", lead.id);

            const clientRes = await fetch(`${API_BASE}/fetch_client_data`, {
              method: "POST",
              body: clientFd,
            });
            const clientData = await clientRes.json();

            let salespersonId = null;
            let salespersonName = lead.sales_person || "N/A";

            if (clientData?.status && clientData.success === "1" && clientData.data) {
              const empId = String(clientData.data.emp_id || "");

              if (empId && empId !== "" && idToNameMap[empId]) {
                salespersonId = empId;
                salespersonName = idToNameMap[empId];

                // Count clients per salesperson (fallback)
                clientCountsTemp[empId] = (clientCountsTemp[empId] || 0) + 1;
              }
            }

            const visitDateNormalized = normalizeApiDate(lead.visiting_date || "");
            const reminderDate = calculateReminderDate(visitDateNormalized);
            const countdownDays = getCountdownDays(reminderDate);

            enrichedLeads.push({
              ...lead,
              leadId: lead.id,
              salespersonId,
              salespersonName,
              clientName: lead.client_name || "N/A",
              companyName: lead.contractor || "N/A",
              visitDate: visitDateNormalized,
              reminderDate,
              countdownDays,
            });
          } catch (error) {
            console.error(`Error fetching client data for lead ${lead.id}:`, error);

            const visitDateNormalized = normalizeApiDate(lead.visiting_date || "");
            const reminderDate = calculateReminderDate(visitDateNormalized);
            const countdownDays = getCountdownDays(reminderDate);

            enrichedLeads.push({
              ...lead,
              leadId: lead.id,
              salespersonId: null,
              salespersonName: lead.sales_person || "N/A",
              clientName: lead.client_name || "N/A",
              companyName: lead.contractor || "N/A",
              visitDate: visitDateNormalized,
              reminderDate,
              countdownDays,
            });
          }
        }

        const sortedLeads = enrichedLeads.sort(
          (a, b) => new Date(b.visitDate || 0) - new Date(a.visitDate || 0)
        );

        setAllLeadsWithSalesperson(sortedLeads);
        setSalespersonClientCounts(clientCountsTemp);

        toast.success("Sales data loaded successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to load sales data");
        setSalespersons([]);
        setAllLeadsWithSalesperson([]);
        setSalespersonClientCounts({});
        setSalespersonTotalSales({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // -----------------------------
  // Dashboard statistics
  // -----------------------------
  const statistics = useMemo(() => {
    const totalClients = allLeadsWithSalesperson.length;

    const overdueFollowups = allLeadsWithSalesperson.filter(
      (lead) => lead.countdownDays !== null && lead.countdownDays < 0
    ).length;

    const upcomingFollowups = allLeadsWithSalesperson.filter(
      (lead) =>
        lead.countdownDays !== null &&
        lead.countdownDays >= 0 &&
        lead.countdownDays <= 7
    ).length;

    const activeSalespeople = new Set(
      allLeadsWithSalesperson.map((lead) => lead.salespersonId).filter(Boolean)
    ).size;

    return {
      totalClients,
      overdueFollowups,
      upcomingFollowups,
      activeSalespeople,
    };
  }, [allLeadsWithSalesperson]);

  // -----------------------------
  // Search & pagination on salespersons
  // -----------------------------
  const filteredSalespersons = useMemo(() => {
    if (!searchTerm) return salespersons;
    const lower = searchTerm.toLowerCase();
    return salespersons.filter((sp) => {
      const searchable = [
        sp.name,
        sp.emp_id,
        sp.mob,
        sp.email,
        sp.location,
        sp.designation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(lower);
    });
  }, [salespersons, searchTerm]);

  const totalPages = Math.ceil(filteredSalespersons.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSalespersons.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSalespersons, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="sales-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Sales Dashboard</h1>
        <input
          type="text"
          className="dashboard-search"
          placeholder="Search by Salesperson, Client, Company"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Top stats cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <FaUsers />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Clients</div>
            <div className="stat-value">{statistics.totalClients}</div>
            <div className="stat-description">Active client relationships</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-red">
            <FaClock />
          </div>
          <div className="stat-content">
            <div className="stat-label">Overdue Follow-ups</div>
            <div className="stat-value">{statistics.overdueFollowups}</div>
            <div className="stat-description">Require immediate attention</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-yellow">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <div className="stat-label">Upcoming (7 days)</div>
            <div className="stat-value">{statistics.upcomingFollowups}</div>
            <div className="stat-description">Follow-ups due soon</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <FaUserTie />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Salespeople</div>
            <div className="stat-value">4</div>
            <div className="stat-description">Team members managing clients</div>
          </div>
        </div>
      </div>

      {/* Salespersons listing */}
      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : currentItems.length > 0 ? (
        <div className="cards-grid">
          {currentItems.map((sp) => {
            const empId = String(sp.emp_id);

            // Prefer backend total_sales, fall back to counted clients
            const clientCount =
              salespersonTotalSales[empId] ??
              salespersonClientCounts[empId] ??
              0;

            return (
              <div key={empId} className="person-card">
                <div className="person-name">{sp.name}</div>
                <div className="client-count">Clients: {clientCount}</div>
                <div className="person-actions">
                  <button
                    className="buttonEye text-light"
                    onClick={() =>
                      handleViewSalespersonClients(empId, sp.name)
                    }
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          No salespersons found matching your search.
        </div>
      )}
    </div>
  );
}
