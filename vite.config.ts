import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    host: "0.0.0.0", // Lắng nghe trên tất cả các địa chỉ IP
    port: 3000, // Bạn có thể thay đổi cổng nếu cần
  },
});
