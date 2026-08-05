using CatalogService as service from '../../srv/catalog-service';
annotate service.Books with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Title',
                Value : title,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Author',
                Value : author,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Read',
                Value : read,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Listened',
                Value : listened,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Rating',
                Value : rating,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Title',
            Value : title,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Author',
            Value : author,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Read',
            Value : read,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Listened',
            Value : listened,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Rating',
            Value : rating,
        },
    ],
);

