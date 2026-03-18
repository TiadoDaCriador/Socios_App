// src/app/services/perfil.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
// TODO: Descomentar quando ligares ao API
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { AuthService } from './auth.service';

// ─────────────────────────────────────────────────────────
// TODO: Substitui pela URL real quando tiveres acesso ao API
// ─────────────────────────────────────────────────────────
const API_URL = 'https://SEU-API-URL-AQUI.com';

// ─────────────────────────────────────────────────────────
// TODO: Ajusta os nomes dos campos ao JSON real do teu API
// ─────────────────────────────────────────────────────────
export interface PerfilAPI {
  id?:              string;
  nome_completo?:   string;
  genero?:          string;
  data_nascimento?: string;
  cartao_cidadao?:  string;
  nif?:             string;
  codigo_postal?:   string;
  morada?:          string;
  localidade?:      string;
  pais?:            string;
  telemovel1?:      string;
  telemovel2?:      string;
  email?:           string;
  numero_socio?:    string;
  foto_perfil?:     string;
}

export interface PerfilLocal {
  fotoPerfil:     string | null;
  nomeCompleto:   string;
  genero:         string;
  dataNascimento: string;
  cartaoCidadao:  string;
  nif:            string;
  codigoPostal:   string;
  morada:         string;
  localidade:     string;
  pais:           string;
  telemovel1:     string;
  telemovel2:     string;
  email:          string;
  numeroSocio:    string;
}

// Dados de exemplo enquanto o API não está disponível
// TODO: Remove isto quando ligares ao API real
const MOCK_PERFIL: PerfilLocal = {
  fotoPerfil:     null,
  nomeCompleto:   'João Manuel Silva',
  genero:         'masculino',
  dataNascimento: '1990-05-15',
  cartaoCidadao:  '12345678 9ZZ4',
  nif:            '123456789',
  codigoPostal:   '4000-123',
  morada:         'Rua das Flores, 45, 2º Dto',
  localidade:     'Porto',
  pais:           'Portugal',
  telemovel1:     '912345678',
  telemovel2:     '',
  email:          'joao.silva@email.com',
  numeroSocio:    'SC-00423',
};

@Injectable({ providedIn: 'root' })
export class PerfilService {

  // TODO: Substitui pelo endpoint real
  // Exemplos: /api/utilizadores/me | /api/socios/perfil | /users/profile
  private readonly endpoint = `${API_URL}/perfil`;

  constructor() {}
  // TODO: Adicionar quando ligares ao API
  // constructor(private http: HttpClient, private auth: AuthService) {}

  getPerfil(): Observable<PerfilLocal> {
    // TODO: Quando tiveres o API, descomenta as linhas abaixo e apaga o "return of(MOCK_PERFIL)"
    // const headers = new HttpHeaders(this.auth.getAuthHeaders());
    // return this.http
    //   .get<PerfilAPI>(this.endpoint, { headers })
    //   .pipe(map(api => this.apiToLocal(api)));

    return of(MOCK_PERFIL);
  }

  updatePerfil(dados: PerfilLocal): Observable<PerfilLocal> {
    // TODO: Quando tiveres o API, descomenta as linhas abaixo e apaga o "return of(dados)"
    // const headers = new HttpHeaders(this.auth.getAuthHeaders());
    // const body    = this.localToApi(dados);
    // return this.http
    //   .put<PerfilAPI>(this.endpoint, body, { headers })
    //   .pipe(map(api => this.apiToLocal(api)));

    return of(dados);
  }

  // ─── Ajusta os nomes dos campos aqui quando tiveres o API ─
  private apiToLocal(api: PerfilAPI): PerfilLocal {
    return {
      fotoPerfil:     api.foto_perfil     ?? null,
      nomeCompleto:   api.nome_completo   ?? '',
      genero:         api.genero          ?? '',
      dataNascimento: api.data_nascimento ?? '',
      cartaoCidadao:  api.cartao_cidadao  ?? '',
      nif:            api.nif             ?? '',
      codigoPostal:   api.codigo_postal   ?? '',
      morada:         api.morada          ?? '',
      localidade:     api.localidade      ?? '',
      pais:           api.pais            ?? 'Portugal',
      telemovel1:     api.telemovel1      ?? '',
      telemovel2:     api.telemovel2      ?? '',
      email:          api.email           ?? '',
      numeroSocio:    api.numero_socio    ?? '',
    };
  }

  private localToApi(local: PerfilLocal): PerfilAPI {
    return {
      foto_perfil:     local.fotoPerfil ?? undefined,
      nome_completo:   local.nomeCompleto,
      genero:          local.genero,
      data_nascimento: local.dataNascimento,
      cartao_cidadao:  local.cartaoCidadao,
      nif:             local.nif,
      codigo_postal:   local.codigoPostal,
      morada:          local.morada,
      localidade:      local.localidade,
      pais:            local.pais,
      telemovel1:      local.telemovel1,
      telemovel2:      local.telemovel2,
      email:           local.email,
    };
  }
}