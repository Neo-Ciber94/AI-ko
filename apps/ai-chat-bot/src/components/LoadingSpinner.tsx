import "./LoadingSpinner.css";

export default function LoadingSpinner({ size = 48 }: { size?: number }) {
  return (
    <div className="flex flex-row justify-center p-2">
      <span
        className="loader"
        style={{
          width: size,
          height: size,
        }}
      ></span>
    </div>
  );
}
