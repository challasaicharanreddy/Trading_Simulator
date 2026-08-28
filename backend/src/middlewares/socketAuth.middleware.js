import jwt from "jsonwebtoken";

function socketAuthMiddleware(socket, next) {
  const cookieHeader = socket.handshake.headers?.cookie;

  if (!cookieHeader) {
    socket.userId = "guest";
    return next();
  }

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => c.trim()).map((c) => {
      const i = c.indexOf("=");
      return [c.slice(0, i), decodeURIComponent(c.slice(i + 1))];
    })
  );

  const token = cookies.accessToken;

  if (!token) {
    socket.userId = "guest";
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    socket.userId = "guest";
    next();
  }
}

export default socketAuthMiddleware;