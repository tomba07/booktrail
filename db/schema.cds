namespace booktrail;

type Priority : String(10) @assert.range enum {
    High   = 'High';
    Medium = 'Medium';
    Low    = 'Low';
};

entity Priorities {
    key name : Priority;
}

entity Tags {
    key ID   : UUID;
        name : String(50) not null;
}

entity Books {
    key ID       : Integer;
        title    : String(200) not null;
        author   : String(100);
        read      : Boolean default false;
        listened  : Boolean default false;
        rating    : Decimal(3,1);
        priority  : Priority;
        tags      : Composition of many Books_Tags on tags.book = $self;
}

entity Books_Tags {
    key ID   : UUID;
        book : Association to Books;
        tag  : Association to Tags;
}
