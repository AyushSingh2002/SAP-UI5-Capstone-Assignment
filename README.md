# NovaMart Inventory & Order Management Portal

A responsive, production-ready **SAPUI5 Capstone Application** built for **NovaMart** (AIDC equipment catalog: barcode scanners, label printers, RFID handhelds, POS hardware, networking gear).

---

## Architecture & Project Structure

The project strictly follows the SAPUI5 Freestyle Best Practices architecture:

```
SAP-UI5-Capstone-Assignment/
├── webapp/
│   ├── Component.js                  # Root Component initialization & model instantiation
│   ├── manifest.json                 # Descriptor file (models, routing config, i18n, FCL)
│   ├── index.html                    # Application bootstrap HTML
│   ├── controller/
│   │   ├── BaseController.js         # Abstract BaseController with shared helpers & dialog logic
│   │   ├── App.controller.js          # Root App view controller
│   │   ├── List.controller.js         # Product List controller (search, sort, group, filter)
│   │   ├── Detail.controller.js       # Product Detail controller (binding, reorder, delete)
│   │   └── NotFound.controller.js     # Fallback route controller
│   ├── view/
│   │   ├── App.view.xml               # Root view hosting sap.f.FlexibleColumnLayout
│   │   ├── List.view.xml              # Responsive Product List view + IllustratedMessage
│   │   ├── Detail.view.xml            # Product Detail view (ObjectHeader + IconTabBar)
│   │   └── NotFound.view.xml          # Resource Not Found fallback view
│   ├── fragment/
│   │   ├── ViewSettings.fragment.xml  # Sort, Group, and Filter dialog fragment
│   │   └── AddEditProduct.fragment.xml# Reusable Add / Edit product modal dialog
│   ├── model/
│   │   ├── products.json              # Sample product catalog (15+ items across 5 categories)
│   │   ├── models.js                  # Device model initializer
│   │   └── formatter.js               # Formatter functions (stock state/text, currency, date)
│   ├── i18n/
│   │   ├── i18n.properties            # Primary English resource bundle
│   │   └── i18n_de.properties         # Secondary German resource bundle for i18n proof
│   └── css/
│       └── style.css                  # Custom styling (viewport bounds & IconTabBar UI polish)
└── package.json                       # Project dependencies and UI5 tooling scripts
```

---

## Features

- **Flexible Column Layout (FCL)**: Two-column master-detail layout on desktop viewports; collapses cleanly to single-column on mobile viewports.
- **Asynchronous & Deep Link Routing**: Asynchronous route resolution with parameter matching (`product/{productId}`) and automatic redirect to `NotFound.view.xml` for invalid IDs.
- **Product Search, Sort, Group & Filter**: Live client-side searching across Name, Category, and SKU. Reusable `ViewSettings` dialog for sorting, grouping by category/warehouse, and filtering by stock status or price range.
- **Custom Formatter Functions**: 4 named formatter methods (`formatStockState`, `formatStockText`, `formatCurrency`, `formatDate`).
- **Product Actions**:
  - **Reorder (+50)**: Increments current stock quantity in batch and updates timestamp.
  - **Delete**: Prompts `MessageBox.confirm` dialog before deleting product and updating model.
  - **Add & Edit**: Shared modal dialog (`AddEditProduct.fragment.xml`) with two-way data binding to an isolated working copy model and live client-side input validation.
- **Multi-Language i18n**: Dynamic locale switcher (`EN` / `DE`) in the list toolbar proving i18n bundle resolution.
- **Illustrated Empty State**: Renders `sap.m.IllustratedMessage` (`sapIllu-Search`) when search or filtering yields no results.

---

## Setup & Local Execution

### Prerequisites
- **Node.js**: v16+ or v18+
- **NPM**: v8+

### Installation & Run Commands

1. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/AyushSingh2002/SAP-UI5-Capstone-Assignment.git
   cd SAP-UI5-Capstone-Assignment
   npm install
   ```

2. **Start Local Preview Server**:
   ```bash
   npm start
   ```
   Or without FLP sandbox:
   ```bash
   npm run start-noflp
   ```

---

## Learning Objective Self-Check Matrix

| Rubric Requirement | Status | Source Code Reference |
| :--- | :---: | :--- |
| **Architecture & Skeleton** | Completed | [`manifest.json`](file:///webapp/manifest.json), [`Component.js`](file:///webapp/Component.js), [`BaseController.js`](file:///webapp/controller/BaseController.js) |
| **Routing & Deep-Linking** | Completed | [`manifest.json`](file:///webapp/manifest.json#L77-L122), [`Detail.controller.js`](file:///webapp/controller/Detail.controller.js#L24-L58) |
| **NotFound Fallback Route** | Completed | [`NotFound.view.xml`](file:///webapp/view/NotFound.view.xml), [`Detail.controller.js`](file:///webapp/controller/Detail.controller.js#L48-L52) |
| **Product List & Header Count** | Completed | [`List.view.xml`](file:///webapp/view/List.view.xml#L18-L80), [`List.controller.js`](file:///webapp/controller/List.controller.js#L46-L51) |
| **Search, Sort, Group, Filter**| Completed | [`ViewSettings.fragment.xml`](file:///webapp/fragment/ViewSettings.fragment.xml), [`List.controller.js`](file:///webapp/controller/List.controller.js#L58-L157) |
| **Custom Formatters (>=3)** | Completed | [`formatter.js`](file:///webapp/model/formatter.js) (Stock State, Stock Text, Currency, Date) |
| **Product Detail Actions** | Completed | [`Detail.view.xml`](file:///webapp/view/Detail.view.xml#L14-L30), [`Detail.controller.js`](file:///webapp/controller/Detail.controller.js#L65-L120) |
| **Add / Edit Dialog Fragment** | Completed | [`AddEditProduct.fragment.xml`](file:///webapp/fragment/AddEditProduct.fragment.xml), [`BaseController.js`](file:///webapp/controller/BaseController.js#L68-L245) |
| **Input Validation** | Completed | [`BaseController.js`](file:///webapp/controller/BaseController.js#L130-L195) |
| **Multi-Language i18n (>=2)** | Completed | [`i18n.properties`](file:///webapp/i18n/i18n.properties), [`i18n_de.properties`](file:///webapp/i18n/i18n_de.properties), [`BaseController.js`](file:///webapp/controller/BaseController.js#L63-L75) |
| **Illustrated Empty State** | Completed | [`List.view.xml`](file:///webapp/view/List.view.xml#L74-L80) |

---

## Demo Video Walkthrough Guide

1. **Introduction & FCL Layout**:
   - Boot app, show Flexible Column Layout (FCL) two-column desktop mode.
   - Show initial list header item count: `Products (20)`.

2. **List Controls: Search, Sort, Group, Filter**:
   - Type `"Scanner"` in search box to demonstrate live filtering.
   - Open `ViewSettings` dialog: sort by price descending, group by category, filter by "Low Stock".
   - Clear search to show `IllustratedMessage` empty state when entering `"XYZ999"`.

3. **Detail View & Deep Linking**:
   - Select a product; point out URL route change (`#/product/P-1001`).
   - Change address bar URL to `#/product/NON-EXISTENT` to show fallback to `NotFound.view.xml`.

4. **Product Actions: Reorder, Delete, Edit & Add**:
   - Click **Reorder (+50)** $\rightarrow$ verify stock badge updates from Warning to Success immediately.
   - Click **Edit** $\rightarrow$ modify product description $\rightarrow$ save $\rightarrow$ verify detail view updates.
   - Click **Add (+)** $\rightarrow$ attempt Save with empty fields to show `ValueState.Error` validation $\rightarrow$ complete valid fields $\rightarrow$ verify new product appears in list.
   - Click **Delete** $\rightarrow$ confirm in `MessageBox` $\rightarrow$ verify item removal and FCL return to single column.

5. **Multi-Language Locale Switch**:
   - Toggle language switcher from **EN** to **DE** in toolbar $\rightarrow$ demonstrate instant translation of headers, labels, and buttons into German.
