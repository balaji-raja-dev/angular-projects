import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, delay, map, throwError } from 'rxjs';
import { Flight, SearchParams } from '../models/flight.model';

@Injectable({ providedIn: 'root' })
export class FlightService {
  private http = inject(HttpClient);
  private readonly url = 'assets/flights.json';

  search(p: SearchParams): Observable<Flight[]> {
    return this.http.get<Flight[]>(this.url).pipe(
      delay(800), // simulate network latency
      map(list => list.filter(f => f.from === p.from && f.to === p.to)),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<Flight> {
    return this.http.get<Flight[]>(this.url).pipe(
      map(list => {
        const flight = list.find(f => f.id === id);
        if (!flight) throw new Error('Flight not found.');
        return flight;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(err: unknown) {
    const message = err instanceof Error && err.message === 'Flight not found.'
      ? err.message
      : 'Unable to load flights. Please try again.';
    return throwError(() => new Error(message));
  }
}