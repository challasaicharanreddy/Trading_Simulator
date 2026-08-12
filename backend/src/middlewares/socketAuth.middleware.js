import jwt from "jsonwebtoken";

function socketAuthMiddleware(socket, next) {
  const cookieHeader = socket.handshake.headers?.cookie;

  if (!cookieHeader) {
    return next(new Error("Authentication cookie is missing"));
  }

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => c.trim()).map((c) => {
      const i = c.indexOf("=");
      return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
    })
  );

  const token = cookies.accessToken;

  if (!token) {
    return next(new Error("Authentication token is missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
}

export default socketAuthMiddleware;