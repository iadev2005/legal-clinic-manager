"use client";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingScreen({
  message = "Cargando información...",
  subMessage,
  size = "md",
  className = "",
}: LoadingScreenProps) {
  const sizeClasses = {
    sm: {
      spinner: "text-3xl",
      message: "text-base",
      subMessage: "text-xs",
      padding: "py-8",
    },
    md: {
      spinner: "text-5xl",
      message: "text-lg",
      subMessage: "text-sm",
      padding: "py-16",
    },
    lg: {
      spinner: "text-6xl",
      message: "text-xl",
      subMessage: "text-base",
      padding: "py-20",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center ${classes.padding} ${className}`}>
      <span className={`icon-[svg-spinners--180-ring-with-bg] ${classes.spinner} text-[#3E7DBB] mb-4`}></span>
      <p className={`text-sky-950 font-semibold ${classes.message}`}>{message}</p>
      {subMessage && (
        <p className={`text-sky-950/60 ${classes.subMessage} mt-2`}>{subMessage}</p>
      )}
    </div>
  );
}

