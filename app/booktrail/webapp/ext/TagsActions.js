sap.ui.define([], function () {
    "use strict";
    return {
        onManageTags: function () {
            var oComponent = sap.ui.getCore().getComponent(
                Object.keys(sap.ui.getCore().mComponents || {}).find(function (id) {
                    return id.indexOf("booktrail") !== -1;
                })
            );
            if (oComponent && oComponent.getRouter) {
                oComponent.getRouter().navTo("TagsList");
            } else {
                // fallback: hash navigation
                window.location.hash = "/Tags";
            }
        }
    };
});
