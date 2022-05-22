import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Parada } from '../interfaces/parada';
const url = environment.baseUrl
const e = console.log;

@Injectable({
  providedIn: 'root'
})
export class ParadaService {


  constructor(private http: HttpClient) { }

  getAll(RotaID: string): Observable<Parada[]> {
    return this.http.get<Parada[]>(url + '/');
  }

  insert(marcador: Parada): Observable<any[]> {
    return this.http.post<any[]>(url + '/insert', marcador);
  }

  delete(Logradouro: string): Observable<any> {
    return this.http.post<any>(url + '/delete', { Logradouro });
  }


}
