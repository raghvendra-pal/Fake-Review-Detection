"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ZoomIn, ZoomOut, Maximize2, Users, AlertTriangle, ShieldCheck } from "lucide-react";
import { NetworkGraphData } from "@/lib/types";

// Dynamic import with SSR disabled to prevent canvas window undefined error
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface NetworkGraphProps {
  graphData: NetworkGraphData;
  onSelectAccount?: (accountName: string) => void;
}

export default function NetworkGraph({ graphData, onSelectAccount }: NetworkGraphProps) {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(400, containerRef.current.clientHeight || 450),
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleZoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 400);
  const handleZoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() * 0.7, 400);
  const handleZoomFit = () => fgRef.current?.zoomToFit(400, 30);

  const getNodeColor = (node: any) => {
    if (node.risk_score >= 70) return "#EF4444"; // coral
    if (node.risk_score >= 40) return "#F59E0B"; // amber
    return "#10B981"; // emerald
  };

  return (
    <div className="flex flex-col h-full w-full relative" ref={containerRef}>
      {/* Top Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 border-b border-white/[0.08] bg-ink-950/60 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-threat-500 shadow-glow-threat" />
            <span className="text-slate-300">High Risk Syndicate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warning-500" />
            <span className="text-slate-300">Patterned / Suspicious</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-trust-500" />
            <span className="text-slate-300">Organic Account</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-white/[0.05] p-1 rounded-lg border border-white/10">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomFit}
            className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="w-full flex-1 min-h-[400px] bg-ink-950/80 relative overflow-hidden">
        {graphData.nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
            <Users className="w-8 h-8 text-slate-600 mb-2" />
            No account network data available.
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={{
              nodes: graphData.nodes,
              links: graphData.links,
            }}
            nodeLabel={(node: any) => `
              <div style="background:#0F172A;color:#F8FAFC;padding:6px 10px;border-radius:8px;font-family:sans-serif;font-size:11px;border:1px solid #334155;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
                <b>${node.label}</b><br/>
                Risk Score: <span style="color:${node.risk_score >= 50 ? '#EF4444' : '#10B981'};font-weight:bold;">${node.risk_score}/100</span><br/>
                Reviews: ${node.total_reviews} (${node.avg_rating}★ avg)<br/>
                Cluster: ${node.cluster_name}
              </div>
            `}
            nodeColor={getNodeColor}
            nodeRelSize={6}
            linkColor={() => "rgba(255, 255, 255, 0.2)"}
            linkWidth={(link: any) => link.value || 1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => "#06B6D4"}
            backgroundColor="transparent"
            onNodeClick={(node: any) => {
              if (onSelectAccount) {
                onSelectAccount(node.id);
              }
            }}
          />
        )}

        {/* Bottom helper pill */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-slate-400 pointer-events-none">
          Click any account node to inspect full review history & flags
        </div>
      </div>
    </div>
  );
}
