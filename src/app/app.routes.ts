import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Videos',
    loadComponent: () =>
      import('./features/video-list/video-list.component').then((m) => m.VideoListComponent),
  },
  {
    path: 'video/:id',
    title: 'Watch',
    loadComponent: () =>
      import('./features/video-player/video-player.component').then((m) => m.VideoPlayerComponent),
  },
  { path: '**', redirectTo: '' },
];
