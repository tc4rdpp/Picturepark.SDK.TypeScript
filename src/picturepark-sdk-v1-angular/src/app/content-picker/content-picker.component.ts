import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription, Observable } from 'rxjs';

// LIBRARIES
import {
  AggregationResult, Channel, FilterBase, Content, AggregatorBase, ContentService, ContentAggregationRequest,
  LifeCycleFilter, ContentSearchType, BrokenDependenciesFilter, ContentSearchRequest, SearchBehavior, SortInfo, SortDirection, ContentSearchResult, IContentSearchRequest
} from '@picturepark/sdk-v1-angular';
import { ContentItemSelectionService, BasketService, ContentModel, ContentBrowserComponent } from '@picturepark/sdk-v1-angular-ui';

// COMPONENTS
import { ContentDetailsDialogComponent } from '@picturepark/sdk-v1-angular-ui';

// SERVICES
import { EmbedService } from './embed.service';
import { ContentDetailDialogOptions } from 'projects/picturepark-sdk-v1-angular-ui/src/lib/features-module/content-details-dialog/ContentDetailDialogOptions';

@Component({
  templateUrl: './content-picker.component.html',
  styleUrls: ['./content-picker.component.scss']
})
export class ContentPickerComponent implements OnInit, OnDestroy {
  public basketItemsCount = 0;

  public selectedItems: Content[] = [];

  public searchText = '';
  public selectedChannel: Channel | null = null;
  public selectedFilter: FilterBase | null = null;

  public aggregations: AggregationResult[] = [];

  public detailsItemId: string | undefined = undefined;

  public loading = false;
  public messagePosted = false;
  public postUrl = '';

  private subscription: Subscription = new Subscription();

  public get deviceBreakpoint(): boolean {
    return this.breakpointObserver.isMatched([Breakpoints.Handset, Breakpoints.Tablet]);
  }

  @ViewChild(ContentBrowserComponent, { static: false }) contentBrowserComponent: ContentBrowserComponent;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private embedService: EmbedService,
    private basketService: BasketService,
    private contentService: ContentService,
    public contentItemSelectionService: ContentItemSelectionService<Content>,
    public breakpointObserver: BreakpointObserver
  ) { }

  public openDetails(item: ContentModel<Content>) {

    let index = this.contentBrowserComponent.items.indexOf(item);
    this.dialog.open(ContentDetailsDialogComponent,
      {
        data: <ContentDetailDialogOptions>{
          id: item.item.id,
          showMetadata: true,
          hasPrevious: () => {
            return index !== 0;
          },
          hasNext: () => {
            return this.contentBrowserComponent.items.length > index + 1;
          },
          previous: () => {
            index--;
            return this.contentBrowserComponent.items[index].item.id;
          },
          next: () => {
            index++;
            return this.contentBrowserComponent.items[index].item.id;
          }
        },
        autoFocus: false,
        width: '980px',
        height: '700px'
      }
    );
  }

  public ngOnInit() {
    const basketSubscription = this.basketService.basketChange.subscribe(items => this.basketItemsCount = items.length);
    this.subscription.add(basketSubscription);

    if (this.route.snapshot.queryParams['postUrl']) {
      this.postUrl = this.route.snapshot.queryParams['postUrl'];
    }
  }

  public selectionChange(items: Content[]): void {
    this.selectedItems = items;
  }

  public async embed() {
    try {
      this.loading = true;
      this.messagePosted = await this.embedService.embed(this.selectedItems, this.postUrl);
    } finally {
      this.loading = false;
    }
  }

  public changeSearchQuery(query: string) {
    this.searchText = query;
  }

  public changeChannel(channel: Channel) {
    this.selectedChannel = channel;
  }

  public aggregate = (aggregators: AggregatorBase[]) => {
    return this.contentService.aggregate(new ContentAggregationRequest({
      aggregators: aggregators,
      lifeCycleFilter: LifeCycleFilter.ActiveOnly,
      searchType: ContentSearchType.Metadata,
      brokenDependenciesFilter: BrokenDependenciesFilter.All,
      filter: this.selectedFilter ? this.selectedFilter : undefined
    }));
  }




  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}




export class SearchHandler {

  private searchResponseSubscription: Observable<ContentSearchResult>;

  private searchRequestParameters: IContentSearchRequest;
  private aggregateRequestParameters: IContentSearchRequest;


  constructor() {
  }


  public search = () => {


    const request = new ContentSearchRequest({
      debugMode: false,
      pageToken: this.searchRequestParameters.pageToken,
      brokenDependenciesFilter: BrokenDependenciesFilter.All,
      filter: this.searchRequestParameters.filter ? this.searchRequestParameters.filter : undefined,
      channelId: this.searchRequestParameters.channelId,
      lifeCycleFilter: LifeCycleFilter.ActiveOnly,
      limit: this.searchRequestParameters.limit,
      searchString: this.searchRequestParameters.searchString,
      searchType: ContentSearchType.MetadataAndFullText,
      aggregators: this.aggregateRequestParameters.aggregators,
      aggregationFilters: this.aggregateRequestParameters.aggregationFilters, 
      searchBehaviors: [
        SearchBehavior.SimplifiedSearch,
        SearchBehavior.DropInvalidCharactersOnFailure,
        SearchBehavior.WildcardOnSingleTerm
      ],
      sort: this.searchRequestParameters.activeSortingType.field === 'relevance' ? [] : [
        new SortInfo({
          field: this.searchRequestParameters.activeSortingType.field,
          direction: this.searchRequestParameters.isAscending ? SortDirection.Asc : SortDirection.Desc
        })
      ]
    });

    

    // const request = new ContentSearchRequest({
    //   debugMode: false,
    //   // pageToken: this.nextPageToken,
    //   brokenDependenciesFilter: BrokenDependenciesFilter.All,
    //   filter: this.selectedFilter || undefined,
    //   channelId: this.selectedChannel.id,
    //   lifeCycleFilter: LifeCycleFilter.ActiveOnly,
    //   limit: 75,
    //   searchString: this.searchText,
    //   searchType: ContentSearchType.MetadataAndFullText,
    //   searchBehaviors: [
    //     SearchBehavior.SimplifiedSearch,
    //     SearchBehavior.DropInvalidCharactersOnFailure,
    //     SearchBehavior.WildcardOnSingleTerm
    //   ],
    //   aggregators: this.selectedChannel.aggregations
    //   // sort: this.activeSortingType.field === 'relevance' ? [] : [
    //   //   new SortInfo({
    //   //     field: this.activeSortingType.field,
    //   //     direction: this.isAscending ? SortDirection.Asc : SortDirection.Desc
    //   //   })
    //   // ]
    // });

    this.searchResponseSubscription = this.contentService.search(request);
  }

  
}