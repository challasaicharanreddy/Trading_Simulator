import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const MarketStatusContext = createContext(null);

export function MarketStatusProvider({ children }) {

    const [marketStatus, setMarketStatus] = useState({
        status: "LOADING",
        open: false
    });

    const fetchMarketStatus = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/app/api/market/status",
                {
                    withCredentials: true
                }
            );

            setMarketStatus(response.data);

        } catch (error) {
            console.error("Failed to fetch market status", error);
        }
    };

    useEffect(() => {

        fetchMarketStatus();

        const interval = setInterval(
            fetchMarketStatus,
            60 * 1000
        );

        return () => clearInterval(interval);

    }, []);

    return (
        <MarketStatusContext.Provider value={marketStatus}>
            {children}
        </MarketStatusContext.Provider>
    );
}

export function useMarketStatus() {
    return useContext(MarketStatusContext);
}