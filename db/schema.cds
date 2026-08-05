namespace booktrail;

type Priority : String(10) @assert.range enum {
    High   = 'High';
    Medium = 'Medium';
    Low    = 'Low';
};

entity Priorities {
    key name : Priority;
}

entity Books {
    key ID       : Integer;
        title    : String(200) not null;
        author   : String(100);
        read      : Boolean default false;
        listened  : Boolean default false;
        rating    : Decimal(3,1);
        priority  : Priority;
}
