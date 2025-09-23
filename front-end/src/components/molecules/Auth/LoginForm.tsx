'use client';

import React, { useState } from 'react';
import InputBox from '../../atoms/Auth/InputBox/InputBox';
import SubmitButton from '../../atoms/Auth/Button/Submit';
import { API_ENDPOINTS } from '@/config/api';

interface LoginFormProps {
  className?: string;
  onClose?: () => void;  // 모달 닫기 콜백
  onLoginSuccess?: () => void;  // 로그인 성공 콜백
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  className = "",
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // 입력 시 에러 메시지 리셋
    if (loginError) {
      setLoginError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // 입력 시 에러 메시지 리셋
    if (loginError) {
      setLoginError('');
    }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isFormValid && !isLoggingIn) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || isLoggingIn) return;

    setIsLoggingIn(true);
    setLoginError('');

    try {

      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });


      if (response.ok) {
        // 로그인 성공
        const responseData = await response.json();

        // isSuccess가 false인 경우 에러 처리
        if (responseData.isSuccess === false) {
          const errorMessage = responseData.message || '로그인에 실패했습니다.';
          setLoginError(errorMessage);
          return;
        }

        // JWT 토큰 저장
        console.log('🔐 [LoginForm] 로그인 응답 데이터:', responseData);
        console.log('🔐 [LoginForm] 응답 헤더 Authorization:', response.headers.get('Authorization'));
        
        const authToken = response.headers.get('Authorization') || 
                         responseData.token || 
                         responseData.accessToken ||
                         responseData.result?.accessToken ||
                         responseData.result?.token;
        
        console.log('🔐 [LoginForm] 추출된 토큰:', authToken);
        console.log('🔐 [LoginForm] 토큰 저장 성공:', !!authToken);
        
        if (authToken) {
          localStorage.setItem('authToken', authToken);
          console.log('✅ [LoginForm] 토큰이 localStorage에 저장됨');
        } else {
          console.error('❌ [LoginForm] 토큰을 찾을 수 없음');
        }

        // 로그인 성공 - 모달 닫기 및 로그인 성공 콜백 호출
        onClose?.();
        onLoginSuccess?.();
      } else {
        // 로그인 실패
        const errorData = await response.json().catch(() => null);
        
        // API에서 제공하는 message 사용, 없으면 기본 메시지
        const errorMessage = errorData?.message || '이메일 혹은 패스워드가 틀렸습니다.';
        setLoginError(errorMessage);
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      setLoginError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  return (
    <div className={`flex flex-col items-center gap-[10px] ${className}`}>
      <InputBox
        placeholder="이메일을 입력하세요"
        value={email}
        onChange={handleEmailChange}
        type="email"
        className={
          loginError
            ? '!border-red-500 focus:!border-red-500'
            : ''
        }
      />
      
      <InputBox
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChange={handlePasswordChange}
        onKeyDown={handlePasswordKeyDown}
        type="password"
        className={
          loginError
            ? '!border-red-500 focus:!border-red-500'
            : ''
        }
      />

      {/* 에러 메시지 */}
      {loginError && (
        <div className="w-full">
          <p className="text-sm font-normal text-red-500">
            {loginError}
          </p>
        </div>
      )}
      
      <SubmitButton
        onClick={handleSubmit}
        disabled={!isFormValid || isLoggingIn}
        className={
          !isFormValid || isLoggingIn
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'cursor-pointer'
        }
      >
        {isLoggingIn ? '로그인 중...' : '로그인'}
      </SubmitButton>
    </div>
  );
};

export default LoginForm;