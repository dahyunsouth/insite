// front-end/src/components/templates/Auth/AuthModalWrapper.tsx
'use client';

import React, { useReducer, useState, useEffect } from 'react';

// 로그인 모달 (내부에서 SignUpPrompt 렌더)
// ⛳️ LoginOrganism 에 onSignUpClick?: () => void; prop 을 추가해
// 내부 <SignUpPrompt onSignUpClick={props.onSignUpClick} />로 전달해줘.
import LoginOrganism from '@/components/organisms/Auth/Login';

// 재사용 아톰/몰큘
import AuthenticationCard from '@/components/atoms/Auth/Card/Authentication';
import AuthenticationLabel from '@/components/atoms/Auth/Heading/Authentication';
import SignUpLabel from '@/components/atoms/Auth/Label/SignUp';
import SignUpBody from '@/components/atoms/Auth/Text/SignUp';
import AuthenticationInputBox from '@/components/atoms/Auth/InputBox/InputBox';
import SubmitButton from '@/components/atoms/Auth/Button/Submit';
import LabeledStaticField from '@/components/molecules/Auth/LabeledStaticField';
import OtpGroup from '@/components/molecules/Auth/OtpGroup';

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

  // OTP 타이머 상태
  const [otpTimeLeft, setOtpTimeLeft] = useState(300); // 5분 = 300초
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  // 닉네임 중복확인 상태
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  // 이메일 유효성 검사 상태
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: '' });

  // OTP 타이머 useEffect
  useEffect(() => {
    if (state.mode === 'signup_otp' && otpTimeLeft > 0) {
      const timer = setInterval(() => {
        setOtpTimeLeft(prev => {
          if (prev <= 1) {
            setIsOtpExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state.mode, otpTimeLeft]);

  // 모드가 변경될 때 타이머 리셋
  useEffect(() => {
    if (state.mode === 'signup_otp') {
      setOtpTimeLeft(300);
      setIsOtpExpired(false);
    }
  }, [state.mode]);

  // 닉네임이 변경될 때 중복확인 상태 리셋
  useEffect(() => {
    if (state.mode === 'signup_nickname') {
      setIsNicknameChecked(false);
    }
  }, [state.form.nickname, state.mode]);

  // 시간을 분:초 형식으로 변환하는 함수
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 이메일 유효성 검사 함수
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 이메일 변경 핸들러
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    dispatch({ type: 'SET_EMAIL', email });

    if (email === '') {
      setEmailValidation({ isValid: null, message: '' });
    } else if (validateEmail(email)) {
      setEmailValidation({ isValid: true, message: '유효한 이메일 형식입니다.' });
    } else {
      setEmailValidation({ isValid: false, message: '유효한 이메일 형식이 아닙니다.' });
    }
  };

  // 이메일 입력창 엔터키 핸들러
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && emailValidation.isValid === true) {
      dispatch({ type: 'GO', to: 'signup_otp' });
    }
  };

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
        {/* 회원가입 헤더 */}
        <div className="w-full">
          <AuthenticationLabel 
            type="signup" 
            onBackClick={() => dispatch({ type: 'GO', to: 'login' })}
          />
        </div>
        
        <div>
          <div className="mt-8 w-[320px]">
            <SignUpLabel>이메일</SignUpLabel>
              <AuthenticationInputBox
                placeholder="이메일을 입력하세요"
                value={state.form.email}
                onChange={handleEmailChange}
                onKeyDown={handleEmailKeyDown}
                className={
                  emailValidation.isValid === true 
                    ? '!border-[#3288FF] focus:!border-[#3288FF]' 
                    : emailValidation.isValid === false 
                    ? '!border-red-500 focus:!border-red-500' 
                    : ''
                }
              />
          </div>

          {/* 이메일 유효성 검사 메시지 */}
          {emailValidation.message && (
            <div className="mt-2 w-[320px]">
              <p 
                className={`text-sm font-normal ${
                  emailValidation.isValid ? 'text-[#3288FF]' : 'text-red-500'
                }`}
              >
                {emailValidation.message}
              </p>
            </div>
          )}

          <div className="mt-4 w-[320px]">
            <SubmitButton
              className={`cursor-pointer ${
                emailValidation.isValid !== true 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : ''
              }`}
              disabled={emailValidation.isValid !== true}
              onClick={() => {
                if (emailValidation.isValid === true) {
                  dispatch({ type: 'GO', to: 'signup_otp' });
                }
              }}
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
        <div>
          <div className="w-full">
            <AuthenticationLabel 
              type="signup" 
              onBackClick={() => dispatch({ type: 'GO', to: 'signup_email' })}
            />
          </div>

          <div className="mt-8 w-[320px]">
            <SignUpLabel>이메일</SignUpLabel>
            <SignUpBody>{state.form.email || '-'}</SignUpBody>
          </div>
        </div>
        <div>
          <div className="mt-6 w-[320px]">
            <SignUpLabel>인증번호</SignUpLabel>
            <div className="mt-2">
              {/* UI만: 6칸, gap 5px */}
              <OtpGroup length={6} />
            </div>
          </div>

          <div className="mt-6 w-[320px]">
            <SubmitButton 
              className="cursor-pointer"
              onClick={() => {
                if (isOtpExpired) {
                  // 재발송 로직 (타이머 리셋)
                  setOtpTimeLeft(300);
                  setIsOtpExpired(false);
                } else {
                  // 인증 완료 로직
                  dispatch({ type: 'GO', to: 'signup_nickname' });
                }
              }}
            >
              {isOtpExpired ? '인증번호 재발송하기' : `인증하기(${formatTime(otpTimeLeft)})`}
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
        <div>
          <div className="w-full">
            <AuthenticationLabel 
              type="signup" 
              onBackClick={() => dispatch({ type: 'GO', to: 'signup_otp' })}
            />
          </div>

          <div className="mt-8 w-[320px]">
            <LabeledStaticField label="이메일" value={state.form.email || '-'} />
          </div>
        </div>
        <div>
          <div className="mt-6 w-[320px]">
            <SignUpLabel>닉네임</SignUpLabel>
            <AuthenticationInputBox
              placeholder="닉네임을 입력하세요"
              value={state.form.nickname}
              onChange={(e) => dispatch({ type: 'SET_NICKNAME', nickname: e.target.value })}
            />
          </div>

          <div className="mt-6 w-[320px]">
            <SubmitButton 
              className="cursor-pointer"
              onClick={() => {
                if (isNicknameChecked) {
                  // 사용하기 버튼 클릭 시 다음 단계로
                  dispatch({ type: 'GO', to: 'signup_password' });
                } else {
                  // 중복확인 버튼 클릭 시
                  setIsNicknameChecked(true);
                }
              }}
            >
              {isNicknameChecked ? '사용하기' : '중복확인'}
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
        <div>
          <div className="w-full">
            <AuthenticationLabel 
              type="signup" 
              onBackClick={() => dispatch({ type: 'GO', to: 'signup_nickname' })}
            />
          </div>

          <div className="mt-8 w-[320px] space-y-4">
            <LabeledStaticField label="이메일" value={state.form.email || '-'} />
            <LabeledStaticField label="닉네임" value={state.form.nickname || '-'} />
          </div>
        </div>
        <div>
          <div className="w-[320px]">
            <SignUpLabel>비밀번호</SignUpLabel>
            <AuthenticationInputBox
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={state.form.password}
              onChange={(e) => dispatch({ type: 'SET_PASSWORD', password: e.target.value })}
            />
          </div>

          <div className="mt-6 w-[320px]">
            <SubmitButton 
              className="cursor-pointer"
              onClick={() => dispatch({ type: 'GO', to: 'signup_password_confirm' })}
            >
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
        <div>
          <div className="w-full">
            <AuthenticationLabel 
              type="signup" 
              onBackClick={() => dispatch({ type: 'GO', to: 'signup_password' })}
            />
          </div>

          <div className="mt-6 w-[320px] space-y-2">
            <LabeledStaticField label="이메일" value={state.form.email || '-'} />
            <LabeledStaticField label="닉네임" value={state.form.nickname || '-'} />
            <LabeledStaticField label="비밀번호" value="확인 중" />
          </div>
        </div>
        <div>
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
            <SubmitButton 
              className="cursor-pointer"
              onClick={() => dispatch({ type: 'GO', to: 'signup_done' })}
            >
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
        <SubmitButton 
          className="cursor-pointer"
          onClick={() => dispatch({ type: 'GO', to: 'login' })}
        >
          바로 시작
        </SubmitButton>
      </div>
    </AuthenticationCard>
  );
};

export default AuthModalWrapper;
