'use client'

import { useEffect, useState, useRef } from "react";
import QRCode from "react-qr-code";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";

interface DJQRCodeProps {
  userId: string;
}

export function DJQRCode({ userId }: DJQRCodeProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const qrContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate the full URL using the current origin
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/dj/${userId}`;
      setQrUrl(url);
    }
  }, [userId]);

  const handleDownload = () => {
    if (!qrUrl || !qrContainerRef.current) return;

    // Find the SVG element within the container
    const svg = qrContainerRef.current.querySelector("svg");
    if (!svg) {
      toast.error("QR code not found");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `dj-qr-code-${userId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success("QR code downloaded!");
    };

    img.onerror = () => {
      toast.error("Failed to download QR code");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopy = () => {
    if (!qrUrl) return;
    navigator.clipboard.writeText(qrUrl);
    toast.success("URL copied to clipboard!");
  };

  if (!qrUrl) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your DJ QR Code</CardTitle>
        <CardDescription>
          Share this QR code to let people easily join your active queue. This code never changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-lg border" ref={qrContainerRef}>
          <QRCode
            value={qrUrl}
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        </div>
        <div className="w-full max-w-md">
          <p className="text-sm text-muted-foreground mb-2 break-all text-center">
            {qrUrl}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleCopy} variant="default" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
            <Button onClick={handleDownload} variant="default" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

