// // src/components/PDFPreview.jsx

// import React, { useState, useRef, useEffect } from "react";

// // Helper function to check approval values
// const isApprovedValue = (val) => {
//   if (!val) return false;
//   const s = String(val).trim().toLowerCase();
//   return ["yes", "approved", "true", "1"].includes(s);
// };

// const getBase64ImageFromURL = (url) => {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.setAttribute("crossOrigin", "anonymous");
//     img.onload = () => {
//       const canvas = document.createElement("canvas");
//       canvas.width = img.width;
//       canvas.height = img.height;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(img, 0, 0);
//       try {
//         const dataURL = canvas.toDataURL("image/jpeg");
//         resolve(dataURL);
//       } catch (e) {
//         console.warn("Canvas tainted, cannot export base64 for URL:", url);
//         resolve(null);
//       }
//     };
//     img.onerror = (error) => {
//       console.warn("Image load failed for URL:", url);
//       resolve(null);
//     };
//     img.src = url;
//   });
// };

// const PDFPreview = ({
//   show,
//   onHide,
//   quotationData,
//   quoteId,
//   onAdminApproved,
//   onRateApproved,
//   enableRateApproval = false,
//   enableAdminApproval = true,
// }) => {
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [fetchedData, setFetchedData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const [rateApproved, setRateApproved] = useState(false);
//   const [adminApproved, setAdminApproved] = useState(false);
//   const [isUpdatingRate, setIsUpdatingRate] = useState(false);
//   const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);
//   const [rateApprovalSuccess, setRateApprovalSuccess] = useState(false);
//   const [adminApprovalSuccess, setAdminApprovalSuccess] = useState(false);


//   const [kindAttention, setKindAttention] = useState("");
//   const [subjectLine, setSubjectLine] = useState("");
//   const [branchImageMap, setBranchImageMap] = useState({});

//   const pdfContentRef = useRef();

//   //new function to help save image parameter directly

//   const resolveQuotationHeaderImage = () => {
//   if (!activeQuotationData?.image) return null;

//   // If backend already gives full URL (most cases)
//   if (/^https?:\/\//i.test(activeQuotationData.image)) {
//     return activeQuotationData.image;
//   }

//   // Fallback: relative path
//   return `https://nlfs.in/erp/${activeQuotationData.image.replace(/^\/+/, "")}`;
// };


//   // Local visible/closing state to play fade animation
//   const [visible, setVisible] = useState(!!show);
//   const [closing, setClosing] = useState(false);
//   const FADE_MS = 300;

//   useEffect(() => {
//     const fetchBranches = async () => {
//       try {
//         const res = await fetch(
//           "https://nlfs.in/erp/index.php/Erp/branch_list",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({}),
//           }
//         );

//         const data = await res.json();

//         if (data.status && data.success === "1") {
//           const map = {};
//           (data.data || []).forEach((b) => {
//             if (b.branch_name && b.header_image) {
//               map[b.branch_name] = b.header_image;
//             }
//           });
//           setBranchImageMap(map);
//         }
//       } catch (e) {
//         console.error("Failed to load branch images", e);
//       }
//     };

//     // if (show) {
//     //   fetchBranches();
//     // }
//   }, [show]);


//   useEffect(() => {
//     if (show) {
//       setVisible(true);
//       setClosing(false);
//     } else {
//       if (visible && !closing) {
//         setClosing(true);
//         const t = setTimeout(() => {
//           setVisible(false);
//           setClosing(false);
//         }, FADE_MS);
//         return () => clearTimeout(t);
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [show]);

//   const closeWithFade = () => {
//     if (closing) return;
//     setClosing(true);
//     setTimeout(() => {
//       setVisible(false);
//       setClosing(false);
//       if (typeof onHide === "function") onHide();
//     }, FADE_MS);
//   };

//   useEffect(() => {
//     if (show && quoteId) {
//       const fetchQuotationData = async () => {
//         setIsLoading(true);
//         try {
//           const response = await fetch(
//             "https://nlfs.in/erp/index.php/Nlf_Erp/get_quotation_by_id",
//             {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ quote_id: String(quoteId) }),
//             }
//           );

//           const data = await response.json();
//           const isSuccess = data.status === true || data.status === "true";

//           if (isSuccess && data.data) {
//             setFetchedData(data.data);
//           }
//         } catch (error) {
//           console.error("Error fetching quotation data:", error);
//         } finally {
//           setIsLoading(false);
//         }
//       };

//       fetchQuotationData();
//     }
//   }, [show, quoteId]);

//   const activeQuotationData = fetchedData || quotationData;

//   useEffect(() => {
//     if (activeQuotationData) {
//       if (activeQuotationData.kind_attention) {
//         setKindAttention(activeQuotationData.kind_attention);
//       } else {
//         setKindAttention("");
//       }

//       const defaultSubject = `Quotation for ${activeQuotationData?.items?.[0]?.product || "Products"
//         }`;

//       if (activeQuotationData.subject) {
//         setSubjectLine(activeQuotationData.subject);
//       } else {
//         setSubjectLine(defaultSubject);
//       }
//     } else {
//       setKindAttention("");
//       setSubjectLine("");
//     }
//   }, [activeQuotationData]);

//   useEffect(() => {
//     if (activeQuotationData) {
//       setRateApproved(isApprovedValue(activeQuotationData.rate_approval));
//       setAdminApproved(isApprovedValue(activeQuotationData.admin_approval));

//       setRateApprovalSuccess(
//         isApprovedValue(activeQuotationData.rate_approval)
//       );

//       setAdminApprovalSuccess(
//         isApprovedValue(activeQuotationData.admin_approval)
//       );
//     }
//   }, [activeQuotationData]);


//   const wait = (ms) => new Promise((res) => setTimeout(res, ms));

//   const handleRateApproval = async () => {
//     if (!activeQuotationData) return;
//     if (rateApproved) return;

//     const quoteIdForApi =
//       activeQuotationData.quote_id ||
//       activeQuotationData.quotationId ||
//       quoteId;

//     if (!quoteIdForApi) {
//       alert("Missing quote ID, cannot approve rate.");
//       return;
//     }

//     setRateApproved(true);
//     setIsUpdatingRate(true);
//     await wait(900);

//     try {
//       const response = await fetch(
//         "https://nlfs.in/erp/index.php/Nlf_Erp/update_rate_approval",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             quote_id: String(quoteIdForApi),
//             rate_approval: "yes",
//           }),
//         }
//       );

//       const result = await response.json();
//       const success = result.status === true || result.status === "true";

//       if (success) {
//         if (fetchedData) {
//           setFetchedData((prev) =>
//             prev ? { ...prev, rate_approval: "Yes" } : prev
//           );
//         }

//         if (typeof onRateApproved === "function") {
//           onRateApproved(String(quoteIdForApi));
//         }

//         setRateApprovalSuccess(true);
//         setIsUpdatingRate(false);

//         // show same alert as admin approval
//         alert("Rate approved successfully!");

//         setTimeout(() => {
//           closeWithFade();
//         }, 400);
//       } else {
//         setRateApproved(false);
//         alert(result.message || "Failed to approve rate.");
//       }
//     } catch (err) {
//       console.error("Error approving rate:", err);
//       setRateApproved(false);
//       alert("Error approving rate: " + (err.message || "Unknown error"));
//     } finally {
//       setIsUpdatingRate(false);
//     }
//   };

//   const handleAdminApproval = async () => {
//     if (!activeQuotationData) return;
//     if (adminApproved) return;

//     if (!rateApproved) {
//       alert("Rate must be approved before approving the quotation.");
//       return;
//     }

//     const quoteIdForApi =
//       activeQuotationData.quote_id ||
//       activeQuotationData.quotationId ||
//       quoteId;

//     if (!quoteIdForApi) {
//       alert("Missing quote ID, cannot approve quotation.");
//       return;
//     }

//     setAdminApproved(true);
//     setIsUpdatingAdmin(true);
//     await wait(900);

//     try {
//       const response = await fetch(
//         "https://nlfs.in/erp/index.php/Nlf_Erp/update_admin_approval",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             quote_id: String(quoteIdForApi),
//             admin_approval: "Yes",
//           }),
//         }
//       );

//       const result = await response.json();
//       const success = result.status === true || result.status === "true";

//       if (success) {
//         if (fetchedData) {
//           setFetchedData((prev) =>
//             prev ? { ...prev, admin_approval: "Yes" } : prev
//           );
//         }

//         if (typeof onAdminApproved === "function") {
//           onAdminApproved(quoteIdForApi);
//         }

//         setAdminApprovalSuccess(true);
//         setIsUpdatingAdmin(false);

//         // same system alert (keep this)
//         alert("Quotation approved successfully!");

//         setTimeout(() => {
//           closeWithFade();
//         }, 400);
//       } else {
//         setAdminApproved(false);
//         alert(result.message || "Failed to approve quotation.");
//       }
//     } catch (err) {
//       console.error("Error approving quotation:", err);
//       setAdminApproved(false);
//       alert("Error approving quotation: " + (err.message || "Unknown error"));
//     } finally {
//       setIsUpdatingAdmin(false);
//     }
//   };

//   // Rate confirm: use system confirm
//   const onRateCheckboxClick = (e) => {
//     e.preventDefault();
//     if (rateApproved || isUpdatingRate || rateApprovalSuccess) return;

//     const confirmed = window.confirm(
//       "Proceed with rate approval?\n\nOnce approved, this action cannot be reverted."
//     );
//     if (confirmed) {
//       handleRateApproval();
//     }
//   };

//   // Admin confirm: use system confirm like rate approval
//   const onAdminCheckboxClick = (e) => {
//     e.preventDefault();
//     if (adminApproved || isUpdatingAdmin) return;

//     // Ensure rate is approved first — keep same behavior/guard
//     if (!rateApproved) {
//       alert("Rate must be approved before approving the quotation.");
//       return;
//     }

