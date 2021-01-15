import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = '';
  showMore = false;
  text = '';
  esJsonURL = '../assets/i18n/es.json';
  enJsonURL = '../assets/i18n/en-GB.json';

  constructor(public translate: TranslateService,
              private http: HttpClient) {

    const lang = navigator.language || navigator.languages[1];
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang(lang);

    this.getJSON(lang).subscribe(data => {
      this.title = data['title'];
      this.text = data['seo-text'];
    });
  }

  public getJSON(language: string): Observable<any> {
    return language === 'es' ? this.http.get(this.esJsonURL) : this.http.get(this.enJsonURL);
  }

}
