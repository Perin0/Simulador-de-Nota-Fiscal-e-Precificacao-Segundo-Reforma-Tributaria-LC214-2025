import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { EmpresaContextService } from '../../core/services/empresa-context.service';
import { RtcCalculadoraService } from '../../core/services/rtc-calculadora.service';
import { RtcSistemaService } from '../../core/services/rtc-sistema.service';
import { ClassificacaoTributariaSn, ObjetoRtc, OperacaoRtcRequest } from '../../core/models/rtc.models';
import { RtcClassificacoesService } from '../../core/services/rtc-classificacoes.service';
import { SimuladorStateService } from './services/simulador-state.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './simulador-nfe.page.html',
  styleUrl: './simulador-nfe.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimuladorNfePage {
  private fb = inject(FormBuilder);
  private api = inject(RtcCalculadoraService);
  private errors = inject(RtcSistemaService);
  private classificacoesApi = inject(RtcClassificacoesService);
  readonly company = inject(EmpresaContextService);
  readonly state = inject(SimuladorStateService);
  erro = '';
  readonly classificacoes = signal<ClassificacaoTributariaSn[]>([]);
  readonly classificacoesCarregando = signal(true);
  readonly form = this.fb.group({
    tpDoc: this.fb.nonNullable.control('55'),
    itens: this.fb.array([this.item()]),
  });
  readonly itens = this.form.controls.itens;
  readonly valorNota = computed(() =>
    this.itens.controls.reduce(
      (sum, item) =>
        sum +
        (Number(item.controls.quantidade.value) || 0) * (Number(item.controls.valor.value) || 0),
      0,
    ),
  );
  constructor() {
    this.classificacoesApi.listar().subscribe({
      next: (classificacoes) => this.classificacoes.set(classificacoes),
      error: () => this.classificacoes.set([]),
      complete: () => this.classificacoesCarregando.set(false),
    });
  }
  item() {
    return this.fb.nonNullable.group({
      descricao: 'Produto ou serviço',
      ncm: '',
      cClassTrib: '000001',
      quantidade: [1, [Validators.required, Validators.min(0.0001)]],
      valor: [100, [Validators.required, Validators.min(0.01)]],
      pIbs: [0.1, [Validators.required]],
      pCbs: [0.9, [Validators.required]],
    });
  }
  add() {
    this.itens.push(this.item());
  }
  remove(index: number) {
    if (this.itens.length > 1) this.itens.removeAt(index);
  }
  simulate() {
    this.erro = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro = 'Revise os campos obrigatórios antes de simular.';
      return;
    }
    const context = this.company.context();
    const payload: OperacaoRtcRequest = {
      id: crypto.randomUUID(),
      versao: '2.0.0',
      data: context.data,
      tpDoc: this.form.controls.tpDoc.value,
      CRT: '1',
      itens: this.itens.controls.map((row, index) => ({
        numero: index + 1,
        cAtivSN: context.atividade,
        cClassTrib: row.controls.cClassTrib.value,
        baseCalculo: (
          Number(row.controls.quantidade.value) * Number(row.controls.valor.value)
        ).toFixed(2),
        valorImpostoSeletivo: '0.00',
        pIBSSN: String(row.controls.pIbs.value),
        pCBSSN: String(row.controls.pCbs.value),
      })),
    };
    this.state.loading.set(true);
    this.api.calcular(payload).subscribe({
      next: (r) => this.state.resultado.set(r),
      error: () => {},
    }).add(() => this.state.loading.set(false));
  }
  result(index: number) {
    return this.state.resultado()?.objetos.find((x) => x.nObj === index + 1);
  }
  status(result?: ObjetoRtc) {
    return result?.estadoItem?.replaceAll('_', ' ') ?? 'Pendente';
  }
  motivo(result?: ObjetoRtc) {
    const code = result?.erros?.[0]?.codigo ?? result?.erros?.[0]?.code;
    if (!code) return;
    this.errors.erro(code).subscribe({
      next: (error) => (this.erro = `${error.codigo} — ${error.titulo}: ${error.descricao}`),
      error: () => (this.erro = 'Não foi possível detalhar esta inconsistência.'),
    });
  }
}
