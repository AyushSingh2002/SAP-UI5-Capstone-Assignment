sap.ui.define([
    "novamart/inventoryportal/inventoryportal/controller/BaseController",
    "novamart/inventoryportal/inventoryportal/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (BaseController, formatter, JSONModel, MessageBox, MessageToast) {
    "use strict";

    var REORDER_BATCH_SIZE = 50;

    return BaseController.extend("novamart.inventoryportal.inventoryportal.controller.Detail", {

        formatter: formatter,

        onInit: function () {
            this.getRouter().getRoute("detail").attachPatternMatched(this._onProductMatched, this);
        },

        /* =========================================================== */
        /* route handling                                              */
        /* =========================================================== */

        /**
         * Route matched handler for product detail view.
         * Binds the view to the matching product context or redirects to NotFound.
         * @param {sap.ui.base.Event} oEvent Route matched event
         */
        _onProductMatched: function (oEvent) {
            var sProductId = oEvent.getParameter("arguments").productId;
            var oProductsModel = this.getModel("products");

            // Ensure model data is loaded before attempting binding
            if (!oProductsModel.getProperty("/products")) {
                oProductsModel.dataLoaded().then(function () {
                    this._bindProductContext(sProductId);
                }.bind(this));
            } else {
                this._bindProductContext(sProductId);
            }
        },

        /**
         * Finds the product index and binds the view element context.
         * Redirects to NotFound target if product ID does not exist.
         * @param {string} sProductId Product ID from route
         */
        _bindProductContext: function (sProductId) {
            var oModel = this.getModel("products");
            var aProducts = oModel.getProperty("/products") || [];

            var iIndex = aProducts.findIndex(function (oItem) {
                return oItem.productId === sProductId;
            });

            if (iIndex === -1) {
                // Product ID not found in dataset -> trigger NotFound target
                this.getRouter().getTargets().display("notFound");
                return;
            }

            // Set FCL layout to show mid column expanded
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");

            // Bind element context to the target product path
            var sPath = "/products/" + iIndex;
            this.getView().bindElement({
                path: sPath,
                model: "products"
            });
        },

        /* =========================================================== */
        /* detail actions                                              */
        /* =========================================================== */

        /**
         * Increments current stock by fixed batch size (+50).
         */
        onReorderProduct: function () {
            var oContext = this.getView().getBindingContext("products");
            if (!oContext) {
                return;
            }

            var oModel = this.getModel("products");
            var sPath = oContext.getPath();
            var oProduct = oContext.getObject();

            var iCurrentStock = parseInt(oProduct.stock, 10) || 0;
            var iNewStock = iCurrentStock + REORDER_BATCH_SIZE;

            oModel.setProperty(sPath + "/stock", iNewStock);
            oModel.setProperty(sPath + "/lastUpdated", new Date().toISOString());

            var sMsg = this.getResourceBundle().getText("reorderSuccessMessage", [oProduct.name, iNewStock]);
            MessageToast.show(sMsg);
        },

        /**
         * Confirms and executes deletion of the current product item.
         */
        onDeleteProduct: function () {
            var oContext = this.getView().getBindingContext("products");
            if (!oContext) {
                return;
            }

            var oProduct = oContext.getObject();
            var sMsg = this.getResourceBundle().getText("deleteConfirmMessage", [oProduct.name]);
            var sTitle = this.getResourceBundle().getText("deleteConfirmTitle");

            MessageBox.confirm(sMsg, {
                title: sTitle,
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        this._executeDelete(oProduct);
                    }
                }.bind(this)
            });
        },

        /**
         * Deletes the product from model and navigates back to list view.
         * @param {object} oProduct Product object to delete
         */
        _executeDelete: function (oProduct) {
            var oModel = this.getModel("products");
            var aProducts = oModel.getProperty("/products") || [];

            var iIndex = aProducts.findIndex(function (p) {
                return p.productId === oProduct.productId;
            });

            if (iIndex !== -1) {
                aProducts.splice(iIndex, 1);
                oModel.setProperty("/products", aProducts);

                var sSuccessMsg = this.getResourceBundle().getText("deleteSuccessMessage", [oProduct.name]);
                MessageToast.show(sSuccessMsg);

                this.onNavBack();
            }
        },

        /**
         * Opens the AddEditProduct fragment pre-filled with current product data.
         */
        onEditProduct: function () {
            var oContext = this.getView().getBindingContext("products");
            if (!oContext) {
                return;
            }

            var oProduct = oContext.getObject();
            this.openAddEditDialog(oProduct, true);
        }
    });
});
