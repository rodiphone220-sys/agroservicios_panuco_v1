import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Save,
  FileSearch,
  X,
  ChevronRight,
  Info,
  Truck,
  Clock,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { toast } from 'sonner';
import { OCRInvoiceResult } from '../types';
import { cn } from '../lib/utils';
import { pendingImportStorage } from '../lib/localStorage';

const SYSTEM_PROMPT = `
Contexto del negocio:
Negocio de refacciones agrícolas e hidráulicas. Recibe facturas de múltiples proveedores con formatos diferentes (NACCISA, Farmer Parts, Tractopag, Summit Solutions, New Holland).
Tipos de documentos: Facturas CFDI 4.0, cotizaciones, confirmaciones de pedido, listas de refacciones.
Idioma: Español (México). Moneda: Mayormente MXN.

Objetivo:
Extraer automáticamente los datos clave de cualquier factura/imagen y estandarizar la información en formato JSON.

Reglas de procesamiento:
1. Identificar el tipo de documento (CFDI, cotización, pedido).
2. Extraer tablas de productos identificando columnas (Cantidad, Unidad, Código/No. Parte, Descripción, Precio Unitario, Importe).
3. Limpiar texto de errores OCR comunes.
4. Validar montos (suma de productos vs total).
5. Detectar moneda (MXN, USD).
6. Manejar variaciones de layout.

Formato de salida (JSON):
{
  "proveedor": { "nombre": "", "rfc": "", "folio": "", "fecha": "" },
  "cliente": { "nombre": "", "rfc": "" },
  "productos": [
    { "cantidad": 0, "unidad": "", "codigo": "", "descripcion": "", "precio_unitario": 0, "importe": 0 }
  ],
  "totales": { "subtotal": 0, "iva": 0, "total": 0 },
  "moneda": "MXN",
  "tipoDocumento": ""
}

Consideraciones especiales:
- Para CFDI: Buscar Emisor, Receptor, Folio, Fecha.
- Para cotizaciones: Buscar "Cotización", "Cliente", "Fecha".
- Para confirmaciones: Buscar "Confirmación de pedido", "Folio del Pedido".
- Si no hay precio unitario visible, marcarlo como 0.
`;

