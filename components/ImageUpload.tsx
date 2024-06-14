"use client";

import { useEffect, useState } from "react";
import { CldUploadButton } from "next-cloudinary";
import Image from "next/image";
interface ImageUploadProps {
  value: string;
  onChange: (src: string) => void;
  disabled?: boolean;
}
export const ImageUpload = ({
  value,
  onChange,
  disabled,
}: ImageUploadProps) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return null;
  }
  return (
    <div className="space-y-4 w-full flex flex-col justify-center items-center">
      <CldUploadButton
        options={{ maxFiles: 1 }}
        onUpload={(result: any) => onChange(result.info.secure_url)}
        uploadPreset="wft21zbt"
      >
        <div className="p-4 border-4 border-dashed border-primary/10 rounded-lg flex flex-col space-y-2 items-center justify-center transition hover:opacity-75">
          <div className="relative w-40 h-40">
            <Image
              fill
              alt="Upload"
              src={value || "/placeholder.svg"}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </CldUploadButton>
    </div>
  );
};
