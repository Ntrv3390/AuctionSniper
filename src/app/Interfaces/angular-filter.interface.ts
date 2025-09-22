export interface AngularFilter<T> {
  filter(input: T, ...args: any[]): any;
}