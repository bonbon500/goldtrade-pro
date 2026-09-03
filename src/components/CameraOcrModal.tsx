import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Sparkles, Check, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface CameraOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWeightExtracted: (weight: number) => void;
}

// Built-in sample scale photos for instant field testing without webcam permission
const SAMPLE_SCALE_IMAGES = [
  {
    id: 'sample1',
    title: 'מאזניים דיגיטליים 24.85g',
    weight: 24.85,
    unit: 'g',
    // SVG graphic of a scale display showing 24.85
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><rect x="40" y="30" width="320" height="180" rx="16" fill="%23020617" stroke="%233b82f6" stroke-width="4"/><rect x="60" y="50" width="280" height="140" rx="8" fill="%230f172a"/><text x="200" y="140" font-family="monospace" font-size="52" font-weight="900" fill="%2338bdf8" text-anchor="middle">24.85 g</text><text x="320" y="175" font-family="sans-serif" font-size="14" fill="%2364748b" text-anchor="end">MAX 500g d=0.01g</text><rect x="100" y="230" width="200" height="40" rx="8" fill="%23334155"/><text x="200" y="255" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23e2e8f0" text-anchor="middle">GOLD SCALE 0.01g</text></svg>`,
  },
  {
    id: 'sample2',
    title: 'מאזניים דיגיטליים 42.10g',
    weight: 42.10,
    unit: 'g',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><rect x="40" y="30" width="320" height="180" rx="16" fill="%23020617" stroke="%23eab308" stroke-width="4"/><rect x="60" y="50" width="280" height="140" rx="8" fill="%230f172a"/><text x="200" y="140" font-family="monospace" font-size="52" font-weight="900" fill="%23facc15" text-anchor="middle">42.10 g</text><text x="320" y="175" font-family="sans-serif" font-size="14" fill="%2364748b" text-anchor="end">TARE READY</text><rect x="100" y="230" width="200" height="40" rx="8" fill="%23334155"/><text x="200" y="255" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23e2e8f0" text-anchor="middle font-mono">JEWELRY SCALE</text></svg>`,
  },
  {
    id: 'sample3',
    title: 'מאזניים דיגיטליים 108.50g',
    weight: 108.50,
    unit: 'g',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231e293b"/><rect x="40" y="30" width="320" height="180" rx="16" fill="%23020617" stroke="%2310b981" stroke-width="4"/><rect x="60" y="50" width="280" height="140" rx="8" fill="%230f172a"/><text x="200" y="140" font-family="monospace" font-size="48" font-weight="900" fill="%2334d399" text-anchor="middle">108.50 g</text><text x="320" y="175" font-family="sans-serif" font-size="14" fill="%2364748b" text-anchor="end">PRECISION 0.01</text><rect x="100" y="230" width="200" height="40" rx="8" fill="%23334155"/><text x="200" y="255" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23e2e8f0" text-anchor="middle">FIELD SCALE</text></svg>`,
  },
];

export const CameraOcrModal: React.FC<CameraOcrModalProps> = ({
  isOpen,
  onClose,
  onWeightExtracted,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedResult, setExtractedResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle File Upload from Camera / Photo Library
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
        processOcrImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process image with Gemini OCR backend
  const processOcrImage = async (imageDataUrl: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setExtractedResult(null);

    try {
      const response = await fetch('/api/ocr-scale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: imageDataUrl }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setExtractedResult(resData.data);
      } else {
        setErrorMsg(resData.error || 'שגיאה בזיהוי משקל התמונה');
      }
    } catch (err: any) {
      setErrorMsg('נכשל החיבור לשרת ה-OCR. אנא נסה שוב.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Select preset scale sample image
  const handleSelectSample = (sample: typeof SAMPLE_SCALE_IMAGES[0]) => {
    setSelectedImage(sample.dataUrl);
    // Simulate immediate OCR result for preset
    setIsProcessing(true);
    setTimeout(() => {
      setExtractedResult({
        weight: sample.weight,
        unit: sample.unit,
        confidence: 'high',
        rawText: `${sample.weight} ${sample.unit}`,
        notes: `זיהוי מדויק של תצוגת המאזניים הדיגיטליים: ${sample.weight}g`,
      });
      setIsProcessing(false);
    }, 600);
  };

  const handleApplyWeight = () => {
    if (extractedResult && extractedResult.weight) {
      onWeightExtracted(extractedResult.weight);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                סורק משקל מאזניים AI OCR
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">
                  Gemini Vision
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">ציין/צלם את מסך המאזניים לחילוץ משקל אוטומטי</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs text-slate-200">
          {/* Main Photo Upload Area */}
          <div className="border-2 border-dashed border-amber-500/30 rounded-2xl p-4 text-center bg-slate-950/60 relative">
            {selectedImage ? (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="תצוגת מאזניים"
                  className="max-h-48 mx-auto rounded-xl object-contain border border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setExtractedResult(null);
                  }}
                  className="absolute top-2 right-2 bg-slate-900/90 text-slate-300 p-1.5 rounded-lg border border-slate-700 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">צלם או העלה תמונה של מסך המאזניים</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    המערכת תפעיל זיהוי תמונה AI לחילוץ המספרים בלבד
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    id="btn-upload-scale-photo"
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>בחר תמונה / צלם במצלמה</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sample Scale Images for Instant Demo */}
          {!selectedImage && (
            <div>
              <span className="text-[11px] font-bold text-amber-300 block mb-2 uppercase tracking-wider">
                או נסה דוגמאות מאזניים לבדיקה מהירה בשטח:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_SCALE_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-2 rounded-xl text-center transition-all flex flex-col items-center gap-1"
                  >
                    <img src={sample.dataUrl} alt={sample.title} className="h-12 w-full object-cover rounded-lg" />
                    <span className="text-[10px] font-bold text-amber-400">{sample.weight}g</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* OCR Result Indicator */}
          {isProcessing && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center text-amber-300 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>מפעיל זיהוי OCR מול Gemini Vision API...</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-950/60 border border-red-800/60 rounded-xl p-3 text-red-300 text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {extractedResult && (
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4 stroke-[3]" />
                  משקל חולץ בהצלחה מהתמונה!
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  דיוק: {extractedResult.confidence || 'HIGH'}
                </span>
              </div>

              <div className="flex items-baseline justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-medium">ערך משקל שנמצא:</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {extractedResult.weight} גרם
                </span>
              </div>

              {extractedResult.notes && (
                <p className="text-[11px] text-slate-400 italic">
                  &quot;{extractedResult.notes}&quot;
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            ביטול
          </button>

          <button
            type="button"
            onClick={handleApplyWeight}
            disabled={!extractedResult || !extractedResult.weight}
            id="btn-apply-ocr-weight"
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>הזן משקל זה לשדה במחשבון</span>
          </button>
        </div>
      </div>
    </div>
  );
};
