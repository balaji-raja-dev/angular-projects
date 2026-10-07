import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-state-message',
  standalone: true,
  template: `
    @if (type === 'loading') { <div class="msg loading"><span class="spinner"></span> {{ text }}</div> }
    @else { <div class="msg error" role="alert">{{ text }}</div> }
  `,
})
export class StateMessageComponent {
  @Input() type: 'loading' | 'error' = 'loading';
  @Input() text = '';
}