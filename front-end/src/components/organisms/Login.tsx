import React from 'react';
import AuthenticationCard from '../atoms/Card/Authentication';
import AuthenticationLabel from '../atoms/Label/Authentication';
import LoginForm from '../molecules/LoginForm';
import SocialLoginForm from '../molecules/SocialLogin';

interface LoginOrganismProps {
  className?: string;
}

const LoginOrganism: React.FC<LoginOrganismProps> = ({ 
  className = "" 
}) => {
  return (
    <AuthenticationCard className={className}>
      <div className="flex flex-col items-start">
        <AuthenticationLabel type="login" />
        
        <LoginForm />
        
        <SocialLoginForm />
      </div>
    </AuthenticationCard>
  );
};

export default LoginOrganism;