import { Phone, Copy, Pencil, ArrowLeft, Image, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { updateProfile } from "../api/chatApi";
import { set } from "date-fns";

export default function MyProfile({ myProfile, setIsMyProfile }) {
    const [profileImage, setProfileImage] = useState(null);
    const [name, setName] = useState(myProfile?.name);
    const [avatar, setAvatar] = useState(myProfile?.avatar);
    const [inputType, setInputType] = useState(false);
    const [loading, setLoading] = useState(false);



    const handleUpdateprofile = async () => {
        try {
            setLoading(true);
            const response = await updateProfile({ id: myProfile?.id, name, avatar });
            localStorage.setItem("user", JSON.stringify(response?.user));
            console.log(response);
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setLoading(false);
        }

    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
            setAvatar(file);
        }
    }

    return (
        <div className="w-full h-screen bg-[#0b141a] flex absolute inset-0 z-50">
            {/* LEFT PANEL */}
            <div className="w-[420px] border-r border-[#2a3942] bg-[#111b21] flex flex-col">
                {/* Header */}
                <div className="p-4 text-gray-200 text-lg font-medium border-b border-[#2a3942] flex items-center gap-4">
                    <ArrowLeft onClick={() => setIsMyProfile(false)} className="cursor-pointer" />
                    Profile
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center py-8 ">
                    <div className="relative group">
                        <img
                            src={
                                profileImage ? profileImage : myProfile?.avatar ? `${import.meta.env.VITE_APP_URL}/storage/${myProfile?.avatar}` : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            }
                            className="w-36 h-36 rounded-full object-cover hover:cursor-pointer hover:bg-[#202c33] "
                        />
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-[50%] right-[50%] translate-x-1/2 translate-y-1/2 flex flex-col w-full h-full rounded-full bg-[#202c33]/60 text-xs items-center justify-center gap-2 cursor-pointer"
                            onClick={() => document.querySelector("input[type=file].myProfilePhoto").click()}
                        >
                            <Image />
                            <span>Change profile picture </span>
                            <input type="file" accept="image/*" className="hidden myProfilePhoto" onChange={handleImageChange} />
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="px-6 space-y-8 text-sm">
                    {/* Name */}
                    <InfoRow
                        label="Name"
                        value={name || "—"}
                        action={<Pencil size={20} className="cursor-pointer" />}
                        inputType={inputType}
                        onClick={() => setInputType(!inputType)}
                        onChange={(e) => setName(e.target.value)}
                    />

                    {/* About */}
                    <InfoRow
                        label="About"
                        value={myProfile?.status || "Hey there! I am using WhatsApp."}
                    />

                    {/* Phone */}
                    <InfoRow
                        label="Phone"
                        value={myProfile?.phone_number || "—"}
                        icon={<Phone size={20} className="cursor-pointer" />}
                        action={<Copy size={20} className="cursor-pointer" />}
                        onClick={() => window.navigator.clipboard.writeText(myProfile?.phone_number)}
                    />
                </div>
                <button className="bg-[#00a884] p-3 rounded-full mt-auto w-fit justify-self-center items-self-center mx-auto mb-12 cursor-pointer" onClick={handleUpdateprofile}>
                    {loading ? <Loader2 size={26} className="animate-spin" /> : <Check size={26} />}
                </button>
            </div>

            {/* RIGHT EMPTY PANEL */}
            <div className="flex-1  items-center justify-center hidden md:flex">
                <div className="flex flex-col items-center text-gray-400 gap-3">
                    <div className="w-20 h-20 rounded-full bg-[#202c33] flex items-center justify-center">
                        <svg
                            viewBox="0 0 24 24"
                            width="32"
                            height="32"
                            fill="currentColor"
                        >
                            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
                        </svg>
                    </div>
                    <p className="text-lg">Profile</p>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value, icon, action, onClick, inputType, onChange }) {

    return (
        <div className="flex items-start justify-between group text-lg">
            <div className="flex items-start gap-3">

                <div className="flex flex-col gap-2 items-start">
                    <p className="text-sm text-gray-400 mb-1">{label}</p>
                    <div className="flex items-center gap-7">
                        {icon && (
                            <div className="text-gray-400 mt-1 cursor-pointer" >{icon}</div>
                        )}
                        {inputType ? <input className=" border-green-400 outline-none w-full border-b-2" type="text" value={value} onChange={onChange} /> : <p className="text-gray-200">{value}</p>}
                    </div>
                </div>
            </div>

            {action && (
                <button className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white" onClick={onClick}>
                    {action}
                </button>
            )}
        </div>
    );
}