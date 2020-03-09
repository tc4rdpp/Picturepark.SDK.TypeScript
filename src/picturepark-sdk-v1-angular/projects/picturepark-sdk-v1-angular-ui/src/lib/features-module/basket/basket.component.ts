import { Component, Output, EventEmitter, OnInit, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

// LIBRARIES
import { Content, ISearchResult, fetchAll, ContentSearchRequest, LifeCycleFilter, BrokenDependenciesFilter, ContentSearchType, TermsFilter } from '@picturepark/sdk-v1-angular';
import { PICTUREPARK_UI_CONFIGURATION, PictureparkUIConfiguration, ConfigActions } from '../../configuration';

// COMPONENTS
import { BaseComponent } from '../../shared-module/components/base.component';
import {
  ShareContentDialogComponent
} from '../../features-module/share-content-dialog/share-content-dialog.component';

// SERVICES
import { BasketService } from '../../shared-module/services/basket/basket.service';
import { ContentDownloadDialogService } from '../content-download-dialog/content-download-dialog.service';
import { ContentModel } from '../../shared-module/models/content-model';
import { Observable } from 'rxjs';
import { ContentService } from '@picturepark/sdk-v1-angular';

@Component({
  selector: 'pp-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent extends BaseComponent implements OnInit {

  public basketItems: Content[] = [];

  public configActions: ConfigActions;

  @Output()
  public previewItemChange = new EventEmitter<Content>();

  constructor(
    @Inject(PICTUREPARK_UI_CONFIGURATION) private pictureParkUIConfig: PictureparkUIConfiguration,
    private basketService: BasketService,
    private contentService: ContentService,
    private contentDownloadDialogService: ContentDownloadDialogService,
    public dialog: MatDialog,
  ) {

    super();

    const basketSubscription = this.basketService.basketChange.subscribe(async (items) => {
      this.basketItems = (await this.fetch(items).toPromise()).results;
    });
    this.subscription.add(basketSubscription);

  }

  public previewItem(item: Content): void {
    this.previewItemChange.emit(item);
  }

  public downloadItems(): void {
      this.contentDownloadDialogService.showDialog({
        mode: 'multi',
        contents: this.basketItems
      });
  }

  public openShareContentDialog(): void {
      const dialogRef = this.dialog.open(ShareContentDialogComponent, {
        data: this.basketItems,
        autoFocus: false
      });

      dialogRef.componentInstance.title = 'Basket.Share';
  }

  public clearBasket(): void {
    this.basketService.clearBasket();
  }

  public trackByBasket(index, basket: string): string {
    return basket;
  }

  ngOnInit() {
    this.configActions = this.pictureParkUIConfig['BasketComponent'];
  }

  private fetch(items: string[]): Observable<ISearchResult<Content>> {
    return fetchAll(req => this.contentService.search(req), new ContentSearchRequest({
      limit: 1000,
      lifeCycleFilter: LifeCycleFilter.ActiveOnly,
      brokenDependenciesFilter: BrokenDependenciesFilter.All,
      searchType: ContentSearchType.MetadataAndFullText,
      debugMode: false,
      filter: new TermsFilter({
        field: 'id',
        terms: items
      })
    }));
  }

}
