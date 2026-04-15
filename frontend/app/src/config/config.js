function cleanEnvVar(value) {
  return value.replace(/^"(.*)"$/, "$1");
}

const config = {
  backendEndpoint: "http://localhost:5000/api", // ✅ FIXED
};

export default config;