"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProgressSteps } from "@/components/progress-step";
import { TransferLog } from "@/components/transfer-log";
import { Timer } from "@/components/timer";
import { useCrossChainTransfer } from "@/hooks/use-cross-chain-transfer";
import { SupportedChainId } from "@/lib/chains";

export function RebalancingDemo() {
  const { currentStep, logs, error, executeRebalancing, reset, getBalance } =
    useCrossChainTransfer();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [showFinalTime, setShowFinalTime] = useState(false);

  // Dynamic liquidity data based on actual balances
  const [ethBalance, setEthBalance] = useState("0.00");
  const [arcBalance, setArcBalance] = useState("0.00");
  const [arcDemand, setArcDemand] = useState("0.00");
  const [ethExcess, setEthExcess] = useState("0.00");
  const [rebalanceAmount, setRebalanceAmount] = useState("0.00");
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Fetch balances function
  const fetchBalances = async () => {
    try {
      setIsLoadingBalances(true);
      setBalanceError(null);
      const [ethBal, arcBal] = await Promise.all([
        getBalance(SupportedChainId.ETH_SEPOLIA),
        getBalance(SupportedChainId.ARC_TESTNET),
      ]);

      setEthBalance(ethBal);
      setArcBalance(arcBal);

      // Calculate rebalancing metrics
      const ethBalNum = parseFloat(ethBal);
      const arcBalNum = parseFloat(arcBal);

      // Use 50% of Ethereum balance as excess available for rebalancing
      const excess = (ethBalNum * 0.5).toFixed(2);
      setEthExcess(excess);

      // Simulated demand on Arc = current balance + what we can transfer
      const demand = (arcBalNum + parseFloat(excess)).toFixed(2);
      setArcDemand(demand);

      // Rebalance amount = 50% of Ethereum balance
      setRebalanceAmount(excess);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setBalanceError(
        error instanceof Error
          ? error.message
          : "Failed to fetch balances. Please check your network connection and try again."
      );
      setEthBalance("0.00");
      setArcBalance("0.00");
      setEthExcess("0.00");
      setArcDemand("0.00");
      setRebalanceAmount("0.00");
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Fetch balances on mount
  useEffect(() => {
    fetchBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleStartRebalancing = async () => {
    setIsRebalancing(true);
    setShowFinalTime(false);
    setElapsedSeconds(0);
    try {
      await executeRebalancing(
        SupportedChainId.ETH_SEPOLIA,
        SupportedChainId.ARC_TESTNET,
        rebalanceAmount
      );
    } catch (error) {
      console.error("Rebalancing failed:", error);
    } finally {
      setIsRebalancing(false);
      setShowFinalTime(true);
    }
  };

  const handleReset = () => {
    reset();
    setIsRebalancing(false);
    setShowFinalTime(false);
    setElapsedSeconds(0);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          CCTP Elastic Liquidity Rebalancing
        </CardTitle>
        <p className="text-sm text-center text-muted-foreground mt-2">
          Automated capital rebalancing from Ethereum to Arc using Circle&apos;s CCTP
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoadingBalances ? (
          <div className="text-center py-8">
            <div className="text-sm text-muted-foreground">
              Loading wallet balances...
            </div>
          </div>
        ) : balanceError ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-sm text-red-600">
              {balanceError}
            </div>
            <Button onClick={fetchBalances} variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Current Balances */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-4 pb-4">
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-500">
                      Current Balance
                    </div>
                    <div className="text-sm font-medium text-gray-700 mt-1">
                      Arc Testnet
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-1">
                      {arcBalance} USDC
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-4 pb-4">
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-500">
                      Current Balance
                    </div>
                    <div className="text-sm font-medium text-gray-700 mt-1">
                      Ethereum Sepolia
                    </div>
                    <div className="text-lg font-bold text-gray-900 mt-1">
                      {ethBalance} USDC
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Liquidity Status */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-orange-700">
                      Arc Testnet
                    </div>
                    <div className="text-2xl font-bold text-orange-900 mt-2">
                      {arcDemand} USDC
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      Simulated Demand
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-700">
                      Ethereum Sepolia
                    </div>
                    <div className="text-2xl font-bold text-blue-900 mt-2">
                      {ethExcess} USDC
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Available to Rebalance (50%)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {!isLoadingBalances && (
          <>
            {/* Rebalancing Amount */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-sm font-medium text-green-700">
                    Rebalancing Amount
                  </div>
                  <div className="text-3xl font-bold text-green-900 mt-2">
                    {rebalanceAmount} USDC
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Ethereum Sepolia → Arc Testnet
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <div className="text-center">
              {showFinalTime ? (
                <div className="text-2xl font-mono">
                  <span>
                    {Math.floor(elapsedSeconds / 60)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                  :
                  <span>{(elapsedSeconds % 60).toString().padStart(2, "0")}</span>
                </div>
              ) : (
                <Timer
                  isRunning={isRebalancing}
                  initialSeconds={elapsedSeconds}
                  onTick={setElapsedSeconds}
                />
              )}
            </div>

            {/* Progress Steps */}
            <ProgressSteps currentStep={currentStep} />

            {/* Transfer Log */}
            <TransferLog logs={logs} />

            {/* Error Display */}
            {error && <div className="text-red-500 text-center">{error}</div>}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleStartRebalancing}
                disabled={
                  isRebalancing ||
                  currentStep === "completed" ||
                  parseFloat(rebalanceAmount) <= 0
                }
                size="lg"
              >
                {currentStep === "completed"
                  ? "Rebalancing Complete"
                  : parseFloat(rebalanceAmount) <= 0
                  ? "Insufficient Balance on Ethereum"
                  : "Start Automatic Rebalancing"}
              </Button>
              {(currentStep === "completed" || currentStep === "error") && (
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              )}
            </div>
          </>
        )}

        {/* Flow Description */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-sm space-y-2">
              <div className="font-semibold mb-3">Rebalancing Flow:</div>
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs bg-gray-200 px-1.5 py-0.5 rounded">1</span>
                  <span>Demand Spike: USDC liquidity demand spikes on Arc</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs bg-gray-200 px-1.5 py-0.5 rounded">2</span>
                  <span>Identify Excess: Excess USDC identified on Ethereum (Sepolia)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs bg-gray-200 px-1.5 py-0.5 rounded">3</span>
                  <span>Burn & Attest: USDC burned on Ethereum via CCTP, attestation validated by Circle</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs bg-gray-200 px-1.5 py-0.5 rounded">4</span>
                  <span>Mint: Native USDC minted on Arc, capital successfully rebalanced</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
