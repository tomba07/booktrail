sap.ui.define(
  ["sap/m/MessageToast", "sap/ui/model/json/JSONModel", "sap/ui/core/Fragment"],
  function (MessageToast, JSONModel, Fragment) {
    "use strict";

    var _oAvailabilityDialog = null;

    // --- Mountain View Library / Vega lookup ---
    function fetchLibraryAvailability(sTitle) {
      var sUrl = "https://na5.iiivega.com/api/search-result/search/format-groups";

      return fetch(sUrl, {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-version": "2",
          "iii-customer-domain": "mvpl.na5.iiivega.com",
          "iii-host-domain": "librarycatalog.mountainview.gov",
          "anonymous-user-id": crypto.randomUUID()
        },
        body: JSON.stringify({
          searchText: sTitle,
          sorting: "relevance",
          sortOrder: "asc",
          searchType: "everything",
          pageNum: 0,
          pageSize: 10,
          resourceType: "FormatGroup"
        })
      })
        .then(function (oResp) {
          if (!oResp.ok) {
            throw new Error("Mountain View Library request failed (" + oResp.status + ")");
          }

          return oResp.json();
        })
        .then(function (oData) {
          // Keep the raw Vega results here.
          // mapAvailabilityResult() performs the UI-specific mapping.
          return oData.data || [];
        });
    }

    // --- Convert a Vega FormatGroup result into our dialog model ---
    function mapAvailabilityResult(oResult) {
      var oBook = (oResult.materialTabs || []).find(function (oTab) {
        return oTab.name === "Book" && oTab.type === "physical";
      });

      if (!oBook) {
        return null;
      }

      var sStatus = oBook.availability && oBook.availability.status && oBook.availability.status.general;

      return {
        title: oResult.title,
        author: oResult.primaryAgent && oResult.primaryAgent.label,
        coverUrl: oResult.coverUrl && oResult.coverUrl.medium,

        location: oBook.itemLibrary,
        callNumber: oBook.callNumber,

        availabilityText: formatStatus(sStatus),
        availabilityState: mapStatusState(sStatus),

        editions: (oBook.editions || []).map(function (oEdition) {
          return {
            recordId: oEdition.recordId,

            edition: oEdition.edition || "Edition",

            publicationDate: oEdition.publicationDate,

            statusText: formatStatus(oEdition.availabilityStatus),

            state: mapStatusState(oEdition.availabilityStatus)
          };
        })
      };
    }

    // --- User-friendly availability status ---
    function formatStatus(sStatus) {
      switch (sStatus) {
        case "Available":
          return "Available";

        case "CheckedOut":
          return "Checked out";

        case "Unavailable":
          return "Unavailable";

        default:
          return sStatus || "Unknown";
      }
    }

    // --- Map Vega status to sap.m.ObjectStatus state ---
    function mapStatusState(sStatus) {
      switch (sStatus) {
        case "Available":
          return "Success";

        case "CheckedOut":
          return "Warning";

        case "Unavailable":
          return "Error";

        default:
          return "None";
      }
    }

    // --- Normalize strings for matching ---
    function normalize(sValue) {
      return (sValue || "").toLowerCase().trim();
    }

    // --- Find the most likely result for the current book ---
    function findBestMatch(aResults, sTitle, sAuthor) {
      var sNormalizedTitle = normalize(sTitle);
      var sNormalizedAuthor = normalize(sAuthor);

      // Only consider results that actually contain a physical book.
      var aPhysicalResults = aResults.filter(function (oResult) {
        return (oResult.materialTabs || []).some(function (oTab) {
          return oTab.name === "Book" && oTab.type === "physical";
        });
      });

      // First choice:
      // exact title + matching author
      var oMatch = aPhysicalResults.find(function (oResult) {
        if (normalize(oResult.title) !== sNormalizedTitle) {
          return false;
        }

        if (!sNormalizedAuthor) {
          return true;
        }

        var sResultAuthor = normalize(oResult.primaryAgent && oResult.primaryAgent.label);

        if (!sResultAuthor) {
          return false;
        }

        return sResultAuthor.includes(sNormalizedAuthor) || sNormalizedAuthor.includes(sResultAuthor);
      });

      if (oMatch) {
        return oMatch;
      }

      // Second choice:
      // exact title regardless of author
      oMatch = aPhysicalResults.find(function (oResult) {
        return normalize(oResult.title) === sNormalizedTitle;
      });

      if (oMatch) {
        return oMatch;
      }

      // Final fallback:
      // first physical-book result returned by Vega
      return aPhysicalResults[0] || null;
    }

    var oController = {
      onCheckAvailability: function () {
        var oView = null;

        // FPMHelper doesn't pass a normal event/context,
        // so locate the Books object page via the registry.
        sap.ui.core.Element.registry.forEach(function (oElement) {
          if (oElement.getId && oElement.getId() === "com.mteschke.booktrail.booktrail::BooksObjectPage") {
            oView = oElement;
          }
        });

        if (!oView) {
          MessageToast.show("Could not find book page");
          return;
        }

        var oBookCtx = oView.getBindingContext && oView.getBindingContext();

        if (!oBookCtx) {
          MessageToast.show("No book context");
          return;
        }

        var sTitle = oBookCtx.getProperty("title");

        var sAuthor = oBookCtx.getProperty("author");

        if (!sTitle) {
          MessageToast.show("Book has no title");
          return;
        }

        var oAvailabilityModel = new JSONModel({
          loading: true,

          status: 'Checking "' + sTitle + '"...',

          title: null,
          author: null,
          coverUrl: null,

          availabilityText: null,
          availabilityState: "None",

          location: null,
          callNumber: null,

          editions: []
        });

        var pDialog = _oAvailabilityDialog
          ? Promise.resolve(_oAvailabilityDialog)
          : Fragment.load({
              name: "com.mteschke.booktrail.booktrail.ext.AvailabilityDialog",
              controller: oController
            }).then(function (oDialog) {
              _oAvailabilityDialog = oDialog;

              return oDialog;
            });

        pDialog
          .then(function (oDialog) {
            oDialog.setModel(oAvailabilityModel, "availability");

            oDialog.open();

            return fetchLibraryAvailability(sTitle);
          })
          .then(function (aResults) {
            var oMatch = findBestMatch(aResults, sTitle, sAuthor);

            oAvailabilityModel.setProperty("/loading", false);

            oAvailabilityModel.setProperty("/status", "");

            // No physical book result found.
            // Leaving title empty activates the
            // empty state in the fragment.
            if (!oMatch) {
              return;
            }

            var oMapped = mapAvailabilityResult(oMatch);

            if (!oMapped) {
              return;
            }

            oAvailabilityModel.setData({
              loading: false,
              status: "",

              title: oMapped.title,
              author: oMapped.author,
              coverUrl: oMapped.coverUrl,

              availabilityText: oMapped.availabilityText,

              availabilityState: oMapped.availabilityState,

              location: oMapped.location,

              callNumber: oMapped.callNumber,

              editions: oMapped.editions
            });
          })
          .catch(function (oError) {
            oAvailabilityModel.setProperty("/loading", false);

            oAvailabilityModel.setProperty("/status", "Error: " + (oError.message || oError));
          });
      },

      onCloseAvailability: function () {
        if (_oAvailabilityDialog) {
          _oAvailabilityDialog.close();
        }
      }
    };

    return oController;
  }
);
