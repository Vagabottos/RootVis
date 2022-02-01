import { Component } from '@angular/core';
import { compressToEncodedURIComponent } from 'lz-string';

import { RootlogService } from '../../rootlog.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {

  games = [
    {
      title: '3v1 chained Vagabond coalition',
      subtitle: 'Winter Tournament - R1G3',
      url: 'https://raw.githubusercontent.com/Vagabottos/Rootlog/master/Games/2020_11_26_winter_tournament_r1g3.rootlog'
    },
    {
      title: 'Eyrie mid-game spike + Aftermath',
      subtitle: 'Winter Tournament - R1G5',
      url: 'https://raw.githubusercontent.com/Vagabottos/Rootlog/master/Games/2020_11_20_winter_tournament_r1g5.rootlog'
    },
    {
      title: 'Otters, Mice, Cats, and Corvids',
      subtitle: 'Winter Tournament - R2G4',
      url: 'https://raw.githubusercontent.com/Vagabottos/Rootlog/master/Games/2020_11_24_winter_tournament_r2g4.rootlog'
    }
  ];

  constructor() {}
}
