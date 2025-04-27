"use client"

import Link from "next/link"
import { Github, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Developed by{" "}
          <span className="font-medium">Thiago Ximenes</span>
        </p>
        <div className="flex gap-4 items-center">
          <Link
            href="mailto:ximenes.dev@gmail.com"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline flex items-center gap-1"
          >
            <Mail className="h-4 w-4" />
            <span>ximenes.dev@gmail.com</span>
          </Link>
          <Link
            href="https://github.com/thiago-ximenes"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline flex items-center gap-1"
          >
            <Github className="h-4 w-4" />
            <span>thiago-ximenes</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}