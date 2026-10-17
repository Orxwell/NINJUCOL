export async function getLatestInstagramPosts(limit = 6) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];

  try {
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${token}&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.data) return [];

    // Filtrar solo imágenes o galerías
    return data.data.filter(
      (item) => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM'
    );
  } catch (error) {
    console.error('Error al obtener publicaciones de Instagram:', error);
    return [];
  }
}