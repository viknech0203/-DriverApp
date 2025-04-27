// types.ts

export type Document = {
    name: string;
    nomer: string;
    date_from: string;
    date_to: string;
  };
  
  export type Driver = {
    fio: string;
    docs?: Document[];
  };
  
