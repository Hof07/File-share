'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import Btn from './_components/btn'  // Capitalized default import

export default function Button() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/genrate-AI/AURA');
  };

  return (
    <div className="flex justify-center items-center relative top-[250px]">
      <button onClick={handleClick}>
        <Btn />
      </button>
    </div>
  );
}
