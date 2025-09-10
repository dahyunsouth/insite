'use client';

import React from 'react';
import Image from 'next/image';

interface ProfilePicsProps {
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  alt?: string;
  disabled?: boolean;
}

const ProfilePics: React.FC<ProfilePicsProps> = ({
  size = 'lg',
  src = '/profilepics/profile_default.png',
  alt = '프로필 이미지',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const imageSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80
  };

  return (
    <div
      className={`shrink-0 relative overflow-hidden ${sizeClasses[size]} rounded-full mr-2`}
    >
      <Image
        src={src}
        alt={alt}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default ProfilePics;
