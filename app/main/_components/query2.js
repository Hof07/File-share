'use client'
import React from 'react';
import styled from 'styled-components';

function Query2() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="mb-6 text-3xl md:text-4xl font-semibold">
        Special Offer:{' '}
        <strong className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent text-4xl md:text-5xl font-bold">
          Free Premium For Users!
        </strong>
      </h1>

      <p className="text-gray-700 text-lg leading-relaxed">
        We're excited to offer you an exclusive discount!  
        Simply use the promo code below during checkout to unlock special savings.  
        Whether you're upgrading to premium or purchasing add-ons, this is the perfect time to get more for less.  
        <br /><br />
        Hurry — this offer is only valid for a limited time, so don’t miss your chance to save and enhance your experience with our premium features.
        <br /><br />
        Start exploring all the benefits today and make the most of this exclusive deal.
      </p>

      <Card promoCode="AURA48512" />
    </div>
  );
}

const Card = ({ promoCode }) => {
  return (
    <StyledWrapper>
      <div className="card-container">
        <div className="logo">
          <svg viewBox="0 0 24 24" fill="white" className="icon">
            <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245Z" />
          </svg>
          <span className="text">{promoCode}</span>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card-container {
    width: 781px;
    height: 220px;
    margin: 0 auto;
    margin-top: 30px;
    border-radius: 16px;
    background: #111111;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 0 40px rgba(111, 0, 255, 0.3);
    background-image: radial-gradient(circle at 30% 30%, #6500ff33, transparent),
                      radial-gradient(circle at 70% 70%, #00ccff33, transparent);
    animation: pulseGlow 5s ease-in-out infinite;
  }

  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(111, 0, 255, 0.4),
                  0 0 40px rgba(0, 170, 255, 0.2);
    }
    50% {
      box-shadow: 0 0 60px rgba(255, 0, 180, 0.4),
                  0 0 30px rgba(0, 220, 255, 0.3);
    }
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 2rem;
    font-weight: bold;
    user-select: none;
  }

  .icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    filter: drop-shadow(0 0 4px #ffffffaa);
  }

  .text {
    font-size: 2.5rem;
    font-weight: bold;
    background: linear-gradient(to right, #ffffff, #00ffcc, #00ccff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

export default Query2;
