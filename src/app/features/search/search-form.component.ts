import { Component, EventEmitter, Output, inject, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { SearchParams } from '../../core/models/flight.model';

export const AIRPORTS = [
  { code: 'MAA', name: 'Chennai' },
  { code: 'DEL', name: 'Delhi' },
  { code: 'BLR', name: 'Bengaluru' },
  { code: 'BOM', name: 'Mumbai' },
];

function tripValidator(g: AbstractControl): ValidationErrors | null {
  const { from, to, departureDate, returnDate } = g.value;
  const errors: ValidationErrors = {};
  if (from && to && from === to) errors['sameAirport'] = true;
  if (departureDate && returnDate && returnDate < departureDate) errors['returnBeforeDeparture'] = true;
  return Object.keys(errors).length ? errors : null;
}

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="card form-grid">
      <label>From
        <select formControlName="from">
          <option value="">Select</option>
          @for (a of airports; track a.code) { <option [value]="a.code">{{ a.name }} ({{ a.code }})</option> }
        </select>
      </label>
      <label>To
        <select formControlName="to">
          <option value="">Select</option>
          @for (a of airports; track a.code) { <option [value]="a.code">{{ a.name }} ({{ a.code }})</option> }
        </select>
      </label>
      <label>Departure
        <input type="date" formControlName="departureDate" [min]="today" />
      </label>
      <label>Return
        <input type="date" formControlName="returnDate" [min]="form.value.departureDate || today" />
      </label>
      <label>Passengers
        <input type="number" formControlName="passengers" min="1" max="9" />
      </label>
      <button type="submit" class="btn">Search</button>

      <div class="errors">
        @if (touchedInvalid('from') || touchedInvalid('to')) { <small>From and To are required.</small> }
        @if (form.errors?.['sameAirport'] && form.touched) { <small>From and To must be different.</small> }
        @if (touchedInvalid('departureDate')) { <small>Departure date is required.</small> }
        @if (touchedInvalid('returnDate')) { <small>Return date is required.</small> }
        @if (form.errors?.['returnBeforeDeparture']) { <small>Return date cannot be before departure.</small> }
        @if (touchedInvalid('passengers')) { <small>Passengers must be between 1 and 9.</small> }
      </div>
    </form>
  `,
})
export class SearchFormComponent implements OnInit{
  @Output() search = new EventEmitter<SearchParams>();

  private fb = inject(FormBuilder);
  airports = AIRPORTS;
  today = new Date().toISOString().split('T')[0];

  @Input() initial: SearchParams | null = null;

  ngOnInit(): void {
    if (this.initial) this.form.patchValue(this.initial);
  }

  form = this.fb.nonNullable.group(
    {
      from: ['', Validators.required],
      to: ['', Validators.required],
      departureDate: ['', Validators.required],
      returnDate: ['', Validators.required],
      passengers: [1, [Validators.required, Validators.min(1), Validators.max(9)]],
    },
    { validators: tripValidator }
  );

  touchedInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.search.emit(this.form.getRawValue());
  }
}