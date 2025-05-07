"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import InvestReport from "@/components/InvestReport";

export default function Home() {
  const [investmentParameters, setInvestmentParameters] = useState<{
    investment: number;
    investmentFrequency: number;
    investmentPeriod: number; // in years
    index: string;
    start: Date | null;
  }>({
    investment: 1000,
    investmentFrequency: 30,
    investmentPeriod: 5,
    index: "NASDAQ_100",
    start: null,
  });

  const investmentPeriod = useMemo(() => {
    if (!investmentParameters.start) {
      return 0;
    }

    const end = new Date(investmentParameters.start?.getTime() || 0);
    end.setFullYear(end.getFullYear() + investmentParameters.investmentPeriod);

    const dayDiff = Math.floor(
      (end.getTime() - investmentParameters.start?.getTime() || 0) /
        (1000 * 60 * 60 * 24),
    );

    return Math.floor(dayDiff / investmentParameters.investmentFrequency);
  }, [
    investmentParameters.investmentFrequency,
    investmentParameters.investmentPeriod,
    investmentParameters.start,
  ]);

  const investmentQuote = useMemo(() => {
    return "";
    if (!investmentParameters.start || !investmentPeriod) {
      return "";
    }

    const end = new Date(investmentParameters.start?.getTime() || 0);
    end.setFullYear(end.getFullYear() + investmentParameters.investmentPeriod);

    // const startYear = startDate.getFullYear();
    // const startMonth = startDate.getMonth();
    // const endYear = endDate.getFullYear();
    // const endMonth = endDate.getMonth();

    const yearDiff =
      end.getFullYear() - investmentParameters.start?.getFullYear();
    const monthDiff = end.getMonth() - investmentParameters.start?.getMonth();

    return `Investing during ${yearDiff * 12 + (monthDiff || 1)} month${monthDiff > 1 ? "s" : ""} every ${
      investmentParameters.investmentFrequency
    } day${investmentParameters.investmentFrequency > 1 ? "s" : ""} until ${end.toLocaleDateString()}`;
  }, [investmentParameters]);

  const urlParams = useMemo(
    () =>
      `investment=${investmentParameters.investment}` +
      `&investmentFrequency=${investmentParameters.investmentFrequency}` +
      `&investmentPeriod=${investmentPeriod}` +
      `&index=${investmentParameters.index}` +
      `&start=${investmentParameters.start?.getTime() || ""}`,
    [investmentParameters, investmentPeriod],
  );

  const [data, setData] = useState<{
    dva: {
      walletValue: number;
      invested: number;
      performance: number;
      transactions: { date: string; price: number; shares: number }[];
      shares: number;
    };
    dca: {
      walletValue: number;
      invested: number;
      performance: number;
      transactions: { date: string; price: number; shares: number }[];
      shares: number;
    };
  } | null>(null);

  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/invest?${urlParams}`);
      const data = await response.json();

      setData(data);
      setError(null);

      if (data?.dva?.transactions.length === 0) {
        return;
      }

      const start = new Date(data.dva.transactions[0].date);

      setInvestmentParameters((prev) => ({
        ...prev,
        start,
      }));
    } catch (e) {
      console.error(e);
      setError(e as any);
    }
  }, [urlParams]);

  useEffect(() => {
    (async () => await fetchData())();
  }, []);

  return (
    <main className="flex min-h-screen flex-col  p-24">
      <div className="z-10 max-w-5xl w-full gap-2 justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">DVA Investment</h1>
        <div className="hover:cursor-pointer hover:bg-gray-900 p-3 rounded"></div>
      </div>

      <div className="flex flex-col-reverse gap-2 my-8 md:flex-row">
        <div>
          {/* // pb-2 for all child-1 */}
          <div className="z-10 max-w-5xl font-mono text-sm space-y-2">
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
              <p>Investment Frequency (d):</p>
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
              <p>Investment Period (y):</p>
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
                <option value="CW8">MSCI World</option>
                <option value="SPY">SPY</option>
                <option value="SP500">S&P 500</option>
              </select>
            </div>

            <div className="flex flex-row gap-1">
              <p>Start Date:</p>
              <input
                className="text-black"
                value={
                  investmentParameters.start
                    ? investmentParameters.start.toISOString().split("T")[0]
                    : ""
                }
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

          <div className="flex flex-col gap-2 my-4">
            <p>{investmentQuote}</p>
            <button
              className="py-1 w-36 bg-blue-600 hover:bg-blue-700 text-white rounded"
              onClick={fetchData}
            >
              Calculate
            </button>
          </div>
        </div>

        <div className="z-10 max-w-5xl w-full font-mono text-sm mx-0 mb-12 md:mx-12 md:mb-0">
          <p>
            This tool compares the performance of DVA and DCA investment
            strategies over a given period of time. You can adjust the
            investment amount, frequency, and period to see how each strategy
            performs under different conditions.
          </p>

          <h2 className="pt-4 pb-1 text-xl">What is DVA?</h2>
          <p>
            Dollar Value Averaging (DVA) is an investment strategy that involves
            investing a fixed amount of money at regular intervals. The idea is
            to buy more shares when prices are low and fewer shares when prices
            are high.
          </p>

          <h2 className="pt-4 pb-1 text-xl">What is DCA?</h2>
          <p>
            Dollar Cost Averaging (DCA) is an investment strategy that involves
            investing a fixed amount of money at regular intervals. The idea is
            to buy more shares when prices are low and fewer shares when prices
            are high.
          </p>
        </div>
      </div>

      <p className="text-red-500">{error && `${error.message}`}</p>

      {data && <div className="border-t-2 border-gray-600 my-8"></div>}

      <div className="flex flex-row gap-8 z-10 max-w-5xl w-full font-mono text-sm py-8">
        {data?.dva && (
          <InvestReport
            title="DVA"
            walletValue={data.dva?.walletValue}
            invested={data.dva?.invested}
            shares={data.dva?.shares}
            performance={data.dva?.performance}
            transactions={data.dva?.transactions}
          />
        )}

        {data?.dca && (
          <InvestReport
            title="DCA"
            walletValue={data.dca?.walletValue}
            invested={data.dca?.invested}
            shares={data.dca?.shares}
            performance={data.dca?.performance}
            transactions={data.dca?.transactions}
          />
        )}
      </div>
    </main>
  );
}
