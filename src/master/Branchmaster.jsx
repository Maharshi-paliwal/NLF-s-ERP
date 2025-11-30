// src/BranchMaster.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Pagination, // ⭐ ADDED
} from "react-bootstrap";
import { FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

const ERP_API_BASE = "https://nlfs.in/erp/index.php/Erp";
// delete_branch is under /Api according to your docs
const ERP_DELETE_BASE = "https://nlfs.in/erp/index.php/Api";

const Branchmaster = () => {
  const [branchSearch, setBranchSearch] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ⭐ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ------------ FETCH BRANCH LIST (NO SEARCH PARAM) ------------
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ERP_API_BASE}/branch_list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // no search → full list
      });

      const data = await res.json();
      console.log("branch_list response:", data);

      if (data.status && data.success === "1") {
        // data.data = [{ id: "1", branch_name: "Nagpur" }, ...]
        setBranches(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch branches.");
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
      toast.error("Something went wrong while loading branches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // ------------ FRONTEND SEARCH/FILTER ------------
  const filteredBranches = useMemo(() => {
    if (!branchSearch) return branches;
    const s = branchSearch.toLowerCase();
    return branches.filter((b) =>
      b.branch_name?.toLowerCase().includes(s)
    );
  }, [branchSearch, branches]);

  // ⭐ PAGINATION BASED ON filteredBranches
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBranches = filteredBranches.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // ------------ ADD BRANCH (API) ------------
  const handleAddBranch = async (e) => {
    e.preventDefault();

    if (!branchName.trim()) {
      toast.error("Please enter a branch name.");
      return;
    }

    try {
      const res = await fetch(`${ERP_API_BASE}/add_branch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branch_name: branchName.trim(),
        }),
      });

      const data = await res.json();
      console.log("add_branch response:", data);

      if (data.status && data.success === "1") {
        toast.success(data.message || "Branch added successfully.");
        setBranchName("");
        await fetchBranches(); // refresh list to include the new branch
        setCurrentPage(1); // ⭐ Go back to first page
      } else {
        toast.error(data.message || "Failed to add branch.");
      }
    } catch (err) {
      console.error("Error adding branch:", err);
      toast.error("Something went wrong while adding branch.");
    }
  };

  // ------------ DELETE BRANCH (API) ------------
  const handleDeleteBranch = async (id) => {
    if (!id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this branch?"
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const res = await fetch(`${ERP_DELETE_BASE}/delete_branch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      console.log("delete_branch response:", data);

      if (
        (data.status === true || data.status === "true") &&
        data.success === "1"
      ) {
        toast.success(data.message || "Branch deleted successfully.");
        // remove from current state without refetch
        setBranches((prev) =>
          prev.filter((b) => String(b.id) !== String(id))
        );
      } else {
        toast.error(data.message || "Failed to delete branch.");
      }
    } catch (err) {
      console.error("Error deleting branch:", err);
      toast.error("Something went wrong while deleting branch.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header style={{ backgroundColor: "#fff", borderBottom: "none" }}>
              <Row className="align-items-center">
                <Col>
                  <Card.Title
                    style={{
                      marginTop: "2rem",
                      fontWeight: "700",
                    }}
                  >
                    Branch
                  </Card.Title>
                </Col>

                {/* Search (frontend) */}
                <Col className="d-flex justify-content-end align-items-center gap-2">
                  <div className="position-relative">
                    <Form.Control
                      type="text"
                      placeholder="Search branch..."
                      value={branchSearch}
                      onChange={(e) => {
                        setBranchSearch(e.target.value);
                        setCurrentPage(1); // ⭐ Reset to first page on search
                      }}
                      style={{ width: "20vw", paddingRight: "35px" }}
                    />
                    <FaSearch
                      className="position-absolute"
                      style={{
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#999",
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              {/* Add Branch */}
              <Form onSubmit={handleAddBranch} className="mb-3 d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Enter new branch name"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                />
                <Button
                  type="submit"
                  className="btn btn-primary add-customer-btn"
                >
                  <FaPlus size={14} className="me-1" /> Add Branch
                </Button>
              </Form>

              {/* Branch List */}
              <div className="table-full-width table-responsive">
                {loading ? (
                  <p className="text-center">Loading branches...</p>
                ) : (
                  <>
                    <Table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Sr. No.</th>
                          <th>Branch Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentBranches.length > 0 ? (
                          currentBranches.map((branch, index) => (
                            <tr key={branch.id || index}>
                              {/* ⭐ Sr. No. with pagination offset */}
                              <td>{indexOfFirstItem + index + 1}</td>
                              <td>{branch.branch_name}</td>
                              <td>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteBranch(branch.id)}
                                  disabled={deletingId === branch.id}
                                >
                                  <FaTrash />
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center">
                              No branches found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>

                    {/* ⭐ Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center p-3">
                        <Pagination>
                          <Pagination.First
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                          />
                          <Pagination.Prev
                            onClick={() =>
                              handlePageChange(currentPage - 1)
                            }
                            disabled={currentPage === 1}
                          />
                          {Array.from({ length: totalPages }, (_, i) => (
                            <Pagination.Item
                              key={i + 1}
                              active={i + 1 === currentPage}
                              onClick={() => handlePageChange(i + 1)}
                            >
                              {i + 1}
                            </Pagination.Item>
                          ))}
                          <Pagination.Next
                            onClick={() =>
                              handlePageChange(currentPage + 1)
                            }
                            disabled={currentPage === totalPages}
                          />
                          <Pagination.Last
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Branchmaster;
