import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'simulador-nfe' },
      {
        path: 'simulador-nfe',
        title: 'Simulador de Nota Fiscal | RTC Simples',
        loadComponent: () =>
          import('./features/simulador-nfe/simulador-nfe.page').then((m) => m.SimuladorNfePage),
      },
      {
        path: 'precificacao',
        title: 'Precificação Inteligente | RTC Simples',
        loadComponent: () =>
          import('./features/precificacao/precificacao.page').then((m) => m.PrecificacaoPage),
      },
    ],
  },
];
