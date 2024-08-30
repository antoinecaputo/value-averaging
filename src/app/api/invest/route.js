import { NextResponse } from "next/server";
import { dvaInvest } from "@/services/dva";
import { dcaInvest } from "@/services/dca";

export async function GET(request) {
  const investment = request.nextUrl.searchParams.get("investment");
  const investmentFrequency = request.nextUrl.searchParams.get(
    "investmentFrequency",
  );
  const investmentPeriod = request.nextUrl.searchParams.get("investmentPeriod");
  const index = request.nextUrl.searchParams.get("index");
  const start = request.nextUrl.searchParams.get("start");

  if (!investment || !investmentFrequency || !investmentPeriod || !index) {
    return Response.json({ message: "Bad request" }, { status: 400 });
  }

  try {
    const dva = dvaInvest({
      investment: Number(investment),
      investmentFrequency: Number(investmentFrequency),
      investmentPeriod: Number(investmentPeriod),
      index,
      startDate: start ? new Date(Number(start)) : null,
    });

    const dca = dcaInvest({
      investment: Number(investment),
      investmentFrequency: Number(investmentFrequency),
      investmentPeriod: Number(investmentPeriod),
      index,
      startDate: start ? new Date(Number(start)) : null,
    });

    return Response.json({
      dva: {
        walletValue: dva.walletValue.toFixed(2),
        invested: dva.invested.toFixed(2),
        shares: dva.shares,
        performance: dva.performance.toFixed(2),
        transactions: dva.transactions,
      },
      dca: {
        walletValue: dca.walletValue.toFixed(2),
        invested: dca.invested.toFixed(2),
        shares: dva.shares,
        performance: dca.performance.toFixed(2),
        transactions: dca.transactions,
      },
    });
  } catch (e) {
    console.error(e.message);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
