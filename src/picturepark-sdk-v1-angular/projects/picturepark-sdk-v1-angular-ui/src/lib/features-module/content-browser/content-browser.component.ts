import {
  Component, Input, OnChanges, SimpleChanges, Injector
} from '@angular/core';

// LIBRARIES
import {
  ContentService, ThumbnailSize, ContentSearchRequest, SortInfo, SortDirection,
  ContentSearchType, BrokenDependenciesFilter, LifeCycleFilter, Channel, SearchBehavior, Content, ContentSearchResult
} from '@picturepark/sdk-v1-angular';

// COMPONENTS
import { BaseBrowserComponent } from '../../shared-module/components/browser-base/browser-base.component';
import {
  ContentDownloadDialogComponent
} from '../dialog/components/content-download-dialog/content-download-dialog.component';
import {
  ShareContentDialogComponent
} from '../dialog/components/share-content-dialog/share-content-dialog.component';

// SERVICES
import { BasketService } from '../../shared-module/services/basket/basket.service';

// INTERFACES
import { SortingType } from '../../shared-module/models/sorting-type';
import { Observable } from 'rxjs';

// TODO: add virtual scrolling (e.g. do not create a lot of div`s, only that are presented on screen right now)
// currently experimental feature of material CDK
@Component({
  selector: 'pp-content-browser',
  templateUrl: './content-browser.component.html',
  styleUrls: [
    '../../shared-module/components/browser-base/browser-base.component.scss',
    './content-browser.component.scss',
    './content-browser-resp.component.scss'
  ]
})
export class ContentBrowserComponent extends BaseBrowserComponent<Content> implements OnChanges {
  private basketItems: string[] = [];

  public thumbnailSizes = ThumbnailSize;

  public thumbnailSizesArray: string[] = Object.keys(ThumbnailSize).map(key => ThumbnailSize[key]);

  public activeThumbnailSize: ThumbnailSize | null = ThumbnailSize.Medium;

  public isListView = false;

  @Input()
  public channel: Channel | null = null;

  constructor(
    private basketService: BasketService,
    private contentService: ContentService,
    injector: Injector
  ) {

    super('ContentBrowserComponent', injector);

  }

  init() {
    // BASKET SUBSCRIBER
    const basketSubscription = this.basketService.basketChange.subscribe(basketItems => {
      this.basketItems = basketItems;
      this.items.forEach(model => model.isInBasket = basketItems.some(basketItem => basketItem === model.item.id));
    });

    // UNSUBSCRIBE
    this.subscription.add(basketSubscription);
  }

  onScroll(): void {
    this.loadData();
  }

  getSearchRequest(): Observable<ContentSearchResult> | undefined {
    if (!this.channel || !this.channel.id) { return; }

    const request = new ContentSearchRequest({
      debugMode: false,
      pageToken: this.nextPageToken,
      brokenDependenciesFilter: BrokenDependenciesFilter.All,
      filter: this.filter ? this.filter : undefined,
      channelId: this.channel!.id,
      lifeCycleFilter: LifeCycleFilter.ActiveOnly,
      limit: this.pageSize,
      searchString: this.searchString,
      searchType: ContentSearchType.MetadataAndFullText,
      searchBehaviors: [
        SearchBehavior.SimplifiedSearch,
        SearchBehavior.DropInvalidCharactersOnFailure,
        SearchBehavior.WildcardOnSingleTerm
      ],
      sort: this.activeSortingType === this.sortingTypes.relevance ? [] : [
        new SortInfo({
          field: this.activeSortingType,
          direction: this.isAscending ? SortDirection.Asc : SortDirection.Desc
        })
      ]
    });

    return this.contentService.search(request);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channel'] || changes['filter'] || changes['searchString']) {
      this.update();
    }
  }

  public setSortingType(newValue: SortingType): void {
    if (newValue === SortingType.relevance) {
      this.isAscending = null;
    } else if (this.isAscending === null) {
      this.isAscending = true;
    }

    this.activeSortingType = newValue;
    this.update();
  }

  public previewSelectedItem(): void {
    this.previewItem(this.selectedItems[0]);
  }

  public trackByThumbnailSize(index: number, thumbnailSize: string): string {
    return thumbnailSize;
  }

  // OPEN SHARE CONTENT DIALOG
  openShareContentDialog(): void {

    const dialogRef = this.dialog.open(ShareContentDialogComponent, {
      data: this.selectedItems,
      autoFocus: false
    });

    const instance = dialogRef.componentInstance;
    instance.title = 'ShareContentDialog.CreateShare';

  }

  // OPEN DOWNLOAD CONTENT DIALOG
  openDownloadContentDialog(): void {

    const dialogRef = this.dialog.open(ContentDownloadDialogComponent, {
      data: this.items.filter(i => i.isSelected).map(i => i.item),
      autoFocus: false
    });

    const instance = dialogRef.componentInstance;
    instance.title = 'ContentDownloadDialog.Title';

  }

  // CHECK IF ELEMENT CONTAINS CLASS NAME
  checkContains(elementClassName: string): boolean {
    const containClasses = ['browser__items'];
    return containClasses.some(iClass => elementClassName.includes(iClass));
  }

}