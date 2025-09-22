import { Dictionary } from 'src/app/Interfaces/dictionary.interface'; // Adjust path as needed

export interface LogHttpFields {
  httpRequestUrl?: string;
  httpQueryParams?: Dictionary<string>;
  httpResponseHeaders?: Dictionary<string>;
}
