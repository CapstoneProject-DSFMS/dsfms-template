import React, { useRef, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ArrowClockwise } from 'react-bootstrap-icons';

const SignaturePad = ({ onSignatureChange, width = 250, height = 150 }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    // Scale context for high DPI displays
    ctx.scale(dpr, dpr);
    
    // Set drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  const getPointFromEvent = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate position relative to canvas (in CSS pixels)
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    return { x, y };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const point = getPointFromEvent(e);
    if (!point) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    setIsDrawing(true);
    setLastPoint(point);
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const point = getPointFromEvent(e);
    if (!point) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (lastPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    setLastPoint(point);
    setHasSignature(true);
    
    // Notify parent of signature change (throttle to avoid too many calls)
    if (onSignatureChange) {
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    
    setHasSignature(false);
    if (onSignatureChange) {
      onSignatureChange(null);
    }
  };

  return (
    <div className="signature-pad-container">
      <div 
        className="border rounded p-2 bg-white"
        style={{ 
          display: 'inline-block',
          touchAction: 'none'
        }}
      >
        <canvas
          ref={canvasRef}
          className="signature-canvas"
          style={{
            cursor: 'crosshair',
            display: 'block',
            touchAction: 'none',
            userSelect: 'none'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
      </div>
      <div className="mt-2 d-flex justify-content-between align-items-center">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={clearCanvas}
        >
          <ArrowClockwise className="me-1" size={14} />
          Clear
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;

