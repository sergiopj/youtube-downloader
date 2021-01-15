// modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatCardModule } from '@angular/material/card';
import { ReadMoreModule } from 'ng-readmore';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SAVER, getSaver } from './services/saver.provider';
import { TranslateHttpLoader} from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json'); 
}


// components
import { AppComponent } from './app.component';
import { YoutubeMenuComponent } from './components/youtube-menu/youtube-menu.component';
import { ConvertMenuComponent } from './components/convert-menu/convert-menu.component';
import { DownloadInfoComponent } from './components/download-info/download-info.component';
import { InfiniteScrollComponent } from './components/infinite-scroll/infinite-scroll.component';


// services
import { YoutubeService } from './services/youtube.service';
import { ConvertService } from './services/convert.service';


@NgModule({
  declarations: [
    AppComponent,
    YoutubeMenuComponent,
    ConvertMenuComponent,
    DownloadInfoComponent,
    InfiniteScrollComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    HttpModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ScrollingModule,
    MatCardModule,
    ReadMoreModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  providers: [
    YoutubeService,
    ConvertService,
    {provide: SAVER, useFactory: getSaver}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
