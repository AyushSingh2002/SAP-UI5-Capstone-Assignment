sap.ui.define([
    "novamart/inventoryportal/inventoryportal/controller/BaseController",
    "novamart/inventoryportal/inventoryportal/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (BaseController, formatter, JSONModel, Filter, FilterOperator, Sorter, Fragment, MessageToast) {
    "use strict";

    return BaseController.extend("novamart.inventoryportal.inventoryportal.controller.List", {

        formatter: formatter,

        onInit: function () {
            // Local view model for list-specific state
            var oViewModel = new JSONModel({
                itemCount: ""
            });
            this.setModel(oViewModel, "listView");

            this.getRouter().getRoute("list").attachPatternMatched(this._onListMatched, this);

            // Enrich product data with computed stock status for filtering
            var oProductsModel = this.getOwnerComponent().getModel("products");
            oProductsModel.dataLoaded().then(this._enrichProductData.bind(this));
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Reset FCL layout to single column when returning to the list route.
         */
        _onListMatched: function () {
            this.getModel("appView").setProperty("/layout", "OneColumn");
        },

        /**
         * Updates the item count in the toolbar after the list finishes updating.
         * @param {sap.ui.base.Event} oEvent The updateFinished event
         */
        onUpdateFinished: function (oEvent) {
            var iTotalItems = oEvent.getParameter("total");
            var oResourceBundle = this.getResourceBundle();
            var sTitle = oResourceBundle.getText("listHeaderCount", [iTotalItems]);
            this.getModel("listView").setProperty("/itemCount", sTitle);
        },

        /**
         * Filters the product list based on the search query.
         * Searches across name, category, and SKU fields.
         * @param {sap.ui.base.Event} oEvent The liveChange event
         */
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var aFilters = [];

            if (sQuery && sQuery.length > 0) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("name", FilterOperator.Contains, sQuery),
                        new Filter("category", FilterOperator.Contains, sQuery),
                        new Filter("sku", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            var oList = this.byId("productList");
            oList.getBinding("items").filter(aFilters, "Application");
        },

        /**
         * Navigates to the detail view for the pressed product.
         * @param {sap.ui.base.Event} oEvent The itemPress event
         */
        onItemPress: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var sProductId = oItem.getBindingContext("products").getProperty("productId");

            this.getRouter().navTo("detail", {
                productId: sProductId
            });
        },

        /**
         * Stub handler for Add Product button — opens dialog in Phase 4.
         */
        onAddProduct: function () {
            MessageToast.show(this.getResourceBundle().getText("addProductStub"));
        },

        /**
         * Opens the ViewSettings dialog on the Sort tab.
         */
        onSort: function () {
            this._openViewSettingsDialog("sort");
        },

        /**
         * Opens the ViewSettings dialog on the Filter tab.
         */
        onFilter: function () {
            this._openViewSettingsDialog("filter");
        },

        /**
         * Opens the ViewSettings dialog on the Group tab.
         */
        onGroup: function () {
            this._openViewSettingsDialog("group");
        },

        /**
         * Handles the confirm event from the ViewSettingsDialog.
         * Applies sort, group, and filter settings to the list binding.
         * @param {sap.ui.base.Event} oEvent The confirm event
         */
        onConfirmViewSettings: function (oEvent) {
            var oList = this.byId("productList");
            var oBinding = oList.getBinding("items");
            var mParams = oEvent.getParameters();

            // Build sorters array (group first, then sort)
            var aSorters = [];
            if (mParams.groupItem) {
                var sGroupPath = mParams.groupItem.getKey();
                aSorters.push(new Sorter(sGroupPath, mParams.groupDescending, true));
            }
            if (mParams.sortItem) {
                var sSortPath = mParams.sortItem.getKey();
                aSorters.push(new Sorter(sSortPath, mParams.sortDescending));
            }
            oBinding.sort(aSorters);

            // Build filters array from selected filter items
            var aFilters = [];
            mParams.filterItems.forEach(function (oItem) {
                var sKey = oItem.getKey();
                var sParentKey = oItem.getParent().getKey();

                if (sParentKey === "stockStatus") {
                    aFilters.push(new Filter("_stockStatus", FilterOperator.EQ, sKey));
                } else if (sParentKey === "priceRange") {
                    var oFilter = this._createPriceFilter(sKey);
                    if (oFilter) {
                        aFilters.push(oFilter);
                    }
                }
            }.bind(this));

            oBinding.filter(aFilters, "Control");
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Opens the ViewSettings dialog fragment (cached on first load).
         * @param {string} sTab The tab to open: "sort" | "filter" | "group"
         * @private
         */
        _openViewSettingsDialog: function (sTab) {
            var mTabMap = {
                sort: "sortTab",
                filter: "filterTab",
                group: "groupTab"
            };

            if (!this._pViewSettingsDialog) {
                this._pViewSettingsDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "novamart.inventoryportal.inventoryportal.fragment.ViewSettings",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }

            this._pViewSettingsDialog.then(function (oDialog) {
                oDialog.open(mTabMap[sTab]);
            });
        },

        /**
         * Creates a price range Filter based on the selected key.
         * @param {string} sKey Price range key (e.g. "0-50", "500+")
         * @returns {sap.ui.model.Filter} The price filter
         * @private
         */
        _createPriceFilter: function (sKey) {
            switch (sKey) {
                case "0-50":
                    return new Filter("price", FilterOperator.BT, 0, 50);
                case "50-200":
                    return new Filter("price", FilterOperator.BT, 50, 200);
                case "200-500":
                    return new Filter("price", FilterOperator.BT, 200, 500);
                case "500+":
                    return new Filter("price", FilterOperator.GE, 500);
                default:
                    return null;
            }
        },

        /**
         * Computes a _stockStatus field on each product for filter support.
         * This is a runtime-only property — not stored in the JSON file.
         * Re-call this after any stock mutation (add/edit/delete/reorder).
         * @private
         */
        _enrichProductData: function () {
            var oModel = this.getOwnerComponent().getModel("products");
            var aProducts = oModel.getProperty("/products");
            if (aProducts) {
                aProducts.forEach(function (oProduct) {
                    if (oProduct.stock === 0) {
                        oProduct._stockStatus = "outOfStock";
                    } else if (oProduct.stock <= oProduct.reorderThreshold) {
                        oProduct._stockStatus = "lowStock";
                    } else {
                        oProduct._stockStatus = "available";
                    }
                });
                oModel.refresh(true);
            }
        }
    });
});
