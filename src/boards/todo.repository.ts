import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Todo } from './todo.entity';

@EntityRepository(Todo)
export class TodoRepository extends Repository<Todo> {
  async createtodo(Dto, user: User): Promise<object> {
    const { content } = Dto;
    const check = await this.count({ user });
    let order;
    if (check === 0) {
      order = 1;
    } else {
      order = check + 1;
    }
    const todos = this.create({ content, user, order });
    await this.save(todos);
    return { success: true, message: '할일 작성 성공' };
  }
}
