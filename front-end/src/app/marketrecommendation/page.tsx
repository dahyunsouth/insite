'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MarketRecommendation from '@/components/templates/MarketRecommendation/MarketRecommendation';

export default function MarketRecommendationPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/');
  };

  return <MarketRecommendation onClose={handleClose} />;
}
