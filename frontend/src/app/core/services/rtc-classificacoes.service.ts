import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ClassificacaoTributariaSn } from '../models/rtc.models';

@Injectable({ providedIn: 'root' })
export class RtcClassificacoesService {
  private readonly http = inject(HttpClient);
  private readonly classificacoes$: Observable<ClassificacaoTributariaSn[]> = this.http
    .get<ClassificacaoTributariaSn[]>('/data/classificacoes_tributarias_sn.json')
    .pipe(shareReplay(1));

  listar() {
    return this.classificacoes$;
  }
}
