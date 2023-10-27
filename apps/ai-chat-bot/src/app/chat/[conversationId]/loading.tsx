import Spinner from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Spinner />
    </div>
  );
}
