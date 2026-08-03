sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "sap/m/MessageToast"
], function (Controller, History, JSONModel, Fragment, ValueState, MessageToast) {
    "use strict";

    return Controller.extend("novamart.inventoryportal.inventoryportal.controller.BaseController", {

        /**
         * Convenience method for accessing the component's router.
         * @returns {sap.ui.core.routing.Router} The router instance
         */
        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        /**
         * Convenience method for getting the view model by name.
         * Falls back to the component model if not found on the view.
         * @param {string} [sName] The model name
         * @returns {sap.ui.model.Model} The model instance
         */
        getModel: function (sName) {
            return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @param {sap.ui.model.Model} oModel The model instance
         * @param {string} [sName] The model name
         * @returns {sap.ui.core.mvc.Controller} The controller instance
         */
        setModel: function (oModel, sName) {
            this.getView().setModel(oModel, sName);
            return this;
        },

        /**
         * Convenience method for getting the i18n resource bundle.
         * @returns {sap.base.i18n.ResourceBundle} The resource bundle
         */
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Navigates back in browser history or to the product list if no history exists.
         */
        onNavBack: function () {
            var sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("list", {}, true);
            }
        },

        /* =========================================================== */
        /* add / edit product dialog shared handlers                   */
        /* =========================================================== */

        /**
         * Opens the Add/Edit Product dialog.
         * @param {object} oProduct Initial product data
         * @param {boolean} bIsEdit True for Edit mode, false for Add mode
         */
        openAddEditDialog: function (oProduct, bIsEdit) {
            var oWorkingCopy = JSON.parse(JSON.stringify(oProduct));

            // Dialog working copy model
            var oDialogModel = new JSONModel(oWorkingCopy);
            this.setModel(oDialogModel, "dialogModel");

            // Dialog view state model
            var oDialogViewModel = new JSONModel({
                isEdit: bIsEdit,
                nameState: ValueState.None,
                nameStateText: "",
                categoryState: ValueState.None,
                categoryStateText: "",
                skuState: ValueState.None,
                skuStateText: "",
                priceState: ValueState.None,
                priceStateText: "",
                stockState: ValueState.None,
                stockStateText: "",
                reorderThresholdState: ValueState.None,
                reorderThresholdStateText: ""
            });
            this.setModel(oDialogViewModel, "dialogView");

            if (!this._pAddEditDialog) {
                this._pAddEditDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "novamart.inventoryportal.inventoryportal.fragment.AddEditProduct",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }

            this._pAddEditDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        /**
         * Live validation triggered when inputs in the dialog change.
         */
        onInputChange: function () {
            this._validateForm();
        },

        /**
         * Validates inputs in the Add/Edit dialog.
         * @returns {boolean} True if all inputs are valid
         */
        _validateForm: function () {
            var oDialogModel = this.getModel("dialogModel");
            var oDialogViewModel = this.getModel("dialogView");
            var oResourceBundle = this.getResourceBundle();

            var oData = oDialogModel.getData();
            var bValid = true;

            // Validate Name
            if (!oData.name || !oData.name.trim()) {
                oDialogViewModel.setProperty("/nameState", ValueState.Error);
                oDialogViewModel.setProperty("/nameStateText", oResourceBundle.getText("valErrorNameRequired"));
                bValid = false;
            } else {
                oDialogViewModel.setProperty("/nameState", ValueState.None);
                oDialogViewModel.setProperty("/nameStateText", "");
            }

            // Validate Category
            if (!oData.category || !oData.category.trim()) {
                oDialogViewModel.setProperty("/categoryState", ValueState.Error);
                oDialogViewModel.setProperty("/categoryStateText", oResourceBundle.getText("valErrorCategoryRequired"));
                bValid = false;
            } else {
                oDialogViewModel.setProperty("/categoryState", ValueState.None);
                oDialogViewModel.setProperty("/categoryStateText", "");
            }

            // Validate SKU
            if (!oData.sku || !oData.sku.trim()) {
                oDialogViewModel.setProperty("/skuState", ValueState.Error);
                oDialogViewModel.setProperty("/skuStateText", oResourceBundle.getText("valErrorSkuRequired"));
                bValid = false;
            } else {
                oDialogViewModel.setProperty("/skuState", ValueState.None);
                oDialogViewModel.setProperty("/skuStateText", "");
            }

            // Validate Price
            var fPrice = parseFloat(oData.price);
            if (isNaN(fPrice) || fPrice < 0) {
                oDialogViewModel.setProperty("/priceState", ValueState.Error);
                oDialogViewModel.setProperty("/priceStateText", oResourceBundle.getText("valErrorPriceInvalid"));
                bValid = false;
            } else {
                oDialogViewModel.setProperty("/priceState", ValueState.None);
                oDialogViewModel.setProperty("/priceStateText", "");
            }

            // Validate Stock
            var iStock = parseInt(oData.stock, 10);
            if (isNaN(iStock) || iStock < 0) {
                oDialogViewModel.setProperty("/stockState", ValueState.Error);
                oDialogViewModel.setProperty("/stockStateText", oResourceBundle.getText("valErrorStockInvalid"));
                bValid = false;
            } else {
                oDialogViewModel.setProperty("/stockState", ValueState.None);
                oDialogViewModel.setProperty("/stockStateText", "");
            }

            // Validate Reorder Threshold
            var iReorder = parseInt(oData.reorderThreshold, 10);
            if (isNaN(iReorder) || iReorder < 0) {
                oDialogViewModel.setProperty("/reorderThresholdState", ValueState.Error);
                oDialogViewModel.setProperty("/reorderThresholdStateText", oResourceBundle.getText("valErrorReorderInvalid"));
                bValid = false;
            } else {
                oDialogViewModel.setProperty("/reorderThresholdState", ValueState.None);
                oDialogViewModel.setProperty("/reorderThresholdStateText", "");
            }

            return bValid;
        },

        /**
         * Saves product changes or inserts a new product.
         */
        onSaveProduct: function () {
            if (!this._validateForm()) {
                return;
            }

            var oDialogModel = this.getModel("dialogModel");
            var oDialogViewModel = this.getModel("dialogView");
            var oProductsModel = this.getModel("products");

            var oProductData = oDialogModel.getData();
            var bIsEdit = oDialogViewModel.getProperty("/isEdit");
            var aProducts = oProductsModel.getProperty("/products") || [];

            // Cast numerical fields
            oProductData.price = parseFloat(oProductData.price);
            oProductData.stock = parseInt(oProductData.stock, 10);
            oProductData.reorderThreshold = parseInt(oProductData.reorderThreshold, 10);
            oProductData.lastUpdated = new Date().toISOString();

            var sMsg = "";

            if (bIsEdit) {
                var iIndex = aProducts.findIndex(function (p) {
                    return p.productId === oProductData.productId;
                });
                if (iIndex !== -1) {
                    aProducts[iIndex] = oProductData;
                    oProductsModel.setProperty("/products", aProducts);
                    sMsg = this.getResourceBundle().getText("saveSuccessMessage", [oProductData.name]);
                }
            } else {
                // Generate next Product ID (e.g. P-1021)
                var iNextIdNum = 1001 + aProducts.length;
                oProductData.productId = "P-" + iNextIdNum;

                aProducts.push(oProductData);
                oProductsModel.setProperty("/products", aProducts);
                sMsg = this.getResourceBundle().getText("addSuccessMessage", [oProductData.name]);
            }

            oProductsModel.refresh(true);
            MessageToast.show(sMsg);

            this._pAddEditDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        /**
         * Closes the Add/Edit product dialog without saving.
         */
        onCancelDialog: function () {
            this._pAddEditDialog.then(function (oDialog) {
                oDialog.close();
            });
        }
    });
});
