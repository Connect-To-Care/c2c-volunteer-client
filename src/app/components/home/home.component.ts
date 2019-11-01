import {Component, OnInit} from '@angular/core';
import {APIService, EventModel, MyEventsResponse} from '../../services/api.service';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
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
export class HomeComponent implements OnInit {

  availableEvents: Array<EventModel> = [];
  myEvents: MyEventsResponse = {
    future: [],
    now: [],
    past: []
  };

  constructor(
    private readonly apiService: APIService,
    private readonly snackbar: MatSnackBar
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
      this.snackbar.open('Failed to drop event (' + e + ')');
    }
  };

  refreshEvents = async () => {
    try {
      this.availableEvents = await this.apiService.getAvailableEvents();
    } catch (e) {
      this.snackbar.open('Failed to refresh events (' + e + ')');
    }
  };

  refreshMyEvents = async () => {
    try {
      this.myEvents = await this.apiService.getEvents();
    } catch (e) {
      this.snackbar.open('Failed to refresh your events (' + e + ')');
    }
  };

  formatDate = (strDate: string): string => {
    const date = new Date(strDate);

    let hours = date.getHours();
    let minutes: any = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear() + '  ' + strTime;
  };

  listMembers = (event: EventModel): string => {
    let members = '';
    event.signedUp.forEach(member => {
      members += member.fullName + ',';
    });

    if (members === '') {
      members = 'No one';
    } else {
      members = members.substring(0, members.length - 1);
    }
    return members;
  };

  signUp = async (event: EventModel): Promise<void> => {
    try {
      await this.apiService.signUp(event._id);
      this.refreshEvents();
      this.refreshMyEvents();
    } catch (e) {
      this.snackbar.open('Failed to sign up for event (' + e + ')');
    }
  };

}