using booktrail from '../db/schema';

service CatalogService {
    entity Books as projection on booktrail.Books;
}
