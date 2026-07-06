import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const ownedRoomsRaw = await manager
        .createQueryBuilder()
        .select('rm.roomId', 'roomId')
        .from('room_members', 'rm')
        .where('rm.userId = :id AND rm.role = :role', { id, role: 'owner' })
        .getRawMany();

      const ownedRooms = ownedRoomsRaw as Array<{ roomId: string }>;

      if (ownedRooms.length > 0) {
        const roomIds = ownedRooms.map((r) => r.roomId);
        await manager
          .createQueryBuilder()
          .delete()
          .from('rooms')
          .where('id IN (:...roomIds)', { roomIds })
          .execute();
      }

      await manager.delete(User, id);
    });
  }
}
