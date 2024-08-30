import { invest, runPeriodInvestment } from "@/services/stocks";

export function dvaInvest({
  investment = 1000,
  investmentFrequency = 30,
  investmentPeriod = 12,
  index = "NASDAQ_100",
  startDate = null,
}) {
  const report = runPeriodInvestment({
    investment,
    investmentFrequency,
    investmentPeriod,
    index,
    startDate,
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

  const amountRequired = parameters.investment * (parameters.currentPeriod + 1);

  const walletValue = wallet.shares * stock.close;

  const amountToInvest = amountRequired - walletValue;

  const sharesAmount = amountToInvest / stock.close;

  invest({
    price: stock.close,
    shares: sharesAmount,
    date: stock.date,
    wallet,
    parameters,
  });
}
