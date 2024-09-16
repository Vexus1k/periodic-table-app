import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { PeriodicElementsService } from "../../core/services/periodic-elements-service";
import { PeriodicElement } from "../../core/interfaces/PeriodicElement";
import {
  debounceTime, distinctUntilChanged,
  map,
} from "rxjs";
import { MatIconModule } from "@angular/material/icon";
import { RxState } from "@rx-angular/state";
import { RxPush } from "@rx-angular/template/push";

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RxState],
  imports: [
    MatTableModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    CommonModule,
    EditDialogComponent,
    MatIconModule,
    ReactiveFormsModule,
    RxPush
  ],
  templateUrl: './periodic-table.component.html',
  styleUrls: ['./periodic-table.component.scss']
})
export class PeriodicTableComponent implements OnInit {
  public filterControl = new FormControl();
  public readonly displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'actions'];

  constructor(
    private readonly _periodicElementsService: PeriodicElementsService,
    private readonly _dialog: MatDialog,
    protected readonly state: RxState<{ data: PeriodicElement[], filteredData: PeriodicElement[] }>
  ) {}

  ngOnInit() {
    this.state.connect('data', this._periodicElementsService.getElements());
    this.state.connect('filteredData', this.state.select('data'));

    this.state.hold(this.filterControl.valueChanges.pipe(
      debounceTime(2000),
      distinctUntilChanged(),
      map(searchTerm => this.getFilteredData(searchTerm))
    ), filteredData => {
      this.state.set({ filteredData });
    });
  }

  public openEditDialog(element: PeriodicElement): void {
    const dialogRef = this._dialog.open(EditDialogComponent, {
      data: { element }
    });

    this.state.hold(dialogRef.afterClosed(), result => {
      if (result) {
        this.updateElement(result);
      }
    });
  }

  private getFilteredData(searchTerm: string): PeriodicElement[] {
    const data = this.state.get('data');

    if (!searchTerm) {
      return data;
    }

    return data.filter(item => Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }

  private updateElement(updatedElement: PeriodicElement): void {
    this.state.hold(this._periodicElementsService.updateElement(updatedElement), updatedData => {
      this.state.set({ data: updatedData });

      const searchTerm = this.filterControl?.value || '';

      if (searchTerm) {
        this.state.set({ filteredData: this.getFilteredData(searchTerm) });
      } else {
        this.state.set({ filteredData: updatedData });
      }
    });
  }
}
