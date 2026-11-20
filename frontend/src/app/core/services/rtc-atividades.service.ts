import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../config/environment.config';
import { AtividadeSn } from '../models/rtc.models';
@Injectable({ providedIn: 'root' })
export class RtcAtividadesService {
  private http = inject(HttpClient);
  private cache = new Map<string, Observable<AtividadeSn[]>>();
  listar(data: string) {
    if (!this.cache.has(data))
      this.cache.set(
        data,
        this.http
          .get<AtividadeSn[]>(`${environment.apiUrl}/calculadora/simples-nacional/atividades`, {
            params: new HttpParams().set('data', data),
          })
          .pipe(shareReplay(1)),
      );
    return this.cache.get(data)!;
  }
}