export const OCRInvoiceReader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRInvoiceResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
      toast.error('Formato no soportado', {
        description: 'Por favor sube una imagen (JPG, PNG) o un archivo PDF.'
      });
      return;
    }
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setResult(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const extractData = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT },
              { text: "Extrae los datos de este documento y devuélvelos estrictamente en el formato JSON solicitado." },
              {
                inlineData: {
                  data: await fileToBase64(file),
                  mimeType: file.type
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              proveedor: {
                type: Type.OBJECT,
                properties: {
                  nombre: { type: Type.STRING },
                  rfc: { type: Type.STRING },
                  folio: { type: Type.STRING },
                  fecha: { type: Type.STRING }
                }
              },
              cliente: {
                type: Type.OBJECT,
                properties: {
                  nombre: { type: Type.STRING },
                  rfc: { type: Type.STRING }
                }
              },
              productos: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    cantidad: { type: Type.NUMBER },
                    unidad: { type: Type.STRING },
                    codigo: { type: Type.STRING },
                    descripcion: { type: Type.STRING },
                    precio_unitario: { type: Type.NUMBER },
                    importe: { type: Type.NUMBER }
                  }
                }
              },
              totales: {
                type: Type.OBJECT,
                properties: {
                  subtotal: { type: Type.NUMBER },
                  iva: { type: Type.NUMBER },
                  total: { type: Type.NUMBER }
                }
              },
              moneda: { type: Type.STRING },
              tipoDocumento: { type: Type.STRING }
            }
          }
        }
      });

      const response = await model;
      const data = JSON.parse(response.text);
      setResult(data);
      toast.success('Información extraída correctamente');
    } catch (error) {
      console.error('Error extracting data:', error);
      toast.error('Error al procesar el documento', {
        description: 'No se pudo extraer la información. Intenta con una imagen más clara.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const updateField = (section: keyof OCRInvoiceResult, field: string, value: any) => {
    if (!result) return;
    setResult({
      ...result,
      [section]: typeof result[section] === 'object' && !Array.isArray(result[section])
        ? { ...result[section] as object, [field]: value }
        : value
    });
  };

  const updateProduct = (index: number, field: string, value: any) => {
    if (!result) return;
    const newProducts = [...result.productos];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setResult({ ...result, productos: newProducts });
  };

  const addProduct = () => {
    if (!result) return;
    setResult({
      ...result,
      productos: [
        ...result.productos,
        { cantidad: 0, unidad: '', codigo: '', descripcion: '', precio_unitario: 0, importe: 0 }
      ]
    });
  };

  const removeProduct = (index: number) => {
    if (!result) return;
    const newProducts = result.productos.filter((_, i) => i !== index);
    setResult({ ...result, productos: newProducts });
  };

  const copyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    toast.success('JSON copiado al portapapeles');
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura_${result.proveedor.folio || 'extraida'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveToInventory = async () => {
    if (!result) return;
    
    try {
      pendingImportStorage.add({
        id: `ocr-${Date.now()}`,
        ...result,
        timestamp: new Date().toISOString(),
        status: 'PENDING'
      });
      toast.success('Datos guardados en importaciones pendientes localmente');
    } catch (error) {
      toast.error('Error al guardar los datos');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lector OCR de Facturas</h1>
          <p className="text-gray-500">Extrae y estructura datos de tus facturas de proveedores automáticamente.</p>
        </div>
        <div className="flex gap-2">
          {result && (
            <>
              <button 
                onClick={copyJson}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Copy size={18} />
                Copiar JSON
              </button>
              <button 
                onClick={downloadJson}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Download size={18} />
                Descargar JSON
              </button>
              <button 
                onClick={saveToInventory}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                <Save size={18} />
                Importar a Stock
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Left Column: Upload & Preview */}
        <div className="flex flex-col gap-4 h-full">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer relative overflow-hidden",
              isDragging ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50 hover:bg-gray-50",
              previewUrl ? "p-0" : ""
            )}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf"
            />
            
            {previewUrl ? (
              <div className="w-full h-full relative group">
                {file?.type === 'application/pdf' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                    <FileText size={64} className="text-gray-400 mb-4" />
                    <p className="text-sm font-medium text-gray-600">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">Vista previa no disponible para PDF</p>
                  </div>
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white p-3 rounded-full shadow-xl">
                    <Upload size={24} className="text-primary" />
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreviewUrl(null);
                    setResult(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Sube tu factura</h3>
                <p className="text-sm text-gray-500 mt-1">Arrastra y suelta o haz clic para seleccionar</p>
                <div className="flex gap-2 justify-center mt-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">JPG</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">PNG</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase">PDF</span>
                </div>
              </div>
            )}
          </div>

          <button
            disabled={!file || isProcessing}
            onClick={extractData}
            className={cn(
              "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl",
              !file || isProcessing
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Procesando con IA...
              </>
            ) : (
              <>
                <FileSearch size={20} />
                Extraer Información
              </>
            )}
          </button>
        </div>

        {/* Right Column: Extracted Data */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col overflow-hidden h-full">
          {!result && !isProcessing && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <FileSearch size={40} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Sin datos extraídos</h3>
              <p className="text-sm max-w-xs mt-2">Sube una factura y presiona "Extraer Información" para ver los resultados aquí.</p>
            </div>
          )}

          {isProcessing && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileSearch size={32} className="text-primary animate-pulse" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Analizando documento...</h3>
              <p className="text-sm text-gray-500 mt-2">Estamos identificando proveedores, productos y montos.</p>
              <div className="mt-8 space-y-3 w-full max-w-xs">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 10, ease: "linear" }}
                    className="h-full bg-primary"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>OCR</span>
                  <span>Parsing</span>
                  <span>Validating</span>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Truck size={12} /> Proveedor
                  </h4>
                  <div className="space-y-2">
                    <input 
                      type="text"
                      value={result.proveedor.nombre}
                      onChange={(e) => updateField('proveedor', 'nombre', e.target.value)}
                      className="w-full text-lg font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-gray-300"
                      placeholder="Nombre del proveedor"
                    />
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[9px] text-gray-400 uppercase font-bold">RFC</label>
                        <input 
                          type="text"
                          value={result.proveedor.rfc}
                          onChange={(e) => updateField('proveedor', 'rfc', e.target.value)}
                          className="w-full text-xs font-medium text-gray-600 bg-transparent border-none focus:ring-0 p-0"
                          placeholder="RFC"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] text-gray-400 uppercase font-bold">Folio</label>
                        <input 
                          type="text"
                          value={result.proveedor.folio}
                          onChange={(e) => updateField('proveedor', 'folio', e.target.value)}
                          className="w-full text-xs font-medium text-gray-600 bg-transparent border-none focus:ring-0 p-0"
                          placeholder="Folio"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> Detalles
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[9px] text-gray-400 uppercase font-bold">Fecha</label>
                      <input 
                        type="text"
                        value={result.proveedor.fecha}
                        onChange={(e) => updateField('proveedor', 'fecha', e.target.value)}
                        className="w-full text-sm font-bold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                        placeholder="Fecha"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[9px] text-gray-400 uppercase font-bold">Tipo</label>
                        <input 
                          type="text"
                          value={result.tipoDocumento}
                          onChange={(e) => updateField('tipoDocumento', '', e.target.value)}
                          className="w-full text-xs font-medium text-gray-600 bg-transparent border-none focus:ring-0 p-0"
                          placeholder="Tipo de documento"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[9px] text-gray-400 uppercase font-bold">Moneda</label>
                        <input 
                          type="text"
                          value={result.moneda}
                          onChange={(e) => updateField('moneda', '', e.target.value)}
                          className="w-full text-xs font-medium text-gray-600 bg-transparent border-none focus:ring-0 p-0"
                          placeholder="Moneda"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Package size={12} /> Detalle de Productos
                  </h4>
                  <button 
                    onClick={addProduct}
                    className="flex items-center gap-1 text-[10px] font-bold text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Plus size={12} /> Agregar Producto
                  </button>
                </div>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-3 py-2 font-bold text-gray-400 uppercase">Cant</th>
                        <th className="px-3 py-2 font-bold text-gray-400 uppercase">Código</th>
                        <th className="px-3 py-2 font-bold text-gray-400 uppercase">Descripción</th>
                        <th className="px-3 py-2 font-bold text-gray-400 uppercase text-right">P. Unit</th>
                        <th className="px-3 py-2 font-bold text-gray-400 uppercase text-right">Total</th>
                        <th className="px-2 py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {result.productos.map((prod, idx) => (
                        <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="px-3 py-2">
                            <input 
                              type="number"
                              value={prod.cantidad}
                              onChange={(e) => updateProduct(idx, 'cantidad', parseFloat(e.target.value))}
                              className="w-12 bg-transparent border-none focus:ring-0 p-0 font-medium"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input 
                              type="text"
                              value={prod.codigo}
                              onChange={(e) => updateProduct(idx, 'codigo', e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium"
                              placeholder="Código"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input 
                              type="text"
                              value={prod.descripcion}
                              onChange={(e) => updateProduct(idx, 'descripcion', e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium"
                              placeholder="Descripción"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input 
                              type="number"
                              value={prod.precio_unitario}
                              onChange={(e) => updateProduct(idx, 'precio_unitario', parseFloat(e.target.value))}
                              className="w-20 bg-transparent border-none focus:ring-0 p-0 font-medium text-right"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input 
                              type="number"
                              value={prod.importe}
                              onChange={(e) => updateProduct(idx, 'importe', parseFloat(e.target.value))}
                              className="w-20 bg-transparent border-none focus:ring-0 p-0 font-bold text-right"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <button 
                              onClick={() => removeProduct(idx)}
                              className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <div className="w-64 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">Subtotal</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">$</span>
                      <input 
                        type="number"
                        value={result.totales.subtotal}
                        onChange={(e) => updateField('totales', 'subtotal', parseFloat(e.target.value))}
                        className="w-24 bg-transparent border-none focus:ring-0 p-0 text-right text-sm font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-medium">IVA (16%)</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-400">$</span>
                      <input 
                        type="number"
                        value={result.totales.iva}
                        onChange={(e) => updateField('totales', 'iva', parseFloat(e.target.value))}
                        className="w-24 bg-transparent border-none focus:ring-0 p-0 text-right text-sm font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className="text-sm font-bold text-gray-900">Total</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-primary">$</span>
                      <input 
                        type="number"
                        value={result.totales.total}
                        onChange={(e) => updateField('totales', 'total', parseFloat(e.target.value))}
                        className="w-32 bg-transparent border-none focus:ring-0 p-0 text-right text-xl font-black text-primary"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl mt-4">
                    <Info size={14} className="text-blue-500 shrink-0" />
                    <p className="text-[10px] text-blue-700 leading-tight">
                      Verifica que los montos coincidan con el documento original antes de importar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
