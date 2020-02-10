import { Observable, of, Subject } from 'rxjs';
import { Component, Input } from '@angular/core';

import {
  ContentService, ContentAggregationRequest, BrokenDependenciesFilter,
  ContentSearchType, LifeCycleFilter, ObjectAggregationResult, AggregatorBase, IContentSearchRequest, ContentSearchResult
} from '@picturepark/sdk-v1-angular';

// COMPONENTS
import { AggregationListComponent } from '../../shared-module/components/aggregation-list/aggregation-list.component';
import { SearchHandler } from '../../shared-module/search-utils';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'pp-content-aggregation-list',
  templateUrl: './content-aggregation-list.component.html',
  styleUrls: [
    '../../shared-module/components/aggregation-list/aggregation-list.component.scss',
    './content-aggregation-list.component.scss'
  ],
})
export class ContentAggregationListComponent extends AggregationListComponent {
  @Input()
  public channelId: string;

  @Input()
  public searchHandler: SearchHandler;

  constructor(private contentService: ContentService) {
    super();
  }

  protected fetchData(): Observable<ObjectAggregationResult | null> | Subject<ContentSearchResult> {
    if (this.channelId && this.aggregators && this.aggregators.length) {
      this.isLoading.next(true);
      // const request = new ContentAggregationRequest({
      //   aggregators: this.aggregators,
      //   channelId: this.channelId,
      //   searchString: this.searchString,
      //   brokenDependenciesFilter: BrokenDependenciesFilter.All,
      //   aggregationFilters: this.aggregationFilters,
      //   searchType: ContentSearchType.MetadataAndFullText,
      //   lifeCycleFilter: LifeCycleFilter.ActiveOnly
      // });

      const request2 = {
        aggregators: this.aggregators,
        aggregationFilters: this.aggregationFilters,
        filter: this.filters ? this.filters : undefined,
      };

      this.searchHandler.updateAggregateRequestParameters(request2 as IContentSearchRequest);

      return this.searchHandler.searchResponseSubscription;
      // return this.contentService.aggregate(request);
    }

    return of(null);
  }


  public fetchSearchData = (searchString: string, aggregator: AggregatorBase): Observable<ObjectAggregationResult> => {
    const request = new ContentAggregationRequest({
      channelId: this.channelId,
      searchString: this.searchString,
      brokenDependenciesFilter: BrokenDependenciesFilter.All,
      aggregators: [aggregator],
      aggregationFilters: this.aggregationFilters,
      searchType: ContentSearchType.MetadataAndFullText,
      lifeCycleFilter: LifeCycleFilter.ActiveOnly
    });

    return this.contentService.aggregate(request);
  }
}
