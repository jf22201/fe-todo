import { useState, useEffect, useCallback } from "react";

export default function BlobImageDisplay({ blob, caption, size }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (blob) {
      const binaryString = window.atob(blob);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blobObject = new Blob([bytes], { type: "image/jpeg" });
      const url = URL.createObjectURL(blobObject);
      setImageUrl(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [blob]);

  const handleModalClick = useCallback((e) => {
    // Close only if clicking the backdrop (not the image)
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  }, []);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isModalOpen]);

  const sizeClass = size === "s" ? "w-1/4" : size === "md" ? "w-1/2" : "w-full";

  if (!imageUrl) return null;

  return (
    <div className="flex justify-center mb-4">
      <img
        src={imageUrl}
        alt={caption}
        className={`${sizeClass} h-auto cursor-pointer`}
        onClick={() => setIsModalOpen(true)}
      />

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 flex justify-center items-center z-50"
          onClick={handleModalClick}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <img
              src={imageUrl}
              alt={caption}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
