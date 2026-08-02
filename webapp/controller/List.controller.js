sap.ui.define([
    "novamart/inventoryportal/inventoryportal/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("novamart.inventoryportal.inventoryportal.controller.List", {

        onInit: function () {
            this.getRouter().getRoute("list").attachPatternMatched(this._onListMatched, this);
        },

        /**
         * Reset FCL layout to single column when returning to the list route.
         */
        _onListMatched: function () {
            this.getModel("appView").setProperty("/layout", "OneColumn");
        },

        /**
         * Navigate to the product detail view when a list item is pressed.
         * @param {sap.ui.base.Event} oEvent The itemPress event
         */
        onItemPress: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var sProductId = oItem.getBindingContext("products").getProperty("productId");

            this.getRouter().navTo("detail", {
                productId: sProductId
            });
        }
    });
});
