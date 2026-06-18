const https = require('https');

const urls = [
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de3c9de59f9e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583939411023-14783179e581?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1614212586718-fbdce6853fc5?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541250848049-b4f714612052?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529139574466-a303027c028b?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=2070&auto=format&fit=crop'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ url, status: e.message });
    });
  });
}

async function run() {
  for (const url of urls) {
    const res = await checkUrl(url);
    if (res.status !== 200 && res.status !== 302 && res.status !== 301) {
      console.log(`FAILED: ${res.status} - ${res.url}`);
    } else {
      console.log(`OK: ${res.url}`);
    }
  }
}

run();
