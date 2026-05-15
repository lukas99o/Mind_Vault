export interface Quote {
  id: number;
  text: string;
  author: string;
}

export interface QuoteUpsertRequest {
  text: string;
  author: string;
}
