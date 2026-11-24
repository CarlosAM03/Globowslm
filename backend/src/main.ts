import { createApp } from "./app.js";
import { API_CONFIG, type ApiConfig } from "./config.js";

try {
  const app = await createApp();
  const { port } = app.get<ApiConfig>(API_CONFIG);
  await app.listen(port, "0.0.0.0");
  console.log(JSON.stringify({ event: "api_listening", port }));
} catch {
  console.error(JSON.stringify({ event: "startup_failed" }));
  process.exitCode = 1;
}
