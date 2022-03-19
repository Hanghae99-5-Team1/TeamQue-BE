import { User } from 'src/auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Todo } from './todo.entity';

@EntityRepository(Todo)
export class TodoRepository extends Repository<Todo> {
  async createtodo(Dto, user: User): Promise<object> {
    const { content } = Dto;
    const todos = this.create({ content, user });
    await this.save(todos);
    return { success: true, message: '할일 작성 성공' };
  }
}
