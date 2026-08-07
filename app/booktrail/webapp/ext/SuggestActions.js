sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (MessageToast, JSONModel, Fragment, Filter, FilterOperator) {
    "use strict";

    var _oDialog = null;
    var _oBookCtx = null;
    var _oODataModel = null;
    var _oPipeline = null;

    // --- Open Library lookup ---
    function fetchBookInfo(sTitle) {
        var sUrl = "https://openlibrary.org/search.json?title=" +
            encodeURIComponent(sTitle) + "&limit=1&fields=author_name,subject";
        return fetch(sUrl)
            .then(function (oResp) {
                if (!oResp.ok) throw new Error("Open Library request failed");
                return oResp.json();
            })
            .then(function (oData) {
                var oDoc = oData.docs && oData.docs[0];
                if (!oDoc) return { author: null, subjects: [] };
                return {
                    author: (oDoc.author_name && oDoc.author_name[0]) || null,
                    subjects: oDoc.subject || []
                };
            });
    }

    // --- Load Transformers.js lazily via module script tag ---
    function getPipeline() {
        if (_oPipeline) return Promise.resolve(_oPipeline);
        if (window.__booktrailPipeline) {
            return window.__booktrailPipeline(
                "zero-shot-classification",
                "Xenova/distilbert-base-uncased-mnli"
            ).then(function (p) { _oPipeline = p; return p; });
        }

        return new Promise(function (resolve, reject) {
            var oScript = document.createElement("script");
            oScript.type = "module";
            oScript.textContent =
                'import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js";' +
                'window.__booktrailPipeline = pipeline;' +
                'document.dispatchEvent(new Event("booktrail-transformers-ready"));';
            document.addEventListener("booktrail-transformers-ready", function onReady() {
                document.removeEventListener("booktrail-transformers-ready", onReady);
                window.__booktrailPipeline(
                    "zero-shot-classification",
                    "Xenova/distilbert-base-uncased-mnli"
                ).then(function (p) { _oPipeline = p; resolve(p); }).catch(reject);
            });
            oScript.onerror = reject;
            document.head.appendChild(oScript);
        });
    }

    // --- Match subjects to tags using zero-shot classification ---
    function matchTags(aSubjects, aExistingTags, oSuggestModel) {
        if (!aSubjects.length || !aExistingTags.length) return Promise.resolve([]);

        oSuggestModel.setProperty("/status", "Loading AI model (first use may take a moment)…");
        return getPipeline()
            .then(function (oClassifier) {
                oSuggestModel.setProperty("/status", "Matching tags…");
                var sText = aSubjects.slice(0, 15).join(", ");
                return oClassifier(sText, aExistingTags, { multi_label: true });
            })
            .then(function (oResult) {
                var aMatched = [];
                oResult.labels.forEach(function (sLabel, i) {
                    if (oResult.scores[i] > 0.4) aMatched.push({
                        name: sLabel,
                        score: Math.round(oResult.scores[i] * 100)
                    });
                });
                return aMatched;
            })
            .catch(function () {
                // Fallback: simple substring match
                return aExistingTags.filter(function (sTag) {
                    return aSubjects.some(function (s) {
                        return s.toLowerCase().includes(sTag.toLowerCase()) ||
                            sTag.toLowerCase().includes(s.toLowerCase());
                    });
                }).map(function (n) { return { name: n, score: null }; });
            });
    }

    // --- Load existing tags from OData ---
    function loadExistingTags(oModel) {
        return oModel.bindList("/Tags").requestContexts(0, 100)
            .then(function (aCtxs) {
                return aCtxs.map(function (c) { return c.getProperty("name"); });
            });
    }

    var oController = {
        onApplySuggestions: function () {
            var oModel = _oDialog.getModel("suggest");
            var bApplyAuthor = oModel.getProperty("/applyAuthor");
            var sAuthor = oModel.getProperty("/suggestedAuthor");
            var aTags = oModel.getProperty("/tags").filter(function (t) { return t.selected; });
            _oDialog.close();

            if (!bApplyAuthor && !aTags.length) {
                MessageToast.show("Nothing to apply");
                return;
            }

            // 1. Create draft via draftEdit
            _oODataModel.bindContext("CatalogService.draftEdit(...)", _oBookCtx, {
                $$inheritExpandSelect: true
            }).invoke(undefined, { PreserveChanges: false })
            .then(function () {
                // 2. Get draft context
                var sActivePath = _oBookCtx.getPath();
                var sDraftPath = sActivePath.replace("IsActiveEntity=true", "IsActiveEntity=false");
                var oDraftCtx = _oODataModel.bindContext(sDraftPath).getBoundContext();

                if (!oDraftCtx) {
                    throw new Error("Draft context not found");
                }

                // 3. Apply author
                if (bApplyAuthor && sAuthor) {
                    oDraftCtx.setProperty("author", sAuthor);
                }

                // 4. Create tag associations on draft
                return Promise.all(aTags.map(function (t) {
                    return _oODataModel.bindList("/Tags", null, null,
                        [new Filter("name", FilterOperator.EQ, t.name)])
                        .requestContexts(0, 1)
                        .then(function (aCtxs) {
                            if (!aCtxs.length) return;
                            var sTagId = aCtxs[0].getProperty("ID");
                            return _oODataModel.bindList("tags", oDraftCtx, [], [], {
                                $$ownRequest: true
                            }).create({ tag_ID: sTagId }).created();
                        });
                })).then(function () { return oDraftCtx; });
            })
            .then(function (oDraftCtx) {
                // 5. Prepare + activate draft
                return _oODataModel.bindContext(
                    "CatalogService.draftPrepare(...)", oDraftCtx
                ).invoke(undefined, { SideEffectsQualifier: "" })
                .then(function () {
                    return _oODataModel.bindContext(
                        "CatalogService.draftActivate(...)", oDraftCtx
                    ).invoke();
                });
            })
            .then(function () {
                MessageToast.show("Suggestions applied");
                // Full reload needed: OData model refresh alone doesn't re-render
                // the Tags table section after draft activation
                window.location.reload();
            })
            .catch(function (e) {
                MessageToast.show("Error: " + (e.message || e));
            });
        },
        onCancelSuggestions: function () {
            _oDialog.close();
        }
    };

    return {
        onSuggestInfo: function () {
            // FPMHelper doesn't pass a real event — find context from registry
            var oView = null;
            sap.ui.core.Element.registry.forEach(function (el) {
                if (el.getId && el.getId() === "com.mteschke.booktrail.booktrail::BooksObjectPage") {
                    oView = el;
                }
            });
            if (!oView) { MessageToast.show("Could not find book page"); return; }

            var oCtrl = oView.getController && oView.getController();
            _oODataModel = oView.getModel && oView.getModel();
            _oBookCtx = oView.getBindingContext && oView.getBindingContext();
            if (!_oBookCtx) { MessageToast.show("No book context"); return; }

            var sTitle = _oBookCtx.getProperty("title");
            var sCurrentAuthor = _oBookCtx.getProperty("author");
            if (!sTitle) { MessageToast.show("Book has no title"); return; }

            var oSuggestModel = new JSONModel({
                loading: true,
                status: "Looking up “" + sTitle + "” on Open Library…",
                suggestedAuthor: null,
                applyAuthor: true,
                tags: []
            });

            var pDialog = _oDialog
                ? Promise.resolve(_oDialog)
                : Fragment.load({
                    name: "com.mteschke.booktrail.booktrail.ext.SuggestDialog",
                    controller: oController
                }).then(function (d) { _oDialog = d; return d; });

            pDialog.then(function (oDialog) {
                oDialog.setModel(oSuggestModel, "suggest");
                oDialog.open();

                Promise.all([
                    fetchBookInfo(sTitle),
                    loadExistingTags(_oODataModel),
                    // Load tags already assigned to this book
                    _oODataModel.bindList("tags", _oBookCtx, [], [], {
                        $$ownRequest: true, $expand: "tag"
                    }).requestContexts(0, 100)
                ]).then(function (aResults) {
                    var oInfo = aResults[0];
                    var aAllTags = aResults[1];
                    var aCurrentTagNames = aResults[2].map(function (c) {
                        return c.getProperty("tag/name");
                    });
                    var aAvailableTags = aAllTags.filter(function (n) {
                        return aCurrentTagNames.indexOf(n) === -1;
                    });

                    // Run tag matching, then update everything at once
                    return matchTags(oInfo.subjects, aAvailableTags, oSuggestModel)
                        .then(function (aMatched) {
                            oSuggestModel.setProperty("/loading", false);
                            oSuggestModel.setProperty("/status", "");

                            if (oInfo.author && !sCurrentAuthor) {
                                oSuggestModel.setProperty("/suggestedAuthor", oInfo.author);
                            }

                            oSuggestModel.setProperty("/tags", aMatched.map(function (t) {
                                return { name: t.name, score: t.score, selected: true };
                            }));
                        });
                }).catch(function (e) {
                    oSuggestModel.setProperty("/loading", false);
                    oSuggestModel.setProperty("/status", "Error: " + (e.message || e));
                });
            });
        }
    };
});
