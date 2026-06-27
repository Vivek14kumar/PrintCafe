"use client";
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Move, Crop, Printer, Sliders, LayoutGrid, AlignCenter, 
  FlipHorizontal, FlipVertical, RotateCw, RotateCcw, Sun, 
  Contrast, Droplets, ChevronLeft, RefreshCw, ZoomIn, ZoomOut
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; // 🌟 NEW: Toaster for Auto-Deduct alerts

function StudioWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const a4PageRef = useRef(null);
  
  // URL Params (Reads frontUrl, backUrl, and jobId for auto-deduction)
  const jobId = searchParams.get('jobId');
  const imageUrl = searchParams.get('imageUrl');
  const frontUrl = searchParams.get('frontUrl');
  const backUrl = searchParams.get('backUrl');

  // Core UI States
  const [activeTool, setActiveTool] = useState('move'); 
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);
  const PRINT_MARGIN = 15; 

  // 🌟 MULTI-LAYER SYSTEM 🌟
  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);

  // Load all images as separate draggable layers
  useEffect(() => {
    const initLayers = [];
    
    const loadImageAsLayer = (url, id, startX, startY) => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        img.onload = () => {
          const ratio = img.width / img.height;
          const defaultWidth = 160;
          initLayers.push({
            id, url, aspectRatio: ratio,
            position: { x: startX, y: startY },
            size: { width: defaultWidth, height: defaultWidth / ratio },
            crop: { top: 0, right: 0, bottom: 0, left: 0 },
            rotation: 0, flipH: false, flipV: false,
            brightness: 100, contrast: 100, grayscale: 0
          });
          resolve();
        };
        img.onerror = resolve;
      });
    };

    const runInit = async () => {
      // By default, stagger them slightly
      if (frontUrl) await loadImageAsLayer(frontUrl, 'Front Card', PRINT_MARGIN, PRINT_MARGIN);
      if (backUrl) await loadImageAsLayer(backUrl, 'Back Card', PRINT_MARGIN + 20, PRINT_MARGIN + 20);
      if (imageUrl && !frontUrl && !backUrl) await loadImageAsLayer(imageUrl, 'Document', PRINT_MARGIN, PRINT_MARGIN);
      
      setLayers(initLayers);
      if (initLayers.length > 0) setActiveLayerId(initLayers[0].id);
    };

    runInit();
  }, [imageUrl, frontUrl, backUrl]);

  // Helpers for Active Layer
  const activeLayer = layers.find(l => l.id === activeLayerId);
  const updateActiveLayer = (updates) => {
    setLayers(prev => prev.map(l => l.id === activeLayerId ? { ...l, ...updates } : l));
  };

  // Interactive States
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isCroppingHandles, setIsCroppingHandles] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeDir, setResizeDir] = useState('');
  const [initialState, setInitialState] = useState(null);

  // --- Pointer Down Event ---
  const handlePointerDown = (e, type, dir = '', layerId) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveLayerId(layerId); // Focus clicked layer
    
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialState({
      x: layer.position.x, y: layer.position.y,
      w: layer.size.width, h: layer.size.height,
      crop: { ...layer.crop }
    });

    if (type === 'drag') {
      if (activeTool === 'move') setIsDragging(true);
    } else if (type === 'resize') {
      setResizeDir(dir);
      if (activeTool === 'crop') setIsCroppingHandles(true);
      else setIsResizing(true);
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // --- Pointer Move Event (Drag, Resize, Crop) ---
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!a4PageRef.current || !initialState || !activeLayer) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const a4W = a4PageRef.current.offsetWidth;
      const a4H = a4PageRef.current.offsetHeight;

      // 1. Move
      if (isDragging) {
        let nx = Math.max(PRINT_MARGIN, Math.min(initialState.x + deltaX, a4W - activeLayer.size.width - PRINT_MARGIN));
        let ny = Math.max(PRINT_MARGIN, Math.min(initialState.y + deltaY, a4H - activeLayer.size.height - PRINT_MARGIN));
        updateActiveLayer({ position: { x: nx, y: ny } });
      }

      // 2. Crop
      if (isCroppingHandles) {
        const cT = (deltaY / activeLayer.size.height) * 100;
        const cB = (-deltaY / activeLayer.size.height) * 100;
        const cL = (deltaX / activeLayer.size.width) * 100;
        const cR = (-deltaX / activeLayer.size.width) * 100;

        let cropObj = { ...initialState.crop };
        if (resizeDir.includes('n')) cropObj.top = Math.max(0, Math.min(95, initialState.crop.top + cT));
        if (resizeDir.includes('s')) cropObj.bottom = Math.max(0, Math.min(95, initialState.crop.bottom + cB));
        if (resizeDir.includes('w')) cropObj.left = Math.max(0, Math.min(95, initialState.crop.left + cL));
        if (resizeDir.includes('e')) cropObj.right = Math.max(0, Math.min(95, initialState.crop.right + cR));
        updateActiveLayer({ crop: cropObj });
      }

      // 3. Resize
      if (isResizing) {
        let nW = initialState.w, nH = initialState.h, nX = initialState.x, nY = initialState.y;

        if (resizeDir.includes('e')) nW = Math.max(40, initialState.w + deltaX);
        else if (resizeDir.includes('w')) { nW = Math.max(40, initialState.w - deltaX); nX = initialState.x + (initialState.w - nW); }
        
        if (resizeDir === 'n' || resizeDir === 's') {
          if (resizeDir === 's') nH = Math.max(40, initialState.h + deltaY);
          else { nH = Math.max(40, initialState.h - deltaY); nY = initialState.y + (initialState.h - nH); }
          nW = nH * activeLayer.aspectRatio; 
        } else {
          nH = nW / activeLayer.aspectRatio;
          if (resizeDir.includes('n')) nY = initialState.y + (initialState.h - nH);
        }

        updateActiveLayer({ size: { width: nW, height: nH }, position: { x: nX, y: nY } });
      }
    };

    const handlePointerUp = () => { setIsDragging(false); setIsResizing(false); setIsCroppingHandles(false); };

    if (isDragging || isResizing || isCroppingHandles) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, isResizing, isCroppingHandles, dragStart, initialState, resizeDir, activeLayer]);

  // --- 🌟 AUTO LAYOUT PRESETS (Side-by-Side Magic) 🌟 ---
  const applyPreset = (type) => {
    if (!a4PageRef.current) return;
    const a4W = a4PageRef.current.offsetWidth;
    const a4H = a4PageRef.current.offsetHeight;

    if (type === 'idCard') {
      // Dono cards ko Top par Side-by-Side place karega
      const gap = 20; 
      const idWidth = (a4W - (PRINT_MARGIN * 2) - gap) / 2; // Perfect split 
      
      setLayers(prev => prev.map((layer, index) => {
        const idHeight = idWidth / layer.aspectRatio;
        return {
          ...layer,
          size: { width: idWidth, height: idHeight },
          position: { 
            x: PRINT_MARGIN + (index % 2) * (idWidth + gap), // Side by side
            y: PRINT_MARGIN + Math.floor(index / 2) * (idHeight + gap) // Agar 2 se jyada hain to niche jayega
          },
          rotation: 0 // Preset apply karte waqt rotation seedha kar do
        };
      }));
    } else if (type === 'center' && activeLayer) {
      // Center SIRF active layer ko karega
      updateActiveLayer({ 
        position: { 
          x: (a4W - activeLayer.size.width) / 2, 
          y: (a4H - activeLayer.size.height) / 2 
        } 
      });
    } else if (type === 'full' && activeLayer) {
      // Full page SIRF active layer ko karega
      const fullW = a4W - (PRINT_MARGIN * 2);
      updateActiveLayer({ 
        size: { width: fullW, height: fullW / activeLayer.aspectRatio },
        position: { x: PRINT_MARGIN, y: PRINT_MARGIN }
      });
    }
  };

  // --- 🖨️ COMPILE, PRINT & AUTO-DEDUCT ---
  const handleCompileAndPrint = async () => {
    setLoading(true);
    const canvas = document.createElement('canvas');
    canvas.width = 2480; 
    canvas.height = 3508; 
    const ctx = canvas.getContext('2d');

    // Fill white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scaleFactor = canvas.width / a4PageRef.current.offsetWidth;

    // Loop through all layers and draw them
    for (const layer of layers) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = layer.url;
      await new Promise(r => { img.onload = r; });

      const finalX = layer.position.x * scaleFactor;
      const finalY = layer.position.y * scaleFactor;
      const finalW = layer.size.width * scaleFactor;
      const finalH = layer.size.height * scaleFactor;

      ctx.save();
      ctx.filter = `brightness(${layer.brightness}%) contrast(${layer.contrast}%) grayscale(${layer.grayscale}%)`;
      ctx.translate(finalX + finalW / 2, finalY + finalH / 2);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.scale(layer.flipH ? -1 : 1, layer.flipV ? -1 : 1);

      const sx = (layer.crop.left / 100) * img.width;
      const sy = (layer.crop.top / 100) * img.height;
      const sw = (1 - (layer.crop.left + layer.crop.right) / 100) * img.width;
      const sh = (1 - (layer.crop.top + layer.crop.bottom) / 100) * img.height;

      ctx.drawImage(img, sx, sy, sw, sh, -finalW / 2, -finalH / 2, finalW, finalH);
      ctx.restore();
    }

    // Trigger Print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><style>body { margin: 0; display: flex; justify-content: center; align-items: center; background: white; } img { width: 100vw; height: 100vh; object-fit: contain; } @media print { @page { size: A4; margin: 0; } body { margin: 0; } img { width: 210mm; height: 297mm; } }</style></head>
        <body onload="window.print(); window.close();">
          <img src="${canvas.toDataURL('image/jpeg', 0.95)}" />
        </body>
      </html>
    `);
    printWindow.document.close();

    // 🌟 AUTO DEDUCT WALLET LOGIC
    if (jobId) {
      try {
        toast.success("Printing... Deducting amount from wallet.");
        await fetch('/api/jobs/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId, action: 'approve' })
        });
      } catch (err) {
        console.error("Deduction error", err);
      }
    }

    // 🌟 AUTO CLOSE STUDIO
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

  return (
    <div className="h-screen w-full flex flex-col bg-[#121214] text-slate-200 select-none overflow-hidden font-sans">
      <Toaster position="top-center" />
      
      {/* ⚡ TOP BAR */}
      <div className="h-14 bg-[#1a1a1e] border-b border-zinc-800 flex items-center justify-between px-5 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 px-3 py-1.5 rounded-xl border border-zinc-700/50">
            <ChevronLeft className="w-4 h-4" /> Exit Studio
          </button>
          <div className="w-[1px] h-5 bg-zinc-800"></div>
          <span className="text-sm font-black tracking-tight text-white flex items-center gap-2">
             Print Cafe Studio <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">A4 Mode</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-[#121214] border border-zinc-800 px-2 py-1 rounded-xl">
            <button onClick={() => setZoom(z => Math.max(60, z - 10))} className="p-1 text-zinc-400 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="text-xs font-mono font-bold w-12 text-center text-indigo-400">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(180, z + 10))} className="p-1 text-zinc-400 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>

          <button 
            onClick={handleCompileAndPrint} 
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            {loading ? 'Processing...' : 'Direct Print & Pay'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 🛠️ LEFT TOOLBAR */}
        <div className="w-16 bg-[#1a1a1e] border-r border-zinc-800 flex flex-col items-center py-5 gap-3 z-40">
          <button 
            onClick={() => setActiveTool('move')} 
            title="Move & Resize"
            className={`p-3 rounded-xl transition-all ${activeTool === 'move' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            <Move className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setActiveTool('crop')} 
            title="Trim / Crop Image"
            className={`p-3 rounded-xl transition-all ${activeTool === 'crop' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
          >
            <Crop className="w-5 h-5" />
          </button>
        </div>

        {/* 🎨 CENTER CANVAS WORKSPACE */}
        <div className="flex-1 bg-[#121214] p-4 flex items-center justify-center relative overflow-auto custom-scrollbar">
          
          <div 
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }} 
            className="transition-transform duration-200 p-8"
          >
            <div 
              ref={a4PageRef}
              className="bg-white shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden border border-zinc-700/30"
              style={{ height: '74vh', aspectRatio: '1 / 1.414' }}
            >
              <div 
                className="absolute border border-dashed border-red-300/60 pointer-events-none rounded-sm"
                style={{ top: PRINT_MARGIN, left: PRINT_MARGIN, right: PRINT_MARGIN, bottom: PRINT_MARGIN }}
              />

              {/* 🌟 RENDER ALL MULTIPLE LAYERS (Front & Back) 🌟 */}
              {layers.map(layer => {
                const isActive = activeLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    onPointerDown={(e) => handlePointerDown(e, 'drag', '', layer.id)}
                    style={{
                      position: 'absolute',
                      left: `${layer.position.x}px`, top: `${layer.position.y}px`,
                      width: `${layer.size.width}px`, height: `${layer.size.height}px`,
                      transform: `rotate(${layer.rotation}deg) scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`,
                      touchAction: 'none',
                      zIndex: isActive ? 20 : 10
                    }}
                    className="group"
                  >
                    {isActive && (
                      <>
                        <div className={`absolute inset-0 border-2 pointer-events-none z-10 ${activeTool === 'crop' ? 'border-amber-500 border-dashed' : 'border-indigo-500'}`} />
                        {handles.map(dir => (
                          <div
                            key={dir}
                            onPointerDown={(e) => handlePointerDown(e, 'resize', dir, layer.id)}
                            className={`absolute bg-white border-2 shadow-md z-30 opacity-0 group-hover:opacity-100 transition-opacity
                              ${activeTool === 'crop' ? 'border-amber-500' : 'border-indigo-500'}
                              ${dir.length === 2 ? 'w-3.5 h-3.5 rounded-full' : 'w-2.5 h-2.5 rounded-sm'}
                            `}
                            style={{
                              top: dir.includes('n') ? '-7px' : dir === 'e' || dir === 'w' ? 'calc(50% - 5px)' : 'auto',
                              bottom: dir.includes('s') ? '-7px' : 'auto',
                              left: dir.includes('w') ? '-7px' : dir === 'n' || dir === 's' ? 'calc(50% - 5px)' : 'auto',
                              right: dir.includes('e') ? '-7px' : 'auto',
                              cursor: `${dir}-resize`
                            }}
                          />
                        ))}
                      </>
                    )}

                    <div 
                      className="w-full h-full overflow-hidden relative"
                      style={{ clipPath: `inset(${layer.crop.top}% ${layer.crop.right}% ${layer.crop.bottom}% ${layer.crop.left}%)` }}
                    >
                      <img
                        src={layer.url}
                        alt="Print Layer"
                        className={`w-full h-full object-cover pointer-events-none select-none ${!isActive && layers.length > 1 ? 'opacity-80' : 'opacity-100'}`}
                        style={{ filter: `brightness(${layer.brightness}%) contrast(${layer.contrast}%) grayscale(${layer.grayscale}%)` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 🎛️ RIGHT PROPERTIES PANEL */}
        <div className="w-72 bg-[#1a1a1e] border-l border-zinc-800 flex flex-col p-4 overflow-y-auto custom-scrollbar z-40 space-y-6">
          
          {activeLayer && (
            <div className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold p-2 text-center rounded-lg border border-indigo-500/20 uppercase tracking-widest">
              Editing: {activeLayer.id}
            </div>
          )}

          <div>
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" /> Auto Size Presets
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => applyPreset('idCard')} className="col-span-2 p-3 bg-zinc-800/60 hover:bg-zinc-800 text-xs font-bold rounded-xl border border-zinc-700/40 text-center transition-all flex justify-center items-center gap-2">
                <span className="text-base">🪪</span> Auto: Side-by-Side ID
              </button>
              <button onClick={() => applyPreset('center')} disabled={!activeLayer} className="p-2.5 bg-zinc-800/60 hover:bg-zinc-800 text-xs font-bold rounded-xl border border-zinc-700/40 text-center transition-all disabled:opacity-50">
                Center Layer
              </button>
              <button onClick={() => applyPreset('full')} disabled={!activeLayer} className="p-2.5 bg-zinc-800/60 hover:bg-zinc-800 text-xs font-bold rounded-xl border border-zinc-700/40 text-center transition-all disabled:opacity-50">
                Fill Page
              </button>
            </div>
          </div>

          {activeLayer && (
            <>
              <div className="pt-4 border-t border-zinc-800/60">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Adjustments
                </h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5" /> Brightness</span>
                      <span className="font-bold text-emerald-400 font-mono text-[11px]">{activeLayer.brightness}%</span>
                    </div>
                    <input type="range" min="40" max="180" value={activeLayer.brightness} onChange={(e) => updateActiveLayer({ brightness: parseInt(e.target.value) })} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-emerald-500 cursor-pointer" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5"><Contrast className="w-3.5 h-3.5" /> Contrast</span>
                      <span className="font-bold text-emerald-400 font-mono text-[11px]">{activeLayer.contrast}%</span>
                    </div>
                    <input type="range" min="40" max="180" value={activeLayer.contrast} onChange={(e) => updateActiveLayer({ contrast: parseInt(e.target.value) })} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-emerald-500 cursor-pointer" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5" /> Grayscale</span>
                      <span className="font-bold text-emerald-400 font-mono text-[11px]">{activeLayer.grayscale}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={activeLayer.grayscale} onChange={(e) => updateActiveLayer({ grayscale: parseInt(e.target.value) })} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-emerald-500 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/60">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2.5">Rotation & Flips</h4>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button onClick={() => updateActiveLayer({ flipH: !activeLayer.flipH })} className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${activeLayer.flipH ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-zinc-800/60 border-transparent text-zinc-300'}`}>
                    <FlipHorizontal className="w-3.5 h-3.5" /> Mirror H
                  </button>
                  <button onClick={() => updateActiveLayer({ flipV: !activeLayer.flipV })} className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${activeLayer.flipV ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-zinc-800/60 border-transparent text-zinc-300'}`}>
                    <FlipVertical className="w-3.5 h-3.5" /> Mirror V
                  </button>
                </div>
                <button onClick={() => updateActiveLayer({ rotation: (activeLayer.rotation + 90) % 360 })} className="w-full p-2.5 bg-zinc-800/60 hover:bg-zinc-800 text-xs font-bold rounded-xl border border-zinc-700/40 flex items-center justify-center gap-2 transition-all">
                  <RotateCw className="w-3.5 h-3.5 text-orange-400" /> Rotate 90°
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #121214; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2a30; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3a3a42; }
      `}} />
    </div>
  );
}

export default function ProPrintStudioPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-[#121214] text-white font-bold font-mono">⚡ LOADING PRINT STUDIO v2...</div>}>
      <StudioWorkspace />
    </Suspense>
  );
}