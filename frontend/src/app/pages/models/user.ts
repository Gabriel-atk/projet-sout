export class User {
  id!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
  telephone!: string;



  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }
}
