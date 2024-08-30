"use client";

import { useCallback, useMemo } from "react";
import { formatCurrency } from "@/services/utils";

export default function InvestReport({
  title = "",
  shares = 0,
  walletValue = 0,
  invested = 0,
  performance = 0,
  transactions = [],
}) {
  const profit = useMemo(() => walletValue - invested, [walletValue, invested]);

  const pricePerShare = useMemo(() => {
    if (transactions.length === 0) {
      return 0;
    }

    const averagePrice =
      transactions.reduce((acc, transaction) => acc + transaction.price, 0) /
      transactions.length;

    return Number(averagePrice.toFixed(2));
  }, [transactions]);

  const walletValueBeforeTransaction = useCallback(
    (transactionIndex) => {
      if (transactionIndex < 0) {
        return 0;
      }

      const transactionsUntilIndex = transactions.slice(0, transactionIndex);

      const currentPrice = transactions[transactionIndex].price;

      const walletValue = transactionsUntilIndex.reduce((acc, transaction) => {
        return acc + transaction.shares * currentPrice;
      }, 0);

      return walletValue;
    },
    [transactions],
  );

  return (
    <div className=" flex-col justify-center gap-8 min-w-100 max-w-100">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}

      <p className="my-1">Wallet Value: {formatCurrency(walletValue)}</p>

      <p className="my-1">Invested: {formatCurrency(invested)}</p>

      <div className="flex gap-1 my-1">
        <p> Profit: </p>
        <p className={profit > 0 ? "dark:text-green-400" : "dark:text-red-400"}>
          {formatCurrency(profit)}%
        </p>
      </div>

      <div className="flex gap-1 my-1">
        <p> Performance: </p>
        <p className={performance > 0 ? "text-green-400" : "text-red-400"}>
          {performance}%
        </p>
      </div>

      <p className="my-1">Shares: {shares}</p>

      <p className="my-1">Price per Share: {formatCurrency(pricePerShare)}</p>

      <div className="flex gap-1 my-1">
        <p>Buy transactions: </p>
        <p className="text-green-400">
          {transactions.filter((t) => t.shares > 0).length}
        </p>
      </div>
      <div className="flex gap-1 my-1">
        <p>Sell transactions:</p>
        <p className="text-red-400">
          {transactions.filter((t) => t.shares < 0).length}
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {transactions.map((transaction, index) => (
          <>
            <div className="border-b border-gray-100 opacity-30"></div>

            <p>
              {`${new Date(transaction.date).toLocaleDateString("fr-FR")} - ${formatCurrency(walletValueBeforeTransaction(index))}`}
            </p>

            <p
              className={`flex gap-1 ${transaction.shares > 0 ? "text-green-400" : "text-red-400"}`}
            >{`${transaction.shares.toFixed(2)} at ${transaction.price}$`}</p>

            <p>{formatCurrency(transaction.shares * transaction.price)}</p>
          </>
        ))}
      </div>
    </div>
  );
}
