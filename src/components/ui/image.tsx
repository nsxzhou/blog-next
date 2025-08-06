import * as React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageProps extends React.ComponentProps<typeof Image> {
  className?: string
}

const CustomImage = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, alt, ...props }, ref) => {
    return (
      <div className={cn("overflow-hidden rounded-md", className)}>
        <Image
          ref={ref}
          alt={alt}
          className="h-auto w-auto object-cover"
          {...props}
        />
      </div>
    )
  }
)
CustomImage.displayName = "Image"

export { CustomImage as Image }