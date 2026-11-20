import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

export interface UnidadeFederativa { id: string; nomeUF: string; }
export interface Municipio { id: number; municipio: string; }
export interface EmpresaContext { municipio: string; data: string; atividade: string; fatorR: boolean; uf: string; }

const KEY = 'rtc-simples-context';
const defaultReferenceDate = '2027-03-15';

@Injectable({ providedIn: 'root' })
export class EmpresaContextService {
  private readonly http = inject(HttpClient);
  private readonly saved = this.read();
  readonly context = signal<EmpresaContext>(this.saved);
  readonly ufs = signal<UnidadeFederativa[]>([]);
  readonly ufSelecionada = computed(() => this.ufs().some((uf) => uf.id === this.context().uf));
  readonly municipios = signal<Municipio[]>([]);
  readonly carregandoUfs = signal(false);
  readonly carregandoMunicipios = signal(false);
  readonly erroLocalidades = signal('');

  constructor() { this.carregarUfs(); }

  update(values: Partial<EmpresaContext>) {
    const next = { ...this.context(), ...values };
    this.context.set(next);
    this.persist(next);
  }

  selecionarUf(ufId: string) {
    const uf = this.ufs().find((item) => item.id === ufId);
    if (!uf) {
      this.update({ uf: '', municipio: '' });
      this.municipios.set([]);
      return;
    }
    this.update({ uf: uf.id, municipio: '' });
    this.carregarMunicipios(uf.id);
  }

  selecionarMunicipio(municipioId: string) {
    const municipio = this.municipios().find((item) => String(item.id) === municipioId);
    if (municipio) this.update({ municipio: String(municipio.id) });
  }

  private carregarUfs() {
    this.carregandoUfs.set(true);
    this.erroLocalidades.set('');
    this.http.get<UnidadeFederativa[]>('/data/localidades/ufs.json').subscribe({
      next: (ufs) => {
        this.ufs.set(ufs);
        this.carregandoUfs.set(false);
        const ufSalva = ufs.find((uf) => uf.id === this.saved.uf);
        if (ufSalva) this.carregarMunicipios(ufSalva.id, this.saved.municipio);
      },
      error: () => {
        this.carregandoUfs.set(false);
        this.erroLocalidades.set('Não foi possível carregar as unidades federativas.');
      },
    });
  }

  private carregarMunicipios(ufId: string, municipioSalvo = '') {
    this.carregandoMunicipios.set(true);
    this.erroLocalidades.set('');
    this.http.get<Municipio[]>(`/data/localidades/municipios/${ufId}.json`).subscribe({
      next: (municipios) => {
        this.municipios.set(municipios);
        this.carregandoMunicipios.set(false);
        const selecionado = municipios.find((municipio) => String(municipio.id) === municipioSalvo);
        if (selecionado) this.update({ municipio: String(selecionado.id) });
      },
      error: () => {
        this.municipios.set([]);
        this.carregandoMunicipios.set(false);
        this.erroLocalidades.set('Não foi possível carregar os municípios desta UF.');
      },
    });
  }

  private read(): EmpresaContext {
    const fallback: EmpresaContext = { municipio: '', data: defaultReferenceDate, atividade: '01', fatorR: false, uf: '' };
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<EmpresaContext>;
      const uf = typeof stored.uf === 'string' ? stored.uf : '';
      const data = typeof stored.data === 'string' && stored.data >= '2027-01-01'
        ? stored.data
        : defaultReferenceDate;
      return { ...fallback, ...stored, data, uf, municipio: uf ? String(stored.municipio ?? '') : '' };
    } catch { return fallback; }
  }

  private persist(value: EmpresaContext) {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(value));
  }
}
