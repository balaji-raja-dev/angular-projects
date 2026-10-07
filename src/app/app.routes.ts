import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/search/search-page.component').then(m => m.SearchPageComponent),
  },
  {
    path: 'flight/:id',
    loadComponent: () =>
      import('./features/flight-details/flight-details.component').then(m => m.FlightDetailsComponent),
  },
  { path: '**', redirectTo: '' },
];
