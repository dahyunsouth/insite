import { NextRequest } from "next/server";
import { errorResponse, createToken } from "../../_mock/helpers";
import { findUserByEmail } from "../../_mock/store";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
      return errorResponse("이메일 혹은 패스워드가 틀렸습니다.", 401);
    }

    const token = createToken({
      uuid: user.uuid,
      email: user.email,
      nickname: user.nickname,
      profile: user.profile,
      provider: user.provider,
      type: user.type,
    });
    const refreshToken = createToken({ uuid: user.uuid, email: user.email });

    return new Response(
      JSON.stringify({
        httpStatus: "OK",
        isSuccess: true,
        message: "로그인 성공",
        code: 200,
        token,
        result: { accessToken: token, refreshToken },
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
