import { DateTime } from "luxon";

const MARKET_TIMEZONE = "America/New_York";

const marketCalendar = {
    holidays: [
        "2026-01-01",
        "2026-01-19",
        "2026-02-16",
        "2026-04-03",
        "2026-05-25",
        "2026-06-19",
        "2026-07-03",
        "2026-09-07",
        "2026-11-26",
        "2026-12-25"
    ],

    earlyClose: {
        "2026-11-27": "13:00",
        "2026-12-24": "13:00"
    }
};

export function getMarketStatus() {
    const now = DateTime.now().setZone(MARKET_TIMEZONE);

    // Saturday or Sunday
    if (now.weekday > 5) {
        return {
            open: false,
            status: "WEEKEND",
            time: now
        };
    }

    const date = now.toISODate();

    // Holiday
    if (marketCalendar.holidays.includes(date)) {
        return {
            open: false,
            status: "HOLIDAY",
            time: now
        };
    }

    // Market opens at 9:30
    const openTime = now.set({
        hour: 9,
        minute: 30,
        second: 0,
        millisecond: 0
    });

    // Normal close = 16:00
    let closeTime = now.set({
        hour: 16,
        minute: 0,
        second: 0,
        millisecond: 0
    });

    // Early close
    const earlyClose = marketCalendar.earlyClose[date];

    if (earlyClose) {
        const [hour, minute] = earlyClose.split(":");

        closeTime = now.set({
            hour: Number(hour),
            minute: Number(minute),
            second: 0,
            millisecond: 0
        });
    }

    if (now < openTime) {
        return {
            open: false,
            status: "BEFORE_OPEN",
            time: now
        };
    }

    if (now >= closeTime) {
        return {
            open: false,
            status: earlyClose ? "EARLY_CLOSE" : "AFTER_CLOSE",
            time: now
        };
    }

    return {
        open: true,
        status: "OPEN",
        time: now
    };
}

export function MarketOpen() {
    return getMarketStatus().open;
}