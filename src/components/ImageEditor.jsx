"use client";
import React, { useRef, useState, useEffect } from 'react';
import { 
  X, Move, CheckCircle, FileText, Maximize2, Minimize2, 
  RotateCw, Sliders, LayoutGrid, AlignCenter, FlipHorizontal, FlipVertical, 
  RefreshCw, Printer, RotateCcw, ShieldAlert, Sparkles, Image as ImageIcon
} from 'lucide-react';

export default function CanvaPrintStudioModal({ imageUrl, onClose, onSave }) {
  const a4PageRef = useRef(null);
  const [loading, setLoading] = useState(false);
  
  // Layout States
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 150, height: 150 });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);

  // Drag & Resize Interactive States
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeDir, setResizeDir] = useState('');
  const [initialResizeState, setInitialResizeState] = useState(null);

  // Safe Margin for Printing
  const PRINT_MARGIN = 15; 

  // Initialize Image aspect ratio automatically
  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      const ratio = img.width / img.height;
      setAspectRatio(ratio);
      const defaultWidth = 160; 
      setSize({ width: defaultWidth, height: defaultWidth / ratio });
      setPosition({ x: PRINT_MARGIN, y: PRINT_MARGIN });
    };
  }, [imageUrl]);

  // --- Reset to Default ---
  const handleReset = () => {
    const defaultWidth = 160;
    setSize({ width: defaultWidth, height: defaultWidth / aspectRatio });
    setPosition({ x: PRINT_MARGIN, y: PRINT_MARGIN });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  // --- Boundary Validation (Roko image ko bahar jaane se) ---
  const clampPosition = (x, y, w, h) => {
    if (!a4PageRef.current) return { x, y };
    const a4W = a4PageRef.current.offsetWidth;
    const a4H = a4PageRef.current.offsetHeight;
    
    return {
      x: Math.max(PRINT_MARGIN, Math.min(x, a4W - w - PRINT_MARGIN)),
      y: Math.max(PRINT_MARGIN, Math.min(y, a4H - h - PRINT_MARGIN))
    };
  };

  // --- Drag & Drop Handler ---
  const handleDragStart = (e) => {
    if (isResizing) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.preventDefault();
  };

  // --- Resize Handles Handler ---
  const handleResizeStart = (dir, e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeDir(dir);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialResizeState({ x: position.x, y: position.y, w: size.width, h: size.height });
  };

  // --- Global Mouse Move ---
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!a4PageRef.current) return;
      
      if (isDragging) {
        let nextX = e.clientX - dragStart.x;
        let nextY = e.clientY - dragStart.y;
        
        // Apply Boundary Lock
        const clamped = clampPosition(nextX, nextY, size.width, size.height);
        setPosition(clamped);
      }
      
      if (isResizing && initialResizeState) {
        const deltaX = e.clientX - dragStart.x;
        let newWidth = initialResizeState.w;
        let newHeight = initialResizeState.h;
        let newX = initialResizeState.x;
        let newY = initialResizeState.y;

        const a4W = a4PageRef.current.offsetWidth;

        if (resizeDir === 'se') {
          // Check right border limit
          newWidth = Math.max(40, Math.min(initialResizeState.w + deltaX, a4W - initialResizeState.x - PRINT_MARGIN));
          newHeight = newWidth / aspectRatio;
        } else if (resizeDir === 'sw') {
          // Check left border limit
          let possibleWidth = initialResizeState.w - deltaX;
          if (initialResizeState.x + (initialResizeState.w - possibleWidth) < PRINT_MARGIN) {
            possibleWidth = initialResizeState.w + (initialResizeState.x - PRINT_MARGIN);
          }
          newWidth = Math.max(40, possibleWidth);
          newHeight = newWidth / aspectRatio;
          newX = initialResizeState.x + (initialResizeState.w - newWidth);
        }

        // Apply height boundary check too
        const a4H = a4PageRef.current.offsetHeight;
        if (newY + newHeight > a4H - PRINT_MARGIN) {
          newHeight = a4H - newY - PRINT_MARGIN;
          newWidth = newHeight * aspectRatio;
          if (resizeDir === 'sw') {
            newX = initialResizeState.x + (initialResizeState.w - newWidth);
          }
        }

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, isResizing, dragStart, initialResizeState, resizeDir, aspectRatio, size]);

  // --- Quick Presets ---
  const applyPreset = (type) => {
    const a4 = a4PageRef.current;
    if (!a4) return;
    
    const a4W = a4.offsetWidth;
    const a4H = a4.offsetHeight;

    switch(type) {
      case 'passport':
        const passW = 120; 
        const passH = passW / aspectRatio;
        setSize({ width: passW, height: passH });
        setPosition(clampPosition((a4W - passW) / 2, PRINT_MARGIN, passW, passH));
        break;
      case 'center':
        setPosition(clampPosition((a4W - size.width) / 2, (a4H - size.height) / 2, size.width, size.height));
        break;
      case 'full':
        const fullW = a4W - (PRINT_MARGIN * 2);
        const fullH = fullW / aspectRatio;
        setSize({ width: fullW, height: fullH });
        setPosition({ x: PRINT_MARGIN, y: PRINT_MARGIN });
        break;
      default:
        break;
    }
  };

  // --- Final A4 High Quality Compilation & Direct Print ---
  const handleCompileAndPrint = () => {
    setLoading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 2480; // 300 DPI A4 Width
    canvas.height = 3508; // 300 DPI A4 Height
    const ctx = canvas.getContext('2d');

    // Fill White A4 Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const a4Dom = a4PageRef.current;
      const scaleFactor = canvas.width / a4Dom.offsetWidth;

      const finalX = position.x * scaleFactor;
      const finalY = position.y * scaleFactor;
      const finalW = size.width * scaleFactor;
      const finalH = size.height * scaleFactor;

      ctx.save();
      ctx.translate(finalX + finalW / 2, finalY + finalH / 2);
      ctx.rotate((rotation * Math.PI) / 100);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -finalW / 2, -finalH / 2, finalW, finalH);
      ctx.restore();

      canvas.toBlob((blob) => {
        const compiledUrl = URL.createObjectURL(blob);
        onSave(compiledUrl); // Will trigger print in parent Dashboard
        setLoading(false);
      }, 'application/pdf'); // We save as PDF for flawless printing
    };
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/90 backdrop-blur-sm animate-in fade-in duration-200 p-2 sm:p-6 text-slate-800">
      <div className="w-full max-w-6xl h-[95vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 relative">
        
        {/* --- TOP BRAND NAV BAR --- */}
        <div className="h-16 bg-gradient-to-r from-slate-900 to-indigo-900 px-6 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg tracking-tight">Smart Print Layout Studio</h3>
              <p className="text-xs text-indigo-200 font-medium">Design & Print perfectly in A4</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-red-500/80 hover:text-white text-indigo-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- MAIN STUDIO WORKSPACE --- */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          
          {/* 🛠️ LEFT SIDEBAR (Premium Controls) */}
          <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col p-5 overflow-y-auto space-y-7 z-10 shadow-lg">
            
            {/* Quick Actions & Reset */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleReset} className="col-span-2 p-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 shadow-sm">
                <RotateCcw className="w-4 h-4" /> Reset to Default
              </button>
            </div>

            {/* Smart Presets */}
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-indigo-400" /> Auto Presets
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => applyPreset('passport')} className="p-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl text-xs font-bold text-slate-700 flex flex-col items-center gap-2 border border-slate-100 transition-all">
                  <ImageIcon className="w-5 h-5 text-indigo-500" /> Passport Size
                </button>
                <button onClick={() => applyPreset('center')} className="p-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl text-xs font-bold text-slate-700 flex flex-col items-center gap-2 border border-slate-100 transition-all">
                  <AlignCenter className="w-5 h-5 text-indigo-500" /> Center Page
                </button>
                <button onClick={() => applyPreset('full')} className="col-span-2 p-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 border border-slate-100 transition-all">
                  <Maximize2 className="w-4 h-4 text-indigo-500" /> Stretch Full Width
                </button>
              </div>
            </div>

            {/* Transform Scale */}
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-500" /> Resize Image
              </h4>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs text-slate-500 mb-3 font-bold">
                  <span>Width</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{Math.round(size.width)}px</span>
                </div>
                <input 
                  type="range" min="50" max="380" 
                  value={size.width} 
                  onChange={(e) => {
                    const w = parseInt(e.target.value);
                    setSize({ width: w, height: w / aspectRatio });
                  }}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Mirror Flips */}
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <RotateCw className="w-4 h-4 text-orange-400" /> Flips & Rotation
              </h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button onClick={() => setFlipH(!flipH)} className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${flipH ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                  <FlipHorizontal className="w-4 h-4" /> Flip Horiz
                </button>
                <button onClick={() => setFlipV(!flipV)} className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${flipV ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                  <FlipVertical className="w-4 h-4" /> Flip Vert
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                  <button onClick={() => setRotation(prev => (prev + 45) % 360)} className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors shadow-md">
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center">
                    <input 
                      type="range" min="0" max="360" value={rotation} 
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    />
                  </div>
              </div>
            </div>

          </div>

          {/* 🎨 LIGHT CANVAS BOARD (A4 Paper Mockup) */}
          <div className="flex-1 bg-slate-200 p-4 md:p-8 flex items-center justify-center relative overflow-auto custom-scrollbar bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
            
            <div 
              ref={a4PageRef}
              className="bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] relative select-none transition-shadow rounded-sm"
              style={{ width: '420px', aspectRatio: '1 / 1.414' }}
            >
              {/* Safe Print Margin Indicator */}
              <div 
                className="absolute border border-dashed border-red-300 pointer-events-none rounded-sm"
                style={{ top: PRINT_MARGIN, left: PRINT_MARGIN, right: PRINT_MARGIN, bottom: PRINT_MARGIN }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-red-50 text-red-500 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-red-100">
                  <ShieldAlert className="w-3 h-3" /> Safe Print Area
                </div>
              </div>
              
              {/* 🌟 Dynamic Movable Image Layer */}
              <div
                onPointerDown={handleDragStart}
                style={{
                  position: 'absolute',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: `${size.width}px`,
                  height: `${size.height}px`,
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  zIndex: 20
                }}
                className="group shadow-sm hover:shadow-md transition-shadow"
              >
                <img 
                  src={imageUrl} 
                  alt="Print Element" 
                  className="w-full h-full object-contain pointer-events-none select-none"
                />

                {/* Canva Style Selection Bounding Box */}
                <div className="absolute inset-0 border-[2.5px] border-indigo-500 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Interactive Resize Dots */}
                <div 
                  onPointerDown={(e) => handleResizeStart('sw', e)}
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-[2.5px] border-indigo-500 rounded-full cursor-nesw-resize z-30 shadow-md active:scale-125 transition-transform opacity-0 group-hover:opacity-100"
                />
                <div 
                  onPointerDown={(e) => handleResizeStart('se', e)}
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-[2.5px] border-indigo-500 rounded-full cursor-nwse-resize z-30 shadow-md active:scale-125 transition-transform opacity-0 group-hover:opacity-100"
                />
              </div>

            </div>
          </div>

        </div>

        {/* --- BOTTOM ACTION BAR --- */}
        <div className="h-20 bg-white border-t border-gray-200 px-4 md:px-8 flex justify-between items-center z-10 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          <div className="hidden md:flex items-center gap-3 text-slate-500 font-semibold bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
             <Move className="w-5 h-5 text-indigo-500" />
             <span className="text-sm">Drag image to place exactly where you want it on the A4 page.</span>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={onClose} className="flex-1 md:flex-none px-6 py-3 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">
              Cancel
            </button>
            <button 
              onClick={handleCompileAndPrint} 
              disabled={loading} 
              className="flex-1 md:flex-none px-8 py-3 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-[0.98]"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5" />}
              {loading ? 'Preparing Print...' : 'Direct Print A4'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}