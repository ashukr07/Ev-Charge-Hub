export default function LoadingSpinner({ text = "" }) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-base text-secondary">{text}</p>
      </div>
    );
  }
  