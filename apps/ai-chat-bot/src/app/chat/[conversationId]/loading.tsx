import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Spinner />
    </div>
  );
}
