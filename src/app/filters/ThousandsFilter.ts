import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thousands'
})
export class ThousandsPipe implements PipeTransform {
  transform(input: number | null | undefined): string {
    if (input == null) {
      return '';
    }

    if (input > 9999) {
      if (input % 10 === 0) {
        return (input / 1000) + 'K';
      } else {
        return (input / 1000).toFixed(0) + 'K';
      }
    } else if (input > 999) {
      if (input % 10 === 0) {
        return (input / 1000) + 'K';
      } else {
        return (input / 1000).toFixed(1) + 'K';
      }
    } else {
      return input.toString();
    }
  }
}
