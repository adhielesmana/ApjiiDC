(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/admin/all-orders/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminAllOrdersPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$card$2f$dist$2f$chunk$2d$QNLCCAKT$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__card_default__as__Card$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroui/card/dist/chunk-QNLCCAKT.mjs [app-client] (ecmascript) <export card_default as Card>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$card$2f$dist$2f$chunk$2d$SAEUDNWW$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__card_body_default__as__CardBody$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroui/card/dist/chunk-SAEUDNWW.mjs [app-client] (ecmascript) <export card_body_default as CardBody>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$button$2f$dist$2f$chunk$2d$KCYYJJH4$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__button_default__as__Button$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroui/button/dist/chunk-KCYYJJH4.mjs [app-client] (ecmascript) <export button_default as Button>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$chip$2f$dist$2f$chunk$2d$EIRINNCE$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__chip_default__as__Chip$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroui/chip/dist/chunk-EIRINNCE.mjs [app-client] (ecmascript) <export chip_default as Chip>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$pagination$2f$dist$2f$chunk$2d$NL7EUJG2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__pagination_default__as__Pagination$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroui/pagination/dist/chunk-NL7EUJG2.mjs [app-client] (ecmascript) <export pagination_default as Pagination>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$select$2f$dist$2f$chunk$2d$C3QHEOC2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__select_default__as__Select$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroui/select/dist/chunk-C3QHEOC2.mjs [app-client] (ecmascript) <export select_default as Select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$select$2f$node_modules$2f40$heroui$2f$listbox$2f$dist$2f$chunk$2d$BJFJ4DRR$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__listbox_item_base_default__as__SelectItem$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroui/select/node_modules/@heroui/listbox/dist/chunk-BJFJ4DRR.mjs [app-client] (ecmascript) <export listbox_item_base_default as SelectItem>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$toast$2f$dist$2f$chunk$2d$ZPZBECKL$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@heroui/toast/dist/chunk-ZPZBECKL.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$skeleton$2f$dist$2f$chunk$2d$P7ACKWSP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__skeleton_default__as__Skeleton$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroui/skeleton/dist/chunk-P7ACKWSP.mjs [app-client] (ecmascript) <export skeleton_default as Skeleton>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$tabs$2f$dist$2f$chunk$2d$RRHVXFLZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__tabs_default__as__Tabs$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroui/tabs/dist/chunk-RRHVXFLZ.mjs [app-client] (ecmascript) <export tabs_default as Tabs>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$tabs$2f$dist$2f$chunk$2d$ML27DD5T$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__tab_item_base_default__as__Tab$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroui/tabs/dist/chunk-ML27DD5T.mjs [app-client] (ecmascript) <export tab_item_base_default as Tab>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$input$2f$dist$2f$chunk$2d$SQIAVXJX$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__input_default__as__Input$3e$__ = __turbopack_context__.i("[project]/node_modules/@heroui/input/dist/chunk-SQIAVXJX.mjs [app-client] (ecmascript) <export input_default as Input>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$layout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/admin/layout.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
function AdminAllOrdersPage() {
    _s();
    const { ppn } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$admin$2f$layout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdminSettingsContext"]);
    const [orders, setOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [filteredOrders, setFilteredOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [currentFilter, setCurrentFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [totalOrders, setTotalOrders] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // Pagination states
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [rowsPerPage, setRowsPerPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(10);
    const fetchOrders = async ()=>{
        try {
            setLoading(true);
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("/api/rent/global-list");
            if (response.data.status === "ok") {
                setOrders(response.data.data || []);
                setFilteredOrders(response.data.data || []);
                setTotalOrders(response.data.count || 0);
            } else {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$toast$2f$dist$2f$chunk$2d$ZPZBECKL$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addToast"])({
                    title: "Error",
                    color: "danger",
                    description: response.data.message || "Failed to fetch orders"
                });
            }
        } catch (error) {
            var _error_response_data, _error_response;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$toast$2f$dist$2f$chunk$2d$ZPZBECKL$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addToast"])({
                title: "Error",
                color: "danger",
                description: ((_error_response = error.response) === null || _error_response === void 0 ? void 0 : (_error_response_data = _error_response.data) === null || _error_response_data === void 0 ? void 0 : _error_response_data.message) || "Failed to fetch orders"
            });
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminAllOrdersPage.useEffect": ()=>{
            fetchOrders();
        }
    }["AdminAllOrdersPage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminAllOrdersPage.useEffect": ()=>{
            if (currentFilter === "all") {
                const filtered = searchQuery ? orders.filter({
                    "AdminAllOrdersPage.useEffect": (order)=>{
                        var _order_space_name, _order_space, _order_space_description, _order_space1, _order_provider_name, _order_provider, _order_by_fullName, _order_by, _order_by_email, _order_by1;
                        return ((_order_space = order.space) === null || _order_space === void 0 ? void 0 : (_order_space_name = _order_space.name) === null || _order_space_name === void 0 ? void 0 : _order_space_name.toLowerCase().includes(searchQuery.toLowerCase())) || ((_order_space1 = order.space) === null || _order_space1 === void 0 ? void 0 : (_order_space_description = _order_space1.description) === null || _order_space_description === void 0 ? void 0 : _order_space_description.toLowerCase().includes(searchQuery.toLowerCase())) || ((_order_provider = order.provider) === null || _order_provider === void 0 ? void 0 : (_order_provider_name = _order_provider.name) === null || _order_provider_name === void 0 ? void 0 : _order_provider_name.toLowerCase().includes(searchQuery.toLowerCase())) || ((_order_by = order.by) === null || _order_by === void 0 ? void 0 : (_order_by_fullName = _order_by.fullName) === null || _order_by_fullName === void 0 ? void 0 : _order_by_fullName.toLowerCase().includes(searchQuery.toLowerCase())) || ((_order_by1 = order.by) === null || _order_by1 === void 0 ? void 0 : (_order_by_email = _order_by1.email) === null || _order_by_email === void 0 ? void 0 : _order_by_email.toLowerCase().includes(searchQuery.toLowerCase()));
                    }
                }["AdminAllOrdersPage.useEffect"]) : orders;
                setFilteredOrders(filtered);
            } else {
                const filtered = orders.filter({
                    "AdminAllOrdersPage.useEffect.filtered": (order)=>order.status === currentFilter
                }["AdminAllOrdersPage.useEffect.filtered"]);
                setFilteredOrders(searchQuery ? filtered.filter({
                    "AdminAllOrdersPage.useEffect": (order)=>{
                        var _order_space_name, _order_space, _order_space_description, _order_space1, _order_provider_name, _order_provider, _order_by_fullName, _order_by, _order_by_email, _order_by1;
                        return ((_order_space = order.space) === null || _order_space === void 0 ? void 0 : (_order_space_name = _order_space.name) === null || _order_space_name === void 0 ? void 0 : _order_space_name.toLowerCase().includes(searchQuery.toLowerCase())) || ((_order_space1 = order.space) === null || _order_space1 === void 0 ? void 0 : (_order_space_description = _order_space1.description) === null || _order_space_description === void 0 ? void 0 : _order_space_description.toLowerCase().includes(searchQuery.toLowerCase())) || ((_order_provider = order.provider) === null || _order_provider === void 0 ? void 0 : (_order_provider_name = _order_provider.name) === null || _order_provider_name === void 0 ? void 0 : _order_provider_name.toLowerCase().includes(searchQuery.toLowerCase())) || ((_order_by = order.by) === null || _order_by === void 0 ? void 0 : (_order_by_fullName = _order_by.fullName) === null || _order_by_fullName === void 0 ? void 0 : _order_by_fullName.toLowerCase().includes(searchQuery.toLowerCase())) || ((_order_by1 = order.by) === null || _order_by1 === void 0 ? void 0 : (_order_by_email = _order_by1.email) === null || _order_by_email === void 0 ? void 0 : _order_by_email.toLowerCase().includes(searchQuery.toLowerCase()));
                    }
                }["AdminAllOrdersPage.useEffect"]) : filtered);
            }
        }
    }["AdminAllOrdersPage.useEffect"], [
        currentFilter,
        orders,
        searchQuery
    ]);
    const getStatusColor = (status)=>{
        switch(status.toLowerCase()){
            case "provisioned":
                return "primary";
            case "active":
                return "success";
            case "pending":
                return "warning";
            case "suspend":
                return "danger";
            case "dismantle":
                return "default";
            default:
                return "default";
        }
    };
    const formatDate = (dateString)=>{
        return new Date(dateString).toLocaleString();
    };
    const statusCounts = {
        all: orders.length,
        pending: orders.filter((order)=>order.status === "pending").length,
        provisioned: orders.filter((order)=>order.status === "provisioned").length,
        active: orders.filter((order)=>order.status === "active").length,
        suspend: orders.filter((order)=>order.status === "suspend").length,
        dismantle: orders.filter((order)=>order.status === "dismantle").length
    };
    // Function to calculate price with PPN
    const calculatePriceWithPPN = (basePrice)=>{
        if (ppn === null) return basePrice;
        const taxAmount = basePrice * ppn / 100;
        return basePrice + taxAmount;
    };
    // Format price with tax details
    const formatPriceWithTax = (price)=>{
        const formattedPrice = new Intl.NumberFormat("id-ID").format(price);
        if (ppn === null) return "Rp ".concat(formattedPrice);
        const withTax = calculatePriceWithPPN(price);
        const formattedWithTax = new Intl.NumberFormat("id-ID").format(withTax);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-medium",
                    children: [
                        "Rp ",
                        formattedWithTax
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/all-orders/page.tsx",
                    lineNumber: 249,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-gray-500 block",
                    children: [
                        "(incl. ",
                        ppn,
                        "% tax)"
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/all-orders/page.tsx",
                    lineNumber: 250,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    };
    // Calculate paginated orders
    const paginatedOrders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AdminAllOrdersPage.useMemo[paginatedOrders]": ()=>{
            const startIndex = (page - 1) * rowsPerPage;
            const endIndex = startIndex + rowsPerPage;
            return filteredOrders.slice(startIndex, endIndex);
        }
    }["AdminAllOrdersPage.useMemo[paginatedOrders]"], [
        filteredOrders,
        page,
        rowsPerPage
    ]);
    // Reset to first page when filter changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AdminAllOrdersPage.useEffect": ()=>{
            setPage(1);
        }
    }["AdminAllOrdersPage.useEffect"], [
        currentFilter,
        searchQuery
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6 admin-container",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-lg overflow-hidden mb-8",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-8 py-10 text-white",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-bold mb-3",
                            children: "All Orders"
                        }, void 0, false, {
                            fileName: "[project]/app/admin/all-orders/page.tsx",
                            lineNumber: 272,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "opacity-90 max-w-2xl mb-6",
                            children: [
                                "View and manage all customer orders across different statuses. Filter orders by their current status.",
                                ppn !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ml-2 bg-white text-cyan-700 px-2 py-0.5 rounded-md text-sm font-medium",
                                    children: [
                                        "Current PPN rate: ",
                                        ppn,
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 277,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/admin/all-orders/page.tsx",
                            lineNumber: 273,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-3",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$button$2f$dist$2f$chunk$2d$KCYYJJH4$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__button_default__as__Button$3e$__["Button"], {
                                color: "default",
                                className: "bg-white text-cyan-700 font-medium px-6 py-3 rounded-xl hover:bg-cyan-50 flex items-center gap-2 shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]",
                                onPress: fetchOrders,
                                startContent: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    className: "h-5 w-5",
                                    viewBox: "0 0 20 20",
                                    fill: "currentColor",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        fillRule: "evenodd",
                                        d: "M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z",
                                        clipRule: "evenodd"
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                        lineNumber: 295,
                                        columnNumber: 19
                                    }, void 0)
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 289,
                                    columnNumber: 17
                                }, void 0),
                                children: "Refresh Orders"
                            }, void 0, false, {
                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                lineNumber: 284,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/admin/all-orders/page.tsx",
                            lineNumber: 283,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/all-orders/page.tsx",
                    lineNumber: 271,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/admin/all-orders/page.tsx",
                lineNumber: 270,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$tabs$2f$dist$2f$chunk$2d$RRHVXFLZ$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__tabs_default__as__Tabs$3e$__["Tabs"], {
                        "aria-label": "Order status",
                        selectedKey: currentFilter,
                        onSelectionChange: (key)=>setCurrentFilter(key),
                        color: "primary",
                        variant: "underlined",
                        classNames: {
                            tabList: "gap-6",
                            cursor: "w-full bg-cyan-500",
                            tab: "max-w-fit px-0 h-12"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$tabs$2f$dist$2f$chunk$2d$ML27DD5T$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__tab_item_base_default__as__Tab$3e$__["Tab"], {
                                title: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "All Orders"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 327,
                                            columnNumber: 17
                                        }, void 0),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$chip$2f$dist$2f$chunk$2d$EIRINNCE$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__chip_default__as__Chip$3e$__["Chip"], {
                                            size: "sm",
                                            variant: "flat",
                                            color: "default",
                                            children: statusCounts.all
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 328,
                                            columnNumber: 17
                                        }, void 0)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 326,
                                    columnNumber: 15
                                }, void 0)
                            }, "all", false, {
                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                lineNumber: 323,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$tabs$2f$dist$2f$chunk$2d$ML27DD5T$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__tab_item_base_default__as__Tab$3e$__["Tab"], {
                                title: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Pending"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 338,
                                            columnNumber: 17
                                        }, void 0),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$chip$2f$dist$2f$chunk$2d$EIRINNCE$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__chip_default__as__Chip$3e$__["Chip"], {
                                            size: "sm",
                                            variant: "flat",
                                            color: "warning",
                                            children: statusCounts.pending
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 339,
                                            columnNumber: 17
                                        }, void 0)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 337,
                                    columnNumber: 15
                                }, void 0)
                            }, "pending", false, {
                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                lineNumber: 334,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$tabs$2f$dist$2f$chunk$2d$ML27DD5T$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__tab_item_base_default__as__Tab$3e$__["Tab"], {
                                title: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Provisioned"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 349,
                                            columnNumber: 17
                                        }, void 0),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$chip$2f$dist$2f$chunk$2d$EIRINNCE$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__chip_default__as__Chip$3e$__["Chip"], {
                                            size: "sm",
                                            variant: "flat",
                                            color: "primary",
                                            children: statusCounts.provisioned
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 350,
                                            columnNumber: 17
                                        }, void 0)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 348,
                                    columnNumber: 15
                                }, void 0)
                            }, "provisioned", false, {
                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                lineNumber: 345,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$tabs$2f$dist$2f$chunk$2d$ML27DD5T$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__tab_item_base_default__as__Tab$3e$__["Tab"], {
                                title: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Active"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 360,
                                            columnNumber: 17
                                        }, void 0),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$chip$2f$dist$2f$chunk$2d$EIRINNCE$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__chip_default__as__Chip$3e$__["Chip"], {
                                            size: "sm",
                                            variant: "flat",
                                            color: "success",
                                            children: statusCounts.active
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 361,
                                            columnNumber: 17
                                        }, void 0)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 359,
                                    columnNumber: 15
                                }, void 0)
                            }, "active", false, {
                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                lineNumber: 356,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$tabs$2f$dist$2f$chunk$2d$ML27DD5T$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__tab_item_base_default__as__Tab$3e$__["Tab"], {
                                title: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Suspended"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 371,
                                            columnNumber: 17
                                        }, void 0),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$chip$2f$dist$2f$chunk$2d$EIRINNCE$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__chip_default__as__Chip$3e$__["Chip"], {
                                            size: "sm",
                                            variant: "flat",
                                            color: "danger",
                                            children: statusCounts.suspend
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 372,
                                            columnNumber: 17
                                        }, void 0)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 370,
                                    columnNumber: 15
                                }, void 0)
                            }, "suspend", false, {
                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                lineNumber: 367,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$tabs$2f$dist$2f$chunk$2d$ML27DD5T$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__tab_item_base_default__as__Tab$3e$__["Tab"], {
                                title: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Dismantled"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 382,
                                            columnNumber: 17
                                        }, void 0),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$chip$2f$dist$2f$chunk$2d$EIRINNCE$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__chip_default__as__Chip$3e$__["Chip"], {
                                            size: "sm",
                                            variant: "flat",
                                            color: "default",
                                            children: statusCounts.dismantle
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 383,
                                            columnNumber: 17
                                        }, void 0)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 381,
                                    columnNumber: 15
                                }, void 0)
                            }, "dismantle", false, {
                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                lineNumber: 378,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/admin/all-orders/page.tsx",
                        lineNumber: 311,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full md:max-w-xs",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$input$2f$dist$2f$chunk$2d$SQIAVXJX$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__input_default__as__Input$3e$__["Input"], {
                            placeholder: "Search orders...",
                            value: searchQuery,
                            onChange: (e)=>setSearchQuery(e.target.value),
                            isClearable: true,
                            onClear: ()=>setSearchQuery(""),
                            startContent: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                xmlns: "http://www.w3.org/2000/svg",
                                className: "h-5 w-5 text-gray-400",
                                fill: "none",
                                viewBox: "0 0 24 24",
                                stroke: "currentColor",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 406,
                                    columnNumber: 17
                                }, void 0)
                            }, void 0, false, {
                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                lineNumber: 399,
                                columnNumber: 15
                            }, void 0)
                        }, void 0, false, {
                            fileName: "[project]/app/admin/all-orders/page.tsx",
                            lineNumber: 392,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/admin/all-orders/page.tsx",
                        lineNumber: 391,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/all-orders/page.tsx",
                lineNumber: 310,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-6 max-w-full",
                children: loading ? // Skeleton loading state
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        ...Array(3)
                    ].map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$card$2f$dist$2f$chunk$2d$QNLCCAKT$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__card_default__as__Card$3e$__["Card"], {
                            className: "border-0 shadow-md rounded-xl overflow-hidden",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$card$2f$dist$2f$chunk$2d$SAEUDNWW$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__card_body_default__as__CardBody$3e$__["CardBody"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$skeleton$2f$dist$2f$chunk$2d$P7ACKWSP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__skeleton_default__as__Skeleton$3e$__["Skeleton"], {
                                        className: "h-6 w-1/3 rounded mb-4"
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                        lineNumber: 428,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$skeleton$2f$dist$2f$chunk$2d$P7ACKWSP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__skeleton_default__as__Skeleton$3e$__["Skeleton"], {
                                                        className: "h-4 w-3/4 rounded mb-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 431,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$skeleton$2f$dist$2f$chunk$2d$P7ACKWSP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__skeleton_default__as__Skeleton$3e$__["Skeleton"], {
                                                        className: "h-4 w-1/2 rounded"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 432,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                                lineNumber: 430,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$skeleton$2f$dist$2f$chunk$2d$P7ACKWSP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__skeleton_default__as__Skeleton$3e$__["Skeleton"], {
                                                        className: "h-4 w-3/4 rounded mb-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 435,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$skeleton$2f$dist$2f$chunk$2d$P7ACKWSP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__skeleton_default__as__Skeleton$3e$__["Skeleton"], {
                                                        className: "h-4 w-1/2 rounded"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 436,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                                lineNumber: 434,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$skeleton$2f$dist$2f$chunk$2d$P7ACKWSP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__skeleton_default__as__Skeleton$3e$__["Skeleton"], {
                                                        className: "h-4 w-3/4 rounded mb-2"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 439,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$skeleton$2f$dist$2f$chunk$2d$P7ACKWSP$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__skeleton_default__as__Skeleton$3e$__["Skeleton"], {
                                                        className: "h-4 w-1/2 rounded"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 440,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                                lineNumber: 438,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                        lineNumber: 429,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                lineNumber: 427,
                                columnNumber: 17
                            }, this)
                        }, i, false, {
                            fileName: "[project]/app/admin/all-orders/page.tsx",
                            lineNumber: 423,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/app/admin/all-orders/page.tsx",
                    lineNumber: 421,
                    columnNumber: 11
                }, this) : filteredOrders.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$card$2f$dist$2f$chunk$2d$QNLCCAKT$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__card_default__as__Card$3e$__["Card"], {
                    className: "border-0 shadow-md rounded-xl overflow-hidden",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$card$2f$dist$2f$chunk$2d$SAEUDNWW$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__card_body_default__as__CardBody$3e$__["CardBody"], {
                        className: "p-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center py-16 px-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-cyan-50 rounded-full p-4 inline-block mb-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        className: "h-8 w-8 text-cyan-500",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        stroke: "currentColor",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: 1.5,
                                            d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 459,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                        lineNumber: 452,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 451,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-xl font-medium text-gray-700 mb-2",
                                    children: currentFilter === "all" ? "No Orders Found" : "No ".concat(currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1), " Orders Found")
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 467,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-500 mb-4 max-w-md mx-auto",
                                    children: currentFilter === "all" ? "There are no customer orders in the system yet." : 'There are currently no orders with "'.concat(currentFilter, '" status.')
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 472,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/admin/all-orders/page.tsx",
                            lineNumber: 450,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/admin/all-orders/page.tsx",
                        lineNumber: 449,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/admin/all-orders/page.tsx",
                    lineNumber: 448,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-xl shadow-md bg-white overflow-hidden",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "md:hidden",
                            children: paginatedOrders.map((order)=>{
                                var _order_space, _order_space1, _order_space2, _order_space3, _order_space_price, _order_space4, _order_space5, _order_provider, _order_by, _order_contract;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-b border-gray-100 p-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-2 flex justify-between items-start",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-medium text-gray-900",
                                                    children: ((_order_space = order.space) === null || _order_space === void 0 ? void 0 : _order_space.name) || "Unnamed Space"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 487,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$chip$2f$dist$2f$chunk$2d$EIRINNCE$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__chip_default__as__Chip$3e$__["Chip"], {
                                                    color: getStatusColor(order.status),
                                                    variant: "flat",
                                                    className: "font-medium",
                                                    children: order.status
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 490,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 486,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-600 mb-2 line-clamp-2",
                                            children: ((_order_space1 = order.space) === null || _order_space1 === void 0 ? void 0 : _order_space1.description) || "No description"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 499,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 gap-3 text-xs mb-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block text-gray-500",
                                                            children: "Size"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 505,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium",
                                                            children: [
                                                                ((_order_space2 = order.space) === null || _order_space2 === void 0 ? void 0 : _order_space2.size) || "N/A",
                                                                "U"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 506,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 504,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block text-gray-500",
                                                            children: "Price"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 511,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: order.contract && order.contract.invoices && order.contract.invoices.length > 0 && typeof order.contract.invoices[0].price === "number" && order.contract.invoices[0].price !== ((_order_space3 = order.space) === null || _order_space3 === void 0 ? void 0 : _order_space3.price) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    formatPriceWithTax(order.contract.invoices[0].price),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs text-gray-400 line-through block",
                                                                        children: [
                                                                            "Rp ",
                                                                            ((_order_space4 = order.space) === null || _order_space4 === void 0 ? void 0 : (_order_space_price = _order_space4.price) === null || _order_space_price === void 0 ? void 0 : _order_space_price.toLocaleString()) || "0"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                                        lineNumber: 523,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                                                lineNumber: 519,
                                                                columnNumber: 27
                                                            }, this) : formatPriceWithTax(((_order_space5 = order.space) === null || _order_space5 === void 0 ? void 0 : _order_space5.price) || 0)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 512,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 510,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block text-gray-500",
                                                            children: "Provider"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 533,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium",
                                                            children: ((_order_provider = order.provider) === null || _order_provider === void 0 ? void 0 : _order_provider.name) || "N/A"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 534,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 532,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block text-gray-500",
                                                            children: "Customer"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 539,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium",
                                                            children: ((_order_by = order.by) === null || _order_by === void 0 ? void 0 : _order_by.fullName) || "N/A"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 540,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 538,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 503,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$button$2f$dist$2f$chunk$2d$KCYYJJH4$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__button_default__as__Button$3e$__["Button"], {
                                            color: "primary",
                                            size: "sm",
                                            className: "w-full mt-2",
                                            as: "a",
                                            href: "/admin/orders/detail/".concat((_order_contract = order.contract) === null || _order_contract === void 0 ? void 0 : _order_contract._id),
                                            children: "View Details"
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 546,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, order._id, true, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 485,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/app/admin/all-orders/page.tsx",
                            lineNumber: 483,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "overflow-x-auto table-container",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                className: "min-w-full divide-y divide-gray-200 hidden md:table",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        className: "bg-gray-50",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                                    children: "#"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 564,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                                    children: "Space"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 567,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                                    children: "Description"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 570,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                                    children: "Size"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 573,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                                    children: "Price"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 576,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                                    children: "Status"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 579,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                                    children: "Provider"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 582,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                                    children: "Customer"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 585,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                                    children: "Created"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 588,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                                    children: "Updated"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 591,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                                                    children: "Action"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                    lineNumber: 594,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 563,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                        lineNumber: 562,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        className: "bg-white divide-y divide-gray-100",
                                        children: paginatedOrders.map((order, idx)=>{
                                            var _order_space, _order_space1, _order_space2, _order_space3, _order_space_price, _order_space4, _order_space5, _order_provider_contact, _order_contract, _order_contract1;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                className: "hover:bg-gray-50 transition-colors",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-3 text-sm text-gray-700",
                                                        children: (page - 1) * rowsPerPage + idx + 1
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 605,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-3 font-medium text-gray-900",
                                                        children: ((_order_space = order.space) === null || _order_space === void 0 ? void 0 : _order_space.name) || "Unnamed Space"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 608,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-3 text-sm text-gray-600 max-w-xs truncate",
                                                        children: ((_order_space1 = order.space) === null || _order_space1 === void 0 ? void 0 : _order_space1.description) || "No description"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 611,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-3 text-sm text-gray-700",
                                                        children: [
                                                            ((_order_space2 = order.space) === null || _order_space2 === void 0 ? void 0 : _order_space2.size) || "N/A",
                                                            "U"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 614,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-3 text-sm text-gray-700",
                                                        children: order.contract && order.contract.invoices && order.contract.invoices.length > 0 && typeof order.contract.invoices[0].price === "number" && order.contract.invoices[0].price !== ((_order_space3 = order.space) === null || _order_space3 === void 0 ? void 0 : _order_space3.price) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col",
                                                            children: [
                                                                formatPriceWithTax(order.contract.invoices[0].price),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-xs text-gray-400 line-through",
                                                                    children: [
                                                                        "Rp ",
                                                                        ((_order_space4 = order.space) === null || _order_space4 === void 0 ? void 0 : (_order_space_price = _order_space4.price) === null || _order_space_price === void 0 ? void 0 : _order_space_price.toLocaleString()) || "0"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                                    lineNumber: 628,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 624,
                                                            columnNumber: 27
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: formatPriceWithTax(((_order_space5 = order.space) === null || _order_space5 === void 0 ? void 0 : _order_space5.price) || 0)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 633,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 617,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-3 text-sm",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$chip$2f$dist$2f$chunk$2d$EIRINNCE$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__chip_default__as__Chip$3e$__["Chip"], {
                                                            color: getStatusColor(order.status),
                                                            variant: "flat",
                                                            className: "font-medium",
                                                            children: order.status
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 639,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 638,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-3 text-sm",
                                                        children: order.provider ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "font-medium",
                                                                    children: order.provider.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                                    lineNumber: 650,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-xs text-gray-500",
                                                                    children: ((_order_provider_contact = order.provider.contact) === null || _order_provider_contact === void 0 ? void 0 : _order_provider_contact.email) || "N/A"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                                    lineNumber: 653,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-gray-500",
                                                            children: "No provider information"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 658,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 647,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-3 text-sm",
                                                        children: order.by ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "font-medium",
                                                                    children: order.by.fullName
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                                    lineNumber: 666,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-xs text-gray-500",
                                                                    children: order.by.email
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                                                    lineNumber: 669,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-gray-500",
                                                            children: "No customer information"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 674,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 663,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-3 text-xs text-gray-500",
                                                        children: formatDate(order.createdAt)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 679,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-3 text-xs text-gray-500",
                                                        children: formatDate(order.updatedAt)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 682,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                        className: "px-4 py-3",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$button$2f$dist$2f$chunk$2d$KCYYJJH4$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__button_default__as__Button$3e$__["Button"], {
                                                            color: "primary",
                                                            className: "flex items-center gap-2",
                                                            as: "a",
                                                            href: "/admin/orders/detail/".concat((_order_contract = order.contract) === null || _order_contract === void 0 ? void 0 : _order_contract._id),
                                                            size: "sm",
                                                            isDisabled: !((_order_contract1 = order.contract) === null || _order_contract1 === void 0 ? void 0 : _order_contract1._id),
                                                            children: "View"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                                            lineNumber: 686,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                                        lineNumber: 685,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, order._id, true, {
                                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                                lineNumber: 601,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                        lineNumber: 599,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                lineNumber: 561,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/admin/all-orders/page.tsx",
                            lineNumber: 560,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 rounded-b-xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm text-gray-500 mb-3 sm:mb-0",
                                    children: [
                                        "Showing",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-medium",
                                            children: filteredOrders.length > 0 ? (page - 1) * rowsPerPage + 1 : 0
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 707,
                                            columnNumber: 17
                                        }, this),
                                        " - ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-medium",
                                            children: Math.min(page * rowsPerPage, filteredOrders.length)
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 711,
                                            columnNumber: 17
                                        }, this),
                                        " of ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-medium",
                                            children: filteredOrders.length
                                        }, void 0, false, {
                                            fileName: "[project]/app/admin/all-orders/page.tsx",
                                            lineNumber: 715,
                                            columnNumber: 17
                                        }, this),
                                        " ",
                                        "orders"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 705,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$pagination$2f$dist$2f$chunk$2d$NL7EUJG2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__pagination_default__as__Pagination$3e$__["Pagination"], {
                                        total: Math.ceil(filteredOrders.length / rowsPerPage),
                                        page: page,
                                        onChange: setPage,
                                        size: "sm",
                                        classNames: {
                                            wrapper: "gap-1",
                                            item: "w-8 h-8 text-sm",
                                            cursor: "bg-cyan-600 text-white font-medium"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                        lineNumber: 722,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 721,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "hidden sm:block w-32",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$select$2f$dist$2f$chunk$2d$C3QHEOC2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__select_default__as__Select$3e$__["Select"], {
                                        size: "sm",
                                        label: "Rows",
                                        value: rowsPerPage.toString(),
                                        onChange: (e)=>setRowsPerPage(Number(e.target.value)),
                                        className: "max-w-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$select$2f$node_modules$2f40$heroui$2f$listbox$2f$dist$2f$chunk$2d$BJFJ4DRR$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__listbox_item_base_default__as__SelectItem$3e$__["SelectItem"], {
                                                children: "5"
                                            }, "5", false, {
                                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                                lineNumber: 743,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$select$2f$node_modules$2f40$heroui$2f$listbox$2f$dist$2f$chunk$2d$BJFJ4DRR$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__listbox_item_base_default__as__SelectItem$3e$__["SelectItem"], {
                                                children: "10"
                                            }, "10", false, {
                                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                                lineNumber: 744,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$select$2f$node_modules$2f40$heroui$2f$listbox$2f$dist$2f$chunk$2d$BJFJ4DRR$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__listbox_item_base_default__as__SelectItem$3e$__["SelectItem"], {
                                                children: "15"
                                            }, "15", false, {
                                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                                lineNumber: 745,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$select$2f$node_modules$2f40$heroui$2f$listbox$2f$dist$2f$chunk$2d$BJFJ4DRR$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__listbox_item_base_default__as__SelectItem$3e$__["SelectItem"], {
                                                children: "20"
                                            }, "20", false, {
                                                fileName: "[project]/app/admin/all-orders/page.tsx",
                                                lineNumber: 746,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/admin/all-orders/page.tsx",
                                        lineNumber: 736,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/admin/all-orders/page.tsx",
                                    lineNumber: 735,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/admin/all-orders/page.tsx",
                            lineNumber: 704,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/admin/all-orders/page.tsx",
                    lineNumber: 481,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/admin/all-orders/page.tsx",
                lineNumber: 418,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/all-orders/page.tsx",
        lineNumber: 268,
        columnNumber: 5
    }, this);
}
_s(AdminAllOrdersPage, "9g2GRS8kkuHMYqu/BGgOy+zIXy4=");
_c = AdminAllOrdersPage;
var _c;
__turbopack_context__.k.register(_c, "AdminAllOrdersPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_admin_all-orders_page_tsx_26712637._.js.map