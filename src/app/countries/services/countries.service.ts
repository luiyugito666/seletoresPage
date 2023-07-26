import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private _regions: Region[] = [Region.Africa, Region.Europe, Region.Americas, Region.Asia, Region.Oceania];
  
  private baseUrl:string='https://restcountries.com/v3.1'


  constructor(private http:HttpClient) { }

  get regions(): Region[] { 
    return [...this._regions];
  }

  //Nullish coalescing operator( ??) es un operador lógico que devuelve su operando del lado derecho cuando su operando del lado izquierdo es nullo undefined, y de lo contrario devuelve su operando del lado izquierdo.
  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);

    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;

    return this.http.get<Country[]>(url)
      .pipe(
        map(countries => countries.map(country => ({ 
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders??[],

        }))),
       
      );
  }

  getCountryByAlphaCode(alphaCode:string): Observable<SmallCountry> { 
    const url = `${this.baseUrl}/alpha/${alphaCode}/?fields=cca3,name,borders`;
    
   return this.http.get<Country>(url)
      .pipe(
        map(country =>
        ({
          name: country.name.common,
          cca3: country.cca3,
          borders:country.borders??[],
          })
          )

    )

  }

//para mostrar nombre de las fronteras en lugar de los codigos
  
  getCountryBordersByCodes(borders: string[]): Observable<SmallCountry[]> { 


    if (!borders || borders.length === 0) return of([]);

    const countriesRequest: Observable<SmallCountry>[] = [];
    borders.forEach(code => {
      const request = this.getCountryByAlphaCode(code);
      countriesRequest.push(request);
    })

    //el conbineLatest cuando sea llamado por el .subscribe, que lo que se termina retornando, va a emitir hasta que todos los observables que esten dentro del countriesrequest emitan un valor, todos se disparan de manera simultanea
    return combineLatest(countriesRequest);
  }




}
