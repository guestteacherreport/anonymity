export default function IconsPage() {
  return (
    <div className="icons-container">
      <div className="icons-grid">
        {/* Hotel Icon */}
        <div className="icon-card">
          <svg
            className="icon-svg"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" stroke="#C5464A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {/* Triangular roof */}
              <path d="M 30 55 L 50 20 L 70 55" />
              {/* Main building body */}
              <rect x="28" y="55" width="44" height="30" />
              {/* Door in center */}
              <rect x="44" y="65" width="12" height="20" />
              {/* Door frame */}
              <line x1="50" y1="65" x2="50" y2="85" />
              {/* Windows row 1 */}
              <rect x="33" y="60" width="6" height="6" />
              <rect x="42" y="60" width="6" height="6" />
              <rect x="52" y="60" width="6" height="6" />
              <rect x="61" y="60" width="6" height="6" />
              {/* Windows row 2 */}
              <rect x="33" y="70" width="6" height="6" />
              <rect x="61" y="70" width="6" height="6" />
            </g>
          </svg>
          <h3 className="icon-title">I am a hotel</h3>
          <p className="icon-description">For hotels looking for channel management, booking engine, or distribution support.</p>
        </div>

        {/* Technology Partner Icon */}
        <div className="icon-card">
          <svg
            className="icon-svg"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" stroke="#999999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {/* 4-pointed decorative star/gear shape */}
              <circle cx="50" cy="50" r="18" />
              {/* Top point */}
              <path d="M 50 20 L 54 32 L 46 32 Z" />
              {/* Right point */}
              <path d="M 80 50 L 68 54 L 68 46 Z" />
              {/* Bottom point */}
              <path d="M 50 80 L 54 68 L 46 68 Z" />
              {/* Left point */}
              <path d="M 20 50 L 32 54 L 32 46 Z" />
              {/* Inner details - small circles at cardinal points */}
              <circle cx="50" cy="32" r="2" />
              <circle cx="68" cy="50" r="2" />
              <circle cx="50" cy="68" r="2" />
              <circle cx="32" cy="50" r="2" />
            </g>
          </svg>
          <h3 className="icon-title">I am a technology partner</h3>
          <p className="icon-description">For PMS, booking engines, channel managers and other hotel technology companies.</p>
        </div>

        {/* Support Icon */}
        <div className="icon-card">
          <svg
            className="icon-svg"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" stroke="#999999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {/* Headphone band - curved top */}
              <path d="M 25 55 Q 25 28 50 28 Q 75 28 75 55" />
              {/* Left ear cup - rounded rectangle */}
              <rect x="16" y="55" width="18" height="20" rx="9" />
              {/* Right ear cup - rounded rectangle */}
              <rect x="66" y="55" width="18" height="20" rx="9" />
              {/* Left ear cup inner ring */}
              <circle cx="25" cy="65" r="6" />
              {/* Right ear cup inner ring */}
              <circle cx="75" cy="65" r="6" />
            </g>
          </svg>
          <h3 className="icon-title">I need support</h3>
          <p className="icon-description">For existing customers needing help or technical support.</p>
        </div>
      </div>

      <style>{`
        .icons-container {
          padding: 40px 20px;
          background-color: #f5f5f5;
        }

        .icons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .icon-card {
          background: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          padding-bottom: 20px;
        }

        .icon-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: #C5464A;
          border-radius: 0 0 8px 8px;
        }

        .icon-svg {
          width: 60px;
          height: 60px;
          margin: 0 auto 20px;
          display: block;
        }

        .icon-title {
          font-size: 16px;
          font-weight: 600;
          color: #C5464A;
          margin: 15px 0 10px;
        }

        .icon-description {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 768px) {
          .icons-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .icons-container {
            padding: 30px 15px;
          }

          .icon-card {
            padding: 25px 15px;
          }
        }
      `}</style>
    </div>
  );
}
