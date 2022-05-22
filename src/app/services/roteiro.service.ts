import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import * as roteiro from '../../roteiro.json';

const result = from(roteiro);

@Injectable({
  providedIn: 'root'
})

export class RoteiroService {

  constructor(private http: HttpClient) { }

  getAll(): Observable<{ SiglaDoRoteiro: string; SiglaSetor: string; }> {
    return result;
  }

}
