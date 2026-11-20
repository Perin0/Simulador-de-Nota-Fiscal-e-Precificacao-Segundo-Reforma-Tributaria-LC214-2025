import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  readonly mensagem = signal('');
  avisar(mensagem: string) {
    this.mensagem.set(mensagem);
    setTimeout(() => this.mensagem.set(''), 5000);
  }
}
