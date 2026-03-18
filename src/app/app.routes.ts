import { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },

  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'eventos',
        loadComponent: () =>
          import('./pages/eventos/eventos.page').then(m => m.EventosPage)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/perfil/perfil.page').then(m => m.PerfilPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.page').then(m => m.LoginPage)
      },
      {
  path: 'calendario',
  loadComponent: () =>
    import('./pages/calendario/calendario.page').then(m => m.CalendarioPage)
},
{
  path: 'quotas',
  loadComponent: () =>
    import('./pages/quotas/quotas.page').then(m => m.QuotasPage)
},
{
  path: 'conta-corrente',
  loadComponent: () =>
    import('./pages/conta-corrente/conta-corrente.page').then(m => m.ContaCorrentePage)
},
{
  path: 'definicoes',
  loadComponent: () =>
    import('./pages/definicoes/definicoes.page').then(m => m.DefinicoesPage)
},
{
  path: 'convocatorias',
  loadComponent: () =>
    import('./pages/convocatorias/convocatorias.page').then(m => m.ConvocatoriasPage)
}
    ]
  }
];