import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // tesseract.js spawna um worker script por caminho de arquivo; precisa
  // ficar fora do bundle do servidor para esse caminho resolver em runtime.
  serverExternalPackages: ["tesseract.js"],
};

export default nextConfig;
