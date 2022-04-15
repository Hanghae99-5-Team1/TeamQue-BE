import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'test',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};
// import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// export const typeORMConfig: TypeOrmModuleOptions = {
//   type: 'mysql',
//   host: 'everyque.cgz8hxr2oksg.ap-northeast-2.rds.amazonaws.com',
//   port: 3306,
//   username: 'admin',
//   password: 'root1234',
//   database: 'everyque',
//   entities: [__dirname + '/../**/*.entity.{js,ts}'],
//   synchronize: true,
// };
