export default {
  async fetch(request) {
    if (request.method === 'PUT') {
      try {
        const body = await request.json();
        const { flag } = body;

        if (!flag) {
          return new Response(JSON.stringify({ error: 'Missing flag' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // ログにflagを出力
        console.log('Flag received:', flag);

        return new Response(JSON.stringify({ message: 'Flag received', flag }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Method Not Allowed', { status: 405 });
  },
};
