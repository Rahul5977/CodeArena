const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="mt-4 text-base-content/70">{message}</p>
    </div>
  );
};

export default LoadingSpinner;