// import React, { useState, useRef, useEffect, useMemo } from "react";

// // Helper to strip HTML tags for PDF rendering
// const stripHtml = (html) => {
//   if (!html) return "";
//   return html
//     .replace(/<br\s*\/?>/gi, "\n")
//     .replace(/<\/p>/gi, "\n")
//     .replace(/<li>/gi, "\n• ")
//     .replace(/<\/li>/gi, "")
//     .replace(/<[^>]*>/g, "")
//     .replace(/&nbsp;/gi, " ")
//     .replace(/&bull;/gi, "•")
//     .replace(/&amp;/gi, "&")
//     .trim();
// };

// // Helper function to check approval values
// const isApprovedValue = (val) => {
//   if (!val) return false;
//   const s = String(val).trim().toLowerCase();
//   return ["yes", "approved", "true", "1"].includes(s);
// };

// // Helper to load image as base64 (PDF-safe)
// const getBase64ImageFromURL = (url) => {
//   return new Promise((resolve) => {
//     const img = new Image();
//     img.setAttribute("crossOrigin", "anonymous");
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(img, 0, 0);
//       try {
//         resolve(canvas.toDataURL("image/jpeg"));
//       } catch {
//         resolve(null);
//       }
//     };
//     img.onerror = () => resolve(null);
//     img.src = url;
//   });
// };

// const PDFWorkorder = ({
//   show,
//   onHide,
//   workOrderData,
//   workOrderId,
//   onAccountApproved,
//   enableAccountApproval = true,
// }) => {
//   const [fetchedData, setFetchedData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isGenerating, setIsGenerating] = useState(false);

//   const [accountApproved, setAccountApproved] = useState(false);
//   const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
//   const [accountApprovalSuccess, setAccountApprovalSuccess] = useState(false);
//   const [signatureImage, setSignatureImage] = useState(null);
//   const [signatureLoading, setSignatureLoading] = useState(false);

//   const pdfContentRef = useRef();

//   const FADE_MS = 300;
//   const [visible, setVisible] = useState(!!show);
//   const [closing, setClosing] = useState(false);

//   const activeWorkOrderData = fetchedData || workOrderData;

//   // Items (safe)
//   const safeItems = useMemo(() => {
//     if (!activeWorkOrderData?.items) return [];
//     if (Array.isArray(activeWorkOrderData.items)) return activeWorkOrderData.items;
//     try {
//       const parsed = JSON.parse(activeWorkOrderData.items);
//       return Array.isArray(parsed) ? parsed : [];
//     } catch {
//       return [];
//     }
//   }, [activeWorkOrderData]);

//   // --- CALCULATE TOTALS FOR BLUE BOX ---
//   const calculatedTotals = useMemo(() => {
//   // 1️⃣ Calculate BASIC AMOUNT from items
//   const basicAmount = safeItems.reduce((sum, item) => {
//     const qty = parseFloat(item.quantity || item.qty || 0);
//     const rate = parseFloat(item.unit_price || item.rate || 0);
//     return sum + qty * rate;
//   }, 0);

//   // 2️⃣ GST @18%
//   const gst = basicAmount * 0.18;

//   // 3️⃣ GRAND TOTAL
//   const grandTotal = basicAmount + gst;

//   return {
//     basicAmount,
//     gst,
//     grandTotal,
//   };
// }, [safeItems]);


//   // Fade handling
//   useEffect(() => {
//     if (show) {
//       setVisible(true);
//       setClosing(false);
//     } else if (visible && !closing) {
//       setClosing(true);
//       setTimeout(() => {
//         setVisible(false);
//         setClosing(false);
//       }, FADE_MS);
//     }
//   }, [show]);

//   const closeWithFade = () => {
//     if (closing) return;
//     setClosing(true);
//     setTimeout(() => {
//       setVisible(false);
//       setClosing(false);
//       onHide?.();
//     }, FADE_MS);
//   };

//   // Fetch work order
//   useEffect(() => {
//     if (!show || !workOrderId) return;

//     const fetchWO = async () => {
//       setIsLoading(true);
//       try {
//         const res = await fetch(
//           "https://nlfs.in/erp/index.php/Api/get_work_order_by_id",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ work_id: String(workOrderId) }),
//           }
//         );
//         console.log("work order id", workOrderId);
//         const data = await res.json();
//         if (data.status && data.data) {
//           const w = data.data;
//           w.terms_and_condition = w.terms_and_condition || w.terms_conditions || w.terms || "";
//           w.payment_details = w.payment_details || w.payment_term || "";
//           setFetchedData(w);
//         }
//       } catch (e) {
//         console.error("WO fetch failed", e);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchWO();
//   }, [show, workOrderId]);

//   // Sync approval state
//   useEffect(() => {
//     if (activeWorkOrderData) {
//       setAccountApproved(isApprovedValue(activeWorkOrderData.acc_approval));
//       setAccountApprovalSuccess(isApprovedValue(activeWorkOrderData.acc_approval));
//     }
//   }, [activeWorkOrderData]);

//   // Fetch signature
//   useEffect(() => {
//     const fetchSignature = async () => {
//       if (!accountApproved) return;

//       try {
//         setSignatureLoading(true);
//         const res = await fetch(
//           "https://nlfs.in/erp/index.php/Api/list_signiture",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               id: "5",
//               name: "admin",
//             }),
//           }
//         );
//         const data = await res.json();
//         if (data.status && (data.success === "1" || data.status === true)) {
//           const signatureData = Array.isArray(data.data)
//             ? data.data.find((s) => String(s.id) === "5")
//             : data.data;
//           const img =
//             signatureData?.image_url ||
//             signatureData?.sign_image ||
//             signatureData?.signature ||
//             signatureData?.image;
//           if (img) {
//             if (img.startsWith("data:") || img.startsWith("http")) {
//               setSignatureImage(img);
//             } else {
//               setSignatureImage(`https://nlfs.in/erp/${img.replace(/^\/+/, "")}`);
//             }
//           }
//         }
//       } catch (err) {
//         console.error("Failed to fetch signature", err);
//       } finally {
//         setSignatureLoading(false);
//       }
//     };
//     fetchSignature();
//   }, [accountApproved]);

//   const officeBranch = activeWorkOrderData?.branch_name || null;
//   const headerImagePath = activeWorkOrderData?.header_img || null;

//   const wait = (ms) => new Promise((res) => setTimeout(res, ms));

//   const handleAccountApproval = async () => {
//     if (!activeWorkOrderData) return;
//     const workOrderIdForApi =
//       activeWorkOrderData.work_id ||
//       activeWorkOrderData.workOrderId ||
//       workOrderId;
//     if (!workOrderIdForApi) {
//       alert("Missing work order ID, cannot approve account.");
//       return;
//     }
//     setAccountApproved(true);
//     setIsUpdatingAccount(true);
//     await wait(900);
//     try {
//       const response = await fetch(
//         "https://nlfs.in/erp/index.php/Nlf_Erp/update_account_approval",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             work_id: String(workOrderIdForApi),
//             acc_approval: "Approved",
//           }),
//         }
//       );
//       const result = await response.json();
//       const success = result.status === true || result.status === "true";
//       if (success) {
//         if (fetchedData) {
//           setFetchedData((prev) =>
//             prev ? { ...prev, acc_approval: "Approved" } : prev
//           );
//         }
//         if (typeof onAccountApproved === "function") {
//           onAccountApproved(String(workOrderIdForApi));
//         }
//         setAccountApprovalSuccess(true);
//         setIsUpdatingAccount(false);
//         setTimeout(() => {
//           closeWithFade();
//         }, 400);
//       } else {
//         setAccountApproved(false);
//         alert(result.message || "Failed to approve account.");
//       }
//     } catch (err) {
//       console.error("Error approving account:", err);
//       setAccountApproved(false);
//       alert("Error approving account: " + (err.message || "Unknown error"));
//     } finally {
//       setIsUpdatingAccount(false);
//     }
//   };

//   const onAccountCheckboxClick = (e) => {
//     e.preventDefault();
//     if (accountApproved || isUpdatingAccount || accountApprovalSuccess) return;
//     const confirmed = window.confirm(
//       "Proceed with account approval?\n\nOnce approved, this action cannot be reverted."
//     );
//     if (confirmed) {
//       handleAccountApproval();
//     }
//   };

