sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
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
        }
    });
});
