import rawConfig from "../config/taxConfig.json";

/**
 * Recursively walk bracket arrays and replace null max values with Infinity.
 * JSON cannot represent Infinity, so it's stored as null in taxConfig.json.
 */
function convertNullToInfinity(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertNullToInfinity);
  }
  if (obj !== null && typeof obj === "object") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "max" && value === null) {
        result[key] = Infinity;
      } else {
        result[key] = convertNullToInfinity(value);
      }
    }
    return result;
  }
  return obj;
}

const TAX_CONFIG = convertNullToInfinity(rawConfig);

export default TAX_CONFIG;
