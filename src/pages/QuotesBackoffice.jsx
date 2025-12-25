

// // src/pages/QuotesBackoffice.jsx
// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   Container,
//   Row,
//   Col,
//   Button,
//   Form,
//   Pagination,
//   Modal,
// } from "react-bootstrap";
// import { FaDownload } from "react-icons/fa";
// import PDFPreview from "../components/PDFpreview.jsx";

// const formatQuoteNumber = (quoteNo) => {
//   return quoteNo && quoteNo.trim() !== "" ? quoteNo : "-";
// };

// const isRateApproved = (val) => {
//   if (!val) return false;
//   const s = String(val).trim().toLowerCase();
//   return ["yes", "approved", "true", "1"].includes(s);
// };

// const QuotesBackoffice = () => {
//   const [quotes, setQuotes] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [pendingAction, setPendingAction] = useState(null);
//   const [showPDFPreview, setShowPDFPreview] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);

//   const itemsPerPage = 10;

//   useEffect(() => {
//     fetchQuotationList();
//   }, []);

//   const fetchQuotationList = async () => {
//     try {
//       const res = await fetch("https://nlfs.in/erp/index.php/Nlf_Erp/list_quotation  ");
//       const data = await res.json();

//       if (data.status === true || data.status === "true") {
//         const cleanedData = (data.data || []).filter(q => q.quote_id && q.name);
//         const formatted = cleanedData.map(q => ({
//           ...q,
//           formattedQuoteNo: formatQuoteNumber(q.quote_no)
//         }));
//         setQuotes(formatted);
//       } else {
//         setQuotes([]);
//       }
//     } catch (error) {
//       console.log("FETCH ERROR:", error);
//       setQuotes([]);
//     }
//   };

//   const handleShowModal = (action) => {
//     setPendingAction(action);
//     setShowConfirmModal(true);
//   };

//   const handleConfirmAction = () => {
//     pendingAction?.execute();
//     setShowConfirmModal(false);
//     setPendingAction(null);
//   };

//   const handleCancelAction = () => {
//     setShowConfirmModal(false);
//     setPendingAction(null);
//   };

//   const handleShowPDFPreview = (item) => {
//     setSelectedItem(item);
//     setShowPDFPreview(true);
//   };

//   const handleClosePDFPreview = () => {
//     setShowPDFPreview(false);
//     setSelectedItem(null);
//   };

//   // ---------------- RATE APPROVAL ----------------
//   const handleApproveRate = (quote_id) => {
//     const action = {
//       message: "Are you sure you want to approve this Rate?",
//       execute: async () => {
//         try {
//           const res = await fetch(
//             "https://nlfs.in/erp/index.php/Nlf_Erp/update_rate_approval  ",
//             {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 quote_id,
//                 rate_approval: "yes",
//               }),
//             }
//           );

//           const result = await res.json();
//           if (result.status === true || result.status === "true") {
//             setQuotes(prev =>
//               prev.map(q =>
//                 q.quote_id === quote_id ? { ...q, rate_approval: "Yes" } : q
//               )
//             );
//             alert("Rate approved successfully!");
//           } else {
//             alert("Failed to approve rate.");
//           }
//         } catch (err) {
//           alert("Error approving rate: " + err.message);
//         }
//       },
//     };
//     handleShowModal(action);
//   };

//   const filteredQuotes = quotes
//     .filter(q => isRateApproved(q.rate_approval))
//     .filter(q => {
//       const s = searchTerm.toLowerCase();
//       return (
//         (q.quote_id || "").toLowerCase().includes(s) ||
//         (q.name || "").toLowerCase().includes(s) ||
//         (q.date || "").toLowerCase().includes(s) ||
//         (q.formattedQuoteNo || "").toLowerCase().includes(s)
//       );
//     });

//   const indexOfLast = currentPage * itemsPerPage;
//   const indexOfFirst = indexOfLast - itemsPerPage;
//   const currentQuotes = filteredQuotes.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);

//   const paginate = (num) => setCurrentPage(num);

//   return (
//     <Container fluid>
//       <Row>
//         <Col md="12">
//           <Card className="strpied-tabled-with-hover">
//             <Card.Header
//               style={{
//                 backgroundColor: "#fff",
//                 marginBottom: "2rem",
//                 borderBottom: "none",
//               }}
//             >
//               <Row className="align-items-center">
//                 <Col>
//                   <Card.Title style={{ marginTop: "2rem", fontWeight: "700" }}>
//                     Quotes Back Office
//                   </Card.Title>
//                 </Col>
//                 <Col className="d-flex justify-content-end align-items-center">
//                   <Form.Control
//                     type="text"
//                     placeholder="Search…"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="custom-searchbar-input nav-search"
//                     style={{ width: "20vw" }}
//                   />
//                 </Col>
//               </Row>
//             </Card.Header>

