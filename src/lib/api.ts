export const fetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      'X-API-KEY': process.env.API_ACCESS_KEY ?? '',
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal mengambil data. Status: ${res.status}`);
  }

  return res.json();
};