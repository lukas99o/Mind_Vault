export interface Book {
  id: number;
  text: string;
  author: string;
  publicationDate: string;
}

export interface BookUpsertRequest {
  text: string;
  author: string;
  publicationDate: string;
}
