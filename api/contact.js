import nodemailer from 'nodemailer';

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_REQUEST_SIZE = Math.floor(4.5 * 1024 * 1024);

const TEXT_LIMITS = {
  email: 254,
  product_url: 2048,
  cta_source: 80,
  selected_sprint: 120,
  page_url: 2048,
  referrer: 2048,
  utm_source: 200,
  utm_medium: 200,
  utm_campaign: 200,
  website: 200,
};

const ALLOWED_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'zip']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/zip',
  'application/x-zip-compressed',
]);

const failureBody = { ok: false, error: 'submission_failed' };

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function readText(formData, key, maxLength) {
  const value = formData.get(key);
  if (value == null) return '';
  if (typeof value !== 'string') throw new Error('invalid_field');
  const trimmed = value.trim();
  if (trimmed.length > maxLength) throw new Error('field_too_long');
  return trimmed;
}

function isValidEmail(value) {
  return value.length > 3 && value.length <= TEXT_LIMITS.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeProductUrl(value) {
  if (!value) return '';
  const parsed = new URL(value);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid_url');
  return parsed.toString();
}

function isUploadedFile(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    typeof value.size === 'number' &&
    typeof value.arrayBuffer === 'function'
  );
}

function validateFile(file) {
  if (!isUploadedFile(file) || file.size <= 0 || file.size > MAX_FILE_SIZE) {
    throw new Error('invalid_file');
  }

  if (file.name.length > 180) throw new Error('invalid_file_name');

  const extension = (file.name.split('.').pop() || '').toLowerCase();
  const mimeType = String(file.type || '').toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension) || !ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error('invalid_file_type');
  }

  return {
    extension,
    mimeType,
    safeName: file.name.replace(/[\u0000-\u001f\u007f/\\]/g, '_').slice(0, 180),
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function metadataRows(fields) {
  return [
    ['CTA source', fields.cta_source],
    ['Selected sprint', fields.selected_sprint],
    ['Page URL', fields.page_url],
    ['Referrer', fields.referrer],
    ['UTM source', fields.utm_source],
    ['UTM medium', fields.utm_medium],
    ['UTM campaign', fields.utm_campaign],
  ].filter(([, value]) => value);
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json(failureBody, 405, { Allow: 'POST' });
    }

    try {
      const contentLength = Number(request.headers.get('content-length') || 0);
      if (contentLength && contentLength > MAX_REQUEST_SIZE) {
        return json(failureBody, 413);
      }

      const gmailUser = process.env.GMAIL_USER;
      const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
      const contactEmail = process.env.CONTACT_EMAIL;

      if (!gmailUser || !gmailAppPassword || !contactEmail) {
        return json(failureBody, 500);
      }

      const formData = await request.formData();

      const fields = {
        email: readText(formData, 'email', TEXT_LIMITS.email),
        product_url: readText(formData, 'product_url', TEXT_LIMITS.product_url),
        cta_source: readText(formData, 'cta_source', TEXT_LIMITS.cta_source),
        selected_sprint: readText(formData, 'selected_sprint', TEXT_LIMITS.selected_sprint),
        page_url: readText(formData, 'page_url', TEXT_LIMITS.page_url),
        referrer: readText(formData, 'referrer', TEXT_LIMITS.referrer),
        utm_source: readText(formData, 'utm_source', TEXT_LIMITS.utm_source),
        utm_medium: readText(formData, 'utm_medium', TEXT_LIMITS.utm_medium),
        utm_campaign: readText(formData, 'utm_campaign', TEXT_LIMITS.utm_campaign),
        website: readText(formData, 'website', TEXT_LIMITS.website),
      };

      if (fields.website) {
        return json(failureBody, 400);
      }

      if (!isValidEmail(fields.email)) {
        return json(failureBody, 400);
      }

      let productUrl = '';
      if (fields.product_url) {
        try {
          productUrl = normalizeProductUrl(fields.product_url);
        } catch {
          return json(failureBody, 400);
        }
      }

      const productFile = formData.get('product_file');
      const hasFile = isUploadedFile(productFile) && productFile.size > 0;
      const hasUrl = Boolean(productUrl);

      if (hasUrl === hasFile) {
        return json(failureBody, 400);
      }

      let attachment = null;
      let fileDisplayName = '';

      if (hasFile) {
        let validated;
        try {
          validated = validateFile(productFile);
        } catch {
          return json(failureBody, 400);
        }

        const fileBuffer = Buffer.from(await productFile.arrayBuffer());
        if (fileBuffer.length > MAX_FILE_SIZE) {
          return json(failureBody, 413);
        }

        fileDisplayName = validated.safeName;
        attachment = {
          filename: validated.safeName,
          content: fileBuffer,
          contentType: validated.mimeType,
        };
      }

      const rows = metadataRows(fields);
      const productText = hasUrl
        ? `Product URL: ${productUrl}`
        : `Product file: ${fileDisplayName} (attached)`;

      const text = [
        'New product submission — Oleh Hebel & Co',
        '',
        `Email: ${fields.email}`,
        productText,
        '',
        ...rows.map(([label, value]) => `${label}: ${value}`),
      ].join('\n');

      const productHtml = hasUrl
        ? `<p><strong>Product URL:</strong> <a href="${escapeHtml(productUrl)}">${escapeHtml(productUrl)}</a></p>`
        : `<p><strong>Product file:</strong> ${escapeHtml(fileDisplayName)} <em>(attached)</em></p>`;

      const metadataHtml = rows.length
        ? `<table cellpadding="6" cellspacing="0" border="0">${rows
            .map(([label, value]) => `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`)
            .join('')}</table>`
        : '';

      const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
          <h2 style="margin:0 0 20px">New product submission — Oleh Hebel &amp; Co</h2>
          <p><strong>Email:</strong> ${escapeHtml(fields.email)}</p>
          ${productHtml}
          ${metadataHtml}
        </div>
      `;

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });

      await transporter.sendMail({
        from: gmailUser,
        to: contactEmail,
        replyTo: fields.email,
        subject: 'New product submission — Oleh Hebel & Co',
        text,
        html,
        attachments: attachment ? [attachment] : undefined,
      });

      return json({ ok: true }, 200);
    } catch {
      return json(failureBody, 500);
    }
  },
};
