import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { Flight } from '../../core/models/flight.model';
import { FlightService } from '../../core/services/flight.service';
import { StateMessageComponent } from '../../shared/components/state-message.component';
import { DurationPipe } from '../../shared/pipes/duration.pipe';

interface DetailState { loading: boolean; error: string | null; flight: Flight | null; }

@Component({
  selector: 'app-flight-details',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, RouterLink, StateMessageComponent, DurationPipe],
  template: `
    <a routerLink="/" class="back">← Back to search</a>
    @if (state$ | async; as s) {
      @if (s.loading) { <app-state-message type="loading" text="Loading flight details..." /> }
      @else if (s.error) { <app-state-message type="error" [text]="s.error" /> }
      @else if (s.flight; as f) {
        <section class="card details">
          <h2>{{ f.airline }} · {{ f.flightNumber }}</h2>
          <p class="route">{{ f.from }} → {{ f.to }}</p>
          <dl>
            <dt>Departure</dt><dd>{{ f.departureTime }}</dd>
            <dt>Arrival</dt><dd>{{ f.arrivalTime }}</dd>
            <dt>Duration</dt><dd>{{ f.durationMinutes | duration }}</dd>
            <dt>Stops</dt><dd>{{ f.stops === 0 ? 'Non-stop' : f.stops + ' (' + f.layovers.join(', ') + ')' }}</dd>
            <dt>Aircraft</dt><dd>{{ f.aircraft }}</dd>
            <dt>Cabin</dt><dd>{{ f.cabin }}</dd>
            <dt>Baggage</dt><dd>{{ f.baggage }}</dd>
            <dt>Price / person</dt><dd>{{ f.price | currency: 'INR' : 'symbol' : '1.0-0' }}</dd>
            <dt>Total ({{ passengers }} pax)</dt>
            <dd><strong>{{ f.price * passengers | currency: 'INR' : 'symbol' : '1.0-0' }}</strong></dd>
          </dl>
        </section>
      }
    }
  `,
})
export class FlightDetailsComponent {
  private route = inject(ActivatedRoute);
  private api = inject(FlightService);

  passengers = Number(this.route.snapshot.queryParamMap.get('passengers')) || 1;

  state$ = this.route.paramMap.pipe(
    map(p => p.get('id')!),
    switchMap(id =>
      this.api.getById(id).pipe(
        map((flight): DetailState => ({ loading: false, error: null, flight })),
        startWith<DetailState>({ loading: true, error: null, flight: null }),
        catchError(err => of<DetailState>({ loading: false, error: err.message, flight: null }))
      )
    )
  );
}