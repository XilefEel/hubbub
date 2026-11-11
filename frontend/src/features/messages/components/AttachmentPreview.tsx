import FilePreview from "./FilePreview";

export default function AttachmentPreview({
  files,
  handleRemoveFile,
}: {
  files: File[];
  handleRemoveFile: (index: number) => void;
}) {
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {files.map((file, index) => (
        <FilePreview
          key={`${file.name}-${index}`}
          file={file}
          onRemove={() => handleRemoveFile(index)}
        />
      ))}
    </div>
  );
}
