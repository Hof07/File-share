// components/ProductEmail.jsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Img,
  Button,
} from '@react-email/components';
import * as React from 'react';

function ProductEmail({ fileName, fileId, baseUrl }) {
  const downloadUrl = `https://file-share-seven-silk.vercel.app//f/${fileId}`;

  return (
    <Html>
      <Head />
      <Preview>File Shared With You: {fileName}</Preview>
      <Body
        style={{
          backgroundColor: '#f4f4f4',
          fontFamily: "'Outfit', sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: '480px',
            margin: '40px auto',
            background: '#fff',
            borderRadius: '10px',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <Img
            src="https://file-share-seven-silk.vercel.app/logo.svg"
            width="150"
            height="100"
            alt="Logo"
            style={{ marginBottom: '20px' }}
          />

          <Heading as="h2">
            <strong style={{ color: '#007bff' }}>Receive Your</strong> File Shared With You
          </Heading>

          <Text style={{ fontSize: '18px', marginBottom: '30px' }}>{fileName}</Text>

          <Button
            href={downloadUrl}
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              fontWeight: 600,
              padding: '12px 24px',
              borderRadius: '5px',
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: '20px',
            }}
          >
            Download Your File
          </Button>

          <Text style={{ color: '#9ca3af', marginBottom: '8px' }}>*Terms & Conditions Applied</Text>
          <Text>
            Try{' '}
            <a href="https://file-share-seven-silk.vercel.app" style={{ color: '#007bff', textDecoration: 'none' }}>
              Share.io
            </a>{' '}
            to share your file easily with anyone.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ProductEmail;
