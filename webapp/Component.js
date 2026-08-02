sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "novamart/inventoryportal/inventoryportal/model/models"
], function (UIComponent, JSONModel, models) {
    "use strict";

    return UIComponent.extend("novamart.inventoryportal.inventoryportal.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init: function () {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // set the app view model (FCL layout state + busy indicator)
            var oAppViewModel = new JSONModel({
                layout: "OneColumn",
                busy: false,
                delay: 0
            });
            this.setModel(oAppViewModel, "appView");

            // enable routing
            this.getRouter().initialize();
        }
    });
});