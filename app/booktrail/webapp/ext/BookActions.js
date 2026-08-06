sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function (MessageToast, JSONModel, Fragment) {
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

    var _oDialog = null;
    var _oModel = null;

    function openPriorityDialog(oModel, aCtxs) {
        _oModel = oModel;
        var aData = aCtxs.map(function (oCtx) {
            return {
                bookId: oCtx.getProperty("ID"),
                title: oCtx.getProperty("title"),
                priority: oCtx.getProperty("priority") || 0
            };
        });

        var oController = {
            onApplyPriority: function () {
                var aBooks = _oDialog.getModel("edit").getProperty("/books");
                Promise.all(aBooks.map(function (b) {
                    var oBinding = _oModel.bindContext("/setPriority(...)");
                    oBinding.setParameter("bookId", b.bookId);
                    oBinding.setParameter("priority", b.priority);
                    return oBinding.invoke();
                })).then(function () {
                    MessageToast.show("Priorities updated");
                    _oModel.refresh();
                    _oDialog.close();
                }).catch(function (err) {
                    MessageToast.show("Error: " + (err.message || err));
                    _oDialog.close();
                });
            },
            onCancelPriority: function () {
                _oDialog.close();
            }
        };

        if (!_oDialog) {
            Fragment.load({
                name: "com.mteschke.booktrail.booktrail.ext.SetPriorityDialog",
                controller: oController
            }).then(function (oDialog) {
                _oDialog = oDialog;
                _oDialog.setModel(new JSONModel({ books: aData }), "edit");
                _oDialog.open();
            });
        } else {
            _oDialog.getModel("edit").setProperty("/books", aData);
            _oDialog.open();
        }
    }

    return {
        onMarkAsRead: function () {
            var aCtxs = getSelectedContexts();
            if (!aCtxs.length) { MessageToast.show("Please select at least one book"); return; }
            var oModel = aCtxs[0].getModel();
            Promise.all(aCtxs.map(function (oCtx) {
                var oBinding = oModel.bindContext("/markAsRead(...)");
                oBinding.setParameter("bookId", oCtx.getProperty("ID"));
                return oBinding.invoke();
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
            openPriorityDialog(aCtxs[0].getModel(), aCtxs);
        }
    };
});
