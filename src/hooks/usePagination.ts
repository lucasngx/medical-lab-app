import { useState, useMemo, useCallback } from "react";

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  itemsPerPage?: number;
  maxPagesToShow?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  pageItems: number[];
  firstItemIndex: number;
  lastItemIndex: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canGoToNextPage: boolean;
  canGoToPrevPage: boolean;
}

/**
 * Custom hook for handling pagination
 */
export const usePagination = ({
  totalItems,
  initialPage = 1,
  itemsPerPage = 10,
  maxPagesToShow = 5,
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / itemsPerPage)),
    [totalItems, itemsPerPage]
  );

  // Ensure current page is within bounds
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const firstItemIndex = useMemo(
    () => (currentPage - 1) * itemsPerPage,
    [currentPage, itemsPerPage]
  );

  const lastItemIndex = useMemo(
    () => Math.min(firstItemIndex + itemsPerPage, totalItems),
    [firstItemIndex, itemsPerPage, totalItems]
  );

  /**
   * Generate array of page numbers to display
   */
  const pageItems = useMemo(() => {
    // Case: Show all pages if total pages <= maxPagesToShow
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate start and end pages to show
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust startPage if endPage is maxed out
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }, [currentPage, totalPages, maxPagesToShow]);

  /**
   * Go to a specific page
   */
  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.min(Math.max(1, page), totalPages);
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  /**
   * Go to next page if possible
   */
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  /**
   * Go to previous page if possible
   */
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    pageItems,
    firstItemIndex,
    lastItemIndex,
    goToPage,
    nextPage,
    prevPage,
    canGoToNextPage: currentPage < totalPages,
    canGoToPrevPage: currentPage > 1,
  };
};
