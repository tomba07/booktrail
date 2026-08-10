using CatalogService as service from '../../srv/catalog-service';
annotate service.Books with @(
    UI.SelectionFields : [
        finished,
        author,
    ],
    UI.PresentationVariant : {
        SortOrder : [{
            Property : priority,
            Descending : true,
        }],
        Visualizations : ['@UI.LineItem'],
    },
    UI.SelectionPresentationVariant #All : {
        Text : 'All',
        SelectionVariant : { SelectOptions : [] },
        PresentationVariant : {
            SortOrder : [{ Property : priority, Descending : true }],
            Visualizations : ['@UI.LineItem'],
        },
    },
    UI.SelectionPresentationVariant #Finished : {
        Text : 'Finished',
        SelectionVariant : {
            SelectOptions : [{
                PropertyName : finished,
                Ranges : [{ Sign : #I, Option : #EQ, Low : 'true' }],
            }],
        },
        PresentationVariant : {
            SortOrder : [{ Property : priority, Descending : true }],
            Visualizations : ['@UI.LineItem'],
        },
    },
    UI.SelectionPresentationVariant #Unfinished : {
        Text : 'Unfinished',
        SelectionVariant : {
            SelectOptions : [{
                PropertyName : finished,
                Ranges : [{ Sign : #I, Option : #EQ, Low : 'false' }],
            }],
        },
        PresentationVariant : {
            SortOrder : [{ Property : priority, Descending : true }],
            Visualizations : ['@UI.LineItem'],
        },
    },
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
        ImageUrl : coverUrl,
    },
    UI.DataPoint #Priority : {
        Value : priority,
        Title : 'Priority',
    },
    UI.HeaderFacets : [
        {
            $Type : 'UI.ReferenceFacet',
            Target : '@UI.DataPoint#Rating',
            ![@UI.Hidden] : { $edmJson : { $Not : { $Path : 'rating' } } },
        },
        {
            $Type : 'UI.ReferenceFacet',
            Target : '@UI.DataPoint#Priority',
            ![@UI.Hidden] : { $edmJson : { $Not : { $Path : 'priority' } } },
        },
    ],
    UI.FieldGroup #Status : {
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
                Label : 'Cover URL',
                Value : coverUrl,
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
                Label : 'Started',
                Value : startedAt,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Finished on',
                Value : finishedAt,
                ![@UI.Hidden] : { $edmJson : { $Not : { $Path : 'finished' } } },
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
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'TagsFacet',
            Label : 'Tags',
            Target : 'tags/@UI.LineItem#Tags',
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
            Label : 'Finished',
            Value : finished,
        },
        {
            $Type : 'UI.DataFieldForAnnotation',
            Label : 'Rating',
            Target : '@UI.DataPoint#Rating',
        },
    ],
);

annotate service.Books with {
    coverUrl  @(
        Common.Label : 'Cover',
        UI.IsImageURL : true
    );
    author    @Common.Label : 'Author';
    read      @Common.Label : 'Read';
    listened  @Common.Label : 'Listened';
    startedAt  @Common.Label : 'Started';
    finishedAt @Common.Label : 'Finished on';
    finished  @Common.Label : 'Finished';
    rating    @(Common.Label : 'Rating', UI.Hidden : { $edmJson : { $Not : { $Path : 'read' } } });
    priority  @(
        Common.Label : 'Priority',
        UI.Hidden : false
    );
};

annotate service.Books with @Common.SemanticKey : [title];

annotate service.Tags with @(
    UI.HeaderInfo : {
        TypeName : 'Tag',
        TypeNamePlural : 'Tags',
        Title : { $Type : 'UI.DataField', Value : name },
    },
    UI.LineItem : [{
        $Type : 'UI.DataField',
        Value : name,
        Label : 'Name',
    }],
    UI.SelectionFields : [ name ],
    UI.FieldGroup #TagDetails : {
        Data : [{
            $Type : 'UI.DataField',
            Value : name,
            Label : 'Name',
        }],
    },
    UI.Facets : [{
        $Type : 'UI.ReferenceFacet',
        ID : 'TagDetailsFacet',
        Label : 'Tag',
        Target : '@UI.FieldGroup#TagDetails',
    }],
);

annotate service.Tags with {
    name @Common.Label : 'Tag';
};

annotate service.Books with @(
    Capabilities.FilterRestrictions : {
        NonFilterableProperties : [ IsActiveEntity ]
    }
);

annotate service.Books_Tags with @(
    UI.LineItem #Tags : [{
        $Type : 'UI.DataField',
        Value : tag_ID,
        Label : 'Tag',
    }],
);

annotate service.Books_Tags with {
    tag @(
        Common.Text : tag.name,
        Common.TextArrangement : #TextOnly,
        Common.Label : 'Tag',
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Tags',
            Parameters : [{
                $Type : 'Common.ValueListParameterOut',
                LocalDataProperty : tag_ID,
                ValueListProperty : 'ID',
            },{
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'name',
            }],
        }
    );
};

