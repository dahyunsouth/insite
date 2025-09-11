'use client';

import React, { useState, useEffect } from 'react';
import MyProfileInfo from '@/components/molecules/MyPage/MyProfileInfo';
import BtnBack from '@/components/atoms/Common/Button/BtnBack';
import SignUpLabel from '@/components/atoms/Auth/Label/SignUp';
import AuthenticationInputBox from '@/components/atoms/Auth/InputBox/InputBox';
import SubmitButton from '@/components/atoms/Auth/Button/Submit';
import { API_ENDPOINTS } from '@/config/api';
import { authManager } from '@/utils/auth';

interface MyInfoUpdateProps {
  onBack?: () => void;
  onInfoUpdateSuccess?: (message: string) => void;
  className?: string;
}

const MyInfoUpdate: React.FC<MyInfoUpdateProps> = ({
  onBack,
  onInfoUpdateSuccess,
  className = ''
}) => {
  // 프로필 사진 옵션
  const profileOptions = [
    { id: 'cat', name: 'cat', image: '/profilepics/profile_cat.png' },
    { id: 'dog', name: 'dog', image: '/profilepics/profile_dog.png' },
    { id: 'fox', name: 'fox', image: '/profilepics/profile_fox.png' },
    { id: 'panda', name: 'panda', image: '/profilepics/profile_panda.png' },
    { id: 'chick', name: 'chick', image: '/profilepics/profile_chick.png' },
    { id: 'rabbit', name: 'rabbit', image: '/profilepics/profile_rabbit.png' }
  ];

  // 상태 관리
  const [userInfo, setUserInfo] = useState<{
    nickname: string | null;
    profile: string | null;
    isLoading: boolean;
  }>({ nickname: null, profile: null, isLoading: true });

  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [nickname, setNickname] = useState('');
  const [originalNickname, setOriginalNickname] = useState('');
  const [originalProfile, setOriginalProfile] = useState('');

  // 닉네임 중복확인 상태
  const [nicknameDuplicateCheck, setNicknameDuplicateCheck] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({ isChecking: false, isAvailable: null, message: '' });

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const response = await authManager.authenticatedRequest(API_ENDPOINTS.USER_INFO, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        const userNickname = data.result?.nickname || data.nickname || '';
        const userProfile = data.result?.profile || data.profile || '';
        
        setUserInfo({ 
          nickname: userNickname, 
          profile: userProfile, 
          isLoading: false 
        });
        
        setNickname(userNickname);
        setOriginalNickname(userNickname);
        setSelectedProfile(userProfile);
        setOriginalProfile(userProfile);
      } else {
        console.error('사용자 정보 가져오기 실패:', response.status);
        setUserInfo({ nickname: null, profile: null, isLoading: false });
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 에러:', error);
      setUserInfo({ nickname: null, profile: null, isLoading: false });
    }
  };

  // 닉네임 중복확인 API 호출
  const checkNicknameDuplicate = async () => {
    if (!nickname.trim()) {
      setNicknameDuplicateCheck({ 
        isChecking: false, 
        isAvailable: false, 
        message: '닉네임을 입력해주세요' 
      });
      return;
    }

    setNicknameDuplicateCheck({ isChecking: true, isAvailable: null, message: '' });

    try {
      const response = await fetch(`${API_ENDPOINTS.NICKNAME_CHECK}?nickname=${encodeURIComponent(nickname)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNicknameDuplicateCheck({ 
          isChecking: false, 
          isAvailable: true, 
          message: '사용 가능한 닉네임입니다.' 
        });
      } else {
        const errorData = await response.json().catch(() => null);
        setNicknameDuplicateCheck({ 
          isChecking: false, 
          isAvailable: false, 
          message: errorData?.message || '닉네임 확인 중 오류가 발생했습니다.' 
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

  // 정보 변경 API 호출
  const handleInfoUpdate = async () => {
    try {
      const requestBody = {
        password: '', // 비밀번호는 변경하지 않음
        nickname: nickname,
        profile: selectedProfile
      };

      console.log('정보 변경 요청 데이터:', requestBody);

      const response = await authManager.authenticatedRequest(API_ENDPOINTS.USER_UPDATE, {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        console.log('정보 변경 성공');
        onInfoUpdateSuccess?.('정상적으로 내 정보가 수정되었습니다.');
        onBack?.();
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('정보 변경 실패:', errorData);
        alert(`정보 변경에 실패했습니다: ${errorData?.message || '다시 시도해주세요.'}`);
      }
    } catch (error) {
      console.error('정보 변경 에러:', error);
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 변경 가능 여부 확인
  const isChanged = nickname !== originalNickname || selectedProfile !== originalProfile;
  const canSubmit = isChanged && (nicknameDuplicateCheck.isAvailable === true || nickname === originalNickname);

  return (
    <div className={`p-4 bg-white h-screen ${className}`}>
      <div className="flex items-center justify-start gap-2">
        <BtnBack onClick={onBack} />
        <h1 className="text-lg font-semibold text-gray-900">내 정보 수정</h1>
      </div>
      <MyProfileInfo />
      
      {/* 프로필 사진 및 닉네임 수정 폼 */}
      <div className="px-4 mt-6 space-y-6">
        {/* 프로필 사진 선택 */}
        <div>
          <SignUpLabel>프로필 사진</SignUpLabel>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {profileOptions.map((option) => (
              <div
                key={option.id}
                className={`relative cursor-pointer rounded-full p-1 ${
                  selectedProfile === option.name ? 'ring-4 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedProfile(option.name)}
              >
                <img
                  src={option.image}
                  alt={option.name}
                  className="w-full h-auto rounded-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 닉네임 수정 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
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
          <div className="flex gap-2 w-full">
            <div className="w-2/3">
              <AuthenticationInputBox
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => {
                  setNickname(e.target.value);
                  // 닉네임이 변경되면 중복확인 상태 리셋
                  if (e.target.value !== originalNickname) {
                  setNicknameDuplicateCheck({ isChecking: false, isAvailable: null, message: '' });
                  }
              }}
              className={
                  nicknameDuplicateCheck.isAvailable === false
                  ? '!border-red-500 focus:!border-red-500'
                  : nicknameDuplicateCheck.isAvailable === true
                  ? '!border-[#3288FF] focus:!border-[#3288FF]'
                  : ''
              }
              />
            </div>
            <button
            onClick={checkNicknameDuplicate}
            disabled={nicknameDuplicateCheck.isChecking || !nickname.trim()}
            className="cursor-pointer w-1/3 px-4 py-3 bg-[#404040] text-white rounded-lg font-medium disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed whitespace-nowrap"
            >
            {nicknameDuplicateCheck.isChecking ? '확인 중...' : '중복확인'}
            </button>
          </div>
          
          {/* 닉네임 중복확인 메시지 */}
          {nicknameDuplicateCheck.message && (
            <div className="mt-2">
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
        </div>

        {/* 변경하기 버튼 */}
        <div className="w-full">
          <SubmitButton 
            className={`cursor-pointer w-full ${
              !canSubmit
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : ''
            }`}
            disabled={!canSubmit}
            onClick={handleInfoUpdate}
          >
            변경하기
          </SubmitButton>
        </div>
      </div>
    </div>
  );
};

export default MyInfoUpdate;
