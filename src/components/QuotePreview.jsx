import React, { useState, useEffect } from "react";

// Helper function to check approval values (kept for display logic if needed)
const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const formatDescriptionForPreview = (desc) => {
  if (!desc) return "-";
  return desc
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const resolveHeaderImage = (branchName) => {
  const localBranchHeaders = {
    Kolkata: "/extra/Kolkata.jpeg",
    Delhi: "/extra/Delhi.jpeg",
    Indore: "/extra/Indore.jpeg",
    Nagpur: "/extra/Nagpur.jpeg",
    Mumbai: "/extra/Mumbai.jpeg",
  };
  return localBranchHeaders[branchName] || localBranchHeaders["Mumbai"];
};

const resolveProductImage = (img) => {
  if (!img) return null;
  if (typeof img !== "string") return null;
  if (img.startsWith("data:")) return img;
  if (/^https?:\/\//i.test(img)) return img;
  return `https://nlfs.in/erp/${img.replace(/^\/+/, "")}`;
};

const calculateTotals = (items) => {
  if (!items || items.length === 0) {
    return { basicAmount: 0, gst: 0, grandTotal: 0 };
  }
  const basicAmount = items.reduce((sum, item) => {
    const itemTotal = parseFloat(item.amt || 0);
    return sum + itemTotal;
  }, 0);
  const gst = basicAmount * 0.18;
  const grandTotal = basicAmount + gst;
  return { basicAmount, gst, grandTotal };
};

const renderTermsForPreview = (terms, rateApprovalSuccess, signatureImage) => {
  let termsHtml = terms || "<div>No terms specified</div>";
  let termsText = termsHtml
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<li>/gi, "\n• ")
    .replace(/<\/li>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&bull;/gi, "•");

  const termsLinesRaw = termsText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const beforeLine = [];
  const afterLine = [];
  let termIndex = 1;
  let hopeSentenceFound = false;

  termsLinesRaw.forEach((line) => {
    const isRed = /MS\/Aluminium|MS Aluminium|MS\/Aluminium substructure/i.test(line);
    const isHopeSentence = /Hope you will find our offer most competitive and in order/i.test(line);
    const isNLFSentence = /For NLF Solutions Pvt Ltd/i.test(line);

    if (isNLFSentence) return;

    let displayText = line.replace(/^\d+[\.\)]\s*/, "");
    if (displayText.startsWith("•")) {
      displayText = displayText.substring(1).trim();
    }

    if (isHopeSentence) {
      displayText = displayText.replace(/^•\s*/, '').replace(/^\d+\.\s*/, '');
      afterLine.push(
        <div
          key="hope-line"
          style={{
            fontWeight: "bold",
            margin: "10px 0 8px 0",
            fontSize: "10.5px",
            lineHeight: "1.6",
          }}
        >
          {displayText}
        </div>
      );
      hopeSentenceFound = true;
      return;
    } else {
      displayText = `${termIndex}. ${displayText}`;
      termIndex++;
      beforeLine.push(
        <div
          key={line}
          style={{
            marginBottom: 4,
            color: isRed ? "red" : "black",
            fontWeight: isRed ? "bold" : "normal",
          }}
        >
          {displayText}
        </div>
      );
    }
  });

  if (!hopeSentenceFound) {
    afterLine.push(
      <div
        key="hope-line-fallback"
        style={{
          marginTop: "10px",
          fontSize: "10.5px",
          fontWeight: "bold",
          lineHeight: "1.6",
        }}
      >
        Hope you will find our offer most competitive and in order.
      </div>
    );
  }

  if (rateApprovalSuccess && signatureImage) {
    afterLine.push(
      <div
        key="signature-block-container"
        style={{
          width: "100%",
          borderTop: "1px solid black",
          borderBottom: "1px solid black",
          marginTop: "5px",
          marginBottom: "5px",
          padding: "3px 0",
        }}
      >
        <img
          src={signatureImage}
          alt="Authorized Signature"
          style={{ height: "35px", width: "auto", marginBottom: "2px" }}
        />
        <div style={{ fontWeight: "bold", fontSize: "10.5px", lineHeight: "1.2" }}>
          For NLF Solutions Pvt Ltd
        </div>
      </div>
    );
  }

  return { beforeLine, afterLine };
};

