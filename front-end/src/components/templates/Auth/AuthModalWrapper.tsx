// front-end/src/components/templates/Auth/AuthModalWrapper.tsx
'use client';

import React, { useReducer } from 'react';

// 로그인 모달 (내부에서 SignUpPrompt 렌더)
// ⛳️ LoginOrganism 에 onSignUpClick?: () => void; prop 을 추가해
// 내부 <SignUpPrompt onSignUpClick={props.onSignUpClick} />로 전달해줘.
import LoginOrganism from '@/components/organisms/Login';

// 재사용 아톰/몰큘
import AuthenticationCard from '@/components/atoms/Card/Authentication';
import AuthenticationLabel from '@/components/atoms/Heading/Authentication';
import SignUpLabel from '@/components/atoms/Label/SignUp';
import SignUpBody from '@/components/atoms/Text/SignUp';
import AuthenticationInputBox from '@/components/atoms/InputBox/InputBox';
import SubmitButton from '@/components/atoms/Button/Submit';
import LabeledStaticField from '@/components/molecules/LabeledStaticField';
import OtpGroup from '@/components/molecules/OtpGroup';

// ---------------------------------------------
// 상태 정의
// ---------------------------------------------
type Mode =
  | 'login'
  | 'signup_email'
  | 'signup_otp'
  | 'signup_nickname'
  | 'signup_password'
  | 'signup_password_confirm'
  | 'signup_done';

type FormState = {
  email: string;
  otp: string;        // UI 껍데기만: 값 보관만
  nickname: string;
  password: string;
  passwordConfirm: string;
};

type State = {
  mode: Mode;
  form: FormState;
};

type Action =
  | { type: 'GO'; to: Mode }
  | { type: 'SET_EMAIL'; email: string }
  | { type: 'SET_OTP'; otp: string }
  | { type: 'SET_NICKNAME'; nickname: string }
  | { type: 'SET_PASSWORD'; password: string }
  | { type: 'SET_PASSWORD_CONFIRM'; passwordConfirm: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'GO':
      return { ...state, mode: action.to };
    case 'SET_EMAIL':
      return { ...state, form: { ...state.form, email: action.email } };
    case 'SET_OTP':
      return { ...state, form: { ...state.form, otp: action.otp } };
    case 'SET_NICKNAME':
      return { ...state, form: { ...state.form, nickname: action.nickname } };
    case 'SET_PASSWORD':
      return { ...state, form: { ...state.form, password: action.password } };
    case 'SET_PASSWORD_CONFIRM':
      return { ...state, form: { ...state.form, passwordConfirm: action.passwordConfirm } };
    default:
      return state;
  }
}

