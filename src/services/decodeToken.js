import { jwtDecode } from "jwt-decode";

function decodeToken(token) {
  try {
    const decoded = jwtDecode(token);
    console.log(decoded);
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}
export default decodeToken;

