import { useRef } from "react";

type Props = {
  onPick: (file: File) => Promise<void> | void;
  label?: string;
  accept?: string;
  className?: string;
};

export default function SampleUploadButton({
  onPick,
  label = "Add Sample",
  accept = "audio/*",
  className,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => fileInputRef.current?.click();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file) return;
    await onPick(file);
  };
  return (
    <div className={className}>
      <button className="button-primary" onClick={handleClick}>
        {label}
      </button>
      <input
        title="File"
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </div>
  );
}
