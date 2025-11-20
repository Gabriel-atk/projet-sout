export class User {
  id!: string;
  firstName!: string;
  lastName!: string;
  telephone!: string;
  email!: string;
  password!: string;
  role = 'USER';
  country='TOGO';



  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }
}
