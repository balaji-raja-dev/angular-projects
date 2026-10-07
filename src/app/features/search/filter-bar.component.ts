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
    <!-- template unchanged -->
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