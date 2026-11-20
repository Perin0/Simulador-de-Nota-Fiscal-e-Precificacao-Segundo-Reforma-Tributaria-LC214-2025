import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { PrecificacaoEngineService } from './services/precificacao-engine.service';

@Component({ standalone: true, imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe], templateUrl: './precificacao.page.html', styleUrl: './precificacao.page.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class PrecificacaoPage {
  private fb = inject(FormBuilder);
  private engine = inject(PrecificacaoEngineService);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly result = signal<{ preco: number; aliquota: number; tributos: number } | null>(null);
  readonly form = this.fb.nonNullable.group({ custo: [50, [Validators.required, Validators.min(.01)]], despesas: [10, [Validators.required, Validators.min(0)]], margem: [30, [Validators.required, Validators.min(0)]], cClassTrib: ['000001', Validators.required], pIbs: [1.25, Validators.required], pCbs: [2.75, Validators.required] });
  readonly composition = computed(() => { const r = this.result(); if (!r) return null; const f = this.form.getRawValue(); return { custo: f.custo, despesas: r.preco * f.despesas / 100, lucro: r.preco * f.margem / 100, tributos: r.tributos }; });
  calculate() {
    this.error.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); this.error.set('Preencha os dados necessários para calcular o preço.'); return; }
    this.loading.set(true);
    this.engine.calcular(this.form.getRawValue()).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (result) => this.result.set(result),
      error: (error: Error) => this.error.set(error.message ?? 'Não foi possível obter a alíquota no motor RTC.'),
    });
  }
}
