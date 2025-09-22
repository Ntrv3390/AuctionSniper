// export interface EditSnipeModel {
//     id: number;
//     itemNumber: string;
//     title: string;
//     currentPrice: string;
//   }
  

export class EditSnipeModel {
  constructor(
    public id: number = 0,
    public itemNumber: string = '',
    public title: string = '',
    public currentPrice: string = ''
  ) {}
}