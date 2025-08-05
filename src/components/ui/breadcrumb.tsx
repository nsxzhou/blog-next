import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="面包屑导航"
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
)
Breadcrumb.displayName = "Breadcrumb"

interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode
}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, ...props }, ref) => (
    <li
      ref={ref}
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
)
BreadcrumbItem.displayName = "BreadcrumbItem"

interface BreadcrumbLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  BreadcrumbLinkProps
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "transition-colors hover:text-foreground",
      className
    )}
    {...props}
  />
))
BreadcrumbLink.displayName = "BreadcrumbLink"

interface BreadcrumbPageProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
)
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:size-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

interface BreadcrumbHomeProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string
}

const BreadcrumbHome = ({ href = "/", className, ...props }: BreadcrumbHomeProps) => (
  <BreadcrumbLink href={href} className={className} {...props}>
    <Home className="h-4 w-4" />
    <span className="sr-only">首页</span>
  </BreadcrumbLink>
)
BreadcrumbHome.displayName = "BreadcrumbHome"

export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbHome,
}