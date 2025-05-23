import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import("./auth-form/auth-form.component").then(c => c.AuthFormComponent),
    data: { mode: 'login' },
  },
  {
    path: 'qrcode',
    loadComponent: () => import("./qrcode/qrcode.component").then(c => c.QrcodeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'home',
    loadComponent: () => import("./main/main.component").then(c => c.MainComponent),
    canActivate: [authGuard],
  },
  {
    path: 'grupos-lista',
    loadComponent: () => import("./grupos/grupo-lista/grupo-lista.component").then(c => c.GrupoListaComponent),
    canActivate: [authGuard],
  },
  {
    path: 'grupo-consulta/:id',
    loadComponent: () => import("./grupos/grupo-consulta/grupo-consulta.component").then(c => c.GrupoConsultaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'rank-grupo/:id',
    loadComponent: () => import("./grupos/grupo-rank/grupo-rank.component").then(c => c.GrupoRankComponent),
    canActivate: [authGuard]
  },
  {
    path: 'grupo-usuario-lista/:id',
    loadComponent: () => import("./grupos/grupo-usuario-lista/grupo-usuario-lista.component").then(c => c.GrupoUsuarioListaComponent),
    canActivate: [authGuard],
  },
  {
    path: 'usuario/usuario-consulta/:id',
    loadComponent: () => import("./usuarios/usuario-consulta/usuario-consulta.component").then(c => c.UsuarioConsultaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'usuario/usuario-lista',
    loadComponent: () => import("./usuarios/usuario-lista/usuario-lista.component").then(c => c.UsuarioListaComponent),
    canActivate: [authGuard],
  },
  {
    path: 'bans/ban-lista',
    loadComponent: () => import("./ban/ban-lista/ban-lista.component").then(c => c.BanListaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ban/ban-consulta',
    loadComponent: () => import("./ban/ban-consulta/ban-consulta.component").then(c => c.BanConsultaComponent),
    canActivate: [authGuard],
  },
  {
    path: 'grupo-consulta/bans/:id',
    loadComponent: () => import("./grupos/grupo-ban-lista/grupo-ban-lista.component").then(c => c.GrupoBanListaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'advertencia/advertencia-lista',
    loadComponent: () => import("./advertencia/advertencia-lista/advertencia-lista.component").then(c => c.AdvertenciaListaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'advertencia/advertencia-lista-grupo/:id',
    loadComponent: () => import("./advertencia/advertencia-lista-grupo/advertencia-lista-grupo.component").then(c => c.AdvertenciaListaGrupoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'advertencia/advertencia-lista-usuario/:id',
    loadComponent: () => import("./advertencia/advertencia-lista-usuario/advertencia-lista-usuario.component").then(c => c.AdvertenciaListaUsuarioComponent),
    canActivate: [authGuard]
  },
  {
    path: 'advertencia/advertencia-consulta/:id',
    loadComponent: () => import("./advertencia/advertencia-consulta/advertencia-consulta.component").then(c => c.AdvertenciaConsultaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'mensagens/mensagem-lista',
    loadComponent: () => import("./mensagens/mensagem-lista/mensagem-lista.component").then(c => c.MensagemListaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'mensagens/mensagem-consulta/:id',
    loadComponent: () => import("./mensagens/mensagem-consulta/mensagem-consulta.component").then(c => c.MensagemConsultaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'mensagens/mensagem-formulario',
    loadComponent: () => import("./mensagens/mensagem-form/mensagem-form.component").then(c => c.MensagemFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'mensagens/mensagem-formulario/:id',
    loadComponent: () => import("./mensagens/mensagem-form/mensagem-form.component").then(c => c.MensagemFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'editar-administrador',
    loadComponent: () => import("./root/root.component").then(c => c.RootComponent),
  },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth' },
];
