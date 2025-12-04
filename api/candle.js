import fs from 'fs';
import path from 'path';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const { searchParams } = url;

    const code = searchParams.get('code');
    const year = parseInt(searchParams.get('year'));
    const month = parseInt(searchParams.get('month'));
    const day = parseInt(searchParams.get('day'));
    const hour = parseInt(searchParams.get('hour'));

    if (!code || isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = calculate(code, year, month, day, hour);

    if (!result) {
      return new Response(JSON.stringify({ error: 'No data found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

function calculate(code, year, month, day, hour) {
  const filePath = path.join(process.cwd(), 'api', 'order_books.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');

  // Skip header
  const dataLines = lines.slice(1);

  const filtered = dataLines.filter(line => {
    if (!line.trim()) return false;
    const [timeStr, lineCode, price] = line.split(',');

    if (lineCode !== code) return false;

    const targetPrefix = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}`;
    return timeStr.startsWith(targetPrefix);
  }).map(line => {
    const [time, code, price] = line.split(',');
    return { time, code, price: parseInt(price) };
  });

  if (filtered.length === 0) {
    return null;
  }

  const openPrice = filtered[0].price;
  const highPrice = Math.max(...filtered.map(item => item.price));
  const lowPrice = Math.min(...filtered.map(item => item.price));
  const closePrice = filtered[filtered.length - 1].price;

  return { "open": openPrice, "high": highPrice, "low": lowPrice, "close": closePrice };
}
