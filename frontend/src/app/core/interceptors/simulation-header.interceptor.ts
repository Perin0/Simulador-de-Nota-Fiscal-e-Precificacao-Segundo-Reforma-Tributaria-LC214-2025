import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { SimulationStatusService } from '../services/simulation-status.service';
export const simulationHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const status = inject(SimulationStatusService);
  return next(req).pipe(
    tap((response) => {
      if ('headers' in response)
        status.transition.set(
          [...response.headers.keys()].some((key) => key.toLowerCase().includes('simul')),
        );
    }),
  );
};
