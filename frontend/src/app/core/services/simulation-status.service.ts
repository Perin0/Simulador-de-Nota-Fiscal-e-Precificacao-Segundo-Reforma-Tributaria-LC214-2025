import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class SimulationStatusService {
  readonly transition = signal(false);
}
