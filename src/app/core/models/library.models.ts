// export interface Client {
//   userId: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   contact: string;
//   status: 'Actif' | 'Inactif';
// }

// export interface Author {
//   id: number;
//   name: string;
//   birthDate: Date;
// }

// export interface Book {
//   id: number;
//   image: string;
//   title: string;
//   author: string;
//   description: string;
//   quantity: number;
//   pages: number;
//   status: 'Disponible' | 'Emprunté';
// }

// export interface Loan {
//   id: number;
//   userId: number;
//   bookId: number;
//   loanDate: string;
//   returnDate: string;
//   status: 'En cours' | 'En retard' | 'Retourné';
// }



export interface Author {
  id: number;
  name: string;
  birthdate: string;
}

export interface AuthorInput {
  name: string;
  birthdate: string;
}

export interface Book {
  id: number;
  name: string;
  isbn: string;
  description: string | null;
  year: number | null;
  pages: number | null;
  image: string | null;
  authorId: number;
}

export interface BookInput {
  name: string;
  isbn: string;
  description: string | null;
  year: number | null;
  pages: number | null;
  image: string | null;
  authorId: number;
}

export type UserType = 'CLIENT' | 'GESTIONNAIRE';

export interface LibraryUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  contact: string | null;
  type: UserType;
}

export interface UserInput {
  firstName: string;
  lastName: string;
  email: string;
  contact: string | null;
  password?: string;
  type: UserType;
}

export interface Loan {
  id: number;
  userId: number;
  bookId: number;
  requestDate: string;
  endDate: string;
  returnDate: string | null;
  penalty: number;
}

export interface LoanInput {
  userId: number;
  bookId: number;
}
