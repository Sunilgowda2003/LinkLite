
import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  X,
  Download,
  Copy,
  Check,
  Link2,
  QrCode,
} from "lucide-react";

import "./QRCodeModal.css";

export default function QRCodeModal({
  open,
  onClose,
  shortCode,
  originalUrl,
  darkMode = false,
}) {
  const qrRef = useRef(null);

  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  const [qrColor, setQrColor] = useState("#111827");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [error, setError] = useState("");

  if (!open || !shortCode) return null;

  const shortUrl = `${window.location.origin}/${shortCode}`;

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector("canvas");

    if (!canvas) {
      setError("Unable to generate QR image. Please try again.");
      return;
    }

    const downloadCanvas = document.createElement("canvas");
    const padding = 32;

    downloadCanvas.width = canvas.width + padding * 2;
    downloadCanvas.height = canvas.height + padding * 2;

    const context = downloadCanvas.getContext("2d");

    if (!context) {
      setError("Unable to prepare QR image.");
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(
      0,
      0,
      downloadCanvas.width,
      downloadCanvas.height
    );

    context.drawImage(canvas, padding, padding);

    const link = document.createElement("a");

    link.download = `LinkLite-QR-${shortCode}.png`;
    link.href = downloadCanvas.toDataURL("image/png");

    link.click();
    setError("");
  };

  const copyShortUrl = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);

      setCopied(true);
      setError("");

      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Unable to copy the URL. Please copy it manually.");
    }
  };

  const handleClose = () => {
    setCopied(false);
    setError("");
    onClose();
  };

  return (
    <div
      className="qr-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
  className={`qr-modal ${
    darkMode ? "qr-modal-dark" : "qr-modal-light"
  }`}
  role="dialog"
  aria-modal="true"
  aria-labelledby="qr-modal-title"
>
        <div className="qr-modal-header">
          <div className="qr-modal-title-group">
            <span className="qr-modal-icon">
              <QrCode size={21} />
            </span>

            <div>
              <h2 id="qr-modal-title">QR Code Generator</h2>
              <p>Share your short link anywhere.</p>
            </div>
          </div>

          <button
            className="qr-close-button"
            onClick={handleClose}
            aria-label="Close QR code modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="qr-modal-body">
          <div className="qr-preview-section">
            <div
              className="qr-preview"
              ref={qrRef}
              style={{ backgroundColor }}
            >
              <QRCodeCanvas
                value={shortUrl}
                size={qrSize}
                bgColor={backgroundColor}
                fgColor={qrColor}
                level="H"
                includeMargin
              />
            </div>

            <span className="qr-preview-caption">
              Scan to open your shortened link
            </span>
          </div>

          <div className="qr-link-section">
            <label>SHORT URL</label>

            <div className="qr-short-url">
              <Link2 size={17} />

              <span title={shortUrl}>{shortUrl}</span>

              <button
                onClick={copyShortUrl}
                aria-label="Copy short URL"
                title="Copy short URL"
              >
                {copied ? (
                  <Check size={17} />
                ) : (
                  <Copy size={17} />
                )}
              </button>
            </div>

            <label>DESTINATION URL</label>

            <p className="qr-original-url" title={originalUrl}>
              {originalUrl}
            </p>
          </div>

          <div className="qr-customization">
            <h3>Customize QR Code</h3>

            <div className="qr-control">
              <label htmlFor="qr-size">QR Code Size</label>

              <div className="qr-size-control">
                <input
                  id="qr-size"
                  type="range"
                  min="128"
                  max="384"
                  step="32"
                  value={qrSize}
                  onChange={(event) =>
                    setQrSize(Number(event.target.value))
                  }
                />

                <span>{qrSize}px</span>
              </div>
            </div>

            <div className="qr-color-controls">
              <div className="qr-control">
                <label htmlFor="qr-color">QR Color</label>

                <input
                  id="qr-color"
                  type="color"
                  value={qrColor}
                  onChange={(event) =>
                    setQrColor(event.target.value)
                  }
                />
              </div>

              <div className="qr-control">
                <label htmlFor="qr-background">Background</label>

                <input
                  id="qr-background"
                  type="color"
                  value={backgroundColor}
                  onChange={(event) =>
                    setBackgroundColor(event.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="qr-error">
              {error}
            </div>
          )}

          <div className="qr-modal-actions">
            <button
              className="qr-download-button"
              onClick={downloadQRCode}
            >
              <Download size={17} />
              Download PNG
            </button>

            <button
              className="qr-secondary-button"
              onClick={copyShortUrl}
            >
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
