using CatalogService as service from '../../srv/catalog-service';
annotate service.Books with @(
    UI.SelectionFields : [
        read,
        priority,
        author,
    ],
    UI.SelectionVariant #All : {
        Text : 'All',
        SelectOptions : [],
    },
    UI.SelectionVariant #Finished : {
        Text : 'Finished',
        SelectOptions : [
            {
                PropertyName : read,
                Ranges : [
                    {
                        Sign : #I,
                        Option : #EQ,
                        Low : 'true',
                    }
                ],
            }
        ],
    },
    UI.SelectionVariant #Unfinished : {
        Text : 'Unfinished',
        SelectOptions : [
            {
                PropertyName : read,
                Ranges : [
                    {
                        Sign : #I,
                        Option : #EQ,
                        Low : 'false',
                    }
                ],
            }
        ],
    },
    UI.DataPoint #Rating : {
        Value : rating,
        Title : 'Rating',
        Visualization : #Rating,
        MaxRating : 5,
    },
    UI.HeaderInfo : {
        TypeName : 'Book',
        TypeNamePlural : 'Books',
        Title : {
            $Type : 'UI.DataField',
            Value : title,
        },
        Description : {
            $Type : 'UI.DataField',
            Value : author,
        },
    },
    UI.HeaderFacets : [
        {
            $Type : 'UI.ReferenceFacet',
            Target : '@UI.DataPoint#Rating',
            ![@UI.Hidden] : { $edmJson : { $Not : { $Path : 'rating' } } },
        },
    ],
    UI.FieldGroup #Status : {
        $Type : 'UI.FieldGroupType',
        Data : [
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
                Label : 'Priority',
                Value : priority,
                ![@UI.Hidden] : { $edmJson : { $Path : 'read' } },
            },
            {
                $Type : 'UI.DataField',
                Label : 'Rating',
                Value : rating,
                ![@UI.Hidden] : true,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'StatusFacet',
            Label : 'Status',
            Target : '@UI.FieldGroup#Status',
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
            Label : 'Priority',
            Value : priority,
            ![@UI.Hidden] : { $edmJson : { $Path : 'read' } },
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
            $Type : 'UI.DataFieldForAnnotation',
            Label : 'Rating',
            Target : '@UI.DataPoint#Rating',
        },
    ],
);

annotate service.Books with {
    title     @Common.Label : 'Title';
    author    @Common.Label : 'Author';
    read      @Common.Label : 'Read';
    listened  @Common.Label : 'Listened';
    rating    @(Common.Label : 'Rating', UI.Hidden : { $edmJson : { $Not : { $Path : 'read' } } });
    priority  @(
        Common.Label : 'Priority',
        Common.ValueListWithFixedValues : true,
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Priorities',
            Parameters : [{
                $Type : 'Common.ValueListParameterOut',
                LocalDataProperty : priority,
                ValueListProperty : 'name',
            }],
        }
    );
};

