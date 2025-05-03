import jwtDecode from "jwt-decode";

function decodeToken(token) {
  try {
    const decoded = jwtDecode(token);
    console.log(decoded); // Payload content of the token
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}
