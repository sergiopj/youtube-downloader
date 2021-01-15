import { Injectable, Output, EventEmitter, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Http } from '@angular/http';
import { URL_SERVICES } from '../config/urls';
import { Observable, Subject, onErrorResumeNext } from 'rxjs';
import { download, Download } from '../components/download-info/download';
import { SAVER, Saver } from './saver.provider'

// models
import { YtbVideo } from '../models/YtbVideo.model';
import { YtbPlayList } from '../models/YtbPlayList.model';



@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  @Output() change: EventEmitter<YtbVideo> = new EventEmitter();

  public newYtbVideo: YtbVideo;

  public idPl: string;
  public channelAvatar: string;

  public audioIsDownloading = false;

  public newYtbPlayList: YtbPlayList;

  public playlistData: Observable<any>;
  public playlistDataChanges: Subject<any> = new Subject<any>();
  public playlistDataObs = this.playlistDataChanges.asObservable();

  public showPlayListScroll: boolean = false;
  public showPlayListScrollChanges: Subject<any> = new Subject<any>();
  public showPlayListScrollObs = this.showPlayListScrollChanges.asObservable();

  // youtubeUrl
  public youtubeUrl: Observable<any>;
  public youtubeUrlChanges: Subject<any> = new Subject<any>();
  public youtubeUrlObs = this.youtubeUrlChanges.asObservable();

  // youtube audio filename
  public ytAudioFl: Observable<any>;
  public ytAudioFlChanges: Subject<any> = new Subject<any>();
  public ytAudioFlObs = this.ytAudioFlChanges.asObservable();

  constructor(public httpClient: HttpClient, public http: Http, @Inject(SAVER) private save: Saver) { }

  /* Obtiene info de un video de youtube */
  getVideoInfo(id: string): Observable<YtbVideo> {
    const url = `${URL_SERVICES}/ytVideo/${id}`;
    return this.httpClient.get(url)
      .pipe(map((videoInfo: YtbVideo) => {
        this.channelAvatar = videoInfo['dataVideo'].channelThumbnailUrl;
        return videoInfo;
      }));
  };

  /* Obtiene info de un video de youtube */
  getAudioInfo(id: string): Observable<YtbVideo> {
    const url = `${URL_SERVICES}/ytAudio/${id}`;
    return this.httpClient.get(url)
      .pipe(map((audioInfo: YtbVideo) => audioInfo));
  }; 


  
    getPlaylistInfo(id: string): Observable<YtbPlayList> {
      const url = `${URL_SERVICES}/ytPlaylist/${id}`;
      return this.httpClient.get(url)
        .pipe(map((plInfo: YtbPlayList) => {
          this.idPl = plInfo['playlist'].id;
          this.playlistData = plInfo['playlist'].items;
          this.channelAvatar = plInfo['playlist'].author['bestAvatar'].url;  
          this.playlistDataChanges.next();
          return plInfo
        }));
    };
  
    showVirtualScroll(set: boolean): void {
      this.showPlayListScroll = set;
      this.showPlayListScrollChanges.next();
    }


  downloadAudioFile(url: string, filename?: string): Observable<Download> {
    return this.httpClient.get(url, {
      reportProgress: true,
      observe: 'events',
      responseType: 'blob'
    }).pipe(download(blob => {
      try {
        this.save(blob, filename + '.mp3');
        console.log('Descargado el audio ', filename);
      } catch (error) {
        console.log('No se ha podido descargar el audio ', filename);
      }
    }));
  }

  blob(url: string, filename?: string): Observable<Blob> {
    return this.httpClient.get(url, {
      responseType: 'blob'
    })
  }

  setDownloadFileInfo(name: any, url: any): void {
    this.ytAudioFl = name;
    this.youtubeUrl = url;
    this.youtubeUrlChanges.next();
    this.ytAudioFlChanges.next();
  }

}
