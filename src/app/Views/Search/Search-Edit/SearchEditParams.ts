export class SearchEditParams {
    /**
     * If populated, indicates we should be editing the record with this ID.
     */
    public id: string | null = null;
  
    /**
     * If populated, used to default the AllWords view model property when
     * creating a new record.
     */
    public keywords: string | null = null;
  }
  