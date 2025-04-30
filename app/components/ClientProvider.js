'use client';

import { SessionProvider } from "next-auth/react";
import ToasterProvider from './Toaster';

export default function ClientProvider({ children }) {
  return (
    <SessionProvider>
      <ToasterProvider />
      {children}
    </SessionProvider>
  );
}