import * as XLSX from "xlsx";
import { useState } from "react";
import axios from "axios";
import { addMultiChat } from "../api/chatApi";
import { useAuth } from "../context/AuthContext";

export default function ExcelUpload({ setContacts, setChats }) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log("Excel rows:", jsonData);
        // 🔥 validate + normalize
        const formatted = jsonData
            .map((row) => ({
                name: row.name?.toString().trim(),
                number: row.number?.toString().trim(),
            }))
            .filter((row) => row.name && row.number);

        if (!formatted.length) {
            alert("No valid rows found");
            return;
        }

        try {
            setLoading(true);

            const response = await addMultiChat({ user_one_id: user.id, other_users: jsonData })
            const newContacts = response.map((chat) => chat.users.find((u) => u.id != user.id));
            setChats((prev) => [...response, ...prev])
            setContacts((prev) => [...newContacts, ...prev])
        } catch (err) {
            console.error(err);
            alert("Error creating chats");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-green-400 px-4 py-2 rounded-md cursor-pointer hover:opacity-80" onClick={() => document.querySelector('.uploadContactByExcell')?.click()}>
                <input
                    type="file"
                    className="hidden uploadContactByExcell"
                    accept=".xlsx,.xls"
                    onChange={handleFile}

                    disabled={loading}
                />
                {loading ? <p>Uploading...</p> : "Create Contacts By Excell Sheet"}
            </div>
        </div>
    );
}