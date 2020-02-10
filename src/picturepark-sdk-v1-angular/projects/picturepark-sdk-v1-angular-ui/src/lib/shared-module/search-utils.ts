import { IContentSearchRequest, ContentSearchResult, ContentService, ContentSearchRequest } from '@picturepark/sdk-v1-angular';
import { Subject } from 'rxjs';
import * as _ from 'lodash';

export class SearchHandler {

    public searchResponseSubscription: Subject<ContentSearchResult> = new Subject<ContentSearchResult>();
    public searchResponseUpdated: Subject<boolean> = new Subject<boolean>();

    private searchRequestParameters: IContentSearchRequest;
    private aggregateRequestParameters: IContentSearchRequest;

    private requestParametersUpdated = false;
    private lastSearchResults: ContentSearchResult;

    constructor(private contentService: ContentService) {
    }

    public search = () => {
        // const request = new ContentSearchRequest({
        //   debugMode: false,
        //   pageToken: this.searchRequestParameters.pageToken,
        //   brokenDependenciesFilter: BrokenDependenciesFilter.All,
        //   filter: this.searchRequestParameters.filter ? this.searchRequestParameters.filter : undefined,
        //   channelId: this.searchRequestParameters.channelId,
        //   lifeCycleFilter: LifeCycleFilter.ActiveOnly,
        //   limit: this.searchRequestParameters.limit,
        //   searchString: this.searchRequestParameters.searchString,
        //   searchType: ContentSearchType.MetadataAndFullText,
        //   aggregators: this.aggregateRequestParameters.aggregators,
        //   aggregationFilters: this.aggregateRequestParameters.aggregationFilters,
        //   searchBehaviors: [
        //     SearchBehavior.SimplifiedSearch,
        //     SearchBehavior.DropInvalidCharactersOnFailure,
        //     SearchBehavior.WildcardOnSingleTerm
        //   ],
        //   sort: this.searchRequestParameters.activeSortingType.field === 'relevance' ? [] : [
        //     new SortInfo({
        //       field: this.searchRequestParameters.activeSortingType.field,
        //       direction: this.searchRequestParameters.isAscending ? SortDirection.Asc : SortDirection.Desc
        //     })
        //   ]
        // });

        debugger;
        if (this.searchRequestParameters && this.aggregateRequestParameters) {
            if (this.requestParametersUpdated) {
                this.requestParametersUpdated = false;
                const request = new ContentSearchRequest({
                    ...this.searchRequestParameters,
                    ...this.aggregateRequestParameters
                });

                this.contentService.search(request).subscribe(results => {
                    this.lastSearchResults = results;
                    this.searchResponseSubscription.next(results);
                    this.searchResponseUpdated.next(true);
                });
            } else {
                this.searchResponseSubscription.next(this.lastSearchResults);
            }

        }
    }

    public updateSearchRequestParameters(searchRequestParameters: IContentSearchRequest) {
        if ( !this.searchRequestParameters || !_.isEqual(this.searchRequestParameters, searchRequestParameters)) {
            this.requestParametersUpdated = true;
        }
        this.searchRequestParameters = searchRequestParameters;
        this.search();
    }

    public updateAggregateRequestParameters(aggregateRequestParameters: IContentSearchRequest) {
        if ( !this.aggregateRequestParameters || !_.isEqual(this.aggregateRequestParameters, aggregateRequestParameters)) {
            this.requestParametersUpdated = true;
        }
        this.aggregateRequestParameters = aggregateRequestParameters;
        this.search();
    }
}
