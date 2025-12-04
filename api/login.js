export default {
  async fetch(request) {
    if (request.method !== 'PUT') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    
    try {
      const body = await request.json();
      const { username, password } = body;

      if (!username || !password) {
        return new Response(JSON.stringify({ error: 'Missing username or password' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const combined = username + password;

      // 参考: https://developer.mozilla.org/ja/docs/Web/API/SubtleCrypto/digest
      const encoder = new TextEncoder();
      const data = encoder.encode(combined); // 1文字ずつ配列にする（digestにわたすため）
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer)); // バッファー（メモリ領域を示す）をバイト列に変換する
      const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // 16進数に変換して、不足する桁を0で埋める

      return new Response(JSON.stringify({ token }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
