'use client'
import styled from 'styled-components'
import React from 'react'

const StyledWrapper = styled.div`
  position: relative;
  padding: 100px 0;
  

  .card-container {
    width: 100%;
    max-width: 1565px;
    height: 510px;
    margin: 30px auto 0;
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
    z-index: 1;
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
    flex-direction: column;
    background: linear-gradient(to right, #ffffff, #999999);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
    user-select: none;
  }

  .icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    fill: white;
    filter: drop-shadow(0 0 6px #ffffffaa);
    animation: rotate 10s linear infinite, glow 2s ease-in-out infinite alternate;
    transform-origin: 50% 50%;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes glow {
    0% {
      filter: drop-shadow(0 0 5px white);
    }
    100% {
      filter: drop-shadow(0 0 15px white);
    }
  }

  .text {
    font-size: 3rem;
    background: linear-gradient(to right, #ffffff, #aaaaaa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-top: 0.4rem;
  }

  .semi {
    font-size: 13px;
    background: linear-gradient(to right, #ffffff, #aaaaaa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-top: 8px;
  }

  .bubble {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    animation: floatUp linear infinite;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes floatUp {
    0% {
      transform: translateY(0) scale(1);
      opacity: 0.4;
    }
    100% {
      transform: translateY(-800px) scale(1.5);
      opacity: 0;
    }
  }
`

const Bubbles = () => {
  return (
    <>
      {[...Array(20)].map((_, i) => {
        const size = 10 + Math.random() * 30
        const left = Math.random() * 100
        const duration = 5 + Math.random() * 10
        const delay = Math.random() * 5
        const bottom = -80 + Math.random() * 50 // adjusted for smooth floating start

        return (
          <div
            key={i}
            className="bubble"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              bottom: `${bottom}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
    </>
  )
}

export default function AuraCard() {
  return (
    <StyledWrapper>
      <Bubbles />
      <div className="card-container">
        <div className="logo">
          <svg viewBox="0 0 24 24" className="icon" xmlns="http://www.w3.org/2000/svg">
            <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245Z" />
          </svg>
          <span className="text">AURA</span>
          <p className="semi">OUR NEW CREATION ....</p>
        </div>
      </div>
    </StyledWrapper>
  )
}
