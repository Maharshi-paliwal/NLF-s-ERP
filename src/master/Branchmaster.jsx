// src/Branchmaster.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Pagination,
  Image,
} from "react-bootstrap";
import { FaPlus, FaSearch, FaTrash, FaUpload } from "react-icons/fa";
import toast from "react-hot-toast";

const ERP_API_BASE = "https://nlfs.in/erp/index.php/Erp";
const ERP_DELETE_BASE = "https://nlfs.in/erp/index.php/Api";

const Branchmaster = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [branchSearch, setBranchSearch] = useState("");
  const [branchName, setBranchName] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [gstNo, setGstNo] = useState("");
const [address, setAddress] = useState("");

  const fileInputRefs = useRef({});

  // ---------------- FETCH ----------------
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ERP_API_BASE}/branch_list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.status && data.success === "1") {
        setBranches(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch branches");
      }
    } catch {
      toast.error("Error loading branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // ---------------- ADD (FORMDATA EXACT MATCH) ----------------
 const handleAddBranch = async (e) => {
  e.preventDefault();

  if (!branchName.trim()) {
    toast.error("Branch name is required");
    return;
  }

  const fd = new FormData();
  fd.append("branch_name", branchName.trim());

  // ✅ NEW FIELDS
  fd.append("gst_no", gstNo.trim());
  fd.append("address", address.trim());

  if (selectedFile) {
    fd.append("header_image", selectedFile);
  }

  try {
    const res = await fetch(`${ERP_API_BASE}/add_branch`, {
      method: "POST",
      body: fd,
    });

    const data = await res.json();

    if (!data.status) {
      toast.error(data.message || "Failed to add branch");
      return;
    }

    toast.success(data.message || "Branch added successfully");

    // reset form
    setBranchName("");
    setGstNo("");
    setAddress("");
    setSelectedFile(null);
    setPreview(null);

    await fetchBranches();
    setCurrentPage(1);
  } catch {
    toast.error("Something went wrong while adding branch");
  }
};



  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this branch?")) return;

    try {
      const res = await fetch(`${ERP_DELETE_BASE}/delete_branch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (data.status && data.success === "1") {
        toast.success("Branch deleted");
        setBranches((prev) => prev.filter((b) => b.id !== id));
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch {
      toast.error("Delete error");
    }
  };

  // ---------------- FILE HANDLER ----------------
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ---------------- FILTER + PAGINATION ----------------
  const filtered = useMemo(() => {
    if (!branchSearch) return branches;
    return branches.filter((b) =>
      b.branch_name?.toLowerCase().includes(branchSearch.toLowerCase())
    );
  }, [branchSearch, branches]);

  const start = (currentPage - 1) * itemsPerPage;
  const current = filtered.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // ---------------- RENDER ----------------
  return (
    <Container fluid>
      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col><h4 className="fw-bold mt-3">Branch</h4></Col>
            <Col className="text-end">
              <Form.Control
                placeholder="Search branch..."
                value={branchSearch}
                onChange={(e) => {
                  setBranchSearch(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: 300, display: "inline-block" }}
              />
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* ADD FORM */}
         <Form onSubmit={handleAddBranch} className="mb-4">
  <Row className="g-2 align-items-center">
    <Col md={3}>
      <Form.Control
        placeholder="Branch name"
        value={branchName}
        onChange={(e) => setBranchName(e.target.value)}
      />
    </Col>

    <Col md={2}>
      <Form.Control
        placeholder="GST No"
        value={gstNo}
        onChange={(e) => setGstNo(e.target.value)}
      />
    </Col>

    <Col md={3}>
      <Form.Control
        placeholder="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
    </Col>

    <Col md={2}>
      <Form.Control type="file" accept="image/*" onChange={onFileChange} />
    </Col>

    <Col md={1}>
      <Button type="submit">
        <FaPlus /> Add
      </Button>
    </Col>

    {preview && (
      <Col md={1}>
        <img
          src={preview}
          alt="preview"
          style={{ width: 80, height: 40, objectFit: "cover" }}
        />
      </Col>
    )}
  </Row>
</Form>


          {/* TABLE */}
          <Table striped hover>
           <thead>
  <tr>
    <th>Sr no</th>
    <th>Branch</th>
    <th>GST No</th>
    <th>Address</th>
    <th>Header Image</th>
    <th>Action</th>
  </tr>
</thead>

            <tbody>
  {current.map((b, i) => (
    <tr key={b.id}>
      <td>{start + i + 1}</td>
      <td>{b.branch_name}</td>
      <td>{b.gst_no || "—"}</td>
      <td style={{ maxWidth: 200 }}>
        {b.address || "—"}
      </td>
      <td>
        {b.header_image ? (
          <Image
            src={b.header_image}
            thumbnail
            style={{ width: 120, height: 60, objectFit: "cover" }}
          />
        ) : "—"}
      </td>
      <td>
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleDelete(b.id)}
        >
          <FaTrash />
        </Button>
      </td>
    </tr>
  ))}
</tbody>

          </Table>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Branchmaster;
