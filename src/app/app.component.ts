import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PeriodicTableComponent } from './components/periodic-table/periodic-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<app-periodic-table></app-periodic-table>',
  imports: [PeriodicTableComponent]
})
export class AppComponent {}
