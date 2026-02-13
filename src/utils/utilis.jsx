import { format } from "date-fns"

export function DateText({ date, formatStr = "dd MMM", longFormat = true }) {
    return (
        <>
            {longFormat ? <span className="text-xs text-gray-400">{format(new Date(date), formatStr)}</span> : null}
            <span className={`text-xs break-all  text-gray-400 ${longFormat ? 'ml-3' : ''}`}>{format(new Date(date), "HH:mm")}</span>
        </>
    )
}
