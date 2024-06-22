import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';

class MockRepository {
  async findOneBy(query) {
    const user: User = new User();
    user.email = query.email;
    return user;
  }
}

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        //데이터베이스 종속성을 끊으면서 mockRepo로 유저 서비스 단위 테스트 
        {
          provide: getRepositoryToken(User),
          useClass: MockRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', async() => {
    const email = 'example@example.com';
    const result = await userService.findOneByEmail(email);
    expect(result.email).toBe(email);
  });
});
