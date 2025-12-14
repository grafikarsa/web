'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { adminImportApi, StudentImportDryRunResponse, StudentImportResponse, StudentImportError } from '@/lib/api/admin';
import { cn } from '@/lib/utils';

export default function ImportStudentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dryRunResult, setDryRunResult] = useState<StudentImportDryRunResponse | null>(null);
  const [importResult, setImportResult] = useState<StudentImportResponse | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setDryRunResult(null);
      setImportResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const dryRunMutation = useMutation({
    mutationFn: (file: File) => adminImportApi.dryRunImport(file),
    onSuccess: (response) => {
      setDryRunResult(response.data as StudentImportDryRunResponse);
      toast.success('Validasi selesai');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memvalidasi file');
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => adminImportApi.importStudents(file, false),
    onSuccess: (response) => {
      setImportResult(response.data as StudentImportResponse);
      setDryRunResult(null);
      toast.success('Import selesai');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengimport data');
    },
  });

  const handleValidate = () => {
    if (file) {
      dryRunMutation.mutate(file);
    }
  };

  const handleImport = () => {
    if (file) {
      importMutation.mutate(file);
    }
  };

  const handleReset = () => {
    setFile(null);
    setDryRunResult(null);
    setImportResult(null);
  };

  const handleDownloadTemplate = () => {
    // Create CSV content directly
    const csvContent = `tingkat,kode_jurusan,rombel,nama_lengkap,nis
10,rpl,A,Budi Santoso,25327004990001
10,rpl,A,Siti Aminah,25327004990002
11,dkv,B,Ahmad Rizki,24327004990001`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_siswa.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Import Data Siswa</h1>
        <p className="text-muted-foreground">Upload file CSV atau XLSX untuk import data siswa secara massal</p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Format File</CardTitle>
          <CardDescription>File harus memiliki 5 kolom dengan urutan berikut:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-lg border p-3 text-center">
              <div className="text-sm font-medium">Kolom 1</div>
              <div className="text-xs text-muted-foreground">Tingkat</div>
              <div className="mt-1 text-xs">10, 11, atau 12</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-sm font-medium">Kolom 2</div>
              <div className="text-xs text-muted-foreground">Kode Jurusan</div>
              <div className="mt-1 text-xs">rpl, dkv, tkj, dll</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-sm font-medium">Kolom 3</div>
              <div className="text-xs text-muted-foreground">Rombel</div>
              <div className="mt-1 text-xs">A, B, C, dll</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-sm font-medium">Kolom 4</div>
              <div className="text-xs text-muted-foreground">Nama Lengkap</div>
              <div className="mt-1 text-xs">Budi Santoso</div>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-sm font-medium">Kolom 5</div>
              <div className="text-xs text-muted-foreground">NIS</div>
              <div className="mt-1 text-xs">25327004990242</div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download Template CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              {...getRootProps()}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              )}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm font-medium">
                {isDragActive ? 'Drop file di sini...' : 'Drag & drop file CSV/XLSX di sini'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">atau klik untuk memilih file (max 5MB)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {file && !dryRunResult && !importResult && (
            <div className="mt-4 flex gap-2">
              <Button onClick={handleValidate} disabled={dryRunMutation.isPending}>
                {dryRunMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Validasi File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dry Run Result */}
      {dryRunResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hasil Validasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">{dryRunResult.total_rows}</div>
                <div className="text-sm text-muted-foreground">Total Baris</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{dryRunResult.students_to_create}</div>
                <div className="text-sm text-muted-foreground">Siswa Valid</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{dryRunResult.validation_errors?.length ?? 0}</div>
                <div className="text-sm text-muted-foreground">Error</div>
              </div>
            </div>

            {dryRunResult.classes_to_create && dryRunResult.classes_to_create.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Kelas Baru</AlertTitle>
                <AlertDescription>
                  {dryRunResult.classes_to_create.length} kelas baru akan dibuat:
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dryRunResult.classes_to_create.map((cls, i) => (
                      <Badge key={i} variant="secondary">
                        {cls.nama}
                      </Badge>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {dryRunResult.validation_errors && dryRunResult.validation_errors.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium text-red-600">Error ({dryRunResult.validation_errors.length})</h4>
                <ScrollArea className="h-48 rounded-lg border">
                  <div className="p-4 space-y-2">
                    {dryRunResult.validation_errors.map((err, i) => (
                      <ErrorRow key={i} error={err} />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={importMutation.isPending || dryRunResult.students_to_create === 0}>
                {importMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="mr-2 h-4 w-4" />
                Import {dryRunResult.students_to_create} Siswa
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Import Selesai
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">{importResult.total_rows}</div>
                <div className="text-sm text-muted-foreground">Total Baris</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{importResult.created_classes}</div>
                <div className="text-sm text-muted-foreground">Kelas Dibuat</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{importResult.created_students}</div>
                <div className="text-sm text-muted-foreground">Siswa Dibuat</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{importResult.skipped}</div>
                <div className="text-sm text-muted-foreground">Dilewati</div>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div>
                <h4 className="mb-2 font-medium text-red-600">Error ({importResult.errors.length})</h4>
                <ScrollArea className="h-48 rounded-lg border">
                  <div className="p-4 space-y-2">
                    {importResult.errors.map((err, i) => (
                      <ErrorRow key={i} error={err} />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Kredensial Siswa</AlertTitle>
              <AlertDescription className="text-green-700">
                Setiap siswa dapat login dengan:
                <br />
                <strong>Username:</strong> NIS (contoh: 25327004990242)
                <br />
                <strong>Password:</strong> NIS (sama dengan username)
              </AlertDescription>
            </Alert>

            <Button onClick={handleReset}>Import Lagi</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ErrorRow({ error }: { error: StudentImportError }) {
  return (
    <div className="flex items-start gap-2 rounded bg-red-50 p-2 text-sm">
      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
      <div>
        <span className="font-medium">Baris {error.row}</span>
        {error.nis && <span className="text-muted-foreground"> (NIS: {error.nis})</span>}
        {error.nama && <span className="text-muted-foreground"> - {error.nama}</span>}
        <span className="text-red-600">: {error.error}</span>
      </div>
    </div>
  );
}
