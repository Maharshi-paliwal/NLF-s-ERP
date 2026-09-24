// src/forms/NewQuotation.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
Container,
Row,
Col,
Card,
Form,
Button,
Spinner,
Alert,
} from "react-bootstrap";
import { FaPlus, FaMinus, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// Custom styles for dropdown arrows
const selectStyles = `
.custom-select-dropdown {
-webkit-appearance: none;
-moz-appearance: none;
appearance: none;
background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
background-repeat: no-repeat;
background-position: right 0.75rem center;
background-size: 16px 12px;
padding-right: 2.5rem !important;
}
.custom-select-dropdown::-ms-expand {
display: none;
}
.custom-select-dropdown:disabled {
background-color: #e9ecef;
opacity: 1;
}
`;
// 1️⃣ Lazy Load CKEditor
const LazyCKEditor = lazy(() =>
import("@ckeditor/ckeditor5-react").then((module) => ({
default: module.CKEditor,
}))
);
// Standard Terms & Conditions
// Standard Terms & Conditions
const standardTerms = `
<div class="nlf-terms-wrapper" style="font-family: Arial,Helvetica,sans-serif; font-size:12px; line-height:1.2; color:#111;">
<div style="border:2px solid #000; padding:10px 12px; margin-bottom:8px;">
<div style="margin-left:6px;">
<div>1. GST @18% extra</div>
<div>2. <strong>Payment Terms:</strong></div>
<div style="margin-left:16px;">Supply Terms: 10% advance payment against readiness of material before dispatch.</div>
<div style="margin-left:16px;">Installation Terms: 80% on installation of material, 10% after handover on a pro-rata basis, 5% as retention to be released after 12 months against submission of a Bank Guarantee.</div>
<div>3. Transportation charges are included in the above rate.</div>
<div style="color:#d32f2f; font-weight:700;">4. The above rates does not include any MS/Aluminium substructure required.</div>
<div>5. Safe storage for the material to be provided by you at site with a locked room.</div>
<div>6. Providing & fixing of scaffolding shall be in your scope. In case scaffolding material is provided, labour charges will be applicable at ₹100/- per sqm.</div>
<div>7. All specifications of each product shall be approved by AAI before execution of the works.</div>
<div>8. Mode of Measurement: Measurements will be considered based on the surface area.</div>
<div>9. Suitable accommodation for site Engineer & hutment for labour to be provided by the client along with lodging & boarding.</div>
<div>10. Validity of Quotation: 30 days.</div>
</div>
</div>
</div>
`;

// Helper functions
const stripNoSuffix = (quote) => {
if (!quote) return "";
return quote.replace(/-No$/i, "");
};
const capitalizeWords = (str) => {
if (!str) return str;
return str.replace(/\b\w/g, (char) => char.toUpperCase());
};
const formatTwoDecimal = (val) => {
if (val === "" || val === null || val === undefined) return "";
return parseFloat(val).toFixed(2);
};
const formatQuoteNumber = (quoteNo) => {
if (quoteNo && quoteNo.includes("NLF-")) {
return quoteNo;
}
const currentYear = new Date().getFullYear().toString().substring(2);
const nextYear = (parseInt(currentYear) + 1).toString().padStart(2, "0");
return `NLF-${currentYear}-${nextYear}-Q-${quoteNo}`;
};
// ✅ FIXED: Extract base quote number from formatted quote_no (e.g., "NLF-26-27-Q-02-R1" -> "NLF-26-27-Q-02")
const extractBaseQuoteNumber = (quoteNo) => {
if (!quoteNo) return "";
// Remove revision suffix (e.g., "-R1", "-R2", etc.)
return quoteNo.replace(/-R\d+$/i, "");
};
const fetchNextQuoteNumber = async () => {
try {
const response = await axios.get(
"https://nlfs.in/erp/index.php/Erp/get_next_quote_no"
);
if (response.data.status && response.data.next_quote_no) {
const quoteNo = response.data.next_quote_no;
return formatQuoteNumber(quoteNo);
}
throw new Error("Failed to get next quote number");
} catch (error) {
console.error("Error fetching next quote number:", error);
const year = new Date().getFullYear().toString().substring(2);
const nextYear = (parseInt(year) + 1).toString().padStart(2, "0");
const randomId = Math.floor(Math.random() * 1000);
return `NLF-${year}-${nextYear}-Q-${randomId}`;
}
};
const calculateTotals = (
itemGroups,
secondCarItems,
secondCarAdditionalDetails
) => {
const totalItemAmount = itemGroups.reduce((acc, group) => {
const itemAmt =
parseFloat(group.amount) ||
(parseFloat(group.quantity) || 0) * (parseFloat(group.rate) || 0);
const instAmt =
parseFloat(group.installationAmount) ||
(parseFloat(group.installationQuantity) || 0) *
(parseFloat(group.installationRate) || 0);
return acc + itemAmt + instAmt;
}, 0);
const totalSecondCar = [...secondCarItems, ...secondCarAdditionalDetails].reduce(
(acc, item) =>
acc +
(parseFloat(item.amount) ||
(parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)),
0
);
const subtotal = totalItemAmount + totalSecondCar;
const gst = subtotal * 0.18;
const grandTotal = subtotal + gst;
return {
basicAmount: totalItemAmount + totalSecondCar,
gst,
grandTotal,
};
};
const initialFormState = {
quotationId: "",
quotationNo: "",
date: "",
customerName: "",
customerCity: "",
project: "",
officeBranch: "",
employeeId: "",
employeeGender: "",
employeeDesignation: "",
quoteType: "direct",
kind_attention: "",
subject: "",
assigned_by: "",
role: "",
termsAndConditions: standardTerms,
itemGroups: [
{
id: `group-${Date.now()}`,
quote_id: "",
description: "",
unit: "",
quantity: "",
rate: "",
amount: "",
product: "",
productId: "",
brand: "",
brandId: "",
subProduct: "",
subProductId: "",
installationDescription: "",
installationUnit: "",
installationQuantity: "",
installationRate: "",
installationAmount: "",
},
],
commercialTerms: {
gst: "GST 18% as actual",
paymentTerms:
"Payment 50% advance with formal work order and 50% on readiness of material before dispatch.",
transportationCharges: "Transportation charges Extra.",
unloading: "Unloading of material at clients end.",
msAluminiumExclusion:
"The above rates does not include any MS/Aluminum substructure required.",
safeStorage:
"Safe storage for material to be provided by you at site with a locked room.",
scaffolding: "Providing & Fixing of Scaffolding should be at your end.",
modeOfMeasurement: "Mode of Measurement: Measurements shall be wall to wall.",
localTransportation:
"Local transportation, loading & unloading of material from one area to another area on site at your end.",
accommodation:
"Suitable accommodation for site Engineer & hutment for labor to be provided by client along with lodging & boarding.",
validity: "Validity of Quotation: 30 days.",
closing: "Hope you will find our offer most competitive and in order.",
},
secondCarItems: [
{
id: `sc-item-${Date.now() + 1}`,
description: "",
unit: "",
quantity: "",
rate: "",
amount: "",
product: "",
},
],
secondCarAdditionalDetails: [
{
id: `sc-addl-${Date.now() + 2}`,
description: "",
unit: "",
quantity: "",
rate: "",
amount: "",
},
],
revise: "",
isApproved: false,
};
// 2️⃣ Memoized Item Group Component
const QuotationItemGroup = React.memo(function QuotationItemGroup({
group,
masterItems,
unitList,
isFullyEditable,
isEditMode,
onChange,
onRemove,
}) {
const brandOptions = useMemo(() => {
if (!masterItems?.length) return [];
const set = new Set();
masterItems.forEach((item) => {
if (item.brand) set.add(item.brand);
});
return Array.from(set);
}, [masterItems]);
const productOptions = useMemo(() => {
const selectedBrand = group.brandId || group.brand || "";
const set = new Set();
masterItems.forEach((item) => {
if (
(!selectedBrand || item.brand === selectedBrand) &&
item.g3_category &&
item.g3_category.trim() !== ""
) {
set.add(item.g3_category);
}
});
return Array.from(set);
}, [masterItems, group.brandId, group.brand]);
const subProductOptions = useMemo(() => {
const selectedBrand = group.brandId || group.brand || "";
const selectedProduct = group.productId || group.product || "";
const filtered = masterItems.filter((item) => {
const matchesBrand = !selectedBrand || item.brand === selectedBrand;
const matchesProduct = !selectedProduct || item.g3_category === selectedProduct;
return matchesBrand && matchesProduct;
});
const seen = new Set();
const result = [];
filtered.forEach((item) => {
const key = String(item.id);
if (!seen.has(key)) {
seen.add(key);
result.push(item);
}
});
return result;
}, [masterItems, group.brandId, group.brand, group.productId, group.product]);
return (
<div className="border rounded p-3 mb-4">
<Row className="align-items-start mb-3">
<Col md="2">
<Form.Group>
<Form.Label>
Brand<span style={{ color: "red" }}>*</span>
</Form.Label>
<Form.Control
as="select"
value={group.brandId || ""}
onChange={(e) => onChange(group.id, "brandId", e.target.value)}
disabled={!isFullyEditable}
required
className="custom-select-dropdown"
>
<option value="">Select Brand</option>
{brandOptions.map((b) => (
<option key={b} value={b}>
{b}
</option>
))}
</Form.Control>
</Form.Group>
</Col>
<Col md="2">
<Form.Group>
<Form.Label>
Product<span style={{ color: "red" }}>*</span>
</Form.Label>
<Form.Control
as="select"
value={group.productId || ""}
onChange={(e) => onChange(group.id, "productId", e.target.value)}
disabled={!isFullyEditable || !group.brandId}
required
className="custom-select-dropdown"
>
<option value="">Select Product</option>
{productOptions.map((p) => (
<option key={p} value={p}>
{p}
</option>
))}
</Form.Control>
</Form.Group>
</Col>
<Col md="2">
<Form.Group>
<Form.Label>
Sub Product<span style={{ color: "red" }}>*</span>
</Form.Label>
<Form.Control
as="select"
value={group.subProductId || ""}
onChange={(e) => onChange(group.id, "subProductId", e.target.value)}
disabled={!isFullyEditable || !group.productId}
required
className="custom-select-dropdown"
>
<option value="">Select Sub Product</option>
{subProductOptions.map((sp) => (
<option key={sp.id} value={sp.id}>
{sp.item_name}
</option>
))}
</Form.Control>
</Form.Group>
</Col>
<Col md="6">
<Form.Group>
<Form.Label>
Description<span style={{ color: "red" }}>*</span>
</Form.Label>
<Form.Control
as="textarea"
rows={4}
value={group.description}
onChange={(e) => onChange(group.id, "description", e.target.value)}
readOnly={!isFullyEditable}
required
/>
</Form.Group>
</Col>
</Row>
<Row className="mb-3">
<Col md="3">
<Form.Group>
<Form.Label>
Unit<span style={{ color: "red" }}>*</span>
</Form.Label>
<Form.Control
as="select"
value={group.unit}
onChange={(e) => onChange(group.id, "unit", e.target.value)}
disabled={!isFullyEditable}
required
className="custom-select-dropdown"
>
<option value="">Select Unit</option>
{unitList.map((unit) => (
<option key={unit.unit_id} value={unit.unit}>
{unit.unit}
</option>
))}
</Form.Control>
</Form.Group>
</Col>
<Col md="3">
<Form.Group>
<Form.Label>
Quantity<span style={{ color: "red" }}>*</span>
</Form.Label>
<Form.Control
type="number"
step="0.01"
value={group.quantity}
onChange={(e) => onChange(group.id, "quantity", e.target.value)}
readOnly={!isFullyEditable}
required
/>
</Form.Group>
</Col>
<Col md="3">
<Form.Group>
<Form.Label>
Rate<span style={{ color: "red" }}>*</span>
{isEditMode && <span style={{ color: "green" }}></span>}
</Form.Label>
<Form.Control
type="number"
step="0.01"
value={group.rate}
onChange={(e) => onChange(group.id, "rate", e.target.value)}
readOnly={!isFullyEditable}
required
style={isEditMode ? { borderColor: "#28a745", borderWidth: "2px" } : {}}
/>
</Form.Group>
</Col>
<Col md="3">
<Form.Group>
<Form.Label>
Amount<span style={{ color: "red" }}>*</span>
</Form.Label>
<Form.Control
type="number"
step="0.01"
value={group.amount || 0}
readOnly
required
style={isEditMode ? { borderColor: "#28a745", borderWidth: "2px" } : {}}
/>
</Form.Group>
</Col>
</Row>
<Row className="mt-3 pt-3 border-top">
<Col md="12">
<Card.Title className="mb-4">Installation</Card.Title>
</Col>
<Col md="3">
<Form.Group>
<Form.Label>Unit</Form.Label>
<Form.Control
as="select"
value={group.installationUnit}
onChange={(e) => onChange(group.id, "installationUnit", e.target.value)}
disabled={!isFullyEditable}
className="custom-select-dropdown"
>
<option value="">Select Unit</option>
{unitList.map((unit) => (
<option key={unit.unit_id} value={unit.unit}>
{unit.unit}
</option>
))}
</Form.Control>
</Form.Group>
</Col>
<Col md="3">
<Form.Group>
<Form.Label>Quantity</Form.Label>
<Form.Control
type="number"
step="0.01"
value={group.installationQuantity}
onChange={(e) => onChange(group.id, "installationQuantity", e.target.value)}
readOnly={!isFullyEditable}
/>
</Form.Group>
</Col>
<Col md="3">
<Form.Group>
<Form.Label>Rate</Form.Label>
<Form.Control
type="number"
step="0.01"
value={group.installationRate}
onChange={(e) => onChange(group.id, "installationRate", e.target.value)}
readOnly={!isFullyEditable}
style={isEditMode ? { borderColor: "#28a745", borderWidth: "2px" } : {}}
/>
</Form.Group>
</Col>
<Col md="3">
<Form.Group>
<Form.Label>Amount</Form.Label>
<Form.Control
type="number"
step="0.01"
value={group.installationAmount || 0}
readOnly
style={isEditMode ? { borderColor: "#28a745", borderWidth: "2px" } : {}}
/>
</Form.Group>
</Col>
</Row>
<Row className="mt-3">
<Col>
{isFullyEditable && onRemove && (
<Button variant="danger" size="sm" onClick={() => onRemove(group.id)}>
<FaMinus />
</Button>
)}
</Col>
</Row>
</div>
);
});
export default function NewQuotation() {
const { quotationId } = useParams();
const navigate = useNavigate();
const location = useLocation();
const searchParams = new URLSearchParams(location.search);
const editorRef = useRef(null);
const [masterItems, setMasterItems] = useState([]);
const [quotationList, setQuotationList] = useState([]);
const [isInitialLoading, setIsInitialLoading] = useState(true);
const [error, setError] = useState(null);
const [characterCount, setCharacterCount] = useState(0);
const MAX_CHARACTER_LIMIT = 2000;
// Inject custom styles
useEffect(() => {
const styleElement = document.createElement('style');
styleElement.textContent = selectStyles;
document.head.appendChild(styleElement);
return () => {
if (document.head.contains(styleElement)) {
document.head.removeChild(styleElement);
}
};
}, []);
const modeDetection = useMemo(() => {
const path = location.pathname;
const isEditMode =
path.includes("/edit") || path.includes("/update-quotation");
const isViewMode = path.includes("/view");
const isNewQuotation = !quotationId;
const isViewOnly = searchParams.get("view") === "true";
const isNewRevision = path.includes("/quotations") && path.endsWith("/edit");
return {
isEditMode,
isViewMode,
isNewQuotation,
isViewOnly,
isFullyEditable: (isNewQuotation || isEditMode) && !isViewOnly,
isNewRevision,
};
}, [location.pathname, location.search, quotationId]);
const { isEditMode, isViewMode, isNewQuotation, isViewOnly, isFullyEditable, isNewRevision } = modeDetection;
const [formData, setFormData] = useState(initialFormState);
const [unitList, setUnitList] = useState([]);
const [branchList, setBranchList] = useState([]);
const [employeeList, setEmployeeList] = useState([]);
const [isSubmitting, setIsSubmitting] = useState(false);
const [editorData, setEditorData] = useState(standardTerms);
const [editorError, setEditorError] = useState(false);
const [baseQuoteId, setBaseQuoteId] = useState("");
const [isRateApproved, setIsRateApproved] = useState(false);
const [showHeavySections, setShowHeavySections] = useState(false);
const totals = useMemo(() => {
return calculateTotals(
formData.itemGroups,
formData.secondCarItems,
formData.secondCarAdditionalDetails
);
}, [formData.itemGroups, formData.secondCarItems, formData.secondCarAdditionalDetails]);
const formattedTotals = useMemo(() => ({
basic: totals.basicAmount.toLocaleString("en-IN", {
minimumFractionDigits: 2,
maximumFractionDigits: 2,
}),
gst: totals.gst.toLocaleString("en-IN", {
minimumFractionDigits: 2,
maximumFractionDigits: 2,
}),
grand: totals.grandTotal.toLocaleString("en-IN", {
minimumFractionDigits: 2,
maximumFractionDigits: 2,
}),
}), [totals]);
const handleMainFormChange = useCallback((e) => {
if (!isFullyEditable) return;
const { name, value } = e.target;
let processedValue = value;
if (
name === "customerName" ||
name === "customerCity" ||
name === "project"
) {
processedValue = capitalizeWords(value);
}
setFormData((prev) => ({ ...prev, [name]: processedValue }));
}, [isFullyEditable]);
// Handle Employee Selection
const handleEmployeeChange = useCallback((empId) => {
if (!isFullyEditable) return;
const emp = employeeList.find(
(e) => String(e.emp_id) === String(empId)
);
setFormData((prev) => ({
...prev,
employeeId: empId || "",
assigned_by: emp?.name || "",
role: emp?.role || "",
employeeGender: emp?.gender || ""
}));
}, [employeeList, isFullyEditable]);
const handleItemChange = useCallback(
(groupId, field, value) => {
if (!isFullyEditable) return;
setFormData((prev) => {
const updatedGroups = prev.itemGroups.map((group) => {
if (group.id !== groupId) return group;
const newItem = { ...group, [field]: value };
if (field === "brandId") {
newItem.brandId = value;
newItem.brand = value;
newItem.product = "";
newItem.productId = "";
newItem.subProduct = "";
newItem.subProductId = "";
newItem.description = "";
newItem.unit = "";
newItem.installationUnit = "";
newItem.rate = "";
newItem.amount = "";
newItem.installationAmount = "";
}
if (field === "productId") {
newItem.productId = value;
newItem.product = value;
newItem.subProduct = "";
newItem.subProductId = "";
newItem.description = "";
newItem.unit = "";
newItem.installationUnit = "";
newItem.rate = "";
newItem.amount = "";
newItem.installationAmount = "";
}
if (field === "subProductId") {
const selectedRow = masterItems.find((m) => String(m.id) === String(value));
if (selectedRow) {
newItem.subProduct = selectedRow.item_name || selectedRow.g4_sub_category || newItem.subProduct;
newItem.description = selectedRow.specification || newItem.description;
if (!newItem.unit) newItem.unit = selectedRow.uom || "";
if (!newItem.installationUnit) newItem.installationUnit = selectedRow.uom || "";
if (selectedRow.rate !== undefined && selectedRow.rate !== null && selectedRow.rate !== "") {
newItem.rate = formatTwoDecimal(selectedRow.rate);
}
}
}
if (field === "quantity" || field === "rate") {
const q = parseFloat(field === "quantity" ? value : newItem.quantity) || 0;
const r = parseFloat(field === "rate" ? value : newItem.rate) || 0;
newItem.amount = (q * r).toFixed(2);
}
if (field === "unit") {
newItem.installationUnit = value || newItem.installationUnit;
}
if (field === "quantity") {
newItem.installationQuantity = value;
const instRate = parseFloat(newItem.installationRate) || 0;
const instQty = parseFloat(value) || 0;
newItem.installationAmount = (instQty * instRate).toFixed(2);
}
if (field === "installationQuantity" || field === "installationRate") {
const q = parseFloat(newItem.installationQuantity) || 0;
const r = parseFloat(newItem.installationRate) || 0;
newItem.installationAmount = (q * r).toFixed(2);
}
return newItem;
});
return { ...prev, itemGroups: updatedGroups };
});
},
[isFullyEditable, masterItems]
);
const handleRateBlur = useCallback((groupId, field) => {
setFormData((prev) => {
const updatedGroups = prev.itemGroups.map((group) => {
if (group.id !== groupId) return group;
const formattedVal = formatTwoDecimal(group[field]);
if (field === "rate") {
const q = parseFloat(group.quantity) || 0;
const r = parseFloat(formattedVal) || 0;
return { ...group, [field]: formattedVal, amount: (q * r).toFixed(2) };
}
if (field === "installationRate") {
const q = parseFloat(group.installationQuantity) || 0;
const r = parseFloat(formattedVal) || 0;
return { ...group, [field]: formattedVal, installationAmount: (q * r).toFixed(2) };
}
return { ...group, [field]: formattedVal };
});
return { ...prev, itemGroups: updatedGroups };
});
}, []);
const handleAddItemGroup = useCallback(() => {
if (!isFullyEditable) return;
setFormData((prev) => ({
...prev,
itemGroups: [
...prev.itemGroups,
{
id: `group-${Date.now()}`,
quote_id: "",
description: "",
unit: "",
quantity: "",
rate: "",
amount: "",
product: "",
productId: "",
brand: "",
brandId: "",
subProduct: "",
subProductId: "",
installationDescription: "",
installationUnit: "",
installationQuantity: "",
installationRate: "",
installationAmount: "",
},
],
}));
}, [isFullyEditable]);
const handleRemoveItemGroup = useCallback((groupId) => {
if (!isFullyEditable) return;
setFormData((prev) => ({
...prev,
itemGroups: prev.itemGroups.filter((g) => g.id !== groupId),
}));
}, [isFullyEditable]);
const handleCommercialTermsChange = useCallback((e) => {
if (!isFullyEditable) return;
const { name, value } = e.target;
setFormData((prev) => ({
...prev,
commercialTerms: { ...prev.commercialTerms, [name]: value },
}));
}, [isFullyEditable]);
// Updated useEffect: include employee_list
useEffect(() => {
let isMounted = true;
const initializeData = async () => {
try {
setError(null);
const [masterRes, unitRes, branchRes, employeeRes, listRes] = await Promise.all([
axios.get("https://nlfs.in/erp/index.php/Api/list_mst_sub_product"),
axios.get("https://nlfs.in/erp/index.php/Erp/unit_list"),
axios.get("https://nlfs.in/erp/index.php/Erp/branch_list"),
axios.get("https://nlfs.in/erp/index.php/Erp/employee_list"),
axios.get("https://nlfs.in/erp/index.php/Nlf_Erp/list_quotation"),
]);
const masterData = masterRes.data;
const statusTrue = masterData.status === "true" || masterData.status === true;
const successTrue = masterData.success === "1" || masterData.success === 1;
if (statusTrue && successTrue && masterData.data) {
if (isMounted) setMasterItems(masterData.data);
} else {
throw new Error("Failed to load product master list.");
}
if (branchRes.data.status === "true" && branchRes.data.data) {
if (isMounted) setBranchList(branchRes.data.data);
}
if (unitRes.data.status === "true" && unitRes.data.data) {
if (isMounted) setUnitList(unitRes.data.data);
}
// Handle Employee List - CORRECTED for API Response Structure
if (
employeeRes.data &&
employeeRes.data.status === true &&
employeeRes.data.success === "1" &&
Array.isArray(employeeRes.data.data)
) {
if (isMounted) setEmployeeList(employeeRes.data.data);
} else {
console.warn("Employee list format unexpected or failed:", employeeRes.data);
if (isMounted) setEmployeeList([]);
}
if (
listRes.data &&
listRes.data.status === "true" &&
listRes.data.success === "1" &&
Array.isArray(listRes.data.data)
) {
if (isMounted) setQuotationList(listRes.data.data);
} else {
console.warn("Quotation list format unexpected or failed:", listRes.data);
if (isMounted) setQuotationList([]);
}
if (isNewQuotation) {
const nextQ = await fetchNextQuoteNumber();
if (isMounted) {
const cleanQuoteNumber = stripNoSuffix(nextQ);
setBaseQuoteId(cleanQuoteNumber);
setFormData((prev) => ({
...prev,
quotationId: cleanQuoteNumber,
quotationNo: cleanQuoteNumber,
date: new Date().toISOString().split("T")[0],
}));
}
} else if ((isEditMode || isViewMode || isViewOnly) && quotationId) {
const response = await axios.post(
"https://nlfs.in/erp/index.php/Nlf_Erp/get_quotation_by_id",
{ quote_id: String(quotationId) },
{ headers: { "Content-Type": "application/json" } }
);
const isSuccess = response.data.status === true || response.data.status === "true";
if (isMounted && isSuccess && response.data.data) {
const mainQuotationData = response.data.data;
const itemsArray = mainQuotationData.items || [];
const rateApproved = ["yes", "Yes", 1, "1", true].includes(mainQuotationData.rate_approval);
setIsRateApproved(rateApproved);
const itemGroups = itemsArray.map((item, index) => {
const masterMatch = masterData.data.find((m) => {
const prodMatch = m.g3_category === item.product || m.item_name === item.product;
const subMatch = m.item_name === item.sub_product || m.g4_sub_category === item.sub_product;
return prodMatch && subMatch;
});
const brandName = masterMatch?.brand || "";
const productName = item.product || masterMatch?.g3_category || "";
const subProductName = item.sub_product || masterMatch?.item_name || "";
return {
id: `group-${Date.now()}-${index}`,
quote_id: mainQuotationData.quote_id,
description: item.desc || masterMatch?.specification || "",
unit: item.unit || masterMatch?.uom || "",
quantity: item.qty || "",
rate: formatTwoDecimal(item.rate || masterMatch?.rate || ""),
amount: item.amt || "",
product: productName,
productId: productName,
brand: brandName,
brandId: brandName,
subProduct: subProductName,
subProductId: masterMatch ? String(masterMatch.id) : "",
installationDescription: "",
installationUnit: item.inst_unit || item.unit || masterMatch?.uom || "",
installationQuantity: item.inst_qty || item.qty || "",
installationRate: formatTwoDecimal(item.inst_rate || ""),
installationAmount: item.inst_amt || "",
};
});

// ✅ FIXED: Use quote_no instead of quote_id to extract base quote number
const quoteNo = mainQuotationData.quote_no || "";
const baseId = extractBaseQuoteNumber(quoteNo);
const cleanBaseId = stripNoSuffix(baseId);

const matchedEmployee = employeeList.find(
  e => e.name === mainQuotationData.assigned_by
);

if (isMounted) {
setBaseQuoteId(cleanBaseId);
setFormData((prevState) => {
const newState = {
quotationId: mainQuotationData.quote_id,
quotationNo: cleanBaseId,
date: mainQuotationData.date || new Date().toISOString().split("T")[0],
customerName: mainQuotationData.name || "",
customerCity: mainQuotationData.city || "",
project: mainQuotationData.project || "",
officeBranch: mainQuotationData.branch || "",
// employeeId: mainQuotationData.emp || mainQuotationData.employee_id || "",
// assigned_by: mainQuotationData.assigned_by || "",


employeeId: matchedEmployee?.emp_id || "",
assigned_by: mainQuotationData.assigned_by || "",

role: mainQuotationData.role || "",
quoteType: mainQuotationData.quote_type || "direct",
termsAndConditions: mainQuotationData.terms || standardTerms,
itemGroups: itemGroups.length ? itemGroups : initialFormState.itemGroups,
kind_attention: mainQuotationData.kind_attention || "",
subject: mainQuotationData.subject || "",
commercialTerms: initialFormState.commercialTerms,
secondCarItems: initialFormState.secondCarItems,
secondCarAdditionalDetails: initialFormState.secondCarAdditionalDetails,
revise: mainQuotationData.revise || "",
isApproved: mainQuotationData.status === "approved" || mainQuotationData.admin_approval === "Yes",
};

if (isNewRevision) {
// ✅ FIXED: Find existing revisions for this base quote number
const baseNo = cleanBaseId;
// Filter quotations that start with baseNo + "-R" pattern
const revisions = quotationList
.filter((q) => q.quote_no && q.quote_no.startsWith(`${baseNo}-R`))
.map((q) => {
const match = q.quote_no.match(/-R(\d+)$/i);
return match ? parseInt(match[1], 10) : 0;
})
.filter(num => num > 0); // Only valid revision numbers

const maxRev = revisions.length > 0 ? Math.max(...revisions) : 0;
const nextRev = `R${maxRev + 1}`;

return { ...newState, revise: nextRev, isApproved: false };
}
return newState;
});
setEditorData(mainQuotationData.terms || standardTerms);
}
} else {
throw new Error("Quotation not found.");
}
}
} catch (err) {
console.error("Initialization error:", err);
if (isMounted) setError(err.message || "Failed to load data.");
} finally {
if (isMounted) setIsInitialLoading(false);
}
};
initializeData();
return () => {
isMounted = false;
};
}, [quotationId, isEditMode, isViewMode, isViewOnly, isNewQuotation, isNewRevision]);
useEffect(() => {
const timeoutId = setTimeout(() => {
setShowHeavySections(true);
}, 100);
return () => clearTimeout(timeoutId);
}, []);
useEffect(() => {
if (isEditMode && isRateApproved && baseQuoteId && formData.revise) {
const quotationNo = `${stripNoSuffix(baseQuoteId)}-${formData.revise}`;
setFormData((prev) => {
if (prev.quotationNo !== quotationNo) return { ...prev, quotationNo: quotationNo };
return prev;
});
} else if (isNewQuotation && baseQuoteId) {
setFormData((prev) => {
const cleanBaseId = stripNoSuffix(baseQuoteId);
if (prev.quotationNo !== cleanBaseId) return { ...prev, quotationNo: cleanBaseId };
return prev;
});
}
}, [baseQuoteId, formData.revise, isEditMode, isNewQuotation, isRateApproved]);
const handleSecondCarItemChange = useCallback((itemId, field, value, section) => {
if (!isFullyEditable) return;
setFormData((prev) => {
const updatedSection = prev[section].map((item) => {
if (item.id === itemId) {
const newItem = { ...item, [field]: value };
if (field === "quantity" || field === "rate") {
const quantity = parseFloat(newItem.quantity) || 0;
const rate = parseFloat(newItem.rate) || 0;
newItem.amount = (quantity * rate).toFixed(2);
}
return newItem;
}
return item;
});
return { ...prev, [section]: updatedSection };
});
}, [isFullyEditable]);
const handleAddSecondCarItem = useCallback((section) => {
if (!isFullyEditable) return;
const newItem = {
id: `${section}-${Date.now()}`,
description: "",
unit: "",
quantity: "",
rate: "",
amount: "",
...(section === "secondCarItems" ? { product: "" } : {}),
};
setFormData((prev) => ({ ...prev, [section]: [...prev[section], newItem] }));
}, [isFullyEditable]);
const handleRemoveSecondCarItem = useCallback((itemId, section) => {
if (!isFullyEditable) return;
setFormData((prev) => ({
...prev,
[section]: prev[section].filter((item) => item.id !== itemId),
}));
}, [isFullyEditable]);
const getFilledItemGroups = (itemGroups) => {
return itemGroups.filter((group) => {
const hasProduct = group.product && group.product.trim() !== "";
const hasQuantity = group.quantity && parseFloat(group.quantity) > 0;
const hasRate = group.rate && parseFloat(group.rate) > 0;
const hasUnit = group.unit && group.unit.trim() !== "";
return hasProduct && hasQuantity && hasRate && hasUnit;
});
};
const buildItemsArray = (groups) => {
const calculateAmount = (qty, rate) => {
const quantity = parseFloat(qty) || 0;
const rateVal = parseFloat(rate) || 0;
return (quantity * rateVal).toFixed(2);
};
return groups.map((group) => {
const itemAmount = group.amount || calculateAmount(group.quantity, group.rate);
const instAmount = group.installationAmount || calculateAmount(group.installationQuantity, group.installationRate);
return {
brand: group.brand || "",
product: group.product,
sub_product: group.subProduct || "",
desc: group.description || "",
unit: group.unit,
qty: group.quantity,
rate: formatTwoDecimal(group.rate),
amt: itemAmount,
inst_unit: group.installationUnit || group.unit,
inst_qty: group.installationQuantity || "0",
inst_rate: formatTwoDecimal(group.installationRate),
inst_amt: instAmount,
total: (parseFloat(itemAmount) + parseFloat(instAmount)).toFixed(2),
};
});
};
const handleSubmit = async (e) => {
e.preventDefault();
try {
setIsSubmitting(true);
const apiUrl = "https://nlfs.in/erp/index.php/Nlf_Erp/add_quotation";
const filledItemGroups = getFilledItemGroups(formData.itemGroups);
if (filledItemGroups.length === 0) {
alert(
"Please complete at least one item with:\n- Brand & Product selection\n- Unit\n- Quantity (greater than 0)\n- Rate (greater than 0)"
);
setIsSubmitting(false);
return;
}
const itemsArray = buildItemsArray(filledItemGroups);
// Include employeeId in payload
let quotationData = {
quote_no: formData.quotationId,
name: formData.customerName,
date: formData.date,
city: formData.customerCity,
project: formData.project,
branch: formData.officeBranch,
emp: formData.employeeId,
assigned_by: formData.assigned_by,
role: formData.role,
revise: "",
status: "draft",
admin_approval: "No",
terms: editorData,
total: totals.grandTotal.toFixed(2),
items: itemsArray,
commercialTerms: formData.commercialTerms,
kind_attention: formData.kind_attention ?? "",
subject: formData.subject ?? "",
};
if (isEditMode) {
if (!isRateApproved) {
const quoteNo = formData.quotationNo || baseQuoteId || formData.quotationId || "";
quotationData = {
...quotationData,
quote_id: quotationId || baseQuoteId,
quote_no: quoteNo,
revise: "",
status: "draft",
admin_approval: "No",
};
} else {
if (!formData.revise || formData.revise === "") {
alert("Please select a revision number before saving.");
setIsSubmitting(false);
return;
}
const isValidRevision = /^R\d+$/i.test(formData.revise);
const quoteNo = isValidRevision ? `${baseQuoteId}-${formData.revise}` : baseQuoteId;
quotationData = {
...quotationData,
quote_id: quotationId || baseQuoteId,
quote_no: quoteNo,
revise: formData.revise,
status: formData.isApproved ? "approved" : "revise",
admin_approval: formData.isApproved ? "Yes" : "No",
};
}
}
if (isNewRevision) {
quotationData.quote_id = "";
quotationData.status = "revise";
quotationData.admin_approval = "No";
quotationData.rate_approval = "No";
quotationData.quote_no = `${baseQuoteId}-${formData.revise}`;
quotationData.revise = formData.revise;
}
const response = await axios.post(apiUrl, quotationData, {
headers: { "Content-Type": "application/json" },
});
const isSuccess = [true, "true", 1, "1"].includes(response.data.status || response.data.success);
if (isSuccess) {
alert(`Saved! Quote No: ${quotationData.quote_no}`);
setTimeout(() => navigate("/clients", { replace: true }), 100);
}
} catch (error) {
console.error("Error submitting quotation:", error);
alert(`Error: ${error.response?.data?.message || error.message || "Try again."}`);
} finally {
setIsSubmitting(false);
}
};
const handleCancel = () => navigate("/clients");
let pageTitle = "New Quotation";
if (isEditMode) pageTitle = isViewOnly ? "View Quotation" : "Edit Quotation";
else if (isViewOnly) pageTitle = "View Quotation";
if (isNewRevision) pageTitle = "Add New Revision";
if (isInitialLoading) {
return (
<Container fluid className="my-4 text-center">
<Spinner animation="border" role="status" style={{ color: "#ed3131" }}>
<span className="visually-hidden">Loading...</span>
</Spinner>
<p className="mt-3">Preparing Quotation Form...</p>
</Container>
);
}
if (error) {
return (
<Container fluid className="my-4">
<Alert variant="danger">
<Alert.Heading>Error</Alert.Heading>
<p>{error}</p>
<Button variant="primary" onClick={() => navigate("/clients")}>
Back to Clients
</Button>
</Alert>
</Container>
);
}
return (
<Container fluid className="my-4">
<Link to="/clients">
<Button className="mb-3 btn btn-primary" style={{ backgroundColor: "rgb(237, 49, 49)", border: "none" }}>
<FaArrowLeft />
</Button>
</Link>
<Form onSubmit={handleSubmit}>
<Card className="mb-4">
<Card.Body>
<Form.Group>
<Form.Label className="fw-bold">Quote Type</Form.Label>
<div className="d-flex gap-4 mt-2">
<Form.Check
type="radio"
label="Lead"
name="quoteType"
value="lead"
checked={formData.quoteType === "lead"}
onChange={handleMainFormChange}
disabled={!isFullyEditable}
/>
<Form.Check
type="radio"
label="New"
name="quoteType"
value="direct"
checked={formData.quoteType === "direct"}
onChange={handleMainFormChange}
disabled={!isFullyEditable}
/>
</div>
</Form.Group>
</Card.Body>
</Card>
<Row>
<Col md="12">
<Card className="mb-4">
<Card.Header>
<Card.Title as="h4">{pageTitle}</Card.Title>
</Card.Header>
<Card.Body>
<Row>
<Col md="6">
<Form.Group className="mb-3">
<Form.Label>Quote No.</Form.Label>
<Form.Control type="text" value={stripNoSuffix(baseQuoteId || formData.quotationId)} readOnly />
</Form.Group>
</Col>

<Col md="6">
<Form.Group className="mb-3">
<Form.Label>Date</Form.Label>
<Form.Control
type="date"
name="date"
value={formData.date}
onChange={handleMainFormChange}
readOnly={!isFullyEditable}
/>
</Form.Group>
</Col>
</Row>
<Row>
<Col md="6">
<Form.Group className="mb-3">
<Form.Label>
Client Name<span style={{ color: "red" }}>*</span>
</Form.Label>
<Form.Control
type="text"
name="customerName"
value={formData.customerName}
onChange={handleMainFormChange}
readOnly={!isFullyEditable}
required
style={{ textTransform: "capitalize" }}
/>
</Form.Group>
</Col>
<Col md="6">
<Form.Group className="mb-3">
<Form.Label>
City<span style={{ color: "red" }}>*</span>
</Form.Label>
<Form.Control
type="text"
name="customerCity"
value={formData.customerCity}
onChange={handleMainFormChange}
readOnly={!isFullyEditable}
required
style={{ textTransform: "capitalize" }}
/>
</Form.Group>
</Col>
</Row>
<Row>
<Col md="6">
<Form.Group className="mb-3">
<Form.Label>
Project Name<span style={{ color: "red" }}>*</span>
</Form.Label>
<Form.Control
type="text"
name="project"
value={formData.project}
onChange={handleMainFormChange}
readOnly={!isFullyEditable}
required
style={{ textTransform: "capitalize" }}
/>
</Form.Group>
</Col>
<Col md="6">
<Form.Group className="mb-3">
<Form.Label>
Branch<span style={{ color: "red" }}>*</span>
</Form.Label>
<Form.Control
as="select"
name="officeBranch"
value={formData.officeBranch}
onChange={handleMainFormChange}
disabled={!isFullyEditable}
required
className="custom-select-dropdown"
>
<option value="">Select Branch</option>
{branchList.map((branch) => (
<option key={branch.id} value={branch.branch_name}>
{branch.branch_name}
</option>
))}
</Form.Control>
</Form.Group>
</Col>
</Row>
{/* Employee Section */}
{isFullyEditable && (
<Row>
<Col md="6">
<Form.Group className="mb-3">
<Form.Label>Assigned By </Form.Label>
<Form.Control
as="select"
value={formData.employeeId}
onChange={(e) => handleEmployeeChange(e.target.value)}
className="custom-select-dropdown"
>
<option value="">Please Select</option>
{/* ✅ Static options */}
<option value="direct">Direct</option>
<option value="main">Main</option>
{/* Divider (optional but recommended for clarity) */}
{/* ✅ API-driven employees (unchanged) */}
{employeeList.map((emp) => (
<option key={emp.emp_id} value={emp.emp_id}>
{emp.name}
</option>
))}
</Form.Control>
</Form.Group>
</Col>
</Row>
)}
<Row>
<Col md="6">
<Form.Group className="mb-3">
<Form.Label>Kind Attention</Form.Label>
<Form.Control
type="text"
name="kind_attention"
value={formData.kind_attention}
onChange={handleMainFormChange}
readOnly={!isFullyEditable}
style={{ textTransform: "capitalize" }}
/>
</Form.Group>
</Col>
<Col md="6">
<Form.Group className="mb-3">
<Form.Label>Subject <span style={{ color: "red" }}>*</span></Form.Label>
<Form.Control
type="text"
name="subject"
required
value={formData.subject}
onChange={handleMainFormChange}
readOnly={!isFullyEditable}
style={{ textTransform: "capitalize" }}
/>
</Form.Group>
</Col>
</Row>
</Card.Body>
</Card>
</Col>
<Col md="12">
<Card className="mb-4">
<Card.Header>
<Card.Title as="h4">Quotation Items</Card.Title>
</Card.Header>
<Card.Body>
{formData.itemGroups.map((group) => (
<QuotationItemGroup
key={group.id}
group={group}
masterItems={masterItems}
unitList={unitList}
isFullyEditable={isFullyEditable}
isEditMode={isEditMode}
onChange={handleItemChange}
onRemove={formData.itemGroups.length > 1 ? handleRemoveItemGroup : null}
/>
))}
{isFullyEditable && (
<div className="d-flex justify-content-start">
<Button variant="primary" size="sm" onClick={handleAddItemGroup}>
<FaPlus /> Add Item
</Button>
</div>
)}
</Card.Body>
</Card>
</Col>
<Col md="3" className="ms-auto">
<Card className="mb-4">
<Card.Body>
<div className="mb-2">
<strong className="me-2">Basic Amount:</strong>
<span>₹{formattedTotals.basic}</span>
</div>
<div className=" mb-2">
<strong className="me-2">GST (18%):</strong>
<span>₹{formattedTotals.gst}</span>
</div>
<div className="d-flex justify-content-start">
<h4 className="me-2">Total:</h4>
<h6 className="mt-1">₹{formattedTotals.grand}</h6>
</div>
</Card.Body>
</Card>
</Col>
{showHeavySections && (
<>
<Col md="12">
<Card className="mb-4">
<Card.Header>
<Card.Title as="h4">Terms & Conditions</Card.Title>
</Card.Header>
<Card.Body>
<div className="mb-2">
<small className={characterCount > MAX_CHARACTER_LIMIT ? "text-danger" : "text-muted"}>
Characters: {characterCount} / {MAX_CHARACTER_LIMIT}
</small>
</div>
<Suspense fallback={<Spinner animation="border" size="sm" />}>
<LazyCKEditor
editor={ClassicEditor}
data={editorData}
onReady={(editor) => {
editorRef.current = editor;
setCharacterCount(editor.getData().length);
}}
onChange={(event, editor) => {
const data = editor.getData();
setEditorData(data);
setCharacterCount(data.length);
setEditorError(data.length > MAX_CHARACTER_LIMIT);
}}
disabled={!isFullyEditable}
/>
</Suspense>
{editorError && (
<p className="text-danger mt-2">
Warning: Terms content exceeds the maximum character limit ({MAX_CHARACTER_LIMIT}). This may
result in truncation when saving.
</p>
)}
</Card.Body>
</Card>
</Col>
</>
)}
<Col md="12">
<div className="d-flex justify-content-end mt-5 gap-3">
{!isViewOnly && (
<Button
className="btn"
type="submit"
disabled={isSubmitting}
style={{ backgroundColor: "#ed3131", border: "none", height: "40px" }}
>
{isSubmitting ? (
<>
<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
{isEditMode ? "Updating..." : "Saving..."}
</>
) : isEditMode ? (
isRateApproved ? "Save Revision" : "Update Quotation"
) : (
"Save Quotation"
)}
</Button>
)}
<Button
className="btn me-2"
type="button"
onClick={handleCancel}
disabled={isSubmitting}
style={{ backgroundColor: "#adb5bd", border: "none", height: "40px" }}
>
Cancel
</Button>
</div>
</Col>
</Row>
</Form>
</Container>
);
}