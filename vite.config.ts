import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    return {
        plugins: [react()],
        server: {
            port: 5173
        },
        base: "/gallery",
        define: {
            GALLERY_API_BASE_URL: JSON.stringify(env.GALLERY_API_BASE_URL)
        }
    }
})


