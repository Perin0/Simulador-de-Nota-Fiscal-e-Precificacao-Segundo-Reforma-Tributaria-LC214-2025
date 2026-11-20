import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificacaoService } from '../services/notificacao.service';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificacaoService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notifications.avisar(error.status === 0
        ? 'Não foi possível conectar ao motor RTC local. Verifique a API na porta 8082.'
        : formatApiError(error));
      return throwError(() => error);
    }),
  );
};

function formatApiError(error: HttpErrorResponse): string {
  const detalhe = error.error?.errors?.[0];
  if (detalhe) {
    const codigo = detalhe.code ? `${detalhe.code}: ` : '';
    return `${codigo}${detalhe.detail ?? detalhe.title ?? 'A API rejeitou os dados enviados.'}`;
  }
  return error.error?.detail ?? 'A simulação não pôde ser concluída. Revise os dados e tente novamente.';
}
