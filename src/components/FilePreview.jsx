function FilePreview({ message, url }) {
    switch (message.type) {
        case "image":
            return (
                <img
                    src={url || message.file_path}
                    className="rounded-lg max-w-[220px]"
                />
            );

        case "video":
            return (
                <video
                    controls
                    className="rounded-lg max-w-[240px] mr-10"
                    src={url}
                />
            );

        case "pdf":
            return (
                <a href={url} target="_blank" className="file-card mr-10">
                    📄 PDF
                </a>
            );

        case "excel":
            return (
                <a href={url} target="_blank" className="file-card mr-10">
                    📊 Excel
                </a>
            );

        case "word":
            return (
                <a href={url} target="_blank" className="file-card mr-10">
                    📝 Word
                </a>
            );

        default:
            return (
                <a href={url} target="_blank" className="file-card mr-10">
                    📄 PDF
                </a>
            );
    }
}

export default FilePreview;
