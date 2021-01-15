import { Injectable } from '@angular/core';
import { URL_SERVICES } from '../config/urls';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class ConvertService {

  constructor(private _http: HttpClient) { }


  convertFile(file: File, convertExtension: string, type: string) {
    let fileExt = file.type.split('/')[1];
    if (fileExt === 'webm') {
      type = 'audio';
    };
    const formData = new FormData();
    formData.append('file', file);
    // body param
    formData.append('convertExtension', convertExtension);
    return this._http.post(`${URL_SERVICES}/${type}`, formData, { responseType: 'blob', reportProgress: true})
    .pipe(map (file => file));
  }

}
