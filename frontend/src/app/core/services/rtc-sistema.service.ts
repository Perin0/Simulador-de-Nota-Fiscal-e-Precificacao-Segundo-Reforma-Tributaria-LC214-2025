import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../config/environment.config';
import { ErroVsn } from '../models/rtc.models';
@Injectable({ providedIn: 'root' })
export class RtcSistemaService {
  private http = inject(HttpClient);
  private errors = new Map<string, Observable<ErroVsn>>();
  erro(codigo: string) {
    if (!this.errors.has(codigo))
      this.errors.set(
        codigo,
        this.http
          .get<ErroVsn>(
            `${environment.apiUrl}/calculadora/observabilidade/simples-nacional/erros`,
            { params: new HttpParams().set('codigo', codigo) },
          )
          .pipe(shareReplay(1)),
      );
    return this.errors.get(codigo)!;
  }
}
