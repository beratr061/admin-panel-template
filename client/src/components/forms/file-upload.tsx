"use client"

import * as React from "react"
import { Upload, X, File, Image, FileText, Film, Music } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface FileUploadProps {
  accept?: string
  maxSize?: number // in bytes
  multiple?: boolean
  onUpload?: (files: File[]) => Promise<void>
  onProgress?: (progress: number) => void
  onFilesChange?: (files: File[]) => void
  preview?: boolean
  disabled?: boolean
  className?: string
}

interface FileWithPreview extends File {
  preview?: string
}

function FileUpload({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  onUpload,
  onProgress,
  onFilesChange,
  preview = true,
  disabled = false,
  className,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<number>(0)
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `Dosya boyutu ${formatFileSize(maxSize)} limitini aşıyor`
    }
    if (accept) {
      const acceptedTypes = accept.split(",").map((t) => t.trim())
      const fileType = file.type
      const fileExtension = `.${file.name.split(".").pop()}`
      const isAccepted = acceptedTypes.some(
        (type) =>
          type === fileType ||
          type === fileExtension ||
          (type.endsWith("/*") && fileType.startsWith(type.replace("/*", "/")))
      )
      if (!isAccepted) {
        return "Desteklenmeyen dosya türü"
      }
    }
    return null
  }

  const processFiles = (fileList: FileList | File[]) => {
    setError(null)
    const newFiles: FileWithPreview[] = []

    const filesToProcess = Array.from(fileList)
    for (const file of filesToProcess) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        continue
      }

      const fileWithPreview = file as FileWithPreview
      if (preview && file.type.startsWith("image/")) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }
      newFiles.push(fileWithPreview)
    }

    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ""
  }

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index]
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const handleUpload = async () => {
    if (files.length === 0 || !onUpload) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = Math.min(prev + 10, 90)
          onProgress?.(newProgress)
          return newProgress
        })
      }, 200)

      await onUpload(files)

      clearInterval(progressInterval)
      setUploadProgress(100)
      onProgress?.(100)

      // Clear files after successful upload
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
      setFiles([])
      onFilesChange?.([])
    } catch (err) {
      setError("Yükleme sırasında bir hata oluştu")
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  // Cleanup previews on unmount
  React.useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-medium text-foreground">Dosya seçmek için tıklayın</span>
          {" "}veya sürükleyip bırakın
        </p>
        {accept && (
          <p className="text-xs text-muted-foreground mt-1">
            Desteklenen formatlar: {accept}
          </p>
        )}
        {maxSize && (
          <p className="text-xs text-muted-foreground">
            Maksimum boyut: {formatFileSize(maxSize)}
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Progress bar */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Yükleniyor...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* File list with previews */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              {/* Preview or icon */}
              {preview && file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                  {getFileIcon(file.type)}
                </div>
              )}

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Remove button */}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemoveFile(index)}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Upload button */}
          {onUpload && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="w-full"
            >
              {isUploading ? "Yükleniyor..." : "Yükle"}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return <Image className="h-6 w-6 text-muted-foreground" />
  }
  if (mimeType.startsWith("video/")) {
    return <Film className="h-6 w-6 text-muted-foreground" />
  }
  if (mimeType.startsWith("audio/")) {
    return <Music className="h-6 w-6 text-muted-foreground" />
  }
  if (mimeType.includes("pdf") || mimeType.includes("document")) {
    return <FileText className="h-6 w-6 text-muted-foreground" />
  }
  return <File className="h-6 w-6 text-muted-foreground" />
}

export { FileUpload }
