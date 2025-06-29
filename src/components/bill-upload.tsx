'use client';

import { useState, useCallback, type DragEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Loader2 } from 'lucide-react';

interface BillUploadProps {
  onUpload: (file: File) => void;
  isPending: boolean;
}

export function BillUpload({ onUpload, isPending }: BillUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileValidation = (file: File | null) => {
    if (!file) {
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPG, PNG, WEBP or PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('File is too large. Please upload a file under 5MB.');
      return;
    }
    setError(null);
    onUpload(file);
  };

  const onDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFileValidation(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  }, [onUpload]);

  const onDragActivity = (event: DragEvent<HTMLDivElement>, isOver: boolean) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(isOver);
  };

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Analyze Your Medical Bill</CardTitle>
        <CardDescription>Get a clear, transparent analysis of your medical bill. We'll check for duplicate charges and potential overbilling.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div
          onDrop={onDrop}
          onDragOver={e => onDragActivity(e, true)}
          onDragEnter={e => onDragActivity(e, true)}
          onDragLeave={e => onDragActivity(e, false)}
          className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
            isDragging ? 'border-primary bg-secondary' : 'border-border hover:border-primary/50'
          }`}
        >
          <input
            id="file-upload"
            type="file"
            className="sr-only"
            onChange={(e) => handleFileValidation(e.target.files ? e.target.files[0] : null)}
            accept="image/jpeg,image/png,image/webp,application/pdf"
            disabled={isPending}
          />
          <label htmlFor="file-upload" className="flex flex-col items-center text-center cursor-pointer">
            <FileUp className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-semibold text-foreground">
              {isDragging ? 'Drop it here!' : 'Drag & drop or click to upload'}
            </span>
            <span className="text-sm text-muted-foreground mt-1">PDF, PNG, JPG, WEBP up to 5MB</span>
          </label>
        </div>
        {error && (
            <p className="text-destructive text-sm mt-4 text-center">{error}</p>
        )}
        <Button 
          asChild 
          className="w-full mt-6"
          disabled={isPending}
        >
          <label htmlFor="file-upload" className="cursor-pointer">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Select Bill'
            )}
          </label>
        </Button>
      </CardContent>
    </Card>
  );
}
