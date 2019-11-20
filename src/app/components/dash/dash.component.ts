import {Component, Inject, OnInit} from '@angular/core';
import {APIService, EventModel, MyEventsResponse} from '../../services/api.service';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss'],
  animations: [
    trigger('listStagger', [
      transition('* <=> *',
        [
          query(':enter', [
            style({opacity: 0, transform: 'translateY(-15px)'}),
            stagger('50ms',
              animate('550ms ease-out',
                style({opacity: .7, transform: 'translateY(0px)'})))
          ], {optional: true})
        ])
    ])
  ]
})
export class DashComponent implements OnInit {

  availableEvents: Array<EventModel>;
  myEvents: MyEventsResponse;

  constructor(
    private readonly apiService: APIService,
    private readonly snackbar: MatSnackBar,
    private readonly dialog: MatDialog
  ) {
  }

  async ngOnInit() {
    this.refreshEvents();
    this.refreshMyEvents();
  }

  drop = async (event: EventModel) => {
    try {
      await this.apiService.drop(event._id);
      this.refreshEvents();
      this.refreshMyEvents();
    } catch (e) {
      this.snackbar.open('Failed to drop event (' + e + ')')._dismissAfter(2000);
    }
  };

  refreshEvents = async () => {
    try {
      this.availableEvents = await this.apiService.getMyAvailableEvents();
    } catch (e) {
      this.snackbar.open('Failed to refresh events (' + e + ')')._dismissAfter(2000);
    }
  };

  refreshMyEvents = async () => {
    try {
      this.myEvents = await this.apiService.getMyEvents();
    } catch (e) {
      this.snackbar.open('Failed to refresh your events (' + e + ')')._dismissAfter(2000);
    }
  };

  signUp = async (event: EventModel): Promise<void> => {
    try {
      await this.apiService.signUp(event._id);
      this.refreshEvents();
      this.refreshMyEvents();
    } catch (e) {
      this.snackbar.open('Failed to sign up for event (' + e + ')')._dismissAfter(2000);
    }
  };

  enterCode = async (event: EventModel): Promise<void> => {
    const dialogRef = this.dialog.open(FacilitatorAddDialogComponent, {
      data: {
        code: ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.tryCode(event, result);
    });
  };

  tryCode = async (event: EventModel, code: string) => {
    try {
      await this.apiService.enterCode(event._id, code);
      this.refreshMyEvents();
      this.refreshEvents();
    } catch (e) {
      this.snackbar.open('Failed to become facilitator (' + e + ')')._dismissAfter(2000);
    }
  };

  checkEventFacilitator = (event: EventModel): boolean => {
    return event.facilitators.find(facilitator => facilitator._id === this.apiService.userSession.data.user._id) !== undefined;
  };

  checkQualified = (event: EventModel): boolean => {
    if (event.requiredTags.length === 0) {
      return true;
    }

    return event.requiredTags.every(requiredTag => this.apiService.userSession.data.user.userTags.includes(requiredTag));
  };
}

export interface FacilitatorAddDialogData {
  code: string;
}

@Component({
  selector: 'app-remove-tag',
  templateUrl: 'facilitatorAdd.dialog.component.html',
})
export class FacilitatorAddDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<FacilitatorAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FacilitatorAddDialogData) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}