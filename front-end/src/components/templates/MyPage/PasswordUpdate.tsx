'use client';

import React, { useState, useEffect, useRef } from 'react';
import MyProfileInfo from '@/components/molecules/MyPage/MyProfileInfo';
import BtnBack from '@/components/atoms/Common/Button/BtnBack';
import SignUpLabel from '@/components/atoms/Auth/Label/SignUp';
import AuthenticationInputBox from '@/components/atoms/Auth/InputBox/InputBox';
import SubmitButton from '@/components/atoms/Auth/Button/Submit';
import { API_ENDPOINTS } from '@/config/api';
import { authManager } from '@/utils/auth';

interface PasswordUpdateProps {
  onBack?: () => void;
  onPasswordUpdateSuccess?: (message: string) => void;
  className?: string;
}

const PasswordUpdate: React.FC<PasswordUpdateProps> = ({
  onBack,
  onPasswordUpdateSuccess,
  className = ''
}) => {
  // 비밀번호 상태
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<{
    nickname: string | null;
    profile: string | null;
    isLoading: boolean;
  }>({ nickname: null, profile: null, isLoading: true });

  // 입력 필드 ref
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);


  // 비밀번호 유효성 및 강도 상태
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean | null;
    strength: 'weak' | 'medium' | 'strong' | null;
    message: string;
  }>({ isValid: null, strength: null, message: '' });

  // 비밀번호 확인 상태
  const [passwordConfirmValidation, setPasswordConfirmValidation] = useState<{
    isMatch: boolean | null;
    message: string;
  }>({ isMatch: null, message: '' });

  // 비밀번호 강도 측정 함수
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      return { strength: null, message: '' };
    }

    // 길이 검사
    if (password.length < 8 || password.length > 15) {
      return { 
        strength: null, 
        message: '최소 8자리 이상 15자리 이하 비밀번호를 입력하세요' 
      };
    }

    // 문자 종류 분석
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const charTypes = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    // 연속성 검사
    const hasSequential = /(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password);
    
    // 반복성 검사
    const hasRepeating = /(.)\1{2,}/.test(password);

    // 강도 판정
    if (charTypes === 1) {
      return { strength: 'weak', message: '위험' };
    }
    
    if (password.length >= 11 && charTypes >= 3 && !hasSequential && !hasRepeating) {
      return { strength: 'strong', message: '안전' };
    }
    
    if (charTypes >= 2 && !hasSequential && !hasRepeating) {
      return { strength: 'medium', message: '보통' };
    }
    
    return { strength: 'weak', message: '위험' };
  };

  // 새 비밀번호 변경 핸들러
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);

    // 비밀번호가 비어있으면 기본 상태로 리셋
    if (!password) {
      setPasswordValidation({ isValid: null, strength: null, message: '' });
      return;
    }

    const strengthResult = checkPasswordStrength(password);
    
    setPasswordValidation({
      isValid: password.length >= 8 && password.length <= 15,
      strength: strengthResult.strength,
      message: strengthResult.message
    });
  };

  // 비밀번호 확인 변경 핸들러
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const passwordConfirm = e.target.value;
    setConfirmPassword(passwordConfirm);

    if (passwordConfirm === '') {
      setPasswordConfirmValidation({ isMatch: null, message: '' });
    } else if (passwordConfirm === newPassword) {
      setPasswordConfirmValidation({ isMatch: true, message: '' });
    } else {
      setPasswordConfirmValidation({ 
        isMatch: false, 
        message: '' 
      });
    }
  };

  // 새 비밀번호 입력 필드 엔터키 핸들러
  const handleNewPasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && passwordValidation.isValid === true) {
      confirmPasswordRef.current?.focus();
    }
  };

  // 비밀번호 확인 입력 필드 엔터키 핸들러
  const handleConfirmPasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && passwordConfirmValidation.isMatch === true && passwordValidation.isValid === true) {
      handlePasswordUpdate();
    }
  };

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const response = await authManager.authenticatedRequest(API_ENDPOINTS.USER_INFO, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        const nickname = data.result?.nickname || data.nickname || null;
        const profile = data.result?.profile || data.profile || null;
        
        setUserInfo({ 
          nickname, 
          profile, 
          isLoading: false 
        });
      } else {
        console.error('사용자 정보 가져오기 실패:', response.status);
        setUserInfo({ nickname: null, profile: null, isLoading: false });
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 에러:', error);
      setUserInfo({ nickname: null, profile: null, isLoading: false });
    }
  };

  // 비밀번호 변경 API 호출
  const handlePasswordUpdate = async () => {
    try {
      // 현재 사용자 정보와 함께 비밀번호 변경 요청
      const requestBody = {
        password: newPassword,
        nickname: userInfo.nickname || '', // 현재 닉네임 유지
        profile: userInfo.profile || ''    // 현재 프로필 유지
      };

      console.log('비밀번호 변경 요청 데이터:', requestBody);

      const response = await authManager.authenticatedRequest(API_ENDPOINTS.USER_UPDATE, {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        console.log('비밀번호 변경 성공');
        // 성공 알림 콜백 호출
        onPasswordUpdateSuccess?.('정상적으로 비밀번호가 변경되었습니다.');
        
        // 즉시 이전 페이지로 이동
        onBack?.();
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('비밀번호 변경 실패:', errorData);
        alert(`비밀번호 변경에 실패했습니다: ${errorData?.message || '다시 시도해주세요.'}`);
      }
    } catch (error) {
      console.error('비밀번호 변경 에러:', error);
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
        // 로그인 페이지로 리다이렉트하거나 로그아웃 처리
      } else {
        alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <div className={`p-4 bg-white h-screen ${className}`}>
      <div className="flex items-center justify-start gap-2">
        <BtnBack onClick={onBack} />
        <h1 className="text-lg font-semibold text-gray-900">비밀번호 변경</h1>
      </div>
      <MyProfileInfo />
      
      {/* 비밀번호 변경 폼 */}
      <div className="px-4 rounded-lg">
        <div className="space-y-6">
          {/* 새 비밀번호 */}
          <div className="w-full max-w-[320px]">
            <div className="flex items-center gap-2">
              <SignUpLabel>새 비밀번호</SignUpLabel>
              <div className="ml-2 flex items-center gap-2">
                <div>
                  {passwordValidation.isValid === false && (
                    <img src="/badges/Unavailable.svg" alt="사용 불가" className="w-[104px] h-[30px]" />
                  )}
                  {passwordValidation.isValid && (
                    <img src="/badges/Available.svg" alt="사용 가능" className="w-[104px] h-[30px]" />
                  )}
                </div>
                <div>
                  {passwordValidation.strength === 'weak' && (
                    <img src="/badges/Weak.svg" alt="위험" className="w-auto h-[30px]" />
                  )}
                  {passwordValidation.strength === 'medium' && (
                    <img src="/badges/Medium.svg" alt="보통" className="w-auto h-[30px]" />
                  )}
                  {passwordValidation.strength === 'strong' && (
                    <img src="/badges/Strong.svg" alt="안전" className="w-auto h-[30px]" />
                  )}
                </div>
              </div>
            </div>
            <AuthenticationInputBox
              ref={newPasswordRef}
              type="password"
              placeholder="새 비밀번호를 입력하세요"
              value={newPassword}
              onChange={handleNewPasswordChange}
              onKeyDown={handleNewPasswordKeyDown}
              className={
                passwordValidation.isValid === false
                  ? '!border-red-500 focus:!border-red-500'
                  : passwordValidation.isValid === true
                  ? '!border-[#3288FF] focus:!border-[#3288FF]'
                  : ''
              }
            />
            
            {/* 비밀번호 길이 오류 메시지 */}
            {passwordValidation.isValid === false && passwordValidation.message && (
              <div className="mt-2">
                <p className="text-sm font-normal text-red-500">
                  {passwordValidation.message}
                </p>
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="w-full max-w-[320px]">
            <div className="flex items-center gap-2">
              <SignUpLabel>새 비밀번호 확인</SignUpLabel>
              {passwordConfirmValidation.isMatch === true && (
                <img src="/badges/Match.svg" alt="일치" className="w-[104px] h-[30px]" />
              )}
              {passwordConfirmValidation.isMatch === false && (
                <img src="/badges/Mismatch.svg" alt="불일치" className="w-[104px] h-[30px]" />
              )}
            </div>
            <AuthenticationInputBox
              ref={confirmPasswordRef}
              type="password"
              placeholder="새 비밀번호를 한 번 더 입력하세요"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onKeyDown={handleConfirmPasswordKeyDown}
              className={
                passwordConfirmValidation.isMatch === true
                  ? '!border-[#3288FF] focus:!border-[#3288FF]'
                  : passwordConfirmValidation.isMatch === false
                  ? '!border-red-500 focus:!border-red-500'
                  : ''
              }
            />
          </div>

          {/* 변경하기 버튼 */}
          <div className="w-full max-w-[320px]">
            <SubmitButton 
              className={`cursor-pointer ${
                passwordConfirmValidation.isMatch !== true || passwordValidation.isValid !== true
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : ''
              }`}
              disabled={passwordConfirmValidation.isMatch !== true || passwordValidation.isValid !== true}
              onClick={handlePasswordUpdate}
            >
              변경하기
            </SubmitButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordUpdate;
