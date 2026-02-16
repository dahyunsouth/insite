import { NextRequest } from "next/server";
import { errorResponse, createToken } from "../../_mock/helpers";
import { findUserByEmail, addUser } from "../../_mock/store";

let nextId = 100;

export async function POST(req: NextRequest) {
  try {
    const { email, nickname, password, type } = await req.json();

    if (findUserByEmail(email)) {
      return errorResponse("이미 사용 중인 이메일입니다.", 409);
    }

    const uuid = `a1b2c3d4-${String(nextId).padStart(4, "0")}-4000-8000-000000000000`;
    const user = {
      id: nextId++,
      uuid,
      email,
      password,
      nickname,
      profile: "profile1",
      provider: "local",
      type: type ?? "user",
    };
    addUser(user);

    const token = createToken({
      uuid,
      email,
      nickname,
      profile: user.profile,
      provider: user.provider,
      type: user.type,
    });
    const refreshToken = createToken({ uuid, email });

    return new Response(
      JSON.stringify({
        httpStatus: "OK",
        isSuccess: true,
        message: "회원가입 성공",
        code: 200,
        token,
        result: { accessToken: token, refreshToken, token },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch {
    return errorResponse("요청 형식이 올바르지 않습니다.", 400);
  }
}