//     const confirmed = window.confirm(
//       "Proceed with quotation approval?\n\nOnce approved, this action cannot be reverted."
//     );
//     if (confirmed) {
//       handleAdminApproval();
//     }
//   };

//   const resolveHeaderImage = (branchName) => {
//     if (!branchName) return null;

//     const img = branchImageMap[branchName];
//     if (!img) return null;

//     // if backend already gives full URL, use it
//     if (/^https?:\/\//i.test(img)) return img;

//     // otherwise prefix uploads path
//     return `https://nlfs.in/erp/${img.replace(/^\/+/, "")}`;
//   };


//   const generatePDF = async () => {
//     if (!activeQuotationData) {
//       alert("No quotation data to generate PDF.");
//       return;
//     }

//     setIsGenerating(true);
//     try {
//       const jsPDF = (await import("jspdf")).default;
//       const autoTable = (await import("jspdf-autotable")).default;

//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageWidth = 210;
//       const pageHeight = 297;
//       const margin = 10; // REDUCED


//       const headerRawUrl = resolveQuotationHeaderImage();
//       const footerRawUrl = "/extra/Footer.jpeg";
//       const signatureRawUrl = "/extra/sign.jpg"; // Corrected to .jpg

//       // Use proxy for PDF generation to avoid CORS/Canvas tainting


//       // Pre-fetch Base64 data for all images
//       const [headerImgData, footerImgData, signatureImgData] = await Promise.all([
//   headerRawUrl
//     ? getBase64ImageFromURL(headerRawUrl)
//     : Promise.resolve(null),
//   getBase64ImageFromURL(footerRawUrl),
//   getBase64ImageFromURL(signatureRawUrl),
// ]);


//       const headerHeight = 24; // slightly smaller
//       const footerHeight = 16; // slightly smaller

//       // const drawHeader = () => {
//       //   const imgToUse = headerImgData || headerRawUrl;
//       //   if (!imgToUse) return;

//       //   try {
//       //     pdf.addImage(
//       //       imgToUse,
//       //       "JPEG",
//       //       margin,
//       //       margin,
//       //       pageWidth - 2 * margin,
//       //       headerHeight
//       //     );
//       //   } catch (e) {
//       //     console.error("Header image load failed", e);
//       //   }
//       // };

//       const drawHeader = () => {
//   if (!headerImgData) return; // ❗ DO NOT FALL BACK

//   try {
//     pdf.addImage(
//       headerImgData,
//       "JPEG",
//       margin,
//       margin,
//       pageWidth - 2 * margin,
//       headerHeight
//     );
//   } catch (e) {
//     console.error("Header image load failed", e);
//   }
// };

//       const drawFooter = () => {
//         if (!footerImgData) return;
//         try {
//           const footerY = pageHeight - footerHeight - margin;
//           pdf.addImage(
//             footerImgData,
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

//       // New function to draw the signature
//       const drawSignature = () => {
//         // Check if admin approval is successful and the signature image is loaded
//         if (!isApprovedValue(activeQuotationData.admin_approval) || !signatureImgData) return;
//         try {
//           // CHANGE 1: Increased margin above signature by moving it up the page
//           const signatureY = pageHeight - footerHeight - margin - 45; // Increased from 30 to 45
//           const signatureWidth = 50;
//           // CHANGE 2: Reduced height of the signature
//           const signatureHeight = 15; // Reduced from 20 to 15
//           pdf.addImage(
//             signatureImgData,
//             "JPEG",
//             pageWidth - margin - signatureWidth, // Align to the right
//             signatureY,
//             signatureWidth,
//             signatureHeight
//           );
//         } catch (e) {
//           console.error("Error loading signature:", e);
//         }
//       };

//       const drawBorder = (x, y, width, height) => {
//         pdf.setLineWidth(0.4);
//         pdf.rect(x, y, width, height);
//       };

//       let yPosition = margin + headerHeight + 6;

//       const checkNewPage = (requiredSpace) => {
//         if (yPosition + requiredSpace > pageHeight - footerHeight - margin) {
//           drawFooter();
//           pdf.addPage();
//           drawHeader();
//           yPosition = margin + headerHeight + 6;
//         }
//       };

//       drawHeader();

//       // Draw main border around document
//       drawBorder(
//         margin,
//         margin + headerHeight,
//         pageWidth - 2 * margin,
//         pageHeight - 2 * margin - headerHeight - footerHeight
//       );

//       // QUOTATION title with border
//       yPosition += 2;
//       pdf.setFontSize(14);
//       pdf.setFont(undefined, "bold");
//       pdf.text("QUOTATION", pageWidth / 2, yPosition, { align: "center" });
//       yPosition += 1;

//       // border under title
//       pdf.setLineWidth(0.4);
//       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 4;

//       // quote no / date (tighter top/bottom padding)
//       pdf.setFontSize(10);
//       pdf.setFont(undefined, "bold");
//       pdf.text(
//         `Quote No: ${activeQuotationData?.quote_no || activeQuotationData?.quote_id}`,
//         margin + 2,
//         yPosition
//       );
//       pdf.text(
//         `Date: ${activeQuotationData?.date || "-"}`,
//         pageWidth - margin - 4,
//         yPosition,
//         { align: "right" }
//       );
//       yPosition += 4;

//       // border under quote info (tighter)
//       pdf.setLineWidth(0.4);
//       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 6;

//       // Recipient info
//       pdf.setFont(undefined, "normal");
//       pdf.setFontSize(10);
//       pdf.text("To,", margin + 4, yPosition);
//       yPosition += 6;
//       pdf.text(activeQuotationData?.name || "-", margin + 4, yPosition);
//       yPosition += 6;
//       pdf.text(activeQuotationData?.city || "-", margin + 4, yPosition);
//       yPosition += 6;
//       pdf.setFont(undefined, "bold");
//       pdf.text(`Project: ${activeQuotationData?.project || "-"}`, margin + 4, yPosition);
//       yPosition += 6;

//       // Only include Kind Attention in PDF if it has content
//       if (kindAttention && kindAttention.trim()) {
//         pdf.setFont(undefined, "normal");
//         pdf.text(`Kind Attention: ${(kindAttention || "").trim()}`, margin + 4, yPosition);
//         yPosition += 6;
//       }

//       const defaultSubject = `Quotation for ${activeQuotationData?.items?.[0]?.product || "Products"
//         }`;
//       const subjectText = (subjectLine && subjectLine.trim()) || defaultSubject;
//       pdf.text(`Subject: ${subjectText}`, margin + 4, yPosition);
//       yPosition += 2;

//       // border under recipient info
//       pdf.setLineWidth(0.4);
//       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 8;

//       // intro
//       pdf.text("Dear Sir,", margin + 4, yPosition);
//       yPosition += 6;
//       const intro = `As per our discussion, we are pleased to quote our most competitive rates as follows:`;
//       const introLines = pdf.splitTextToSize(intro, pageWidth - 2 * margin - 8);
//       introLines.forEach((line) => {
//         checkNewPage(6);
//         pdf.text(line, margin + 4, yPosition);
//         yPosition += 5.5;
//       });
//       yPosition += 6;

//       // border under intro
//       pdf.setLineWidth(0.4);
//       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 8;

//       // items table
//     const tableData = [];

// activeQuotationData.items.forEach((item, idx) => {
//   // MAIN ITEM
//   tableData.push([
//     String(idx + 1),
//     item.desc || "-",
//     item.unit || "-",
//     item.qty || "-",
//     parseFloat(item.rate || 0).toLocaleString("en-IN", {
//       minimumFractionDigits: 2,
//     }),
//   ]);

//   // INSTALLATION ROW
//   if (
//     parseFloat(item.inst_qty) > 0 ||
//     parseFloat(item.inst_rate) > 0
//   ) {
//     tableData.push([
//       "",
//       "Installation",
//       item.inst_unit || "-",
//       item.inst_qty || "-",
//       parseFloat(item.inst_rate || 0).toLocaleString("en-IN", {
//         minimumFractionDigits: 2,
//       }),
//     ]);
//   }
// });


//       autoTable(pdf, {
//         startY: yPosition,
//         head: [["S.No", "Description", "Unit", "Qty", "Rate"]],
//         body: tableData,
//         theme: "grid",
//         tableWidth: pageWidth - 2 * margin,
//         columnStyles: {
//           0: { halign: "center", cellWidth: 12 },
//           1: { cellWidth: 'auto' },
//           2: { halign: "center", cellWidth: 18 },
//           3: { halign: "right", cellWidth: 18 },
//           4: { halign: "right", cellWidth: 28 },
//         },
//         styles: {
//           fontSize: 8,
//           cellPadding: 1.5,
//           overflow: "linebreak",
//           lineWidth: 0.4,
//           lineColor: [0, 0, 0],
//         },
//         headStyles: {
//           fillColor: [0, 86, 179],
//           textColor: 255,
//           fontStyle: "bold",
//           fontSize: 9,
//           lineWidth: 0.4,
//         },
//         didDrawPage: (data) => {
//           drawHeader();
//           drawFooter();
//         },
//         margin: {
//           top: margin + headerHeight + 4,
//           bottom: footerHeight + 8,
//           left: margin,
//           right: margin,
//         },
//       });

//       yPosition = pdf.lastAutoTable.finalY + 8;

//       // border under table
//       pdf.setLineWidth(0.4);
//       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 8;

//       // totals
//       const basicAmount =
//         activeQuotationData?.items?.reduce((sum, item) => {
//           return sum + parseFloat(item.total || item.amt || 0);
//         }, 0) || 0;

//       const gst = basicAmount * 0.18;
//       const grandTotal = basicAmount + gst;

//       checkNewPage(40);

//       const totalsX = pageWidth - margin - 80;

//       pdf.setFillColor(0, 86, 179);
//       pdf.rect(totalsX, yPosition, 80, 8, "F");
//       pdf.rect(totalsX, yPosition + 8, 80, 8, "F");
//       pdf.rect(totalsX, yPosition + 16, 80, 8, "F");

