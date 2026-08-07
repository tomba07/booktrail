using booktrail from '../db/schema';

service CatalogService {
    @odata.draft.enabled
    entity Books as projection on booktrail.Books;

    @odata.draft.enabled
    entity Tags as projection on booktrail.Tags;

    entity Books_Tags as projection on booktrail.Books_Tags;

    action markAsRead(bookId : UUID)               returns Boolean;
    action setPriority(bookId : UUID, priority : Integer) returns Boolean;
}
