// vite.config.ts
import { defineConfig } from "file:///Users/paulchristophe/Documents/GitHub/client/node_modules/vite/dist/node/index.js";
import solidPlugin from "file:///Users/paulchristophe/Documents/GitHub/client/node_modules/vite-plugin-solid/dist/esm/index.mjs";
import path from "node:path";
import dts from "file:///Users/paulchristophe/Documents/GitHub/client/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/paulchristophe/Documents/GitHub/client/packages/components";
var vite_config_default = defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true
    }),
    solidPlugin()
  ],
  build: {
    lib: {
      // eslint-disable-next-line
      entry: path.resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "components",
      fileName: "index"
    },
    target: "esnext",
    rollupOptions: {
      external: ["solid-js"]
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    transformMode: {
      web: [/\.[jt]sx?$/]
    },
    // vitest can't seem to find jest-dom, it looks
    // locally but not at the root node_modules
    setupFiles: ["../../node_modules/@testing-library/jest-dom/extend-expect.js"],
    // solid needs to be inline to work around
    // a resolution issue in vitest:
    deps: {
      inline: [/solid-js/]
    },
    // if you have few tests, try commenting one
    // or both out to improve performance:
    threads: false,
    isolate: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcGF1bGNocmlzdG9waGUvRG9jdW1lbnRzL0dpdEh1Yi9jbGllbnQvcGFja2FnZXMvY29tcG9uZW50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3BhdWxjaHJpc3RvcGhlL0RvY3VtZW50cy9HaXRIdWIvY2xpZW50L3BhY2thZ2VzL2NvbXBvbmVudHMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3BhdWxjaHJpc3RvcGhlL0RvY3VtZW50cy9HaXRIdWIvY2xpZW50L3BhY2thZ2VzL2NvbXBvbmVudHMvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCBzb2xpZFBsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1zb2xpZCc7XG5pbXBvcnQgcGF0aCBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgZHRzKHtcbiAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWVcbiAgICB9KSxcbiAgICBzb2xpZFBsdWdpbigpXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICAgIGVudHJ5OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2luZGV4LnRzJyksXG4gICAgICBuYW1lOiAnY29tcG9uZW50cycsXG4gICAgICBmaWxlTmFtZTogJ2luZGV4J1xuICAgIH0sXG4gICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogWydzb2xpZC1qcyddXG4gICAgfVxuICB9LFxuICB0ZXN0OiB7XG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICB0cmFuc2Zvcm1Nb2RlOiB7XG4gICAgICB3ZWI6IFsvXFwuW2p0XXN4PyQvXVxuICAgIH0sXG4gICAgLy8gdml0ZXN0IGNhbid0IHNlZW0gdG8gZmluZCBqZXN0LWRvbSwgaXQgbG9va3NcbiAgICAvLyBsb2NhbGx5IGJ1dCBub3QgYXQgdGhlIHJvb3Qgbm9kZV9tb2R1bGVzXG4gICAgc2V0dXBGaWxlczogWycuLi8uLi9ub2RlX21vZHVsZXMvQHRlc3RpbmctbGlicmFyeS9qZXN0LWRvbS9leHRlbmQtZXhwZWN0LmpzJ10sXG4gICAgLy8gc29saWQgbmVlZHMgdG8gYmUgaW5saW5lIHRvIHdvcmsgYXJvdW5kXG4gICAgLy8gYSByZXNvbHV0aW9uIGlzc3VlIGluIHZpdGVzdDpcbiAgICBkZXBzOiB7XG4gICAgICBpbmxpbmU6IFsvc29saWQtanMvXVxuICAgIH0sXG4gICAgLy8gaWYgeW91IGhhdmUgZmV3IHRlc3RzLCB0cnkgY29tbWVudGluZyBvbmVcbiAgICAvLyBvciBib3RoIG91dCB0byBpbXByb3ZlIHBlcmZvcm1hbmNlOlxuICAgIHRocmVhZHM6IGZhbHNlLFxuICAgIGlzb2xhdGU6IGZhbHNlXG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLFNBQVM7QUFKaEIsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLE1BQ0Ysa0JBQWtCO0FBQUEsSUFDcEIsQ0FBQztBQUFBLElBQ0QsWUFBWTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLEtBQUs7QUFBQTtBQUFBLE1BRUgsT0FBTyxLQUFLLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQzdDLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxJQUNaO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMsVUFBVTtBQUFBLElBQ3ZCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0osYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsZUFBZTtBQUFBLE1BQ2IsS0FBSyxDQUFDLFlBQVk7QUFBQSxJQUNwQjtBQUFBO0FBQUE7QUFBQSxJQUdBLFlBQVksQ0FBQywrREFBK0Q7QUFBQTtBQUFBO0FBQUEsSUFHNUUsTUFBTTtBQUFBLE1BQ0osUUFBUSxDQUFDLFVBQVU7QUFBQSxJQUNyQjtBQUFBO0FBQUE7QUFBQSxJQUdBLFNBQVM7QUFBQSxJQUNULFNBQVM7QUFBQSxFQUNYO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
