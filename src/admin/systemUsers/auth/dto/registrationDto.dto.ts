import { ApiProperty, OmitType } from '@nestjs/swagger';
import { AdminsEntity } from '../../user/entities/adminUsers.entity';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class AdminRegistrationUserDto extends OmitType(AdminsEntity, [
  'createdAt',
  'deletedAt',
  'id',
  'updatedAt',
  'token',
  'isActive',
] as const) {
  @ApiProperty({
    title: 'Confirm Password',
    name: 'confirmPassword',
    description: 'The confirmed password of the admin user',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
  })
  confirmPassword: string;
}
