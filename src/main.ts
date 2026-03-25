import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';
import { ModalController, AlertController } from '@ionic/angular';
import { importProvidersFrom, LOCALE_ID } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, from } from 'rxjs';

// --- CONFIGURAÇÃO DE IDIOMA PORTUGUÊS ---
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt);
// ---------------------------------------

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

class CustomTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return from(fetch(`assets/i18n/${lang}.json`).then(res => res.json()));
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'pt-PT' }, // 👈 Força Pipes em PT
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    ModalController,
    AlertController,
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'pt',
        loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader,
        },
      })
    ),
  ],
});