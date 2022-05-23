import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { google } from 'google-maps';
import { RoteiroService } from './services/roteiro.service';
import { LinestringComponent } from './dialogs/linestring/linestring.component';
import { NumeroparadaComponent } from './dialogs/numeroparada/numeroparada.component';
import { CoordenatesComponent } from './dialogs/coordenates/coordenates.component';
import { ParadaService } from './services/parada.service';
import { RequisitionsComponent } from './dialogs/requisitions/requisitions.component';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js'
import { Parada } from './interfaces/parada';
const e = console.log;
const urlIcon = "http://labs.google.com/ridefinder/images/mm_20_blue.png"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(
    private roteiroservice: RoteiroService,
    private paradaservice: ParadaService,
    public dialog: MatDialog,
    private readonly keycloak: KeycloakService
  ) {

  }

  isLoggedIn = false;
  userProfile: KeycloakProfile | null = null;
  formRoteiro = new FormControl();
  options: string[] = [];
  filteredOptions!: Observable<string[]>;
  map!: google.maps.Map;
  Latitude: number = -22.909112678795047;
  Longitude: number = -43.222773518571934;
  zoomchange: number = 18;
  markers: google.maps.Marker[] = [];
  geocoder: google.maps.Geocoder = new google.maps.Geocoder();
  roteiro!: string;
  logradouro: string = '';
  user: string = '';
  spinner: boolean = true;

  lista: Parada[] = [];

  //#region Autocomplete

  origin: google.maps.LatLng = new google.maps.LatLng(-22.9182764, -43.3342654);

  bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-22.8709757, -43.3847605),
    new google.maps.LatLng(-22.9011599, -43.1226966)
  )

  tipos = {
    bounds: this.bounds,
    componentRestrictions: { country: 'br' },
    placeIdOnly: false,
    strictBounds: false,
    types: ['geocode'],
    type: '',
    fields: ['geometry'],
    origin: this.origin
  }

  @ViewChild("placesRef") placesRef: GooglePlaceDirective | undefined;

  /**
   * Pega os dados de endereços fornecidos pelo autocomplete do google
   * @param address retorno assícrono na busca do endereço digitado no input #busca
   */
  public handleAddressChange(address: Address) {
    this.inicialize();

    this.Latitude = address.geometry.location.lat();
    this.Longitude = address.geometry.location.lng();

    this.reverseGeocoding(this.Latitude, this.Longitude, new google.maps.LatLng(this.Latitude, this.Longitude));

  }

  delLogradouro() {
    this.paradaservice.delete(this.logradouro).subscribe(() => {
      this.logradouro = '';
      this.inicialize();
    }, err => {
      this.openDialog(RequisitionsComponent);
    });

  };

  confirmLogradouro() {

    this.spinner = false;
    const interval$ = interval(1500).pipe(take(1))

    interval$.subscribe(x => {
      this.lista = [];
      this.spinner = true;
      this.logradouro = '';
      //this.inicialize();
    });

  }

  delLogradouroSalvo(logradouro: string) {
    e(logradouro);
    this.paradaservice.delete(logradouro).subscribe(() => {
      this.logradouro = '';
      this.getLogradouros();
    }, err => {
      this.openDialog(RequisitionsComponent);
    });

  };

  getLogradouros() {
    this.paradaGetAllSubscription = this.paradaservice.getAll(this.roteiro)
      .subscribe(data => {
        this.lista = data.filter(parada => parada.RotaID === this.roteiro);
      });
  }

  addMarker(options: google.maps.ReadonlyMarkerOptions) {
    const marker = new google.maps.Marker(options);
  };

  reverseGeocoding(latitude: number, longitude: number, center: google.maps.LatLng): void {

    if (!this.roteiro) {
      this.logradouro = '';
      this.openDialog(LinestringComponent);
      return;
    };

    const LatLng = new google.maps.LatLng(latitude, longitude);
    let request = { location: LatLng }
    this.geocoder.geocode(request, (result, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        const data = result[0].address_components;

        try {

          /*
          Aqui Faço a busca eplo logradouro e pelo bairro.
          Em adress_component o campo types traz um array com os tipos de adress. 
          Para pegar um logradouro e um bairro válidos só serves os tipos sublocality e sublocality_level_1 para bairros
          e route para logradouro
          **/
          let index = data.findIndex(x => x.types.indexOf('route') !== -1);
          const logradouro = data[index].long_name;
          index = data.findIndex(x => x.types.indexOf('sublocality') !== -1 || x.types.indexOf('sublocality_level_1') !== -1);
          const bairro = data[index].long_name;
          index = data.findIndex(x => x.types.indexOf('street_number') !== -1);
          let numero = data[index].long_name;

          if (Number.isNaN(parseInt(numero))) {
            this.openDialog(NumeroparadaComponent)
          }

          ////////////////////////////////////////////////////////CRIAR NOVA PARADA//////////////////////////////////////////////

          /*
          Essa valor trás o nome do endereço completo, com bairros, cidade, estado e cep
          **/
          const res = result[0].formatted_address;
          this.logradouro = res;

          /*
          Aqui crio uma nova parada
          **/
          const parada = { Latitude: latitude, Longitude: longitude, Title: res, RotaID: this.roteiro, Bairro: bairro, Logradouro: logradouro, Usuario: this.user };

          const option: google.maps.ReadonlyMarkerOptions = {
            position: center,
            map: this.map
          }

          this.addMarker(option);

          this.Latitude = latitude
          this.Longitude = longitude

          this.paradaservice.insert(parada).subscribe(data => {
            const center = new google.maps.LatLng({ lat: this.Latitude, lng: this.Longitude })
            this.map.setCenter(center);
            this.map.setZoom(18);
            this.zoomchange = 18;

            // this.ngZone.run(() => {
            // })
          }, error => {
            this.openDialog(RequisitionsComponent);
          });

        } catch (error) {
          this.inicialize();
          this.logradouro = '';
          this.openDialog(CoordenatesComponent);
        }

      }
    });
  }

  //#endregion Autocomplete

  //#region Dialogs

  openDialog(template: any) {
    const dialogRef = this.dialog.open(template);

    dialogRef.afterClosed().subscribe(() => { });

  }
  //#endregion

  eventDblClickMap!: google.maps.MapsEventListener;
  circle: google.maps.Circle = new google.maps.Circle({
    center: new google.maps.LatLng(0.0, 0.0),
    radius: 50,
    fillOpacity: 0,
    strokeColor: 'red',
    strokeWeight: 0.5,
    visible: false
  })

  inicialize(): void {

    this.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: this.Latitude, lng: this.Longitude },
      zoom: this.zoomchange,
    });

    this.map.setOptions({ disableDoubleClickZoom: true });

    google.maps.event.addListener(this.map, 'zoom_changed', () => {
      this.zoomchange = this.map.getZoom();
    })

    this.circle.setMap(this.map);
  }

  rotaGetAllSubscription: Subscription;
  paradaGetAllSubscription: Subscription;

  logout() {
    window.location.href = 'http://34.95.250.148/realms/comlurb/protocol/openid-connect/logout';
  }

  async ngOnInit() {

    this.isLoggedIn = await this.keycloak.isLoggedIn();

    if (this.isLoggedIn) {
      this.userProfile = await this.keycloak.loadUserProfile();
      this.user = this.userProfile.firstName;
      e(this.user);
    }

    this.rotaGetAllSubscription = this.roteiroservice.getAll().subscribe(
      data => {

        this.options.push(data.SiglaDoRoteiro);

        this.filteredOptions = this.formRoteiro.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value)),
        );
      }
    )
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  ngOnDestroy(): void {
    this.rotaGetAllSubscription.unsubscribe();
  }

}