//   const generatePDF = async () => {
//     if (!activeWorkOrderData) return;
//     setIsGenerating(true);
//     try {
//       const jsPDF = (await import("jspdf")).default;
//       const autoTable = (await import("jspdf-autotable")).default;

//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageWidth = 210;
//       const pageHeight = 297;
//       const margin = 15;

//       let headerForPdf = headerImagePath;
//       if (headerForPdf?.startsWith("https://nlfs.in/erp")) {
//         headerForPdf = headerForPdf.replace(
//           "https://nlfs.in/erp",
//           "/erp-image-proxy"
//         );
//       }

//       const [headerImg, footerImg, signatureImg] = await Promise.all([
//         headerForPdf ? getBase64ImageFromURL(headerForPdf) : null,
//         getBase64ImageFromURL("/extra/Footer.jpeg"),
//         getBase64ImageFromURL("/extra/sign.jpg"),
//       ]);

//       const headerHeight = 30;
//       const footerHeight = 20;

//       const drawBorderedSection = (x, y, width, height, title, data) => {
//         pdf.setDrawColor(0, 0, 0);
//         pdf.rect(x, y, width, height);
//         pdf.setFillColor(230, 240, 250);
//         pdf.rect(x, y, width, 8, "F");
//         pdf.setFontSize(12);
//         pdf.setFont(undefined, "bold");
//         pdf.text(title, x + 5, y + 5);
//         pdf.setFont(undefined, "normal");
//         pdf.setFontSize(10);
//         let currentY = y + 13;
//         data.forEach((item) => {
//           pdf.text(item.label, x + 5, currentY);
//           pdf.text(item.value, x + width - 5, currentY, { align: "right" });
//           currentY += 5;
//         });
//         return currentY + 5;
//       };

//       const drawHeader = () => {
//         if (!headerImg) return;
//         try {
//           pdf.addImage(
//             headerImg,
//             "JPEG",
//             margin,
//             margin,
//             pageWidth - 2 * margin,
//             headerHeight
//           );
//         } catch (e) {
//           console.error("Header image load failed", e);
//         }
//       };

//       const drawFooter = () => {
//         if (!footerImg) return;
//         try {
//           const footerY = pageHeight - footerHeight - margin;
//           pdf.addImage(
//             footerImg,
//             "JPEG",
//             margin,
//             footerY,
//             pageWidth - 2 * margin,
//             footerHeight
//           );
//         } catch (e) {
//           console.error("Error loading footer:", e);
//         }
//       };

//       const drawSignature = () => {
//         if (!accountApprovalSuccess || !signatureImg) return;
//         try {
//           const signatureY = pageHeight - footerHeight - margin - 45;
//           const signatureWidth = 50;
//           const signatureHeight = 15;
//           pdf.addImage(
//             signatureImg,
//             "JPEG",
//             pageWidth - margin - signatureWidth,
//             signatureY,
//             signatureWidth,
//             signatureHeight
//           );
//         } catch (e) {
//           console.error("Error loading signature:", e);
//         }
//       };

//       const addPageNumbers = () => {
//         const pageCount = pdf.internal.getNumberOfPages();
//         for (let i = 1; i <= pageCount; i++) {
//           pdf.setPage(i);
//           const pageY = pageHeight - margin - 5;
//           pdf.setFontSize(10);
//           pdf.setFont(undefined, "normal");
//           pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageY, {
//             align: "center",
//           });
//         }
//       };

//       let yPosition = margin + headerHeight + 8;

//       drawHeader();

//       pdf.setFontSize(18);
//       pdf.setFont(undefined, "bold");
//       pdf.text("WORK ORDER", pageWidth / 2, yPosition, { align: "center" });
//       yPosition += 15;

//       const workOrderDetails = [
//         { label: "Work Order No:", value: activeWorkOrderData?.wo_no || activeWorkOrderData?.work_id || "-" },
      
//         { label: "Quotation No:", value: activeWorkOrderData?.quto_id || "-" },
//         { label: "PO No:", value: activeWorkOrderData?.po_no || "-" },
//         { label: "Expected Delivery Date:", value: activeWorkOrderData?.exp_delivery_date || "-" },
//       ];

//       yPosition = drawBorderedSection(
//         margin,
//         yPosition,
//         pageWidth - 2 * margin,
//         40,
//         "Work Order Details",
//         workOrderDetails
//       );

//       const designDetails = [
//         { label: "General Design:", value: activeWorkOrderData?.general_design || "-" },
//         { label: "Color Scheme:", value: activeWorkOrderData?.color_scheme || "-" },
//       ];

//       yPosition = drawBorderedSection(
//         margin,
//         yPosition,
//         pageWidth - 2 * margin,
//         25,
//         "Design Details",
//         designDetails
//       );

//       if (activeWorkOrderData?.terms_and_condition) {
//         const termsText = stripHtml(activeWorkOrderData.terms_and_condition);
//         const termsLines = pdf.splitTextToSize(termsText, pageWidth - 2 * margin - 10);
//         const requiredHeight = 18 + termsLines.length * 5;

//         if (yPosition + requiredHeight > pageHeight - footerHeight - margin) {
//           pdf.addPage();
//           drawHeader();
//           yPosition = margin + headerHeight + 8;
//         }

//         pdf.setDrawColor(0, 0, 0);
//         pdf.rect(margin, yPosition, pageWidth - 2 * margin, requiredHeight);
//         pdf.setFillColor(230, 240, 250);
//         pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
//         pdf.setFont(undefined, "bold");
//         pdf.text("Terms and Conditions", margin + 5, yPosition + 5);
//         pdf.setFont(undefined, "normal");
//         let currentY = yPosition + 13;
//         termsLines.forEach((line) => {
//           pdf.text(line, margin + 5, currentY);
//           currentY += 5;
//         });
//         yPosition += requiredHeight + 10;
//       }

//       if (safeItems.length > 0) {
//         yPosition += 10;

//         const tableBody = safeItems.map((item, i) => [
//           i + 1,
//           item.description || item.desc || "-",
//           item.unit || "-",
//           item.quantity || item.qty || "-",
//           item.rate || item.unit_price || "0",
//         ]);

//         autoTable(pdf, {
//           startY: yPosition,
//           head: [["S.No", "Description", "Unit", "Qty", "Rate"]],
//           body: tableBody,
//           theme: "grid",
//           tableWidth: pageWidth - 2 * margin,
//           columnStyles: {
//             0: { halign: "center", cellWidth: 12 },
//             1: { cellWidth: "auto" },
//             2: { halign: "center", cellWidth: 18 },
//             3: { halign: "right", cellWidth: 18 },
//             4: { halign: "right", cellWidth: 28 },
//           },
//           styles: {
//             fontSize: 8,
//             cellPadding: 1.5,
//             overflow: "linebreak",
//             lineWidth: 0.4,
//             lineColor: [0, 0, 0],
//           },
//           headStyles: {
//             fillColor: [0, 86, 179],
//             textColor: 255,
//             fontStyle: "bold",
//             fontSize: 9,
//             lineWidth: 0.4,
//           },
//           didDrawPage: () => {
//             drawHeader();
//             drawFooter();
//           },
//           margin: {
//             top: margin + headerHeight + 4,
//             bottom: footerHeight + 8,
//             left: margin,
//             right: margin,
//           },
//         });

//         yPosition = pdf.lastAutoTable.finalY + 10;
//       }

//       let paymentRequiredHeight = 35;
//       let paymentLines = [];
//       const hasRichPayment = !!activeWorkOrderData?.payment_details;

//       if (hasRichPayment) {
//         const pText = stripHtml(activeWorkOrderData.payment_details);
//         paymentLines = pdf.splitTextToSize(pText, pageWidth - 2 * margin - 10);
//         paymentRequiredHeight = 18 + paymentLines.length * 5;
//       }

//       if (yPosition + paymentRequiredHeight > pageHeight - footerHeight - margin) {
//         pdf.addPage();
//         drawHeader();
//         yPosition = margin + headerHeight + 8;
//       }

