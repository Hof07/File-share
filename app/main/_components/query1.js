'use client'
import React from 'react';
import styled from 'styled-components';

function Query1() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="mb-6 text-3xl md:text-4xl font-semibold">
        Introducing New Feature:{' '}
        <strong className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent text-4xl md:text-5xl font-bold">
          Generative AI
        </strong>
      </h1>

      {/* <p className="text-gray-700 text-lg leading-relaxed mb-10"> */}
       <p className="text-gray-700 text-lg leading-relaxed">
        Generative AI is a groundbreaking technology that transforms the way machines create content by learning patterns from existing data. Unlike traditional AI models that focus on recognition and classification, generative models can produce new, original content such as text, images, music, and even videos. This capability opens up a vast range of applications across industries, including automated content creation, personalized marketing, and advanced creative tools for artists and designers.
        <br /><br />
        Powered by deep learning techniques, particularly generative adversarial networks (GANs) and transformers, Generative AI has made significant strides in recent years. These models are trained on massive datasets to understand complex data distributions and generate outputs that closely mimic human creativity. This innovation not only enhances productivity but also enables entirely new forms of interaction between humans and machines.
        <br /><br />
        As Generative AI continues to evolve, it promises to revolutionize fields such as healthcare, entertainment, education, and more by enabling smarter, faster, and more intuitive solutions. Integrating this technology into your products can drive innovation, improve user experiences, and unlock opportunities that were once considered impossible.
      </p>

      <Card />
    </div>
  );
}

const Card = () => {
  return (
    <StyledWrapper>
      <div className="card-container">
        <div className="logo">
          <svg viewBox="0 0 24 24" fill="white" className="icon">
            <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245Z" />
          </svg>
          <span className="text">AURA</span>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card-container {
    width: 220px;
    height: 220px;
    width: 781px;
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
    background: linear-gradient(to right, #ffffff, #999999);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
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
    background: linear-gradient(to right, #ffffff, #aaaaaa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

export default Query1;
