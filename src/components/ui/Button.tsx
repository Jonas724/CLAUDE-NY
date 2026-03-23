"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-builder-accent focus:ring-offset-2 focus:ring-offset-builder-bg disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-builder-accent text-white hover:bg-builder-accentHover",
    secondary: "bg-builder-border text-builder-text hover:bg-builder-canvas",
    danger: "bg-builder-danger text-white hover:bg-red-600",
    ghost: "bg-transparent text-builder-textMuted hover:text-builder-text hover:bg-builder-border",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
