import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { PeriodicElement } from "../../core/interfaces/PeriodicElement";
import { RxState } from "@rx-angular/state";

@Component({
  selector: 'app-edit-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RxState],
  imports: [
    MatInputModule,
    FormsModule,
    MatButtonModule,
    CommonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions
  ],
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent {
  public readonly element: PeriodicElement;

  constructor(
    private readonly _dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly _data: { element: PeriodicElement },
    public readonly state: RxState<{ element: PeriodicElement }>
  ) {
    this.state.set({ element: { ..._data.element } });
    this.element = this.state.get('element');
  }

  public save(): void {
    this._dialogRef.close(this.state.get('element'));
  }

  public close(): void {
    this._dialogRef.close();
  }
}