// ---------------------------------------------
// Wrapper 본체
// ---------------------------------------------
const AuthModalWrapper: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [state, dispatch] = useReducer(reducer, {
    mode: 'login',
    form: { email: '', otp: '', nickname: '', password: '', passwordConfirm: '' },
  });

  // -------------------------------
  // 1) 로그인 뷰
  // -------------------------------
  if (state.mode === 'login') {
    return (
      <LoginOrganism
        className={className}
        // ⛳️ LoginOrganism 에서 이 핸들러를 SignUpPrompt 로 전달해줘
        onSignUpClick={() => dispatch({ type: 'GO', to: 'signup_email' })}
      />
    );
  }

  // -------------------------------
  // 2) 회원가입: 이메일 입력 단계
  // -------------------------------
  if (state.mode === 'signup_email') {
    return (
      <AuthenticationCard className={className}>
        <div className="flex flex-col items-center">
          <div className="w-full">
            <AuthenticationLabel type="signup" />
          </div>

          <div className="mt-8 w-[320px]">
            <AuthenticationInputBox
              placeholder="이메일을 입력하세요"
              value={state.form.email}
              onChange={(e) => dispatch({ type: 'SET_EMAIL', email: e.target.value })}
            />
          </div>

          <div className="mt-4 w-[320px]">
            <SubmitButton
              onClick={() => dispatch({ type: 'GO', to: 'signup_otp' })}
            >
              인증 메일 보내기
            </SubmitButton>
          </div>
        </div>
      </AuthenticationCard>
    );
  }

  // -------------------------------
  // 3) 회원가입: OTP 입력 단계 (UI 껍데기)
  // -------------------------------
  if (state.mode === 'signup_otp') {
    return (
      <AuthenticationCard className={className}>
        <div className="flex flex-col items-center">
          <div className="w-full">
            <AuthenticationLabel type="signup" />
          </div>

          <div className="mt-8 w-[320px]">
            <SignUpLabel>이메일</SignUpLabel>
            <SignUpBody>{state.form.email || '-'}</SignUpBody>
          </div>

          <div className="mt-6 w-[320px]">
            <SignUpLabel>인증번호</SignUpLabel>
            <div className="mt-2">
              {/* UI만: 6칸, gap 5px */}
              <OtpGroup length={6} />
            </div>
          </div>

          <div className="mt-6 w-[320px]">
            <SubmitButton onClick={() => dispatch({ type: 'GO', to: 'signup_nickname' })}>
              인증완료(04:59)
            </SubmitButton>
          </div>
        </div>
      </AuthenticationCard>
    );
  }

  // -------------------------------
  // 4) 회원가입: 닉네임 입력 단계
  // -------------------------------
  if (state.mode === 'signup_nickname') {
    return (
      <AuthenticationCard className={className}>
        <div className="flex flex-col items-center">
          <div className="w-full">
            <AuthenticationLabel type="signup" />
          </div>

          <div className="mt-8 w-[320px]">
            <LabeledStaticField label="이메일" value={state.form.email || '-'} />
          </div>

          <div className="mt-6 w-[320px]">
            <SignUpLabel>닉네임</SignUpLabel>
            <AuthenticationInputBox
              placeholder="닉네임을 입력하세요"
              value={state.form.nickname}
              onChange={(e) => dispatch({ type: 'SET_NICKNAME', nickname: e.target.value })}
            />
          </div>

          <div className="mt-6 w-[320px]">
            <SubmitButton onClick={() => dispatch({ type: 'GO', to: 'signup_password' })}>
              중복확인
            </SubmitButton>
          </div>
        </div>
      </AuthenticationCard>
    );
  }

  // -------------------------------
  // 5) 회원가입: 비밀번호 입력 단계
  // -------------------------------
  if (state.mode === 'signup_password') {
    return (
      <AuthenticationCard className={className}>
        <div className="flex flex-col items-center">
          <div className="w-full">
            <AuthenticationLabel type="signup" />
          </div>

          <div className="mt-8 w-[320px] space-y-4">
            <LabeledStaticField label="이메일" value={state.form.email || '-'} />
            <LabeledStaticField label="닉네임" value={state.form.nickname || '-'} />
          </div>

          <div className="mt-6 w-[320px]">
            <SignUpLabel>비밀번호</SignUpLabel>
            <AuthenticationInputBox
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={state.form.password}
              onChange={(e) => dispatch({ type: 'SET_PASSWORD', password: e.target.value })}
            />
          </div>

          <div className="mt-6 w-[320px]">
            <SubmitButton onClick={() => dispatch({ type: 'GO', to: 'signup_password_confirm' })}>
              확인
            </SubmitButton>
          </div>
        </div>
      </AuthenticationCard>
    );
  }

  // -------------------------------
  // 6) 회원가입: 비밀번호 확인 단계 (이미지 예시 화면)
  // -------------------------------
  if (state.mode === 'signup_password_confirm') {
    return (
      <AuthenticationCard className={className}>
        <div className="flex flex-col items-start">
          <div className="w-full">
            <AuthenticationLabel type="signup" />
          </div>

          <div className="mt-6 w-[320px] space-y-2">
            <LabeledStaticField label="이메일" value={state.form.email || '-'} />
            <LabeledStaticField label="닉네임" value={state.form.nickname || '-'} />
            <LabeledStaticField label="비밀번호" value="확인 중" />
          </div>

          <div className="mt-6 w-[320px]">
            <SignUpLabel>비밀번호 확인</SignUpLabel>
            <AuthenticationInputBox
              type="password"
              placeholder="비밀번호를 한 번 더 입력하세요"
              value={state.form.passwordConfirm}
              onChange={(e) =>
                dispatch({ type: 'SET_PASSWORD_CONFIRM', passwordConfirm: e.target.value })
              }
            />
          </div>

          <div className="mt-6 w-[320px]">
            <SubmitButton onClick={() => dispatch({ type: 'GO', to: 'signup_done' })}>
              확인
            </SubmitButton>
          </div>
        </div>
      </AuthenticationCard>
    );
  }

  // -------------------------------
  // 7) 회원가입 완료 단계 (간단 UI)
  // -------------------------------
  return (
    <AuthenticationCard className={className}>
      <div className="flex flex-col items-center">
        <div className="w-full">
          <AuthenticationLabel type="signup" />
        </div>

        <div className="mt-10 text-center">
          <p className="text-[20px] font-semibold">
            {state.form.nickname || '회원'}님,
          </p>
          <p className="mt-1 text-[16px] text-neutral-700">가입이 완료되었습니다!</p>
        </div>

        <div className="mt-8 w-[320px]">
          <SubmitButton onClick={() => dispatch({ type: 'GO', to: 'login' })}>
            바로 시작
          </SubmitButton>
        </div>
      </div>
    </AuthenticationCard>
  );
};

export default AuthModalWrapper;
