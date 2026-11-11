import { cn } from "@/lib/utils";

export const PageContainer = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div className={cn("w-full space-y-6 p-6", className)} {...props} />
);

export const PageHeader = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn("flex w-full items-center justify-between", className)}
    {...props}
  />
);

export const PageHeaderContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div className={cn("w-full space-y-1", className)} {...props} />
);

export const PageTitle = ({
  className,
  ...props
}: React.ComponentProps<"h1">) => (
  <h1 className={cn("text-2xl font-bold", className)} {...props} />
);

export const PageDescription = ({
  className,
  ...props
}: React.ComponentProps<"p">) => (
  <p className={cn("text-muted-foreground text-sm", className)} {...props} />
);

export const PageActions = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div className={cn("flex items-center gap-2", className)} {...props} />
);

export const PageContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div className={cn("space-y-6", className)} {...props} />
);