//       if (hasRichPayment) {
//         pdf.setDrawColor(0, 0, 0);
//         pdf.rect(margin, yPosition, pageWidth - 2 * margin, paymentRequiredHeight);
//         pdf.setFillColor(230, 240, 250);
//         pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
//         pdf.setFont(undefined, "bold");
//         pdf.text("Payment Details", margin + 5, yPosition + 5);
//         pdf.setFont(undefined, "normal");
//         let currentY = yPosition + 13;
//         paymentLines.forEach((line) => {
//           pdf.text(line, margin + 5, currentY);
//           currentY += 5;
//         });
//         yPosition += paymentRequiredHeight + 10;
//       } else {
//         const paymentDetails = [
//           { label: "Payment Term:", value: activeWorkOrderData?.payment_term || "-" },
//           { label: "Advance Amount:", value: "₹" + (activeWorkOrderData?.advance_amt || "0") },
//         ];
//         yPosition = drawBorderedSection(
//           margin,
//           yPosition,
//           pageWidth - 2 * margin,
//           paymentRequiredHeight,
//           "Payment Details",
//           paymentDetails
//         );
//       }

//       if (activeWorkOrderData?.warranty) {
//         const wText = stripHtml(activeWorkOrderData.warranty);
//         const wLines = pdf.splitTextToSize(wText, pageWidth - 2 * margin - 10);
//         const requiredHeight = 18 + wLines.length * 5;

//         if (yPosition + requiredHeight > pageHeight - footerHeight - margin) {
//           pdf.addPage();
//           drawHeader();
//           yPosition = margin + headerHeight + 8;
//         }

//         pdf.setDrawColor(0, 0, 0);
//         pdf.rect(margin, yPosition, pageWidth - 2 * margin, requiredHeight);
//         pdf.setFillColor(230, 240, 250);
//         pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
//         pdf.setFont(undefined, "bold");
//         pdf.text("Warranty", margin + 5, yPosition + 5);
//         pdf.setFont(undefined, "normal");
//         let currentY = yPosition + 13;
//         wLines.forEach((line) => {
//           pdf.text(line, margin + 5, currentY);
//           currentY += 5;
//         });
//         yPosition += requiredHeight + 10;
//       }

//       if (activeWorkOrderData?.special_req) {
//         const specialReqLines = pdf.splitTextToSize(
//           activeWorkOrderData.special_req,
//           pageWidth - 2 * margin - 10
//         );
//         const requiredHeight = 18 + specialReqLines.length * 5;

//         if (yPosition + requiredHeight > pageHeight - footerHeight - margin) {
//           pdf.addPage();
//           drawHeader();
//           yPosition = margin + headerHeight + 8;
//         }

//         pdf.setDrawColor(0, 0, 0);
//         pdf.rect(margin, yPosition, pageWidth - 2 * margin, requiredHeight);
//         pdf.setFillColor(230, 240, 250);
//         pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
//         pdf.setFontSize(12);
//         pdf.setFont(undefined, "bold");
//         pdf.text("Special Requirements", margin + 5, yPosition + 5);
//         pdf.setFont(undefined, "normal");
//         pdf.setFontSize(10);
//         let currentY = yPosition + 13;
//         specialReqLines.forEach((line) => {
//           pdf.text(line, margin + 5, currentY);
//           currentY += 5;
//         });
//         yPosition += requiredHeight + 10;
//       }

//       const resources = [
//         { label: "Scrap Applicable:", value: activeWorkOrderData?.scrap_applicable || "-" },
//         { label: "Machinery Required:", value: activeWorkOrderData?.machinery_required || "-" },
//         { label: "Quality Check Lighting:", value: activeWorkOrderData?.quality_check_lighting || "-" },
//         { label: "Estimated Power Consumption:", value: activeWorkOrderData?.est_power_cons || "-" },
//         { label: "Workshop Lighting Equipment:", value: activeWorkOrderData?.workshop_lighting_eq || "-" },
//         { label: "Heavy Machinery Power (3-Phase):", value: activeWorkOrderData?.heavy_machinery_power3 || "-" },
//         { label: "Site Power Available:", value: activeWorkOrderData?.site_power_available || "-" },
//         { label: "Site Power Type:", value: activeWorkOrderData?.site_power_type || "-" },
//       ];

//       if (yPosition + 65 > pageHeight - footerHeight - margin) {
//         pdf.addPage();
//         drawHeader();
//         yPosition = margin + headerHeight + 8;
//       }

//       yPosition = drawBorderedSection(
//         margin,
//         yPosition,
//         pageWidth - 2 * margin,
//         55,
//         "Resources",
//         resources
//       );

//       if (activeWorkOrderData?.notes) {
//         const notesLines = pdf.splitTextToSize(
//           activeWorkOrderData.notes,
//           pageWidth - 2 * margin - 10
//         );
//         const requiredHeight = 18 + notesLines.length * 5;

//         if (yPosition + requiredHeight > pageHeight - footerHeight - margin) {
//           pdf.addPage();
//           drawHeader();
//           yPosition = margin + headerHeight + 8;
//         }

//         pdf.setDrawColor(0, 0, 0);
//         pdf.rect(margin, yPosition, pageWidth - 2 * margin, requiredHeight);
//         pdf.setFillColor(230, 240, 250);
//         pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
//         pdf.setFontSize(12);
//         pdf.setFont(undefined, "bold");
//         pdf.text("Notes", margin + 5, yPosition + 5);
//         pdf.setFont(undefined, "normal");
//         pdf.setFontSize(10);
//         let currentY = yPosition + 13;
//         notesLines.forEach((line) => {
//           pdf.text(line, margin + 5, currentY);
//           currentY += 5;
//         });
//         yPosition += requiredHeight + 10;
//       }

//       drawSignature();
//       drawFooter();
//       addPageNumbers();

//       const fileName = `WorkOrder_${activeWorkOrderData?.wo_no || activeWorkOrderData?.work_id || "Unknown"}.pdf`;
//       pdf.save(fileName);
//     } catch (e) {
//       console.error("PDF error", e);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   if (!visible) return null;
//   if (!activeWorkOrderData && !isLoading) return null;

//   const backdropStyle = {
//     position: "fixed",
//     inset: 0,
//     background: "rgba(0,0,0,0.5)",
//     zIndex: 1040,
//     opacity: closing ? 0 : 1,
//     transition: `opacity ${FADE_MS}ms ease`,
//   };

//   const modalStyle = {
//     position: "fixed",
//     top: "50%",
//     left: "50%",
//     transform: closing
//       ? "translate(-50%, -50%) scale(0.98)"
//       : "translate(-50%, -50%) scale(1)",
//     background: "#fff",
//     width: "90%",
//     maxWidth: "900px",
//     maxHeight: "90vh",
//     zIndex: 1050,
//     display: "flex",
//     flexDirection: "column",
//     borderRadius: 8,
//     opacity: closing ? 0 : 1,
//     transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
//   };

//   const sectionStyle = {
//     border: "1px solid #ddd",
//     borderRadius: "5px",
//     marginBottom: "15px",
//     overflow: "hidden",
//     boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
//   };

//   const sectionHeaderStyle = {
//     backgroundColor: "#f0f7ff",
//     padding: "8px 12px",
//     borderBottom: "1px solid #ddd",
//     fontWeight: "bold",
//     fontSize: "14px",
//     color: "#0056b3",
//   };

//   const sectionContentStyle = {
//     padding: "12px",
//     backgroundColor: "#fff",
//   };

//   const rowStyle = {
//     display: "flex",
//     justifyContent: "space-between",
//     marginBottom: "6px",
//     borderBottom: "1px dashed #eee",
//     paddingBottom: "6px",
//   };

//   const labelStyle = {
//     fontWeight: "bold",
//     color: "#333",
//   };

//   const valueStyle = {
//     color: "#555",
//     textAlign: "right",
//   };

//   // Styles for the Blue Box (Matching the image)
//   const th = {
//     border: "1px solid #000",
//     padding: "6px",
//     fontWeight: "bold",
//   };
//   const td = { border: "1px solid #000", padding: "6px" };
  
//   const blueLeft = {
//     border: "1px solid #000",
//     padding: "4px 6px",
//     background: "#007bff",
//     color: "white",
//     width: "70%",
//     fontSize: "10px",
//   };
  
