import { Injectable, computed, signal } from '@angular/core'; 
import { ResultadoRtc } from '../../../core/models/rtc.models';
@Injectable({ providedIn: 'root' }) 
export class SimuladorStateService { 
    readonly resultado = signal<ResultadoRtc | null>(null); 
    readonly loading = signal(false); 
    readonly total = computed(() => this.resultado()?.total); }
