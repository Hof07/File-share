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

/* -------------------------------------------------------------------------- */
/*  buildShareEmailHtml                                                       */
/*  Plain-string version of the same email, for sending from the browser      */
/*  (react-email's render() needs react-dom/server, which client components   */
/*  can't import). Keep it in sync with the component above: same tokens,     */
/*  same copy, same layout.                                                   */
/* -------------------------------------------------------------------------- */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildShareEmailHtml({
  fileName,
  fileId,
  baseUrl = SITE_URL,
  passwordProtected = false,
}) {
  const origin = String(baseUrl).replace(/\/$/, '');
  const url = escapeHtml(`${origin}/f/${fileId}`);
  const name = escapeHtml(fileName);
  const site = escapeHtml(origin);

  const passwordNote = passwordProtected
    ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.5;color:${color.graphite};">This file is password protected. The sender will give you the password separately.</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name} was shared with you</title>
</head>
<body style="margin:0;padding:32px 16px;background-color:${color.chalk};font-family:${bodyFont};color:${color.ink};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${name} was shared with you</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;border-collapse:separate;background-color:${color.paper};border:1px solid ${color.rule};border-radius:6px;">
<tr><td style="padding:32px;text-align:left;">
<p style="margin:0 0 28px;font-family:${displayFont};font-size:20px;font-weight:700;letter-spacing:-0.02em;color:${color.ink};">Share.io</p>
<h1 style="margin:0 0 24px;font-family:${displayFont};font-size:28px;font-weight:700;line-height:1.15;letter-spacing:-0.025em;color:${color.ink};">A file was shared with you</h1>
<hr style="border:none;border-top:1.5px solid ${color.ink};margin:0;">
<p style="margin:16px 0 4px;font-size:14px;line-height:1.4;color:${color.graphite};">File</p>
<p style="margin:0 0 16px;font-size:18px;font-weight:600;line-height:1.4;color:${color.ink};word-break:break-word;">${name}</p>
<hr style="border:none;border-top:1px solid ${color.rule};margin:0;">
${passwordNote}
<div style="margin:24px 0;">
<a href="${url}" style="display:inline-block;padding:16px 24px;background-color:${color.signal};color:#FFFFFF;font-family:${bodyFont};font-size:16px;font-weight:600;line-height:1;text-decoration:none;border-radius:6px;">Download the file</a>
</div>
<p style="margin:0 0 4px;font-size:14px;line-height:1.5;color:${color.graphite};">Or paste this link into your browser:</p>
<p style="margin:0 0 28px;font-size:14px;line-height:1.5;word-break:break-all;"><a href="${url}" style="color:${color.ink};text-decoration:underline;">${url}</a></p>
<hr style="border:none;border-top:1px solid ${color.rule};margin:0 0 16px;">
<p style="margin:0;font-size:14px;line-height:1.5;color:${color.graphite};">Sent with <a href="${site}" style="color:${color.graphite};text-decoration:underline;">Share.io</a>. Share files with a link and an optional password.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export default ProductEmail;