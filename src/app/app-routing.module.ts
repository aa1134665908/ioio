import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import{LoginComponent}from'./login/login.component'
import{HomeComponent}from './home/home.component'
import{ChatDetailComponent}from './chat-detail/chat-detail.component'

const routes: Routes = [
  { path: '', redirectTo: '/chat', pathMatch: 'full' },
  {path:'login',component:LoginComponent},
  {path:'chat',component:HomeComponent,children: [
    {
      path: ':id',
      component: ChatDetailComponent
    }
  ]},
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
