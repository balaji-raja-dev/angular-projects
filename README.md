# Flight Search – Angular 18

A small flight-search application built with Angular 18. Users search for flights, filter the results, and open a details page for any flight. It demonstrates REST API integration with `HttpClient`, RxJS, Reactive Forms, routing, reusable components, and error handling.

## Features

- **Search form** (Reactive Forms): From, To, Departure Date, Return Date, Passengers
  - Required-field validation
  - Passengers must be between 1 and 9
  - From and To must be different
  - Return date cannot be before departure date
- **REST API integration** through a dedicated `FlightService` (`HttpClient`)
- **Loading and error states** for both search and details
- **Results list** showing airline, flight number, departure time, arrival time, duration, price and number of stops
- **Filters** (RxJS driven): max price, number of stops, airline
- **Flight details page** (`/flight/:id`) with aircraft, cabin, baggage, layovers and total price
- **Responsive UI** for desktop and mobile

## Technologies Used

| Area | Technology |
|------|------------|
| Framework | Angular 18 (standalone components, new control flow `@if` / `@for`) |
| Language | TypeScript |
| Forms | Angular Reactive Forms |
| HTTP | `HttpClient` |
| Async / state | RxJS (`switchMap`, `combineLatest`, `BehaviorSubject`, `debounceTime`, `catchError`, `startWith`) |
| Routing | Angular Router (lazy-loaded routes) |
| Styling | Plain CSS (CSS Grid / Flexbox, responsive) |
| Version control | Git |

## Setup Instructions

### Prerequisites

- Node.js 18.19+ (or 20+)
- npm
- Angular CLI 18

```bash
npm install -g @angular/cli@18
```

### Run locally

```bash
git clone <your-repo-url>
cd flight-search
npm install
ng serve
```

Open **http://localhost:4200**.

### Quick test

1. Choose **Chennai (MAA)** → **Delhi (DEL)**
2. Pick any departure and return dates
3. Click **Search** to see 4 flights with different airlines and stop counts
4. Use the filters, then click a flight to see its details

### Other commands

```bash
ng build        # production build in dist/
ng test         # unit tests (Karma/Jasmine)
```

## Project Structure

```
flight-search/
├── public/
│   └── flights.json                     # mock REST data
└── src/app/
    ├── app.component.ts
    ├── app.config.ts                    # provideRouter, provideHttpClient
    ├── app.routes.ts                    # lazy-loaded routes
    ├── core/
    │   ├── models/flight.model.ts       # Flight, SearchParams, Filters
    │   └── services/flight.service.ts   # all API calls + error mapping
    ├── shared/
    │   ├── components/state-message.component.ts   # reusable loading/error UI
    │   └── pipes/duration.pipe.ts                  # 175 -> "2h 55m"
    └── features/
        ├── search/
        │   ├── search-page.component.ts    # smart container (state + RxJS)
        │   ├── search-form.component.ts    # presentational, Reactive Form
        │   ├── filter-bar.component.ts     # presentational, emits filters
        │   └── flight-card.component.ts    # presentational result row
        └── flight-details/
            └── flight-details.component.ts
```

## API Details

The app uses a **mock REST API**: a static JSON file served by the Angular dev server and fetched with `HttpClient`.

| | |
|---|---|
| Endpoint | `GET /flights.json` |
| Source file | `public/flights.json` |
| Response | Array of `Flight` objects |

**Flight object**

```json
{
  "id": "1",
  "airline": "IndiGo",
  "flightNumber": "6E-231",
  "from": "MAA",
  "to": "DEL",
  "departureTime": "06:00",
  "arrivalTime": "08:55",
  "durationMinutes": 175,
  "price": 5200,
  "stops": 0,
  "aircraft": "Airbus A320",
  "cabin": "Economy",
  "baggage": "15 kg check-in, 7 kg cabin",
  "layovers": []
}
```

**How the service uses it**

- `FlightService.search(params)` loads the file, then filters by `from` and `to`. An 800 ms `delay` simulates network latency so the loading state is visible.
- `FlightService.getById(id)` loads the file and returns the matching flight, or an error if none is found.
- Errors are mapped to user-friendly messages in one place (`handleError`).

**Available mock routes**

| Route | Flights |
|-------|---------|
| MAA → DEL | 4 |
| DEL → MAA | 1 |
| MAA → BLR | 1 |

Any other route shows a "No flights found" message.

**Switching to a real API:** only `FlightService` needs to change (URL and query params). Components depend on the `Observable<Flight[]>` contract, not on the data source.

## Key Implementation Decisions

- **Smart / presentational split.** `SearchPageComponent` owns state and orchestration. The form, filter bar and flight card receive data through `@Input` and communicate through `@Output`, which keeps them reusable and easy to test.
- **Service layer for all HTTP.** Components never call `HttpClient` directly.
- **RxJS pipeline for search.** `switchMap` cancels any in-flight request when a new search starts, preventing stale results from overwriting newer ones. `startWith` emits the loading state and `catchError` converts failures into an error state, so the stream never dies after an error.
- **Filtering with `combineLatest`.** Search results and filter values are combined into one view model. Filtering is client-side, so changing a filter is instant and does not trigger another API call.
- **`debounceTime` on filter changes** to avoid unnecessary recalculations while dragging the price slider.
- **Async pipe instead of manual subscriptions**, which handles unsubscribe automatically. The one manual subscription (filter form) uses `takeUntilDestroyed`.
- **Details page loads by ID from the route.** Refreshing the page or opening a direct link works, and it does not depend on in-memory state from the search page.
- **Custom form-group validator** for cross-field rules (same airport, return before departure).
- **Lazy-loaded routes and standalone components** for smaller initial bundle and less boilerplate.
- **Reusable `StateMessageComponent`** for loading and error UI on both pages.
- **Typed models** (`Flight`, `SearchParams`, `Filters`) and typed reactive forms.

## Assumptions

- The mock data covers only a few routes; real availability is out of scope.
- The return date is collected and validated, but **return-flight results are not shown** (one-way results only).
- Price in the data is **per passenger**; the total is `price × passengers`.
- Currency is INR.
- Times are shown as local `HH:mm` strings; time zones and date-specific availability are not modeled.
- Filters reset whenever a new search is performed.

## Possible Improvements

- Unit tests for `FlightService` and the filtering logic
- HTTP interceptor for global error handling and retry
- Signals-based state management
- Real flight API integration (e.g. Amadeus) with date-aware results
- Round-trip results (outbound and return selection)
- Sorting (cheapest, fastest, earliest departure)
- Pagination or virtual scrolling for large result sets
- Airport autocomplete instead of a fixed dropdown
