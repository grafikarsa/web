import { NextRequest, NextResponse } from 'next/server';
import http from 'http';
import https from 'https';
import { URL } from 'url';

/**
 * Proxy endpoint for uploading files to MinIO
 * This bypasses CORS issues when uploading directly from browser to MinIO
 */
export async function PUT(request: NextRequest) {
  try {
    const presignedUrl = request.headers.get('x-presigned-url');
    const contentType = request.headers.get('content-type');

    console.log('Upload proxy called');
    console.log('Presigned URL:', presignedUrl?.substring(0, 100) + '...');

    if (!presignedUrl) {
      return NextResponse.json(
        { error: 'Missing presigned URL' },
        { status: 400 }
      );
    }

    // Get the file body
    const body = await request.arrayBuffer();
    console.log('Body size:', body.byteLength);

    // Use native http module to avoid fetch issues
    const result = await new Promise<{ status: number; body: string }>((resolve, reject) => {
      const url = new URL(presignedUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      // Replace Docker internal hostnames with localhost
      let hostname = url.hostname;
      if (hostname === 'localhost' || hostname === 'minio') {
        hostname = '127.0.0.1';
      }

      const options = {
        hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'PUT',
        headers: {
          'Content-Type': contentType || 'application/octet-stream',
          'Content-Length': body.byteLength,
        },
      };

      console.log('Request options:', { ...options, path: options.path.substring(0, 50) + '...' });

      const req = client.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          console.log('MinIO response:', res.statusCode);
          resolve({ status: res.statusCode || 500, body: responseBody });
        });
      });

      req.on('error', (err) => {
        console.error('Request error:', err);
        reject(err);
      });

      req.write(Buffer.from(body));
      req.end();
    });

    if (result.status >= 400) {
      return NextResponse.json(
        { error: 'Upload to storage failed', details: result.body },
        { status: result.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Upload proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
