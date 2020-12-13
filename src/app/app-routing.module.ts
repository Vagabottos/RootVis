import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'embed-game', loadChildren: () => import('./pages/embed/embed.module').then(m => m.EmbedModule) },
  { path: 'full-game', loadChildren: () => import('./pages/full-game/full-game.module').then(m => m.FullGameModule) },
  { path: 'input-game', loadChildren: () => import('./pages/input/input.module').then(m => m.InputModule) },
  { path: '**', redirectTo: 'input-game' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
