import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs } from 'file-saver';

import { URL_SERVICES } from '../../config/urls';

// services
import { YoutubeService } from '../../services/youtube.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-youtube-menu',
  templateUrl: './youtube-menu.component.html',
  styleUrls: ['./youtube-menu.component.css']
})
export class YoutubeMenuComponent implements OnInit {

  youtubeUrl = '';

  youtubePlUrl: string = '';

  // para controlar si es video o audio lo que quiere el user de youtube
  isVideo: boolean;

  // deshabilita/habilita botones de convertir files o select de formato
  enabledDlButton: false;
  enabledInputSelect: false;

  audioFileName: string;

  channelAvatar: string;

  constructor(public ytService: YoutubeService,
    private spinnerService: NgxSpinnerService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
  }

  // get youtube video info
  getYtInfo(formData: NgForm): void {

    const videoUrl = formData.value.ytUrl;

    if (!formData.valid || videoUrl.length < 1) {
      return;
    }

    this.spinnerService.show(undefined, {
      type: 'timer',
      size: 'large',
      bdColor: 'rgba(51,51,51,0.8)',
      color: 'white'
    });

    // para url desde navegador o movil-app
    const videoId = videoUrl.split('watch?v=')[1] || videoUrl.split('youtu.be/')[1];

    if (this.isVideo) {
      this.ytService.getVideoInfo(videoId)
        .subscribe(ytInfo => {
          formData.reset();
          this.spinnerService.hide();
          this.showInfoDlYt(ytInfo);
        },
          (err) => {
            formData.reset();
            this.showErrorDownload();
            this.spinnerService.hide();
          });
    } else {
      // comprobar si ya hay un audio en descarga
      this.ytService.getAudioInfo(videoId)
        .subscribe(ytInfo => {
          formData.reset();
          this.spinnerService.hide();
          this.showInfoDlYt(ytInfo);
        },
          (err) => {
            formData.reset();
            this.showErrorDownload();
            this.spinnerService.hide();
          });
    }
  }

  getPLInfo(formData: NgForm) {

    this.spinnerService.show(undefined, {
      type: "timer",
      size: "large",
      bdColor: "rgba(51,51,51,0.8)",
      color: "white"
    });

    const plUrl = formData.value.ytPlUrl;

    if (!formData.valid) {
      return;
    }

    let plId = plUrl.split('list=')[1];
    plId = plId.split('&index=')[0];

    this.ytService.getPlaylistInfo(plId).subscribe((data: any) => {
      formData.reset();
      this.spinnerService.hide();
      this.ytService.showVirtualScroll(true);
    },
      err => {
        formData.reset();
        this.spinnerService.hide();
        this.showErrorDownload();
      });

  }

  setVideoType() {
    this.isVideo = true;
  }
  setAudioType() {
    this.isVideo = false;
  }

  showInfoDlYt(videoInfo): void {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-info m-2',
        cancelButton: 'btn btn-danger m-2'
      },
      buttonsStyling: false,
      background: '#555',
    });

    const pos = this.isVideo ? videoInfo.dataVideo._filename.lastIndexOf('.') : videoInfo.dataAudio._filename.lastIndexOf('.');
    let filename = this.isVideo ? videoInfo.dataVideo._filename : videoInfo.dataAudio._filename;
    filename = filename.substr(0, pos < 0 ? filename.length : pos) + '';

    this.channelAvatar = this.ytService.channelAvatar;

    // si es video
    if (this.isVideo) {
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
                <h2 class="text-white">${this.isVideo ? videoInfo.dataVideo.uploader
            : videoInfo.dataAudio.uploader}</h2>
                <p class="text-white card-text" style="
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  font-size: 1rem;
                  opacity: 0.7;">${this.isVideo ? videoInfo.dataVideo._filename.split('...-')[0].toLowerCase()
                  : videoInfo.dataAudio._filename.split('...-')[0].toLowerCase()}...</p>
                <div class="mini-info text-center" style="color: white;font-size: 0.6rem;">
                  <span class="span-visua">${this.isVideo ? videoInfo.dataVideo.view_count
            : videoInfo.dataAudio.view_count} visualizaciones</span>
                  <span class="span_res">| ${this.isVideo ? videoInfo.dataVideo.ext : videoInfo.dataAudio.ext}</span>
                </div>`
        ,
        confirmButtonText: this.translate.instant('modal-close-btn')
      }).then((result) => {
        if (result.value) {
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            this.translate.instant('cancel-download-title'),
            this.translate.instant('cancel-download-desc'),
            'error'
          );
        }
      });
    } else {
      // si es audio
      const swalBootstButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-info m-2',
          cancelButton: 'btn btn-danger m-2'
        },
        buttonsStyling: false,
      });

      // filesize
      const filesize = videoInfo.dataAudio.filesize;

      swalBootstButtons.fire({
        title: `<h3><strong>${filename.toLowerCase()}.mp3</strong></h3>`,
        html: `<small>${this.translate.instant('filesize-text')} ${filesize !== null ? Math.round(videoInfo.dataAudio.filesize / 1000000)
          : 'unknow'} megas</small>`,
        imageUrl: videoInfo.dataAudio.thumbnail,
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: 'Custom image',
        showCancelButton: true,
        confirmButtonText: this.translate.instant('btn-download-ok'),
        cancelButtonText: this.translate.instant('btn-download-cancel'),
        reverseButtons: false
      }).then((result) => {
        // si ya hay un audio descargandose cancelamos
        if (this.ytService.audioIsDownloading) {
          // TODO translate
          Swal.fire({
            title: this.translate.instant('audio-dl-occupied'),
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            }
          });
          return;
        }
        if (result.value) {
          const ytUrlAudio = `${URL_SERVICES}/ytDownload/${videoInfo.dataAudio.id}`;
          this.ytService.setDownloadFileInfo(filename, ytUrlAudio);
          setTimeout(() => {
            this.focus();
          }, 50);
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          const swalWithBtstrButtonsCancel = Swal.mixin({
            text: '#555',
          });
          swalWithBtstrButtonsCancel.fire(
            this.translate.instant('cancel-download-title'),
            this.translate.instant('cancel-download-desc'),
            'error'
          );
        }
      });
    }
  }

  // to focus on audio download display
  focus() {
    document.body.scrollIntoView(false);
  }

  // convierte data en un fichero y hace que el navegador lo descarge auto
  forceFileDownload(file: any, fileName: string): void {
    saveAs(file, `${fileName}.mp3`);
  }

  showErrorDownload(): void {
    Swal.fire({
      icon: 'error',
      title: 'ERROR',
      text: this.translate.instant('youtube-error'),
    });
  }

}
