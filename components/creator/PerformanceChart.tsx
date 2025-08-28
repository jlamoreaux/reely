"use client";

import { useEffect, useRef } from "react";

interface PerformanceTrend {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

interface PerformanceChartProps {
  data: PerformanceTrend[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    
    // Find max values
    const maxViews = Math.max(...data.map(d => d.views));
    const maxEngagement = Math.max(...data.map(d => d.engagementRate));
    
    // Draw axes
    ctx.strokeStyle = "#E5E5E5";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, rect.height - padding);
    ctx.lineTo(rect.width - padding, rect.height - padding);
    ctx.stroke();
    
    // Draw grid lines
    ctx.strokeStyle = "#F0F0F0";
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(rect.width - padding, y);
      ctx.stroke();
    }
    
    // Draw data lines
    const xStep = chartWidth / (data.length - 1);
    
    // Views line
    ctx.strokeStyle = "#7C9885";
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = padding + xStep * index;
      const y = padding + chartHeight - (point.views / maxViews) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Engagement rate line
    ctx.strokeStyle = "#2C5F5F";
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((point, index) => {
      const x = padding + xStep * index;
      const y = padding + chartHeight - (point.engagementRate / maxEngagement) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    
    // Draw data points
    data.forEach((point, index) => {
      const x = padding + xStep * index;
      const viewsY = padding + chartHeight - (point.views / maxViews) * chartHeight;
      const engagementY = padding + chartHeight - (point.engagementRate / maxEngagement) * chartHeight;
      
      // Views point
      ctx.fillStyle = "#7C9885";
      ctx.beginPath();
      ctx.arc(x, viewsY, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Engagement point
      ctx.fillStyle = "#2C5F5F";
      ctx.beginPath();
      ctx.arc(x, engagementY, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = "#666";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    
    // X-axis labels (dates)
    data.forEach((point, index) => {
      if (index % Math.ceil(data.length / 7) === 0) {
        const x = padding + xStep * index;
        const date = new Date(point.date);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        ctx.fillText(label, x, rect.height - padding + 20);
      }
    });
    
    // Y-axis labels
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      const value = Math.round(maxViews * (1 - i / 4));
      ctx.fillText(value.toLocaleString(), padding - 10, y + 4);
    }
    
  }, [data]);
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-64"
        style={{ width: "100%", height: "256px" }}
      />
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-sage-400 rounded-full"></span>
          <span className="text-sm text-gray-600">Views</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-teal-600 rounded-full"></span>
          <span className="text-sm text-gray-600">Engagement Rate</span>
        </div>
      </div>
    </div>
  );
}