export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.pixdomilhao.com.br/v1/raffles/active",
      {
        headers: {
          "accept": "application/json",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
        },
      }
    );

    const data = await response.json();

    if (!data?.raffles || !Array.isArray(data.raffles)) {
      return res.status(500).json({
        success: false,
        message: "Formato inesperado"
      });
    }

    const raffles = data.raffles.map(r => ({
      uuid: r.uuid,
      title: r.title,
      edition: r.edition,
      kind: r.kind,
      price: r.price,
      status: r.status,
      drawDate: r.drawDate,
      slug: r.slug,

      // 🔥 Thumbnail re-hospedada via proxy
      thumbnail: `/api/raffle-thumbnail?url=${encodeURIComponent(r.thumbnail)}`
    }));

    return res.status(200).json({
      success: true,
      total: raffles.length,
      raffles
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
