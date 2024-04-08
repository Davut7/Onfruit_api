export class UserTokenDto {
  id: string;
  role: string;
  firstName: string;
  lastName: string;

  constructor(Entity: any) {
    this.id = Entity.id;
    this.role = Entity.role;
    this.firstName = Entity.firstName;
    this.lastName = Entity.lastName;
  }
}
