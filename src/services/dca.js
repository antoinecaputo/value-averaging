import { invest, runPeriodInvestment } from "@/services/stocks";

export function dcaInvest({
  investment = 1000,
  investmentFrequency = 30,
  investmentPeriod = 12,
  index = "NASDAQ_100",
}) {
  const report = runPeriodInvestment({
    investment,
    investmentFrequency,
    investmentPeriod,
    index,
    periodInvestment,
  });

  return report;
}

function periodInvestment({ stock, wallet, parameters }) {
  const nextPeriodToInvest = new Date(parameters.startPeriod);

  nextPeriodToInvest.setDate(
    nextPeriodToInvest.getDate() +
      parameters.currentPeriod * parameters.investmentFrequency,
  );

  const isNextPeriodToInvest = nextPeriodToInvest < stock.date;
  if (!isNextPeriodToInvest) {
    return;
  }

  const sharesAmount = parameters.investment / stock.close;

  invest({
    price: stock.close,
    shares: sharesAmount,
    date: stock.date,
    wallet,
    parameters,
  });
}
