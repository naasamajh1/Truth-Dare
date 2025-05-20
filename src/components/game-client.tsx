
"use client";

import type { TruthDareInput } from "@/ai/flows/generate-truth-dare";
import { generateTruthDare } from "@/ai/flows/generate-truth-dare";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Brain, Loader2, SparklesIcon, WandSparkles } from "lucide-react";
import { useState, useEffect } from "react";

const MAX_PROMPT_HISTORY_LENGTH = 10;

export function GameClient() {
  const [promptType, setPromptType] = useState<"truth" | "dare" | null>(null);
  const [sliderDifficulty, setSliderDifficulty] = useState<number>(1);
  const [is18Plus, setIs18Plus] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gameRound, setGameRound] = useState<number>(0);
  const [promptKey, setPromptKey] = useState<number>(0); // For re-triggering animation
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const handleSelectType = async (type: "truth" | "dare") => {
    setPromptType(type);
    setIsLoading(true);
    setCurrentPrompt(null); // Clear previous prompt

    // Progressive intensity: effectiveDifficulty increases slightly with each round
    // based on sliderDifficulty and gameRound.
    const effectiveDifficulty = Math.min(
      10,
      Math.round(sliderDifficulty + gameRound * 0.1)
    );

    const input: TruthDareInput = {
      type,
      difficulty: effectiveDifficulty,
      maturity: is18Plus ? "18+" : "general",
      promptHistory: promptHistory,
    };

    try {
      const result = await generateTruthDare(input);
      setCurrentPrompt(result.prompt);
      setGameRound((prev) => prev + 1);
      setPromptKey(prev => prev + 1); // Update key to re-trigger animation
      
      // Update prompt history
      setPromptHistory(prevHistory => {
        const newHistory = [result.prompt, ...prevHistory];
        return newHistory.slice(0, MAX_PROMPT_HISTORY_LENGTH); // Keep only the last N prompts
      });

    } catch (error) {
      console.error("Error generating prompt:", error);
      setCurrentPrompt(
        "Oops! Couldn't summon a revelation. Try again perhaps?"
      );
      setPromptKey(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-2xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="inline-flex justify-center items-center mb-2">
          <WandSparkles className="h-10 w-10 mr-2 text-primary" />
          <CardTitle className="text-4xl font-bold tracking-tight">
            Risky Play
          </CardTitle>
        </div>
        <CardDescription className="text-lg">
          How far will you venture into the unknown?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="min-h-[120px] flex items-center justify-center text-center p-6 bg-muted/50 rounded-lg shadow-inner">
          {isLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : currentPrompt ? (
            <p key={promptKey} className="text-xl md:text-2xl font-medium text-foreground animate-reveal">
              {currentPrompt}
            </p>
          ) : (
            <p className="text-muted-foreground text-lg">
              Choose Truth or Dare to begin!
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            className="py-8 text-xl font-semibold"
            onClick={() => handleSelectType("truth")}
            disabled={isLoading}
            aria-label="Select Truth"
          >
            <Brain className="mr-2 h-6 w-6" />
            Truth
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="py-8 text-xl font-semibold"
            onClick={() => handleSelectType("dare")}
            disabled={isLoading}
            aria-label="Select Dare"
          >
            <SparklesIcon className="mr-2 h-6 w-6" />
            Dare
          </Button>
        </div>

        <div className="space-y-6 p-4 border rounded-lg shadow-sm bg-background/70">
          <div className="space-y-3">
            <Label htmlFor="difficulty" className="text-base font-medium">
              Difficulty Level: <span className="font-bold text-primary">{sliderDifficulty}</span>
            </Label>
            <Slider
              id="difficulty"
              min={1}
              max={10}
              step={1}
              value={[sliderDifficulty]}
              onValueChange={(value) => setSliderDifficulty(value[0])}
              disabled={isLoading}
              aria-label={`Difficulty level ${sliderDifficulty} of 10`}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="maturity" className="text-base font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-accent"><path d="M10 22v-8M7 22v-2M10 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M10 6V4"/><path d="M14 10h2M14 14h4M4 14h4M7 4h10v2H7Z"/><path d="m18 14 2-2-2-2"/></svg>
              18+ Content
            </Label>
            <Switch
              id="maturity"
              checked={is18Plus}
              onCheckedChange={setIs18Plus}
              disabled={isLoading}
              aria-label="Toggle 18+ content"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-center block">
        <p className="text-xs text-muted-foreground">
          Round {gameRound + 1}. Play responsibly.
        </p>
      </CardFooter>
    </Card>
  );
}
