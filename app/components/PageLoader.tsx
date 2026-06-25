type PageLoaderProps = {
  message?: string;
  className?: string;
};

export default function PageLoader({
  message = "Loading...",
  className = "min-h-screen flex items-center justify-center bg-[#F3F4F7]",
}: PageLoaderProps) {
  return (
    <div className={className}>
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0171F9] mx-auto mb-4"
          aria-hidden
        />
        <p className="text-[#737786] font-inter text-base">{message}</p>
      </div>
    </div>
  );
}
