import Image from "next/image";
import Link from "next/link";

export default function LogoPreview() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Logo Preview</h1>
        <p className="text-muted">Review the logo design before we implement it in the Navbar.</p>
      </div>

      <div className="relative w-96 h-96 border border-border-warm bg-white shadow-xl rounded-xl flex items-center justify-center overflow-hidden">
        
        {/* SVG Container */}
        <svg className="absolute inset-0 w-full h-full text-black" viewBox="0 0 200 200">
          
          {/* Inner Circle */}
          <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="6" />

          {/* Left Horizontal Lines */}
          <line x1="25" y1="92" x2="52" y2="92" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <line x1="12" y1="100" x2="52" y2="100" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <line x1="25" y1="108" x2="52" y2="108" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />

          {/* Right Horizontal Lines */}
          <line x1="148" y1="92" x2="175" y2="92" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <line x1="148" y1="100" x2="188" y2="100" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          <line x1="148" y1="108" x2="175" y2="108" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />

          {/* Text Paths */}
          <path id="top-text-path" d="M 30,105 A 70,70 0 0,1 170,105" fill="none" />
          <path id="bottom-text-path" d="M 170,95 A 70,70 0 0,1 30,95" fill="none" />

          {/* Top Text: CALOTES */}
          <text className="fill-current text-[28px] font-black tracking-widest uppercase font-display">
            <textPath href="#top-text-path" startOffset="50%" textAnchor="middle">
              CALOTES
            </textPath>
          </text>

          {/* Bottom Text: VINTAGE */}
          <text className="fill-current text-[24px] font-bold tracking-[0.2em] uppercase font-display">
            <textPath href="#bottom-text-path" startOffset="50%" textAnchor="middle">
              VINTAGE
            </textPath>
          </text>
        </svg>

        {/* Central Animal Image (Lizard) */}
        <div className="absolute flex items-center justify-center w-[45%] h-[45%] rounded-full overflow-hidden">
          <img
            src="/calotes-logo.png"
            alt="Calotes Lizard"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="mt-12 flex gap-4">
        <Link href="/" className="px-6 py-3 bg-bg-warm border border-border text-text hover:bg-border transition-colors uppercase text-sm font-bold tracking-widest">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
