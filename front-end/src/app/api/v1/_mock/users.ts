export interface MockUser {
  id: number;
  uuid: string;
  email: string;
  password: string; // 평문 (mock 전용)
  nickname: string;
  profile: string;
  provider: string;
  type: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 1,
    uuid: "a1b2c3d4-0001-4000-8000-000000000001",
    email: "test@example.com",
    password: "test1234",
    nickname: "테스트유저",
    profile: "profile1",
    provider: "local",
    type: "user",
  },
  {
    id: 2,
    uuid: "a1b2c3d4-0002-4000-8000-000000000002",
    email: "admin@example.com",
    password: "admin1234",
    nickname: "관리자",
    profile: "profile2",
    provider: "local",
    type: "admin",
  },
  {
    id: 3,
    uuid: "a1b2c3d4-0003-4000-8000-000000000003",
    email: "user1@example.com",
    password: "user1234",
    nickname: "김서울",
    profile: "profile3",
    provider: "local",
    type: "user",
  },
  {
    id: 4,
    uuid: "a1b2c3d4-0004-4000-8000-000000000004",
    email: "user2@example.com",
    password: "user1234",
    nickname: "이강남",
    profile: "profile4",
    provider: "local",
    type: "user",
  },
  {
    id: 5,
    uuid: "a1b2c3d4-0005-4000-8000-000000000005",
    email: "user3@example.com",
    password: "user1234",
    nickname: "박종로",
    profile: "profile5",
    provider: "local",
    type: "user",
  },
];
