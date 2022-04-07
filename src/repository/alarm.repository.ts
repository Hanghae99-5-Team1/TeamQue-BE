import { Alarm } from 'src/entity/alarm.entity';
import { User } from 'src/entity/user.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Alarm)
export class AlarmRepository extends Repository<Alarm> {
  async createAlarm(user: User, message) {
    const alarm = this.create({ user, message });
    await this.save(alarm);
  }
}
