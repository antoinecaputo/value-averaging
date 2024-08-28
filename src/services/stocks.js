import fs from "fs";

export function runPeriodInvestment({
  investment = 1000,
  investmentFrequency = 30,
  investmentPeriod = 12,
  index = "NASDAQ_100",
  periodInvestment = ({ stock, wallet, parameters }) => {},
}) {
  const stocks = parseStocks(index);
  if (!stocks.length) {
    throw new Error("No stocks found");
  }

  const wallet = {
    shares: 0,
    invested: 0,
    transactions: [],
  };

  const parameters = {
    investment,
    investmentFrequency,
    investmentPeriod,
    currentPeriod: 0,
    startPeriod: new Date(stocks[0].date),
  };

  invest({
    price: stocks[0].close,
    shares: investment / stocks[0].close,
    date: stocks[0].date,
    wallet,
    parameters,
  });

  stocks.forEach((stock) => {
    if (parameters.currentPeriod >= parameters.investmentPeriod) {
      return;
    }

    periodInvestment({
      stock,
      wallet,
      parameters,
    });
  });

  const walletValue =
    wallet.shares * wallet.transactions[wallet.transactions.length - 1].price;

  return {
    invested: wallet.invested,
    shares: wallet.shares,
    transactions: wallet.transactions,
    walletValue: walletValue,
    performance: ((walletValue - wallet.invested) / wallet.invested) * 100,
  };
}

/**
 * @param {number} price
 * @param {number} shares
 * @param {Date} date
 * @param {{shares:number, invested:number, transactions: {date: Date, price: number, shares: number}[]}} wallet
 * @param {{investment:number, investmentFrequency:number, investmentPeriod:number, currentPeriod:number, startPeriod:Date}} parameters
 */
export function invest({
  price = 0,
  shares = 0,
  date = new Date(),
  wallet,
  parameters,
}) {
  // console.log("--------------------");
  // console.log("Investing in", date);
  // if (shares > 0) {
  //   console.log(`📉 Buying ${shares} shares at ${price}`);
  // } else {
  //   console.log(`📈 Selling ${shares} shares at ${price}`);
  // }

  wallet.invested += price * shares;
  wallet.shares += shares;

  wallet.transactions.push({
    date: date,
    price: price,
    shares: shares,
  });

  parameters.currentPeriod++;
}

/**
 * @param {"NASDAQ_100" | "SP500" | "SPY"} index
 */
export function parseStocks(index = "", startDate = null) {
  const csv = fs.readFileSync(`./public/${index}.csv`, "utf8");
  const lines = csv.split("\n");

  //date,open,high,low,close,volume,change_percent,avg_vol_20d
  const headers = lines[0].split(",");

  const stocks = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim().replace(/"/g, "");
    const values = line.split(",");

    if (values.length !== headers.length) {
      continue;
    }

    try {
      const stock = {
        date: new Date(values[0]),
        open: parseFloat(values[1]),
        high: parseFloat(values[2]),
        low: parseFloat(values[3]),
        close: parseFloat(values[4]),
        volume: parseFloat(values[5]),
        change_percent: parseFloat(values[6]),
        avg_vol_20d: parseFloat(values[7]),
      };

      stocks.push(stock);
    } catch (e) {
      console.log("Error", e);
      console.log("Line", line);
      console.log("Values", values);
    }
  }

  if (startDate) {
    const filteredStocks = stocks.filter(
      (stock) => stock.date.getTime() >= new Date(startDate).getTime(),
    );

    stocks.length = 0;
    stocks.push(...filteredStocks);
  }

  return stocks.sort((a, b) => new Date(a.date) - new Date(b.date));
}
