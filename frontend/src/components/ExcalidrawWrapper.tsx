import React, { useEffect, useState } from "react";
import mermaid from "mermaid";

// Initialize mermaid with specific settings
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  theme: "dark",
  darkMode: true,
  themeVariables: {
    fontFamily: "monospace",
    lineColor: "#ffffff",
    textColor: "#ffffff",
    mainBkg: "#1e1e1e",
    nodeBkg: "#2d2d2d",
    clusterBkg: "#1e1e1e"
  }
});

interface ExcalidrawWrapperProps {
  mermaidCode: string;
}

export const ExcalidrawWrapper: React.FC<ExcalidrawWrapperProps> = ({ mermaidCode }) => {
  const [svgCode, setSvgCode] = useState<string>("");

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // Reset mermaid to avoid registration conflicts
        await mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "dark",
          darkMode: true,
        });

        const { svg } = await mermaid.render('graph-div', mermaidCode);
        setSvgCode(svg);
      } catch (error) {
        console.error("Error rendering mermaid diagram:", error);
      }
    };

    renderDiagram();
  }, [mermaidCode]);

  return (
    <div 
      className="w-full h-full border border-gray-700 rounded-lg overflow-visible bg-[#1e1e1e] p-4"
      style={{
        minHeight: "400px",
        minWidth: "600px",
        margin: "0 auto",
        position: "relative"
      }}
    >
      {svgCode ? (
        <div 
          dangerouslySetInnerHTML={{ __html: svgCode }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '50%',
            height: '50%',
            transform: 'scale(2)',
            transformOrigin: 'center center',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(2)'
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {/* Hidden div for mermaid rendering */}
      <div id="graph-div" style={{ display: "none" }} />
    </div>
  );
};

export default ExcalidrawWrapper;