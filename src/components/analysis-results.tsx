'use client';

import type { AnalysisResult, ExtractMedicalBillDataOutput } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  User, 
  Calendar, 
  Building, 
  DollarSign, 
  Hash, 
  Shield, 
  AlertTriangle, 
  ShieldCheck,
  RefreshCw,
  Stethoscope,
  TestTube2,
  Pill,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import React, { useState } from 'react';
import { Textarea } from './ui/textarea';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

const getFormattedTotal = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const InfoItem: React.FC<{ icon: React.ElementType; label: string; value?: string | number }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start justify-between py-3">
    <div className="flex items-center gap-4">
      <Icon className="w-5 h-5 text-muted-foreground" />
      <span className="font-medium text-foreground">{label}</span>
    </div>
    <span className="text-right text-muted-foreground max-w-[60%] truncate">{value || 'N/A'}</span>
  </div>
);

type LineItem = ExtractMedicalBillDataOutput['procedures'][0];

const LineItemTable: React.FC<{ items: LineItem[] }> = ({ items }) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground px-4 py-2">No items found in this category.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Description</TableHead>
          <TableHead className="w-[100px]">Code</TableHead>
          <TableHead className="text-right w-[120px]">Charge</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.description}</TableCell>
            <TableCell>{item.code || 'N/A'}</TableCell>
            <TableCell className="text-right">{getFormattedTotal(item.charge)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};


export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const { extractedData, errorAnalysis, appealLetter } = result;
  const { procedures, tests, medications } = extractedData;
  const hasErrors = errorAnalysis.errorsDetected;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (appealLetter) {
      navigator.clipboard.writeText(appealLetter);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500); // Reset after 2.5 seconds
    }
  };
  
  const defaultAccordionItems = [
    (procedures?.length > 0 ? 'procedures' : undefined),
    (tests?.length > 0 ? 'tests' : undefined),
    (medications?.length > 0 ? 'medications' : undefined),
  ].filter(Boolean) as string[];

  return (
    <div className="w-full max-w-6xl animate-in fade-in-50 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                Bill Summary
              </CardTitle>
              <CardDescription>Information extracted from your bill.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <InfoItem icon={User} label="Patient Name" value={extractedData.patientName} />
                <Separator />
                <InfoItem icon={Calendar} label="Bill Date" value={extractedData.billDate} />
                <Separator />
                <InfoItem icon={Building} label="Provider Name" value={extractedData.providerName} />
                <Separator />
                <InfoItem icon={Hash} label="Account Number" value={extractedData.accountNumber} />
                <Separator />
                <InfoItem icon={Shield} label="Insurance" value={extractedData.insuranceName} />
                <Separator />
                <InfoItem icon={DollarSign} label="Total Amount" value={getFormattedTotal(extractedData.totalAmount)} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Alert variant={hasErrors ? 'destructive' : 'default'} className={`${!hasErrors ? 'border-accent bg-accent/20' : ''}`}>
            {hasErrors ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-accent-foreground" />
            )}
            <AlertTitle className={`${!hasErrors ? 'text-accent-foreground' : ''}`}>
              {hasErrors ? 'Potential Issues Found' : 'No Obvious Errors Detected'}
            </AlertTitle>
            <AlertDescription className={`${!hasErrors ? 'text-accent-foreground/80' : ''}`}>
              {errorAnalysis.errorSummary}
            </AlertDescription>
          </Alert>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Itemized Breakdown</CardTitle>
              <CardDescription>Categorized charges from your bill.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" defaultValue={defaultAccordionItems} className="w-full">
                <AccordionItem value="procedures">
                  <AccordionTrigger className="text-base font-semibold">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      Procedures ({procedures?.length || 0})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <LineItemTable items={procedures} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tests">
                  <AccordionTrigger className="text-base font-semibold">
                    <div className="flex items-center gap-3">
                      <TestTube2 className="w-5 h-5 text-primary" />
                      Tests ({tests?.length || 0})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <LineItemTable items={tests} />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="medications">
                  <AccordionTrigger className="text-base font-semibold">
                     <div className="flex items-center gap-3">
                      <Pill className="w-5 h-5 text-primary" />
                       Medications ({medications?.length || 0})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <LineItemTable items={medications} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Detailed Analysis Report</CardTitle>
              <CardDescription>A transparent report from our AI auditor to promote accountability.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground bg-muted p-4 rounded-md overflow-x-auto">
                {errorAnalysis.detailedReport}
              </pre>
            </CardContent>
          </Card>

          {appealLetter && (
            <Card className="shadow-md animate-in fade-in-50 duration-500">
              <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className='flex items-center gap-2'>
                      <FileText />
                      Appeal Letter Assistant
                    </span>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        {isCopied ? <Check /> : <Copy />}
                        {isCopied ? 'Copied!' : 'Copy Text'}
                    </Button>
                  </CardTitle>
                  <CardDescription>Use this generated draft to contact your provider about the potential errors.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Textarea
                      readOnly
                      className="w-full h-96 font-mono text-sm bg-muted/50"
                      value={appealLetter}
                  />
              </CardContent>
            </Card>
          )}

        </div>
      </div>
       <div className="text-center mt-8">
          <Button onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Analyze Another Bill
          </Button>
       </div>
    </div>
  );
}
