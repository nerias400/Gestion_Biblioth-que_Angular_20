export interface Client {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  status: 'Actif' | 'Inactif';
}

export interface Author {
  id: number;
  name: string;
  birthDate: Date;
}

export interface Book {
  id: number;
  image: string;
  title: string;
  author: string;
  description: string;
  quantity: number;
  pages: number;
  status: 'Disponible' | 'Emprunté';
}

export interface Loan {
  id: number;
  userId: number;
  bookId: number;
  loanDate: string;
  returnDate: string;
  status: 'En cours' | 'En retard' | 'Retourné';
}
