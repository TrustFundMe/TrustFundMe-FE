"use client";

import { useState } from "react";
import { X, Trash2, Upload, ImageIcon } from "lucide-react";
import ImageZoomModal, { type ZoomImage } from "@/components/feed-post/ImageZoomModal";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";

interface MediaItem {
  id: number;
  url: string;
  description?: string;
  mediaType?: string;
}

interface ExpenditureGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  media: MediaItem[];
  loading?: boolean;
  onDelete?: (mediaId: number) => void;
  
  // Upload props
  uploadState?: { uploading: boolean; files: File[]; previews: string[] };
  onFileChange?: (files: FileList | null) => void;
  onUploadSubmit?: () => void;
}

export default function ExpenditureGalleryModal({
  isOpen,
  onClose,
  itemName,
  media,
  loading = false,
  onDelete,
  uploadState,
  onFileChange,
  onUploadSubmit,
}: ExpenditureGalleryModalProps) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);

  const safeMedia = Array.isArray(media) ? media : [];
  const zoomImages: ZoomImage[] = safeMedia.map((m) => ({
    url: m.url,
    alt: m.description || `Minh chứng ${m.id}`,
  }));

  const handleThumbClick = (idx: number) => {
    setZoomIndex(idx);
    setZoomOpen(true);
  };

  // 1: col 1 span 2 rows, 2: col 2-3, 3: col 2, 4: col 3 span 2 rows, 5: col 1, 6: col 2
  const getItemClasses = (index: number) => {
    const cycleIndex = index % 6;
    switch (cycleIndex) {
      case 0: return "col-span-1 row-span-2"; // 1st: tall
      case 1: return "col-span-2 row-span-1"; // 2nd: wide
      case 2: return "col-span-1 row-span-1"; // 3rd: normal
      case 3: return "col-span-1 row-span-2"; // 4th: tall
      case 4: return "col-span-1 row-span-1"; // 5th: normal
      case 5: return "col-span-1 row-span-1"; // 6th: normal
      default: return "col-span-1 row-span-1";
    }
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <AnimatePresence>
          {isOpen && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <div className="fixed inset-0 overflow-y-auto z-[41]">
                  <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all"
                    >
                      {/* Header */}
                      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                        <div>
                          <Dialog.Title className="text-xl flex flex-col font-bold text-gray-900">
                            <span className="text-xs font-black uppercase text-orange-500 tracking-wider">Ảnh minh chứng cho</span>
                            {itemName}
                          </Dialog.Title>
                          <p className="text-sm text-gray-500 mt-1">{safeMedia.length} / 10 ảnh</p>
                        </div>
                        <Dialog.Close asChild>
                          <button
                            className="rounded-full p-2 bg-gray-100 hover:bg-red-100 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </Dialog.Close>
                      </div>

                      {/* Body Wrapper */}
                      <div className="flex flex-col md:flex-row gap-6 p-6 h-[70vh] md:h-auto md:max-h-[80vh] overflow-y-auto">
                        
                        {/* Left: Gallery Grid */}
                        <div className="flex-grow w-full md:w-2/3">
                          {loading ? (
                            <div className="flex items-center justify-center h-64">
                              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                            </div>
                          ) : safeMedia.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                              <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
                              <p className="text-gray-500 text-sm font-medium">Chưa có ảnh minh chứng</p>
                            </div>
                          ) : (
                            <div 
                              className="grid grid-cols-3 gap-2 auto-rows-[120px] sm:auto-rows-[160px] md:auto-rows-[180px]"
                              style={{ gridAutoFlow: 'dense' }}
                            >
                              {safeMedia.map((item, idx) => (
                                <div
                                  key={item.id}
                                  className={`relative group/img cursor-pointer overflow-hidden rounded-xl bg-gray-100 ${getItemClasses(idx)}`}
                                  onClick={() => handleThumbClick(idx)}
                                  style={{ border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                                >
                                  <img
                                    src={item.url}
                                    alt={item.description || `Minh chứng ${item.id}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/assets/img/placeholder.png";
                                    }}
                                  />
                                  {/* Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                  
                                  {/* Delete button */}
                                  {onDelete && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(item.id);
                                      }}
                                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 text-white flex items-center justify-center scale-0 group-hover/img:scale-100 transition-transform duration-200 hover:bg-red-600 shadow-md backdrop-blur-sm"
                                      title="Xóa ảnh"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Right: Upload Area */}
                        {(onFileChange && uploadState && media.length < 10) && (
                          <div className="w-full md:w-1/3 flex flex-col gap-4 md:sticky md:top-6 self-start">
                            <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100">
                              <h4 className="font-bold text-gray-800 text-sm mb-4 uppercase tracking-wider">Tải ảnh lên</h4>
                              
                              {/* Upload Dropzone */}
                              <div className="relative group/upload mb-4">
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => onFileChange(e.target.files)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  disabled={uploadState.uploading}
                                />
                                <div className="border-2 border-dashed border-orange-200 bg-white hover:border-orange-400 hover:bg-orange-50 rounded-xl p-6 flex flex-col items-center gap-3 transition-all duration-300 shadow-sm cursor-pointer">
                                  {uploadState.uploading ? (
                                    <div className="w-10 h-10 border-4 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
                                  ) : (
                                    <>
                                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover/upload:scale-110 transition-transform duration-300">
                                        <Upload className="w-6 h-6 text-orange-500" />
                                      </div>
                                      <div className="text-center">
                                        <p className="text-sm font-bold text-gray-700">Chọn hoặc kéo thả ảnh</p>
                                        <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Previews */}
                              {uploadState.previews.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-xs font-semibold text-gray-500 mb-2">Đã chọn ({uploadState.files.length})</p>
                                  <div className="grid grid-cols-4 gap-2">
                                    {uploadState.previews.map((preview, idx) => (
                                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Submit Button */}
                              {uploadState.files.length > 0 && onUploadSubmit && (
                                <button
                                  onClick={onUploadSubmit}
                                  disabled={uploadState.uploading}
                                  className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-md transition-all ${
                                    uploadState.uploading 
                                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                                      : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-orange-200 hover:-translate-y-0.5'
                                  }`}
                                >
                                  <Upload className="w-4 h-4" />
                                  {uploadState.uploading ? 'Đang tải lên...' : `Tải lên ${uploadState.files.length} ảnh`}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Limit Reached message */}
                        {(safeMedia.length >= 10) && (
                          <div className="w-full md:w-1/3 md:sticky md:top-6 self-start">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-center flex flex-col items-center">
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 mb-3">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <p className="text-sm font-bold text-gray-700">Đã đủ 10 ảnh minh chứng</p>
                              <p className="text-xs text-gray-500 mt-1">Bạn cần xóa bớt ảnh cũ để tải ảnh mới lên.</p>
                            </div>
                          </div>
                        )}

                      </div>
                    </motion.div>
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      <ImageZoomModal
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        images={zoomImages}
        initialIndex={zoomIndex}
      />
    </>
  );
}
