import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Flight } from '../../core/models/flight.model';
import { DurationPipe } from '../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DurationPipe],
  template: `
    <a class="card flight" [routerLink]="['/flight', flight.id]" [queryParams]="{ passengers }">
      <div>
        <strong>{{ flight.airline }}</strong>
        <div class="muted">{{ flight.flightNumber }}</div>
      </div>
      <div class="times">
        <strong>{{ flight.departureTime }}</strong> → <strong>{{ flight.arrivalTime }}</strong>
        <div class="muted">{{ flight.durationMinutes | duration }}</div>
      </div>
      <div>{{ flight.stops === 0 ? 'Non-stop' : flight.stops + ' stop(s)' }}</div>
      <div class="price">
        {{ flight.price * passengers | currency: 'INR' : 'symbol' : '1.0-0' }}
        <div class="muted">{{ passengers }} pax</div>
      </div>
    </a>
  `,
})
export class FlightCardComponent {
  @Input({ required: true }) flight!: Flight;
  @Input() passengers = 1;
}