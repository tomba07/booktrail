namespace booktrail;

entity Books {
    key ID       : Integer;
        title    : String(200) not null;
        author   : String(100);
        finished  : Boolean default false;
        audiobook : Boolean default false;
}
