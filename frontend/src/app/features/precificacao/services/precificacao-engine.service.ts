import { Injectable, inject } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { EmpresaContextService } from '../../../core/services/empresa-context.service';
import { RtcCalculadoraService } from '../../../core/services/rtc-calculadora.service';
import { OperacaoRtcRequest } from '../../../core/models/rtc.models';

export interface PrecificacaoInput { custo: number; despesas: number; margem: number; cClassTrib: string; pIbs: number; pCbs: number; }

@Injectable({ providedIn: 'root' })
export class PrecificacaoEngineService {
  private api = inject(RtcCalculadoraService);
  private company = inject(EmpresaContextService);

  calcular(input: PrecificacaoInput) {
    const request = (base: number): OperacaoRtcRequest => ({
      id: crypto.randomUUID(), versao: '2.0.0', data: this.company.context().data, tpDoc: '55', CRT: '1',
      itens: [{ numero: 1, cAtivSN: this.company.context().atividade, cClassTrib: input.cClassTrib,
        baseCalculo: base.toFixed(2), valorImpostoSeletivo: '0.00', pIBSSN: String(input.pIbs), pCBSSN: String(input.pCbs) }],
    });

    return this.api.calcular(request(100)).pipe(
      map((probe) => Number(probe.total?.totalTributos ?? 0)),
      switchMap((aliquota) => {
        const divisor = 1 - ((input.despesas + input.margem + aliquota) / 100);
        if (divisor <= 0) throw new Error('A soma de despesas, margem e tributos deve ser menor que 100%.');
        const preco = input.custo / divisor;
        return this.api.calcular(request(preco)).pipe(
          map((final) => ({ preco, aliquota, tributos: Number(final.total?.totalTributos ?? preco * aliquota / 100) })),
        );
      }),
    );
  }
}
