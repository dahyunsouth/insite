'use client';

import React, { useState } from 'react';
import InputBox from '../atoms/InputBox/InputBox';
import SubmitButton from '../atoms/Button/Submit';

interface LoginFormProps {
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  className = "" 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = () => {
    console.log('로그인 버튼 클릭됨', { email, password });
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  return (
    <div className={`flex flex-col items-center gap-[10px] ${className}`}>
      <InputBox
        placeholder="이메일을 입력하세요"
        value={email}
        onChange={handleEmailChange}
        type="email"
      />
      
      <InputBox
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChange={handlePasswordChange}
        type="password"
      />
      
      <SubmitButton
        onClick={handleSubmit}
        disabled={!isFormValid}
      >
        로그인
      </SubmitButton>
    </div>
  );
};

export default LoginForm;