//       pdf.setLineWidth(0.4);
//       pdf.rect(totalsX, yPosition, 80, 8);
//       pdf.rect(totalsX, yPosition + 8, 80, 8);
//       pdf.rect(totalsX, yPosition + 16, 80, 8);

//       pdf.setFont(undefined, "bold");
//       pdf.setTextColor(255, 255, 255);
//       pdf.setFontSize(9);
//       pdf.text("Basic Amount", totalsX + 4, yPosition + 6);
//       pdf.text(
//         `Rs ${basicAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
//         totalsX + 76,
//         yPosition + 6,
//         { align: "right" }
//       );

//       pdf.text("GST @ 18%", totalsX + 4, yPosition + 14);
//       pdf.text(
//         `Rs ${gst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
//         totalsX + 76,
//         yPosition + 14,
//         { align: "right" }
//       );

//       pdf.text("Grand Total", totalsX + 4, yPosition + 22);
//       pdf.text(
//         `Rs ${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
//         totalsX + 76,
//         yPosition + 22,
//         { align: "right" }
//       );

//       pdf.setTextColor(0, 0, 0);
//       yPosition += 30;

//       // border under totals
//       pdf.setLineWidth(0.4);
//       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 6;

//       // pinkish line
//       checkNewPage(14);
//       pdf.setDrawColor(255, 192, 203);
//       pdf.setLineWidth(0.8);
//       pdf.line(margin + 12, yPosition, pageWidth - margin - 12, yPosition);
//       yPosition += 10;

//       // commercial terms
//       checkNewPage(30);

//       pdf.setFontSize(11);
//       pdf.setFont(undefined, "bold");
//       pdf.text("Commercial Terms:", margin + 4, yPosition);
//       yPosition += 8;

//       pdf.setFontSize(9);
//       pdf.setFont(undefined, "normal");

//       let termsHtml = activeQuotationData?.terms || "<div>No terms specified</div>";

//       let termsText = termsHtml
//         .replace(/<br\s*\/?>/gi, "\n")
//         .replace(/<\/p>/gi, "\n")
//         .replace(/<li>/gi, "\n• ")
//         .replace(/<\/li>/gi, "")
//         .replace(/<[^>]*>/g, "")
//         .replace(/&bull;/gi, "•");

//       const termsLinesRaw = termsText
//         .split(/\r?\n/)
//         .map((l) => l.trim())
//         .filter((l) => l.length > 0);

//       let specialSectionStarted = false;

//       termsLinesRaw.forEach((line) => {
//         const isRed =
//           /MS\/Aluminium|MS Aluminium|MS\/Aluminium substructure/i.test(line);

//         // Check if this is one of the special sentences
//         const isSpecialSentence = /Hope you will find our offer most competitive and in order|For NLF Solutions Pvt Ltd/i.test(line);

//         // Add horizontal rule before the first special sentence (only once)
//         if (isSpecialSentence && !specialSectionStarted) {
//           yPosition += 8; // Add more space before the line
//           pdf.setLineWidth(0.4);
//           pdf.setDrawColor(0, 0, 0);
//           // Ensure we have enough space for the line
//           checkNewPage(10);
//           // Draw the line with full width, matching the borders
//           pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//           yPosition += 10; // Add more space after the line
//           specialSectionStarted = true;
//         }

//         // Handle regular bullet points vs special sentences
//         let displayText = line;
//         if (isSpecialSentence) {
//           // Remove bullet if present and use as a regular sentence
//           displayText = line.startsWith("•") ? line.substring(1).trim() : line;
//         } else if (!line.startsWith("•")) {
//           // Add bullet to regular terms
//           displayText = `• ${line}`;
//         }

//         const wrapped = pdf.splitTextToSize(displayText, pageWidth - 2 * margin - 20);

//         wrapped.forEach((wLine) => {
//           checkNewPage(6);
//           if (isRed) {
//             pdf.setTextColor(210, 47, 47); // red
//             pdf.setFont(undefined, "bold");
//           } else if (isSpecialSentence) {
//             pdf.setTextColor(0, 0, 0); // black
//             pdf.setFont(undefined, "bold"); // Make special sentences bold
//           } else {
//             pdf.setTextColor(0, 0, 0);
//             pdf.setFont(undefined, "normal");
//           }
//           pdf.setFontSize(9);
//           pdf.text(wLine, margin + 10, yPosition);
//           yPosition += 5.5;
//         });

//         // Add extra spacing after special sentences
//         if (isSpecialSentence) {
//           yPosition += 3;
//         } else {
//           yPosition += 2;
//         }
//       });

//       pdf.setTextColor(0, 0, 0);
//       pdf.setFont(undefined, "normal");

//       pdf.setLineWidth(0.4);
//       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 8;

//       // *** CORRECTED LOCATION FOR SIGNATURE ***
//       // Draw the signature on the last page, just before the footer
//       drawSignature();

//       drawFooter();

//       const fileName = `Quotation_${activeQuotationData?.quote_id || "Unknown"}.pdf`;
//       pdf.save(fileName);
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//       alert("Error generating PDF. Please try again.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const calculateTotals = () => {
//     if (!activeQuotationData?.items || activeQuotationData.items.length === 0) {
//       return {
//         basicAmount: 0,
//         gst: 0,
//         grandTotal: parseFloat(activeQuotationData?.total || 0),
//       };
//     }

//     const basicAmount = activeQuotationData.items.reduce((sum, item) => {
//       const itemTotal = parseFloat(item.total || item.amt || 0);
//       return sum + itemTotal;
//     }, 0);

//     const gst = basicAmount * 0.18;
//     const grandTotal = basicAmount + gst;

//     return { basicAmount, gst, grandTotal };
//   };

//   const totals = calculateTotals();

//   if (!visible) return null;
//   if (!activeQuotationData && !isLoading) return null;

//  //new function mapping here
//  const headerImagePath = resolveQuotationHeaderImage();


//   // Updated styles to match POPreviewModal.jsx
//   const th = {
//     border: "1px solid #000",
//     padding: "6px",
//     fontWeight: "bold",
//   };
//   const td = { border: "1px solid #000", padding: "6px" };
//   const blueLeft = {
//     border: "1px solid #000",
//     padding: "6px",
//     background: "#007bff",
//     color: "white",
//     width: "70%",
//   };
//   const blueRight = {
//     border: "1px solid #000",
//     padding: "6px",
//     background: "#007bff",
//     color: "white",
//     textAlign: "right",
//   };

//   // Helper function to render terms for the preview
//   const renderTermsForPreview = () => {
//     let termsHtml = activeQuotationData?.terms || "<div>No terms specified</div>";
//     let termsText = termsHtml
//       .replace(/<br\s*\/?>/gi, "\n")
//       .replace(/<\/p>/gi, "\n")
//       .replace(/<li>/gi, "\n• ")
//       .replace(/<\/li>/gi, "")
//       .replace(/<[^>]*>/g, "")
//       .replace(/&bull;/gi, "•");

//     const termsLinesRaw = termsText
//       .split(/\r?\n/)
//       .map((l) => l.trim())
//       .filter((l) => l.length > 0);

//     if (termsLinesRaw.length === 0) {
//       return { beforeSpecial: [], afterSpecial: [] };
//     }

//     const beforeSpecial = [];
//     const afterSpecial = [];
//     let specialSectionStarted = false;

//     termsLinesRaw.forEach((line) => {
//       const isRed = /MS\/Aluminium|MS Aluminium|MS\/Aluminium substructure/i.test(line);
//       const isSpecialSentence = /Hope you will find our offer most competitive and in order|For NLF Solutions Pvt Ltd/i.test(line);

//       let displayText = line;
//       let styleProps = {
//         marginBottom: 4,
//         color: isRed ? "red" : "black",
//         fontWeight: isRed ? "bold" : "normal",
//       };

//       if (isSpecialSentence) {
//         if (!specialSectionStarted) {
//           specialSectionStarted = true;
//         }
//         displayText = line.startsWith("•") ? line.substring(1).trim() : line;
//         styleProps.marginBottom = 8;
//         styleProps.fontWeight = "bold";
//       } else if (!line.startsWith("•")) {
//         displayText = `• ${line}`;
//       }

//       const element = (
//         <div
//           key={line}
//           style={styleProps}
//         >
//           {displayText}
//         </div>
//       );

//       if (specialSectionStarted) {
//         afterSpecial.push(element);
//       } else {
//         beforeSpecial.push(element);
//       }
//     });

//     return { beforeSpecial, afterSpecial };
//   };

//   const backdropStyle = {
//     position: "fixed",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.45)",
//     zIndex: 1040,
//     opacity: closing ? 0 : 1,
//     transition: `opacity ${FADE_MS}ms ease`,
//     display: "block",
//   };

//   const modalStyle = {
//     position: "fixed",
//     top: "50%",
//     left: "50%",
//     transform: closing
//       ? "translate(-50%, -50%) scale(0.99)"
//       : "translate(-50%, -50%) scale(1)",
//     backgroundColor: "white",
//     borderRadius: "6px",
//     boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
//     zIndex: 1050,
//     width: "92%",
//     maxWidth: "900px",
//     maxHeight: "92vh",
//     display: "flex",
//     flexDirection: "column",
//     opacity: closing ? 0 : 1,
//     transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
//   };

//   const { beforeSpecial, afterSpecial } = renderTermsForPreview();

//   return (
//     <>
//       <div style={backdropStyle} onClick={closeWithFade} />

//       <div style={modalStyle}>
//         <div
//           style={{
//             padding: "12px 14px",
//             borderBottom: "1px solid #dee2e6",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <h5 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>
//             Quotation Preview -{" "}
//             {activeQuotationData?.quote_no ||
//               activeQuotationData?.quote_id ||
//               "Loading..."}
//           </h5>
//           <button
//             onClick={closeWithFade}
//             style={{
//               background: "none",
//               border: "none",
//               fontSize: "1.4rem",
//               cursor: "pointer",
//               padding: "0",
//               lineHeight: "1",
//             }}
//           >
//             ×
//           </button>
//         </div>

