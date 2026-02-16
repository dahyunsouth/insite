// 메모리 기반 상태 관리 (서버 재시작 시 초기화)

import { MOCK_USERS, type MockUser } from "./users";

// --- 유저 저장소 ---
let users: MockUser[] = [...MOCK_USERS];

export function getUsers() {
  return users;
}

export function findUserByEmail(email: string) {
  return users.find((u) => u.email === email);
}

export function findUserByUuid(uuid: string) {
  return users.find((u) => u.uuid === uuid);
}

export function findUserByNickname(nickname: string) {
  return users.find((u) => u.nickname === nickname);
}

export function addUser(user: MockUser) {
  users.push(user);
}

export function updateUser(uuid: string, patch: Partial<MockUser>) {
  const idx = users.findIndex((u) => u.uuid === uuid);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch };
  return users[idx];
}

export function deleteUser(uuid: string) {
  users = users.filter((u) => u.uuid !== uuid);
}

// --- 즐겨찾기 저장소 ---
interface Favorite {
  id: number;
  userUuid: string;
  trdarCd: number;
  createdAt: string;
}

let favorites: Favorite[] = [];
let nextFavId = 1;

export function getFavorites(userUuid: string) {
  return favorites.filter((f) => f.userUuid === userUuid);
}

export function addFavorite(userUuid: string, trdarCd: number) {
  const exists = favorites.find(
    (f) => f.userUuid === userUuid && f.trdarCd === trdarCd
  );
  if (exists) return exists;
  const fav: Favorite = {
    id: nextFavId++,
    userUuid,
    trdarCd,
    createdAt: new Date().toISOString(),
  };
  favorites.push(fav);
  return fav;
}

export function removeFavorite(userUuid: string, trdarCd: number) {
  const before = favorites.length;
  favorites = favorites.filter(
    (f) => !(f.userUuid === userUuid && f.trdarCd === trdarCd)
  );
  return favorites.length < before;
}
