// src/app/mocks/mock-users.ts
// Utilizadores de teste — remover quando a API estiver pronta

export interface MockUser {
  id: string;
  email: string;
  nif: string;
  password: string;
  role: 'socio' | 'admin';
  token: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    email: 'joao@teste.pt',
    nif: '123456789',
    password: '123456',
    role: 'socio',
    token: 'mock-token-joao-123',
  },
  {
    id: '2',
    email: 'maria@teste.pt',
    nif: '987654321',
    password: '123456',
    role: 'socio',
    token: 'mock-token-maria-456',
  },
  {
    id: '3',
    email: 'admin@teste.pt',
    nif: '111111111',
    password: 'admin',
    role: 'admin',
    token: 'mock-token-admin-789',
  },
];