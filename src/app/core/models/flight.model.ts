export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  price: number;
  stops: number;
  aircraft: string;
  cabin: string;
  baggage: string;
  layovers: string[];
}

export interface SearchParams {
  from: string;
  to: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
}

export interface Filters {
  maxPrice: number;
  stops: 'any' | '0' | '1' | '2';
  airline: string;
}