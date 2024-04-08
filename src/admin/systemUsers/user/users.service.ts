import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminsEntity } from './entities/adminUsers.entity';
import { SubjectEntity } from './entities/adminSubjects.entity';
import { ActionEntity } from './entities/adminActions.entity';
import { CreateSubjectDto } from './dto/createSubject.dto';
import { CreateActionDto } from './dto/createAction.dto';
import { ActionEnum } from 'src/helpers/constants';

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);
  constructor(
    @InjectRepository(AdminsEntity)
    private adminUserRepository: Repository<AdminsEntity>,
    @InjectRepository(SubjectEntity)
    private adminSubjectRepository: Repository<SubjectEntity>,
    @InjectRepository(ActionEntity)
    private adminActionRepository: Repository<ActionEntity>,
  ) {}

  async getUsers() {
    this.logger.log(`Getting admin users!`);
    const users = await this.adminUserRepository.find();
    this.logger.log(`Admin users returned successfully!`);
    return users;
  }

  async getOneUser(userId: string) {
    this.logger.log(`Getting admin user with id ${userId}!`);
    const user = await this.adminUserRepository.findOne({
      where: { id: userId },
      relations: { subjects: { action: true } },
      select: {
        subjects: {
          id: true,
          subject: true,
          action: { id: true, action: true },
        },
      },
    });
    this.logger.log(`Admin user with id ${userId} returned successfully!`);
    return user;
  }

  async updateUser(userId: string, dto) {
    this.logger.log(`Updating admin user with id ${userId}!`);
    const user = await this.adminUserRepository.update(
      {
        id: userId,
      },
      dto,
    );
    this.logger.log(`Admin user with id ${userId} updated successfully!`);
    return user;
  }

  async deleteUser(userId: string) {
    this.logger.log(`Deleting admin user with id ${userId}!`);
    await this.adminUserRepository.delete({ id: userId });
    this.logger.log(`Admin user with id ${userId} deleted successfully!`);
    return { message: 'User deleted successfully!' };
  }

  async getMe(userId: string) {
    if (!userId) throw new UnauthorizedException();
    const user = await this.adminUserRepository.findOne({
      where: { id: userId },
      relations: { subjects: { action: true } },
      select: {
        id: true,
        name: true,
        role: true,
        isActive: true,
        subjects: {
          id: true,
          subject: true,
          action: {
            id: true,
            action: true,
          },
        },
      },
    });

    return user;
  }

  async createSubject(dto: CreateSubjectDto, adminId: string) {
    this.logger.log(`Creating subject for  admin user with id ${adminId}!`);
    const user = await this.getOneUser(adminId);
    const candidate = await this.adminSubjectRepository.findOne({
      where: { subject: dto.subject, adminId: adminId },
    });
    if (candidate) {
      this.logger.error(`You cannot create  subject for  root user!`);
      throw new ConflictException(
        `User with id ${adminId} already have subject ${dto.subject}`,
      );
    }
    if (user.role === 'root')
      throw new ConflictException('You cannot create subject for root user!');

    const subject = this.adminSubjectRepository.create(dto);

    await this.adminSubjectRepository.save(subject);
    const createActionDto: CreateActionDto = {
      action: ActionEnum.Read,
    };

    const action = await this.createAction(createActionDto, subject.id);
    this.logger.log(
      `Subject for  admin user with id ${adminId} created successfully!`,
    );
    return { subject: subject, action: action };
  }

  async deleteSubject(subjectId: string) {
    this.logger.log(`Deleting subject with id  ${subjectId}!`);
    const candidate = await this.adminSubjectRepository.findOne({
      where: { id: subjectId },
    });
    if (!candidate) throw new NotFoundException('Subject does not exist!');

    await this.adminSubjectRepository.delete({
      id: subjectId,
    });
    this.logger.log(`Subject with id ${subjectId} deleting successfully!`);
    return { message: 'Subject deleted successfully!' };
  }
  async createAction(dto: CreateActionDto, subjectId: string) {
    this.logger.log(`Creating action for  subject with id ${subjectId}!`);
    const candidate = await this.adminActionRepository.findOne({
      where: { action: dto.action, subjectId: subjectId },
    });
    if (candidate)
      throw new ConflictException(
        `User with subject id ${subjectId} already have action ${dto.action}`,
      );

    const action = this.adminActionRepository.create(dto);

    this.adminActionRepository.save(action);
    this.logger.log(`Action created for subject with id ${subjectId}!`);
    return action;
  }

  async deleteAction(actionId: string) {
    this.logger.log(`Deleting action with id  ${actionId}!`);
    const candidate = await this.adminActionRepository.findOne({
      where: { id: actionId },
    });
    if (!candidate) throw new NotFoundException('Action does not exist!');
    if (candidate.action === 'read')
      throw new ForbiddenException('You cannot delete a read action!');
    await this.adminActionRepository.delete({
      id: actionId,
    });
    this.logger.log(`Action with id  ${actionId} deleted successfully!`);
    return { message: 'Action deleted successfully!' };
  }
}
