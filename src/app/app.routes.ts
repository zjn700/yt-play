//import { compileClassDebugInfo } from '@angular/compiler';
import { Routes } from '@angular/router';
import { Playground } from './playground/playground';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Playground },
];
