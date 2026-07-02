"use client";
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Move, Crop, Printer, Sliders, LayoutGrid, AlignCenter, 
  FlipHorizontal, FlipVertical, RotateCw, RotateCcw, Sun, 
  Contrast, Droplets, ChevronLeft, RefreshCw, ZoomIn, ZoomOut, Scan, CheckCircle, Wand2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function StudioWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const a4PageRef = useRef(null);
  
  const jobId = searchParams.get('jobId');
  const imageUrl = searchParams.get('imageUrl');
  const frontUrl = searchParams.get('frontUrl');
  const backUrl = searchParams.get('backUrl');

  const [activeTool, setActiveTool] = useState('move'); 
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);
  const [isOpenCvLoaded, setIsOpenCvLoaded] = useState(false);
  const PRINT_MARGIN = 15; 

  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);

  // Interaction States
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isCroppingHandles, setIsCroppingHandles] = useState(false);
  const [activeWarpPoint, setActiveWarpPoint] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeDir, setResizeDir] = useState('');
  const [initialState, setInitialState] = useState(null);

  // Load OpenCV.js AI Engine
  /*useEffect(() => {
    if (window.cv && window.cv.Mat) {
      setIsOpenCvLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js'; 
    script.async = true;
    script.onload = () => {
      let attempts = 0;
      const checkReady = setInterval(() => {
        attempts++;
        if (window.cv && window.cv.Mat) {
          clearInterval(checkReady);
          setIsOpenCvLoaded(true);
        } else if (attempts > 30) { 
          clearInterval(checkReady);
        }
      }, 500);
    };
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);*/

  // Initialize Layers
  useEffect(() => {
    const initLayers = [];
    const loadImageAsLayer = (url, id, startX, startY) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        img.onload = () => {
          const ratio = img.width / img.height;
          const defaultWidth = 160;
          initLayers.push({
            id, url, originalUrl: url, aspectRatio: ratio,
            position: { x: startX, y: startY },
            size: { width: defaultWidth, height: defaultWidth / ratio },
            crop: { top: 0, right: 0, bottom: 0, left: 0 },
            warpPoints: [{x: 10, y: 10}, {x: 90, y: 10}, {x: 90, y: 90}, {x: 10, y: 90}],
            liveWarpResult: null, // For real-time preview
            rotation: 0, flipH: false, flipV: false,
            brightness: 100, contrast: 100, grayscale: 0
          });
          resolve();
        };
        img.onerror = resolve;
      });
    };

    const runInit = async () => {
      if (frontUrl) await loadImageAsLayer(frontUrl, 'Front Card', PRINT_MARGIN, PRINT_MARGIN);
      if (backUrl) await loadImageAsLayer(backUrl, 'Back Card', PRINT_MARGIN + 190, PRINT_MARGIN);
      if (imageUrl && !frontUrl && !backUrl) await loadImageAsLayer(imageUrl, 'Document', PRINT_MARGIN, PRINT_MARGIN);
      
      setLayers(initLayers);
      if (initLayers.length > 0) setActiveLayerId(initLayers[0].id);
    };
    runInit();
  }, [imageUrl, frontUrl, backUrl]);

  const activeLayer = layers.find(l => l.id === activeLayerId);
  const updateActiveLayer = (updates) => {
    setLayers(prev => prev.map(l => l.id === activeLayerId ? { ...l, ...updates } : l));
  };

  const handleReset = () => {
    if (!activeLayer) return;
    const defaultWidth = 180;
    updateActiveLayer({
      url: activeLayer.originalUrl,
      size: { width: defaultWidth, height: defaultWidth / activeLayer.aspectRatio },
      position: { x: PRINT_MARGIN, y: PRINT_MARGIN },
      rotation: 0, flipH: false, flipV: false,
      brightness: 100, contrast: 100, grayscale: 0,
      crop: { top: 0, right: 0, bottom: 0, left: 0 },
      warpPoints: [{x: 10, y: 10}, {x: 90, y: 10}, {x: 90, y: 90}, {x: 10, y: 90}],
      liveWarpResult: null
    });
    handleToolChange('move');
    toast.success("Reset successfully!");
  };

  // --- Real-Time OpenCV Engine (Runs instantly when a point is dropped) ---
  /*const generateLiveWarpPreview = (layerData) => {
    if (!window.cv || !isOpenCvLoaded) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = layerData.originalUrl;
    
    img.onload = () => {
      try {
        const cv = window.cv;
        let src = cv.imread(img);
        let dst = new cv.Mat();

        const pts = layerData.warpPoints;
        const tl = { x: (pts[0].x / 100) * img.width, y: (pts[0].y / 100) * img.height };
        const tr = { x: (pts[1].x / 100) * img.width, y: (pts[1].y / 100) * img.height };
        const br = { x: (pts[2].x / 100) * img.width, y: (pts[2].y / 100) * img.height };
        const bl = { x: (pts[3].x / 100) * img.width, y: (pts[3].y / 100) * img.height };

        const targetW = Math.max(Math.hypot(br.x - bl.x, br.y - bl.y), Math.hypot(tr.x - tl.x, tr.y - tl.y));
        const targetH = Math.max(Math.hypot(tr.x - br.x, tr.y - br.y), Math.hypot(tl.x - bl.x, tl.y - bl.y));

        let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [tl.x, tl.y, tr.x, tr.y, br.x, br.y, bl.x, bl.y]);
        let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, targetW, 0, targetW, targetH, 0, targetH]);

        let M = cv.getPerspectiveTransform(srcTri, dstTri);
        let dsize = new cv.Size(targetW, targetH);
        cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

        const outCanvas = document.createElement('canvas');
        cv.imshow(outCanvas, dst);
        
        updateActiveLayer({ 
          liveWarpResult: outCanvas.toDataURL('image/png', 0.95),
          liveWarpRatio: targetW / targetH 
        });

        src.delete(); dst.delete(); M.delete(); srcTri.delete(); dstTri.delete();
      } catch (err) {
        console.error("Preview Warp failed:", err);
      }
    };
  };*/

  // --- Tool Switching Logic (Auto Applies Warp) ---
  const handleToolChange = (tool) => {
    // If switching OUT of warp tool and a preview exists, AUTO-APPLY IT!
    if (activeTool === 'warp' && tool !== 'warp' && activeLayer?.liveWarpResult) {
      updateActiveLayer({
        url: activeLayer.liveWarpResult,
        originalUrl: activeLayer.liveWarpResult,
        aspectRatio: activeLayer.liveWarpRatio,
        size: { width: activeLayer.size.width, height: activeLayer.size.width / activeLayer.liveWarpRatio },
        warpPoints: [{x: 10, y: 10}, {x: 90, y: 10}, {x: 90, y: 90}, {x: 10, y: 90}], // Reset handles for future
        liveWarpResult: null
      });
      toast.success("Crop Auto-Applied!");
    } else if (tool === 'warp' && activeLayer) {
      // Generate initial preview when opening warp tool
      generateLiveWarpPreview(activeLayer);
    }
    setActiveTool(tool);
  };

  // --- Pointer Down Event ---
  const handlePointerDown = (e, type, dir = '', layerId) => {
    e.stopPropagation(); e.preventDefault();
    setActiveLayerId(layerId);
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialState({ x: layer.position.x, y: layer.position.y, w: layer.size.width, h: layer.size.height, crop: { ...layer.crop }, warpPoints: [...layer.warpPoints] });

    if (type === 'drag' && activeTool === 'move') setIsDragging(true);
    else if (type === 'resize') {
      setResizeDir(dir);
      if (activeTool === 'crop') setIsCroppingHandles(true);
      else setIsResizing(true);
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleWarpPointDown = (e, pointIndex) => {
    e.stopPropagation(); e.preventDefault();
    setActiveWarpPoint(pointIndex);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialState({ warpPoints: [...activeLayer.warpPoints] });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // --- Global Interaction Logic ---
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!a4PageRef.current || !initialState || !activeLayer) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const a4W = a4PageRef.current.offsetWidth;
      const a4H = a4PageRef.current.offsetHeight;

      if (isDragging) {
        let nx = Math.max(PRINT_MARGIN, Math.min(initialState.x + deltaX, a4W - activeLayer.size.width - PRINT_MARGIN));
        let ny = Math.max(PRINT_MARGIN, Math.min(initialState.y + deltaY, a4H - activeLayer.size.height - PRINT_MARGIN));
        updateActiveLayer({ position: { x: nx, y: ny } });
      }

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

      if (activeWarpPoint !== null) {
        const pctX = (deltaX / activeLayer.size.width) * 100;
        const pctY = (deltaY / activeLayer.size.height) * 100;
        const newPoints = [...initialState.warpPoints];
        newPoints[activeWarpPoint] = {
          x: Math.max(0, Math.min(100, initialState.warpPoints[activeWarpPoint].x + pctX)),
          y: Math.max(0, Math.min(100, initialState.warpPoints[activeWarpPoint].y + pctY))
        };
        updateActiveLayer({ warpPoints: newPoints });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false); 
      setIsResizing(false); 
      setIsCroppingHandles(false); 
      
      // 🌟 IF FINISHED DRAGGING A WARP POINT, INSTANTLY UPDATE THE PREVIEW 🌟
      if (activeWarpPoint !== null && activeLayer) {
         generateLiveWarpPreview(activeLayer);
      }
      setActiveWarpPoint(null); 
    };

    if (isDragging || isResizing || isCroppingHandles || activeWarpPoint !== null) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => { window.removeEventListener('pointermove', handlePointerMove); window.removeEventListener('pointerup', handlePointerUp); };
  }, [isDragging, isResizing, isCroppingHandles, activeWarpPoint, dragStart, initialState, resizeDir, activeLayer]);

  // --- Format Presets ---
  const applyPreset = (type) => {
    if (!a4PageRef.current) return;
    const a4W = a4PageRef.current.offsetWidth;
    const a4H = a4PageRef.current.offsetHeight;

    if (type === 'idCard') {
      const gap = 20; 
      const idWidth = (a4W - (PRINT_MARGIN * 2) - gap) / 2; 
      setLayers(prev => prev.map((layer, index) => {
        const standardRatio = 1.586;
        return {
          ...layer,
          size: { width: idWidth, height: idWidth / standardRatio },
          aspectRatio: standardRatio,
          position: { x: PRINT_MARGIN + (index % 2) * (idWidth + gap), y: PRINT_MARGIN + Math.floor(index / 2) * ((idWidth / standardRatio) + gap) },
          rotation: 0
        };
      }));
    } else if (type === 'center' && activeLayer) {
      updateActiveLayer({ position: { x: (a4W - activeLayer.size.width) / 2, y: (a4H - activeLayer.size.height) / 2 } });
    } else if (type === 'full' && activeLayer) {
      const fullW = a4W - (PRINT_MARGIN * 2);
      updateActiveLayer({ size: { width: fullW, height: fullW / activeLayer.aspectRatio }, position: { x: PRINT_MARGIN, y: PRINT_MARGIN } });
    }
  };

  // --- Direct A4 Print & Deduct Flow ---
  const handleCompileAndPrint = async () => {
    setLoading(true);
    
    // Auto-apply warp if user forgot to switch tools before printing
    if (activeTool === 'warp' && activeLayer?.liveWarpResult) {
       handleToolChange('move');
    }

    const canvas = document.createElement('canvas');
    canvas.width = 2480; 
    canvas.height = 3508; 
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scaleFactor = canvas.width / a4PageRef.current.offsetWidth;

    for (const layer of layers) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      // Ensure we print the updated warped URL if it exists
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

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><style>body { margin: 0; display: flex; justify-content: center; align-items: center; background: white; } img { width: 100vw; height: 100vh; object-fit: contain; } @media print { @page { size: A4; margin: 0; } body { margin: 0; } img { width: 210mm; height: 297mm; } }</style></head>
        <body onload="window.print(); window.close();"><img src="${canvas.toDataURL('image/jpeg', 0.95)}" /></body>
      </html>
    `);
    printWindow.document.close();

    if (jobId) {
      try {
        toast.success("Updating wallet transactions...");
        await fetch('/api/jobs/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId, action: 'approve' }) });
      } catch (err) {}
    }
    setTimeout(() => { router.push('/dashboard'); }, 1500);
  };

  const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

  return (
    <div className="h-screen w-full flex flex-col bg-[#121214] text-slate-200 select-none overflow-hidden font-sans">
      <Toaster position="top-center" />
      
      {/* ⚡ TOP CONTROL HEADER */}
      <div className="h-14 bg-[#1a1a1e] border-b border-zinc-800 flex items-center justify-between px-5 z-40 shadow-md flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-800/50 px-3 py-1.5 rounded-xl border border-zinc-700/50">
            <ChevronLeft className="w-4 h-4" /> Exit
          </button>
          <div className="w-[1px] h-5 bg-zinc-800"></div>
          <div className="flex items-center gap-2">
            <img src="../logo.png" alt="PrintCafe Logo"  width={32} height={32} />
            <span className="text-sm font-black tracking-tight text-white">Print Cafe Studio</span>
          </div>
          
        </div>

        <div className="flex items-center gap-4">
          {/*<div className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${isOpenCvLoaded ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'}`}>
            {isOpenCvLoaded ? 'OpenCV Ready' : 'Loading Engine...'}
          </div>*/}

          <div className="flex items-center gap-1 bg-[#121214] border border-zinc-800 px-2 py-1 rounded-xl">
            <button onClick={() => setZoom(z => Math.max(60, z - 10))} className="p-1 text-zinc-400 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="text-xs font-mono font-bold w-12 text-center text-indigo-400">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(180, z + 10))} className="p-1 text-zinc-400 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>

          <button onClick={handleCompileAndPrint} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            Direct Print & Pay
          </button>
        </div>
      </div>

      {/* --- STUDIO BODY --- */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 🛠️ LEFT SIDEBAR TOOLBAR */}
        <div className="w-16 bg-[#1a1a1e] border-r border-zinc-800 flex flex-col items-center py-5 gap-3 flex-shrink-0 z-40">
          <button onClick={() => handleToolChange('move')} title="Move & Scale Mode (V)" className={`p-3 rounded-xl transition-all ${activeTool === 'move' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}><Move className="w-5 h-5" /></button>
          <button onClick={() => handleToolChange('crop')} title="Edge CSS Crop (C)" className={`p-3 rounded-xl transition-all ${activeTool === 'crop' ? 'bg-amber-500 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}><Crop className="w-5 h-5" /></button>
          <button onClick={() => handleToolChange('warp')} disabled title="Coming Soon" className={`p-3 rounded-xl transition-all ${activeTool === 'warp' ? 'bg-purple-500 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}><Scan className="w-5 h-5" /></button>
          <div className="w-8 h-[1px] bg-zinc-800 my-2"></div>
          <button onClick={handleReset} title="Reset Layer" className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"><RotateCcw className="w-5 h-5" /></button>
        </div>

        {/* 🎨 CENTER CANVAS WORKSPACE (Strict scroll containment) */}
        <div className="flex-1 bg-[#121214] overflow-auto custom-scrollbar p-6 flex items-start justify-center relative">
          
          <div 
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }} 
            className="transition-transform duration-200 flex-shrink-0 mb-12"
          >
            <div 
              ref={a4PageRef} 
              className="bg-white shadow-[0_25px_60px_rgba(0,0,0,0.65)] relative overflow-hidden border border-zinc-700/30 select-none" 
              style={{ height: '74vh', aspectRatio: '1 / 1.414' }}
            >
              <div className="absolute border border-dashed border-red-300/60 pointer-events-none rounded-sm" style={{ top: PRINT_MARGIN, left: PRINT_MARGIN, right: PRINT_MARGIN, bottom: PRINT_MARGIN }} />

              {/* RENDER ALL DIGITAL LAYERS */}
              {layers.map(layer => {
                const isActive = activeLayerId === layer.id;
                return (
                  <div
                    key={layer.id}
                    onPointerDown={(e) => handlePointerDown(e, 'drag', '', layer.id)}
                    style={{ 
                      position: 'absolute', left: `${layer.position.x}px`, top: `${layer.position.y}px`, 
                      width: `${layer.size.width}px`, height: `${layer.size.height}px`, 
                      transform: `rotate(${layer.rotation}deg) scaleX(${layer.flipH ? -1 : 1}) scaleY(${layer.flipV ? -1 : 1})`, 
                      touchAction: 'none', zIndex: isActive ? 20 : 10 
                    }}
                    className="group"
                  >
                    {/* 8-POINT CSS RESIZE HANDLES */}
                    {isActive && activeTool !== 'warp' && (
                      <>
                        <div className={`absolute inset-0 border-2 pointer-events-none z-10 ${activeTool === 'crop' ? 'border-amber-500 border-dashed' : 'border-indigo-500'}`} />
                        {handles.map(dir => (
                          <div 
                            key={dir} onPointerDown={(e) => handlePointerDown(e, 'resize', dir, layer.id)} 
                            className={`absolute bg-white border-2 shadow-md z-30 opacity-0 group-hover:opacity-100 ${activeTool === 'crop' ? 'border-amber-500' : 'border-indigo-500'} ${dir.length === 2 ? 'w-3.5 h-3.5 rounded-full' : 'w-2.5 h-2.5 rounded-sm'}`} 
                            style={{ top: dir.includes('n') ? '-7px' : dir === 'e' || dir === 'w' ? 'calc(50% - 5px)' : 'auto', bottom: dir.includes('s') ? '-7px' : 'auto', left: dir.includes('w') ? '-7px' : dir === 'n' || dir === 's' ? 'calc(50% - 5px)' : 'auto', right: dir.includes('e') ? '-7px' : 'auto', cursor: `${dir}-resize` }} 
                          />
                        ))}
                      </>
                    )}

                    {/* 🌟 PREMIUM SCANNER MASK & CROSSHAIR POINTS 🌟 */}
                    {isActive && activeTool === 'warp' && (
                      <div className="absolute inset-0 z-30 pointer-events-none">
                        
                        {/* Dark CamScanner style backdrop mask */}
                        <svg width="100%" height="100%" className="absolute inset-0">
                          <defs>
                            <mask id={`mask-${layer.id}`}>
                              <rect width="100%" height="100%" fill="white" />
                              <polygon points={`${layer.warpPoints[0].x}%,${layer.warpPoints[0].y}% ${layer.warpPoints[1].x}%,${layer.warpPoints[1].y}% ${layer.warpPoints[2].x}%,${layer.warpPoints[2].y}% ${layer.warpPoints[3].x}%,${layer.warpPoints[3].y}%`} fill="black" />
                            </mask>
                          </defs>
                          <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask={`url(#mask-${layer.id})`} />
                          <polygon points={`${layer.warpPoints[0].x}%,${layer.warpPoints[0].y}% ${layer.warpPoints[1].x}%,${layer.warpPoints[1].y}% ${layer.warpPoints[2].x}%,${layer.warpPoints[2].y}% ${layer.warpPoints[3].x}%,${layer.warpPoints[3].y}%`} fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="6 4" />
                        </svg>

                        {/* Beautiful Drag Points */}
                        {layer.warpPoints.map((pt, i) => (
                          <div 
                            key={i} onPointerDown={(e) => handleWarpPointDown(e, i)}
                            className="absolute w-12 h-12 flex items-center justify-center cursor-crosshair pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                          >
                            <div className="w-6 h-6 rounded-full border-[2.5px] border-purple-500 bg-purple-500/20 backdrop-blur-sm flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.8)] hover:scale-125 transition-transform">
                               <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="w-full h-full overflow-hidden relative" style={{ clipPath: `inset(${layer.crop.top}% ${layer.crop.right}% ${layer.crop.bottom}% ${layer.crop.left}%)` }}>
                      <img src={layer.url} alt="Print Layer" className={`w-full h-full object-cover pointer-events-none select-none ${!isActive && layers.length > 1 ? 'opacity-70' : 'opacity-100'}`} style={{ filter: `brightness(${layer.brightness}%) contrast(${layer.contrast}%) grayscale(${layer.grayscale}%)` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 🎛️ RIGHT CONFIG PANEL */}
        <div className="w-72 bg-[#1a1a1e] border-l border-zinc-800 flex flex-col p-4 overflow-y-auto custom-scrollbar z-40 flex-shrink-0 space-y-6">
          
          {/* 🌟 LIVE PREVIEW BOX (Visible during Warp mode) 🌟 */}
          {activeLayer && activeTool === 'warp' && (
            <div className="bg-zinc-900 border border-zinc-700/50 p-3 rounded-2xl shadow-inner">
               <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                 <span className="flex items-center gap-1"><Wand2 className="w-3.5 h-3.5"/> Live Output</span>
                 {activeLayer.liveWarpResult && <span className="text-emerald-400 flex items-center gap-1 animate-pulse"><CheckCircle className="w-3 h-3"/> Ready</span>}
               </h4>
               <div className="w-full aspect-[1.586/1] bg-black rounded-xl overflow-hidden border border-zinc-800 relative flex items-center justify-center">
                 {activeLayer.liveWarpResult ? (
                   <img src={activeLayer.liveWarpResult} alt="Preview" className="w-full h-full object-contain" />
                 ) : (
                   <span className="text-[10px] text-zinc-600 font-bold">Drag points to scan</span>
                 )}
               </div>
               <div className="mt-3 bg-purple-500/10 text-purple-300 text-[10px] p-2 rounded-lg leading-tight font-medium border border-purple-500/20">
                 Adjust the 4 corner points to match the card edges. <b className="text-white block mt-1">Switch to "Move" Tool to Apply!</b>
               </div>
            </div>
          )}

          <div>
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5"><LayoutGrid className="w-3.5 h-3.5 text-indigo-400" /> Format Presets</h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => applyPreset('idCard')} className="p-3 bg-zinc-800/60 hover:bg-zinc-800 text-xs font-bold rounded-xl border border-zinc-700/40 text-center transition-all flex items-center justify-center gap-1">🪪 Align Side-by-Side ID</button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => applyPreset('center')} disabled={!activeLayer} className="p-2.5 bg-zinc-800/60 hover:bg-zinc-800 text-xs font-bold rounded-xl border border-zinc-700/40 text-center transition-all disabled:opacity-50">Center Layer</button>
                <button onClick={() => applyPreset('full')} disabled={!activeLayer} className="p-2.5 bg-zinc-800/60 hover:bg-zinc-800 text-xs font-bold rounded-xl border border-zinc-700/40 text-center transition-all disabled:opacity-50">Fill A4 Page</button>
              </div>
            </div>
          </div>

          {activeLayer && (
            <>
              <div className="pt-4 border-t border-zinc-800/60">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-emerald-400" /> Adjustments</h4>
                <div className="space-y-4">
                  <div className="space-y-1"><div className="flex justify-between text-xs text-zinc-400"><span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5" /> Brightness</span><span className="font-bold text-emerald-400 font-mono text-[11px]">{activeLayer.brightness}%</span></div><input type="range" min="40" max="180" value={activeLayer.brightness} onChange={(e) => updateActiveLayer({ brightness: parseInt(e.target.value) })} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-emerald-500 cursor-pointer" /></div>
                  <div className="space-y-1"><div className="flex justify-between text-xs text-zinc-400"><span className="flex items-center gap-1.5"><Contrast className="w-3.5 h-3.5" /> Contrast</span><span className="font-bold text-emerald-400 font-mono text-[11px]">{activeLayer.contrast}%</span></div><input type="range" min="40" max="180" value={activeLayer.contrast} onChange={(e) => updateActiveLayer({ contrast: parseInt(e.target.value) })} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-emerald-500 cursor-pointer" /></div>
                  <div className="space-y-1"><div className="flex justify-between text-xs text-zinc-400"><span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5" /> Xerox / B&W</span><span className="font-bold text-emerald-400 font-mono text-[11px]">{activeLayer.grayscale}%</span></div><input type="range" min="0" max="100" value={activeLayer.grayscale} onChange={(e) => updateActiveLayer({ grayscale: parseInt(e.target.value) })} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-emerald-500 cursor-pointer" /></div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/60">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2.5">Rotation Adjustments</h4>
                <button onClick={() => updateActiveLayer({ rotation: (activeLayer.rotation + 90) % 360 })} className="w-full p-2.5 bg-zinc-800/60 hover:bg-zinc-800 text-xs font-bold rounded-xl border border-zinc-700/40 flex items-center justify-center gap-2 transition-all"><RotateCw className="w-3.5 h-3.5 text-orange-400" /> Rotate 90°</button>
              </div>
            </>
          )}

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: #121214; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #2a2a30; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3a3a42; }`}} />
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