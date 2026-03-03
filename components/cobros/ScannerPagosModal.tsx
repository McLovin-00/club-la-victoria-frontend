"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, ScanBarcode, X } from "lucide-react";
import { usePagoMultiple } from "@/hooks/api/cobros/usePagoMultiple";
import { MetodoPago } from "@/hooks/api/cobros/useRegistrarPago";

const STORAGE_KEY = "scanner-pagos-barcodes";
const BARCODE_REGEX = /^\d{2}-\d{4}-\d+$/;
const AUTO_SAVE_DELAY_MS = 150;

interface ScannerPagosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScannerPagosModal({ open, onOpenChange }: ScannerPagosModalProps) {
  const [barcodes, setBarcodes] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(MetodoPago.EFECTIVO);
  const inputRef = useRef<HTMLInputElement>(null);
  const barcodesRef = useRef<string[]>([]);
  const pagoMultiple = usePagoMultiple();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed)) {
          setBarcodes(parsed);
          barcodesRef.current = parsed;
        }
      }
    } catch {
      // Si hay error al parsear, ignorar
    }
  }, []);

  useEffect(() => {
    barcodesRef.current = barcodes;
  }, [barcodes]);

  const guardarEnStorage = useCallback((nuevos: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos));
    } catch {
      // Si hay error al guardar, ignorar
    }
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const agregarBarcode = useCallback(
    (barcodeCandidato: string) => {
      const nuevoBarcode = barcodeCandidato.trim();

      if (!BARCODE_REGEX.test(nuevoBarcode)) {
        return;
      }

      if (barcodesRef.current.includes(nuevoBarcode)) {
        setInputValue("");
        return;
      }

      const nuevos = [...barcodesRef.current, nuevoBarcode];
      barcodesRef.current = nuevos;
      setBarcodes(nuevos);
      guardarEnStorage(nuevos);
      setInputValue("");

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    },
    [guardarEnStorage]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const barcodeCandidato = inputValue.trim();
    if (!barcodeCandidato) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (BARCODE_REGEX.test(barcodeCandidato)) {
        agregarBarcode(barcodeCandidato);
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open, inputValue, agregarBarcode]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarBarcode(inputValue);
    }
  };

  const handleRemoveBarcode = (index: number) => {
    const nuevos = barcodes.filter((_, i) => i !== index);
    barcodesRef.current = nuevos;
    setBarcodes(nuevos);
    guardarEnStorage(nuevos);
  };

  const handleLimpiar = () => {
    barcodesRef.current = [];
    setBarcodes([]);
    guardarEnStorage([]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleProcesar = () => {
    if (barcodes.length === 0) return;

    pagoMultiple.mutate(
      { barcodes, metodoPago },
      {
        onSuccess: () => {
          barcodesRef.current = [];
          setBarcodes([]);
          guardarEnStorage([]);
          setInputValue("");
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanBarcode className="h-5 w-5" />
            Escáner de Pagos
          </DialogTitle>
          <DialogDescription>
            Escanee los códigos de barras de las cuotas. Los códigos se guardan
            automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="scanner-input">Código de barras</Label>
            <Input
              ref={inputRef}
              id="scanner-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Escanee o ingrese código (ej: 01-2026-123)"
              className="font-mono text-lg h-12"
              autoComplete="off"
            />
          </div>

          <div className="grid gap-2">
            <Label>Método de pago</Label>
            <Select value={metodoPago} onValueChange={(v) => setMetodoPago(v as MetodoPago)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MetodoPago.EFECTIVO}>Efectivo</SelectItem>
                <SelectItem value={MetodoPago.TRANSFERENCIA}>Transferencia</SelectItem>
                <SelectItem value={MetodoPago.TARJETA_DEBITO}>Tarjeta de Débito</SelectItem>
                <SelectItem value={MetodoPago.TARJETA_CREDITO}>Tarjeta de Crédito</SelectItem>
                <SelectItem value={MetodoPago.OTRO}>Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Códigos escaneados ({barcodes.length})</Label>
              {barcodes.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleLimpiar} className="text-red-600 hover:text-red-700">
                  <Trash2 className="mr-1 h-3 w-3" />
                  Limpiar todo
                </Button>
              )}
            </div>
            <ScrollArea className="h-[200px] rounded-md border p-2">
              {barcodes.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Escanee un código de barras para comenzar
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {barcodes.map((barcode, index) => (
                    <Badge key={`${barcode}-${index}`} variant="secondary" className="font-mono text-sm py-1 px-2">
                      {barcode}
                      <button
                        type="button"
                        onClick={() => handleRemoveBarcode(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <Button
            onClick={handleProcesar}
            disabled={barcodes.length === 0 || pagoMultiple.isPending}
            className="w-full"
          >
            {pagoMultiple.isPending
              ? "Procesando..."
              : `Procesar ${barcodes.length} pago${barcodes.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
