'use client'

import { useState, useCallback, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { AnimatedTimeline } from './AnimatedTimeline'

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageEditor() {
  const [imgSrc, setImgSrc] = useState('')
  const [removedBgSrc, setRemovedBgSrc] = useState('')
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [format, setFormat] = useState('webp')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const timelineSteps = [
    { label: 'Remove Background', isActive: activeStep >= 0 },
    { label: 'Crop Image', isActive: activeStep >= 1 },
    { label: 'Download Image', isActive: activeStep >= 2 },
  ]

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '')
        setCropArea({ x: 0, y: 0, width: 0, height: 0 })
        setActiveStep(0)
      })
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const onImageLoad = () => {
    if (imgRef.current && containerRef.current) {
      const { width, height } = imgRef.current
      const containerWidth = containerRef.current.offsetWidth
      const containerHeight = containerRef.current.offsetHeight
      const aspectRatio = width / height
      let newWidth = containerWidth
      let newHeight = containerWidth / aspectRatio

      if (newHeight > containerHeight) {
        newHeight = containerHeight
        newWidth = containerHeight * aspectRatio
      }

      setCropArea({
        x: newWidth * 0.1,
        y: newHeight * 0.1,
        width: newWidth * 0.8,
        height: newHeight * 0.8,
      })
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setIsDragging(true)
    }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const endPos = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      const width = Math.abs(endPos.x - startPos.x)
      const height = Math.abs(endPos.y - startPos.y)
      const x = Math.min(startPos.x, endPos.x)
      const y = Math.min(startPos.y, endPos.y)
      setCropArea({ x, y, width, height })
    }
  }

  const onMouseUp = () => {
    setIsDragging(false)
  }

  const onDownloadCrop = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleX = imgRef.current.naturalWidth / containerRef.current.offsetWidth
    const scaleY = imgRef.current.naturalHeight / containerRef.current.offsetHeight
    canvas.width = cropArea.width * scaleX
    canvas.height = cropArea.height * scaleY

    ctx.drawImage(
      imgRef.current,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `cropped-image.${format}`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      },
      `image/${format}`,
      1
    )
    setActiveStep(3)
  }, [cropArea, format])

  const removeBackground = async () => {
    if (!imgSrc) return

    setIsLoading(true)
    setError('')

    try {
      const formData = new FormData()
      const blob = await fetch(imgSrc).then((r) => r.blob())
      formData.append('image_file', blob, 'image.png')

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY || '',
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to remove background')
      }

      const removedBgBlob = await response.blob()
      const url = URL.createObjectURL(removedBgBlob)
      setRemovedBgSrc(url)
      setActiveStep(1)
    } catch (err) {
      setError('Failed to remove background. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-8">
      <Card className="mx-auto max-w-4xl">
        <CardContent className="p-6">
          <AnimatedTimeline steps={timelineSteps} />
          <Tabs defaultValue="remove-bg" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="remove-bg">Remove Background (AI)</TabsTrigger>
              <TabsTrigger value="photoroom">Photoroom</TabsTrigger>
              <TabsTrigger value="crop">Crop & Convert</TabsTrigger>
            </TabsList>
            <TabsContent value="remove-bg" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bg-remove-upload">Upload Image</Label>
                  <Input
                    id="bg-remove-upload"
                    type="file"
                    accept="image/*"
                    onChange={onSelectFile}
                    className="mt-1"
                  />
                </div>
                {imgSrc && (
                  <div className="mt-4">
                    <img
                      src={imgSrc}
                      alt="Original"
                      className="mb-4 max-h-[300px] rounded-lg border object-contain"
                    />
                    <Button
                      onClick={removeBackground}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Removing Background...
                        </>
                      ) : (
                        'Remove Background'
                      )}
                    </Button>
                    {error && <div className="mt-2 text-red-500">{error}</div>}
                  </div>
                )}
                {removedBgSrc && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-lg font-semibold">Result:</h3>
                    <img
                      src={removedBgSrc}
                      alt="Background Removed"
                      className="max-h-[300px] rounded-lg border object-contain"
                    />
                    <Button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = removedBgSrc
                        link.download = 'removed-background.png'
                        link.click()
                        setActiveStep(2)
                      }}
                      className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Download Result
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="photoroom" className="mt-4">
              <div className="text-center">
                <h2 className="mb-4 text-2xl font-bold">Photoroom Background Remover</h2>
                <div className="mb-4 text-muted-foreground">
                  Click below to use Photoroom's background removal tool
                </div>
                <Button
                  onClick={() =>
                    window.open(
                      'https://www.photoroom.com/tools/background-remover',
                      '_blank'
                    )
                  }
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  Open Photoroom Background Remover
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="crop" className="mt-4">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="image-upload">Upload Image</Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={onSelectFile}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="format">Output Format</Label>
                    <Select
                      value={format}
                      onValueChange={setFormat}
                    >
                      <SelectTrigger id="format" className="mt-1">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webp">WebP</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {imgSrc && (
                  <div className="mt-4">
                    <div
                      ref={containerRef}
                      className="relative h-[500px] w-full overflow-hidden rounded-lg border"
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={onMouseUp}
                      onMouseLeave={onMouseUp}
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        onLoad={onImageLoad}
                        className="h-full w-full object-contain"
                      />
                      <div
                        className="absolute border-2 border-white"
                        style={{
                          left: `${cropArea.x}px`,
                          top: `${cropArea.y}px`,
                          width: `${cropArea.width}px`,
                          height: `${cropArea.height}px`,
                        }}
                      >
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                          {[...Array(9)].map((_, index) => (
                            <div key={index} className="border border-white opacity-50" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={onDownloadCrop}
                      disabled={!cropArea.width || !cropArea.height}
                      className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Download Cropped Image
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  )
}

