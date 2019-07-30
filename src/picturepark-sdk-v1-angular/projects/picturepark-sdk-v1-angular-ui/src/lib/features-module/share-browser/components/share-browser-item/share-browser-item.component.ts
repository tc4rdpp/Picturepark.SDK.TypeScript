    
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { switchMap } from 'rxjs/operators';

// LIBRARIES
import { ThumbnailSize, Share, ContentService } from '@picturepark/sdk-v1-angular';

// COMPONENTS
import { BaseBrowserItemComponent } from '../../../../shared-module/components/browser-item-base/browser-item-base.component';

@Component({
  selector: 'pp-share-browser-item',
  templateUrl: './share-browser-item.component.html',
  styleUrls: [
    '../../../../shared-module/components/browser-item-base/browser-item-base.component.scss',
    './share-browser-item.component.scss'
  ]
})
export class ShareBrowserItemComponent extends BaseBrowserItemComponent<Share> implements OnChanges, OnInit {

  // VARS
  public thumbnailSizes = ThumbnailSize;

  public isLoading = true;

  public thumbnailUrl: SafeUrl | null = null;
  public thumbnailUrls: SafeUrl[] = [];

  constructor(
    private contentService: ContentService,
    private sanitizer: DomSanitizer
  ) {
    super();
  }


  public getThumbnails(contentIds: string[]): void {

    const contentIdsReq = contentIds.slice(0, 3);

    Promise.all(contentIdsReq.map(contentId => {
      return this.contentService.downloadThumbnail(
        contentId,
        this.isListView ? ThumbnailSize.Small : this.thumbnailSize as ThumbnailSize || ThumbnailSize.Medium,
        null,
        null);

    })).then(vals => {
      vals.map(val => {
        const downloadSubscription = val.subscribe(response => {
          if (response) {
            this.thumbnailUrls.push(this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(response.data)));
          }
        });
        this.subscription.add(downloadSubscription);
      });
      this.isLoading = false;
    }).catch(err => {
      console.log(err);
    });

  }

  public ngOnInit(): void {
    this.getThumbnails(this.itemModel.item.contentIds);
  }

  public ngOnChanges(changes: SimpleChanges): void {

    if (changes['thumbnailSize'] && this.isVisible) {
      const updateImage =
        (changes['thumbnailSize'].firstChange) ||
        (changes['thumbnailSize'].previousValue === ThumbnailSize.Small && this.isListView === false) ||
        (changes['thumbnailSize'].previousValue === ThumbnailSize.Medium && this.thumbnailSize === ThumbnailSize.Large);

      if (updateImage) {

        this.isLoading = true;
        this.thumbnailUrl = null;
        this.loadItem.next();
      }
    }
  }
}