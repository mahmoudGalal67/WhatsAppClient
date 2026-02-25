import { memo } from "react";

const SelectionCheckbox = memo(function SelectionCheckbox({
    checked,
    onChange,
}) {
    return (
        <label className="relative flex items-center cursor-pointer my-auto">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="peer sr-only"
            />
            <div className="w-5 h-5 rounded-md border-2 border-lightgray flex items-center justify-center peer-checked:bg-[#00a884] peer-checked:border-[#00a884]">
                <svg
                    className={`w-3 h-3 text-black ${checked ? "opacity-100" : "opacity-0"
                        }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
        </label>
    );
});

export default SelectionCheckbox;
