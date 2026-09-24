import React, { useState, useRef, useEffect } from "react";

// Helper function to check approval values
const isApprovedValue = (val) => {
if (!val) return false;
const s = String(val).trim().toLowerCase();
return ["yes", "approved", "true", "1"].includes(s);
};

// Helper function to convert image URL to Base64
const getBase64ImageFromURL = (url) => {
return new Promise((resolve, reject) => {
if (!url) {
resolve(null);
return;
}
// If it's already Base64 data, return it directly
if (url.startsWith('data:')) {
resolve(url);
return;
}
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

const normalizeDescription = (raw, mode = "paragraph") => {
if (!raw) return [];

// 1️⃣ Normalize Excel junk
let text = String(raw)
.replace(/\r\n/g, "\n")
.replace(/\r/g, "\n")
.replace(/\t/g, " ")
.replace(/\s{2,}/g, " ")
.trim();

// 2️⃣ Split on meaningful breaks
let lines = text
.split("\n")
.map(l => l.trim())
.filter(l => l.length > 0);

// 3️⃣ Merge broken sentences
const merged = [];
lines.forEach(line => {
if (
merged.length &&
!/[.:]$/.test(merged[merged.length - 1]) &&
/^[a-z]/.test(line)
) {
merged[merged.length - 1] += " " + line;
} else {
merged.push(line);
}
});

// 4️⃣ Output modes
if (mode === "single") {
return [merged.join(" ")];
}

return merged;
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

const PDFRatePreview = ({
show,
onHide,
quotationData,
quoteId,
onRateApproved,
showRateApproval = true, // ✅ ADD THIS
}) => {
const [isGenerating, setIsGenerating] = useState(false);
const [fetchedData, setFetchedData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [rateApproved, setRateApproved] = useState(false);
const [isUpdatingRate, setIsUpdatingRate] = useState(false);
const [rateApprovalSuccess, setRateApprovalSuccess] = useState(false);
// Admin state variables removed
const [signatureImage, setSignatureImage] = useState(null);
const [signatureLoading, setSignatureLoading] = useState(false);
const [kindAttention, setKindAttention] = useState("");
const [subjectLine, setSubjectLine] = useState("");
const [branchImageMap, setBranchImageMap] = useState({});
const pdfContentRef = useRef();

// Local visible/closing state to play fade animation
const [visible, setVisible] = useState(!!show);
const [closing, setClosing] = useState(false);
const FADE_MS = 300;

const pageNumberHeight = 12;

useEffect(() => {
const fetchSignature = async () => {
if (!rateApproved) return; // Only fetch after rate approval
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
if (
data.status &&
(data.success === "1" || data.status === true)
) {
// Handle both single object and array response
const signatureData = Array.isArray(data.data)
? data.data.find((s) => String(s.id) === "5")
: data.data;
const img =
signatureData?.image_url ||
signatureData?.sign_img ||
signatureData?.signature ||
signatureData?.image;
if (img) {
// If it's already a full URL or base64, use it
if (img.startsWith("data:") || img.startsWith("http")) {
setSignatureImage(img);
} else {
// If relative path
setSignatureImage(
`https://nlfs.in/erp/${img.replace(/^\/+/, "")}`
);
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
}, [rateApproved]);

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
const isSuccess =
data.status === true || data.status === "true";
if (isSuccess && data.data) {
setFetchedData(data.data);
// If sign_img is already Base64 from API, set it directly
if (data.data.sign_img && data.data.sign_img.startsWith('data:')) {
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
if (activeQuotationData.kind_attention) {
setKindAttention(activeQuotationData.kind_attention);
} else {
setKindAttention("");
}
const defaultSubject = `Quotation for ${activeQuotationData?.items?.[0]?.product || "Products"}`;
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
setRateApprovalSuccess(
isApprovedValue(activeQuotationData.rate_approval)
);
// Admin approval state updates removed
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
alert("Rate approved successfully!");
// ✅ CHANGED: Removed auto-close so user can download PDF
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

const onRateCheckboxClick = (e) => {
e.preventDefault();
if (rateApproved || isUpdatingRate || rateApprovalSuccess) return;
const confirmed = window.confirm(
"Proceed with rate approval?\nOnce approved, this action cannot be reverted."
);
if (confirmed) {
handleRateApproval();
}
};

const resolveHeaderImage = (branchName) => {
const localBranchHeaders = {
"Kolkata": "/extra/Kolkata.jpeg",
"Delhi": "/extra/Delhi.jpeg",
"Indore": "/extra/Indore.jpeg",
"Nagpur": "/extra/Nagpur.jpeg",
"Mumbai": "/extra/Mumbai.jpeg",
};
if (localBranchHeaders[branchName]) {
return localBranchHeaders[branchName];
}
return localBranchHeaders["Mumbai"];
};

const resolveProductImage = (img) => {
if (!img) return null;
if (typeof img !== "string") return null;
if (img.startsWith("data:")) return img;
if (/^https?:\/\//i.test(img)) return img;
return `https://nlfs.in/erp/${img.replace(/^\/+/, "")}`;
};

const getSignatureDataForPDF = async () => {
if (activeQuotationData?.sign_img) {
const signImg = activeQuotationData.sign_img;
if (signImg.startsWith('data:')) return signImg;
else if (signImg.startsWith('http')) return await getBase64ImageFromURL(signImg);
}
if (signatureImage && isApprovedValue(activeQuotationData?.rate_approval)) {
return await getBase64ImageFromURL(signatureImage);
}
return null;
};

const sanitizeFilePart = (val) => {
if (!val) return "NA";
return String(val)
.replace(/[\/\\?%*:|"<>]/g, "")
.replace(/\s+/g, " ")
.trim();
};

// Add this RIGHT BEFORE the generatePDF function definition
const parseHTMLToTextSegments = (htmlString) => {
const tempDiv = document.createElement('div');
tempDiv.innerHTML = htmlString;

const segments = [];

const processNode = (node, inheritedStyle = 'normal') => {
if (node.nodeType === Node.TEXT_NODE) {
const text = node.textContent.trim();
if (text) {
segments.push({
text: text,
style: inheritedStyle
});
}
} else if (node.nodeType === Node.ELEMENT_NODE) {
const tagName = node.tagName.toLowerCase();
let currentStyle = inheritedStyle;

if (tagName === 'strong' || tagName === 'b') {
currentStyle = 'bold';
} else if (tagName === 'em' || tagName === 'i') {
currentStyle = 'italic';
}

node.childNodes.forEach(child => processNode(child, currentStyle));
}
};

tempDiv.childNodes.forEach(child => processNode(child));
return segments;
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
const margin = 4;
const officeBranch = activeQuotationData?.branch || "Mumbai";
const headerRawUrl = resolveHeaderImage(officeBranch);
const footerRawUrl = "/extra/Footer.jpeg";
const SHOW_SIGNATURE_IN_PDF = false;

const FOOTER_BOTTOM_MARGIN = 0;

const signatureImgData = SHOW_SIGNATURE_IN_PDF
? await getSignatureDataForPDF()
: null;

const [headerImgData, footerImgData] = await Promise.all([
headerRawUrl ? getBase64ImageFromURL(headerRawUrl) : Promise.resolve(null),
getBase64ImageFromURL(footerRawUrl),
]);

const AUTO_TABLE_BOTTOM_GAP = 4;
const headerHeight = 24;
const footerHeight = 16;

const addPageNumbers = () => {
const pageCount = pdf.getNumberOfPages();
pdf.setFontSize(9);
pdf.setTextColor(0, 0, 0);
for (let i = 1; i <= pageCount; i++) {
pdf.setPage(i);
const text = `Page ${i} of ${pageCount}`;
const y = pageHeight - footerHeight - FOOTER_BOTTOM_MARGIN - 3;
pdf.text(text, pageWidth / 2, y, { align: "center" });
}
};

const drawHeader = () => {
const imgToUse = headerImgData || headerRawUrl;
if (!imgToUse) return;
try {
pdf.addImage(imgToUse, "JPEG", 0, 0, pageWidth, headerHeight);
} catch (e) {
console.error("Header image load failed", e);
}
};

const drawFooter = () => {
if (!footerImgData) return;
try {
pdf.addImage(
footerImgData,
"JPEG",
0,
pageHeight - footerHeight - FOOTER_BOTTOM_MARGIN,
pageWidth,
footerHeight
);
} catch (e) {
console.error("Footer image load failed", e);
}
};

const drawBorder = (x, y, width, height) => {
pdf.setLineWidth(0.5);
pdf.rect(x, y, width, height);
};

let yPosition = margin + headerHeight + 4;

const checkNewPage = (requiredSpace) => {
const PAGE_SAFETY_GAP = 2;
const bottomLimit =
pageHeight -
footerHeight -
FOOTER_BOTTOM_MARGIN -
PAGE_SAFETY_GAP;

if (yPosition + requiredSpace > bottomLimit) {
drawFooter();
pdf.addPage();
drawHeader();
drawBorder(
margin,
headerHeight,
pageWidth - 2 * margin,
pageHeight - headerHeight - footerHeight
);
yPosition = margin + headerHeight + 6;
}
};

drawHeader();
drawBorder(
margin,
headerHeight,
pageWidth - 2 * margin,
pageHeight - headerHeight - footerHeight
);

yPosition += 1;
pdf.setFontSize(14);
pdf.setFont(undefined, "bold");
pdf.setTextColor(0, 0, 0);
pdf.text("QUOTATION", pageWidth / 2, yPosition, { align: "center" });
yPosition += 3;
pdf.setLineWidth(0.5);
pdf.line(margin, yPosition, pageWidth - margin, yPosition);
pdf.setLineWidth(0.1);
pdf.line(margin, yPosition, pageWidth - margin, yPosition);
yPosition += 4;

pdf.setFontSize(10);
pdf.setFont(undefined, "bold");
pdf.text(
`Quote No: ${activeQuotationData?.quote_no || activeQuotationData?.quote_id || "-"}`,
margin + 4,
yPosition
);
pdf.text(
`Date: ${formatDateDDMMYYYY(activeQuotationData?.date)}`,
pageWidth - margin - 4,
yPosition,
{ align: "right" }
);
yPosition += 1;

pdf.setLineWidth(0.5);
pdf.line(margin, yPosition, pageWidth - margin, yPosition);
yPosition += 6;

pdf.setFont(undefined, "normal");
pdf.setFontSize(10);
pdf.text("To,", margin + 4, yPosition);
yPosition += 4;
pdf.setFont(undefined, "bold");
pdf.text(activeQuotationData?.name || "-", margin + 4, yPosition);
yPosition += 4;
pdf.setFont(undefined, "normal");
pdf.text(activeQuotationData?.city || "-", margin + 4, yPosition);
yPosition += 4;

if (kindAttention && kindAttention.trim()) {
pdf.setFontSize(10);
pdf.setFont(undefined, "bold");
const label = "Kind Attention: ";
pdf.text(label, margin + 4, yPosition);
const labelWidth = pdf.getTextWidth(label);
pdf.setFont(undefined, "normal");
pdf.text(
kindAttention.trim(),
margin + 4 + labelWidth,
yPosition
);
yPosition += 4;
}

const defaultSubject = `Quotation for ${
activeQuotationData?.items?.[0]?.product || "Products"
}`;
const subjectText = (subjectLine && subjectLine.trim()) || defaultSubject;
pdf.setFontSize(10);
pdf.setFont(undefined, "bold");
const subjectLabel = "Subject: ";
pdf.text(subjectLabel, margin + 4, yPosition);
const subjectLabelWidth = pdf.getTextWidth(subjectLabel);
pdf.setFont(undefined, "normal");
pdf.text(
subjectText,
margin + 4 + subjectLabelWidth,
yPosition
);
yPosition += 2;

yPosition += 5;

pdf.text("Dear Sir,", margin + 4, yPosition);
yPosition += 4;
const intro = `As per our discussion, we are pleased to quote our most competitive rates as follows:`;
const introLines = pdf.splitTextToSize(intro, pageWidth - 2 * margin - 8);
introLines.forEach((line) => {
checkNewPage(6);
pdf.text(line, margin + 4, yPosition);
yPosition += 4;
});

yPosition += 0.5;

const itemImages = await Promise.all(
activeQuotationData.items.map(async (item) => {
const specImage =
item.spec_image ||
item.Spec_Image ||
item.SPECIMAGE ||
item.spec_img ||
item.image ||
item.Item_Image ||
item.product_image ||
item.img ||
item.specification_image ||
item.specification?.spec_image ||
item.product_details?.image ||
item.product_details?.spec_image;
const imgUrl = resolveProductImage(specImage);
if (!imgUrl) return null;
return await getBase64ImageFromURL(imgUrl);
})
);

const tableData = [];
const rowImageMap = {};

activeQuotationData.items.forEach((item, idx) => {
const rowIndex = tableData.length;
if (itemImages[idx]) {
rowImageMap[rowIndex] = itemImages[idx];
}

const subProductName = item.sub_product || item.subProduct || "";

const cleanDesc =
normalizeDescription(item.desc, "single")[0] || "-";


const fullDesc = subProductName
? `${subProductName}\n${cleanDesc}`
: cleanDesc;

tableData.push([
String(idx + 1),
fullDesc,
item.unit || "-",
item.qty || "-",
parseFloat(item.rate || 0).toLocaleString("en-IN", {
minimumFractionDigits: 2,
}),
parseFloat(item.amt || 0).toLocaleString("en-IN", {
minimumFractionDigits: 2,
}),
]);

if (item.inst_rate > 0) {
tableData.push([
"*",
"installation",
item.inst_unit || "-",
item.inst_qty || "-",
parseFloat(item.inst_rate || 0).toLocaleString("en-IN", {
minimumFractionDigits: 2,
}),
parseFloat(item.inst_amt || 0).toLocaleString("en-IN", {
minimumFractionDigits: 2,
}),
]);
}
});

const COL = {
unit: 15,
qty: 12,
rate: 15,
amount: 20,
};

autoTable(pdf, {
startY: yPosition,
head: [["S.No", "Description", "Unit", "Qty", "Rate", "Amount"]],
body: tableData,
theme: "grid",
tableWidth: pageWidth - 2 * margin,
columnStyles: {
0: { halign: "center", cellWidth: 12 },
1: { cellWidth: 128 },
2: { halign: "center", cellWidth: 15 },
3: { halign: "center", cellWidth: 12 },
4: { halign: "center", cellWidth: 15 },
5: { halign: "center", cellWidth: 20 },
},
styles: {
fontSize: 8,
cellPadding: 2,
overflow: "linebreak",
lineWidth: 0.1,
lineColor: [0, 0, 0],
valign: "top",
textColor: [0, 0, 0],
},
headStyles: {
fillColor: [0, 123, 255],
textColor: [255, 255, 255],
fontStyle: "bold",
fontSize: 9,
halign: "center",
lineWidth: 0.1,
lineColor: [0, 0, 0],
},
didParseCell: (data) => {
if (data.section === "body" && data.column.index === 1 && tableData[data.row.index]) {
const descText = tableData[data.row.index][1];
if (descText && descText.length > 100) {
data.cell.styles.minCellHeight = 20;
}
}
if (data.section === "body" && data.column.index === 1 && tableData[data.row.index]) {
const itemDesc = tableData[data.row.index][1];
if (itemDesc && itemDesc.includes('\n')) { // Fixed: changed descText to itemDesc
// Check if this has a subproduct (contains newline)
// You might need custom rendering here
}
if (itemDesc === "Installation") {
data.cell.styles.fontStyle = "italic";
}
}
},
didDrawCell: (data) => {
if (
data.section === "body" &&
data.column.index === 1 &&
rowImageMap[data.row.index]
) {
if (!data.row.imagePosition) {
data.row.imagePosition = {
y: data.cell.y,
height: data.cell.height,
page: pdf.getCurrentPageInfo().pageNumber
};
}
}
},
didDrawPage: (data) => {
drawHeader();
drawFooter();
const currentPage = pdf.getCurrentPageInfo().pageNumber;
data.table.body.forEach((row, rowIndex) => {
if (row.imagePosition && row.imagePosition.page === currentPage && rowImageMap[rowIndex]) {
const imgData = rowImageMap[rowIndex];
if (!imgData) return;
const cellY = row.imagePosition.y;
const cellHeight = row.imagePosition.height;
const tableEndX = pageWidth - margin;
const imgWidth = 45;
const imgHeight = imgWidth * 0.75;
const imgX = tableEndX - imgWidth - 5;
const imgY = cellY + (cellHeight - imgHeight) / 2;
pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth, imgHeight);
}
});
drawBorder(
margin,
headerHeight,
pageWidth - 2 * margin,
pageHeight - headerHeight - footerHeight
);
},
margin: {
top: margin + headerHeight + 4,
bottom: footerHeight + FOOTER_BOTTOM_MARGIN + pageNumberHeight - AUTO_TABLE_BOTTOM_GAP,
left: margin,
right: margin,
}
});

yPosition = pdf.lastAutoTable.finalY;

const basicAmount =
activeQuotationData?.items?.reduce((sum, item) => {
return (
sum +
parseFloat(item.amt || 0) +
parseFloat(item.inst_amt || 0)
);
}, 0) || 0;
const gst = basicAmount * 0.18;
const grandTotal = basicAmount + gst;

checkNewPage(15);
const totalsWidth =
COL.unit + COL.qty + COL.rate + COL.amount;
const totalsX =
pageWidth -
margin -
totalsWidth;
const leftBoxWidth = COL.unit + COL.qty;
const rightBoxWidth = COL.rate + COL.amount;
const totalsHeight = 8;

pdf.setFillColor(0, 123, 255);
pdf.rect(totalsX, yPosition, leftBoxWidth, totalsHeight, "F");
pdf.rect(totalsX + leftBoxWidth, yPosition, rightBoxWidth, totalsHeight, "F");
pdf.rect(totalsX, yPosition + totalsHeight, leftBoxWidth, totalsHeight, "F");
pdf.rect(totalsX + leftBoxWidth, yPosition + totalsHeight, rightBoxWidth, totalsHeight, "F");
pdf.rect(totalsX, yPosition + totalsHeight * 2, leftBoxWidth, totalsHeight, "F");
pdf.rect(totalsX + leftBoxWidth, yPosition + totalsHeight * 2, rightBoxWidth, totalsHeight, "F");

pdf.setLineWidth(0.1);
pdf.rect(totalsX, yPosition, totalsWidth, totalsHeight * 3);

pdf.line(
totalsX + leftBoxWidth,
yPosition,
totalsX + leftBoxWidth,
yPosition + totalsHeight * 3
);

pdf.line(
totalsX,
yPosition + totalsHeight,
totalsX + totalsWidth,
yPosition + totalsHeight
);

pdf.line(
totalsX,
yPosition + totalsHeight * 2,
totalsX + totalsWidth,
yPosition + totalsHeight * 2
);

pdf.setFont(undefined, "bold");
pdf.setFontSize(9);
pdf.setTextColor(255, 255, 255);
pdf.text("Total Amount", totalsX + 4, yPosition + 5.5);
pdf.text(
`Rs ${basicAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
totalsX + totalsWidth - 4,
yPosition + 5.5,
{ align: "right" }
);
pdf.text("GST @18%", totalsX + 4, yPosition + totalsHeight + 5.5);
pdf.text(
`Rs ${gst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
totalsX + totalsWidth - 4,
yPosition + totalsHeight + 5.5,
{ align: "right" }
);
pdf.text("Grand Total", totalsX + 4, yPosition + totalsHeight * 2 + 5.5);
pdf.text(
`Rs ${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
totalsX + totalsWidth - 4,
yPosition + totalsHeight * 2 + 5.5,
{ align: "right" }
);

pdf.setTextColor(0, 0, 0);
yPosition += totalsHeight * 3;

pdf.setLineWidth(0.1);
pdf.line(margin, yPosition, pageWidth - margin, yPosition);

yPosition += 5;

pdf.setFontSize(11);
pdf.setFont(undefined, "bold");
pdf.text("Commercial Terms:", margin + 6, yPosition);
const termHeadingWidth = pdf.getTextWidth("Commercial Terms:");
pdf.line(
margin + 6,
yPosition + 1.5,
margin + 6 + termHeadingWidth,
yPosition + 1.5
);
yPosition += 5;

// NEW TERMS RENDERING CODE - FIXED VERSION
pdf.setFontSize(9);
pdf.setFont(undefined, "normal");
const NUMBER_COL_X = margin + 10;
const TEXT_COL_X = margin + 16;

let termsHtml = activeQuotationData?.terms || "<div>No terms specified</div>";

// Parse HTML into paragraph elements
const tempDiv = document.createElement('div');
tempDiv.innerHTML = termsHtml
.replace(/<div[^>]*>/gi, '<p>')
.replace(/<\/div>/gi, '</p>')
.replace(/<p>\s*<\/p>/gi, '');

const termElements = Array.from(tempDiv.children);
let termIndex = 1;

termElements.forEach((element) => {
const textContent = element.textContent.trim();
if (!textContent) return;

const isNLFSentence = /For NLF Solutions Pvt Ltd/i.test(textContent);
if (isNLFSentence) return;

const isHopeSentence = /Hope you will find our offer most competitive and in order/i.test(textContent);
const isRed = /MS\/Aluminium|MS Aluminium|MS\/Aluminium substructure/i.test(textContent);

// Clean up the HTML
let cleanHTML = element.innerHTML
.replace(/^\d+[\.\)]\s*/, '') // Remove existing numbering
.replace(/^•\s*/, '') // Remove bullets
.trim();

if (isHopeSentence) {
cleanHTML = cleanHTML
.replace(/^•\s*/, '')
.replace(/^\d+\.\s*/, '');

pdf.setTextColor(0, 0, 0);
pdf.setFont(undefined, "bold");

// Draw number for Hope sentence
pdf.text(`${termIndex}.`, NUMBER_COL_X, yPosition, { align: "right" });
termIndex++;

// Parse HTML segments
const segments = parseHTMLToTextSegments(`<p>${cleanHTML}</p>`);
const textStartX = TEXT_COL_X;
const maxWidth = pageWidth - textStartX - margin;

// Render each segment with its style
let currentLine = '';
let currentX = textStartX;

segments.forEach((segment, segIdx) => {
pdf.setFont(undefined, segment.style === 'bold' ? 'bold' : segment.style === 'italic' ? 'italic' : 'normal');

const words = segment.text.split(' ');
words.forEach((word) => {
const wordWithSpace = word + ' ';
const wordWidth = pdf.getTextWidth(wordWithSpace);

if (currentX + wordWidth > pageWidth - margin && currentX > textStartX) {
// Move to next line
yPosition += 2.6;
checkNewPage(8);
currentX = textStartX;
}

pdf.text(word, currentX, yPosition);
currentX += wordWidth;
});
});

yPosition += 3.6;
return;
}

// Regular terms with formatting
if (isRed) {
pdf.setTextColor(210, 47, 47);
} else {
pdf.setTextColor(0, 0, 0);
}

// Draw the number
pdf.setFont(undefined, isRed ? 'bold' : 'normal');
pdf.text(`${termIndex}.`, NUMBER_COL_X, yPosition, { align: "right" });
termIndex++;

// Parse HTML segments
const segments = parseHTMLToTextSegments(`<p>${cleanHTML}</p>`);
const maxWidth = pageWidth - TEXT_COL_X - margin;

// Render text with formatting
let currentX = TEXT_COL_X;
const lineStartX = TEXT_COL_X;

segments.forEach((segment) => {
// Determine font style: if red term, force bold, otherwise use segment style
const fontStyle = isRed ? 'bold' : (segment.style === 'bold' ? 'bold' : segment.style === 'italic' ? 'italic' : 'normal');
pdf.setFont(undefined, fontStyle);

const words = segment.text.split(' ');
words.forEach((word) => {
const wordWithSpace = word + ' ';
const wordWidth = pdf.getTextWidth(wordWithSpace);

// Check if we need a new line
if (currentX + wordWidth > pageWidth - margin && currentX > lineStartX) {
yPosition += 2.6;
checkNewPage(6);
currentX = lineStartX;
}

pdf.text(word, currentX, yPosition);
currentX += wordWidth;
});
});

yPosition += 3.6;
});

// ✅ Closing sentence (same style as "Dear Sir")
// const closingSentence =
// "Hope you will find our offer most competitive and in order.";

// ✅ Closing sentence with horizontal line ABOVE it
const closingSentence =
"Hope you will find our offer most competitive and in order.";

checkNewPage(10);

// 🔹 DRAW HORIZONTAL LINE ABOVE
pdf.setLineWidth(0.5);
pdf.line(margin, yPosition, pageWidth - margin, yPosition);
yPosition += 5;

pdf.setFont(undefined, "bold");
pdf.setFontSize(10);
pdf.setTextColor(0, 0, 0);

const closingLines = pdf.splitTextToSize(
  closingSentence,
  pageWidth - 2 * margin - 8
);

closingLines.forEach((line) => {
  pdf.text(line, margin + 4, yPosition);
  yPosition += 3.5;
});

yPosition += 2;


// pdf.setFont(undefined, "bold");
// pdf.setFontSize(10);
// pdf.setTextColor(0, 0, 0);

// checkNewPage(8);

// const closingLines = pdf.splitTextToSize(
// closingSentence,
// pageWidth - 2 * margin - 8
// );

// closingLines.forEach((line) => {
// pdf.text(line, margin + 4, yPosition);
// yPosition += 3.5;
// });

// yPosition += 2;

if (signatureImgData) {
const SIGNATURE_BLOCK_HEIGHT = 22;
const PAGE_BOTTOM_LIMIT =
pageHeight -
footerHeight -
FOOTER_BOTTOM_MARGIN -
4;

if (yPosition + SIGNATURE_BLOCK_HEIGHT > PAGE_BOTTOM_LIMIT) {
drawFooter();
pdf.addPage();
drawHeader();
drawBorder(
margin,
headerHeight,
pageWidth - 2 * margin,
pageHeight - headerHeight - footerHeight
);
yPosition = margin + headerHeight + 6;
}

pdf.setLineWidth(0.5);
pdf.line(margin, yPosition, pageWidth - margin, yPosition);
yPosition += 3;

pdf.addImage(signatureImgData, "JPEG", margin + 5, yPosition, 40, 12);
yPosition += 14;

pdf.setFontSize(10);
pdf.setFont(undefined, "bold");
pdf.text("For NLF Solutions Pvt Ltd", margin + 5, yPosition);
yPosition += 3;

pdf.line(margin, yPosition, pageWidth - margin, yPosition);
}

pdf.setTextColor(0, 0, 0);
pdf.setFont(undefined, "normal");
drawFooter();
addPageNumbers();

const quoteNo = sanitizeFilePart(
activeQuotationData?.quote_no || activeQuotationData?.quote_id
);
const clientName = sanitizeFilePart(activeQuotationData?.name);
const project = sanitizeFilePart(activeQuotationData?.project);
const firstItem = activeQuotationData?.items?.[0] || {};
const brand = sanitizeFilePart(
firstItem.brand ||
firstItem.product_brand ||
activeQuotationData?.brand
);
const product = sanitizeFilePart(
firstItem.product ||
firstItem.product_name ||
firstItem.desc
);
const fileName = `${quoteNo}-${clientName}-${project}-${brand}-${product}.pdf`;

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
  
  // Fix: Include both item amounts and installation amounts in the basic amount
  const basicAmount = activeQuotationData.items.reduce((sum, item) => {
    const itemTotal = parseFloat(item.amt || 0);
    const installationTotal = parseFloat(item.inst_amt || 0);
    return sum + itemTotal + installationTotal;
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

const th = {
border: "1px solid #000",

fontWeight: "bold",
};
const td = { border: "1px solid #000", padding: "6px" };
const blueLeft = {
border: "1px solid #000",
padding: "4px 6px",
background: "#007bff",
color: "white",
width: "61%",
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

const renderTermsForPreview = () => {
let termsHtml = activeQuotationData?.terms || "<div>No terms specified</div>";

// Clean up the HTML while preserving formatting tags
let processedHtml = termsHtml
.replace(/<div[^>]*>/gi, '<p>')
.replace(/<\/div>/gi, '</p>')
.replace(/<p>\s*<\/p>/gi, '') // Remove empty paragraphs
.trim();

// Create a temporary div to parse HTML
const tempDiv = document.createElement('div');
tempDiv.innerHTML = processedHtml;

// Get all paragraph-level elements
const elements = Array.from(tempDiv.children);

const beforeLine = [];
const afterLine = [];
let termIndex = 1;
let hopeSentenceFound = false;

elements.forEach((element, idx) => {
const textContent = element.textContent.trim();
if (!textContent) return;

// Check for special sentences
const isNLFSentence = /For NLF Solutions Pvt Ltd/i.test(textContent);
if (isNLFSentence) return;

const isHopeSentence = /Hope you will find our offer most competitive and in order/i.test(textContent);
const isRed = /MS\/Aluminium|MS Aluminium|MS\/Aluminium substructure/i.test(textContent);

// Get the inner HTML and clean it up
let innerHTML = element.innerHTML
.replace(/^\d+[\.\)]\s*/, '') // Remove existing numbering
.replace(/^•\s*/, '') // Remove bullets
.trim();

if (isHopeSentence) {
afterLine.push(
<div
key={`hope-line-${idx}`}
style={{
fontWeight: "bold",
margin: "10px 0 8px 0",
fontSize: "10.5px",
lineHeight: "1.6",
}}
dangerouslySetInnerHTML={{ __html: innerHTML }}
/>
);
hopeSentenceFound = true;
return;
}

// Style for regular terms
const styleProps = {
marginBottom: 0,
color: isRed ? "red" : "black",
fontWeight: isRed ? "bold" : "normal",
fontSize: "10.5px",
lineHeight: "1.6",
};

beforeLine.push(
<div key={`term-${idx}`} style={styleProps}>
<span style={{ marginRight: "6px", fontWeight: 500 }}>
{termIndex}.
</span>
<span dangerouslySetInnerHTML={{ __html: innerHTML }} />
</div>
);
termIndex++;
});

// Add fallback hope sentence if not found
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

// Add signature if applicable
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
padding: "3px 0"
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

return { beforeLine, afterLine, hasSeparator: false };
};

const { beforeLine, afterLine, hasSeparator } = renderTermsForPreview();

const defaultSubject = `Quotation for ${
activeQuotationData?.items?.[0]?.product || "Products"
}`;


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
<>
<div
ref={pdfContentRef}
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

<h3
style={{
textAlign: "center",
margin: "0",
fontWeight: "bold",
}}
>
QUOTATION
</h3>

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
{activeQuotationData?.quote_no ||
activeQuotationData?.quote_id}
</strong>
</div>
<div>
<strong>Date:</strong>{" "}
{formatDateDDMMYYYY(activeQuotationData?.date)}
</div>
</div>

<div className="quote-header">
<div><strong>To,</strong></div>
<div>{activeQuotationData?.name || "-"}</div>
<div>{activeQuotationData?.city || "-"}</div>
{activeQuotationData?.project && (
<div><strong>Project:</strong> {activeQuotationData.project}</div>
)}
{kindAttention && kindAttention.trim() && (
<>
<div className="mt-1"><strong>Kind Attention:</strong> {kindAttention.trim()}</div>
</>
)}
<div className="mt-1">
<strong>Subject:</strong> {subjectLine && subjectLine.trim() ? subjectLine.trim() : defaultSubject}
</div>
</div>

<p style={{ marginBottom: "15px", marginTop: "25px" }}>
<strong>Dear Sir,</strong>
<br />
<strong>
As per our discussion, we are pleased to quote our most
competitive rates as follows:
</strong>
</p>

{activeQuotationData?.items &&
activeQuotationData.items.length > 0 && (
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
<th style={{ ...th, verticalAlign: "top" }}>Description</th>
<th style={th}>Unit</th>
<th style={{ ...th, verticalAlign: "top" }}>
Qty
</th>
<th style={{ ...th, verticalAlign: "top" }}>
Rate
</th>
<th style={{ ...th, verticalAlign: "top" }}>
Amount
</th>
</tr>
</thead>
<tbody>
{activeQuotationData.items.map((item, idx) => (
<React.Fragment key={idx}>
<tr>
<td style={{...td,
verticalAlign: "top"}}>{idx + 1}</td>
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
{item.desc || "-"}
{(() => {
const specImage =
item.spec_image ||
item.Spec_Image ||
item.SPECIMAGE ||
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
<td style={{ ...td, verticalAlign: "top" }}>
{item.qty || "-"}
</td>
<td style={{ ...td, verticalAlign: "top" }}>
{parseFloat(item.rate || 0).toLocaleString(
"en-IN",
{
minimumFractionDigits: 2,
}
)}
</td>
<td style={{ ...td, verticalAlign: "top" }}>
{parseFloat(item.amt || 0).toLocaleString(
"en-IN",
{
minimumFractionDigits: 2,
}
)}
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

<div
style={{
float: "right",
width: "35%",
}}
>
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


{hasSeparator && (
<div
style={{
borderTop: "1px solid black",
margin: "10px 0",
}}
/>
)}
</div>

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
{showRateApproval && (
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

{!rateApprovalSuccess && (
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
)}
</div>
)}


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

export default PDFRatePreview;