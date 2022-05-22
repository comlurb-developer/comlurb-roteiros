import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { GooglePlaceModule } from "ngx-google-places-autocomplete";

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LinestringComponent } from './dialogs/linestring/linestring.component';
import { NumeroparadaComponent } from './dialogs/numeroparada/numeroparada.component';
import { CoordenatesComponent } from './dialogs/coordenates/coordenates.component';
import { RequisitionsComponent } from './dialogs/requisitions/requisitions.component';
import { environment } from 'src/environments/environment';
const clientId = environment.clientId

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://adrenalinamaxima.online/',
        realm: 'comlurb',
        clientId: clientId
      },
      initOptions: {
        onLoad: 'login-required'
      }
    });
}

@NgModule({
  declarations: [
    AppComponent,
    LinestringComponent,
    NumeroparadaComponent,
    CoordenatesComponent,
    RequisitionsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    KeycloakAngularModule,
    GooglePlaceModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    LinestringComponent,
    CoordenatesComponent,
    NumeroparadaComponent,
    RequisitionsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
