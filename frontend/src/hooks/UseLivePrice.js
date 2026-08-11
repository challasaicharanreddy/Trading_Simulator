import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

function useLivePrice(symbol) {
  const { socket, isConnected } = useSocket();
  const [price, setPrice] = useState(null);

  useEffect(() => {
    if (!socket || !isConnected || !symbol) return;

    socket.emit("subscribe", symbol);

    const handlePriceUpdate = (priceData) => {
      if (priceData.symbol === symbol) {
        setPrice(priceData);
      }
    };

    socket.on("price", handlePriceUpdate);

    return () => {
      socket.emit("unsubscribe", symbol);
      socket.off("price", handlePriceUpdate);
    };
  }, [socket, isConnected, symbol]);

  return price;
}

export default useLivePrice;