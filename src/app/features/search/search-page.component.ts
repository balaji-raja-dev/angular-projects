import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { SearchStore } from '../../core/services/search-store.service';
import { StateMessageComponent } from '../../shared/components/state-message.component';
import { FilterBarComponent } from './filter-bar.component';
import { FlightCardComponent } from './flight-card.component';
import { SearchFormComponent } from './search-form.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [AsyncPipe, SearchFormComponent, FilterBarComponent, FlightCardComponent, StateMessageComponent],
  template: `
    <app-search-form [initial]="store.params$.value" (search)="store.search($event)" />

    @if (view$ | async; as v) {
      @if (v.loading) { <app-state-message type="loading" text="Searching flights..." /> }
      @else if (v.error) { <app-state-message type="error" [text]="v.error" /> }
      @else if (v.data.length === 0) { <div class="msg">No flights found for this route.</div> }
      @else {
        <app-filter-bar
          [airlines]="v.airlines" [minPrice]="v.minPrice" [maxPriceLimit]="v.maxPrice"
          [initial]="store.filters$.value"
          (filtersChange)="store.setFilters($event)" />

        <p class="muted">{{ v.flights.length }} of {{ v.data.length }} flights</p>
        @for (f of v.flights; track f.id) {
          <app-flight-card [flight]="f" [passengers]="store.params$.value?.passengers ?? 1" />
        } @empty {
          <div class="msg">No flights match your filters.</div>
        }
      }
    }
  `,
})
export class SearchPageComponent {
  store = inject(SearchStore);

  view$ = combineLatest([this.store.state$, this.store.filters$]).pipe(
    map(([state, f]) => {
      const prices = state.data.map(d => d.price);
      return {
        ...state,
        airlines: [...new Set(state.data.map(d => d.airline))],
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        flights: state.data.filter(
          d =>
            d.price <= f.maxPrice &&
            (f.airline === 'all' || d.airline === f.airline) &&
            (f.stops === 'any' || (f.stops === '2' ? d.stops >= 2 : d.stops === +f.stops))
        ),
      };
    })
  );
}