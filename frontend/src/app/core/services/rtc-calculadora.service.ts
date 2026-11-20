import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../config/environment.config';
import { OperacaoRtcRequest, ResultadoRtc } from '../models/rtc.models';
@Injectable({ providedIn: 'root' })
export class RtcCalculadoraService {
  private http = inject(HttpClient);
  calcular(operacao: OperacaoRtcRequest) {
    return this.http.post<ResultadoRtc>(
      `${environment.apiUrl}/calculadora/observabilidade/simples-nacional`,
      operacao,
    );
  }
}