//         {/* Set padding to 0 to let the inner content control its own margins, matching POPreviewModal's Modal.Body */}
//         <div style={{ padding: "0", overflowY: "auto", flex: 1 }}>
//           {isLoading ? (
//             <div style={{ textAlign: "center", padding: "28px" }}>
//               <div
//                 style={{
//                   width: "36px",
//                   height: "36px",
//                   border: "4px solid #f3f3f3",
//                   borderTop: "4px solid #ed3131",
//                   borderRadius: "50%",
//                   animation: "spin 1s linear infinite",
//                   margin: "0 auto",
//                 }}
//               />
//               <p style={{ marginTop: "12px" }}>Loading quotation data...</p>
//             </div>
//           ) : !activeQuotationData ? (
//             <div style={{ textAlign: "center", padding: "28px" }}>
//               <p>No quotation data available.</p>
//             </div>
//           ) : (
//             <>
//               <div
//                 ref={pdfContentRef}
//                 style={{
//                   // --- STYLING UPDATED TO MATCH POPreviewModal.jsx ---
//                   padding: "15px",
//                   backgroundColor: "white",
//                   fontFamily: "Arial, sans-serif",
//                   fontSize: "10.5px",
//                   width: "210mm",
//                   margin: "0 auto",
//                   border: "1px solid #ddd",
//                 }}
//               >
//                 {/* HEADER IMAGE */}
//                 <div
//                   style={{
//                     width: "100%",
//                     border: "1px solid #000", // Updated border
//                     overflow: "hidden",
//                   }}
//                 >
//                   {headerImagePath ? (
//                     <img
//                       src={headerImagePath}
// alt="Quotation Header"
//                       style={{ width: "100%", height: "auto", display: "block" }}
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

//                 {/* TITLE */}
//                 <h3
//                   style={{
//                     textAlign: "center",
//                     margin: "15px 0", // Updated margin
//                     fontWeight: "bold",
//                   }}
//                 >
//                   QUOTATION
//                 </h3>

//                 {/* Quote No / Date */}
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: "8px", // Updated margin
//                   }}
//                 >
//                   <div>
//                     <strong>
//                       Quote No:{" "}
//                       {activeQuotationData?.quote_no ||
//                         activeQuotationData?.quote_id}
//                     </strong>
//                   </div>
//                   <div>
//                     <strong>Date:</strong> {activeQuotationData?.date || "-"}
//                   </div>
//                 </div>

//                 {/* CLIENT DETAILS */}
//                 <div style={{ lineHeight: "1.4", marginBottom: "15px" }}>
//                   <p style={{ margin: 0 }}>
//                     <strong>To,</strong>
//                   </p>
//                   <p style={{ margin: 0 }}>{activeQuotationData?.name || "-"}</p>
//                   <p style={{ margin: 0 }}>{activeQuotationData?.city || "-"}</p>
//                   <p style={{ margin: 0 }}>
//                     <strong>Project:</strong> {activeQuotationData?.project || "-"}
//                   </p>
//                   <p style={{ marginTop: "10px" }}>
//                     <strong>Kind Attention:</strong>{" "}
//                     <input
//                       type="text"
//                       value={kindAttention}
//                       onChange={(e) => setKindAttention(e.target.value)}
//                       style={{
//                         border: "none",
//                         borderBottom: "1px dashed #999",
//                         outline: "none",
//                         fontSize: "10.5px", // Updated font-size
//                         width: "55%",
//                       }}
//                     />
//                   </p>
//                   <p style={{ marginTop: "5px" }}>
//                     <strong>Subject:</strong>{" "}
//                     <input
//                       type="text"
//                       value={subjectLine}
//                       onChange={(e) => setSubjectLine(e.target.value)}
//                       style={{
//                         border: "none",
//                         borderBottom: "1px dashed #999",
//                         outline: "none",
//                         fontSize: "10.5px", // Updated font-size
//                         width: "64%",
//                       }}
//                     />
//                   </p>
//                 </div>

//                 {/* DEAR SIR TEXT */}
//                 <p style={{ marginBottom: "15px" }}>
//                   <strong>Dear Sir,</strong>
//                   <br />
//                   <strong>
//                     As per our discussion, we are pleased to quote our most
//                     competitive rates as follows:
//                   </strong>
//                 </p>

//                 {/* ITEMS TABLE */}
//                 {activeQuotationData?.items &&
//                   activeQuotationData.items.length > 0 && (
//                     <table
//                       style={{ width: "100%", borderCollapse: "collapse" }}
//                     >
//                       <thead>
//                         <tr
//                           style={{
//                             backgroundColor: "#007bff",
//                             color: "white",
//                             textAlign: "center",
//                           }}
//                         >
//                           <th style={th}>S.No</th>
//                           <th style={th}>Description</th>
//                           <th style={th}>Unit</th>
//                           <th style={th}>Qty</th>
//                           <th style={th}>Rate</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {activeQuotationData.items.map((item, idx) => (
//                           <React.Fragment key={idx}>
//                             <tr>
//                               <td style={td}>{idx + 1}</td>
//                               <td style={td}>{item.desc || "-"}</td>
//                               <td style={td}>{item.unit || "-"}</td>
//                               <td style={td}>{item.qty || "-"}</td>
//                               <td style={td}>
//                                 {parseFloat(item.rate || 0).toLocaleString("en-IN", {
//                                   minimumFractionDigits: 2,
//                                 })}
//                               </td>
//                             </tr>
//                             {(item.inst_qty > 0 || item.inst_rate > 0) && (
//                               <tr>
//                                 <td style={td}></td>
//                                 <td style={{ ...td, fontStyle: "italic" }}>
//                                   Installation
//                                 </td>
//                                 <td style={td}>{item.inst_unit || "-"}</td>
//                                 <td style={td}>{item.inst_qty || "-"}</td>
//                                 <td style={td}>
//                                   {parseFloat(item.inst_rate || 0).toLocaleString("en-IN", {
//                                     minimumFractionDigits: 2,
//                                   })}
//                                 </td>
//                               </tr>
//                             )}
//                           </React.Fragment>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}

//                 {/* AMOUNT BLUE BOX */}
//                 <div
//                   style={{
//                     float: "right",
//                     width: "45%",
//                     marginTop: "12px",
//                   }}
//                 >
//                   <table
//                     style={{ width: "100%", borderCollapse: "collapse" }}
//                   >
//                     <tbody>
//                       <tr>
//                         <td style={blueLeft}>Basic Amount</td>
//                         <td style={blueRight}>
//                           Rs{" "}
//                           {totals.basicAmount.toLocaleString("en-IN", {
//                             minimumFractionDigits: 2,
//                           })}
//                         </td>
//                       </tr>
//                       <tr>
//                         <td style={blueLeft}>GST @ 18%</td>
//                         <td style={blueRight}>
//                           Rs{" "}
//                           {totals.gst.toLocaleString("en-IN", {
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
//                             {totals.grandTotal.toLocaleString("en-IN", {
//                               minimumFractionDigits: 2,
//                             })}
//                           </b>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>

//                 <div style={{ clear: "both", marginTop: "50px" }}>
//                   <h4>Commercial Terms:</h4>
//                   <div
//                     className="nlf-terms-preview"
//                     style={{
//                       lineHeight: "1.6",
//                       whiteSpace: "pre-wrap",
//                       fontSize: "10.5px", // Updated font-size
//                     }}
//                   >
//                     {beforeSpecial}
//                   </div>
//                   {afterSpecial.length > 0 && (
//                     <div
//                       style={{
//                         borderTop: "1px solid black",
//                         margin: "10px 0",
//                       }}
//                     />
//                   )}
//                   <div
//                     className="nlf-terms-preview"
//                     style={{
//                       lineHeight: "1.6",
//                       whiteSpace: "pre-wrap",
//                       fontSize: "10.5px", // Updated font-size
//                     }}
//                   >
//                     {afterSpecial}
//                   </div>
//                 </div>

//                 {/* SIGNATURE SECTION */}
//                 {adminApprovalSuccess && (
//                   <div style={{ textAlign: "right", marginTop: "20px" }}>
//                     <img
//                       src="/extra/sign.jpg" // Corrected to .jpg
//                       alt="Digital Signature"
//                       style={{ height: "40px", width: "auto" }}
//                     />
//                     <p style={{ fontSize: "10px", margin: "5px 0 0 0" }}>
//                       Authorized Signature
//                     </p>
//                   </div>
//                 )}

//                 {/* FOOTER IMAGE */}
//                 <div
//                   style={{
//                     marginTop: "25px",
//                     width: "100%",
//                     borderTop: "2px solid #000", // Updated border
//                   }}
//                 >
//                   <img
//                     src="/extra/Footer.jpeg"
//                     alt="Footer"
//                     style={{ width: "100%", height: "auto" }}
//                   />
//                 </div>
//               </div>
//             </>
//           )}
//         </div>

//         <div
//           style={{
//             padding: "12px 14px",
//             borderTop: "1px solid #dee2e6",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             gap: 8,
//             flexWrap: "wrap",
//           }}
//         >
//           <div style={{ minWidth: 280 }}>
//             {rateApprovalSuccess && (
//               <div
//                 style={{
//                   padding: 8,
//                   borderRadius: 6,
//                   background: "#e6f9ed",
//                   border: "1px solid #c7efd0",
//                   color: "#1b6a2b",
//                   fontWeight: 600,
//                   marginBottom: 6,
//                   display: "inline-block",
//                 }}
//               >
//                 Rate approved successfully.
//               </div>
//             )}

