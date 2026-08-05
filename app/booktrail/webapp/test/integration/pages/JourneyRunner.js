sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"com/mteschke/booktrail/booktrail/test/integration/pages/BooksList",
	"com/mteschke/booktrail/booktrail/test/integration/pages/BooksObjectPage"
], function (JourneyRunner, BooksList, BooksObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('com/mteschke/booktrail/booktrail') + '/test/flp.html#app-preview',
        pages: {
			onTheBooksList: BooksList,
			onTheBooksObjectPage: BooksObjectPage
        },
        async: true
    });

    return runner;
});

