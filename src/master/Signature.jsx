// src/master/Signature.jsx
import React, { useEffect, useMemo, useState } from "react";
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
  Modal,
  Spinner,
} from "react-bootstrap";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";

const API = "https://nlfs.in/erp/index.php/Api";

export default function Signaturemaster() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add State
  const [addName, setAddName] = useState("");
  const [addFile, setAddFile] = useState(null);
  const [addPreview, setAddPreview] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Edit State
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // ---------------- FETCH ----------------
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/list_signiture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.status && json.success === "1") {
        setList(json.data || []);
      } else {
        // If no data or status false, clear list but don't error loudly if just empty
        setList([]);
        if (json.message) toast.error(json.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching signatures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // ---------------- ADD ----------------
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addName.trim()) {
      toast.error("Signature name is required");
      return;
    }
    if (!addFile) {
      toast.error("Signature image is required");
      return;
    }

    setIsAdding(true);
    const fd = new FormData();
    fd.append("name", addName.trim());
    fd.append("sign_img", addFile);

    try {
      const res = await fetch(`${API}/add_signiture`, {
        method: "POST",
        // Content-Type header is automatically set by browser for FormData
        body: fd,
      });
      const json = await res.json();

      if (json.status) {
        toast.success("Signature added successfully");
        setAddName("");
        setAddFile(null);
        setAddPreview(null);
        fetchList();
      } else {
        toast.error(json.message || "Failed to add signature");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding signature");
    } finally {
      setIsAdding(false);
    }
  };

  // ---------------- UPDATE ----------------
  const openEdit = (row) => {
    setEditId(row.id);
    setEditName(row.name);
    setEditFile(null);
    setEditPreview(row.image_url || null);
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Signature name is required");
      return;
    }

    setIsUpdating(true);
    const fd = new FormData();
    fd.append("id", editId);
    fd.append("name", editName.trim());
    if (editFile) {
      fd.append("sign_img", editFile);
    }

    try {
      const res = await fetch(`${API}/update_signiture`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();

      if (json.status) {
        toast.success("Signature updated successfully");
        setShowEdit(false);
        fetchList();
      } else {
        toast.error(json.message || "Failed to update signature");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating signature");
    } finally {
      setIsUpdating(false);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this signature?"))
      return;

    try {
      const res = await fetch(`${API}/delete_signiture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();

      if (json.status) {
        toast.success("Signature deleted");
        setList((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error(json.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting signature");
    }
  };

  // ---------------- PAGINATION & SEARCH ----------------
  const filteredList = useMemo(() => {
    if (!searchTerm) return list;
    const lower = searchTerm.toLowerCase();
    return list.filter((item) => item.name?.toLowerCase().includes(lower));
  }, [list, searchTerm]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredList.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  // ---------------- RENDER ----------------
  return (
    <Container fluid className="p-3">
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <Row className="align-items-center">
            <Col>
              <h4 className="fw-bold mb-0">Signature Management</h4>
            </Col>
            <Col xs="auto">
              <Form.Control
                type="text"
                placeholder="Search signatures..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ maxWidth: "300px" }}
              />
            </Col>
          </Row>
        </Card.Header>

        <Card.Body>
          {/* Add Section */}
          <Card className="mb-4 bg-light border-0">
            <Card.Body>
              <h6 className="fw-bold mb-3">Add New Signature</h6>
              <Form onSubmit={handleAdd}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. Authorized Signatory"
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Signature Image</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files[0];
                          if (f) {
                            setAddFile(f);
                            setAddPreview(URL.createObjectURL(f));
                          }
                        }}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100"
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <Spinner size="sm" animation="border" />
                      ) : (
                        <>
                          <FaPlus className="me-2" /> Add
                        </>
                      )}
                    </Button>
                  </Col>
                  {addPreview && (
                    <Col md={2} className="text-center">
                      <div className="border p-1 bg-white rounded">
                        <Image
                          src={addPreview}
                          alt="Preview"
                          style={{
                            height: "40px",
                            maxWidth: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    </Col>
                  )}
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Table Section */}
          <div className="table-responsive">
            <Table bordered hover striped className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: "100px" }}>Sr No</th>
                  <th>Name</th>
                  <th style={{ width: "200px" }}>Signature Preview</th>
                  <th style={{ width: "150px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No signatures found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>{startIdx + index + 1}</td>
                      <td className="fw-semibold">{item.name}</td>
                      <td className="text-center">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt="Signature"
                            style={{
                              height: "50px",
                              maxWidth: "150px",
                              objectFit: "contain",
                            }}
                            thumbnail
                          />
                        ) : (
                          <span className="text-muted small">No Image</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => openEdit(item)}
                          title="Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Signature</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Change Image (Optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) {
                    setEditFile(f);
                    setEditPreview(URL.createObjectURL(f));
                  }
                }}
              />
              {editPreview && (
                <div className="mt-2 text-center p-2 border rounded bg-light">
                  <Image
                    src={editPreview}
                    alt="Edit Preview"
                    style={{
                      maxHeight: "80px",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowEdit(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Signature"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}


// above are anurga's implementation , elow are my changes


// src/master/Signature.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   Form,
//   Button,
//   Table,
//   Pagination,
//   Image,
//   Modal,
//   Spinner,
// } from "react-bootstrap";
// import { FaEdit } from "react-icons/fa";
// import toast from "react-hot-toast";

// const API = "https://nlfs.in/erp/index.php/Api";

// export default function Signaturemaster() {
//   const [list, setList] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Search & Pagination
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // Edit State
//   const [showEdit, setShowEdit] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [editName, setEditName] = useState("");
//   const [editFile, setEditFile] = useState(null);
//   const [editPreview, setEditPreview] = useState(null);
//   const [isUpdating, setIsUpdating] = useState(false);

//   // ---------------- FETCH ----------------
//   const fetchList = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API}/list_signiture`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({}),
//       });
//       const json = await res.json();
//       if (json.status && json.success === "1") {
//         setList(json.data || []);
//       } else {
//         setList([]);
//         if (json.message) toast.error(json.message);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Network error while fetching signatures");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchList();
//   }, []);

//   // ---------------- UPDATE ----------------
//   const openEdit = (row) => {
//     setEditId(row.id);
//     setEditName(row.name);
//     setEditFile(null);
//     setEditPreview(row.image_url || null);
//     setShowEdit(true);
//   };

//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!editName.trim()) {
//       toast.error("Signature name is required");
//       return;
//     }

//     setIsUpdating(true);
//     const fd = new FormData();
//     fd.append("id", editId);
//     fd.append("name", editName.trim());
//     if (editFile) {
//       fd.append("sign_img", editFile);
//     }

//     try {
//       const res = await fetch(`${API}/update_signiture`, {
//         method: "POST",
//         body: fd,
//       });
//       const json = await res.json();

//       if (json.status) {
//         toast.success("Signature updated successfully");
//         setShowEdit(false);
//         fetchList();
//       } else {
//         toast.error(json.message || "Failed to update signature");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error updating signature");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   // ---------------- PAGINATION & SEARCH ----------------
//   const filteredList = useMemo(() => {
//     if (!searchTerm) return list;
//     const lower = searchTerm.toLowerCase();
//     return list.filter((item) => item.name?.toLowerCase().includes(lower));
//   }, [list, searchTerm]);

//   const totalPages = Math.ceil(filteredList.length / itemsPerPage);
//   const startIdx = (currentPage - 1) * itemsPerPage;
//   const currentItems = filteredList.slice(startIdx, startIdx + itemsPerPage);

//   const handlePageChange = (p) => {
//     if (p >= 1 && p <= totalPages) setCurrentPage(p);
//   };

//   // ---------------- RENDER ----------------
//   return (
//     <Container fluid className="p-3">
//       <Card className="shadow-sm">
//         <Card.Header className="bg-white">
//           <Row className="align-items-center">
//             <Col>
//               <h4 className="fw-bold mb-0">Signature Management</h4>
//             </Col>
//             <Col xs="auto">
//               <Form.Control
//                 type="text"
//                 placeholder="Search signatures..."
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 style={{ maxWidth: "300px" }}
//               />
//             </Col>
//           </Row>
//         </Card.Header>

//         <Card.Body>
//           {/* Table Section */}
//           <div className="table-responsive">
//             <Table bordered hover striped className="align-middle">
//               <thead className="bg-light">
//                 <tr>
//                   <th style={{ width: "80px" }}>Sr no</th>
//                   <th>Name</th>
//                   <th style={{ width: "200px" }}>Signature Preview</th>
//                   <th style={{ width: "150px" }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loading ? (
//                   <tr>
//                     <td colSpan="4" className="text-center py-4">
//                       <Spinner animation="border" variant="primary" />
//                     </td>
//                   </tr>
//                 ) : currentItems.length === 0 ? (
//                   <tr>
//                     <td colSpan="4" className="text-center py-4 text-muted">
//                       No signatures found.
//                     </td>
//                   </tr>
//                 ) : (
//                   currentItems.map((item, index) => (
//                     <tr key={item.id}>
//                       <td>{startIdx + index + 1}</td>
//                       <td>{item.name}</td>
//                       <td className="text-center">
//                         {item.image_url ? (
//                           <Image
//                             src={item.image_url}
//                             alt="Signature"
//                             style={{
//                               height: "50px",
//                               maxWidth: "150px",
//                               objectFit: "contain",
//                             }}
//                             thumbnail
//                           />
//                         ) : (
//                           <span className="text-muted small">No Image</span>
//                         )}
//                       </td>
//                       <td>
//                         <Button
//                           variant="outline-primary"
//                           size="sm"
//                           onClick={() => openEdit(item)}
//                           title="Edit"
//                         >
//                           <FaEdit />
//                         </Button>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </Table>
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="d-flex justify-content-center mt-3">
//               <Pagination>
//                 <Pagination.Prev
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                 />
//                 {[...Array(totalPages)].map((_, i) => (
//                   <Pagination.Item
//                     key={i + 1}
//                     active={i + 1 === currentPage}
//                     onClick={() => handlePageChange(i + 1)}
//                   >
//                     {i + 1}
//                   </Pagination.Item>
//                 ))}
//                 <Pagination.Next
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                 />
//               </Pagination>
//             </div>
//           )}
//         </Card.Body>
//       </Card>

//       {/* Edit Modal */}
//       <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Edit Signature</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form onSubmit={handleUpdate}>
//             <Form.Group className="mb-3">
//               <Form.Label>Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={editName}
//                 onChange={(e) => setEditName(e.target.value)}
//                 required
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>Change Image (Optional)</Form.Label>
//               <Form.Control
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => {
//                   const f = e.target.files[0];
//                   if (f) {
//                     setEditFile(f);
//                     setEditPreview(URL.createObjectURL(f));
//                   }
//                 }}
//               />
//               {editPreview && (
//                 <div className="mt-2 text-center p-2 border rounded bg-light">
//                   <Image
//                     src={editPreview}
//                     alt="Edit Preview"
//                     style={{
//                       maxHeight: "80px",
//                       maxWidth: "100%",
//                       objectFit: "contain",
//                     }}
//                   />
//                 </div>
//               )}
//             </Form.Group>

//             <div className="d-flex justify-content-end gap-2">
//               <Button
//                 variant="secondary"
//                 onClick={() => setShowEdit(false)}
//                 disabled={isUpdating}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" variant="primary" disabled={isUpdating}>
//                 {isUpdating ? "Updating..." : "Update Signature"}
//               </Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </Container>
//   );
// }