//   const blueRight = {
//     border: "1px solid #000",
//     padding: "4px 6px",
//     background: "#007bff",
//     color: "white",
//     textAlign: "right",
//     fontSize: "10px",
//   };

//   const hasRemark =
//     !!stripHtml(activeWorkOrderData?.payment_details || "").trim() ||
//     !!String(activeWorkOrderData?.payment_term || "").trim();

//   return (
//     <>
//       <div style={backdropStyle} onClick={closeWithFade} />
//       <div style={modalStyle}>
//         <div
//           style={{
//             padding: "16px 24px",
//             borderBottom: "1px solid #dee2e6",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <h5 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
//             Work Order Preview -{" "}
//             {activeWorkOrderData?.wo_no ||
//               activeWorkOrderData?.work_id ||
//               "Loading..."}
//           </h5>
//           <button
//             onClick={closeWithFade}
//             style={{
//               background: "none",
//               border: "none",
//               fontSize: "1.5rem",
//               cursor: "pointer",
//               padding: "0",
//               lineHeight: "1",
//             }}
//           >
//             ×
//           </button>
//         </div>

//         <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
//           {isLoading ? (
//             <div style={{ textAlign: "center", padding: "48px" }}>
//               <div
//                 style={{
//                   width: "40px",
//                   height: "40px",
//                   border: "4px solid #f3f3f3",
//                   borderTop: "4px solid #ed3131",
//                   borderRadius: "50%",
//                   animation: "spin 1s linear infinite",
//                   margin: "0 auto",
//                 }}
//               />
//               <p style={{ marginTop: "16px" }}>Loading work order data...</p>
//             </div>
//           ) : !activeWorkOrderData ? (
//             <div style={{ textAlign: "center", padding: "48px" }}>
//               <p>No work order data available.</p>
//             </div>
//           ) : (
//             <>
//               <div
//                 ref={pdfContentRef}
//                 style={{
//                   padding: "20px",
//                   backgroundColor: "white",
//                   fontFamily: "Arial, sans-serif",
//                   fontSize: "11px",
//                   width: "210mm",
//                   margin: "0 auto",
//                   border: "1px solid #ddd",
//                   boxShadow: "0 0 10px rgba(0,0,0,0.1)",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "100%",
//                     border: "1px solid #000",
//                     overflow: "hidden",
//                     marginBottom: "15px",
//                   }}
//                 >
//                   {headerImagePath ? (
//                     <img
//                       src={headerImagePath}
//                       alt={`Header for ${officeBranch}`}
//                       style={{ width: "100%", display: "block" }}
//                     />
//                   ) : (
//                     <div
//                       style={{
//                         padding: "12px",
//                         textAlign: "center",
//                         fontSize: "12px",
//                         color: "#777",
//                       }}
//                     >
//                       No header image for selected branch
//                     </div>
//                   )}
//                 </div>

//                 <h3
//                   style={{
//                     textAlign: "center",
//                     margin: "15px 0",
//                     fontWeight: "bold",
//                     fontSize: "18px",
//                     color: "#0056b3",
//                     textTransform: "uppercase",
//                     letterSpacing: "1px",
//                   }}
//                 >
//                   Work Order
//                 </h3>

//                 <div style={sectionStyle}>
//                   <div style={sectionHeaderStyle}>Work Order Details</div>
//                   <div style={sectionContentStyle}>
//                     <div style={rowStyle}>
//                       <span style={labelStyle}>Work Order No:</span>
//                       <span style={valueStyle}>
//                         {activeWorkOrderData?.wo_no || activeWorkOrderData?.work_id}
//                       </span>
//                     </div>
                   
//                     <div style={rowStyle}>
//                       <span style={labelStyle}>Quotation No:</span>
//                       <span style={valueStyle}>{activeWorkOrderData?.quto_id || "-"}</span>
//                     </div>
//                     <div style={rowStyle}>
//                       <span style={labelStyle}>Expected Delivery Date:</span>
//                       <span style={valueStyle}>{activeWorkOrderData?.exp_delivery_date || "-"}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {safeItems.length > 0 && (
//                   <div style={{ marginBottom: "15px", border: "1px solid #ddd", borderRadius: "5px", overflow: "hidden" }}>
//                     <div style={sectionHeaderStyle}>Work Order Items</div>
//                     <div style={{ overflowX: "auto", padding: "0" }}>
//                       <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
//                        <thead>
//   <tr style={{ backgroundColor: "#007bff", color: "white", textAlign: "center" }}>
//     <th style={th}>S.No</th>
//     <th style={th}>Description</th>
//     <th style={th}>Unit</th>
//     <th style={th}>Qty</th>
//     <th style={th}>Rate</th>
//     <th style={th}>Amount</th>
//   </tr>
// </thead>

//                         <tbody>
//                           {safeItems.map((item, idx) => (
//                             <tr key={idx}>
//                              <td style={{ ...td, verticalAlign: "top" }}>{idx + 1}</td>
// <td style={{ ...td, verticalAlign: "top" }}>{item.description || item.desc || "-"}</td>
// <td style={{ ...td, verticalAlign: "top" }}>{item.unit || "-"}</td>
// <td style={{ ...td, verticalAlign: "top" }}>{item.quantity || item.qty || "-"}</td>
// <td style={{ ...td, verticalAlign: "top" }}>{item.rate || item.unit_price || "0"}</td>
// <td style={{ ...td, verticalAlign: "top", textAlign: "right" }}>
//   {(
//     (parseFloat(item.quantity || item.qty || 0) *
//      parseFloat(item.rate || item.unit_price || 0))
//   ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
// </td>

//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}

//                 {/* ========================================= */}
//                 {/* ✅ NEW: BLUE AMOUNT BOX (Basic + GST + Total) */}
//                 {/* ========================================= */}
//                 <div style={{ float: "right", width: "45%" }}>
//                   <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                     <tbody>
//                       <tr>
//                         <td style={blueLeft}>Basic Amount</td>
//                         <td style={blueRight}>
//                           Rs{" "}
//                           {calculatedTotals.basicAmount.toLocaleString("en-IN", {
//                             minimumFractionDigits: 2,
//                           })}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={blueLeft}>GST @ 18%</td>
//                         <td style={blueRight}>
//                           Rs{" "}
//                           {calculatedTotals.gst.toLocaleString("en-IN", {
//                             minimumFractionDigits: 2,
//                           })}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={blueLeft}>
//                           <b>Grand Total</b>
//                         </td>
//                         <td style={blueRight}>
//                           <b>
//                             Rs{" "}
//                             {calculatedTotals.grandTotal.toLocaleString("en-IN", {
//                               minimumFractionDigits: 2,
//                             })}
//                           </b>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//                 {/* Clear fix to prevent content overlap */}
//                 <div style={{ clear: "both" }}></div>
//                 {/* ========================================= */}
//                 {/* END BLUE AMOUNT BOX */}
//                 {/* ========================================= */}

//                 {activeWorkOrderData?.terms_and_condition && (
//                   <div style={sectionStyle}>
//                     <div style={sectionHeaderStyle}>Terms and Conditions</div>
//                     <div style={sectionContentStyle}>
//                       <div
//                         style={{ fontSize: "10px", lineHeight: "1.4" }}
//                         dangerouslySetInnerHTML={{ __html: activeWorkOrderData.terms_and_condition }}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {hasRemark && (
//                   <div style={sectionStyle}>
//                     <div style={sectionHeaderStyle}>Remark</div>
//                     <div style={sectionContentStyle}>
//                       {activeWorkOrderData?.payment_details &&
//                       stripHtml(activeWorkOrderData.payment_details).trim() ? (
//                         <div
//                           style={{ fontSize: "10px", lineHeight: "1.4" }}
//                           dangerouslySetInnerHTML={{
//                             __html: activeWorkOrderData.payment_details,
//                           }}
//                         />
//                       ) : (
//                         <div style={rowStyle}>
//                           <span style={valueStyle}>{activeWorkOrderData?.payment_term}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {activeWorkOrderData?.warranty && (
//                   <div style={sectionStyle}>
//                     <div style={sectionHeaderStyle}>Warranty</div>
//                     <div style={sectionContentStyle}>
//                       <div
//                         style={{ fontSize: "10px", lineHeight: "1.4" }}
//                         dangerouslySetInnerHTML={{ __html: activeWorkOrderData.warranty }}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {activeWorkOrderData?.special_req && (
//                   <div style={sectionStyle}>
//                     <div style={sectionHeaderStyle}>Special Requirements</div>
//                     <div style={sectionContentStyle}>
//                       <p style={{ margin: "0", lineHeight: "1.5" }}>{activeWorkOrderData.special_req}</p>
//                     </div>
//                   </div>
//                 )}

