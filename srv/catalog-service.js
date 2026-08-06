const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Books } = this.entities;

    this.on('markAsRead', async ({ data: { bookId } }) => {
        await UPDATE(Books).set({ read: true }).where({ ID: bookId });
        return true;
    });

    this.on('setPriority', async ({ data: { bookId, priority } }) => {
        await UPDATE(Books).set({ priority }).where({ ID: bookId });
        return true;
    });
});
