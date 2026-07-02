import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Room } from './rooms/entities/room.entity';
import { RoomMember, RoomRole } from './rooms/entities/room-member.entity';
import { Message } from './chat/entities/message.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const roomRepository = app.get<Repository<Room>>(getRepositoryToken(Room));
  const roomMemberRepository = app.get<Repository<RoomMember>>(
    getRepositoryToken(RoomMember),
  );
  const messageRepository = app.get<Repository<Message>>(
    getRepositoryToken(Message),
  );

  console.log('🌱 Очищаємо базу даних...');
  await userRepository.query('TRUNCATE TABLE users CASCADE;');
  await roomRepository.query('TRUNCATE TABLE rooms CASCADE;');

  console.log('🌱 Починаємо сідування бази даних...');

  
  const users: User[] = [];
  const passwordHash = await bcrypt.hash('password123', 10);

  for (let i = 0; i < 10; i++) {
    const user = userRepository.create({
      username: faker.internet.username(),
      email: faker.internet.email(),
      passwordHash,
    });
    users.push(await userRepository.save(user));
  }
  console.log(`✅ Створено 10 користувачів.`);

  
  const rooms: Room[] = [];
  for (let i = 0; i < 3; i++) {
    const room = roomRepository.create({
      title: faker.lorem.words(2) + ' Chat',
      inviteCode: randomBytes(4).toString('hex').toUpperCase(),
    });
    rooms.push(await roomRepository.save(room));
  }
  console.log(`✅ Створено 3 кімнати.`);

  
  for (const room of rooms) {
    const shuffledUsers = [...users]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    for (let i = 0; i < shuffledUsers.length; i++) {
      const user = shuffledUsers[i];

      const role = i === 0 ? RoomRole.OWNER : RoomRole.MEMBER;

      const member = roomMemberRepository.create({
        user,
        room,
        role,
      });
      await roomMemberRepository.save(member);

      const messagesCount = Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < messagesCount; j++) {
        const message = messageRepository.create({
          content: faker.lorem.sentence(),
          sender: user,
          room: room,
        });
        await messageRepository.save(message);
      }
    }
  }
  console.log(`✅ Створено мемберів та повідомлення в кімнатах.`);

  console.log('🎉 Сідування успішно завершено!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Помилка сідування:', err);
  process.exit(1);
});
