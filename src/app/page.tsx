'use client';

import { useState, useTransition } from 'react';
import { analyzeBillAction } from '@/app/actions';
import type { AnalysisResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { BillUpload } from '@/components/bill-upload';
import { AnalysisResults } from '@/components/analysis-results';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw } from 'lucide-react';

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing your bill...');

  const { toast } = useToast();

  const handleAnalysis = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    startTransition(() => {
      setProgress(0);
      setLoadingMessage('Uploading and extracting data...');
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          if (prev > 30 && prev < 70) setLoadingMessage('Checking for errors...');
          return prev + 5;
        });
      }, 400);

      analyzeBillAction(formData)
        .then(analysisResult => {
          clearInterval(progressInterval);
          setProgress(100);
          if (analysisResult.error) {
            toast({
              variant: 'destructive',
              title: 'Analysis Error',
              description: analysisResult.error,
            });
            setResult(null);
          } else if (analysisResult.data) {
            setResult(analysisResult.data);
          }
        })
        .catch(err => {
          clearInterval(progressInterval);
          setProgress(100);
          toast({
            variant: 'destructive',
            title: 'An Unexpected Error Occurred',
            description: err.message || 'Please try again later.',
          });
          setResult(null);
        });
    });
  };

  const resetState = () => {
    setResult(null);
  };

  const renderContent = () => {
    if (isPending) {
      return (
        <div className="w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">{loadingMessage}</h2>
          <Progress value={progress} className="w-full mb-4" />
          <p className="text-muted-foreground animate-pulse">{Math.round(progress)}% complete</p>
        </div>
      );
    }
    if (result) {
      return <AnalysisResults result={result} onReset={resetState} />;
    }
    return <BillUpload onUpload={handleAnalysis} isPending={isPending} />;
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            BillSift
          </h1>
        </div>
        {result && (
          <Button variant="ghost" size="sm" onClick={resetState}>
             <RefreshCw className="mr-2 h-4 w-4" />
            Analyze New Bill
          </Button>
        )}
      </header>
      <main className="flex-grow flex items-center justify-center w-full">
        {renderContent()}
      </main>
      <footer className="w-full max-w-5xl mx-auto text-center mt-8 text-muted-foreground text-sm">
        <p>Promoting billing transparency and accountability. Your data is private and secure.</p>
        <p>&copy; {new Date().getFullYear()} BillSift. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
