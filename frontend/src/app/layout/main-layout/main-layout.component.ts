import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EmpresaContextService } from '../../core/services/empresa-context.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { SimulationStatusService } from '../../core/services/simulation-status.service';

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
  update(field: 'municipio' | 'data' | 'atividade', event: Event) {
    this.empresa.update({ [field]: (event.target as HTMLInputElement).value });
  }
}
