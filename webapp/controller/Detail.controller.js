sap.ui.define([
    "novamart/inventoryportal/inventoryportal/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("novamart.inventoryportal.inventoryportal.controller.Detail", {

        onInit: function () {
            // Local view model for detail-specific state
            var oViewModel = new JSONModel({
                productId: ""
            });
            this.setModel(oViewModel, "detailView");

            this.getRouter().getRoute("detail").attachPatternMatched(this._onProductMatched, this);
        },

        /**
         * Handles the detail route matched event.
         * Sets the FCL layout and displays the product ID.
         * @param {sap.ui.base.Event} oEvent The route matched event
         */
        _onProductMatched: function (oEvent) {
            var sProductId = oEvent.getParameter("arguments").productId;

            // Set FCL layout to show two columns
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");

            // Set the product ID in the local view model (temporary — full binding in Phase 3)
            this.getModel("detailView").setProperty("/productId", sProductId);
        },

        /**
         * Navigates back to the list view and resets FCL to single column.
         */
        onNavBack: function () {
            this.getModel("appView").setProperty("/layout", "OneColumn");
            this.getRouter().navTo("list", {}, true);
        }
    });
});
