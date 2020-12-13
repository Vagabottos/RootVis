import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-embed',
  templateUrl: './embed.component.html',
  styleUrls: ['./embed.component.scss']
})
export class EmbedComponent implements OnInit {

  constructor() { }

  // TODO: if game is invalid, don't redirect - show a message

  ngOnInit(): void {
  }

}
