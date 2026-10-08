import { Component, EventEmitter, Input, OnInit, Output, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { Filters } from '../../core/models/flight.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" class="card filters">
      <label>Max price: ₹{{ form.value.maxPrice }}
        <input type="range" formControlName="maxPrice" [min]="minPrice" [max]="maxPriceLimit" step="100" />
      </label>
      <label>Stops
        <select formControlName="stops">
          <option value="any">Any</option>
          <option value="0">Non-stop</option>
          <option value="1">1 stop</option>
          <option value="2">2+ stops</option>
        </select>
      </label>
      <label>Airline
        <select formControlName="airline">
          <option value="all">All airlines</option>
          @for (a of airlines; track a) { <option [value]="a">{{ a }}</option> }
        </select>
      </label>
    </form>
  `,
})
export class FilterBarComponent implements OnInit {
  @Input() airlines: string[] = [];
  @Input() minPrice = 0;
  @Input() maxPriceLimit = 0;
  @Input() initial!: Filters;
  @Output() filtersChange = new EventEmitter<Filters>();

  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  form = this.fb.nonNullable.group({
    maxPrice: 0,
    stops: 'any' as Filters['stops'],
    airline: 'all',
  });

  ngOnInit(): void {
    // restore previous filters (default maxPrice is huge, so cap it to the slider max)
    this.form.patchValue(
      {
        maxPrice: Math.min(this.initial.maxPrice, this.maxPriceLimit),
        stops: this.initial.stops,
        airline: this.initial.airline,
      },
      { emitEvent: false }
    );

    this.form.valueChanges
      .pipe(debounceTime(150), takeUntilDestroyed(this.destroyRef))
      .subscribe(v => this.filtersChange.emit(v as Filters));
  }
}