const axios = require('axios');
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

exports.getMarketStocks = async (req, res) => {
  try {
    const symbolsResponse = await axios.get(
      'https://finnhub.io/api/v1/stock/symbol',
      {
        params: {
          exchange: 'US',
          token: FINNHUB_API_KEY,
        },
      }
    );

    const stockSymbols = symbolsResponse.data.map((stock) => stock.symbol);

    const limitedStockSymbols = stockSymbols.slice(0, 3);

    const stocksPromises = limitedStockSymbols.map(async (symbol) => {
      try {
        const [quoteResponse, companyResponse] = await Promise.all([
          axios.get('https://finnhub.io/api/v1/quote', {
            params: {
              symbol: symbol,
              token: FINNHUB_API_KEY,
            },
          }),
          axios.get('https://finnhub.io/api/v1/stock/profile2', {
            params: {
              symbol: symbol,
              token: FINNHUB_API_KEY,
            },
          }),
        ]);

        const quote = quoteResponse.data;
        const company = companyResponse.data;

        return {
          symbol: symbol,
          companyName: company.name || symbol,
          currentPrice: quote.c || 0,
          change: quote.d || 0,
          changePercent: quote.dp || 0,
          high: quote.h || 0,
          low: quote.l || 0,
          previousClose: quote.pc || 0,
          logo: company.logo || null,
          currency: company.currency || 'USD',
        };
      } catch (error) {
        console.error(`❌ Erro ao obter dados para ${symbol}:`, error.message);
        return null;
      }
    });

    const stocks = (await Promise.all(stocksPromises)).filter(
      (stock) => stock !== null
    );

    stocks.sort((a, b) => b.changePercent - a.changePercent);

    res.status(200).json({
      stocks: stocks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro ao buscar ações:', error);
    res.status(500).json({ message: 'Erro ao buscar ações' });
  }
};

exports.searchStocks = async (req, res) => {
  try {
    const searchTerm = req.params.term.toUpperCase();

    const searchResponse = await axios.get(
      'https://finnhub.io/api/v1/search',
      {
        params: {
          q: searchTerm,
          token: FINNHUB_API_KEY,
        },
      }
    );

    const filteredResults = searchResponse.data.result
      .filter((item) => item.type === 'Common Stock')
      .slice(0, 10);

    const stocksPromises = filteredResults.map(async (stock) => {
      try {
        const [quoteResponse, companyResponse] = await Promise.all([
          axios.get('https://finnhub.io/api/v1/quote', {
            params: {
              symbol: stock.symbol,
              token: FINNHUB_API_KEY,
            },
          }),
          axios.get('https://finnhub.io/api/v1/stock/profile2', {
            params: {
              symbol: stock.symbol,
              token: FINNHUB_API_KEY,
            },
          }),
        ]);

        return {
          symbol: stock.symbol,
          description: stock.description,
          quote: quoteResponse.data,
          company: companyResponse.data,
        };
      } catch (error) {
        console.error(`Erro ao buscar dados para ${stock.symbol}:`, error);
        return null;
      }
    });

    const stocks = (await Promise.all(stocksPromises)).filter(Boolean);
    res.json(stocks);
  } catch (error) {
    console.error('Erro na pesquisa de ações:', error);
    res.status(500).json({ error: 'Erro ao pesquisar ações' });
  }
};