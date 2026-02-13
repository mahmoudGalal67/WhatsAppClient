import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isSameOrAfter);

export function formatWhatsAppDate(date) {
    const d = dayjs(date);
    const now = dayjs();

    // Today → show time
    if (d.isToday()) {
        return d.format("HH:mm");
    }

    // Yesterday
    if (d.isYesterday()) {
        return "Yesterday";
    }

    // Same week → weekday
    if (d.isSame(now, "week")) {
        return d.format("dddd"); // Monday
    }

    // Same year → 12 Feb
    if (d.isSame(now, "year")) {
        return d.format("DD MMM");
    }

    // Older → 12/02/2024
    return d.format("DD/MM/YYYY");
}
