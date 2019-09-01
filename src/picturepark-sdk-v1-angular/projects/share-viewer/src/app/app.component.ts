import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { ShareDetail, IMailRecipient, ShareService, ShareDataBasic, ShareContentDetail } from '@picturepark/sdk-v1-angular';
import { MatDialog } from '@angular/material/dialog';
import { ContentDetailsDialogComponent } from '@picturepark/sdk-v1-angular-ui';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnChanges {
  public searchString: string;
  public shareDetail: ShareDetail;
  public mailRecipients: IMailRecipient[];

  constructor(private shareService: ShareService, private dialog: MatDialog) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchString']) {
      this.update(this.searchString);
    }
  }

  update(searchString: string): void {
    if (!searchString) {
      return;
    }

    this.shareService.getShareJson(searchString).subscribe(i => {
      this.shareDetail = ShareDetail.fromJS(i);
      this.mailRecipients = (this.shareDetail.data as ShareDataBasic).mailRecipients!;
    });
  }

  showDetail(item: ShareContentDetail): void {
    this.dialog.open(ContentDetailsDialogComponent,
      { data: { id: item.id, shareContent: item}, width: '980px', height: '700px' }
    );
  }
}