//                 {activeWorkOrderData?.notes && (
//                   <div style={sectionStyle}>
//                     <div style={sectionHeaderStyle}>Notes</div>
//                     <div style={sectionContentStyle}>
//                       <p style={{ margin: "0", lineHeight: "1.5" }}>{activeWorkOrderData.notes}</p>
//                     </div>
//                   </div>
//                 )}

//                 {accountApprovalSuccess && (
//                   <div style={{ textAlign: "left", marginTop: "20px" }}>
//                     <img src="/extra/sign.jpg" alt="Digital Signature" style={{ height: "40px", width: "auto" }} />
//                     <p style={{ fontSize: "10px", margin: "5px 0 0 0" }}>Authorized Signature</p>
//                     <p style={{ fontSize: "10px", margin: "5px 0 0 0" }}>For NLF Solutions Pvt Ltd</p>
//                   </div>
//                 )}

//                 <div
//                   style={{
//                     marginTop: "30px",
//                     width: "100%",
//                     borderTop: "2px solid #000",
//                     paddingTop: "10px",
//                   }}
//                 >
//                   <img src="/extra/Footer.jpeg" alt="Footer" style={{ width: "100%", height: "auto", display: "block" }} />
//                 </div>
//               </div>
//             </>
//           )}
//         </div>

//         <div
//           style={{
//             padding: "16px 24px",
//             borderTop: "1px solid #dee2e6",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <div>
//             {enableAccountApproval && (
//               <label
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   marginBottom: "8px",
//                   cursor: "pointer",
//                 }}
//               >
//                 <div className="custom-checkbox">
//                   <input
//                     type="checkbox"
//                     id="accountApprovalCheckbox"
//                     checked={accountApproved}
//                     disabled={isUpdatingAccount || accountApprovalSuccess}
//                     onClick={onAccountCheckboxClick}
//                     readOnly
//                   />
//                   <span></span>
//                 </div>
//                 {isUpdatingAccount
//                   ? "Approving account..."
//                   : accountApprovalSuccess
//                   ? "Account Approved"
//                   : "Approve Account"}
//               </label>
//             )}
//           </div>

//           <div style={{ display: "flex", gap: "8px" }}>
           
//             <button
//               onClick={closeWithFade}
//               style={{
//                 padding: "8px 16px",
//                 backgroundColor: "#6c757d",
//                 color: "white",
//                 border: "none",
//                 borderRadius: "4px",
//                 cursor: "pointer",
//               }}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }

//         .custom-checkbox {
//           position: relative;
//           display: inline-block;
//           width: 20px;
//           height: 20px;
//           margin-right: 8px;
//           background-color: #eee;
//           border: 1px solid #ccc;
//           border-radius: 4px;
//           cursor: pointer;
//           transition: all 0.2s ease;
//         }

//         .custom-checkbox span {
//           position: absolute;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           background-color: #fff;
//           border-radius: 4px;
//           transition: all 0.2s ease;
//         }

//         .custom-checkbox input[type="checkbox"] {
//           position: absolute;
//           opacity: 0;
//           width: 0;
//           height: 0;
//         }

//         .custom-checkbox input[type="checkbox"]:checked + span {
//           background-color: #28a745;
//           border-color: #28a745;
//         }

//         .custom-checkbox input[type="checkbox"]:checked + span::after {
//           content: '✓';
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//           color: white;
//           font-size: 14px;
//           font-weight: bold;
//         }

//         .custom-checkbox input[type="checkbox"]:disabled + span {
//           opacity: 0.6;
//           cursor: not-allowed;
//         }

//         .custom-checkbox input[type="checkbox"]:disabled:checked + span {
//           background-color: #6c757d;
//           border-color: #6c757d;
//         }

//         .custom-checkbox input[type="checkbox"]:disabled:checked + span::after {
//           color: white;
//         }
//       `}</style>
//     </>
//   );
// };

// export default PDFWorkorder;

import React, { useState, useRef, useEffect, useMemo } from "react";

// Helper to strip HTML tags for PDF rendering
const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<li>/gi, "\n• ")
    .replace(/<\/li>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&bull;/gi, "•")
    .replace(/&amp;/gi, "&")
    .trim();
};

// Helper function to check approval values
const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