//             {enableRateApproval && (
//               <>
//                 {!rateApprovalSuccess ? (
//                   <label
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       marginBottom: "6px",
//                       cursor: "pointer",
//                     }}
//                   >
//                     <div className="custom-checkbox">
//                       <input
//                         type="checkbox"
//                         checked={rateApproved}
//                         disabled={isUpdatingRate}
//                         onClick={onRateCheckboxClick}
//                         readOnly
//                       />
//                       <span></span>
//                     </div>
//                     {isUpdatingRate ? "Approving rate..." : "Approve Rate"}
//                   </label>
//                 ) : (
//                   <div
//                     style={{
//                       padding: 8,
//                       borderRadius: 6,
//                       background: "#e6f9ed",
//                       border: "1px solid #c7efd0",
//                       color: "#1b6a2b",
//                       fontWeight: 600,
//                       marginBottom: 6,
//                       display: "inline-block",
//                     }}
//                   >

//                   </div>
//                 )}
//               </>
//             )}


//             {enableAdminApproval && !adminApproved && (
//               <>
//                 {rateApproved ? (
//                   <label
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       cursor: "pointer",
//                     }}
//                   >
//                     <div className="custom-checkbox">
//                       <input
//                         type="checkbox"
//                         id="adminApprovalCheckbox"
//                         checked={adminApproved}
//                         disabled={isUpdatingAdmin || adminApprovalSuccess}
//                         onClick={onAdminCheckboxClick}
//                         readOnly
//                       />
//                       <span></span>
//                     </div>
//                     {isUpdatingAdmin
//                       ? "Approving quotation..."
//                       : adminApprovalSuccess
//                         ? "Quotation Approved"
//                         : "Approve Quotation (Admin)"}

//                   </label>
//                 ) : (
//                   <small
//                     style={{
//                       color: "black",
//                       fontSize: "0.85rem",
//                     }}
//                   >
//                     Rate approval required before admin approval
//                   </small>
//                 )}
//               </>
//             )}
//           </div>

//           {adminApprovalSuccess && (
//             <div
//               style={{
//                 padding: 8,
//                 borderRadius: 6,
//                 background: "#e6f9ed",
//                 border: "1px solid #c7efd0",
//                 color: "#1b6a2b",
//                 fontWeight: 600,
//                 marginBottom: 6,
//                 display: "inline-block",
//               }}
//             >
//               Quotation approved successfully.
//             </div>
//           )}


//           <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
//             {((enableAdminApproval && adminApproved) ||
//               (!enableAdminApproval && rateApproved)) && (
//                 <button
//                   onClick={generatePDF}
//                   disabled={isGenerating}
//                   style={{
//                     padding: "8px 14px",
//                     backgroundColor: "#007bff",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "4px",
//                     cursor: isGenerating ? "not-allowed" : "pointer",
//                     opacity: isGenerating ? 0.6 : 1,
//                   }}
//                 >
//                   {isGenerating ? "Generating PDF..." : "Download PDF"}
//                 </button>
//               )}
//             <button
//               onClick={closeWithFade}
//               style={{
//                 padding: "8px 14px",
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
//           width: 18px;
//           height: 18px;
//           margin-right: 8px;
//           border-radius: 4px;
//           background-color: #ffffff;
//           border: 1px solid #dcdcdc;
//           cursor: pointer;
//           transition: all 0.12s ease;
//           box-sizing: border-box;
//         }

//         .custom-checkbox span {
//           position: absolute;
//           inset: 0;
//           display: block;
//           border-radius: 4px;
//           pointer-events: none;
//           transition: background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
//           background: transparent;
//         }

//         .custom-checkbox input[type="checkbox"] {
//           position: absolute;
//           opacity: 0;
//           width: 100%;
//           height: 100%;
//           margin: 0;
//           left: 0;
//           top: 0;
//           cursor: pointer;
//         }

//         .custom-checkbox input[type="checkbox"] + span::after {
//           content: '';
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//           font-weight: 700;
//           font-size: 12px;
//           color: transparent;
//           line-height: 1;
//         }

//         .custom-checkbox:hover {
//           border-color: #c0c0c0;
//           box-shadow: 0 0 0 2px rgba(0,0,0,0.02);
//         }

//         .custom-checkbox input[type="checkbox"]:checked + span {
//           background-color: #ed3131;
//           border-color: #ed3131;
//         }

//         .custom-checkbox input[type="checkbox"]:checked + span::after {
//           content: '✓';
//           color: #ffffff;
//           font-size: 12px;
//           position: absolute;
//           top: 50%;
//           left: 50%;
//           transform: translate(-50%, -50%);
//         }

//         .custom-checkbox input[type="checkbox"]:disabled + span {
//           opacity: 0.6;
//           filter: grayscale(0.2);
//         }

//         .custom-checkbox input[type="checkbox"]:disabled + span::after {
//           color: #ffffff;
//         }

//         .custom-checkbox input[type="checkbox"]:disabled {
//           cursor: not-allowed;
//         }
//           .nlf-terms-preview {
//     font-family: Arial, Helvetica, sans-serif;
//     font-size: 12px;
//     line-height: 1.45;
//     color: #111;
//   }
//   .nlf-terms-preview div { margin-bottom:6px; }
//   .nlf-terms-preview strong { font-weight: 700; }
//       `}</style>
//     </>
//   );
// };

// export default PDFPreview;

// src/components/PDFPreview.jsx

import React, { useState, useRef, useEffect } from "react";

// Helper function to check approval values
const isApprovedValue = (val) => {
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return ["yes", "approved", "true", "1"].includes(s);
};

const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL("image/jpeg");
        resolve(dataURL);
      } catch (e) {
        console.warn("Canvas tainted, cannot export base64 for URL:", url);
        resolve(null);
      }
    };
    img.onerror = (error) => {
      console.warn("Image load failed for URL:", url);
      resolve(null);
    };
    img.src = url;
  });
};

