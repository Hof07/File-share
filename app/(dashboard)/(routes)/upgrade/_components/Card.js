'use client'
import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'

const PricingCards = () => {
  const router = useRouter()

  const handleClick = () => {
    router.push('/upgrade/buy')
  }

  return (
    <Wrapper>
      <Card
        title="Free"
        price="0"
        duration="/Lifetime"
        features={[
          "Single File Upload",
          "2MB Upload Limit",
          "5 File Upload limit",
          "Shares Send Not Allow",
        ]}
        bg="#ffffff"
        color="#333"
        border="1px solid #ddd"
        onClick={handleClick}
      />

      <Card
        title="Starter"
        price="49"
        duration="/Lifetime"
        features={[
          "Multiple File Upload",
          "Auto ZIP Conversion",
          "Unlimited File Uploaad",
          "Shares Provided",
        ]}
        bg="#f7f9fc"
        color="#222"
        border="1px solid #ccc"
        className="starter"
        onClick={handleClick}
      />

      <Card
        title="Premium"
        price="120"
        duration="/Lifetime"
        features={[
          "All Starter Features",
          "No File Size Limit",
          "Golden Name Tag in Shares",
          "Customizable shares tamplate",
        ]}
        bg="#e9f0fb"
        color="#111"
        border="1px solid #bbb"
        onClick={handleClick}
      />
    </Wrapper>
  )
}

const Card = ({ title, price, duration, features, bg, color, border, className, onClick }) => {
  return (
    <StyledCard bg={bg} color={color} border={border} className={className}>
      <div className="header">
        <p className="title">{title}</p>
        <div className="price-container">
          <span>₹</span>{price}
          <span>{duration}</span>
        </div>
      </div>
      <ul className="lists">
        {features.map((feature, idx) => (
          <li className="list" key={idx}>
            <span>
              <svg aria-hidden="true" stroke={color} strokeWidth={2} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.5 12.75l6 6 9-13.5" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </span>
            <p>{feature}</p>
          </li>
        ))}
      </ul>
      <div className="button-container">
        <button type="button" onClick={onClick} >
          {price === "0" ? "Get Started" : "Buy Now"}
        </button>
      </div>
    </StyledCard>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  padding: 2rem;
`

const StyledCard = styled.div`
  background: ${props => props.bg || '#fff'};
  color: ${props => props.color || '#000'};
  border: ${props => props.border || '1px solid #ddd'};
  padding: 1.5rem;
  border-radius: 12px;
  width: 300px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: transform 0.3s ease;

  &.starter {
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }

  .header {
    margin-bottom: 1.5rem;
    text-align: center;
    border-bottom: 1px solid #eee;
    padding-bottom: 1rem;
  }

  .title {
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    margin: 0;
  }

  .price-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 4px;
    font-size: 2.5rem;
    font-weight: 700;
  }

  .price-container span:first-child {
    margin-top: 10px;
    font-size: 1.5rem;
  }

  .price-container span:last-child {
    align-self: flex-end;
    font-size: 1.25rem;
    color: #666;
  }

  .lists {
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    padding-left: 0;
    list-style: none;
  }

  .list {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 0.75rem;
    color: ${props => props.color || '#333'};
  }

  .list span {
    border-radius: 50%;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    height: 26px;
    width: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .list svg {
    height: 12px;
    width: 12px;
    stroke: ${props => props.color || '#333'};
  }

  .list p {
    margin: 0;
    font-size: 0.9rem;
  }

  .button-container button {
    width: 100%;
    background-color: #007bff;
    color: white;
    padding: 10px;
    border-radius: 8px;
    text-transform: uppercase;
    border: none;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .button-container button:hover {
    background-color: #0056b3;
  }
`

export default PricingCards
