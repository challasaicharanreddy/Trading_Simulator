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

    socket.on("priceChange", handlePriceUpdate);

    return () => {
      socket.emit("unsubscribe", symbol);
      socket.off("priceChange", handlePriceUpdate);
    };
  }, [socket, isConnected, symbol]);

  return price;
}

export default useLivePrice;