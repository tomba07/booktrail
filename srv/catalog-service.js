const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { Books } = this.entities;

    this.on('markAsRead', async ({ data: { bookId } }) => {
        const today = new Date().toISOString().slice(0, 10);
        const book = await SELECT.one(Books).where({ ID: bookId });
        const updates = { read: true };
        if (!book.finishedAt) updates.finishedAt = today;
        await UPDATE(Books).set(updates).where({ ID: bookId });
        return true;
    });

    this.on('setPriority', async ({ data: { bookId, priority } }) => {
        await UPDATE(Books).set({ priority }).where({ ID: bookId });
        return true;
    });
});
