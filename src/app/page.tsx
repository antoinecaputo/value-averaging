"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InvestReport from "@/components/InvestReport";
import { fetcher } from "@/services/utils";
import useSWR from "swr";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { d } = Object.fromEntries(searchParams);

  const [investmentParameters, setInvestmentParameters] = useState({
    investment: 1000,
    investmentFrequency: 30,
    investmentPeriod: 75,
    index: "NASDAQ_100",
  });

  /**
   * @returns {{walletValue: number, invested: number, performance: number, transactions: {date: string, price: number, shares: number}[]}}
   */
  const { data, error, mutate, isLoading } = useSWR(
    ["/api/invest", investmentParameters],
    ([url, investmentParameters]) =>
      fetcher(
        `${url}?investment=${investmentParameters.investment}&investmentFrequency=${investmentParameters.investmentFrequency}&investmentPeriod=${investmentParameters.investmentPeriod}`,
      ),
  );

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">DVA Investment</h1>
        <div
          className="hover:cursor-pointer hover:bg-gray-900 p-3 rounded"
          onClick={() => router.push("/trend")}
        ></div>
      </div>

      <div className="z-10 max-w-5xl w-full items-center font-mono text-sm">
        <p>Investment: {investmentParameters.investment}$</p>
        <p>
          Investment Frequency: {investmentParameters.investmentFrequency}d{" "}
        </p>
        <p>Investment Period: {investmentParameters.investmentPeriod}</p>
        <p>Index: {investmentParameters.index.replace("_", " ")}</p>
      </div>

      <p className="text-center">
        {error && `${error.message}`}

        {!error && !data && "Loading..."}
      </p>

      <div className="flex flex-row gap-8 z-10 max-w-5xl w-full items-center font-mono text-sm py-8">
        {data?.dva && (
          <InvestReport
            title="DVA"
            walletValue={data.dva.walletValue}
            invested={data.dva.invested}
            shares={data.dva.shares}
            performance={data.dva.performance}
            transactions={data.dva.transactions}
          />
        )}

        {data?.dca && (
          <InvestReport
            title="DCA"
            walletValue={data.dca.walletValue}
            invested={data.dca.invested}
            shares={data.dva.shares}
            performance={data.dca.performance}
            transactions={data.dca.transactions}
          />
        )}
      </div>
    </main>
  );
}
