"use client";

import * as React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination";

export function PaginationShowcase() {
  return (
    <div className="space-y-10">
        <div className="space-y-4">
          <h4 className="text-body-sm font-bold uppercase tracking-wider text-muted-foreground">
            Básica
          </h4>
          <div className="p-8 rounded-xl border border-border flex justify-center items-center shadow-sm bg-surface">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationFirst href="#" aria-disabled="true" className="pointer-events-none opacity-50" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious href="#" aria-disabled="true" className="pointer-events-none opacity-50" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">
                    3
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">
                    10
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLast href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
  );
}