//             <Card.Body>
//               <QuoteApprovalTable
//                 quotes={currentQuotes}
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 paginate={paginate}
//                 onShowPDFPreview={handleShowPDFPreview}
//               />
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <Modal show={showConfirmModal} onHide={handleCancelAction} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {pendingAction?.isError ? "Error" : "Confirmation"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body className="text-center">
//           <p>{pendingAction?.message}</p>
//         </Modal.Body>
//         <Modal.Footer>
//           {pendingAction?.isError ? (
//             <Button variant="primary" onClick={handleCancelAction}>OK</Button>
//           ) : (
//             <>
//               <Button variant="secondary" onClick={handleCancelAction}>Cancel</Button>
//               <Button variant="danger" onClick={handleConfirmAction}>Yes, Proceed</Button>
//             </>
//           )}
//         </Modal.Footer>
//       </Modal>

//       <PDFPreview
//         show={showPDFPreview}
//         onHide={handleClosePDFPreview}
//         quotationData={selectedItem}
//       />
//     </Container>
//   );
// };

// const QuoteApprovalTable = ({
//   quotes,
//   currentPage,
//   totalPages,
//   paginate,
//   onShowPDFPreview,
// }) => (
//   <>
//     <div className="table-responsive">
//       <table className="table table-striped table-hover">
//         <thead>
//           <tr>
//             <th>Sr. No.</th>
//             <th>Quotation No</th>
//             <th>Client Name</th>
//             <th>Date</th>
//             <th>Amount (₹)</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {quotes.length > 0 ? (
//             quotes.map((item, index) => (
//               <tr key={item.quote_id}>
//                 <td>{(currentPage - 1) * 10 + index + 1}</td>
//                 <td>{item.formattedQuoteNo}</td>
//                 <td>{item.name}</td>
//                 <td>{item.date}</td>
//                 <td>₹ {parseFloat(item.total || 0).toLocaleString("en-IN")}</td>
//                 <td>
//                   <div className="d-flex align-items-center gap-2">
//                     <Button
//                       variant="outline-secondary"
//                       size="sm"
//                       onClick={() => onShowPDFPreview(item)}
//                     >
//                       <FaDownload style={{ color: "red" }} />
//                     </Button>
//                   </div>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="6" className="text-center p-4">
//                 No quotations found.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>

//     {totalPages > 1 && (
//       <div className="d-flex justify-content-center p-3">
//         <Pagination>
//           <Pagination.First
//             onClick={() => paginate(1)}
//             disabled={currentPage === 1}
//           />
//           <Pagination.Prev
//             onClick={() => paginate(currentPage - 1)}
//             disabled={currentPage === 1}
//           />
//           {Array.from({ length: totalPages }, (_, i) => (
//             <Pagination.Item
//               key={i + 1}
//               active={currentPage === i + 1}
//               onClick={() => paginate(i + 1)}
//             >
//               {i + 1}
//             </Pagination.Item>
//           ))}
//           <Pagination.Next
//             onClick={() => paginate(currentPage + 1)}
//             disabled={currentPage === totalPages}
//           />
//           <Pagination.Last
//             onClick={() => paginate(totalPages)}
//             disabled={currentPage === totalPages}
//           />
//         </Pagination>
//       </div>
//     )}
//   </>
// );

// export default QuotesBackoffice;

// src/pages/QuotesBackoffice.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Form,
  Pagination,
  Modal,
} from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import PDFPreview from "../components/PDFpreview.jsx";

const formatQuoteNumber = (quoteNo) => {
  return quoteNo && quoteNo.trim() !== "" ? quoteNo : "-";
};

