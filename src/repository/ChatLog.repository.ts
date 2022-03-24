import { EntityRepository, Repository } from 'typeorm';
import { ChatLog } from '../entity/ChatLog.entity';

@EntityRepository(ChatLog)
export class ChatLogRepository extends Repository<ChatLog> {
  async createLog(
    classId: number,
    writer: string,
    contents: string,
    uuid: string,
    type: number,
  ) {
    const log = this.create({ classId, writer, contents, uuid, type });
    await this.save(log);
    return { success: 'true' };
  }
}
