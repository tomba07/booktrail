sap.ui.define([
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Slider",
    "sap/m/Label",
    "sap/m/VBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Dialog, Button, Slider, Label, VBox, MessageToast, JSONModel) {
    "use strict";

    function getSelectedContexts() {
        var aCtxs = [];
        sap.ui.core.Element.registry.forEach(function (el) {
            if (el.getSelectedContexts) {
                var a = el.getSelectedContexts();
                if (a && a.length) aCtxs = a;
            }
        });
        return aCtxs;
    }

    function openPriorityDialog(oModel, aCtxs, currentPriority) {
        var oSliderModel = new JSONModel({ priority: currentPriority });
        var oSlider = new Slider({
            min: 0, max: 10, step: 1,
            value: "{priority>/priority}",
            width: "100%",
            enableTickmarks: true,
            inputsAsTooltips: true
        });
        var oLabel = new Label({ text: "Priority: {priority>/priority}/10", labelFor: oSlider });
        var oDialog = new Dialog({
            title: "Set Priority",
            content: new VBox({ items: [oLabel, oSlider], class: "sapUiSmallMargin" }),
            beginButton: new Button({
                text: "Apply",
                type: "Emphasized",
                press: function () {
                    var priority = oSliderModel.getProperty("/priority");
                    Promise.all(aCtxs.map(function (oCtx) {
                        return oModel.bindContext("/setPriority(...)").invoke(undefined, {
                            bookId: oCtx.getProperty("ID"),
                            priority: priority
                        });
                    })).then(function () {
                        MessageToast.show("Priority updated to " + priority + "/10");
                        oModel.refresh();
                        oDialog.close();
                    }).catch(function (err) {
                        MessageToast.show("Error: " + (err.message || err));
                        oDialog.close();
                    });
                }
            }),
            endButton: new Button({ text: "Cancel", press: function () { oDialog.close(); } }),
            afterClose: function () { oDialog.destroy(); }
        });
        oDialog.setModel(oSliderModel, "priority");
        oDialog.open();
    }

    var oModule = {
        onMarkAsRead: function () {
            var aCtxs = getSelectedContexts();
            if (!aCtxs.length) { MessageToast.show("Please select at least one book"); return; }
            var oModel = aCtxs[0].getModel();
            Promise.all(aCtxs.map(function (oCtx) {
                return oModel.bindContext("/markAsRead(...)").invoke(undefined, { bookId: oCtx.getProperty("ID") });
            })).then(function () {
                MessageToast.show("Marked as read");
                oModel.refresh();
            }).catch(function (err) {
                MessageToast.show("Error: " + (err.message || err));
            });
        },

        onSetPriority: function () {
            var aCtxs = getSelectedContexts();
            if (!aCtxs.length) { MessageToast.show("Please select at least one book"); return; }
            var currentPriority = aCtxs.length === 1 ? (aCtxs[0].getProperty("priority") || 0) : 5;
            openPriorityDialog(aCtxs[0].getModel(), aCtxs, currentPriority);
        }
    };

    return oModule;
});