const isRateApproved = (val) => {
  if (val === undefined || val === null) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

const QuotesBackoffice = () => {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuotationList();
  }, []);

  const fetchQuotationList = async () => {
  try {
    const res = await fetch(
      "https://nlfs.in/erp/index.php/Nlf_Erp/list_quotation"
    );
    const data = await res.json();

    if (data.status === true || data.status === "true") {
      let cleanedData = (data.data || []).filter(
        (q) => q.quote_id && q.name
      );

      // ---- SORT LATEST QUOTE FIRST ----
      cleanedData.sort((a, b) => {
        const idA = parseInt(a.quote_id);
        const idB = parseInt(b.quote_id);
        return idB - idA; // descending (latest first)
      });

      const formatted = cleanedData.map((q) => ({
        ...q,
        formattedQuoteNo: formatQuoteNumber(q.quote_no),
      }));

      setQuotes(formatted);
    } else {
      setQuotes([]);
    }
  } catch (error) {
    console.log("FETCH ERROR:", error);
    setQuotes([]);
  }
};


  const handleShowModal = (action) => {
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    pendingAction?.execute();
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleShowPDFPreview = (item) => {
    setSelectedItem(item);
    setShowPDFPreview(true);
  };

  const handleClosePDFPreview = () => {
    setShowPDFPreview(false);
    setSelectedItem(null);
  };

  // ---------------- RATE APPROVAL ----------------
  const handleApproveRate = (quote_id) => {
    const action = {
      message: "Are you sure you want to approve this Rate?",
      execute: async () => {
        try {
          const res = await fetch(
            "https://nlfs.in/erp/index.php/Nlf_Erp/update_rate_approval",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                quote_id,
                rate_approval: "yes",
              }),
            }
          );

          const result = await res.json();
          if (result.status === true || result.status === "true") {
            setQuotes((prev) =>
              prev.map((q) =>
                q.quote_id === quote_id ? { ...q, rate_approval: "Yes" } : q
              )
            );
            alert("Rate approved successfully!");
          } else {
            alert("Failed to approve rate.");
          }
        } catch (err) {
          alert("Error approving rate: " + err.message);
        }
      },
    };
    handleShowModal(action);
  };

  // ---- filter: only show quotes that are BOTH rate_approval AND admin_approval ----
  const filteredQuotes = quotes
    .filter(
      (q) => isRateApproved(q.rate_approval) && isRateApproved(q.admin_approval)
    )
    .filter((q) => {
      const s = searchTerm.toLowerCase();
      return (
        (q.quote_id || "").toLowerCase().includes(s) ||
        (q.name || "").toLowerCase().includes(s) ||
        (q.date || "").toLowerCase().includes(s) ||
        (q.formattedQuoteNo || "").toLowerCase().includes(s)
      );
    });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentQuotes = filteredQuotes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);

  const paginate = (num) => setCurrentPage(num);

  return (
    <Container fluid>
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header
              style={{
                backgroundColor: "#fff",
                marginBottom: "2rem",
                borderBottom: "none",
              }}
            >
              <Row className="align-items-center">
                <Col>
                  <Card.Title style={{ marginTop: "2rem", fontWeight: "700" }}>
                    Quotes Back Office
                  </Card.Title>
                </Col>
                <Col className="d-flex justify-content-end align-items-center">
                  <Form.Control
                    type="text"
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-searchbar-input nav-search"
                    style={{ width: "20vw" }}
                  />
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              <QuoteApprovalTable
                quotes={currentQuotes}
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
                onShowPDFPreview={handleShowPDFPreview}
                itemsPerPage={itemsPerPage}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showConfirmModal} onHide={handleCancelAction} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {pendingAction?.isError ? "Error" : "Confirmation"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>{pendingAction?.message}</p>
        </Modal.Body>
        <Modal.Footer>
          {pendingAction?.isError ? (
            <Button variant="primary" onClick={handleCancelAction}>
              OK
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handleCancelAction}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmAction}>
                Yes, Proceed
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <PDFPreview
        show={showPDFPreview}
        onHide={handleClosePDFPreview}
        quotationData={selectedItem}
      />
    </Container>
  );
};

const QuoteApprovalTable = ({
  quotes,
  currentPage,
  totalPages,
  paginate,
  onShowPDFPreview,
  itemsPerPage,
}) => (
  <>
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Quotation No</th>
            <th>Client Name</th>
            <th>Date</th>
            <th>Amount (₹)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotes.length > 0 ? (
            quotes.map((item, index) => (
              <tr key={item.quote_id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{item.formattedQuoteNo}</td>
                <td>{item.name}</td>
                <td>{item.date}</td>
                <td>₹ {parseFloat(item.total || 0).toLocaleString("en-IN")}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => onShowPDFPreview(item)}
                    >
                      <FaDownload style={{ color: "red" }} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center p-4">
                finding quotations.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {totalPages > 1 && (
      <div className="d-flex justify-content-center p-3">
        <Pagination>
          <Pagination.First
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={currentPage === i + 1}
              onClick={() => paginate(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    )}
  </>
);

export default QuotesBackoffice;
