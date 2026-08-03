sap.ui.define([
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/format/DateFormat"
], function (NumberFormat, DateFormat) {
    "use strict";

    return {

        /**
         * Returns the semantic state based on stock level relative to reorder threshold.
         * @param {number} iStock Current stock quantity
         * @param {number} iReorderThreshold Reorder threshold
         * @returns {string} "Error" | "Warning" | "Success"
         */
        formatStockState: function (iStock, iReorderThreshold) {
            if (iStock === 0) {
                return "Error";
            } else if (iStock <= iReorderThreshold) {
                return "Warning";
            }
            return "Success";
        },

        /**
         * Returns a human-readable stock status label via i18n.
         * @param {number} iStock Current stock quantity
         * @param {number} iReorderThreshold Reorder threshold
         * @returns {string} Localized status text
         */
        formatStockText: function (iStock, iReorderThreshold) {
            var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            if (iStock === 0) {
                return oResourceBundle.getText("stockStatusOutOfStock");
            } else if (iStock <= iReorderThreshold) {
                return oResourceBundle.getText("stockStatusLowStock");
            }
            return oResourceBundle.getText("stockStatusAvailable");
        },

        /**
         * Formats a price value with proper currency number formatting.
         * @param {number} fPrice The price value
         * @param {string} sCurrency The currency code (e.g. "USD")
         * @returns {string} Formatted price string without currency symbol
         */
        formatCurrency: function (fPrice, sCurrency) {
            if (fPrice === undefined || fPrice === null) {
                return "";
            }
            var oCurrencyFormat = NumberFormat.getCurrencyInstance({
                showMeasure: false
            });
            return oCurrencyFormat.format(fPrice, sCurrency);
        },

        /**
         * Formats an ISO date string into a localized medium date-time string.
         * @param {string} sDate ISO date string
         * @returns {string} Formatted date string
         */
        formatDate: function (sDate) {
            if (!sDate) {
                return "";
            }
            var oDate = new Date(sDate);
            var oDateFormat = DateFormat.getDateTimeInstance({
                style: "medium"
            });
            return oDateFormat.format(oDate);
        }
    };
});
