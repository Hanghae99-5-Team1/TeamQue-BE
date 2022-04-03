import { EntityRepository, Repository } from 'typeorm';
import { Chat } from 'src/entity/chat.entity';

@EntityRepository(Chat)
export class ChatRepository extends Repository<Chat> {
  async createLog(
    classId: number,
    userId: number,
    userName: string,
    content: string,
    uuid: string,
    type: number,
  ) {
    const log = this.create({
      classId,
      userId,
      userName,
      content,
      uuid,
      type,
      isResolved: false,
      like: 0,
    });
    await this.save(log);
    return;
  }
}
