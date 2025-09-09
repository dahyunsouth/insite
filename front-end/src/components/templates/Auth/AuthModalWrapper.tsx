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
  const [otpTimeLeft, setOtpTimeLeft] = useState(180); // 3분 = 180초
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  // 닉네임 중복확인 상태
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  // 이메일 유효성 검사 상태
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean | null;
    message: string;
  }>({ isValid: null, message: '' });

  // 이메일 중복확인 상태
  const [emailDuplicateCheck, setEmailDuplicateCheck] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({ isChecking: false, isAvailable: null, message: '' });

  // 이메일 인증코드 발송 상태
  const [emailSendStatus, setEmailSendStatus] = useState<{
    isSending: boolean;
    isSuccess: boolean | null;
    message: string;
  }>({ isSending: false, isSuccess: null, message: '' });

  // OTP 인증 상태
  const [otpVerificationStatus, setOtpVerificationStatus] = useState<{
    isVerifying: boolean;
    isSuccess: boolean | null;
    message: string;
  }>({ isVerifying: false, isSuccess: null, message: '' });

  // 닉네임 중복확인 상태
  const [nicknameDuplicateCheck, setNicknameDuplicateCheck] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({ isChecking: false, isAvailable: null, message: '' });

  // OTP 타이머 useEffect
  useEffect(() => {
    if (state.mode === 'signup_otp' && otpTimeLeft > 0) {
      const timer = setInterval(() => {
        setOtpTimeLeft(prev => {
          if (prev <= 1) {
            setIsOtpExpired(true);
            // 시간 초과 시 인증 실패 상태로 설정
            setOtpVerificationStatus({ 
              isVerifying: false, 
              isSuccess: false, 
              message: '입력 시간을 초과하였습니다. 재발송해주세요.' 
            });
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
      setOtpTimeLeft(180);
      setIsOtpExpired(false);
      setOtpVerificationStatus({ isVerifying: false, isSuccess: null, message: '' });
    }
  }, [state.mode]);

  // 닉네임이 변경될 때 중복확인 상태 리셋
  useEffect(() => {
    if (state.mode === 'signup_nickname') {
      setIsNicknameChecked(false);
      setNicknameDuplicateCheck({ isChecking: false, isAvailable: null, message: '' });
    }
  }, [state.form.nickname, state.mode]);

  // 닉네임 변경 핸들러
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nickname = e.target.value;
    dispatch({ type: 'SET_NICKNAME', nickname });

    // 닉네임 중복확인 상태 리셋
    setNicknameDuplicateCheck({ isChecking: false, isAvailable: null, message: '' });

    // 닉네임이 비어있으면 유효성 검사 메시지 표시
    if (!nickname.trim()) {
      setNicknameDuplicateCheck({ 
        isChecking: false, 
        isAvailable: false, 
        message: '닉네임을 입력해주세요' 
      });
    } else {
      // 닉네임이 입력되면 자동으로 중복확인 실행
      checkNicknameDuplicate(nickname);
    }
  };

  // 모드가 변경될 때 이메일 중복확인 및 발송 상태 리셋
  useEffect(() => {
    if (state.mode === 'signup_email') {
      setEmailDuplicateCheck({ isChecking: false, isAvailable: null, message: '' });
      setEmailSendStatus({ isSending: false, isSuccess: null, message: '' });
    }
  }, [state.mode]);

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

  // 이메일 중복확인 API 호출 함수
  const checkEmailDuplicate = async (email: string) => {
    if (!validateEmail(email)) return;

    setEmailDuplicateCheck({ isChecking: true, isAvailable: null, message: '' });

    try {
      const response = await fetch(`http://43.203.196.29:8080/api/v1/auth/check/email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // 이메일 사용 가능 (200 OK)
        setEmailDuplicateCheck({ 
          isChecking: false, 
          isAvailable: true, 
          message: '사용 가능한 이메일입니다.' 
        });
      } else if (response.status === 400) {
        // 이메일 중복 (400 Bad Request)
        setEmailDuplicateCheck({ 
          isChecking: false, 
          isAvailable: false, 
          message: '이미 사용 중인 이메일입니다. 다시 입력하세요.' 
        });
      } else {
        // 기타 에러
        setEmailDuplicateCheck({ 
          isChecking: false, 
          isAvailable: null, 
          message: '이메일 확인 중 오류가 발생했습니다.' 
        });
      }
    } catch (error) {
      console.error('이메일 중복확인 에러:', error);
      setEmailDuplicateCheck({ 
        isChecking: false, 
        isAvailable: null, 
        message: '네트워크 오류가 발생했습니다.' 
      });
    }
  };

  // 이메일 인증코드 발송 API 호출 함수
  const sendVerificationCode = async (email: string) => {
    setEmailSendStatus({ isSending: true, isSuccess: null, message: '' });

    try {
      const response = await fetch('http://43.203.196.29:8080/api/v1/auth/verify/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // 이메일 발송 성공 (200 OK)
        setEmailSendStatus({ 
          isSending: false, 
          isSuccess: true, 
          message: '인증코드가 발송되었습니다.' 
        });
        // 다음 단계로 이동
        dispatch({ type: 'GO', to: 'signup_otp' });
      } else {
        // 이메일 발송 실패
        setEmailSendStatus({ 
          isSending: false, 
          isSuccess: false, 
          message: '사용할 수 없는 이메일입니다. 다시 확인해주세요.' 
        });
      }
    } catch (error) {
      console.error('이메일 인증코드 발송 에러:', error);
      setEmailSendStatus({ 
        isSending: false, 
        isSuccess: false, 
        message: '사용할 수 없는 이메일입니다. 다시 확인해주세요.' 
      });
    }
  };

  // OTP 인증번호 검증 API 호출 함수
  const verifyOtpCode = async (email: string, code: string) => {
    setOtpVerificationStatus({ isVerifying: true, isSuccess: null, message: '' });

    try {
      const response = await fetch('http://43.203.196.29:8080/api/v1/auth/verify/check-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (response.ok) {
        // 인증 성공 (200 OK)
        setOtpVerificationStatus({ 
          isVerifying: false, 
          isSuccess: true, 
          message: '인증이 완료되었습니다.' 
        });
        // 다음 단계로 이동
        dispatch({ type: 'GO', to: 'signup_nickname' });
      } else {
        // 인증 실패
        setOtpVerificationStatus({ 
          isVerifying: false, 
          isSuccess: false, 
          message: '인증에 실패하였습니다. 인증번호를 다시 확인해주세요.' 
        });
      }
    } catch (error) {
      console.error('OTP 인증 에러:', error);
      setOtpVerificationStatus({ 
        isVerifying: false, 
        isSuccess: false, 
        message: '인증에 실패하였습니다. 인증번호를 다시 확인해주세요.' 
      });
    }
  };

  // 닉네임 중복확인 API 호출 함수
  const checkNicknameDuplicate = async (nickname: string) => {
    if (!nickname.trim()) return;

    setNicknameDuplicateCheck({ isChecking: true, isAvailable: null, message: '' });

    try {
      const response = await fetch(`http://43.203.196.29:8080/api/v1/auth/check/nickname?nickname=${encodeURIComponent(nickname)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // 닉네임 사용 가능 (200 OK)
        setNicknameDuplicateCheck({ 
          isChecking: false, 
          isAvailable: true, 
          message: '사용 가능한 닉네임입니다.' 
        });
      } else if (response.status === 400) {
        // 닉네임 중복 (400 Bad Request)
        setNicknameDuplicateCheck({ 
          isChecking: false, 
          isAvailable: false, 
          message: '사용 중인 닉네임입니다. 다시 입력해주세요.' 
        });
      } else {
        // 기타 에러
        setNicknameDuplicateCheck({ 
          isChecking: false, 
          isAvailable: null, 
          message: '닉네임 확인 중 오류가 발생했습니다.' 
        });
      }
    } catch (error) {
      console.error('닉네임 중복확인 에러:', error);
      setNicknameDuplicateCheck({ 
        isChecking: false, 
        isAvailable: null, 
        message: '네트워크 오류가 발생했습니다.' 
      });
    }
  };

  // 이메일 변경 핸들러
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    dispatch({ type: 'SET_EMAIL', email });

    // 이메일 중복확인 및 발송 상태 리셋
    setEmailDuplicateCheck({ isChecking: false, isAvailable: null, message: '' });
    setEmailSendStatus({ isSending: false, isSuccess: null, message: '' });

    if (email === '') {
      setEmailValidation({ isValid: null, message: '' });
    } else if (validateEmail(email)) {
      setEmailValidation({ isValid: true, message: '유효한 이메일 형식입니다.' });
      // 유효한 이메일이면 자동으로 중복확인 실행
      checkEmailDuplicate(email);
    } else {
      setEmailValidation({ isValid: false, message: '유효한 이메일 형식이 아닙니다.' });
    }
  };

  // 이메일 입력창 엔터키 핸들러
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && emailValidation.isValid === true && emailDuplicateCheck.isAvailable === true) {
      sendVerificationCode(state.form.email);
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
            <div className="flex items-center gap-2">
              <SignUpLabel>이메일</SignUpLabel>
              {emailDuplicateCheck.isChecking && (
                <div className="w-4 h-4 border-2 border-[#3288FF] border-t-transparent rounded-full animate-spin"></div>
              )}
              {emailSendStatus.isSending && (
                <div className="w-4 h-4 border-2 border-[#3288FF] border-t-transparent rounded-full animate-spin"></div>
              )}
              {emailDuplicateCheck.isAvailable === true && emailSendStatus.isSuccess !== false && (
                <img src="/badges/Available.svg" alt="사용 가능" className="w-[104px] h-[30px]" />
              )}
              {(emailDuplicateCheck.isAvailable === false || emailSendStatus.isSuccess === false) && (
                <img src="/badges/Unavailable.svg" alt="사용 불가" className="w-[104px] h-[30px]" />
              )}
            </div>
              <AuthenticationInputBox
                placeholder="이메일을 입력하세요"
                value={state.form.email}
                onChange={handleEmailChange}
                onKeyDown={handleEmailKeyDown}
                className={
                  emailSendStatus.isSuccess === false || emailDuplicateCheck.isAvailable === false
                    ? '!border-red-500 focus:!border-red-500'
                    : emailDuplicateCheck.isAvailable === true && emailSendStatus.isSuccess !== false
                    ? '!border-[#3288FF] focus:!border-[#3288FF]'
                    : emailValidation.isValid === true 
                    ? '!border-[#3288FF] focus:!border-[#3288FF]' 
                    : emailValidation.isValid === false 
                    ? '!border-red-500 focus:!border-red-500' 
                    : ''
                }
              />
          </div>

          {/* 이메일 유효성 검사, 중복확인 및 발송 메시지 */}
          {(emailValidation.message || emailDuplicateCheck.message || emailSendStatus.message) && (
            <div className="mt-2 w-[320px]">
              <p 
                className={`text-sm font-normal ${
                  emailSendStatus.isSuccess === false || emailDuplicateCheck.isAvailable === false
                    ? 'text-red-500'
                    : emailDuplicateCheck.isAvailable === true && emailSendStatus.isSuccess !== false
                    ? 'text-[#3288FF]'
                    : emailValidation.isValid 
                    ? 'text-[#3288FF]' 
                    : 'text-red-500'
                }`}
              >
                {emailSendStatus.message || emailDuplicateCheck.message || emailValidation.message}
              </p>
            </div>
          )}

          <div className="mt-4 w-[320px]">
            <SubmitButton
              className={`cursor-pointer ${
                emailValidation.isValid !== true || emailDuplicateCheck.isAvailable !== true || emailDuplicateCheck.isChecking || emailSendStatus.isSending
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : ''
              }`}
              disabled={emailValidation.isValid !== true || emailDuplicateCheck.isAvailable !== true || emailDuplicateCheck.isChecking || emailSendStatus.isSending}
              onClick={() => {
                if (emailValidation.isValid === true && emailDuplicateCheck.isAvailable === true) {
                  sendVerificationCode(state.form.email);
                }
              }}
            >
              {emailDuplicateCheck.isChecking ? '확인 중...' : emailSendStatus.isSending ? '발송 중...' : '인증 메일 보내기'}
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
            <div className="flex items-center gap-2">
              <SignUpLabel>인증번호</SignUpLabel>
              {otpVerificationStatus.isVerifying && (
                <div className="w-4 h-4 border-2 border-[#3288FF] border-t-transparent rounded-full animate-spin"></div>
              )}
              {otpVerificationStatus.isSuccess === false && (
                <img src="/badges/AuthenticationFailure.svg" alt="인증 실패" className="w-[104px] h-[30px]" />
              )}
            </div>
            <div className="mt-2">
              <OtpGroup 
                length={6} 
                onComplete={(otp) => {
                  // 6자리 입력 완료 시 자동으로 인증 시도
                  if (!isOtpExpired) {
                    verifyOtpCode(state.form.email, otp);
                  }
                }}
                className={
                  otpVerificationStatus.isSuccess === false
                    ? '[&_input]:!border-red-500 [&_input]:focus:!border-red-500'
                    : ''
                }
              />
            </div>
          </div>

          {/* 인증 상태 메시지 */}
          {otpVerificationStatus.message && (
            <div className="mt-2 w-[320px]">
              <p className="text-sm font-normal text-red-500">
                {otpVerificationStatus.message}
              </p>
            </div>
          )}

          <div className="mt-6 w-[320px]">
            <SubmitButton 
              className={`cursor-pointer ${
                otpVerificationStatus.isVerifying
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : ''
              }`}
              disabled={otpVerificationStatus.isVerifying}
              onClick={() => {
                if (isOtpExpired) {
                  // 재발송 로직 (타이머 리셋 및 상태 초기화)
                  setOtpTimeLeft(180);
                  setIsOtpExpired(false);
                  setOtpVerificationStatus({ isVerifying: false, isSuccess: null, message: '' });
                  // 재발송 API 호출
                  sendVerificationCode(state.form.email);
                }
              }}
            >
              {otpVerificationStatus.isVerifying 
                ? '인증 중...' 
                : isOtpExpired 
                ? '인증번호 재발송하기' 
                : `인증하기(${formatTime(otpTimeLeft)})`
              }
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
            <div className="flex items-center gap-2">
              <SignUpLabel>닉네임</SignUpLabel>
              {nicknameDuplicateCheck.isChecking && (
                <div className="w-4 h-4 border-2 border-[#3288FF] border-t-transparent rounded-full animate-spin"></div>
              )}
              {nicknameDuplicateCheck.isAvailable === true && (
                <img src="/badges/Available.svg" alt="사용 가능" className="w-[104px] h-[30px]" />
              )}
              {nicknameDuplicateCheck.isAvailable === false && (
                <img src="/badges/Unavailable.svg" alt="사용 불가" className="w-[104px] h-[30px]" />
              )}
            </div>
            <AuthenticationInputBox
              placeholder="닉네임을 입력하세요"
              value={state.form.nickname}
              onChange={handleNicknameChange}
              className={
                nicknameDuplicateCheck.isAvailable === false
                  ? '!border-red-500 focus:!border-red-500'
                  : nicknameDuplicateCheck.isAvailable === true
                  ? '!border-[#3288FF] focus:!border-[#3288FF]'
                  : ''
              }
            />
          </div>

          {/* 닉네임 중복확인 메시지 */}
          {nicknameDuplicateCheck.message && (
            <div className="mt-2 w-[320px]">
              <p 
                className={`text-sm font-normal ${
                  nicknameDuplicateCheck.isAvailable === false
                    ? 'text-red-500'
                    : nicknameDuplicateCheck.isAvailable === true
                    ? 'text-[#3288FF]'
                    : 'text-gray-500'
                }`}
              >
                {nicknameDuplicateCheck.message}
              </p>
            </div>
          )}

          <div className="mt-6 w-[320px]">
            <SubmitButton 
              className={`cursor-pointer ${
                nicknameDuplicateCheck.isAvailable !== true || nicknameDuplicateCheck.isChecking || !state.form.nickname.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : ''
              }`}
              disabled={nicknameDuplicateCheck.isAvailable !== true || nicknameDuplicateCheck.isChecking || !state.form.nickname.trim()}
              onClick={() => {
                if (nicknameDuplicateCheck.isAvailable === true && state.form.nickname.trim()) {
                  dispatch({ type: 'GO', to: 'signup_password' });
                }
              }}
            >
              {nicknameDuplicateCheck.isChecking ? '확인 중...' : '사용하기'}
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
