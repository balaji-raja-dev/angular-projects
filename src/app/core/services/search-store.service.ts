import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { Filters, Flight, SearchParams } from '../models/flight.model';
import { FlightService } from './flight.service';

export interface SearchState { loading: boolean; error: string | null; data: Flight[]; }

export const DEFAULT_FILTERS: Filters = { maxPrice: Number.MAX_SAFE_INTEGER, stops: 'any', airline: 'all' };

@Injectable({ providedIn: 'root' })
export class SearchStore {
  private api = inject(FlightService);

  readonly params$ = new BehaviorSubject<SearchParams | null>(null);
  readonly filters$ = new BehaviorSubject<Filters>(DEFAULT_FILTERS);

  // shareReplay keeps the last result alive after the page is destroyed,
  // so coming back replays it instead of calling the API again
  readonly state$ = this.params$.pipe(
    filter((p): p is SearchParams => p !== null),
    switchMap(params =>
      this.api.search(params).pipe(
        map((data): SearchState => ({ loading: false, error: null, data })),
        startWith<SearchState>({ loading: true, error: null, data: [] }),
        catchError(err => of<SearchState>({ loading: false, error: err.message, data: [] }))
      )
    ),
    shareReplay({ bufferSize: 1, refCount: false })
  );

  search(params: SearchParams): void {
    this.params$.next(params);
    this.filters$.next(DEFAULT_FILTERS); // new search resets filters
  }

  setFilters(filters: Filters): void {
    this.filters$.next(filters);
  }
}