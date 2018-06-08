import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class SearchDataService {

  constructor(private http: HttpClient) { }

  fethData(url)  {
   return this.http.get(url);
  }
}
