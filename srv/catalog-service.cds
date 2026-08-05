using booktrail from '../db/schema';

service CatalogService {
    @odata.draft.enabled
    entity Books as projection on booktrail.Books;

    @readonly
    entity Priorities as projection on booktrail.Priorities;
}
