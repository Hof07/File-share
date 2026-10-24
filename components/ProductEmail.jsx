// components/ProductEmail.jsx
//
// Share.io email, same design language as the site: chalk page, one white panel
// with a hairline border and 6px radius, left-aligned text, one accent colour for
// the button. Email clients ignore most modern CSS, so everything is inline and
// fonts fall back to system stacks (web fonts only load in a few clients).

import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
  Link,
} from '@react-email/components';
import * as React from 'react';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://file-share-seven-silk.vercel.app'
).replace(/\/$/, '');

const color = {
  chalk: '#F2F4F2',
  paper: '#FFFFFF',
  ink: '#1A2030',
  graphite: '#525B68',
  rule: '#CDD3D9',
  signal: '#2B3FE8',
};

const displayFont =
  "'Bricolage Grotesque', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const bodyFont =
  "'Hanken Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";

function ProductEmail({
  fileName,
  fileId,
  baseUrl = SITE_URL,
  passwordProtected = false,
}) {
  const origin = String(baseUrl).replace(/\/$/, '');
  const downloadUrl = `${origin}/f/${fileId}`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{`${fileName} was shared with you`}</Preview>
      <Body
        style={{
          backgroundColor: color.chalk,
          fontFamily: bodyFont,
          color: color.ink,
          margin: 0,
          padding: '32px 16px',
        }}
      >
        <Container
          style={{
            maxWidth: '520px',
            margin: '0 auto',
            backgroundColor: color.paper,
            border: `1px solid ${color.rule}`,
            borderRadius: '6px',
            padding: '32px',
            textAlign: 'left',
          }}
        >
          <Text
            style={{
              fontFamily: displayFont,
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: color.ink,
              margin: '0 0 28px',
            }}
          >
            Share.io
          </Text>

          <Heading
            as="h1"
            style={{
              fontFamily: displayFont,
              fontSize: '28px',
              fontWeight: 700,
              lineHeight: '1.15',
              letterSpacing: '-0.025em',
              color: color.ink,
              margin: '0 0 24px',
            }}
          >
            A file was shared with you
          </Heading>

          <Hr
            style={{
              border: 'none',
              borderTop: `1.5px solid ${color.ink}`,
              margin: 0,
            }}
          />

          <Text
            style={{
              fontSize: '14px',
              lineHeight: '1.4',
              color: color.graphite,
              margin: '16px 0 4px',
            }}
          >
            File
          </Text>
          <Text
            style={{
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '1.4',
              color: color.ink,
              wordBreak: 'break-word',
              margin: '0 0 16px',
            }}
          >
            {fileName}
          </Text>

          <Hr
            style={{
              border: 'none',
              borderTop: `1px solid ${color.rule}`,
              margin: 0,
            }}
          />

          {passwordProtected && (
            <Text
              style={{
                fontSize: '15px',
                lineHeight: '1.5',
                color: color.graphite,
                margin: '16px 0 0',
              }}
            >
              This file is password protected. The sender will give you the
              password separately.
            </Text>
          )}

          <Section style={{ margin: '24px 0' }}>
            <Button
              href={downloadUrl}
              style={{
                backgroundColor: color.signal,
                color: '#FFFFFF',
                fontFamily: bodyFont,
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '1',
                padding: '16px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Download the file
            </Button>
          </Section>

          <Text
            style={{
              fontSize: '14px',
              lineHeight: '1.5',
              color: color.graphite,
              margin: '0 0 4px',
            }}
          >
            Or paste this link into your browser:
          </Text>
          <Text
            style={{
              fontSize: '14px',
              lineHeight: '1.5',
              margin: '0 0 28px',
              wordBreak: 'break-all',
            }}
          >
            <Link
              href={downloadUrl}
              style={{ color: color.ink, textDecoration: 'underline' }}
            >
              {downloadUrl}
            </Link>
          </Text>

          <Hr
            style={{
              border: 'none',
              borderTop: `1px solid ${color.rule}`,
              margin: '0 0 16px',
            }}
          />

          <Text
            style={{
              fontSize: '14px',
              lineHeight: '1.5',
              color: color.graphite,
              margin: 0,
            }}
          >
            Sent with{' '}
            <Link
              href={origin}
              style={{ color: color.graphite, textDecoration: 'underline' }}
            >
              Share.io
            </Link>
            . Share files with a link and an optional password.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ProductEmail;