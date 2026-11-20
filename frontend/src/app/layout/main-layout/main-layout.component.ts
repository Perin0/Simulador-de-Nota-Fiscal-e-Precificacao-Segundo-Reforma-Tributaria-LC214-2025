import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EmpresaContextService } from '../../core/services/empresa-context.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { SimulationStatusService } from '../../core/services/simulation-status.service';
import { AtividadeSn } from '../../core/models/rtc.models';
import { RtcAtividadesService } from '../../core/services/rtc-atividades.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  readonly empresa = inject(EmpresaContextService);
  readonly notification = inject(NotificacaoService);
  readonly simulation = inject(SimulationStatusService);
  private readonly atividadesApi = inject(RtcAtividadesService);
  readonly atividades = signal<AtividadeSn[]>([]);
  readonly carregandoAtividades = signal(false);
  readonly erroAtividades = signal('');
  private dataAtividades = '';

  constructor() {
    effect(() => {
      const data = this.empresa.context().data;
      if (data && data !== this.dataAtividades) {
        this.dataAtividades = data;
        this.carregarAtividades(data);
      }
    });
  }

  private carregarAtividades(data: string) {
    this.carregandoAtividades.set(true);
    this.erroAtividades.set('');
    this.atividadesApi.listar(data).subscribe({
      next: (atividades) => this.atividades.set(atividades),
      error: () => {
        this.atividades.set([]);
        this.erroAtividades.set('Não foi possível carregar as atividades SN.');
        this.carregandoAtividades.set(false);
      },
      complete: () => this.carregandoAtividades.set(false),
    });
  }

  update(field: 'municipio' | 'data' | 'atividade', event: Event) {
    this.empresa.update({ [field]: (event.target as HTMLInputElement).value });
  }
}