// Helper to load image as base64 (PDF-safe)
const getBase64ImageFromURL = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        resolve(canvas.toDataURL("image/jpeg"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

const PDFWorkorder = ({
  show,
  onHide,
  workOrderData,
  workOrderId,
  onAccountApproved,
  enableAccountApproval = true,
}) => {
  const [fetchedData, setFetchedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [accountApproved, setAccountApproved] = useState(false);
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [accountApprovalSuccess, setAccountApprovalSuccess] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [signatureLoading, setSignatureLoading] = useState(false);

  const pdfContentRef = useRef();

  const FADE_MS = 300;
  const [visible, setVisible] = useState(!!show);
  const [closing, setClosing] = useState(false);

  const activeWorkOrderData = fetchedData || workOrderData;

  // Items (safe)
  const safeItems = useMemo(() => {
    if (!activeWorkOrderData?.items) return [];
    if (Array.isArray(activeWorkOrderData.items)) return activeWorkOrderData.items;
    try {
      const parsed = JSON.parse(activeWorkOrderData.items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [activeWorkOrderData]);

  // --- CALCULATE TOTALS FOR BLUE BOX ---
  const calculatedTotals = useMemo(() => {
  // 1️⃣ Calculate BASIC AMOUNT from items
  const basicAmount = safeItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity || item.qty || 0);
    const rate = parseFloat(item.unit_price || item.rate || 0);
    return sum + qty * rate;
  }, 0);

  // 2️⃣ GST @18%
  const gst = basicAmount * 0.18;

  // 3️⃣ GRAND TOTAL
  const grandTotal = basicAmount + gst;

  return {
    basicAmount,
    gst,
    grandTotal,
  };
}, [safeItems]);


  // Fade handling
  useEffect(() => {
    if (show) {
      setVisible(true);
      setClosing(false);
    } else if (visible && !closing) {
      setClosing(true);
      setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, FADE_MS);
    }
  }, [show]);

  const closeWithFade = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      onHide?.();
    }, FADE_MS);
  };

  // Fetch work order
  useEffect(() => {
    if (!show || !workOrderId) return;

    const fetchWO = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          "https://nlfs.in/erp/index.php/Api/get_work_order_by_id",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ work_id: String(workOrderId) }),
          }
        );
        console.log("work order id", workOrderId);
        const data = await res.json();
        if (data.status && data.data) {
          const w = data.data;
          w.terms_and_condition = w.terms_and_condition || w.terms_conditions || w.terms || "";
          w.payment_details = w.payment_details || w.payment_term || "";
          setFetchedData(w);
        }
      } catch (e) {
        console.error("WO fetch failed", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWO();
  }, [show, workOrderId]);

  // Sync approval state
  useEffect(() => {
    if (activeWorkOrderData) {
      setAccountApproved(isApprovedValue(activeWorkOrderData.acc_approval));
      setAccountApprovalSuccess(isApprovedValue(activeWorkOrderData.acc_approval));
    }
  }, [activeWorkOrderData]);

  // Fetch signature
  useEffect(() => {
    const fetchSignature = async () => {
      if (!accountApproved) return;

      try {
        setSignatureLoading(true);
        const res = await fetch(
          "https://nlfs.in/erp/index.php/Api/list_signiture",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: "5",
              name: "admin",
            }),
          }
        );
        const data = await res.json();
        if (data.status && (data.success === "1" || data.status === true)) {
          const signatureData = Array.isArray(data.data)
            ? data.data.find((s) => String(s.id) === "5")
            : data.data;
          const img =
            signatureData?.image_url ||
            signatureData?.sign_image ||
            signatureData?.signature ||
            signatureData?.image;
          if (img) {
            if (img.startsWith("data:") || img.startsWith("http")) {
              setSignatureImage(img);
            } else {
              setSignatureImage(`https://nlfs.in/erp/${img.replace(/^\/+/, "")}`);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch signature", err);
      } finally {
        setSignatureLoading(false);
      }
    };
    fetchSignature();
  }, [accountApproved]);

  const officeBranch = activeWorkOrderData?.branch_name || null;
  const headerImagePath = activeWorkOrderData?.header_img || null;

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  const handleAccountApproval = async () => {
    if (!activeWorkOrderData) return;
    const workOrderIdForApi =
      activeWorkOrderData.work_id ||
      activeWorkOrderData.workOrderId ||
      workOrderId;
    if (!workOrderIdForApi) {
      alert("Missing work order ID, cannot approve account.");
      return;
    }
    setAccountApproved(true);
    setIsUpdatingAccount(true);
    await wait(900);
    try {
      const response = await fetch(
        "https://nlfs.in/erp/index.php/Nlf_Erp/update_account_approval",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            work_id: String(workOrderIdForApi),
            acc_approval: "Approved",
          }),
        }
      );
      const result = await response.json();
      const success = result.status === true || result.status === "true";
      if (success) {
        if (fetchedData) {
          setFetchedData((prev) =>
            prev ? { ...prev, acc_approval: "Approved" } : prev
          );
        }
        if (typeof onAccountApproved === "function") {
          onAccountApproved(String(workOrderIdForApi));
        }
        setAccountApprovalSuccess(true);
        setIsUpdatingAccount(false);
        setTimeout(() => {
          closeWithFade();
        }, 400);
      } else {
        setAccountApproved(false);
        alert(result.message || "Failed to approve account.");
      }
    } catch (err) {
      console.error("Error approving account:", err);
      setAccountApproved(false);
      alert("Error approving account: " + (err.message || "Unknown error"));
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  const onAccountCheckboxClick = (e) => {
    e.preventDefault();
    if (accountApproved || isUpdatingAccount || accountApprovalSuccess) return;
    const confirmed = window.confirm(
      "Proceed with account approval?\n\nOnce approved, this action cannot be reverted."
    );
    if (confirmed) {
      handleAccountApproval();
    }
  };

  const generatePDF = async () => {
    if (!activeWorkOrderData) return;
    setIsGenerating(true);
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;

      let headerForPdf = headerImagePath;
      if (headerForPdf?.startsWith("https://nlfs.in/erp")) {
        headerForPdf = headerForPdf.replace(
          "https://nlfs.in/erp",
          "/erp-image-proxy"
        );
      }

      const [headerImg, footerImg, signatureImg] = await Promise.all([
        headerForPdf ? getBase64ImageFromURL(headerForPdf) : null,
        getBase64ImageFromURL("/extra/Footer.jpeg"),
        getBase64ImageFromURL("/extra/sign.jpg"),
      ]);

      const headerHeight = 30;
      const footerHeight = 20;

      const drawBorderedSection = (x, y, width, height, title, data) => {
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(x, y, width, height);
        pdf.setFillColor(230, 240, 250);
        pdf.rect(x, y, width, 8, "F");
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.text(title, x + 5, y + 5);
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(10);
        let currentY = y + 13;
        data.forEach((item) => {
          pdf.text(item.label, x + 5, currentY);
          pdf.text(item.value, x + width - 5, currentY, { align: "right" });
          currentY += 5;
        });
        return currentY + 5;
      };

      const drawHeader = () => {
        if (!headerImg) return;
        try {
          pdf.addImage(
            headerImg,
            "JPEG",
            margin,
            margin,
            pageWidth - 2 * margin,
            headerHeight
          );
        } catch (e) {
          console.error("Header image load failed", e);
        }
      };

      const drawFooter = () => {
        if (!footerImg) return;
        try {
          const footerY = pageHeight - footerHeight - margin;
          pdf.addImage(
            footerImg,
            "JPEG",
            margin,
            footerY,
            pageWidth - 2 * margin,
            footerHeight
          );
        } catch (e) {
          console.error("Error loading footer:", e);
        }
      };

      const drawSignature = () => {
        if (!accountApprovalSuccess || !signatureImg) return;
        try {
          const signatureY = pageHeight - footerHeight - margin - 45;
          const signatureWidth = 50;
          const signatureHeight = 15;
          pdf.addImage(
            signatureImg,
            "JPEG",
            pageWidth - margin - signatureWidth,
            signatureY,
            signatureWidth,
            signatureHeight
          );
        } catch (e) {
          console.error("Error loading signature:", e);
        }
      };

      const addPageNumbers = () => {
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          const pageY = pageHeight - margin - 5;
          pdf.setFontSize(10);
          pdf.setFont(undefined, "normal");
          pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageY, {
            align: "center",
          });
        }
      };

      let yPosition = margin + headerHeight + 8;

      drawHeader();

      pdf.setFontSize(18);
      pdf.setFont(undefined, "bold");
      pdf.text("WORK ORDER", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      const workOrderDetails = [
        { label: "Work Order No:", value: activeWorkOrderData?.wo_no || activeWorkOrderData?.work_id || "-" },
      
        { label: "Quotation No:", value: activeWorkOrderData?.quto_id || "-" },
        { label: "PO No:", value: activeWorkOrderData?.po_no || "-" },
        { label: "Expected Delivery Date:", value: activeWorkOrderData?.exp_delivery_date || "-" },
      ];

      yPosition = drawBorderedSection(
        margin,
        yPosition,
        pageWidth - 2 * margin,
        40,
        "Work Order Details",
        workOrderDetails
      );

      const designDetails = [
        { label: "General Design:", value: activeWorkOrderData?.general_design || "-" },
        { label: "Color Scheme:", value: activeWorkOrderData?.color_scheme || "-" },
      ];

      yPosition = drawBorderedSection(
        margin,
        yPosition,
        pageWidth - 2 * margin,
        25,
        "Design Details",
        designDetails
      );

      if (activeWorkOrderData?.terms_and_condition) {
        const termsText = stripHtml(activeWorkOrderData.terms_and_condition);
        const termsLines = pdf.splitTextToSize(termsText, pageWidth - 2 * margin - 10);
        const requiredHeight = 18 + termsLines.length * 5;

        if (yPosition + requiredHeight > pageHeight - footerHeight - margin) {
          pdf.addPage();
          drawHeader();
          yPosition = margin + headerHeight + 8;
        }

        pdf.setDrawColor(0, 0, 0);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, requiredHeight);
        pdf.setFillColor(230, 240, 250);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
        pdf.setFont(undefined, "bold");
        pdf.text("Terms and Conditions", margin + 5, yPosition + 5);
        pdf.setFont(undefined, "normal");
        let currentY = yPosition + 13;
        termsLines.forEach((line) => {
          pdf.text(line, margin + 5, currentY);
          currentY += 5;
        });
        yPosition += requiredHeight + 10;
      }

      if (safeItems.length > 0) {
        yPosition += 10;

        const tableBody = safeItems.map((item, i) => [
          i + 1,
          item.description || item.desc || "-",
          item.unit || "-",
          item.quantity || item.qty || "-",
          item.rate || item.unit_price || "0",
        ]);

        autoTable(pdf, {
          startY: yPosition,
          head: [["S.No", "Description", "Unit", "Qty", "Rate"]],
          body: tableBody,
          theme: "grid",
          tableWidth: pageWidth - 2 * margin,
          columnStyles: {
            0: { halign: "center", cellWidth: 12 },
            1: { cellWidth: "auto" },
            2: { halign: "center", cellWidth: 18 },
            3: { halign: "right", cellWidth: 18 },
            4: { halign: "right", cellWidth: 28 },
          },
          styles: {
            fontSize: 8,
            cellPadding: 1.5,
            overflow: "linebreak",
            lineWidth: 0.4,
            lineColor: [0, 0, 0],
          },
          headStyles: {
            fillColor: [0, 86, 179],
            textColor: 255,
            fontStyle: "bold",
            fontSize: 9,
            lineWidth: 0.4,
          },
          didDrawPage: () => {
            drawHeader();
            drawFooter();
          },
          margin: {
            top: margin + headerHeight + 4,
            bottom: footerHeight + 8,
            left: margin,
            right: margin,
          },
        });

        yPosition = pdf.lastAutoTable.finalY + 10;
      }

      let paymentRequiredHeight = 35;
      let paymentLines = [];
      const hasRichPayment = !!activeWorkOrderData?.payment_details;

      if (hasRichPayment) {
        const pText = stripHtml(activeWorkOrderData.payment_details);
        paymentLines = pdf.splitTextToSize(pText, pageWidth - 2 * margin - 10);
        paymentRequiredHeight = 18 + paymentLines.length * 5;
      }

      if (yPosition + paymentRequiredHeight > pageHeight - footerHeight - margin) {
        pdf.addPage();
        drawHeader();
        yPosition = margin + headerHeight + 8;
      }

      if (hasRichPayment) {
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, paymentRequiredHeight);
        pdf.setFillColor(230, 240, 250);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
        pdf.setFont(undefined, "bold");
        pdf.text("Payment Details", margin + 5, yPosition + 5);
        pdf.setFont(undefined, "normal");
        let currentY = yPosition + 13;
        paymentLines.forEach((line) => {
          pdf.text(line, margin + 5, currentY);
          currentY += 5;
        });
        yPosition += paymentRequiredHeight + 10;
      } else {
        const paymentDetails = [
          { label: "Payment Term:", value: activeWorkOrderData?.payment_term || "-" },
          { label: "Advance Amount:", value: "₹" + (activeWorkOrderData?.advance_amt || "0") },
        ];
        yPosition = drawBorderedSection(
          margin,
          yPosition,
          pageWidth - 2 * margin,
          paymentRequiredHeight,
          "Payment Details",
          paymentDetails
        );
      }

      if (activeWorkOrderData?.warranty) {
        const wText = stripHtml(activeWorkOrderData.warranty);
        const wLines = pdf.splitTextToSize(wText, pageWidth - 2 * margin - 10);
        const requiredHeight = 18 + wLines.length * 5;

        if (yPosition + requiredHeight > pageHeight - footerHeight - margin) {
          pdf.addPage();
          drawHeader();
          yPosition = margin + headerHeight + 8;
        }

        pdf.setDrawColor(0, 0, 0);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, requiredHeight);
        pdf.setFillColor(230, 240, 250);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
        pdf.setFont(undefined, "bold");
        pdf.text("Warranty", margin + 5, yPosition + 5);
        pdf.setFont(undefined, "normal");
        let currentY = yPosition + 13;
        wLines.forEach((line) => {
          pdf.text(line, margin + 5, currentY);
          currentY += 5;
        });
        yPosition += requiredHeight + 10;
      }

      if (activeWorkOrderData?.special_req) {
        const specialReqLines = pdf.splitTextToSize(
          activeWorkOrderData.special_req,
          pageWidth - 2 * margin - 10
        );
        const requiredHeight = 18 + specialReqLines.length * 5;

        if (yPosition + requiredHeight > pageHeight - footerHeight - margin) {
          pdf.addPage();
          drawHeader();
          yPosition = margin + headerHeight + 8;
        }

        pdf.setDrawColor(0, 0, 0);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, requiredHeight);
        pdf.setFillColor(230, 240, 250);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.text("Special Requirements", margin + 5, yPosition + 5);
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(10);
        let currentY = yPosition + 13;
        specialReqLines.forEach((line) => {
          pdf.text(line, margin + 5, currentY);
          currentY += 5;
        });
        yPosition += requiredHeight + 10;
      }

      const resources = [
        { label: "Scrap Applicable:", value: activeWorkOrderData?.scrap_applicable || "-" },
        { label: "Machinery Required:", value: activeWorkOrderData?.machinery_required || "-" },
        { label: "Quality Check Lighting:", value: activeWorkOrderData?.quality_check_lighting || "-" },
        { label: "Estimated Power Consumption:", value: activeWorkOrderData?.est_power_cons || "-" },
        { label: "Workshop Lighting Equipment:", value: activeWorkOrderData?.workshop_lighting_eq || "-" },
        { label: "Heavy Machinery Power (3-Phase):", value: activeWorkOrderData?.heavy_machinery_power3 || "-" },
        { label: "Site Power Available:", value: activeWorkOrderData?.site_power_available || "-" },
        { label: "Site Power Type:", value: activeWorkOrderData?.site_power_type || "-" },
      ];

      if (yPosition + 65 > pageHeight - footerHeight - margin) {
        pdf.addPage();
        drawHeader();
        yPosition = margin + headerHeight + 8;
      }

      yPosition = drawBorderedSection(
        margin,
        yPosition,
        pageWidth - 2 * margin,
        55,
        "Resources",
        resources
      );

      if (activeWorkOrderData?.notes) {
        const notesLines = pdf.splitTextToSize(
          activeWorkOrderData.notes,
          pageWidth - 2 * margin - 10
        );
        const requiredHeight = 18 + notesLines.length * 5;

        if (yPosition + requiredHeight > pageHeight - footerHeight - margin) {
          pdf.addPage();
          drawHeader();
          yPosition = margin + headerHeight + 8;
        }

        pdf.setDrawColor(0, 0, 0);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, requiredHeight);
        pdf.setFillColor(230, 240, 250);
        pdf.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F");
        pdf.setFontSize(12);
        pdf.setFont(undefined, "bold");
        pdf.text("Notes", margin + 5, yPosition + 5);
        pdf.setFont(undefined, "normal");
        pdf.setFontSize(10);
        let currentY = yPosition + 13;
        notesLines.forEach((line) => {
          pdf.text(line, margin + 5, currentY);
          currentY += 5;
        });
        yPosition += requiredHeight + 10;
      }

      drawSignature();
      drawFooter();
      addPageNumbers();

      const fileName = `WorkOrder_${activeWorkOrderData?.wo_no || activeWorkOrderData?.work_id || "Unknown"}.pdf`;
      pdf.save(fileName);
    } catch (e) {
      console.error("PDF error", e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!visible) return null;
  if (!activeWorkOrderData && !isLoading) return null;

  const backdropStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 1040,
    opacity: closing ? 0 : 1,
    transition: `opacity ${FADE_MS}ms ease`,
  };

  const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: closing
      ? "translate(-50%, -50%) scale(0.98)"
      : "translate(-50%, -50%) scale(1)",
    background: "#fff",
    width: "90%",
    maxWidth: "900px",
    maxHeight: "90vh",
    zIndex: 1050,
    display: "flex",
    flexDirection: "column",
    borderRadius: 8,
    opacity: closing ? 0 : 1,
    transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
  };

  const sectionStyle = {
    border: "1px solid #ddd",
    borderRadius: "5px",
    marginBottom: "15px",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const sectionHeaderStyle = {
    backgroundColor: "#f0f7ff",
    padding: "8px 12px",
    borderBottom: "1px solid #ddd",
    fontWeight: "bold",
    fontSize: "14px",
    color: "#0056b3",
  };

  const sectionContentStyle = {
    padding: "12px",
    backgroundColor: "#fff",
  };

  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
    borderBottom: "1px dashed #eee",
    paddingBottom: "6px",
  };

  const labelStyle = {
    fontWeight: "bold",
    color: "#333",
  };

  const valueStyle = {
    color: "#555",
    textAlign: "right",
  };

  // Styles for the Blue Box (Matching the image)
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

  const hasRemark =
    !!stripHtml(activeWorkOrderData?.payment_details || "").trim() ||
    !!String(activeWorkOrderData?.payment_term || "").trim();

  return (
    <>
      <div style={backdropStyle} onClick={closeWithFade} />
      <div style={modalStyle}>
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
            Work Order Preview -{" "}
            {activeWorkOrderData?.wo_no ||
              activeWorkOrderData?.work_id ||
              "Loading..."}
          </h5>
          <button
            onClick={closeWithFade}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0",
              lineHeight: "1",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #ed3131",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              />
              <p style={{ marginTop: "16px" }}>Loading work order data...</p>
            </div>
          ) : !activeWorkOrderData ? (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <p>No work order data available.</p>
            </div>
          ) : (
            <>
              <div
                ref={pdfContentRef}
                style={{
                  padding: "20px",
                  backgroundColor: "white",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "11px",
                  width: "210mm",
                  margin: "0 auto",
                  border: "1px solid #ddd",
                  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    border: "1px solid #000",
                    overflow: "hidden",
                    marginBottom: "15px",
                  }}
                >
                  {headerImagePath ? (
                    <img
                      src={headerImagePath}
                      alt={`Header for ${officeBranch}`}
                      style={{ width: "100%", display: "block" }}
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

                <h3
                  style={{
                    textAlign: "center",
                    margin: "15px 0",
                    fontWeight: "bold",
                    fontSize: "18px",
                    color: "#0056b3",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Work Order
                </h3>

                <div style={sectionStyle}>
                  <div style={sectionHeaderStyle}>Work Order Details</div>
                  <div style={sectionContentStyle}>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Work Order No:</span>
                      <span style={valueStyle}>
                        {activeWorkOrderData?.wo_no || activeWorkOrderData?.work_id}
                      </span>
                    </div>
                   
                    <div style={rowStyle}>
                      <span style={labelStyle}>Quotation No:</span>
                      <span style={valueStyle}>{activeWorkOrderData?.quto_id || "-"}</span>
                    </div>
                    <div style={rowStyle}>
                      <span style={labelStyle}>Expected Delivery Date:</span>
                      <span style={valueStyle}>{activeWorkOrderData?.exp_delivery_date || "-"}</span>
                    </div>
                  </div>
                </div>

                {safeItems.length > 0 && (
                  <div style={{ marginBottom: "15px", border: "1px solid #ddd", borderRadius: "5px", overflow: "hidden" }}>
                    <div style={sectionHeaderStyle}>Work Order Items</div>
                    <div style={{ overflowX: "auto", padding: "0" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
                       <thead>
  <tr style={{ backgroundColor: "#007bff", color: "white", textAlign: "center" }}>
    <th style={th}>S.No</th>
    <th style={th}>Description</th>
    <th style={th}>Unit</th>
    <th style={th}>Qty</th>
    <th style={th}>Rate</th>
    <th style={th}>Amount</th>
  </tr>
</thead>

                        <tbody>
                          {safeItems.map((item, idx) => (
                            <tr key={idx}>
                             <td style={{ ...td, verticalAlign: "top" }}>{idx + 1}</td>
<td style={{ ...td, verticalAlign: "top" }}>{item.description || item.desc || "-"}</td>
<td style={{ ...td, verticalAlign: "top" }}>{item.unit || "-"}</td>
<td style={{ ...td, verticalAlign: "top" }}>{item.quantity || item.qty || "-"}</td>
<td style={{ ...td, verticalAlign: "top" }}>{item.rate || item.unit_price || "0"}</td>
<td style={{ ...td, verticalAlign: "top", textAlign: "right" }}>
  {(
    (parseFloat(item.quantity || item.qty || 0) *
     parseFloat(item.rate || item.unit_price || 0))
  ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
</td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ========================================= */}
                {/* ✅ NEW: BLUE AMOUNT BOX (Basic + GST + Total) */}
                {/* ========================================= */}
                <div style={{ float: "right", width: "45%" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td style={blueLeft}>Basic Amount</td>
                        <td style={blueRight}>
                          Rs{" "}
                          {calculatedTotals.basicAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td style={blueLeft}>GST @ 18%</td>
                        <td style={blueRight}>
                          Rs{" "}
                          {calculatedTotals.gst.toLocaleString("en-IN", {
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
                            {calculatedTotals.grandTotal.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </b>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Clear fix to prevent content overlap */}
                <div style={{ clear: "both" }}></div>
                {/* ========================================= */}
                {/* END BLUE AMOUNT BOX */}
                {/* ========================================= */}

                {activeWorkOrderData?.terms_and_condition && (
                  <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>Terms and Conditions</div>
                    <div style={sectionContentStyle}>
                      <div
                        style={{ fontSize: "10px", lineHeight: "1.4" }}
                        dangerouslySetInnerHTML={{ __html: activeWorkOrderData.terms_and_condition }}
                      />
                    </div>
                  </div>
                )}

                {hasRemark && (
                  <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>Remark</div>
                    <div style={sectionContentStyle}>
                      {activeWorkOrderData?.payment_details &&
                      stripHtml(activeWorkOrderData.payment_details).trim() ? (
                        <div
                          style={{ fontSize: "10px", lineHeight: "1.4" }}
                          dangerouslySetInnerHTML={{
                            __html: activeWorkOrderData.payment_details,
                          }}
                        />
                      ) : (
                        <div style={rowStyle}>
                          <span style={valueStyle}>{activeWorkOrderData?.payment_term}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeWorkOrderData?.warranty && (
                  <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>Warranty</div>
                    <div style={sectionContentStyle}>
                      <div
                        style={{ fontSize: "10px", lineHeight: "1.4" }}
                        dangerouslySetInnerHTML={{ __html: activeWorkOrderData.warranty }}
                      />
                    </div>
                  </div>
                )}

                {activeWorkOrderData?.special_req && (
                  <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>Special Requirements</div>
                    <div style={sectionContentStyle}>
                      <p style={{ margin: "0", lineHeight: "1.5" }}>{activeWorkOrderData.special_req}</p>
                    </div>
                  </div>
                )}

                {activeWorkOrderData?.notes && (
                  <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>Notes</div>
                    <div style={sectionContentStyle}>
                      <p style={{ margin: "0", lineHeight: "1.5" }}>{activeWorkOrderData.notes}</p>
                    </div>
                  </div>
                )}

                {/* ========================================= */}
                {/* ✅ NEW: SIGNATURE DISPLAY WHEN APPROVED */}
                {/* ========================================= */}
                {accountApprovalSuccess && signatureImage && (
                  <div
                    style={{
                      width: "100%",
                      borderTop: "1px solid black",
                      borderBottom: "1px solid black",
                      marginTop: "20px",
                      marginBottom: "10px",
                      padding: "10px 0",
                      textAlign: "left",
                    }}
                  >
                    <img
                      src={signatureImage}
                      alt="Authorized Signature"
                      style={{ height: "40px", width: "auto", marginBottom: "5px" }}
                    />
                    <p style={{ fontSize: "10px", margin: "5px 0 0 0", fontWeight: "bold" }}>
                      For NLF Solutions Pvt Ltd
                    </p>
                  </div>
                )}
                {/* ========================================= */}
                {/* END SIGNATURE DISPLAY */}
                {/* ========================================= */}

                <div
                  style={{
                    marginTop: "30px",
                    width: "100%",
                    borderTop: "2px solid #000",
                    paddingTop: "10px",
                  }}
                >
                  <img src="/extra/Footer.jpeg" alt="Footer" style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              </div>
            </>
          )}
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            {enableAccountApproval && (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                  cursor: "pointer",
                }}
              >
                <div className="custom-checkbox">
                  <input
                    type="checkbox"
                    id="accountApprovalCheckbox"
                    checked={accountApproved}
                    disabled={isUpdatingAccount || accountApprovalSuccess}
                    onClick={onAccountCheckboxClick}
                    readOnly
                  />
                  <span></span>
                </div>
                {isUpdatingAccount
                  ? "Approving account..."
                  : accountApprovalSuccess
                  ? "Account Approved"
                  : "Approve Account"}
              </label>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
           
            <button
              onClick={closeWithFade}
              style={{
                padding: "8px 16px",
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
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .custom-checkbox {
          position: relative;
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-right: 8px;
          background-color: #eee;
          border: 1px solid #ccc;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .custom-checkbox span {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #fff;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .custom-checkbox input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .custom-checkbox input[type="checkbox"]:checked + span {
          background-color: #28a745;
          border-color: #28a745;
        }

        .custom-checkbox input[type="checkbox"]:checked + span::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 14px;
          font-weight: bold;
        }

        .custom-checkbox input[type="checkbox"]:disabled + span {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .custom-checkbox input[type="checkbox"]:disabled:checked + span {
          background-color: #6c757d;
          border-color: #6c757d;
        }

        .custom-checkbox input[type="checkbox"]:disabled:checked + span::after {
          color: white;
        }
      `}</style>
    </>
  );
};

export default PDFWorkorder;