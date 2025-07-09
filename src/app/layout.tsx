import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const favicon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iaHNsKDIyNCA3MSUgNCUpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTAgNTApIj48cGF0aCBkPSJNIDAgLTQwIEwgNDAgMCBMIDAgNDAgTCAtNDAgMCBaIiBmaWxsPSJoc2woMjYxIDQ0JSA1NSUpIiAvPjxjaXJjbGUgY3g9Ii0xNSIgY3k9Ii0xNSIgcj0iMTAiIGZpbGw9IiNGNDQzMzYiLz48Y2lyY2xlIGN4PSIxNSIgY3k9Ii0xNSIgcj0iMTAiIGZpbGw9IiM0Q0FGNTAiLz48Y2lyY2xlIGN4PSItMTUiIGN5PSIxNSIgcj0iMTAiIGZpbGw9IiMyMTk2RjMiLz48Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSIxMCIgZmlsbD0iI0ZGRUIzQiIvPjwvZz48L3N2Zz4=';

export const metadata: Metadata = {
  title: 'AMIK LODO',
  description: 'A modern Ludo game with AI opponents.',
  manifest: '/manifest.json',
  themeColor: '#8168B8',
  icons: {
    icon: favicon,
    shortcut: favicon,
    apple: favicon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
