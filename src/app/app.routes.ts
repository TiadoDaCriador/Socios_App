import { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // ── Login ─────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [loginGuard],
  },

  // ── Registo ───────────────────────────────────────────
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.page').then(m => m.RegisterPage),
    canActivate: [loginGuard],
  },

  // ── App principal (protegida) ─────────────────────────
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      { path: 'home',          loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
      { path: 'eventos',       loadComponent: () => import('./pages/eventos/eventos.page').then(m => m.EventosPage) },
      { path: 'perfil',        loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage) },
      { path: 'calendario',    loadComponent: () => import('./pages/calendario/calendario.page').then(m => m.CalendarioPage) },
      { path: 'quotas',        loadComponent: () => import('./pages/quotas/quotas.page').then(m => m.QuotasPage) },
      { path: 'conta-corrente',loadComponent: () => import('./pages/conta-corrente/conta-corrente.page').then(m => m.ContaCorrentePage) },
      { path: 'definicoes',    loadComponent: () => import('./pages/definicoes/definicoes.page').then(m => m.DefinicoesPage) },
      { path: 'convocatorias', loadComponent: () => import('./pages/convocatorias/convocatorias.page').then(m => m.ConvocatoriasPage) },
      { path: 'notificacoes',  loadComponent: () => import('./pages/notificacoes/notificacoes.page').then(m => m.NotificacoesPage) },
      { path: 'documentos',    loadComponent: () => import('./pages/documentos/documentos.page').then(m => m.DocumentosPage) },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ]
  },

  { path: '**', redirectTo: 'login' }
];