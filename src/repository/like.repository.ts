import { Like } from 'src/entity/like.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Like)
export class LikeRepository extends Repository<Like> {}
