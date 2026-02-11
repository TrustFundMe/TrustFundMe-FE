interface ChatComposerProps {
  inputMessage: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isSending?: boolean;
  isUploadingImage?: boolean;
  imagePreviews: string[];
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  selectedFiles?: File[];
  uploadProgress?: number;
}

export default function ChatComposer({
  inputMessage,
  onInputChange,
  onSend,
  isSending = false,
  isUploadingImage = false,
  imagePreviews,
  onImageSelect,
  onRemoveImage,
  fileInputRef,
  disabled = false,
  selectedFiles = [],
  uploadProgress = 0,
}: ChatComposerProps) {
  const hasContent = inputMessage.trim().length > 0 || imagePreviews.length > 0;
  const isInputBusy = isSending || isUploadingImage;
  const isActionDisabled = disabled || isInputBusy;
  const isSendDisabled = isActionDisabled || !hasContent;

  return (
    <div className="border-t bg-white flex flex-col flex-shrink-0" style={{ borderColor: '#e5e7eb' }}>
      {/* Upload Progress Bar */}
      {isUploadingImage && (
        <div className="h-1 bg-gray-100 w-full overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-300 ease-out"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Image Preview - Fixed */}
      {imagePreviews.length > 0 && (
        <div className="p-2 border-b bg-gray-50 overflow-x-auto flex-shrink-0" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-2">
            {imagePreviews.map((preview, index) => {
              const file = selectedFiles?.[index];
              const isVideo = file?.type.startsWith('video/');

              return (
                <div key={index} className="relative flex-shrink-0">
                  {isVideo ? (
                    <div className="w-16 h-16 rounded-lg bg-black overflow-hidden border border-slate-200 relative group">
                      <video
                        src={preview}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/center" fill="white" viewBox="0 0 24 24" className="w-6 h-6 opacity-80">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                    />
                  )}
                  <button
                    onClick={() => onRemoveImage(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm"
                    title="Xóa"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-3 flex items-center space-x-2 flex-shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          multiple
          onChange={onImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isActionDisabled}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border"
          style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444' }}
          title="Chọn ảnh"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
            style={{ color: '#dc2626' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574v9.176A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25v-9.176c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
            />
          </svg>
        </button>
        <input
          className="flex-1 text-sm px-3 py-2 rounded-full border focus:outline-none focus:ring-2"
          placeholder="Nhập tin nhắn của bạn..."
          style={{ borderColor: '#e5e7eb' }}
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && hasContent && !isSending && !isUploadingImage) {
              e.preventDefault();
              onSend();
            }
          }}
          disabled={isSending || isUploadingImage || disabled}
        />
        <button
          onClick={onSend}
          disabled={isSendDisabled}
          className="px-3 py-2 rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#dc2626' }}
        >
          {isUploadingImage ? 'Đang upload...' : isSending ? 'Đang gửi...' : 'Gửi'}
        </button>
      </div>
    </div>
  );
}
