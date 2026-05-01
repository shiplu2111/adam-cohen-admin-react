
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import getCroppedImg from '@/lib/crop-image'

interface ImageCropperProps {
  image: string | null
  aspect: number
  onCropComplete: (croppedImage: Blob) => void
  onCancel: () => void
  title?: string
}

export function ImageCropper({ image, aspect, onCropComplete, onCancel, title = "Crop Image" }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const onCropChange = (crop: any) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: any) => {
    setZoom(zoom)
  }

  const onCropCompleteCallback = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!image || !croppedAreaPixels) return
    const croppedImage = await getCroppedImg(image, croppedAreaPixels)
    if (croppedImage) {
      onCropComplete(croppedImage)
    }
  }

  if (!image) return null

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative h-[400px] w-full bg-black rounded-md overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={onZoomChange}
          />
        </div>
        <div className="space-y-2 py-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Zoom</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={([val]) => setZoom(val)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} className="gold-bg text-primary-foreground">Done Cropping</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
