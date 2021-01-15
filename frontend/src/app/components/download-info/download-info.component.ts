import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { YoutubeService } from '../../services/youtube.service';

@Component({
  selector: 'app-download-info',
  templateUrl: './download-info.component.html',
  styleUrls: ['./download-info.component.css']
})
export class DownloadInfoComponent implements OnInit {

  ytAudioFl: Observable<any>;
  ytAudioUrl: Observable<any>;

  downloadAudioState: string;
  downloadProgress: number;

  slides: any = { name: this.ytService.ytAudioFl, url: this.ytService.youtubeUrl };

  downloadAudioFile$: any;

  constructor(
    public ytService: YoutubeService,
    @Inject(DOCUMENT) private document: Document) {
  }

  ngOnInit(): void {
    this.ytService.ytAudioFlObs.subscribe(() => {
      this.ytAudioFl = this.ytService.ytAudioFl;
      this.slides.name = this.ytAudioFl;
    });
    this.ytService.youtubeUrlObs.subscribe((ytUrl) => {
      this.ytAudioUrl = this.ytService.youtubeUrl;
      this.slides.url = this.ytAudioUrl;
    });
  }


  download({ name, url }: { name: any, url: any }) {
    this.downloadAudioFile$ = this.ytService.downloadAudioFile(url, name).subscribe(res => {
      this.ytService.audioIsDownloading = true;
      console.log(res.state);
      this.downloadAudioState = res.state;
      this.downloadProgress = res.progress;
      console.log(res.progress);
      if (res.state === 'DONE') {
        this.slides.name = '';
        this.slides.url = '';
        this.ytService.audioIsDownloading = false;
      }
    });
  }

}
