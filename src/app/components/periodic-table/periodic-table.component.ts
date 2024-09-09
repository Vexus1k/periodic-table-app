import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  debounceTime,
  map,
  Observable,
} from "rxjs";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-periodic-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTableModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    CommonModule,
    EditDialogComponent,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './periodic-table.component.html',
  styleUrls: ['./periodic-table.component.scss']
})
export class PeriodicTableComponent implements OnInit {
  public filterControl = new FormControl();
  public filteredData$: Observable<PeriodicElement[]> | null = null;
  public readonly displayedColumns: string[] = ['position', 'name', 'weight', 'symbol', 'actions'];

  private data$ = this._periodicElementsService.getElements();

  constructor(
    private readonly _periodicElementsService: PeriodicElementsService,
    private readonly _dialog: MatDialog,
    private readonly _cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.filteredData$ = this.data$;

    this.filterControl.valueChanges.pipe(
      debounceTime(2000)
    ).subscribe(searchTerm => {
      this.filteredData$ = this.getFilteredData(searchTerm);

      this._cdr.markForCheck();
    });
  }

  public openEditDialog(element: PeriodicElement): void {
    const dialogRef = this._dialog.open(EditDialogComponent, {
      data: { element },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateElement(result);
      }
    });
  }

  private getFilteredData(searchTerm: string): Observable<PeriodicElement[]> {
    return this.data$.pipe(
      map((data) => data.filter(item => Object.values(item).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )))
    );
  }

  private updateElement(updatedElement: PeriodicElement): void {
    this._periodicElementsService.updateElement(updatedElement).subscribe(() => {
      this.data$ = this._periodicElementsService.getElements();
      this.filteredData$ = this.getFilteredData(this.filterControl?.value || '');

      this._cdr.markForCheck();
    });
  }
}