const QuotePreview = ({ show, onHide, quotationData, quoteId }) => {
  const [fetchedData, setFetchedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [kindAttention, setKindAttention] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [visible, setVisible] = useState(!!show);
  const [closing, setClosing] = useState(false);

  const FADE_MS = 300;

  useEffect(() => {
    if (show) {
      setVisible(true);
      setClosing(false);
    } else {
      if (visible && !closing) {
        setClosing(true);
        const t = setTimeout(() => {
          setVisible(false);
          setClosing(false);
          if (typeof onHide === "function") onHide();
        }, FADE_MS);
        return () => clearTimeout(t);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const closeWithFade = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      if (typeof onHide === "function") onHide();
    }, FADE_MS);
  };

  useEffect(() => {
    if (show && quoteId) {
      const fetchQuotationData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            "https://nlfs.in/erp/index.php/Nlf_Erp/get_quotation_by_id",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ quote_id: String(quoteId) }),
            }
          );
          const data = await response.json();
          const isSuccess = data.status === true || data.status === "true";
          if (isSuccess && data.data) {
            setFetchedData(data.data);
            if (data.data.sign_img && data.data.sign_img.startsWith("data:")) {
              setSignatureImage(data.data.sign_img);
            }
          }
        } catch (error) {
          console.error("Error fetching quotation data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchQuotationData();
    }
  }, [show, quoteId]);

  const activeQuotationData = fetchedData || quotationData;

  useEffect(() => {
    if (activeQuotationData) {
      setKindAttention(activeQuotationData.kind_attention || "");
      const defaultSubject = `Quotation for ${activeQuotationData?.items?.[0]?.product || "Products"}`;
      setSubjectLine(activeQuotationData.subject || defaultSubject);
    } else {
      setKindAttention("");
      setSubjectLine("");
    }
  }, [activeQuotationData]);

  const rateApprovalSuccess = activeQuotationData
    ? isApprovedValue(activeQuotationData.rate_approval)
    : false;

  const totals = calculateTotals(activeQuotationData?.items);

  if (!visible) return null;
  if (!activeQuotationData && !isLoading) return null;

  const officeBranch =
    activeQuotationData?.branch ||
    activeQuotationData?.officeBranch ||
    "Mumbai";
  const headerImagePath = resolveHeaderImage(officeBranch);

  const { beforeLine, afterLine } = renderTermsForPreview(
    activeQuotationData?.terms,
    rateApprovalSuccess,
    signatureImage
  );

  const defaultSubject = `Quotation for ${
    activeQuotationData?.items?.[0]?.product || "Products"
  }`;

  const th = {
    border: "1px solid #000",
    padding: "6px",
    fontWeight: "bold",
  };
  const td = { border: "1px solid #000", padding: "6px" };
  const blueLeft = {
    border: "1px solid #000",
    padding: "4px 6px",
    background: "#007bff",
    color: "white",
    width: "70%",
    fontSize: "10px",
  };
  const blueRight = {
    border: "1px solid #000",
    padding: "4px 6px",
    background: "#007bff",
    color: "white",
    textAlign: "right",
    fontSize: "10px",
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 1040,
          opacity: closing ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease`,
          display: "block",
        }}
        onClick={closeWithFade}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: closing
            ? "translate(-50%, -50%) scale(0.99)"
            : "translate(-50%, -50%) scale(1)",
          backgroundColor: "white",
          borderRadius: "6px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          zIndex: 1050,
          width: "92%",
          maxWidth: "900px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          opacity: closing ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
        }}
      >
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: 600,
            }}
          >
            Quotation Preview -{" "}
            {activeQuotationData?.quote_no ||
              activeQuotationData?.quote_id ||
              "Loading..."}
          </h5>
          <button
            onClick={closeWithFade}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.4rem",
              cursor: "pointer",
              padding: "0",
              lineHeight: "1",
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            padding: "0",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "28px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #ed3131",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              />
              <p style={{ marginTop: "12px" }}>Loading quotation data...</p>
            </div>
          ) : !activeQuotationData ? (
            <div style={{ textAlign: "center", padding: "28px" }}>
              <p>No quotation data available.</p>
            </div>
          ) : (
            <div
              style={{
                padding: "15px",
                backgroundColor: "white",
                fontFamily: "Arial, sans-serif",
                fontSize: "10.5px",
                width: "210mm",
                margin: "0 auto",
                border: "1px solid #ddd",
              }}
            >
              {/* HEADER IMAGE */}
              <div
                style={{
                  width: "100%",
                  border: "1px solid #000",
                  overflow: "hidden",
                }}
              >
                {headerImagePath ? (
                  <img
                    src={headerImagePath}
                    alt={`Header for ${officeBranch}`}
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                ) : (
                  <div
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontSize: "12px",
                      color: "#777",
                    }}
                  >
                    No header image for selected branch
                  </div>
                )}
              </div>

              {/* TITLE */}
              <h3
                style={{
                  textAlign: "center",
                  margin: "0",
                  fontWeight: "bold",
                }}
              >
                QUOTATIONsssss
              </h3>

              {/* Quote No / Date */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <strong>
                    Quote No:{" "}
                    {activeQuotationData?.quote_no || activeQuotationData?.quote_id}
                  </strong>
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {formatDateDDMMYYYY(activeQuotationData?.date)}
                </div>
              </div>

              {/* CLIENT DETAILS */}
              <div className="quote-header">
                <div>
                  <strong>To,</strong>
                </div>
                <div>{activeQuotationData?.name || "-"}</div>
                <div>{activeQuotationData?.city || "-"}</div>
                {activeQuotationData?.project && (
                  <div>
                    <strong>Project:</strong> {activeQuotationData.project}
                  </div>
                )}
                {kindAttention && kindAttention.trim() && (
                  <div className="mt-1">
                    <strong>Kind Attention:</strong> {kindAttention.trim()}
                  </div>
                )}
                <div className="mt-1">
                  <strong>Subject:</strong>{" "}
                  {subjectLine && subjectLine.trim()
                    ? subjectLine.trim()
                    : defaultSubject}
                </div>
              </div>

              {/* DEAR SIR TEXT */}
              <p style={{ marginBottom: "15px", marginTop: "25px" }}>
                <strong>Dear Sir,</strong>
                <br />
                <strong>
                  As per our discussion, we are pleased to quote our most
                  competitive rates as follows:
                </strong>
              </p>

              {/* ITEMS TABLE */}
              {activeQuotationData?.items && activeQuotationData.items.length > 0 && (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      <th style={{ ...th, verticalAlign: "top" }}>S.No</th>
                      <th style={th}>Description</th>
                      <th style={th}>Unit</th>
                      <th style={{ ...th, verticalAlign: "top" }}>Qty</th>
                      <th style={{ ...th, verticalAlign: "top" }}>Rate</th>
                      <th style={{ ...th, verticalAlign: "top" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeQuotationData.items.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <tr>
                          <td style={{ ...td, verticalAlign: "top" }}>{idx + 1}</td>
                          <td
                            style={{
                              ...td,
                              position: "relative",
                              paddingRight: "20px",
                              verticalAlign: "middle",
                              overflow: "visible",
                            }}
                          >
                            {(item.sub_product || item.subProduct) && (
                              <>
                                <strong>{item.sub_product || item.subProduct}</strong>
                                <br />
                              </>
                            )}
                            {formatDescriptionForPreview(item.desc)}
                            {(() => {
                              const specImage =
                                item.spec_image ||
                                item.Spec_Image ||
                                item.SPEC_IMAGE ||
                                item.spec_img ||
                                item.image ||
                                item.Item_Image ||
                                item.product_image ||
                                item.img;
                              return specImage ? (
                                <img
                                  src={resolveProductImage(specImage)}
                                  alt="Spec"
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    right: "-125px",
                                    width: "100px",
                                    height: "auto",
                                    objectFit: "contain",
                                    zIndex: 10,
                                    pointerEvents: "none",
                                  }}
                                />
                              ) : null;
                            })()}
                          </td>
                          <td style={{ ...td, verticalAlign: "top" }}>{item.unit || "-"}</td>
                          <td style={{ ...td, verticalAlign: "top" }}>{item.qty || "-"}</td>
                          <td style={{ ...td, verticalAlign: "top" }}>
                            {parseFloat(item.rate || 0).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td style={{ ...td, verticalAlign: "top" }}>
                            {parseFloat(item.amt || 0).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                        {(() => {
                          const instQty = parseFloat(item.inst_qty || 0);
                          const instRate = parseFloat(item.inst_rate || 0);
                          const instAmt = parseFloat(item.inst_amt || 0);
                          if (instQty <= 0 || instRate <= 0 || instAmt <= 0) {
                            return null;
                          }
                          return (
                            <tr>
                              <td
                                style={{
                                  ...td,
                                  textAlign: "center",
                                  fontWeight: "bold",
                                }}
                              >
                                *
                              </td>
                              <td style={td}>installation</td>
                              <td style={td}>{item.inst_unit || "-"}</td>
                              <td style={{ ...td, verticalAlign: "top" }}>{instQty}</td>
                              <td style={{ ...td, verticalAlign: "top" }}>
                                {instRate.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td style={{ ...td, verticalAlign: "top" }}>
                                {instAmt.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          );
                        })()}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}

              {/* AMOUNT BLUE BOX */}
              <div style={{ float: "right", width: "45%" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={blueLeft}>Basic Amount</td>
                      <td style={blueRight}>
                        Rs{" "}
                        {totals.basicAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td style={blueLeft}>GST @ 18%</td>
                      <td style={blueRight}>
                        Rs{" "}
                        {totals.gst.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td style={blueLeft}>
                        <b>Grand Total</b>
                      </td>
                      <td style={blueRight}>
                        <b>
                          Rs{" "}
                          {totals.grandTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ clear: "both" }}>
                <h6>Commercial Terms:</h6>
                <div
                  className="nlf-terms-preview"
                  style={{
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                    fontSize: "10.5px",
                  }}
                >
                  {beforeLine}
                  {afterLine}
                </div>
              </div>

              {/* FOOTER IMAGE */}
              <div
                style={{
                  marginTop: "10px",
                  width: "100%",
                  borderTop: "2px solid #000",
                }}
              >
                <img
                  src="/extra/Footer.jpeg"
                  alt="Footer"
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            </div>
          )}
        </div>
        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          <button
            onClick={closeWithFade}
            style={{
              padding: "8px 14px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .nlf-terms-preview {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          line-height: 1.45;
          color: #111;
        }
        .nlf-terms-preview div { margin-bottom:6px; }
        .nlf-terms-preview strong { font-weight: 700; }
      `}</style>
    </>
  );
};

export default QuotePreview;