const PDFPreview = ({
  show,
  onHide,
  quotationData,
  quoteId,
  onAdminApproved,
  onRateApproved,
  enableRateApproval = false,
  enableAdminApproval = true,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [rateApproved, setRateApproved] = useState(false);
  const [adminApproved, setAdminApproved] = useState(false);
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);
  const [rateApprovalSuccess, setRateApprovalSuccess] = useState(false);
  const [adminApprovalSuccess, setAdminApprovalSuccess] = useState(false);


  const [kindAttention, setKindAttention] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [branchImageMap, setBranchImageMap] = useState({});

  const pdfContentRef = useRef();

  // Local visible/closing state to play fade animation
  const [visible, setVisible] = useState(!!show);
  const [closing, setClosing] = useState(false);
  const FADE_MS = 300;

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(
          "https://nlfs.in/erp/index.php/Erp/branch_list",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );

        const data = await res.json();

        if (data.status && data.success === "1") {
          const map = {};
          (data.data || []).forEach((b) => {
            if (b.branch_name && b.header_image) {
              map[b.branch_name] = b.header_image;
            }
          });
          setBranchImageMap(map);
        }
      } catch (e) {
        console.error("Failed to load branch images", e);
      }
    };

    if (show) {
      fetchBranches();
    }
  }, [show]);


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
      if (activeQuotationData.kind_attention) {
        setKindAttention(activeQuotationData.kind_attention);
      } else {
        setKindAttention("");
      }

      const defaultSubject = `Quotation for ${activeQuotationData?.items?.[0]?.product || "Products"
        }`;

      if (activeQuotationData.subject) {
        setSubjectLine(activeQuotationData.subject);
      } else {
        setSubjectLine(defaultSubject);
      }
    } else {
      setKindAttention("");
      setSubjectLine("");
    }
  }, [activeQuotationData]);

  useEffect(() => {
    if (activeQuotationData) {
      setRateApproved(isApprovedValue(activeQuotationData.rate_approval));
      setAdminApproved(isApprovedValue(activeQuotationData.admin_approval));

      setRateApprovalSuccess(
        isApprovedValue(activeQuotationData.rate_approval)
      );

      setAdminApprovalSuccess(
        isApprovedValue(activeQuotationData.admin_approval)
      );
    }
  }, [activeQuotationData]);


  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  const handleRateApproval = async () => {
    if (!activeQuotationData) return;
    if (rateApproved) return;

    const quoteIdForApi =
      activeQuotationData.quote_id ||
      activeQuotationData.quotationId ||
      quoteId;

    if (!quoteIdForApi) {
      alert("Missing quote ID, cannot approve rate.");
      return;
    }

    setRateApproved(true);
    setIsUpdatingRate(true);
    await wait(900);

    try {
      const response = await fetch(
        "https://nlfs.in/erp/index.php/Nlf_Erp/update_rate_approval",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quote_id: String(quoteIdForApi),
            rate_approval: "yes",
          }),
        }
      );

      const result = await response.json();
      const success = result.status === true || result.status === "true";

      if (success) {
        if (fetchedData) {
          setFetchedData((prev) =>
            prev ? { ...prev, rate_approval: "Yes" } : prev
          );
        }

        if (typeof onRateApproved === "function") {
          onRateApproved(String(quoteIdForApi));
        }

        setRateApprovalSuccess(true);
        setIsUpdatingRate(false);

        // show same alert as admin approval
        alert("Rate approved successfully!");

        setTimeout(() => {
          closeWithFade();
        }, 400);
      } else {
        setRateApproved(false);
        alert(result.message || "Failed to approve rate.");
      }
    } catch (err) {
      console.error("Error approving rate:", err);
      setRateApproved(false);
      alert("Error approving rate: " + (err.message || "Unknown error"));
    } finally {
      setIsUpdatingRate(false);
    }
  };

  const handleAdminApproval = async () => {
    if (!activeQuotationData) return;
    if (adminApproved) return;

    if (!rateApproved) {
      alert("Rate must be approved before approving the quotation.");
      return;
    }

    const quoteIdForApi =
      activeQuotationData.quote_id ||
      activeQuotationData.quotationId ||
      quoteId;

    if (!quoteIdForApi) {
      alert("Missing quote ID, cannot approve quotation.");
      return;
    }

    setAdminApproved(true);
    setIsUpdatingAdmin(true);
    await wait(900);

    try {
      const response = await fetch(
        "https://nlfs.in/erp/index.php/Nlf_Erp/update_admin_approval",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quote_id: String(quoteIdForApi),
            admin_approval: "Yes",
          }),
        }
      );

      const result = await response.json();
      const success = result.status === true || result.status === "true";

      if (success) {
        if (fetchedData) {
          setFetchedData((prev) =>
            prev ? { ...prev, admin_approval: "Yes" } : prev
          );
        }

        if (typeof onAdminApproved === "function") {
          onAdminApproved(quoteIdForApi);
        }

        setAdminApprovalSuccess(true);
        setIsUpdatingAdmin(false);

        // same system alert (keep this)
        alert("Quotation approved successfully!");

        setTimeout(() => {
          closeWithFade();
        }, 400);
      } else {
        setAdminApproved(false);
        alert(result.message || "Failed to approve quotation.");
      }
    } catch (err) {
      console.error("Error approving quotation:", err);
      setAdminApproved(false);
      alert("Error approving quotation: " + (err.message || "Unknown error"));
    } finally {
      setIsUpdatingAdmin(false);
    }
  };

  // Rate confirm: use system confirm
  const onRateCheckboxClick = (e) => {
    e.preventDefault();
    if (rateApproved || isUpdatingRate || rateApprovalSuccess) return;

    const confirmed = window.confirm(
      "Proceed with rate approval?\n\nOnce approved, this action cannot be reverted."
    );
    if (confirmed) {
      handleRateApproval();
    }
  };

  // Admin confirm: use system confirm like rate approval
  const onAdminCheckboxClick = (e) => {
    e.preventDefault();
    if (adminApproved || isUpdatingAdmin) return;

    // Ensure rate is approved first — keep same behavior/guard
    if (!rateApproved) {
      alert("Rate must be approved before approving the quotation.");
      return;
    }

    const confirmed = window.confirm(
      "Proceed with quotation approval?\n\nOnce approved, this action cannot be reverted."
    );
    if (confirmed) {
      handleAdminApproval();
    }
  };

  const resolveHeaderImage = (branchName) => {
    if (!branchName) return null;

    const img = branchImageMap[branchName];
    if (!img) return null;

    // if backend already gives full URL, use it
    if (/^https?:\/\//i.test(img)) return img;

    // otherwise prefix uploads path
    return `https://nlfs.in/erp/${img.replace(/^\/+/, "")}`;
  };

  const resolveProductImage = (img) => {
    if (!img) return null;
    if (typeof img !== "string") return null;
    if (/^https?:\/\//i.test(img)) return img;
    return `https://nlfs.in/erp/${img.replace(/^\/+/, "")}`;
  };


  const generatePDF = async () => {
    if (!activeQuotationData) {
      alert("No quotation data to generate PDF.");
      return;
    }

    setIsGenerating(true);
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10; // REDUCED

      const officeBranch = activeQuotationData?.branch || "Mumbai";
      const headerRawUrl = resolveHeaderImage(officeBranch);
      const footerRawUrl = "/extra/Footer.jpeg";
      const signatureRawUrl = "/extra/sign.jpg"; // Corrected to .jpg

      // Use proxy for PDF generation to avoid CORS/Canvas tainting
      let headerUrlForPdf = headerRawUrl;
      if (headerRawUrl && headerRawUrl.startsWith("https://nlfs.in/erp")) {
        headerUrlForPdf = headerRawUrl.replace(
          "https://nlfs.in/erp",
          "/erp-image-proxy"
        );
      }

      // Pre-fetch Base64 data for all images
      const [headerImgData, footerImgData, signatureImgData] = await Promise.all([
        headerUrlForPdf
          ? getBase64ImageFromURL(headerUrlForPdf)
          : Promise.resolve(null),
        getBase64ImageFromURL(footerRawUrl),
        getBase64ImageFromURL(signatureRawUrl),
      ]);

      const headerHeight = 24; // slightly smaller
      const footerHeight = 16; // slightly smaller

      const drawHeader = () => {
        const imgToUse = headerImgData || headerRawUrl;
        if (!imgToUse) return;

        try {
          pdf.addImage(
            imgToUse,
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
        if (!footerImgData) return;
        try {
          const footerY = pageHeight - footerHeight - margin;
          pdf.addImage(
            footerImgData,
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

      // New function to draw the signature
      const drawSignature = () => {
        // Check if admin approval is successful and the signature image is loaded
        if (!isApprovedValue(activeQuotationData.admin_approval) || !signatureImgData) return;
        try {
          // CHANGE 1: Increased margin above signature by moving it up the page
          const signatureY = pageHeight - footerHeight - margin - 45; // Increased from 30 to 45
          const signatureWidth = 50;
          // CHANGE 2: Reduced height of the signature
          const signatureHeight = 15; // Reduced from 20 to 15
          pdf.addImage(
            signatureImgData,
            "JPEG",
            pageWidth - margin - signatureWidth, // Align to the right
            signatureY,
            signatureWidth,
            signatureHeight
          );
        } catch (e) {
          console.error("Error loading signature:", e);
        }
      };

      const drawBorder = (x, y, width, height) => {
        pdf.setLineWidth(0.4);
        pdf.rect(x, y, width, height);
      };

      let yPosition = margin + headerHeight + 6;

      const checkNewPage = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - footerHeight - margin) {
          drawFooter();
          pdf.addPage();
          drawHeader();
          yPosition = margin + headerHeight + 6;
        }
      };

      drawHeader();

      // Draw main border around document
      drawBorder(
        margin,
        margin + headerHeight,
        pageWidth - 2 * margin,
        pageHeight - 2 * margin - headerHeight - footerHeight
      );

      // QUOTATION title with border
      yPosition += 2;
      pdf.setFontSize(14);
      pdf.setFont(undefined, "bold");
      pdf.text("QUOTATION", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 1;

      // border under title
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 4;

      // quote no / date (tighter top/bottom padding)
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.text(
        `Quote No: ${activeQuotationData?.quote_no || activeQuotationData?.quote_id}`,
        margin + 2,
        yPosition
      );
      pdf.text(
        `Date: ${activeQuotationData?.date || "-"}`,
        pageWidth - margin - 4,
        yPosition,
        { align: "right" }
      );
      yPosition += 4;

      // border under quote info (tighter)
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // Recipient info
      pdf.setFont(undefined, "normal");
      pdf.setFontSize(10);
      pdf.text("To,", margin + 4, yPosition);
      yPosition += 6;
      pdf.text(activeQuotationData?.name || "-", margin + 4, yPosition);
      yPosition += 6;
      pdf.text(activeQuotationData?.city || "-", margin + 4, yPosition);
      yPosition += 6;
      pdf.setFont(undefined, "bold");
      pdf.text(`Project: ${activeQuotationData?.project || "-"}`, margin + 4, yPosition);
      yPosition += 6;

      // Only include Kind Attention in PDF if it has content
      if (kindAttention && kindAttention.trim()) {
        pdf.setFont(undefined, "normal");
        pdf.text(`Kind Attention: ${(kindAttention || "").trim()}`, margin + 4, yPosition);
        yPosition += 6;
      }

      const defaultSubject = `Quotation for ${activeQuotationData?.items?.[0]?.product || "Products"
        }`;
      const subjectText = (subjectLine && subjectLine.trim()) || defaultSubject;
      pdf.text(`Subject: ${subjectText}`, margin + 4, yPosition);
      yPosition += 2;

      // border under recipient info
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // intro
      pdf.text("Dear Sir,", margin + 4, yPosition);
      yPosition += 6;
      const intro = `As per our discussion, we are pleased to quote our most competitive rates as follows:`;
      const introLines = pdf.splitTextToSize(intro, pageWidth - 2 * margin - 8);
      introLines.forEach((line) => {
        checkNewPage(6);
        pdf.text(line, margin + 4, yPosition);
        yPosition += 5.5;
      });
      yPosition += 6;

      // border under intro
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Pre-fetch item images
      const itemImages = await Promise.all(
        activeQuotationData.items.map(async (item) => {
          const specImage =
            item.spec_image ||
            item.Spec_Image ||
            item.SPEC_IMAGE ||
            item.spec_img ||
            item.image ||
            item.Item_Image ||
            item.product_image ||
            item.img ||
            item.specification_image ||
            item.specification?.image ||
            item.specification?.spec_image ||
            item.product_details?.image ||
            item.product_details?.spec_image;
          const imgUrl = resolveProductImage(specImage);
          if (!imgUrl) return null;

          // Proxy URL for PDF generation
          let urlForPdf = imgUrl;
          if (imgUrl.startsWith("https://nlfs.in/erp")) {
            urlForPdf = imgUrl.replace(
              "https://nlfs.in/erp",
              "/erp-image-proxy"
            );
          }
          return getBase64ImageFromURL(urlForPdf);
        })
      );

      // items table
      const tableData = [];
      const rowImageMap = {}; // rowIndex -> base64Data

      activeQuotationData.items.forEach((item, idx) => {
        // MAIN ITEM
        const rowIndex = tableData.length;
        if (itemImages[idx]) {
          rowImageMap[rowIndex] = itemImages[idx];
        }

        tableData.push([
          String(idx + 1),
          item.desc || "-",
          item.unit || "-",
          item.qty || "-",
          parseFloat(item.rate || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          }),
          "", // Placeholder for Image
        ]);

        // INSTALLATION ROW
        if (
          parseFloat(item.inst_qty) > 0 ||
          parseFloat(item.inst_rate) > 0
        ) {
          tableData.push([
            "",
            "Installation",
            item.inst_unit || "-",
            item.inst_qty || "-",
            parseFloat(item.inst_rate || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            }),
            "", // No image for installation
          ]);
        }
      });


      autoTable(pdf, {
        startY: yPosition,
        head: [["S.No", "Description", "Unit", "Qty", "Rate", "Image"]],
        body: tableData,
        theme: "grid",
        tableWidth: pageWidth - 2 * margin,
        columnStyles: {
          0: { halign: "center", cellWidth: 12 },
          1: { cellWidth: 'auto' },
          2: { halign: "center", cellWidth: 18 },
          3: { halign: "right", cellWidth: 18 },
          4: { halign: "right", cellWidth: 28 },
          5: { halign: "center", cellWidth: 20 }, // Image column
        },
        styles: {
          fontSize: 8,
          cellPadding: 1.5,
          overflow: "linebreak",
          lineWidth: 0.4,
          lineColor: [0, 0, 0],
          valign: 'middle', // ensure text is vertically centered
          minCellHeight: 15, // ensure enough height for image
        },
        headStyles: {
          fillColor: [0, 86, 179],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
          lineWidth: 0.4,
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 5) {
            const imgData = rowImageMap[data.row.index];
            if (imgData) {
              try {
                // Draw image inside the cell
                // data.cell.x, data.cell.y are coordinates
                // data.cell.width, data.cell.height
                const padding = 2;
                const boxWidth = data.cell.width - 2 * padding;
                const boxHeight = data.cell.height - 2 * padding;

                // We want to fit independent of aspect ratio? Or contain?
                // pdf.addImage(data, format, x, y, w, h)
                // Let's settle for a fixed thumbnail size or fit to cell
                const imgSize = Math.min(boxWidth, boxHeight);

                pdf.addImage(
                  imgData,
                  "JPEG",
                  data.cell.x + (data.cell.width - imgSize) / 2,
                  data.cell.y + (data.cell.height - imgSize) / 2,
                  imgSize,
                  imgSize
                );
              } catch (e) {
                console.error("Error drawing row image", e);
              }
            }
          }
        },
        didDrawPage: (data) => {
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

      yPosition = pdf.lastAutoTable.finalY + 8;

      // border under table
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // totals
      const basicAmount =
        activeQuotationData?.items?.reduce((sum, item) => {
          return sum + parseFloat(item.total || item.amt || 0);
        }, 0) || 0;

      const gst = basicAmount * 0.18;
      const grandTotal = basicAmount + gst;

      checkNewPage(40);

      const totalsX = pageWidth - margin - 80;

      pdf.setFillColor(0, 86, 179);
      pdf.rect(totalsX, yPosition, 80, 8, "F");
      pdf.rect(totalsX, yPosition + 8, 80, 8, "F");
      pdf.rect(totalsX, yPosition + 16, 80, 8, "F");

      pdf.setLineWidth(0.4);
      pdf.rect(totalsX, yPosition, 80, 8);
      pdf.rect(totalsX, yPosition + 8, 80, 8);
      pdf.rect(totalsX, yPosition + 16, 80, 8);

      pdf.setFont(undefined, "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.text("Basic Amount", totalsX + 4, yPosition + 6);
      pdf.text(
        `Rs ${basicAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        totalsX + 76,
        yPosition + 6,
        { align: "right" }
      );

      pdf.text("GST @ 18%", totalsX + 4, yPosition + 14);
      pdf.text(
        `Rs ${gst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        totalsX + 76,
        yPosition + 14,
        { align: "right" }
      );

      pdf.text("Grand Total", totalsX + 4, yPosition + 22);
      pdf.text(
        `Rs ${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        totalsX + 76,
        yPosition + 22,
        { align: "right" }
      );

      pdf.setTextColor(0, 0, 0);
      yPosition += 30;

      // border under totals
      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // pinkish line
      checkNewPage(14);
      pdf.setDrawColor(255, 192, 203);
      pdf.setLineWidth(0.8);
      pdf.line(margin + 12, yPosition, pageWidth - margin - 12, yPosition);
      yPosition += 10;

      // commercial terms
      checkNewPage(30);

      pdf.setFontSize(11);
      pdf.setFont(undefined, "bold");
      pdf.text("Commercial Terms:", margin + 4, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setFont(undefined, "normal");

      let termsHtml = activeQuotationData?.terms || "<div>No terms specified</div>";

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

      let specialSectionStarted = false;

      termsLinesRaw.forEach((line) => {
        const isRed =
          /MS\/Aluminium|MS Aluminium|MS\/Aluminium substructure/i.test(line);

        // Check if this is one of the special sentences
        const isSpecialSentence = /Hope you will find our offer most competitive and in order|For NLF Solutions Pvt Ltd/i.test(line);

        // Add horizontal rule before the first special sentence (only once)
        if (isSpecialSentence && !specialSectionStarted) {
          yPosition += 8; // Add more space before the line
          pdf.setLineWidth(0.4);
          pdf.setDrawColor(0, 0, 0);
          // Ensure we have enough space for the line
          checkNewPage(10);
          // Draw the line with full width, matching the borders
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10; // Add more space after the line
          specialSectionStarted = true;
        }

        // Handle regular bullet points vs special sentences
        let displayText = line;
        if (isSpecialSentence) {
          // Remove bullet if present and use as a regular sentence
          displayText = line.startsWith("•") ? line.substring(1).trim() : line;
        } else if (!line.startsWith("•")) {
          // Add bullet to regular terms
          displayText = `• ${line}`;
        }

        const wrapped = pdf.splitTextToSize(displayText, pageWidth - 2 * margin - 20);

        wrapped.forEach((wLine) => {
          checkNewPage(6);
          if (isRed) {
            pdf.setTextColor(210, 47, 47); // red
            pdf.setFont(undefined, "bold");
          } else if (isSpecialSentence) {
            pdf.setTextColor(0, 0, 0); // black
            pdf.setFont(undefined, "bold"); // Make special sentences bold
          } else {
            pdf.setTextColor(0, 0, 0);
            pdf.setFont(undefined, "normal");
          }
          pdf.setFontSize(9);
          pdf.text(wLine, margin + 10, yPosition);
          yPosition += 5.5;
        });

        // Add extra spacing after special sentences
        if (isSpecialSentence) {
          yPosition += 3;
        } else {
          yPosition += 2;
        }
      });

      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, "normal");

      pdf.setLineWidth(0.4);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // *** CORRECTED LOCATION FOR SIGNATURE ***
      // Draw the signature on the last page, just before the footer
      drawSignature();

      drawFooter();

      const fileName = `Quotation_${activeQuotationData?.quote_id || "Unknown"}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateTotals = () => {
    if (!activeQuotationData?.items || activeQuotationData.items.length === 0) {
      return {
        basicAmount: 0,
        gst: 0,
        grandTotal: parseFloat(activeQuotationData?.total || 0),
      };
    }

    const basicAmount = activeQuotationData.items.reduce((sum, item) => {
      const itemTotal = parseFloat(item.total || item.amt || 0);
      return sum + itemTotal;
    }, 0);

    const gst = basicAmount * 0.18;
    const grandTotal = basicAmount + gst;

    return { basicAmount, gst, grandTotal };
  };

  const totals = calculateTotals();

  if (!visible) return null;
  if (!activeQuotationData && !isLoading) return null;

  const officeBranch =
    activeQuotationData?.branch ||
    activeQuotationData?.officeBranch ||
    "Mumbai";

  const headerImagePath = resolveHeaderImage(officeBranch);

  // Updated styles to match POPreviewModal.jsx
  const th = {
    border: "1px solid #000",
    padding: "6px",
    fontWeight: "bold",
  };
  const td = { border: "1px solid #000", padding: "6px" };
  const blueLeft = {
    border: "1px solid #000",
    padding: "6px",
    background: "#007bff",
    color: "white",
    width: "70%",
  };
  const blueRight = {
    border: "1px solid #000",
    padding: "6px",
    background: "#007bff",
    color: "white",
    textAlign: "right",
  };

  // Helper function to render terms for the preview
  const renderTermsForPreview = () => {
    let termsHtml = activeQuotationData?.terms || "<div>No terms specified</div>";
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

    if (termsLinesRaw.length === 0) {
      return { beforeSpecial: [], afterSpecial: [] };
    }

    const beforeSpecial = [];
    const afterSpecial = [];
    let specialSectionStarted = false;

    termsLinesRaw.forEach((line) => {
      const isRed = /MS\/Aluminium|MS Aluminium|MS\/Aluminium substructure/i.test(line);
      const isSpecialSentence = /Hope you will find our offer most competitive and in order|For NLF Solutions Pvt Ltd/i.test(line);

      let displayText = line;
      let styleProps = {
        marginBottom: 4,
        color: isRed ? "red" : "black",
        fontWeight: isRed ? "bold" : "normal",
      };

      if (isSpecialSentence) {
        if (!specialSectionStarted) {
          specialSectionStarted = true;
        }
        displayText = line.startsWith("•") ? line.substring(1).trim() : line;
        styleProps.marginBottom = 8;
        styleProps.fontWeight = "bold";
      } else if (!line.startsWith("•")) {
        displayText = `• ${line}`;
      }

      const element = (
        <div
          key={line}
          style={styleProps}
        >
          {displayText}
        </div>
      );

      if (specialSectionStarted) {
        afterSpecial.push(element);
      } else {
        beforeSpecial.push(element);
      }
    });

    return { beforeSpecial, afterSpecial };
  };

  const backdropStyle = {
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
  };

  const modalStyle = {
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
  };

  const { beforeSpecial, afterSpecial } = renderTermsForPreview();

  return (
    <>
      <div style={backdropStyle} onClick={closeWithFade} />

      <div style={modalStyle}>
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>
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

        {/* Set padding to 0 to let the inner content control its own margins, matching POPreviewModal's Modal.Body */}
        <div style={{ padding: "0", overflowY: "auto", flex: 1 }}>
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
            <>
              <div
                ref={pdfContentRef}
                style={{
                  // --- STYLING UPDATED TO MATCH POPreviewModal.jsx ---
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
                    border: "1px solid #000", // Updated border
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
                    margin: "15px 0", // Updated margin
                    fontWeight: "bold",
                  }}
                >
                  QUOTATION
                </h3>

                {/* Quote No / Date */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px", // Updated margin
                  }}
                >
                  <div>
                    <strong>
                      Quote No:{" "}
                      {activeQuotationData?.quote_no ||
                        activeQuotationData?.quote_id}
                    </strong>
                  </div>
                  <div>
                    <strong>Date:</strong> {activeQuotationData?.date || "-"}
                  </div>
                </div>

                {/* CLIENT DETAILS */}
                <div style={{ lineHeight: "1.4", marginBottom: "15px" }}>
                  <p style={{ margin: 0 }}>
                    <strong>To,</strong>
                  </p>
                  <p style={{ margin: 0 }}>{activeQuotationData?.name || "-"}</p>
                  <p style={{ margin: 0 }}>{activeQuotationData?.city || "-"}</p>
                  <p style={{ margin: 0 }}>
                    <strong>Project:</strong> {activeQuotationData?.project || "-"}
                  </p>
                  <p style={{ marginTop: "10px" }}>
                    <strong>Kind Attention:</strong>{" "}
                    <input
                      type="text"
                      value={kindAttention}
                      onChange={(e) => setKindAttention(e.target.value)}
                      style={{
                        border: "none",
                        borderBottom: "1px dashed #999",
                        outline: "none",
                        fontSize: "10.5px", // Updated font-size
                        width: "55%",
                      }}
                    />
                  </p>
                  <p style={{ marginTop: "5px" }}>
                    <strong>Subject:</strong>{" "}
                    <input
                      type="text"
                      value={subjectLine}
                      onChange={(e) => setSubjectLine(e.target.value)}
                      style={{
                        border: "none",
                        borderBottom: "1px dashed #999",
                        outline: "none",
                        fontSize: "10.5px", // Updated font-size
                        width: "64%",
                      }}
                    />
                  </p>
                </div>

                {/* DEAR SIR TEXT */}
                <p style={{ marginBottom: "15px" }}>
                  <strong>Dear Sir,</strong>
                  <br />
                  <strong>
                    As per our discussion, we are pleased to quote our most
                    competitive rates as follows:
                  </strong>
                </p>

                {/* ITEMS TABLE */}
                {activeQuotationData?.items &&
                  activeQuotationData.items.length > 0 && (
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr
                          style={{
                            backgroundColor: "#007bff",
                            color: "white",
                            textAlign: "center",
                          }}
                        >
                          <th style={th}>S.No</th>
                          <th style={th}>Description</th>
                          <th style={th}>Unit</th>
                          <th style={th}>Qty</th>
                          <th style={th}>Rate</th>
                          <th style={th}>Image</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeQuotationData.items.map((item, idx) => (
                          <React.Fragment key={idx}>
                            <tr>
                              <td style={td}>{idx + 1}</td>
                              <td style={td}>{item.desc || "-"}</td>
                              <td style={td}>{item.unit || "-"}</td>
                              <td style={td}>{item.qty || "-"}</td>
                              <td style={td}>
                                {parseFloat(item.rate || 0).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td style={td}>
                                {(() => {
                                  // Exhaustive check for image properties in different formats/casings
                                  const specImage =
                                    item.spec_image ||
                                    item.Spec_Image ||
                                    item.SPEC_IMAGE ||
                                    item.spec_img ||
                                    item.image ||
                                    item.Item_Image ||
                                    item.product_image ||
                                    item.img ||
                                    item.specification_image ||
                                    item.specification?.image ||
                                    item.specification?.spec_image ||
                                    item.product_details?.image ||
                                    item.product_details?.spec_image;

                                  return specImage ? (
                                    <img
                                      src={resolveProductImage(specImage)}
                                      alt="Spec"
                                      style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "contain",
                                        display: "block",
                                        margin: "0 auto",
                                      }}
                                    />
                                  ) : (
                                    "-"
                                  );
                                })()}
                              </td>

                            </tr>
                            {(item.inst_qty > 0 || item.inst_rate > 0) && (
                              <tr>
                                <td style={td}></td>
                                <td style={{ ...td, fontStyle: "italic" }}>
                                  Installation
                                </td>
                                <td style={td}>{item.inst_unit || "-"}</td>
                                <td style={td}>{item.inst_qty || "-"}</td>
                                <td style={td}>
                                  {parseFloat(item.inst_rate || 0).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                                <td style={td}></td>

                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  )}

                {/* AMOUNT BLUE BOX */}
                <div
                  style={{
                    float: "right",
                    width: "45%",
                    marginTop: "12px",
                  }}
                >
                  <table
                    style={{ width: "100%", borderCollapse: "collapse" }}
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

                <div style={{ clear: "both", marginTop: "50px" }}>
                  <h4>Commercial Terms:</h4>
                  <div
                    className="nlf-terms-preview"
                    style={{
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                      fontSize: "10.5px", // Updated font-size
                    }}
                  >
                    {beforeSpecial}
                  </div>
                  {afterSpecial.length > 0 && (
                    <div
                      style={{
                        borderTop: "1px solid black",
                        margin: "10px 0",
                      }}
                    />
                  )}
                  <div
                    className="nlf-terms-preview"
                    style={{
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                      fontSize: "10.5px", // Updated font-size
                    }}
                  >
                    {afterSpecial}
                  </div>
                </div>

                {/* SIGNATURE SECTION */}
                {adminApprovalSuccess && (
                  <div style={{ textAlign: "right", marginTop: "20px" }}>
                    <img
                      src="/extra/sign.jpg" // Corrected to .jpg
                      alt="Digital Signature"
                      style={{ height: "40px", width: "auto" }}
                    />
                    <p style={{ fontSize: "10px", margin: "5px 0 0 0" }}>
                      Authorized Signature
                    </p>
                  </div>
                )}

                {/* FOOTER IMAGE */}
                <div
                  style={{
                    marginTop: "25px",
                    width: "100%",
                    borderTop: "2px solid #000", // Updated border
                  }}
                >
                  <img
                    src="/extra/Footer.jpeg"
                    alt="Footer"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div
          style={{
            padding: "12px 14px",
            borderTop: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 280 }}>
            {rateApprovalSuccess && (
              <div
                style={{
                  padding: 8,
                  borderRadius: 6,
                  background: "#e6f9ed",
                  border: "1px solid #c7efd0",
                  color: "#1b6a2b",
                  fontWeight: 600,
                  marginBottom: 6,
                  display: "inline-block",
                }}
              >
                Rate approved successfully.
              </div>
            )}

            {enableRateApproval && (
              <>
                {!rateApprovalSuccess ? (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <div className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={rateApproved}
                        disabled={isUpdatingRate}
                        onClick={onRateCheckboxClick}
                        readOnly
                      />
                      <span></span>
                    </div>
                    {isUpdatingRate ? "Approving rate..." : "Approve Rate"}
                  </label>
                ) : (
                  <div
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      background: "#e6f9ed",
                      border: "1px solid #c7efd0",
                      color: "#1b6a2b",
                      fontWeight: 600,
                      marginBottom: 6,
                      display: "inline-block",
                    }}
                  >

                  </div>
                )}
              </>
            )}


            {enableAdminApproval && !adminApproved && (
              <>
                {rateApproved ? (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div className="custom-checkbox">
                      <input
                        type="checkbox"
                        id="adminApprovalCheckbox"
                        checked={adminApproved}
                        disabled={isUpdatingAdmin || adminApprovalSuccess}
                        onClick={onAdminCheckboxClick}
                        readOnly
                      />
                      <span></span>
                    </div>
                    {isUpdatingAdmin
                      ? "Approving quotation..."
                      : adminApprovalSuccess
                        ? "Quotation Approved"
                        : "Approve Quotation (Admin)"}

                  </label>
                ) : (
                  <small
                    style={{
                      color: "black",
                      fontSize: "0.85rem",
                    }}
                  >
                    Rate approval required before admin approval
                  </small>
                )}
              </>
            )}
          </div>

          {adminApprovalSuccess && (
            <div
              style={{
                padding: 8,
                borderRadius: 6,
                background: "#e6f9ed",
                border: "1px solid #c7efd0",
                color: "#1b6a2b",
                fontWeight: 600,
                marginBottom: 6,
                display: "inline-block",
              }}
            >
              Quotation approved successfully.
            </div>
          )}


          <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
            {((enableAdminApproval && adminApproved) ||
              (!enableAdminApproval && rateApproved)) && (
                <button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isGenerating ? "not-allowed" : "pointer",
                    opacity: isGenerating ? 0.6 : 1,
                  }}
                >
                  {isGenerating ? "Generating PDF..." : "Download PDF"}
                </button>
              )}
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
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .custom-checkbox {
          position: relative;
          display: inline-block;
          width: 18px;
          height: 18px;
          margin-right: 8px;
          border-radius: 4px;
          background-color: #ffffff;
          border: 1px solid #dcdcdc;
          cursor: pointer;
          transition: all 0.12s ease;
          box-sizing: border-box;
        }

        .custom-checkbox span {
          position: absolute;
          inset: 0;
          display: block;
          border-radius: 4px;
          pointer-events: none;
          transition: background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease;
          background: transparent;
        }

        .custom-checkbox input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          left: 0;
          top: 0;
          cursor: pointer;
        }

        .custom-checkbox input[type="checkbox"] + span::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 700;
          font-size: 12px;
          color: transparent;
          line-height: 1;
        }

        .custom-checkbox:hover {
          border-color: #c0c0c0;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.02);
        }

        .custom-checkbox input[type="checkbox"]:checked + span {
          background-color: #ed3131;
          border-color: #ed3131;
        }

        .custom-checkbox input[type="checkbox"]:checked + span::after {
          content: '✓';
          color: #ffffff;
          font-size: 12px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .custom-checkbox input[type="checkbox"]:disabled + span {
          opacity: 0.6;
          filter: grayscale(0.2);
        }

        .custom-checkbox input[type="checkbox"]:disabled + span::after {
          color: #ffffff;
        }

        .custom-checkbox input[type="checkbox"]:disabled {
          cursor: not-allowed;
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

export default PDFPreview;