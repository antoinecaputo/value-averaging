"use client";

import { useCallback, useMemo, useState } from "react";
import InvestReport from "@/components/InvestReport";

export default function Home() {
  const [investmentParameters, setInvestmentParameters] = useState({
    investment: 1000,
    investmentFrequency: 30,
    investmentPeriod: 36,
    index: "NASDAQ_100",
    start: null,
  });

  const urlParams = useMemo(
    () =>
      `investment=${investmentParameters.investment}` +
      `&investmentFrequency=${investmentParameters.investmentFrequency}` +
      `&investmentPeriod=${investmentParameters.investmentPeriod}` +
      `&index=${investmentParameters.index}` +
      `&start=${investmentParameters.start?.getTime() || ""}`,
    [investmentParameters],
  );

  /**
   * @returns {{walletValue: number, invested: number, performance: number, transactions: {date: string, price: number, shares: number}[]}}
   */
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/invest?${urlParams}`);
      const data = await response.json();
      setData(data);
    } catch (e) {
      console.error(e);
      setError(e as any);
    }
  }, [urlParams]);

  return (
    <main className="flex min-h-screen flex-col  p-24">
      <div className="z-10 max-w-5xl w-full  justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">DVA Investment</h1>
        <div className="hover:cursor-pointer hover:bg-gray-900 p-3 rounded"></div>
      </div>

      <div className="z-10 max-w-5xl font-mono text-sm">
        <div className="flex flex-row gap-1">
          <p>Investment:</p>
          <input
            className="text-black"
            value={investmentParameters.investment}
            onChange={(e) =>
              setInvestmentParameters({
                ...investmentParameters,
                investment: parseInt(e.target.value),
              })
            }
            type="number"
          />
        </div>

        <div className="flex flex-row gap-1">
          <p>Investment Frequency:</p>
          <input
            className="text-black"
            value={investmentParameters.investmentFrequency}
            onChange={(e) =>
              setInvestmentParameters({
                ...investmentParameters,
                investmentFrequency: parseInt(e.target.value),
              })
            }
            type="number"
          />
        </div>

        <div className="flex flex-row gap-1">
          <p>Investment Period:</p>
          <input
            className="text-black"
            value={investmentParameters.investmentPeriod}
            onChange={(e) =>
              setInvestmentParameters({
                ...investmentParameters,
                investmentPeriod: parseInt(e.target.value),
              })
            }
            type="number"
          />
        </div>

        <div className="flex flex-row gap-1">
          <p>Index:</p>
          <select
            className="text-black"
            value={investmentParameters.index}
            onChange={(e) =>
              setInvestmentParameters({
                ...investmentParameters,
                index: e.target.value,
              })
            }
          >
            <option value="NASDAQ_100">NASDAQ 100</option>
            <option value="SPY">SPY</option>
            <option value="SP500">S&P 500</option>
          </select>
        </div>

        <div className="flex flex-row gap-1">
          <p>Start Date:</p>
          <input
            className="text-black"
            value={data ? data.dva.transactions[0].date.split("T")[0] : ""}
            onChange={(e) =>
              setInvestmentParameters({
                ...investmentParameters,
                start: new Date(e.target.value),
              })
            }
            type="date"
          />
        </div>
      </div>

      <button
        className="my-2 py-1 w-36 bg-blue-600 hover:bg-blue-700 text-white rounded"
        onClick={fetchData}
      >
        Calculate
      </button>

      <p className="text-center">{error && `${error.message}`}</p>

      <div className="flex flex-row gap-8 z-10 max-w-5xl w-full font-mono text-sm py-8">
        {data?.dva && (
          <InvestReport
            title="DVA"
            walletValue={data?.dva?.walletValue}
            invested={data?.dva?.invested}
            shares={data?.dva?.shares}
            performance={data?.dva?.performance}
            transactions={data?.dva?.transactions}
          />
        )}

        {data?.dca && (
          <InvestReport
            title="DCA"
            walletValue={data?.dca?.walletValue}
            invested={data?.dca?.invested}
            shares={data?.dca?.shares}
            performance={data?.dca?.performance}
            transactions={data?.dca?.transactions}
          />
        )}
      </div>
    </main>
  );
}
