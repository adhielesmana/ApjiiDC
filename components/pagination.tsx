import React from "react";
import { Button } from "@heroui/button";
import { DOTS, usePagination } from "../hooks/usePagination";

interface PaginationProps {
  onPageChange: (page: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  className?: string;
}

export const Pagination = ({
  onPageChange,
  totalCount,
  siblingCount = 1,
  currentPage,
  pageSize,
  className = "",
}: PaginationProps) => {
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  // If there are less than 2 items in pagination range we shall not render the component
  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  const lastPage = paginationRange[paginationRange.length - 1];

  return (
    <ul className={`flex items-center justify-center gap-1 ${className}`}>
      {/* Left navigation arrow */}
      <li>
        <Button
          isDisabled={currentPage === 1}
          isIconOnly
          size="sm"
          variant="flat"
          color="primary"
          className="rounded-full"
          onPress={onPrevious}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
      </li>

      {paginationRange.map((pageNumber, i) => {
        // If the pageItem is a DOT, render the DOTS unicode character
        if (pageNumber === DOTS) {
          return (
            <li key={`dots-${i}`} className="px-2 text-gray-500">
              &#8230;
            </li>
          );
        }

        // Render page pills
        return (
          <li key={`page-${pageNumber}`}>
            <Button
              size="sm"
              isIconOnly
              variant={currentPage === pageNumber ? "solid" : "flat"}
              color={currentPage === pageNumber ? "primary" : "default"}
              className="rounded-full min-w-[32px]"
              onPress={() => onPageChange(pageNumber as number)}
            >
              {pageNumber}
            </Button>
          </li>
        );
      })}

      {/* Right navigation arrow */}
      <li>
        <Button
          isDisabled={currentPage === lastPage}
          isIconOnly
          size="sm"
          variant="flat"
          color="primary"
          className="rounded-full"
          onPress={onNext}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </li>
    </ul>
  );
};
