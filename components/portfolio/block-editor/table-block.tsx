'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { TableBlockPayload } from '@/lib/types';

interface TableBlockEditorProps {
  payload: TableBlockPayload;
  isEditing: boolean;
  onSave: (payload: TableBlockPayload) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function TableBlockEditor({ payload, isEditing, onSave, onCancel, isSaving }: TableBlockEditorProps) {
  const [headers, setHeaders] = useState<string[]>(payload.headers);
  const [rows, setRows] = useState<string[][]>(payload.rows);

  if (!isEditing) {
    return (
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {payload.headers.map((header, i) => (
                <th key={i} className="px-4 py-2 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payload.rows.map((row, i) => (
              <tr key={i} className="border-t">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const updateHeader = (index: number, value: string) => {
    setHeaders((prev) => prev.map((h, i) => (i === index ? value : h)));
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    setRows((prev) =>
      prev.map((row, ri) => (ri === rowIndex ? row.map((cell, ci) => (ci === colIndex ? value : cell)) : row))
    );
  };

  const addColumn = () => {
    setHeaders((prev) => [...prev, `Kolom ${prev.length + 1}`]);
    setRows((prev) => prev.map((row) => [...row, '']));
  };

  const removeColumn = (index: number) => {
    if (headers.length <= 1) return;
    setHeaders((prev) => prev.filter((_, i) => i !== index));
    setRows((prev) => prev.map((row) => row.filter((_, i) => i !== index)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, new Array(headers.length).fill('')]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i} className="p-1">
                  <div className="flex gap-1">
                    <Input
                      value={header}
                      onChange={(e) => updateHeader(i, e.target.value)}
                      className="font-medium"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeColumn(i)} disabled={headers.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </th>
              ))}
              <th className="p-1">
                <Button variant="outline" size="icon" onClick={addColumn}>
                  <Plus className="h-4 w-4" />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="p-1">
                    <Input value={cell} onChange={(e) => updateCell(ri, ci, e.target.value)} />
                  </td>
                ))}
                <td className="p-1">
                  <Button variant="ghost" size="icon" onClick={() => removeRow(ri)} disabled={rows.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" size="sm" onClick={addRow}>
        <Plus className="mr-2 h-4 w-4" />
        Tambah Baris
      </Button>
      <div className="flex gap-2">
        <Button onClick={() => onSave({ headers, rows })} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </div>
  );
}
