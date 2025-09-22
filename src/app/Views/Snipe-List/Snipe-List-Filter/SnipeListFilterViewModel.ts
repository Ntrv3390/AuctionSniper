export class SnipeListFilterViewModel {
    sortByEndingSoonest: boolean = true;
  
    constructor(init?: Partial<SnipeListFilterViewModel>) {
      Object.assign(this, init);
    }
  }
  