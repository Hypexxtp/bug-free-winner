export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send("URL não fornecida");
    }

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(404).send("Imagem não encontrada");
    }

    const contentType = response.headers.get("content-type");

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    const buffer = Buffer.from(await response.arrayBuffer());
    res.status(200).send(buffer);

  } catch (error) {
    res.status(500).send("Erro ao carregar imagem");
  }
}
