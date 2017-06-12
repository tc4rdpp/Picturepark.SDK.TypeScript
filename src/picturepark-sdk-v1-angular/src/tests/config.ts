import { TestBed } from '@angular/core/testing';
import { PICTUREPARK_URL, PictureparkModule } from '../index';
import { PICTUREPARK_REFRESH_TOKEN } from '../picturepark.servicebase';

export const testUrl = "https://devnext.preview-picturepark.com";
export const testUsername = "picturepark.admin@acme.xxx";
export const testPassword = "1Kx234ss345XHVE90830s94xS";

export function configureTest(){
    TestBed.configureTestingModule({
      imports: [ PictureparkModule ],
      providers: [
        { provide: PICTUREPARK_URL, useValue: testUrl }, 
        { provide: PICTUREPARK_REFRESH_TOKEN, useValue: false }
      ]
    });
    TestBed.compileComponents();
}
