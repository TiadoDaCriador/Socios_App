import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export interface Account {
  accountId: string;
  balance: number;
  currency: string;
  lastUpdated?: string;
}

@Injectable({ providedIn: 'root' })
export class ContaCorrenteService {
  private _account = new BehaviorSubject<Account | null>(null);
  account$: Observable<Account | null> = this._account.asObservable();

  // se preferires, altera para o endpoint real da API
  private url = 'assets/data/account.json';

  constructor(private http: HttpClient) {}

  loadFromAssets(): Observable<Account> {
    return this.http.get<Account>(this.url).pipe(
      tap(acc => this._account.next(acc))
    );
  }

  // método para atualizar localmente (ex: após operação)
  setAccount(acc: Account) {
    this._account.next(acc);
  }
}