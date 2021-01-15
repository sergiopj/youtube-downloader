import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConvertService } from 'src/app/services/convert.service';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-convert-menu',
  templateUrl: './convert-menu.component.html',
  styleUrls: ['./convert-menu.component.css']
})
export class ConvertMenuComponent implements OnInit {

  constructor(private spinnerService: NgxSpinnerService,
    private convertService: ConvertService,
    private translate: TranslateService) {
  }

  ngOnInit(): void {
  }

  // para controlar si es video o audio lo que quiere el user de youtube
  isVideo: boolean = true;

  // deshabilita/habilita botones de convertir files o select de formato
  enabledDlButton: boolean = false;
  enabledInputSelect: boolean = false;

  // formatos a usar en la conversion
  convertList: string[]; // default video format

  // por defecto
  selectedConvertExt: string;

  // upload files 
  uploadFile: File;
  filename: string;

  // input file text
  inputFileText: string;

  // file ya renderizado
  convertedFile: Blob;

  spinnerText: string;

  selectFile(file: File): void {
    // si el input no tiene file...
    if (!file || file === undefined) {
      this.uploadFile = null;
      return;
    }
    let fileType = file.type.split('/')[0];
    let fileExt = file.type.split('/')[1];

    if (fileExt === 'webm') {
      fileType = 'audio';
    }

    if (fileType === 'video') {
      this.isVideo = true;
      this.selectedConvertExt = 'avi';
    } else {
      this.isVideo = false;
      this.selectedConvertExt = 'mp3';
    }

    this.inputFileText = file.name.split('...-')[0].substr(0, 15) + '...';
    this.uploadFile = file;
    this.enabledInputSelect = true;
    this.enabledDlButton = true;
    this.dropOutputArrayValue(this.uploadFile);
  }

  // drop selectec output format in array
  dropOutputArrayValue(file: File): void {

    let fileType = file.type.split('/')[0];
    let fileExt = file.type.split('/')[1];
    if (fileExt === 'webm') {
      fileType = 'audio';
    }
    if (fileType === 'video') {
      this.convertList = ['avi', 'mp4', 'mpeg', 'mp3'];
      let outputFileExt = this.uploadFile.type.split('/')[1];
      if (outputFileExt === 'x-msvideo') {
        outputFileExt = 'avi';
      }
      const index = this.convertList.indexOf(outputFileExt);
      if (index > -1) {
        this.convertList.splice(index, 1);
      }

    } else {
      this.convertList = ['mp3', 'wav', 'flac', 'ogg', 'mpeg', 'webm'];
      let outputFileExt = this.uploadFile.type.split('/')[1];
      const index = this.convertList.indexOf(outputFileExt);
      if (index > -1) {
        this.convertList.splice(index, 1);
      }
    }
  }

  // modal para mostrar errores
  showErrorModal(title: string, text: string): void {
    Swal.fire({
      icon: 'error',
      title,
      text
    })
  }

  selectFormatOption(convertExtension: string): void {
    this.selectedConvertExt = convertExtension;
  }

  convertFile(fileType: string): void {

    if (fileType !== 'video' && fileType !== 'audio') {
      this.spinnerService.hide();
      // modal con el fallo
      this.showErrorModal(
        this.translate.instant('error-convert-title'),
        this.translate.instant('error-convert-desc-format')
      );
    }


    this.spinnerService.show(undefined, {
      type: 'square-spin',
      size: 'large',
      bdColor: 'rgba(51,51,51,0.8)',
      color: 'white'
    });

    const fileSize = this.uploadFile.size;

    // validar tamaño archivo
    if (fileType === 'video' && (fileSize / 1000000) > 150) {
      this.spinnerService.hide();
      this.showErrorModal(
        this.translate.instant('video-convert-warning'),
        this.translate.instant('video-size-warning')
      );
      return;
    }

    if (fileType === 'audio' && (fileSize / 1000000) > 100) {
      this.spinnerService.hide();
      this.showErrorModal(
        this.translate.instant('audio-convert-warning'),
        this.translate.instant('audio-size-warning')
      );
      return;
    }

    const pos = this.uploadFile.name.lastIndexOf(".");
    this.filename = this.uploadFile.name;
    this.filename = this.filename.substr(0, pos < 0 ? this.filename.length : pos) + '.' + this.selectedConvertExt;

    this.convertService.convertFile(this.uploadFile, this.selectedConvertExt, fileType)
      .subscribe(res => {
        this.spinnerService.hide();
        this.convertedFile = res;
        // descargar
        this.forceFileDownload(res, this.filename);
      },
        err => {
          this.spinnerService.hide();
          // modal con el fallo
          this.showErrorModal(
            this.translate.instant('error-convert-title'),
            this.translate.instant('error-convert-desc')
          );
        }
      )
  }

  // convierte data en un fichero y hace que el navegador lo descarge auto
  forceFileDownload(res: Blob, filename: string): void {
    saveAs(res, filename);
  }

}
