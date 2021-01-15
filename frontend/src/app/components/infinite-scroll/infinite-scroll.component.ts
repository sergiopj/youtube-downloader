import { Component, ViewChild, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import Swal from 'sweetalert2'
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';

// services
import { YoutubeService } from '../../services/youtube.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-infinite-scroll',
  templateUrl: './infinite-scroll.component.html',
  styleUrls: ['./infinite-scroll.component.css']
})
export class InfiniteScrollComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport)

  viewport: CdkVirtualScrollViewport;

  playlistData: Observable<any>;

  channelAvatar: string;

  // para controlar si es video o audio lo que quiere el user de youtube
  isVideo: boolean;

  constructor(public ytService: YoutubeService,
    private spinnerService: NgxSpinnerService,
    private translate: TranslateService
  ) {

  }

  ngOnInit(): void {
    this.ytService.playlistDataObs.subscribe((playListData) => {
      this.playlistData = this.ytService.playlistData;
      this.channelAvatar = this.ytService.channelAvatar;
      this.ytService.showVirtualScroll(true);
      this.modifyScrollwidth();
    })
  }

  modifyScrollwidth() {
    setTimeout(() => {
      const x = document.getElementsByClassName("cdk-virtual-scroll-content-wrapper")[0];
      x.setAttribute("style", "max-width: 100%");
    }, 1100);
  }

  downloadVideo(pl) {

    if (!pl || pl.length < 1) {
      return;
    }

    this.spinnerService.show(undefined, {
      type: "timer",
      size: "large",
      bdColor: "rgba(51,51,51,0.8)",
      color: "white"
    });

    // si es un video normal    
    const videoId = pl.id;

    this.ytService.getVideoInfo(videoId)
      .subscribe(ytInfo => {
        this.spinnerService.hide();
        this.showInfoDlVideo(ytInfo);
      },
        (err) => {
          this.showErrorDownload();
          this.spinnerService.hide();
        });
  }


  // to focus on audio download display
  focus() {
    document.body.scrollIntoView(false);
  }

  // convierte data en un fichero y hace que el navegador lo descarge auto
  forceFileDownload(file: any, fileName: string): void {
    saveAs(file, fileName);
  }

  showInfoDlVideo(videoInfo): void {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-info m-2',
      },
      buttonsStyling: false,
      background: '#555',
    });

    const pos = videoInfo.dataVideo._filename.lastIndexOf(".");

    let filename = videoInfo.dataVideo._filename;
    filename = filename.substr(0, pos < 0 ? filename.length : pos) + '';

    swalWithBootstrapButtons.fire({
      html: `<div class="bg-dark embed-responsive embed-responsive-1by1 border border-dark rounded-lg">
      <video controls width='auto' height='auto'>
        <source src="${videoInfo.dataVideo.url}
        &title=${filename}">
      </video>
    </div>
    <div style="text-align: right" class="m-3">
    <i class="text-white fas fa-hand-point-up"></i>
    </div>
    <div class="card-body text-left">
      <img src="${this.channelAvatar}" alt="Avatar" class="avatar" style="vertical-align: middle;
        border-style: none;
        vertical-align: middle;
        width: 15%;
        height: 15%;
        border-radius: 50%;
        float: left;
        margin-right: 3%">
      <h2 class="text-white">${videoInfo.dataVideo.uploader}</h2>
      <p class="text-white card-text" style="
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        font-size: 1rem;
        opacity: 0.7;">${videoInfo.dataVideo._filename.split('...-')[0].toLowerCase()}</p>
      <div class="mini-info text-center" style="color: white;font-size: 0.6rem;">
        <span class="span-visua">${videoInfo.dataVideo.view_count} visualizaciones</span>
        <span class="span_res">| ${videoInfo.dataVideo.ext}</span>
      </div>`,
      confirmButtonText: this.translate.instant('modal-close-btn')
    }).then((result) => {
      if (result.value) {
        // aqui hacemos la descarga del video        
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          this.translate.instant('cancel-download-title'),
          this.translate.instant('cancel-download-desc'),
          'error'
        )
      }
    });
  }

  showErrorDownload(): void {
    Swal.fire({
      icon: 'error',
      title: 'ERROR',
      text: this.translate.instant('youtube-error'),
    })
  }

  closeScroll() {
    this.ytService.showVirtualScroll(false);
  }


}

